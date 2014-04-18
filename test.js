var express = require('express');
var app = express();


app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

app.get('/', function(req, res) {
	console.log(req.session.visits)

	if(req.session.visits === undefined) {
		req.session.visits = 0;
	} 
	else {
		req.session.visits++; 
	}
	
	
	res.send('You have been here ' + req.session.visits + ' times before.');
});

app.listen(process.env.PORT || 3000);