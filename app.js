
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
//set port to eviroment pot or 3000
app.set('port', process.env.PORT || 3000);
//sets views folder to /views using dirname 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
//probaby turns on the logger
app.use(express.logger('dev'));
//use json for sends??
app.use(express.json());
//urlencoded?
app.use(express.urlencoded());
//to simulate delete and put??
app.use(express.methodOverride());
//turns on routes (automatic if you define routes)
app.use(app.router);
//sets the static folder
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
