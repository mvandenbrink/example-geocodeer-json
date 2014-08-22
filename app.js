/**
 * Module dependencies.
 */

var express        = require('express')
  , favicon        = require('serve-favicon')
  , bodyParser     = require('body-parser')
  , methodOverride = require('method-override')
  , morgan         = require('morgan')
  , routes         = require('./routes')
  , api            = require('./routes/api')
  , http           = require('http')
  , path           = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3003);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride());
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
//app.use(app.router);

app.get('/', routes.index);
app.get('/v0.1/geocoder', api.v01);


http.createServer(app).listen(app.get('port'), function(){
  console.log('BAG GEO API server listening on port ' + app.get('port'));
});

//app.listen(3003); 
//console.log('BAG GEO API server listening on port 3003');