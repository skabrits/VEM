import vem_server.common as common
import vem_server.models as models
import vem_server.models.core as core
import requests
import yaml
import json
import re
import os
import jq


def get_resource_by_id(resource_class, oid):
    oid = int(oid)

    if common.DB_PROVIDER.exists_in_db_with_id(resource_class, oid):
        res = common.DB_PROVIDER.load_from_db_by_id(resource_class, oid)
    else:
        return None

    return res


def get_resource(resource_class, oid):
    res = get_resource_by_id(resource_class, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if "list" in resource_class.__post_process__.keys():
        res = resource_class.__post_process__["list"](res)

    return models.ResponseMessage(200, data=res.__to_serializable__())


def list_resources(resource_class):
    result = common.DB_PROVIDER.list_from_db(resource_class, columns=resource_class.__list_fields__)
    if "list" in resource_class.__post_process__.keys():
        return models.ResponseMessage(200, data=list(map(resource_class.__post_process__["list"], result)))
    return models.ResponseMessage(200, data=result)


def create_resource(resource_class, form):
    params = dict()
    for k, val in resource_class.__init_fields__.items():
        if k not in form.keys():
            if val is None or isinstance(val, tuple) and val[0] is None:
                return models.ResponseMessage(400, f"Malformed request!\nError: required {k} is empty.")
            else:
                if isinstance(val, tuple):
                    params[k] = val[0]
                else:
                    params[k] = val
        else:
            if isinstance(val, tuple):
                try:
                    params[k] = val[1](form[k])
                except ValueError:
                    return models.ResponseMessage(400, f"Malformed request!\nError: {k} has wrong datatype.")
                except Exception as e:
                    return models.ResponseMessage(400, f"Malformed request!\nError: type conversion for {k} failed: '{str(e)}'.")
            else:
                params[k] = str(form[k])

    res = resource_class(**params)
    is_res = get_resource_by_id(resource_class, res.id)
    if is_res is not None:
        return models.ResponseMessage(400, f"Resource {res.id} already exists!")

    res.__lock__ = 1
    common.DB_PROVIDER.save_to_db(res)
    response = models.ResponseMessage(200)

    if "create" in resource_class.__post_process__.keys():
        response = resource_class.__post_process__["create"](res)
    else:
        res.__lock__ = 0
        common.DB_PROVIDER.save_to_db(res)

    if response.status // 100 != 2:
        delete_resource(resource_class, res.id)
    else:
        response.data = res.id

    return response


def edit_resource(resource_class, oid, form):
    res = get_resource_by_id(resource_class, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    for k, val in resource_class.__edit_fields__.items():
        if k not in form.keys():
            if val is None or isinstance(val, tuple) and val[0] is None:
                return models.ResponseMessage(400, f"Malformed request!\nError: required {k} is empty.")
        else:
            if isinstance(val, tuple):
                try:
                    setattr(res, k, val[1](form[k]))
                except ValueError:
                    return models.ResponseMessage(400, f"Malformed request!\nError: {k} has wrong datatype.")
                except Exception as e:
                    return models.ResponseMessage(400,
                                                  f"Malformed request!\nError: type conversion for {k} failed: '{str(e)}'.")
            else:
                setattr(res, k, str(form[k]))

    if res.__lock__ == 1:
        return models.ResponseMessage(400, f"Resource {oid} is busy.")

    res.__lock__ = 1
    common.DB_PROVIDER.save_to_db(res)
    response = models.ResponseMessage(200)

    if "edit" in resource_class.__post_process__.keys():
        response = resource_class.__post_process__["edit"](res)
    else:
        res.__lock__ = 0
        common.DB_PROVIDER.save_to_db(res)

    common.DB_PROVIDER.save_to_db(res)
    response.data = res.id

    return response


# TODO: Check if object is safe to remove
def available_for_deletion(parent_resource_class, oid, rname):
    return common.DB_PROVIDER.load_from_db_by_data(parent_resource_class, **{rname: oid})


def delete_resource(resource_class, oid, rname=None, parent_resource=None):
    res = get_resource_by_id(resource_class, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if res.__lock__ == 1:
        return models.ResponseMessage(400, f"Resource {oid} is busy.")

    if rname is not None:
        resource_classes = dict()
        for web_class in common.list_subclasses("vem_server.models", models.WebObject):
            if web_class.__create_api__:
                resource_classes[web_class.__lower_name__] = web_class
        if parent_resource not in resource_classes.keys():
            return models.ResponseMessage(400, f"Resource {parent_resource} is not found.")

        pr = available_for_deletion(resource_classes[parent_resource], oid, rname)
        if pr is not None:
            pr_i = next(pr, None)
            if pr_i is not None:
                return models.ResponseMessage(400, f"Resource is hooked to {pr_i.name}.")

    common.DB_PROVIDER.delete_from_db_by_id(res, oid)
    response = models.ResponseMessage(200)

    if "delete" in resource_class.__post_process__.keys():
        response = resource_class.__post_process__["delete"](res)

    return response


def get_resource_schema(resource_class):
    type_table = ["int", "char", "text", "bit"]

    def classify(type_str):
        for t in type_table:
            reg_str = f"[a-zA-Z]*(?:{t}|{t.upper()})[a-zA-Z ]*(?:\(([0-9]*)\))?"
            match = re.match(reg_str, type_str)
            if match is not None:
                gr = match.groups()
                return t, gr[0] if gr[0] is not None else 0
        return None, None

    fields = resource_class.__init_fields__.keys()
    return models.ResponseMessage(200, data=dict(filter(lambda o: o[1][0] is not None, [(k, classify(resource_class.schema[k])) for k in fields])))


def get_images():
    def parse(url, expr, reg):
        return filter(lambda i: re.match(reg, i) is not None, jq.compile(expr).input_value(requests.get(url).json()).all())

    with open(os.path.join(common.BASE_PATH, "configs.yaml"), 'r') as f:
        cfg = yaml.safe_load(f)

    images = dict()
    for r in cfg['repositories']:
        iname = parse(r['url'], r['jq'], r['regex'])
        rib = {(f"{r['name']}/{i}" if r['name'] != "" else i): set() for i in iname}
        ri = rib.copy()
        ri |= images
        for k in rib.keys():
            i = k[len(r['name'])+1:] if r['name'] != "" else k
            ri[k] = ri[k].union(set(map(lambda t: f"{k}:{t}", parse(r['tags']['url'] % i, r['tags']['jq'], r['tags']['regex']))))
        images = ri

    return models.ResponseMessage(200, data=dict(map(lambda i: (i[0], list(map(lambda e: {"name": e}, i[1]))), images.items())))


def get_settings(image):
    result = common.DB_PROVIDER.load_from_db_by_data(core.Settings, image=image)
    if result is None:
        return models.ResponseMessage(200, data=[])
    return models.ResponseMessage(200, data={image: list(map(lambda o: {"name": o.name, "id": o.id}, result))})


def start_env(oid):
    res = get_resource_by_id(core.Environment, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if res.__lock__ == 1:
        return models.ResponseMessage(400, f"Resource {oid} is busy.")

    res.desired_status = models.STATE.ACTIVE
    response = common.BACKEND.start(res)
    common.DB_PROVIDER.save_to_db(res)

    return response


def stop_env(oid):
    res = get_resource_by_id(core.Environment, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if res.__lock__ == 1:
        return models.ResponseMessage(400, f"Resource {oid} is busy.")

    res.desired_status = models.STATE.STOPPED
    response = common.BACKEND.stop(res)
    common.DB_PROVIDER.save_to_db(res)

    return response


def restart_env(oid):
    res = get_resource_by_id(core.Environment, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if res.__lock__ == 1:
        return models.ResponseMessage(400, f"Resource {oid} is busy.")

    res.desired_status = models.STATE.ACTIVE
    response = common.BACKEND.restart(res)
    common.DB_PROVIDER.save_to_db(res)

    return response


def get_endpoint(oid):
    res = get_resource_by_id(core.Environment, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if res.endpoint is None or len(res.ports) == 0:
        endpoint = json.dumps(None)
    else:
        endpoint = f"{res.endpoint}:{res.ports[0]}"

    return models.ResponseMessage(200, data=endpoint)
