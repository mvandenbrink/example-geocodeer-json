/**
 * API node file
 * 
 * 
 */
var url         = require('url')
  , request     = require('request')
  , parseString = require('xml2js').parseString
  , stripPrefix = require('xml2js/lib/processors').stripPrefix;

var zoekurl = 'http://geodata.nationaalgeoregister.nl/geocoder/Geocoder';
var my_error;
var my_status;
var my_body;

exports.v01 = function(req, res){
  var query = getRequestString(req);
  var srsName;
  var geoRDCoord;
  var geoGPSCoord;
  var geoCoord = {};
  
  request(zoekurl + query, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, {tagNameProcessors: [stripPrefix], normalizeTags: true}, function (err, result) {
        if (result.geocoderesponse === undefined || result.geocoderesponse.geocoderesponselist === undefined) {
          console.log("Result from remote server is : " + JSON.stringify(result));
          my_status = 404;
          my_body   = JSON.stringify(new errorMessage(2, WARNINGTYPE, "No data found with request '" + query + "'"));
        } else {
          try {
            srsName     = result.geocoderesponse.geocoderesponselist[0].geocodedaddress[0].point[0].$.srsName;
            geoRDCoord  = result.geocoderesponse.geocoderesponselist[0].geocodedaddress[0].point[0].pos[0]._.split(' ');
            geoGPSCoord = RD2GPS(geoRDCoord[0], geoRDCoord[1]);
            geoCoord    = new geoData(geoRDCoord, srsName, geoGPSCoord);
            /*
            console.dir(geoRDCoord);
            console.dir(geoCoord);
            console.dir(result.geocoderesponse.geocoderesponselist[0].geocodedaddress[0].address[0].streetaddress[0].building[0].$.number);
            console.dir(result.geocoderesponse.geocoderesponselist[0].geocodedaddress[0].address[0].streetaddress[0].street[0]);
            console.dir(result.geocoderesponse.geocoderesponselist[0].geocodedaddress[0].address[0].place);
            console.dir(result.geocoderesponse.geocoderesponselist[0].geocodedaddress[0].address[0].postalcode[0]);
            */
            my_status =200;
            my_body   = JSON.stringify(geoCoord);
          } catch(error) {
            console.dir(result.geocoderesponse);
            console.error("Catch error while creating geoCoord object on XML2JS response: " + error);
            my_status = 500;
            my_body   = JSON.stringify(new errorMessage(3, ERRORTYPE, "Wrong response from GEO server"));
          }
        }
      });
    } else {
      console.error("Request to '" + zoekurl + "' failed. " + error);
      if (response !== undefined && response.statusCode !== undefined) {
        console.error("HTTP status from remote server: HTTP " + response.statusCode);
        console.dir(response.body);
      }
      my_status = 500;
      my_body   = JSON.stringify(new errorMessage(1, ERRORTYPE, "Request error failed on server. Try again later."));
    }
    
    res.status(my_status).send(my_body);

  }); 
  
  console.log('request ended');  
};

function getRequestString(req) {
  var url_parts = url.parse(req.url, true);
  // console.log(url_parts.search);
  
  return url_parts.search;
}

// Originally made by: Henkjan Faber (henkjan.faber@blue-chips.nl) 
// based on Python implementation by Kilian Valkhof (https://github.com/Kilian)
function RD2GPS(x, y) {
  var x0 = 155000.0;
  var y0 = 463000.0;
  var phi0 = 52.15517440;
  var lambda0 = 5.38720621;
  var K = [ 
    [ 0.0, 3235.65389, -0.24750, -0.06550, 0.0], 
    [ -0.00738, -0.00012, 0.0, 0.0, 0.0], 
    [ -32.58297, -0.84978, -0.01709, -0.00039, 0.0], 
    [ 0.0, 0.0, 0.0, 0.0, 0.0], 
    [ .00530, 0.00033, 0.0, 0.0, 0.0], 
    [ 0.0, 0.0, 0.0, 0.0, 0.0] 
  ];

  var L = [
    [ 0.0, .01199, 0.00022, 0.0, 0.0],
    [ 5260.52916, 105.94684, 2.45656, .05594, .00128],
    [ -.00022, 0.0, 0.0, 0.0, 0.0],
    [ -.81885, -.05607, -.00256, 0.0, 0.0],
    [ 0.0, 0.0, 0.0, 0.0, 0.0],
    [ .00026, 0.0, 0.0, 0.0, 0.0]
  ];

  var dx = (x - x0) * 0.00001;
  var dy = (y - y0) * 0.00001;

  var phi = 0;
  var lambda = 0;
  for (var q = 0; q < 5; q++) {
      for (var p = 0; p < 6; p++) {
          phi = phi + K[p][q] * Math.pow(dx, p) * Math.pow(dy, q);
          lambda = lambda + L[p][q] * Math.pow(dx, p) * Math.pow(dy, q);
      }
  }

  phi = phi0 + phi / 3600.0;
  lambda = lambda0 + lambda / 3600.0;

  // console.log("WGS84 Coord:" + phi + ", " + lambda);
  return ([phi, lambda]);
}

/*
 * Object definitions
 */

function geoData(RD, srsName, GPS) {
  this.geometry = {
    'rijksdriehoek': {
      'x_coordinate': Number(RD[0]),
      'y_coordinate': Number(RD[1]),
      'z_coordinate': 0,
      'srsname'     : srsName
    },
    'gps': {
      'latitude' : GPS[0],
      'longitude': GPS[1],
      'name'     : 'WGS84'
    }
  };
}

function errorMessage(code, type, text) {
  this.message = {
    'code': code,
    'type': type,
    'text': text
  };
}

// Static Types
var ERRORTYPE   = "Error";
var WARNINGTYPE = "Warning";
