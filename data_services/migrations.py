import sys, requests, json, urllib, shutil, datetime, os, time, csv
import redis
import urllib2
from pymongo import MongoClient
from city_comparison_data import *
class DataService:
	def __init__(self):
		self.r = redis.StrictRedis(host='localhost', port=6379, db=0)#, password=REDIS_PASSWORD) #host='redis', port=6379) #, port=REDIS_PORT, db=0,password=REDISMASTER_SERVICE_PASS)
		self.m = client = MongoClient()
	def migrate_city_comparison_data(self):
		for each_city in cityCentroids.keys():
			each_location=cityCentroids[each_city]
			self.r.hset("cityCentroids",each_city,each_location)
		for each in nightlightColors.keys():
			e = nightlightColors[each]
			self.r.hset("nightlightColors", each, e)
		for each in fullName.keys():
			e = fullName[each]
			self.r.hset("fullName", each, e)
		for each in cityColors.keys():
			e = cityColors[each]
			self.r.hset("cityColors", each, e)
		for each in typeColors.keys():
			e = typeColors[each]
			self.r.hset("typeColors", each, e)
		for each in typeNumberToText.keys():
			e = typeNumberToText[each]
			self.r.hset("typeNumberToText", each, e)
		for each in groupToWords.keys():
			e = groupToWords[each]
			self.r.hset("groupToWords", each, e)
	# def migrate_city_comparison_all(self):
		fieldnames = ("Code","GeoName","Pop1","Pop2","Density1","Density2","LandArea","GMP2013","class")
		reader = csv.DictReader('city_comparisons_all.csv', 'r')
		for row in reader:
			print row
		# out = json.dumps( [ row for row in reader ] )