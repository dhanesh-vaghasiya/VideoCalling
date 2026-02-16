"""
Flask extensions – initialised here, bound to the app in create_app().
Avoids circular imports between models, routes, and app factory.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db      = SQLAlchemy()
migrate = Migrate()
cors    = CORS()
