from flask import Flask

app = Flask(__name__, static_folder="../test_images")

from app import routes