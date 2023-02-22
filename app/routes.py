from app import app
from flask import render_template
import json
from os import listdir
from os.path import splitext

@app.route('/')
def index():
    file_names = [splitext(f)[0] for f in listdir("data_files")]
    return render_template('index.html', links=file_names)

@app.route('/points/<data_file>')
def points(data_file):
    with open("data_files/" + data_file + '.json', 'r') as f:
        data = json.load(f)
    return render_template('points.html', data_file_name=data_file, **data)
    
@app.route('/internal/<data_file>/points.js')
def points_js(data_file):
    with open("data_files/" + data_file + '.json', 'r') as f:
        data = json.load(f)
    return render_template('points.js', **data)