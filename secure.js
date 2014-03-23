var express = require('express');
var https = require('https');
var http = require('http'); 
var fs = require('fs');

var app = express(); 

var sslOptions = {
  key: fs.readFileSync('../server.key'),
  cert: fs.readFileSync('../server.crt'),
  ca: fs.readFileSync('../ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(express.logger('dev'));
app.use(requireHTTPS);
app.use(express.static('enigmaX/'));

http.createServer(app).listen(80);

https.createServer(sslOptions,app).listen(443, function(){
  console.log("Secure Express server listening on port 3000");
});


  












/*
function onListening() {
	console.log('Sever running on port ' + app.get('port'));

}
app.set('port', 3000);
app.listen(app.get('port'), onListening);
*/