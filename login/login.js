
//........................Log In Request...............
$("#logIn #mainButton").click(function(event) {
	var data = {}, 
		usernameRegEx = /^[a-z0-9_-]{3,16}$/,
		passwordRegEx = /^[\u0020-\u007E]{8,256}$/;
	
	//load the data
	data.username = $("#logIn input[name=username]").val().toLowerCase();
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
			if(res === 'user validated') {
				$("#messageArea").html('You are now logged in'); 
			}
			else if(res === 'invalid login'){
				$("#messageArea").html('Invalid username or password'); 
			} 
		}
	}); 

});


//.......................Registration Request.......................
$("#register #mainButton").click(function(event) {

	var data = {}, confirm,
		usernameRegEx = /^[a-z0-9_-]{3,16}$/,
		passwordRegEx = /^[\u0020-\u007E]{8,256}$/;
	
	//load the data
	data.username = $("#register input[name=username]").val().toLowerCase();
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
				if(res === 'user added') {
					$("#messageArea").html(data.username +' now registered'); 
				}
				else if(res === 'user taken') {
					$("#messageArea").html('User name already taken'); 
				}
			}
		}); 
	}
	else if(data.password !== confirm) {
		$("#messageArea").html("Passwords don't match"); 
	}
});