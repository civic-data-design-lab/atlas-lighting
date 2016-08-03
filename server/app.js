// Generated by CoffeeScript 1.10.0
(function() {
  var path;
  'use strict';
  var Sequelize, app, async, express, http, path, request, sequelize, serveStatic, server;

  express = require('express');

  request = require('request');

  path = require('path');

  http = require('http');

  path = require('path');

  async = require('async');

  serveStatic = require('serve-static');

  Sequelize = require('sequelize');

  sequelize = new Sequelize('atlasdb', 'postgres', '', {
    host: 'postgresql',
    dialect: 'postgres'
  });

  app = express();

  app.disable('etag');

  app.set('trust proxy', true);

  app.use(serveStatic('./bower_components/jquery/dist'));

  app.use(serveStatic('./node_modules/bootstrap/dist/js'));

  app.use(serveStatic('./node_modules/bootstrap/dist/css'));

  app.use(serveStatic('./bower_components/d3'));

  app.use(serveStatic('./bower_components/leaflet/dist'));

  app.use(serveStatic('./bower_components/d3-queue/'));

  app.use(serveStatic('./node_modules/topojson/build'));

  app.use(serveStatic('./bower_components/mapbox.js/'));

  app.use(serveStatic('./node_modules/d3-tip'));

  app.use(serveStatic('./node_modules/mapbox-gl/dist'));

  app.use(serveStatic('./node_modules/crossfilter'));

  app.use(serveStatic('./font-awesome'));

  app.use(serveStatic('./stylesheets'));

  app.use(serveStatic('./data'));

  app.use(serveStatic('./node_modules/dc'));

  app.use(serveStatic('./scripts'));

  app.use(serveStatic('./', {
    'index': ['grid.html', 'grid.htm']
  }));

  app.get('/', function(req, res) {
    res.render('index', function(err, html) {
      res.send(html);
    });
  });

  app.get('/', function(req, res) {
    res.render('index', function(err, html) {
      res.send(html);
    });
  });

  app.get('/grids/:msa', function(req, res) {
    sequelize.query('SELECT * FROM grid WHERE msa = :msa ', {
      replacements: {
        msa: "" + req.params.msa
      },
      type: sequelize.QueryTypes.SELECT
    }).then(function(object) {
      res.json(object);
    });
    return;
  });

  app.get('/cities', function(req, res) {
    sequelize.query('SELECT * FROM city', {
      type: sequelize.QueryTypes.SELECT
    }).then(function(object) {
      res.json(object);
    });
  });

  app.get('/groups_data', function(req, res) {
    sequelize.query('SELECT * FROM group_data', {
      type: sequelize.QueryTypes.SELECT
    }).then(function(object) {
      res.json(object);
    });
  });

  app.get('/city_comparisons_all', function(req, res) {
    sequelize.query('SELECT * FROM city_comparison', {
      type: sequelize.QueryTypes.SELECT
    }).then(function(object) {
      res.json(object);
    });
  });

  app.get('/us_json', function(req, res) {
    sequelize.query('SELECT * FROM us_json', {
      type: sequelize.QueryTypes.SELECT
    }).then(function(object) {
      res.json(object);
    });
  });

  app.get('/zipcode_business_geojson/:msa', function(req, res) {
    sequelize.query('SELECT * FROM zipcode_business', {
      type: sequelize.QueryTypes.SELECT
    }).then(function(object) {
      res.json(object);
    });
  });

  module.exports = app;


  /* Start the server */

  server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
    console.log('App listening at http://%s:%s', server.address().address, server.address().port);
    console.log('Press Ctrl+C to quit.');
    console.log('checking if adjustments work');
  });

}).call(this);
