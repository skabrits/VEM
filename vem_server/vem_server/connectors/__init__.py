import vem_server.common as common
import vem_server.models as models
from itertools import chain
import subprocess
import threading
import json
import os


class Engine:
    def __init__(self):
        pass

    def get_status(self):
        return 501

    @staticmethod
    def commit_object(env):
        common.DB_PROVIDER.save_to_db(env)

    def unlock_object(self, env):
        env.__lock__ = 0
        self.commit_object(env)

    def create(self, env):
        pass

    def restart(self, env):
        pass

    def start(self, env):
        pass

    def stop(self, env):
        pass

    def destroy(self, env):
        pass


class Docker (Engine):
    def __init__(self):
        super().__init__()
        self.endpoint = os.getenv("DOCKER_ENDPOINT", "http://127.0.0.1")
        self.platform = os.getenv("DOCKER_PLATFORM", "LINUX")
        self.use_shell = True if self.platform == "WINDOWS" else False

    def get_status(self):
        return 200 if subprocess.run(["docker", "info"], capture_output=True, shell=self.use_shell).returncode == 0 else 503

    def execute(self, args, data=False):
        status = self.get_status()
        if status // 100 != 2:
            return models.ResponseMessage(status)
        res = subprocess.run(args, capture_output=True, shell=self.use_shell)
        if res.returncode != 0:
            return models.ResponseMessage(400, res.stderr.decode("utf-8"))

        return models.ResponseMessage(200, data=res.stdout) if data else models.ResponseMessage(200, res.stdout.decode("utf-8"))

    def destroy(self, env):
        res = self.execute(["docker", "rm", "-f", f'{common.secure_name(env.name)}'])
        if res.status // 100 == 2:
            env.set_status(models.STATE.STOPPED)

        return res

    def stop(self, env, unlock=True):
        if env.status == models.STATE.STOPPED:
            if unlock:
                self.unlock_object(env)
            return models.ResponseMessage(208)
        res = self.execute(["docker", "stop", f'{common.secure_name(env.name)}'])
        if res.status // 100 == 2:
            env.set_status(models.STATE.STOPPED)

        if unlock:
            self.unlock_object(env)
        return res

    def start(self, env, unlock=True):
        if env.status == models.STATE.ACTIVE:
            if unlock:
                self.unlock_object(env)
            return models.ResponseMessage(208)
        res = self.execute(["docker", "start", f'{common.secure_name(env.name)}'])
        if res.status // 100 == 2:
            env.set_status(models.STATE.ACTIVE)

        if unlock:
            self.unlock_object(env)
        return res

    def restart(self, env):
        if env.status == models.STATE.ACTIVE:
            res = self.stop(env, unlock=False)
            if res.status // 100 != 2:
                return res

        return self.start(env)

    def _create(self, gres, env, unlock=True):
        env.set_status(models.STATE.STOPPED)
        env.set_ready(models.STATE.UNREADY)
        self.commit_object(env)

        res = self.execute(["docker", "pull", f"{env.image}"])
        if res.status // 100 != 2:
            gres.status = res.status
            gres.message = res.message
            gres.data = res.data
            return res

        env.set_ready(models.STATE.READY)
        self.commit_object(env)

        ports = self.get_ports(env.image)
        fitted_port_range = [pr[i] if i < len((pr := common.PORT_RANGE))-1 else 10000 + i - len(pr) for i in range(len(ports))]

        res = self.execute(["docker", "create", "--name", f'{common.secure_name(env.name)}'] + list(chain.from_iterable([["-p", f'{fitted_port_range[i]}:{ports[i]}'] for i in range(len(ports))])) + [f'{env.image}'])
        if res.status // 100 == 2:
            env.set_status(models.STATE.STOPPED)
            env.set_endpoint(self.endpoint)
            env.set_ports(fitted_port_range)

        gres.status = res.status
        gres.message = res.message
        gres.data = res.data

        if unlock:
            self.unlock_object(env)
        return res

    def create(self, env, unlock=True):
        res = models.ResponseMessage(200)
        create_container_thread = threading.Thread(target=self._create, name="Create Image", args=[res, env, unlock])
        create_container_thread.start()
        create_container_thread.join(20)
        return res

    def get_images(self):
        images = self.execute(["docker", "images"]).message
        return list(map(lambda a: f'{a[0]}:{a[1]}', filter(lambda a: a[0] != "<none>" and a[1] != "<none>",
                                                           map(lambda a: list(filter(lambda s: s != "", a)),
                                                               map(lambda s: s.split(" "), images.split("\n")[1:-1])))))

    def get_ports(self, image_name):
        raw_image_data = self.execute(["docker", "inspect", f'{image_name}'], data=True).data
        image_data = json.loads(raw_image_data)
        if "Config" in image_data[0].keys() and "ExposedPorts" in image_data[0]["Config"].keys():
            return list(image_data[0]["Config"]["ExposedPorts"].keys())
        return ['8080']


class Kubernetes (Engine):
    def __init__(self):
        super().__init__()
