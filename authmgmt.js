var mongoose = require('mongoose'); 
var bcrypt = require('bcryptjs');
var crypto = require('crypto'); 
var db; 

var currentSessions = []; 


var userSchema = mongoose.Schema({	
	username: {type: String, lowercase: true}, 
	passHash: String,
});

var sessionSchema = mongoose.Schema({	
	username: {type: String, lowercase: true}, 
	id: String,
	exp: Number
});

var User = mongoose.model('User', userSchema); 
var Session = mongoose.model('Session', sessionSchema);



//connect to mongodb
mongoose.connect('mongodb://localhost/users');
db = mongoose.connection;


function addCredentials(username, password, callback) {
	var salt, hash, i, user;

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
							callback('user added');
							return; 
						}
					});

		    	});
			});
		}
		//otherwise user already exist
		else {
	       	callback('user taken');
	       	return; 
	    }

	});
}


function checkCredentials(username, password, callback) {
	var user;

	//get the user information
	User.find({username: username}, function(error, userData) {

		//does the user exist
		if(userData.length === 0) {
			callback('no such user');
			return; 
		}
		else {
			user = userData[0]; 
			//check the password 
			bcrypt.compare(password, user.passHash, function(err, res) {
				if(res === true) { 

					//respond with the session information
					callback('user validated', user.username); 
	    			return; 
				}	
    			else {
    				callback("invalid password"); 
    				return; 
    			}
    		});
		}
	
	});

}



function makeSession(username, callback) {
	var session = new Session();

	session.username = username; 

	//generate a sessionId 
	crypto.randomBytes(32, function(err, buf) {
		session.id = buf.toString('base64');

		//generate a session experation
		//an hour from the current time 
		session.exp = (Date.now() + 3600000);
		
		//put session in db
		session.save(); 

		//put session in cashed sessions
		currentSessions.push(session); 

		callback(session); 
	});
}



function checkSession(sessionId) {
	var i;

	for(i=0; i < currentSessions.length; i++) {
		if(currentSessions[i].id === sessionId) {
			break;
		}
	}

	
	if(i >= currentSessions.length) {
		return 'session not found'; 
	} 
	else if(currentSessions[i].exp < Date.now()) {
		return 'session is expired'; 
	}
	else {
		return 'session is valid'; 
	}

}


function loadCurrentSessions() {
	
	Session.find( {exp: {$gt: Date.now()} }, function(err, sessions) {
		currentSessions = sessions;
		console.log(currentSessions); 
	});

}


loadCurrentSessions(); 
console.log(currentSessions); 


/*
setTimeout( function() {
	console.log(checkSession('U+hsKjamsnCFKUwFAk+2WXyD1Rm1rCm0NbXlsad/tXA='));
},
2000); 


checkCredentials('gandalf', 'xyzzy', function(status, username) {
	console.log('checking ' + username + ': ' + status);
	makeSession(username, function(session) {
		console.log(session); 
	});
});


addCredentials('gandalf', 'xyzzy', function(status) {
	console.log('adding gandalf: ' + status); 
});


checkCredentials('bilbo', 'xyzzy', function(status) {
	console.log('checking bilbo: ' + status); 
});

checkCredentials('gandalf', 'xyzzy', function(status) {
	console.log('checking gandalf: ' + status); 
});

crypto.randomBytes(32, function(err, buf) {
    console.log(buf.toString('base64'));
});

*/