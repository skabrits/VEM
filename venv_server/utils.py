import subprocess
import json


def get_images():
    images = subprocess.run(["docker", "images"], capture_output=True).stdout.decode("utf-8")
    return list(map(lambda a: f'{a[0]}:{a[1]}', filter(lambda a: a[0] != "<none>" and a[1] != "<none>", map(lambda a: list(filter(lambda s: s != "", a)), map(lambda s: s.split(" "), images.split("\n")[1:-1])))))


def get_ports(image_name):
    raw_image_data = subprocess.run(["docker", "inspect", f'{image_name}'], capture_output=True).stdout
    image_data = json.loads(raw_image_data)
    if "Config" in image_data[0].keys() and "ExposedPorts" in image_data[0]["Config"].keys():
        return image_data[0]["Config"]["ExposedPorts"].keys()
    return ['8080']
