# [START app]
import logging
import redis
from flask import jsonify
from flask import Flask
import sys, requests, json, urllib, shutil, datetime, os, time, csv
# import redis
from flask_sqlalchemy import SQLAlchemy
import urllib2
from pymongo import MongoClient
from migrations import DataService as DataService
from dataserver import DataServer as DataServer
# from itertools import product
# from googleplaces import GooglePlaces, types, lang
# from math import sqrt
# from components import components


# REDIS_HOST = os.environ['REDIS_HOST']
# REDIS_PASSWORD = os.environ['REDIS_PASSWORD']
# MONGO_HOST = os.environ['MONGO_HOST']
# MONGO_PASSWORD = os.environ['MONGO_PASSWORD']

# service = DataService()
# server = DataServer()
app = Flask(__name__)


app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:@postgresql:5432/atlasdb'

db = SQLAlchemy(app)




@app.route('/_get_data', methods = ['GET'])
def get_data():
    data = {
        'hello'  : 'data',
        'number' : 3
    }
    resp = jsonify(data)

    resp.status_code = 200
    resp.headers['Link'] = 'http://luisrei.com'

    return resp



if __name__ == '__main__':
    # This is used when running locally. Gunicorn is used to run the
    # application on Google App Engine. See entrypoint in app.yaml.
    # service.migrate_city_comparison_data()
    app.run(host='0.0.0.0', port=8000, debug=True)