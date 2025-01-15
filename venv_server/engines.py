from click.testing import Result
from setuptools.namespaces import flatten
from venv_server import app
import venv_server.utils as ut
import subprocess
import random
import time


def stop_docker():
    if app.config["ENV_NAME"] == "":
        return ut.ResponseMessage("No images launched", status=601)
    res = subprocess.run(["docker", "rm", "-f", f'{app.config["ENV_NAME"]}'], capture_output=True).stdout.decode("utf-8")
    return ut.ResponseMessage(res)


def launch_docker(image):
    res_stop = stop_docker()
    ports = ut.get_ports(image)
    fitted_port_range = [pr[i] if i < len((pr := app.config["PORT_RANGE"]))-1 else 10000 + i - len(pr) for i in range(len(ports))]
    app.config["ENV_NAME"] = f'user{time.time()}{random.randint(10000, 100000)}'

    res = subprocess.run(["docker", "run", "-d", "--name", f'{app.config["ENV_NAME"]}'] + list(flatten([["-p", f'{fitted_port_range[i]}:{ports[i]}'] for i in range(len(ports))])) + [f'{image}'], capture_output=True).stdout.decode("utf-8")

    return ut.EngineResponseMessage(f'Stopped previous environment with message: {res_stop}\n\n' if res_stop.status != 601 else "" + f'Started environment with message: {res}', fitted_port_range)
