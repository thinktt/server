

$("#logIn #mainButton").click(function(event) {
	var data = {}, 
		usernameRegEx = /^[a-z0-9_-]{3,16}$/,
		passwordRegEx = /^[\u0020-\u007E]{8,256}$/;
	
	//load the data
	data.username = $("#logIn input[name=username]").val();
	data.password = $("#logIn input[name=password]").val();
	data.postId = 'logIn'; 

	//clear the boxes 
	$("#logIn input[name=username]").val('');
	$("#logIn input[name=password]").val('');
	
	//if invalidly formatted username or password
	//don't even bother th server
	if(!usernameRegEx.test(data.username)) {
		$("#messageArea").html('Invalid username or password'); 
		return; 
	}
	if(!passwordRegEx.test(data.password)) {
		$("#messageArea").html('Invalid username or password'); 
		return; 
	}


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
				$("#messageArea").html('Invalid username or password'); 
			} 
		}
	}); 

});

$("#register #mainButton").click(function(event) {

	var data = {}, confirm,
		usernameRegEx = /^[a-z0-9_-]{3,16}$/,
		passwordRegEx = /^[\u0020-\u007E]{8,256}$/;
	
	//load the data
	data.username = $("#register input[name=username]").val();
	data.password = $("#register input[name=password]").val();
	confirm = $("#register input[name=confirm]").val();
	data.postId = 'register'; 

	//clear the boxes 
	$("#register input[name=username]").val('');
	$("#register input[name=password]").val('');
	$("#register input[name=confirm]").val('');

	if(!usernameRegEx.test(data.username)) {
		$("#messageArea").html(
			"Invalid usermame: Use 3-16 charachters of letters, numbers, dashes and underscores" 
		); 
		return; 
	}
	
	if(!passwordRegEx.test(data.password)) {
		$("#messageArea").html(
			"Invalid password: Use 8-256 character of a-z A-Z 0-9 !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ and spaces"
		); 
		return; 
	}

	//do passwords match
	if(data.password === confirm) {
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