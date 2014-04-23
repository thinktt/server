var express = require('express');
var https = require('https');
var http = require('http'); 
var fs = require('fs');
var bcrypt = require('bcryptjs');
var MongoStore = require('connect-mongo')(express);
var mongoose = require('mongoose'); 
var bcrypt = require('bcryptjs');


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


var userSchema = mongoose.Schema({  
  username: {type: String, lowercase: true}, 
  passHash: String,
});
var User = mongoose.model('User', userSchema); 

//connect to mongodb
mongoose.connect('mongodb://localhost/users');
db = mongoose.connection;


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

  //avoid undefined user status
  req.session.userStatus = req.session.userStatus || 'loggedOut'; 
  
  //if cookies session id is not valid redirect to login page
  if( req.session.userStatus !== 'loggedIn') { 
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
    res.send({reply:'invalid post'});
  }

  next(); 
}


//..................Handle Login Post Request.................
function loginPost(req, res, next) {
  var username = req.body.username,
      password = req.body.password;
      
  
  /*//make sure user session vars are defined 
  if(!req.session.userStatus) {
    res.session.userStatus = 'loggedOut';
  }
  if(!req.session.user){
    res.session.user = null;
  }
  */

  //if this is a logIn post request
  if(req.body.postId === 'logIn') {
    
    //look up user in database
    User.find({username: username}, function(error, userData) {
      //does the user exist
      if(userData.length === 0) {
        console.log('user not found')
        res.send('invalid login');
      }
      else {
        user = userData[0]; 
        //check the password 
        bcrypt.compare(password, user.passHash, function(err, hashRes) {
           if(hashRes === true) { 
              req.session.userStatus = 'loggedIn'; 
              req.session.user = username; 
              res.send('user validated')                
           } 
           else {
             console.log('invalid password');
             res.send('invalid login'); 
           }
        });
      }
    }); 
  }

  //if this is a registration post request
  if(req.body.postId === 'register') {
  
    //check if username exist
    User.find({username: username}, function(error, userData){
      
      //if it doesn't exist then add it           
      if(userData.length === 0) {
        user = new User(); 
        user.username = username;
        
        //generate a salt
        bcrypt.genSalt(10, function(err, salt) {

            //when salt is done hash the password
            bcrypt.hash(password, salt, function(err, hash) {
                
                //when hash is done store new credentials in db
                user.passHash = hash; 
                user.save(function (err) {
                  if(!err) {
                    res.send('user added');
                    return; 
                  }
                });
            });
        });
      }
      //otherwise user already exist
      else {
        res.send('user taken');
        return; 
      }

    });

  }

}



//..............The Express Stack.....................
app.use(express.logger('dev'));
app.use(requireHTTPS);
app.use(express.json());
app.use(express.cookieParser()); 
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

 
