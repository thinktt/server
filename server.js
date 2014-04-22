var express = require('express');
var https = require('https');
var http = require('http'); 
var fs = require('fs');
var bcrypt = require('bcryptjs');
var MongoStore = require('connect-mongo')(express);
var auth = require('./authmgmt.js'); 


var app = express(); 

var sslOptions = {
  key: fs.readFileSync('../server.key'),
  cert: fs.readFileSync('../server.crt'),
  ca: fs.readFileSync('../ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

var sessionOptions = {
  secret: '1234567890QWERTY',
  store: new MongoStore({db: 'users'})
};


//.................Require HTTPS.............................
function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        //return res.redirect('https://' + req.get('host') + req.url);
        return res.redirect('https://72.47.189.109:8888' + req.url);
    }
    next();
}


//.................Requrire Auth.............................
function requireAuth(req, res, next) {

  //avoid undefined cookie sessionId
  req.cookies.sessionId = req.cookies.sessionId || ''; 
  
  //if cookies session id is not valid redirect to login page
  if( auth.checkSession(req.cookies.sessionId) !== 'session is valid') { 
     return res.redirect('https://' + req.headers.host  + '/login/');
  }
  next(); 
}

//.............Handle Post From Ajax Test Page...................
function ajaxPost(req, res, next) {
  var data = {};
  console.log(req.body.message);
  data.message = 'You said:\n' + req.body.message;
  res.send(data);
}


//..................Validate Any Post Req......................
function validatePost(req, res, next) {
 var usernameRegEx = /^[a-z0-9_-]{3,16}$/,
     passwordRegEx = /^[\u0020-\u007E]{8,256}$/;

  if(req.body.postId === 'logIn' || 'register') {
    if(!usernameRegEx.test(req.body.username)) {
      res.send({reply: 'invalid post'});
    }
    if(!passwordRegEx.test(req.body.password)) {
      res.send({reply:'invalid post'}); 
    }
  } 
  else {
    res.send({reply:'invalid poast'});
  }

  next(); 
}


//..................Handle Login Post Request.................
function loginPost(req, res, next) {

  // if this is a logIn post request
  if(req.body.postId === 'logIn') {

    //check the usrname and password
    auth.checkCredentials(req.body.username, req.body.password, function(status, username) {
      //if they're valid make a new session
      auth.makeSession(username, function(session) {
        if(status === 'user validated') {
          //send cookie with sessionId
          res.cookie('sessionId', session.id, {maxAge: 3600000, httpOnly: true});
          res.send('user validated');
        } 
        else {
          //reply with invalid login
          res.send('invalid login'); 
        }
      });
    });
  } 

  //if this is a registration post request
  if(req.body.postId === 'register') {
    //attempt to add the credentials to the database
    auth.addCredentials(req.body.username, req.body.password, function(status) {
      //user was added
      if(status === 'user added') {
        res.send('user added'); 
      } 
      //could not add user, usrname already exist
      else if (status === 'user taken') {
        res.send('user taken');
      }

    }); 

  }
}



//..............The Express Stack.....................
app.use(express.logger('dev'));
app.use(requireHTTPS);
app.use(express.cookieParser()); 
app.use(express.json());
app.use(express.session(sessionOptions));

app.use('/login', express.static('login/'));

app.post('/*', validatePost); 
app.post('/login', loginPost);
app.use(requireAuth); 

app.use('/', express.static('enigmaX/'));

app.use('/ajax', express.static('ajax/'));
app.post('/ajax', ajaxPost); 








//........   Start The Servers..........................
http.createServer(app).listen(3000);

https.createServer(sslOptions,app).listen(3465, function(){
  console.log("Secure Express server listening on port 3465");
  console.log("Redirect server running on port 3000"); 
});

 
