var express = require('express');
var https = require('https');
var http = require('http'); 
var fs = require('fs');
var bcrypt = require('bcryptjs');
var auth = require('./authmgmt.js'); 

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

  //avoid undefined cookie SID
  req.cookies.SID = req.cookies.SID || ''; 
  
  //if cookies session id is not valid redirect to login page
  if( auth.checkSession(req.cookies.SID) !== 'session is valid') { 
     return res.redirect('https://' + req.headers.host  + '/login/');
  }
  next(); 
}

function ajaxPost(req, res, next) {
  var data = {};
  console.log(req.body.message);
  data.message = 'You said:\n' + req.body.message;
  res.send(data);
}

function loginPost(req, res, next) {
  
  if(req.body.type === 'logIn') {
    auth.checkCredentials(req.body.username, req.body.password, function(status, username) {
      auth.makeSession(username, function(session) {
        if(status === 'user validated') {
          res.cookie('SID', session.id, {maxAge: 3600000, httpOnly: true});
          res.send(true);
        } 
        else {
          res.send(false); 
        }
      });
    });
  } 
  else if(req.body.type === 'register') {
    res.send('Account not reistered'); 
  }
 
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

 
