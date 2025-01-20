import json

import vem_server.common as common
import vem_server.models as models
import vem_server.models.core as core


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

    if response.status != 200:
        delete_resource(resource_class, res.id)
    else:
        res.__lock__ = 0
        common.DB_PROVIDER.save_to_db(res)
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

    common.DB_PROVIDER.save_to_db(res)
    response.data = res.id

    return response


def delete_resource(resource_class, oid):
    res = get_resource_by_id(resource_class, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if res.__lock__ == 1:
        return models.ResponseMessage(400, f"Resource {oid} is busy.")

    common.DB_PROVIDER.delete_from_db_by_id(res, oid)
    response = models.ResponseMessage(200)

    if "delete" in resource_class.__post_process__.keys():
        response = resource_class.__post_process__["delete"](res)

    return response


def start_env(oid):
    res = get_resource_by_id(core.Environment, oid)
    if res is None:
        return models.ResponseMessage(400, f"Resource {oid} not found.")

    if res.__lock__ == 1:
        return models.ResponseMessage(400, f"Resource {oid} is busy.")

    res.desired_status = models.STATE.ACTIVE
    response = common.BACKEND.start(res)
    common.logger.info(res.get_repr())
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
