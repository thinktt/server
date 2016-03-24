var express = require('express');
var https = require('https');
var http = require('http'); 
var fs = require('fs');


var app = express(); 

var sslOptions = {
  key: fs.readFileSync('../server.key'),
  cert: fs.readFileSync('../server.crt'),
};


//..............The Express Stack.....................
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.cookieParser()); 
app.use(express.favicon("ajax/skull.ico")); 
app.use('/', express.static('enigmaX/'));



//........   Start The Servers..........................
http.createServer(app).listen(3000);

https.createServer(sslOptions, app).listen(3443, function(){
  console.log("Secure Express server listening on port 3443");
  console.log("Redirect server running on port 3000"); 
});

 
