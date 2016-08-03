import sys, requests, json, urllib, shutil, datetime, os, time, csv
import redis
import urllib2
from pymongo import MongoClient
from city_comparison_data import *

class DataServer:
	def __init__(self):
		self.r = redis.StrictRedis(host='localhost', port=6379, db=0)
