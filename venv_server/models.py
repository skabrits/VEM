import random
import time
import yaml
import os

BASE_PATH = os.path.dirname(os.path.realpath(__file__))
SETTINGS_PATH = os.path.join(BASE_PATH, "settings") if (sp := os.getenv("SETTINGS_PATH")) is None else sp

status_messages = {
    200: "Succeed",
    400: "Error",
    600: "Default response",
    601: "No changes introduced",
    700: "Not implemented health check"
}


class ResponseMessage:
    def __init__(self, message, status=600):
        self.message = message
        self.status = status


class EngineResponseMessage (ResponseMessage):
    def __init__(self, message, ports, status=600):
        super().__init__(message, status)
        self.ports = ports


class Settings:
    def __init__(self, image, name="default", settings=None):
        self.image = image
        self.name = name
        self.settings = {} if settings is None else settings

    def save_to_file(self):
        fpath = os.path.join(SETTINGS_PATH, self.image)
        os.makedirs(fpath, exist_ok=True)
        with open(os.path.join(fpath, self.name), 'w') as f:
            yaml.dump(self.settings, f)

    @staticmethod
    def load_from_file(file_path=None, image=None, name=None):
        if file_path is None and (image is None or name is None):
            raise OSError("To load settings from file specify either path or image and name.")

        image = os.path.basename(os.path.dirname(file_path)) if image is None else image
        name = os.path.basename(file_path) if name is None else name
        file_path = os.path.join(SETTINGS_PATH, image, name) if file_path is None else file_path

        if not os.path.isfile(file_path):
            raise OSError("Settings path does not exist.")

        with open(file_path, 'r') as f:
            settings = yaml.safe_load(f)

        return Settings(image, name, settings)

    @staticmethod
    def list_settings():
        envs = dict()
        for image in os.listdir(SETTINGS_PATH):
            envs[image] = os.listdir(os.path.join(SETTINGS_PATH, image))

        return envs


class Environment:
    name: str
    image: str
    settings: Settings

    def __init__(self, name, image, settings):
        self.name = name
        self.image = image
        self.settings = settings
