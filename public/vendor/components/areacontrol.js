(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('areacontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
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
					if (updates.hasOwnProperty('areaid')) cvm.areaid = updates.areaid;
					if (updates.hasOwnProperty('area')) cvm.area = updates.area;
					if (updates.hasOwnProperty('pincodeid') && cvm.hasOwnProperty('pincodeid')) cvm.pincodeid = updates.pincodeid;
					if (updates.hasOwnProperty('pincode') && cvm.hasOwnProperty('pincode')) cvm.pincode = updates.pincode;
				});
			};

			cvm.reactProps = {
				areaid: cvm.areaid,
				cityid: cvm.cityid,
				stateid: cvm.stateid,
				districtid: cvm.districtid,
				countryid: cvm.countryid,
				pincode: cvm.pincode,
				candisable: cvm.candisable,
				apiFetch: $scope.apiFetch,
				onUpdate: $scope.onUpdate
			};

			$scope.$watchGroup(['cvm.areaid', 'cvm.cityid', 'cvm.stateid', 'cvm.districtid', 'cvm.countryid', 'cvm.pincode', 'cvm.candisable'], function() {
				cvm.reactProps = {
					areaid: cvm.areaid,
					cityid: cvm.cityid,
					stateid: cvm.stateid,
					districtid: cvm.districtid,
					countryid: cvm.countryid,
					pincode: cvm.pincode,
					candisable: cvm.candisable,
					apiFetch: $scope.apiFetch,
					onUpdate: $scope.onUpdate
				};
			});
		}])
		.component('areacontrol', {
			bindings: {
				pincode: "=",
				pincodeid: "=",
				area: "=",
				areaid: "=",
				city: "=",
				cityid: "<",
				stateid: "<",
				state: "=",
				districtid: "<",
				district: "=",
				countryid: "<",
				country: "=",
				candisable: "<"
			},
			controller: 'areacontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/areacontrol.html'
		});
})();