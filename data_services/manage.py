import os
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from sqlalchemy.dialects.postgresql import JSON, JSONB
from sqlalchemy import create_engine
# import redis
import json
from main import app, db
from cityComparisonData import *

app.config.from_object(os.environ['APP_SETTINGS'])

migrate = Migrate(app, db)
manager = Manager(app)

manager.add_command('db', MigrateCommand)



# using manager's command decorator to access the functions with python manage.py <function> in command line

@manager.command
def create_db():
    # db.create_all()
    engine = create_engine("postgresql://postgres:@postgresql:5432")
    conn = engine.connect()
    conn.execute("commit")
    conn.execute("create database atlasdb")
    conn.close()

@manager.command
def populate():
    # db.create_all()
    engine = create_engine("postgresql://postgres:@postgresql:5432/atlasdb")
    conn = engine.connect()
    conn.execute("commit")
    conn.execute("COPY grid FROM '/var/lib/postgresql/grids.csv' DELIMITER ',' CSV;")
    conn.execute("commit")
    conn.execute("COPY city FROM '/var/lib/postgresql/cities.csv' DELIMITER ',' CSV;")
    conn.execute("commit")
    conn.execute("COPY city_comparison FROM '/var/lib/postgresql/city_comparisons.csv' DELIMITER ',' CSV;")
    conn.execute("commit")
    conn.execute("COPY us_json (usjson) FROM '/var/lib/postgresql/us.json';")
    conn.execute("commit")
    conn.execute("COPY group_data FROM '/var/lib/postgresql/groups.csv' DELIMITER ',' CSV;")
    conn.execute("commit")
    conn.execute("COPY zipcode_business (geojson) FROM '/var/lib/postgresql/zip_business.json';")
    conn.close()

# @manager.option('-j', '--jsonfile', dest='jsonfile', default='us.json')
# def popuRedisUSjson(jsonfile):
#     with open(jsonfile) as data_file:    
#         data = json.load(data_file)
#         cli = redis.StrictRedis(host='redis', port=6379, db=0)
#         cli.hset("us_json", "objects", data['objects'])
#         cli.hset("us_json", "type", data['type'])
#         cli.hset("us_json", "transform", data['transform'])
#         cli.hset("us_json", "arcs", data['arcs'])

# @manager.option('-j', '--jsonfile', dest='jsonfile', default='zipcode_business.geojson')
# @manager.option('-m', '--msa', dest='msa', default='chicago')
# def popuRedisZipCodeGeojson(jsonfile, msa):
    # with open(jsonfile) as data_file:  
    #     data = json.load(data_file)
    #     engine = create_engine("postgresql://postgres:@postgresql:5432/atlasdb")
    #     conn = engine.connect()

    #     statement = j_table.insert().values(
    #         id=1,
    #         msa="chicago",
    #         crs=data['crs'],
    #         type=data["type"],
    #         features=data["features"]
    #     )

    #     conn.execute(statement)


        # cli  = redis.StrictRedis(host='redis', port=6379, db=0)
        # cli.hset("zipcode_business_geojson_{0}".format(msa), "crs", data['crs'])
        # cli.hset("zipcode_business_geojson_{0}".format(msa), "type", data['type'])
        # cli.hset("zipcode_business_geojson_{0}".format(msa), "features", data['features'])
        # cli.hset("zipcode_business_geojson_{0}".format(msa), "features", data['features'])


# @manager.command
# def popuRedisCityComparisonData():
#     cli  = redis.StrictRedis(host='redis', port=6379, db=0)
#     cli.hset("city_comparison_data", "cityCentroids", cityCentroids)
#     cli.hset("city_comparison_data", "nightlightColors", nightlightColors)
#     cli.hset("city_comparison_data", "fullName", fullName)
#     cli.hset("city_comparison_data", "cityColors", cityColors)
#     cli.hset("city_comparison_data", "typeColors", typeColors)
#     cli.hset("city_comparison_data", "typeNumberToText", typeNumberToText)
#     cli.hset("city_comparison_data", "groupToWords", groupToWords)


class City(db.Model):
    __tablename__ = 'city'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    group = db.Column(db.Integer)
    value = db.Column(db.Float)
    density = db.Column(db.Float)
    gmp = db.Column(db.Float)
    popChange = db.Column(db.Integer)
    gridorder = db.Column(db.Integer)


    def __init__(self, name, group, value, density, gmp, popChange, gridorder):
        self.name = name
        self.group = group
        self.value = value
        self.density = density
        self.gmp = gmp
        self.popChange = popChange
        self.gridorder = gridorder

    def __repr__(self):
        return '<id {}>'.format(self.id)


class CityComparison(db.Model):
    __tablename__ = 'city_comparison'

    id = db.Column(db.Integer, primary_key=True)
    Code = db.Column(db.Integer)
    GeoName = db.Column(db.String)
    Pop1 = db.Column(db.Integer)
    Pop2 = db.Column(db.Integer)
    Density1 = db.Column(db.Float)
    Density2 = db.Column(db.Float)
    LandArea = db.Column(db.Float)
    GMP2013 = db.Column(db.Integer)
    Class = db.Column(db.Integer)

    def __init__(self, Code, GeoName, Pop1, Pop2, Density1, Density2, LandArea, Class):
        self.Code = Code
        self.GeoName = GeoName
        self.Pop1 = Pop1
        self.Pop2 = Pop2
        self.Density1 = Density1
        self.Density2 = Density2
        self.LandArea = LandArea
        self.Class = Class

    def __repr__(self):
        return '<id {}>'.format(self.id)


class UsJson(db.Model):
    __tablename__ = "us_json"
    id = db.Column(db.Integer, primary_key=True)
    usjson = db.Column(JSON, nullable=True)

    def __init__(self, usjson):
        self.usjson

    def __rep__(self):
        def __rep__(self):
            return '<id {}>'.format(self.id)


class ZipcodeBusiness(db.Model):
    __tablename__ = "zipcode_business"
    id = db.Column(db.Integer, primary_key=True)
    msa = db.Column(db.String, nullable=True)
    geojson = db.Column(JSON, nullable=True)
    # type=db.Column(JSON, nullable=True)
    # features=db.Column(JSON, nullable=True)

    def __init__(self, msa, geojson):
        self.msa = msa
        self.geojson = geojson
    def __rep__(self):
        return '<id {}>'.format(self.id)



class Grid(db.Model):
    __tablename__ = 'grid'
    id = db.Column(db.Integer, primary_key=True)
    population = db.Column(db.Float, nullable=True)
    income = db.Column(db.Integer, nullable=True)
    averlight = db.Column(db.Float, nullable=True)
    places = db.Column(db.Integer, nullable=True)
    b_diversity = db.Column(db.Float, nullable=True)
    dev_intensity = db.Column(db.Integer, nullable=True)
    cell_id = db.Column(db.Integer, nullable=True)
    lng = db.Column(db.Float, nullable=True)
    lat = db.Column(db.Float, nullable=True)
    inc_cat = db.Column(db.Integer, nullable=True)
    msa = db.Column(db.String(15), nullable=True)

    def __init__(self, population, income, averlight, places, b_diversity, dev_intensity, cell_id, lng, lat, inc_cat, msa):
        self.population = population
        self.income = income
        self.averlight = averlight
        self.places = places
        self.b_diversity = b_diversity
        self.dev_intensity = dev_intensity
        self.cell_id = cell_id
        self.lng = lng
        self.lat = lat
        self.inc_cat = inc_cat
        self.msa = msa
    def __repr__(self):
        return '<id {}>'.format(self.id)


class Group(db.Model):
    __tablename__ = 'group_data'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=True)
    group = db.Column(db.Integer, nullable=True)
    value = db.Column(db.Float, nullable=True)
    density = db.Column(db.Float, nullable=True)
    gmp = db.Column(db.Integer, nullable=True)
    popChange = db.Column(db.Integer, nullable=True)
    gridorder = db.Column(db.Integer, nullable=True)

    def __init__(self, name, group, value, density, gmp,popChange, gridorder):
        self.name = name
        self.group = group
        self.value = value
        self.density = density
        self.gmp = gmp
        self.popChange = popChange
        self.gridorder = gridorder

    def __repr__(self):
        return '<id {}>'.format(self.id)



if __name__ == '__main__':
    manager.run()