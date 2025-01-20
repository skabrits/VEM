import importlib
import pkgutil
import json
import mmh3
import sys
import os


def list_subclasses(module_name, base_class):

    def import_submodules(current_module_name):
        try:
            module = importlib.import_module(current_module_name)
        except ImportError:
            return

        if hasattr(module, '__path__'):
            for _, submodule_name, ispkg in pkgutil.walk_packages(module.__path__, module.__name__ + '.'):
                import_submodules(submodule_name)

    def list_children(class_object):
        children = list()

        subclasses = class_object.__subclasses__()
        children += subclasses

        for child in subclasses:
            children += list_children(child)

        return children

    import_submodules(module_name)

    return list_children(base_class)


def hash32(data):
    return mmh3.hash(data, signed=False)


def secure_name(name):
    return mmh3.mmh3_x64_128_digest(name.encode("utf-8")).hex()


import vem_server.controller as controller

logger = controller.app.logger

BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))
PORT_RANGE = json.loads(os.getenv("PORT_RANGE", "[8080, 9000]"))
BACKEND = getattr(importlib.import_module('vem_server.connectors'), os.getenv("BACKEND", "Docker"))()
DB_PROVIDER = getattr(importlib.import_module('vem_server.connectors.database'), os.getenv("DB_PROVIDER", "LocalFile"))()

controller.app.config["BACKEND"] = BACKEND
controller.app.config["PORT_RANGE"] = PORT_RANGE
controller.app.config["DB_PROVIDER"] = DB_PROVIDER
