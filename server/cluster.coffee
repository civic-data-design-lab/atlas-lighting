cluster = require('cluster')
if cluster.isMaster
  cpuCount = require('os').cpus().length
  i = 0
  while i < cpuCount
    cluster.fork()
    i += 1
  cluster.on 'exit', (worker) ->
    console.log 'Worker %d died, replacing', worker.id
    cluster.fork()
    return
else
  app = require('./app.js')
  app.app.listen app.port, ->
    console.log 'Benchmarking worker %d listening on %d', cluster.worker.id, app.port
    return