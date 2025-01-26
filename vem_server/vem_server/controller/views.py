import vem_server.controller.dynamic_api as da
import vem_server.models as models
import vem_server.logic as logic
from flask import Blueprint, request

api = Blueprint('api', __name__)


@api.route("/api/v1", methods=["GET"])
def list_endpoints():
    return da.list_dynamic_endpoints()


@api.route("/api/v1/extra/<string:resource>", methods=["GET"])
def get_resource_schema_options(resource):
    if resource == "images":
        return logic.get_images().to_json()
    elif resource == "settings":
        return logic.get_settings(request.args.get('image', '')).to_json()
    return models.ResponseMessage(400, f"Resource {resource} not found").to_json()


@api.route("/api/v1/schema/resources/<string:resource>", methods=["GET"])
def get_resource_schema(resource):
    response = da.dynamic_api(resource, logic.get_resource_schema)
    return response


@api.route("/api/v1/resources/<string:resource>", methods=["GET", "PUT"])
def list_add_resource(resource):
    if request.method == "GET":
        response = da.dynamic_api(resource, logic.list_resources)
    else:
        response = da.dynamic_api(resource, logic.create_resource, request.get_json(force=True))
    return response


@api.route("/api/v1/resources/<string:resource>/<int:oid>", methods=["GET", "POST", "DELETE"])
def get_modify_resource(resource, oid):
    if request.method == "POST":
        response = da.dynamic_api(resource, logic.edit_resource, oid, request.get_json(force=True))
    elif request.method == "DELETE":
        response = da.dynamic_api(resource, logic.delete_resource, oid, request.args.get('rname', None), request.args.get('parent_resource', None))
    else:
        response = da.dynamic_api(resource, logic.get_resource, oid)
    return response


@api.route("/api/v1/launcher/<int:oid>", methods=["GET"])
def launch_environment(oid):
    case = request.args.get('start', '2')
    if case == '2':
        response = logic.restart_env(oid)
    elif case == '1':
        response = logic.start_env(oid)
    elif case == '0':
        response = logic.stop_env(oid)
    else:
        response = models.ResponseMessage(400, f"Unknown option {case}")

    return response.to_json()


@api.route("/api/v1/endpoint/<int:oid>", methods=["GET"])
def get_endpoint(oid):
    response = logic.get_endpoint(oid)
    return response.to_json()
