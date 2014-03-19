
var app1 = angular.module('app1', ['ngRoute']); 


app1.controller('SimpleController', function ($scope){
	
	$scope.people = [ 			
		{name: 'Toby', job: 'Supervisor'}, 
		{name:'John', job:'Student Worker'},
		{name:'Jeremiah', job:'Student Worker'},
		{name:'Ryan', job:'Student Worker'},
		{name:'Fanrui', job:'Student Worker'},
		{name:'Cynthia', job:'Supervisor'},
		{name:'Joe', job:'Supervisor'}	
	];
	
	$scope.addPerson = function() {
		
		$scope.people.push({
			name: $scope.name,
			job: $scope.job
		}); 
	
	};
	
	$scope.deletePerson = function() {
		
		console.log('click!'); 
		
	};
	
	
}); 


app1.config(function ($routeProvider) {
	$routeProvider
		.when('/view1', 
			{
				controller: 'SimpleController',
				templateUrl: 'View1.html'
				
			})
		.when('/view2',
			{
				controller: 'SimpleController',
				templateUrl: 'View2.html'
			})
		.otherwise({redirectTo: '/view1' }); 
});


