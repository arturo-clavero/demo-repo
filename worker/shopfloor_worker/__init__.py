"""Shopfloor reports worker: CSV/ZIP exports and supplier catalogue imports.

The Node app (../app.js) forwards admin export requests here; suppliers'
catalogue files are uploaded straight to /imports by the ops team.
"""
from flask import Flask

from .config import load_settings
from .routes import bp


def create_app(overrides: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.update(load_settings())
    app.config["SECRET_KEY"] = "shopfloor-reports-dev"
    if overrides:
        app.config.update(overrides)
    app.register_blueprint(bp)
    return app
