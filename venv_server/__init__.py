from flask import Flask
import json
import os

app = Flask(__name__, template_folder='templates')
app.config["BASE_URL"] = bu if (bu := os.getenv("BASE_URL")) is not None else "/"
app.config["BASE_URL_SLASH"] = bu if (bu := app.config["BASE_URL"])[-1] == "/" else bu + "/"
app.config["BACKEND"] = "DOCKER" if (be := os.getenv("BACKEND")) is None else be
app.config["PORT_RANGE"] = [8080, 9000] if (po := os.getenv("PORT_RANGE")) is None else json.loads(po)
app.config["ENV_NAME"] = ""
app.config["RENDER"] = {0: "static/green_status.png", 1: "static/red_status.png"}
app.config["ENVIRONMENTS"] = dict()

from venv_server.views import *


if __name__ == '__main__':
    app.run('0.0.0.0', 5000)