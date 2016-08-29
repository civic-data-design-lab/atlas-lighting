###
@api {get} /grids/:msa Request grids data by msa
@apiName GetGrid
@apiDescription Endpoint to replace using the file: grids_values_esport_no0.csv
@apiGroup relation
@apiParam {String} name abbr of the MSA.
@apiSuccessExample Success-Response:
     HTTP/1.1 200 OK
     [
          {
               "id":1,
               "population":6.33,
               "income":116667,
               "averlight":28.09257423,
               "places":1,
               "b_diversity":null,
               "dev_intensity":3,
               "cell_id":3081,
               "lng":-87.81273996,
               "lat":42.66593799,
               "inc_cat":3,
               "msa":"chicago"
          },
          {
               "id":2,
               "population":1.27,
               "income":61618,
               "averlight":11.25793053,
               "places":1,
               "b_diversity":0,
               "dev_intensity":3,
               "cell_id":3692,
               "lng":-88.01401771,
               "lat":42.66443068,
               "inc_cat":2,
               "msa":"chicago"
          },
          {
               ...
          },
          ...
     ]
###


###
@api {get} /cities Request data for all cities
@apiName GetCity
@apiDescription Endpoint to replace using the file: all_cities.csv
@apiGroup relation
@apiSuccessExample Success-Response:
     HTTP/1.1 200 OK
     [
          {
               "id":1,
               "name":"Chicago",
               "group":9,
               "value":30.54,
               "density":8613.4,
               "gmp":550793,
               "popChange":456282,
               "gridorder":9
          },
          ...
     ]
###




###
@api {get} /groups_data Request data for all groups of cities
@apiName GetGroup
@apiDescription Endpoint to replace using the file: groupdata.csv
@apiGroup relation
@apiSuccessExample Success-Response:
     HTTP/1.1 200 OK
     [
          {
               "id":1,
               "name":"Chicago",
               "group":9,
               "value":30.54,
               "density":8613.4,
               "gmp":550793,
               "popChange":456282,
               "gridorder":9
          },
          ...
     ]
###





###
@api {get} /zipcode_business_geojson/:msa Request buseness zipcode geojson obj by msa
@apiName GetZipcodeBusinessGeojson
@apiDescription object retruned from this call will have a field "geojson", which will return the object used to be called from zipcode_business.geojson
@apiGroup document
@apiParam {String} MSA name of the msa to return data for.

@apiExample {js} Example usage:
     $(function() {
          queue()
             .defer(d3.json,"zipcode_business_geojson/chicago")
         .await(parseFunc);
     })
@apiSuccessExample Success-Response:
     HTTP/1.1 200 OK
          [
               {
                    "id":1,
                    "msa":"chicago",
                    "geojson":
                         {
                              "type":"FeatureCollection",
                              "crs":
                                   {
                                        "type":"name",
                                        "properties":
                                             {
                                                  "name":"urn:ogc:def:crs:OGC:1.3:CRS84"
                                             }
                                   },
                                        "features":
                                             [
                                                  {
                                                       "type":"Feature",
                                                       "properties":
                                                            {
                                                            "name":"46301",
                                                            "TOT_POP":621,
                                                            "HMI":81488,
                                                            "places_cou":34,
                                                            "light_mean":200.42414,
                                                            "diversity":0
                                                            },
                                                       "geometry":
                                                            {
                                                                 "type":"MultiPolygon",
                                                                 "coordinates":
                                                                      [
                                                                           [
                                                                                [
                                                                                     [-87.009712,41.680878],
                                                                                     [-87.009872,41.690053],
                                                                                     [-86.932895,41.718939],
                                                                                     [-86.932639,41.704694],
                                                                                     [-86.960278,41.691718],
                                                                                     [-86.968174,41.690955],
                                                                                     [-86.973044,41.688424],
                                                                                     [-86.974902,41.685658],
                                                                                     [-86.989926,41.679594],
                                                                                     [-86.985988,41.673243],
                                                                                     [-86.983808,41.674214],
                                                                                     [-86.982407,41.672586],
                                                                                     [-86.983855,41.672109],
                                                                                     [-86.983525,41.671461],
                                                                                     [-86.980606,41.670984],
                                                                                     [-86.980807,41.667209],
                                                                                     [-86.99512,41.659124],
                                                                                     [-86.995114,41.66398],
                                                                                     [-86.993806,41.663986],
                                                                                     [-86.994194,41.668767],
                                                                                     [-86.995633,41.668128],
                                                                                     [-86.995427,41.669137],
                                                                                     [-87.009612,41.663596],
                                                                                     [-87.009712,41.680878]
                                                                                ]
                                                                           ]
                                                                      ]
                                                            }
                                                  },
                                                  {
                                                       "type": ...
                                                  }
                                   }
                         }                   
                    }
               }
          ]
###