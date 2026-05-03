(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('pincodecontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
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
					if (updates.hasOwnProperty('pincodeid')) cvm.pincodeid = updates.pincodeid;
					if (updates.hasOwnProperty('pincode')) cvm.pincode = updates.pincode;
					if (updates.hasOwnProperty('area')) cvm.area = updates.area;
					if (updates.hasOwnProperty('areaid')) cvm.areaid = updates.areaid;
					if (updates.hasOwnProperty('city')) cvm.city = updates.city;
					if (updates.hasOwnProperty('cityid')) cvm.cityid = updates.cityid;
					if (updates.hasOwnProperty('district')) cvm.district = updates.district;
					if (updates.hasOwnProperty('districtid')) cvm.districtid = updates.districtid;
					if (updates.hasOwnProperty('state')) cvm.state = updates.state;
					if (updates.hasOwnProperty('stateid')) cvm.stateid = updates.stateid;
					if (updates.hasOwnProperty('country')) cvm.country = updates.country;
					if (updates.hasOwnProperty('countryid')) cvm.countryid = updates.countryid;
				});
			};

			cvm.reactProps = {
				pincodeid: cvm.pincodeid,
				pincode: cvm.pincode,
				cityid: cvm.cityid,
				stateid: cvm.stateid,
				districtid: cvm.districtid,
				countryid: cvm.countryid,
				candisable: cvm.candisable,
				apiFetch: $scope.apiFetch,
				onUpdate: $scope.onUpdate
			};

			$scope.$watchGroup(['cvm.cityid', 'cvm.stateid', 'cvm.districtid', 'cvm.countryid', 'cvm.candisable', 'cvm.pincodeid', 'cvm.pincode'], function() {
				cvm.reactProps = {
					pincodeid: cvm.pincodeid,
					pincode: cvm.pincode,
					cityid: cvm.cityid,
					stateid: cvm.stateid,
					districtid: cvm.districtid,
					countryid: cvm.countryid,
					candisable: cvm.candisable,
					apiFetch: $scope.apiFetch,
					onUpdate: $scope.onUpdate
				};
			});
		}])
		.component('pincodecontrol', {
			bindings: {
				pincode: "=",
				pincodeid: "=",
				area: "=",
				areaid: "=",
				city: "=",
				cityid: "=",
				stateid: "=",
				state: "=",
				districtid: "=",
				district: "=",
				countryid: "=",
				country: "=",
				candisable: "<"
			},
			controller: 'pincodecontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/pincodecontrol.html'
		});
})();