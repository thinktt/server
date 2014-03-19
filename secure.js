var express = require('express');
var https = require('https');
var fs = require('fs');

var app = express(); 

var sslOptions = {
  key: fs.readFileSync('../server.key'),
  cert: fs.readFileSync('../server.crt'),
  ca: fs.readFileSync('../ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};


app.use(express.logger('dev'));
app.use(express.static('enigmaX/'));



https.createServer(sslOptions,app).listen('3000', function(){
  console.log("Secure Express server listening on port 3000");
});


  












/*
function onListening() {
	console.log('Sever running on port ' + app.get('port'));

}
app.set('port', 3000);
app.listen(app.get('port'), onListening);
*/