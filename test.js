var express = require('express');
var	app = express();
var	MongoStore = require('connect-mongo')(express);
var fs = require('fs');
var http = require('http');
var https = require('https');  
var fs = require('fs');

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
        return res.redirect('https://localhost:3465' + req.url);
    }
    next();
}



app.use(express.cookieParser());
app.use(express.session({
	secret: '1234567890QWERTY',
	store: new MongoStore({
		db: 'users'
	})
}));

app.use(requireHTTPS); 


app.get('/', function(req, res) {
	
	if(req.session.visits === undefined) {
		req.session.visits = 0;
	} 
	else {
		req.session.visits++; 
	}
		
	res.send('You have been here ' + req.session.visits + ' times before.');
});




http.createServer(app).listen(3000);

https.createServer(sslOptions,app).listen(3465, function(){
  console.log("Secure Express server listening on port 3465");
  console.log("Redirect server running on port 3000"); 
});

 
