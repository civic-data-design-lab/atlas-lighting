'use strict'
test = require('tape')
request = require('supertest')
app = require('../server/app')

# test 'Correct users returned', (t) ->
#   request(app).get('/api/users').expect('Content-Type', /json/).expect(200).end (err, res) ->
#     t.end()
#     return
#   return

test 'US json from redis service returned', (t) ->
  request(app).get('/us_json').expect('Content-Type', /json/).expect(200).end (err, res) ->
    t.end()
    return
  return