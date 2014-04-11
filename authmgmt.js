var mongoose = require('mongoose'); 
var bcrypt = require('bcryptjs');
var db; 


mongoose.connect('mongodb://localhost/users');
db = mongoose.connection;

var userSchema = mongoose.Schema({	
	username: {type: String, lowercase: true}, 
	passHash: String,
	session: {
		id: String,
		experation: Number
	}	
});

var User = mongoose.model('User', userSchema); 



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
		        	
		        	//whe hash is done store new credentials in db
		        	user.passHash = hash; 
		        	user.save(function (err) {
						if(!err) {
							console.log('credentials stored'); 
							return callback('user added'); 
						}
					});

		    	});
			});
		}
		//otherwise user already exist
		else {
	       	return callback('user taken');
	    }
}
	    

/*function checkCredentials(username, password, callback) {
	var user;

	//get the user information
	User.find({username: username}, function(error, userData) {
		
		//does the user exist
		if(userData.length === 0) {
			return callback('no such user');
		}
		else {
			user = userData[0];  
			return callback(user.username + ' exist!'); 
		}
	
	});

}



checkCredentials('legolas', 'xyzzy', function(status) {
	console.log(status); 
});

*/



/*
addCredentials('frodo', 'xyzzy', function(status){
	console.log(status); 
}); 

	//check password
	
	//create sessionID
	

	//generate a session ID by stringing 10 
	//bcrypt salts together, only taking the
	//random string part 
	//for(i=0; i<10; i++) {
	//		user.sessionID = user.sessionID + bcrypt.genSaltSync(5).substr(7);
	//}


	//generate a session experation
	//an hour from the current time 
	//user.sessionExp = (Date.now() + 3600000);


	//return sesionID 

    //}
    //	});

User.find({username: 'toby'}, function(error, data){
    console.log(data);
 });


function checkSessionID(sessionID) {

}




console.log(user); 
console.log('username: ', user.username);
console.log('\nhash: ', user.passHash); 
console.log('\nsessionID:\n', user.sessionID);
console.log('\nsessionExp:', user.sessionExp);




//check credentials (username, password)
//add credentials (username, password)
//check username
//check sessionID 
*/