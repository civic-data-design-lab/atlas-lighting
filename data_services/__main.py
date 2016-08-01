import redis
from bottle import route, run



@route('/')
def hello():
    return "bottle on 3550\n"

@route('/api/status')
def api_status():
    return {'status':'online', 'servertime':time.time()}




if __name__ == '__main__':
    # This is used when running locally. Gunicorn is used to run the
    # application on Google App Engine. See entrypoint in app.yaml.
    run(host='0.0.0.0', port=3550, debug=True)