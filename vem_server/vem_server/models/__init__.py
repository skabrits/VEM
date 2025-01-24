import vem_server.common as common
from typing import Any
from collections.abc import Callable
import uuid
import json
import os

BASE_PATH = os.path.dirname(os.path.realpath(__file__))

status_messages = {
    100: "Default response",
    200: "Succeed",
    208: "No changes introduced",
    400: "Error",
    501: "Not implemented yet",
    503: "Engine is not running",
}


class ResponseMessage:
    def __init__(self, status=100, message=None, data=None):
        self.status = status
        self.data = data
        self.message = message if message is not None else status_messages[status] if status in status_messages.keys() else ""

    def to_json(self):
        return json.dumps({"message": self.message, "status": self.status, "data": self.data})


class ObjectDoesNotExistError (KeyError):
    pass


class DataObject:

    __store__: bool = True
    __plural__ = False

    __list_fields__: list[str]
    __post_process__: dict[str: Callable] = dict()

    schema: dict[str: str] = {"id": "INT UNSIGNED PRIMARY KEY"}
    table: str

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.__lower_name__ = cls.__name__.lower() + ("" if cls.__plural__ else "s")
        cls.table = cls.__lower_name__
        cls.schema |= {"__lock__": "BIT"}

    def __init__(self, **kwargs):
        custom_keys = kwargs["__custom_keys__"] if "__custom_keys__" in kwargs.keys() else set()
        for k in self.schema.keys():
            if k not in {"id"} | custom_keys:
                if k in kwargs.keys():
                    setattr(self, k, kwargs[k])
                else:
                    setattr(self, k, None)

        self.id = self.generate_id()

    def get_repr(self):
        return tuple(getattr(self, i) for i in self.schema.keys())

    def __repr__(self):
        return str(self.get_repr())

    def generate_id(self):
        return common.hash32(str(uuid.uuid4()))


class WebObject:
    __create_api__ = True
    __init_fields__: dict[str: Any]
    __edit_fields__: dict[str: Any]

    @staticmethod
    def __is_serializable__(prop):
        try:
            json.dumps(prop)
            return True
        except (TypeError, OverflowError):
            return False

    def __to_serializable__(self):
        return dict(filter(lambda i: self.__is_serializable__(i[1]), self.__dict__.items()))


class STATE:
    ACTIVE = 1
    STOPPED = 0
    READY = 1
    UNREADY = 0

    state2name = {
        ACTIVE: "active",
        STOPPED: "stopped"
    }

    ready2name = {
        READY: "ready",
        UNREADY: "unready"
    }

    name2state = {
        "active": ACTIVE,
        "stopped": STOPPED,
        "ready": READY,
        "unready": UNREADY
    }

