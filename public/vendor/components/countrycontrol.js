(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('countrycontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;

			// Proxy fetch calls through AngularJS utl.Http
			$scope.apiFetch = function(action, payload) {
				return new Promise(function(resolve, reject) {
					var options = {
						action: action,
						data: payload,
						type: 'post',
						onComplete: function(scope, res) {
							resolve(res);
						},
						onError: function(err) {
							reject(err);
						}
					};
					utl.Http.doAction(options);
				});
			};

			$scope.onUpdate = function(updates) {
				$timeout(function() {
					if (updates.hasOwnProperty('countryid')) cvm.countryid = updates.countryid;
					if (updates.hasOwnProperty('country')) cvm.country = updates.country;
					// reset downstream fields if requested by React
					if (updates.hasOwnProperty('stateid') && cvm.hasOwnProperty('stateid')) cvm.stateid = updates.stateid;
					if (updates.hasOwnProperty('state') && cvm.hasOwnProperty('state')) cvm.state = updates.state;
					if (updates.hasOwnProperty('districtid') && cvm.hasOwnProperty('districtid')) cvm.districtid = updates.districtid;
					if (updates.hasOwnProperty('district') && cvm.hasOwnProperty('district')) cvm.district = updates.district;
					if (updates.hasOwnProperty('cityid') && cvm.hasOwnProperty('cityid')) cvm.cityid = updates.cityid;
					if (updates.hasOwnProperty('city') && cvm.hasOwnProperty('city')) cvm.city = updates.city;
					if (updates.hasOwnProperty('area') && cvm.hasOwnProperty('area')) cvm.area = updates.area;
					if (updates.hasOwnProperty('areaid') && cvm.hasOwnProperty('areaid')) cvm.areaid = updates.areaid;
					if (updates.hasOwnProperty('pincodeid') && cvm.hasOwnProperty('pincodeid')) cvm.pincodeid = updates.pincodeid;
					if (updates.hasOwnProperty('pincode') && cvm.hasOwnProperty('pincode')) cvm.pincode = updates.pincode;
				});
			};

			cvm.reactProps = {
				countryid: cvm.countryid,
				candisable: cvm.candisable,
				apiFetch: $scope.apiFetch,
				onUpdate: $scope.onUpdate
			};

			$scope.$watchGroup(['cvm.countryid', 'cvm.candisable'], function() {
				cvm.reactProps = {
					countryid: cvm.countryid,
					candisable: cvm.candisable,
					apiFetch: $scope.apiFetch,
					onUpdate: $scope.onUpdate
				};
			});
		}])
		.component('countrycontrol', {
			bindings: {
				countryid: "=",
				country: "=",
				candisable: "<"
			},
			controller: 'countrycontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/countrycontrol.html'
		});
})();