(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('agedisplayCtrl', ['$scope', function ($scope) {
			var cvm = this;

			cvm.reactProps = {
				dob: cvm.dob
			};

			$scope.$watch('cvm.dob', function(newVal) {
				cvm.reactProps = {
					dob: newVal
				};
			});
		}])
		.component('agedisplay', {
			bindings: {
				dob: "<"
			},
			controller: 'agedisplayCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/agedisplay.html'
		});
})();