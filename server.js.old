var express = require('express');
var enigmaX = require('./enigmax');
var key = enigmaX.newKey();
var app = express(); 
var server = {};

var data = {};
	data.from = 'Bob';
	data.to = 'Dave';
	data.subject = 'Happy New Year!';
	data.message = 'Just wanted to wish you a Happy New Year!';
	data.num = 10;


function handlePost(request, response, next) {
	console.log(request.body.message);
	data.message = enigmaX.crypt(request.body.message);
	response.send(data);
	//next(); 
}



function onListening() {
	console.log('Sever running on port ' + app.get('port'));

}



app.use(express.logger('dev'));
app.use(express.json()); 
app.use(express.static(__dirname + '/public/'));
app.use(express.favicon(__dirname + "/ajax/skull.ico")); 
app.use('/ajax', express.static(__dirname + '/ajax/'));
app.post('/ajax', handlePost); 


app.set('port', 3000);
app.listen(app.get('port'), onListening);




/*function parseText(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk; });
    req.on('end', next);
  } else {
    next();
  }
}*/
