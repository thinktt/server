var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
app.use(express.logger('dev'));
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);

app.use(function (req, res) { 
	res.redirect("/");
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }
//var user = require('./routes/user');
//var routes = require('./routes');
//app.get('/', routes.index);
//app.get('/users', user.list);
//app.use(app.router);
// all environments
//set port to eviroment pot or 3000
//sets views folder to /views using dirname 
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
//app.use(express.json());
//app.use(express.favicon());
//probaby turns on the logger
//use json for sends??
//urlencoded?
//app.use(express.urlencoded());
//to simulate delete and put??
//app.use(express.methodOverride());
//turns on routes (automatic if you define routes)
//sets the static folder

// development only
