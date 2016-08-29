`var path`
'use strict'

express = require 'express'
request = require 'request'
redis = require 'redis'
path = require 'path' 
http = require 'http'
path = require 'path'
async = require 'async'
serveStatic = require 'serve-static'
app = express()
app.disable 'etag'
app.set 'trust proxy', true
app.use serveStatic('./', 'index': [
  'grid.html'
  'grid.htm'
])
app.use serveStatic('./node_modules/bootstrap/dist/js')
app.use serveStatic('./node_modules/bootstrap/dist/css')
app.use serveStatic('./node_modules/jquery/dist')
app.use serveStatic('./node_modules/jquery/dist')
app.use serveStatic('./node_modules/d3')
app.use serveStatic('./node_modules/d3-queue/')
app.use serveStatic('./node_modules/topojson/build')
app.use serveStatic('./node_modules/mapbox.js/')
app.use serveStatic('./node_modules/d3-tip')
app.use serveStatic('./node_modules/mapbox-gl/dist')
app.use serveStatic('./node_modules/leaflet/dist')
app.use serveStatic('./node_modules/crossfilter')
app.use serveStatic('./stylesheets')
app.use serveStatic('./data')
app.use serveStatic('./node_modules/dc')
app.use serveStatic('./scripts')

app.get '/', (req, res) ->
  # res.status(200).send("Hello, world!");
  res.render 'index', (err, html) ->
    res.send html
    return
  # res.sendfile('./bower_components/shower-bright/index.html');
  return
# [END hello_world]
# [START server]

### Start the server ###

server = app.listen(process.env.PORT or '8080', '0.0.0.0', ->
  console.log 'App listening at http://%s:%s', server.address().address, server.address().port
  console.log 'Press Ctrl+C to quit.'
  console.log 'checking if adjustments work'
  return
)