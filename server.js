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
        //return res.redirect('https://' + req.get('host') + req.url);
        return res.redirect('https://72.47.189.109:8888' + req.url);
       }
    next();
}

function requireAuth(req, res, next) {
  return res.redirect('https://' + req.headers.host  + '/login/');
}

function ajaxPost(request, response, next) {
  var data = {};
  console.log(request.body.message);
  data.message = 'You said:\n' + request.body.message;
  response.send(data);
}

function loginPost(request, response, next) {
  var data = {message:'Howdy!'};
  response.send(data);
}


app.use(express.logger('dev'));
app.use(requireHTTPS);
app.use(express.cookieParser()); 
app.use(express.json());

app.use('/login', express.static('login/'));
app.post('/login', loginPost);
app.use(requireAuth); 

app.use('/', express.static('enigmaX/'));

app.use('/ajax', express.static('ajax/'));
app.post('/ajax', ajaxPost); 





http.createServer(app).listen(3000);

https.createServer(sslOptions,app).listen(3465, function(){
  console.log("Secure Express server listening on port 3465");
  console.log("Redirect server running on port 3000"); 
});

 
