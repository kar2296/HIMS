(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('districtcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;

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
					if (updates.hasOwnProperty('districtid')) cvm.districtid = updates.districtid;
					if (updates.hasOwnProperty('district')) cvm.district = updates.district;
					if (updates.hasOwnProperty('cityid') && cvm.hasOwnProperty('cityid')) cvm.cityid = updates.cityid;
					if (updates.hasOwnProperty('city') && cvm.hasOwnProperty('city')) cvm.city = updates.city;
					if (updates.hasOwnProperty('area') && cvm.hasOwnProperty('area')) cvm.area = updates.area;
					if (updates.hasOwnProperty('areaid') && cvm.hasOwnProperty('areaid')) cvm.areaid = updates.areaid;
					if (updates.hasOwnProperty('pincodeid') && cvm.hasOwnProperty('pincodeid')) cvm.pincodeid = updates.pincodeid;
					if (updates.hasOwnProperty('pincode') && cvm.hasOwnProperty('pincode')) cvm.pincode = updates.pincode;
				});
			};

			cvm.reactProps = {
				districtid: cvm.districtid,
				countryid: cvm.countryid,
				stateid: cvm.stateid,
				candisable: cvm.candisable,
				apiFetch: $scope.apiFetch,
				onUpdate: $scope.onUpdate
			};

			$scope.$watchGroup(['cvm.districtid', 'cvm.countryid', 'cvm.stateid', 'cvm.candisable'], function() {
				cvm.reactProps = {
					districtid: cvm.districtid,
					countryid: cvm.countryid,
					stateid: cvm.stateid,
					candisable: cvm.candisable,
					apiFetch: $scope.apiFetch,
					onUpdate: $scope.onUpdate
				};
			});
		}])
		.component('districtcontrol', {
			bindings: {
				pincode: "=",
				pincodeid: "=",
				district: "=",
				districtid: "=",
				area: "=",
				city: "=",
				cityid: "=",
				state: "=",
				stateid: "<",
				country: "=",
				countryid: "<",
				candisable: "<"
			},
			controller: 'districtcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/districtcontrol.html'
		});
})();