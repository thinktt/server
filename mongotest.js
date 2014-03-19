var mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;

function onMonError() {
	console.log('Mongoose did not connect');
}

function mongoSaveHandler(err, obj) {
	console.log('object saved'); 

}




function onMonConnect() {
	console.log('Connected to MongoDB');

	var kittySchema = mongoose.Schema({	name: String});

	
	kittySchema.methods.speak = function () {
		var greeting = '';

		if(this.name) {
			greeting = 'My name is ' + this.name;
		} else {
			greeting = 'I have no name';
		}
		
		console.log(greeting);
	};

	var Kitten = mongoose.model('Kitten', kittySchema);
	
	var cat1 = new Kitten({name: 'Max', fur: 'black'});
	var cat2 = new Kitten({name: 'Legolas'});
	cat1.speak(); 
	cat2.speak(); 
	cat1.save(function (err) {
		if(!err) {
			console.log('success'); 
		}
	}); 
	cat2.save(); 
	
	
	Kitten.find(function (err, kittens) {

		if(!err) {
			console.log('success');
		} 
		
		console.log('*******'); 
		console.log(kittens);
		process.exit(); 
	});

	
	
}


db.on('error', function(err){
	console.log('Mongo connection error');	
});

db.once('open', function(){
	console.log('connected to Mongo'); 
}); 

var kittySchema = mongoose.Schema({	name: String});
var Kitten = mongoose.model('Kitten', kittySchema);
var cat1 = new Kitten({name: 'Legolas'});

cat1.save(function (err) {
	if(!err) {
		console.log('success'); 
	}
}); 

cat1.name = 'Brick'; 


cat1.save(function (err) {
	if(!err) {
		console.log('success'); 
	}
}); 



