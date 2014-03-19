var $messageBox = $("#messageBox textarea");
var $outputBox = $("#outputBox textarea"); 
var outputIndex = 0; 

var logOutput = function(output) {
	$outputBox.val($outputBox.val() + outputIndex + ' ' + output +'\n');
	outputIndex++; 
};


$("#mainButton").click(function(event) {

	var data = {};
	data.title ='messageBox';
	data.message = $messageBox.val(); 


	$.ajax({
		url: '', 
		type: 'POST',
	    data:  JSON.stringify(data),
	    contentType: 'application/json; charset=utf-8',
	    success: function (response) {
          logOutput(response.message);
        },
	}); 

});

$("#clearButton").click(function(event) {
	$outputBox.val(""); 
	outputIndex = 0; 	
});






/*
$( document ).ready(function() {

 
});
*/


/*$.post('', 'not 1337', 
	function(returnedData){
     	console.log(returnedData);
     });


$.ajax({
		url: '', 
		type: 'POST',
	    data:  JSON.stringify(data),
	    contentType: 'application/json; charset=utf-8',
	    success: function (response) {
            logOutput(response.from);
            logOutput(response.to);
            logOutput(response.message);
        },
	}); 

*/