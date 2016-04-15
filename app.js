var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var app = express();
var port = process.env.PORT || 3000;
var securePort = process.env.SECURE_PORT || 3443

var sslOptions = {
  key: fs.readFileSync('../cert/privkey.pem'),
  cert: fs.readFileSync('../cert/cert.pem'),
};

app.use(express.logger('dev'));
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);


app.use(function (req, res) { 
	res.redirect("/");
});


http.createServer(app).listen(port, function(){
  console.log('Express server listening on port ' + port);
});

https.createServer(sslOptions, app).listen(securePort, function(){
  console.log('Secure Express server listening on port ' + securePort);
});


