function Foo(a, b , c) {
	this.a = a;
	this.b = b;
	this.c = c; 
	this.d = 100; 

	function addThings(x, y) {
		return x + y; 
	}
	
	console.log(addThings(10, 10)); 
}

function Bar(a, b , c) {
	this.a = a;
	this.b = b;
	this.c = c; 
	this.d = 100; 
	
}

var foo = new Foo(10, 20 ,30);
var bar = new Bar(40, 50, 60); 

console.log(foo instanceof Bar);


