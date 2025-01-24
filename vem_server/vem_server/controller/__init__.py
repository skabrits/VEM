from flask import Flask
from flask_cors import CORS
import logging
import sys
import os
import faulthandler

# TODO: Resource state transfer throw preset in editor -> back

app = Flask(__name__, template_folder='templates')
CORS(app)

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))

app.config["BASE_URL"] = os.getenv("BASE_URL", "/")

import vem_server.controller.views as views

app.register_blueprint(views.api, url_prefix=app.config["BASE_URL"])


if __name__ == '__main__':
    faulthandler.enable()
    app.run('0.0.0.0', 8000, debug=True, use_debugger=False, use_reloader=False)