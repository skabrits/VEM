from flask import Flask, request, render_template
from venv_server import app
import venv_server.utils as ut
import venv_server.engines as eg


@app.route(f'{app.config["BASE_URL"]}', methods=["GET"])
def env_setup():
    available_images = ut.get_images()
    return render_template('index.html', N=len(available_images), images=available_images, baseUrl=app.config["BASE_URL_SLASH"])


@app.route(f'{app.config["BASE_URL_SLASH"]}launch', methods=["GET"])
def launch_env():
    launch_image = request.args["venvImage"]
    host = request.host.split(":")[0]
    result = ut.EngineResponseMessage("failed", [])
    if app.config["BACKEND"] == "DOCKER":
        result = eg.launch_docker(launch_image)
    return render_template('launch.html', N=len(result.ports), result=result, image=launch_image, host=host)
