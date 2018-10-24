angular.module('starter.services',[])

.factory('firebaseData', function($firebase){
	const ref = new Firebase('https://expense-app-20348.firebaseio.com/'),
		  refMeta = new Firebase('https://expense-app-20348.firebaseio.com/metadata'),
		  refExpense = new Firebase('https://expense-app-20348.firebaseio.com/expense'),
		  refIncome = new Firebase('https://expense-app-20348.firebaseio.com/income'),
		  refUser = new Firebase('https://expense-app-20348.firebaseio.com/users');

	return {
		ref: function(){
			return ref;
		},
		refMeta: function(){
			return refMeta;
		},
		refExpense: function(){
			return refExpense;
		},
		refIncome: function(){
			return refIncome;
		},
		refUser: function(){
			return refUser;
		}
	}
});