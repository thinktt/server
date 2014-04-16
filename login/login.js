$("#logIn #mainButton").click(function(event) {

	var data = {};
	
	//load the data
	data.username = $("#logIn input[name=username]").val();
	data.password = $("#logIn input[name=password]").val();
	data.type = 'logIn'; 

	//clear the boxes 
	$("#logIn input[name=username]").val('');
	$("#logIn input[name=password]").val('');
	
	//send the post request
	$.ajax({
		url: '', 
		type: 'POST',
		data:  JSON.stringify(data),
		contentType: 'application/json; charset=utf-8',
		success: function (res) {
			if(res === true) {
				$("#messageArea").html('You are now logged in'); 
			}
			else {
				$("#messageArea").html('Invalid username of password'); 
			} 
		}
	}); 

});

$("#register #mainButton").click(function(event) {

	var data = {};

	//load the data
	data.username = $("#register input[name=username]").val();
	data.password = $("#register input[name=password]").val();
	data.confirm = $("#register input[name=confirm]").val();
	data.type = 'register'; 

	//clear the boxes 
	$("#register input[name=username]").val('');
	$("#register input[name=password]").val('');
	$("#register input[name=confirm]").val('');

	//do passwords match
	if(data.password === data.confirm) {
		//send the post request
		$.ajax({
			url: '', 
			type: 'POST',
			data:  JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			success: function (res) {
				$("#messageArea").html('Attempting to register account'); 
			}
		}); 
	}
	else {
		$("#messageArea").html("Passwords don't match"); 
	}
});