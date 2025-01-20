import vem_server.common as common
import vem_server.models as models
import sys


class Settings (models.DataObject, models.WebObject):

    __plural__ = True

    __list_fields__ = ["id", "name", "image"]
    __init_fields__ = {"name": None, "image": None, "settings": None}
    __edit_fields__ = {"settings": None}

    schema = {
        "id": "INT UNSIGNED PRIMARY KEY",
        "name": "VARCHAR(63)",
        "image": "VARCHAR(255)",
        "settings": "MEDIUMTEXT",
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def generate_id(self):
        return common.hash32(self.name + self.image)


class Environment (models.DataObject, models.WebObject):
    @staticmethod
    def convert_status(o):
        if isinstance(o, dict):
            o.update({"status": models.STATE.state2name[o["status"]]})
        else:
            setattr(o, "status", models.STATE.state2name[o.status])
        return o

    @staticmethod
    def create_env(env):
        res = common.BACKEND.create(env)

        if res.status != 200:
            return res

        if env.desired_status == models.STATE.ACTIVE:
            return common.BACKEND.start(env)

        return res

    @staticmethod
    def restart_env(env):
        if env.desired_status == models.STATE.ACTIVE:
            return common.BACKEND.restart(env)

        return common.BACKEND.stop(env)

    __list_fields__ = ["id", "name", "status"]
    __init_fields__ = {"name": None, "image": None, "desired_status": (models.STATE.STOPPED, models.STATE.name2state), "settings_id": (None, int)}
    __edit_fields__ = {"desired_status": (models.STATE.STOPPED, models.STATE.name2state), "settings_id": (None, int)}
    __post_process__ = {
        "list": convert_status,
        "create": create_env,
        "edit": restart_env,
        "delete": common.BACKEND.destroy
    }

    schema = {
        "id": "INT UNSIGNED PRIMARY KEY",
        "name": "VARCHAR(63)",
        "image": "VARCHAR(255)",
        "endpoint": "VARCHAR(255)",
        "ports_num": "SMALLINT UNSIGNED",
        "ports_string": "TEXT",
        "status": "BIT",
        "desired_status": "BIT",
        "settings_id": "INT UNSIGNED",
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if "ports_string" in kwargs.keys():
            self.decode_ports()
        if "ports" in kwargs.keys():
            self.ports = kwargs["ports"]
            self.encode_ports()

        if common.DB_PROVIDER.exists_in_db_with_id(Settings, self.settings_id):
            self.settings = common.DB_PROVIDER.load_from_db_by_id(Settings, self.settings_id)
        else:
            raise models.ObjectDoesNotExistError(f"Settings id {self.settings_id} is invalid")

    def generate_id(self):
        return common.hash32(self.name)

    def encode_ports(self):
        self.ports_num = len(self.ports)

        md = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(0)

        a = 0
        for i in self.ports:
            a = a << 16 | i

        self.ports_string = str(a)

        del a
        sys.set_int_max_str_digits(md)

    def decode_ports(self):
        self.ports = list()

        md = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(0)

        a = int(self.ports_string)
        for _ in range(self.ports_num):
            self.ports.insert(0, a & 0b1111111111111111)
            a = a >> 16

        del a
        sys.set_int_max_str_digits(md)

    def set_status(self, status):
        self.status = status

    def set_ports(self, ports):
        self.ports = ports
        self.encode_ports()

    def set_endpoint(self, endpoint):
        self.endpoint = endpoint


class PV (models.DataObject, models.WebObject):
    __list_fields__ = ["id", "name", "status"]
    __init_fields__ = {"name": None, "image": None, "settings_id": (None, int)}
    __edit_fields__ = {"settings_id": (None, int)}
    __post_process__ = {
        "list": lambda o: (o.update({"status": models.STATE.state2name[o["status"]]}) if isinstance(o, dict) else setattr(o, "status", models.STATE.state2name[o.status])) or o
    }

    schema = {
        "id": "INT UNSIGNED PRIMARY KEY",
        "name": "VARCHAR(63)",
        "endpoint": "SMALLINT UNSIGNED",
        "settings_id": "TEXT",
        "status": "BIT"
    }

    def generate_id(self):
        return common.hash32(self.name)
