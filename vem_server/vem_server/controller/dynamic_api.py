import vem_server.common as common
import vem_server.models as models
from vem_server.models import ResponseMessage
import os

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

if LOG_LEVEL == "DEBUG":
    import traceback


def list_dynamic_endpoints():
    api_endpoints = list()
    for web_class in common.list_subclasses("vem_server.models", models.WebObject):
        if web_class.__create_api__:
            api_endpoints.append(web_class.__lower_name__)

    return ResponseMessage(200, data=api_endpoints).to_json()


def dynamic_api(resource, func, *args, **kwargs):
    api_endpoints = dict()
    for web_class in common.list_subclasses("vem_server.models", models.WebObject):
        if web_class.__create_api__:
            api_endpoints[web_class.__lower_name__] = web_class

    if resource in api_endpoints.keys():
        try:
            response = func(api_endpoints[resource], *args, **kwargs)
        except KeyError as e:
            response = models.ResponseMessage(400, f"Malformed request!\nError: {str(e)}")
        except Exception as e:
            if LOG_LEVEL == "DEBUG":
                common.logger.error(traceback.format_exc())
            common.logger.error(e)
            response = models.ResponseMessage(400, str(e))
    else:
        return {"message": f"Invalid resource endpoint {resource}"}, 404

    return response.to_json()
