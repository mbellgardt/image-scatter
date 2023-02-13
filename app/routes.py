from app import app
from flask import render_template
import json

@app.route('/')
@app.route('/index')
def index():
    with open('test_data.json', 'r') as f:
        data = json.load(f)
    return render_template('index.html', **data)
    
@app.route('/points.js')
def points():
    with open('test_data.json', 'r') as f:
        data = json.load(f)
    return render_template('points.js', **data)