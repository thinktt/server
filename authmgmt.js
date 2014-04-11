var mongoose = require('mongoose'); 
var bcrypt = require('bcryptjs');
var db; 

mongoose.connect('mongodb://localhost/test');
db = mongoose.connection;

var userSchema = mongoose.Schema({	
	username: String,
	passHash: String,
	sessionID: String,
	sessionExp: Number
});


var User = mongoose.model('User', userSchema); 

var user = new User(); 

/*
var user = new User({
	username: '',
	passHash: '',
	sessionID: '',
	sessionExp: 0
});
*/
console.log(user); 
console.log(user.username); 


function addCredentials(username, password) {
	var salt, hash, i;

	user.username = username;
	
	//generate a password salt and hash
	salt = bcrypt.genSaltSync(10);
	user.passHash = bcrypt.hashSync(password, salt);

	//make sure user.sessionID is clear
	user.sessionID = ""; 

	//generate a session ID by stringing 10 
	//bcrypt salts together, only taking the
	//random string part 
	for(i=0; i<10; i++) {
		user.sessionID = user.sessionID + bcrypt.genSaltSync(5).substr(7);
	}


	//generate a session experation
	//an hour from the current time 
	user.sessionExp = (Date.now() + 3600000);

}


addCredentials('legolas', 'xyzzy'); 

console.log(user); 
console.log('username: ', user.username);
console.log('\nhash: ', user.passHash); 
console.log('\nsessionID:\n', user.sessionID);
console.log('\nsessionExp:', user.sessionExp); 



//check credentials (username, password)
//add credentials (username, password)
//check username
//check sessionID 