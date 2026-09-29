(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('countrycontrolCtrl', ['utl', '$scope', '$timeout', '$attrs', function (utl, $scope, $timeout, $attrs) {
			var cvm = this;

			var hasAssignableAttr = function(attr) {
				if (!$attrs) return false;
				var val = $attrs[attr] || $attrs[attr.toLowerCase()];
				return typeof val === 'string' && val.trim().length > 0 && val !== 'undefined';
			};

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
					if (updates.hasOwnProperty('countryid') && hasAssignableAttr('countryid')) cvm.countryid = updates.countryid;
					if (updates.hasOwnProperty('country') && hasAssignableAttr('country')) cvm.country = updates.country;
					// reset downstream fields if requested by React
					if (updates.hasOwnProperty('stateid') && hasAssignableAttr('stateid')) cvm.stateid = updates.stateid;
					if (updates.hasOwnProperty('state') && hasAssignableAttr('state')) cvm.state = updates.state;
					if (updates.hasOwnProperty('districtid') && hasAssignableAttr('districtid')) cvm.districtid = updates.districtid;
					if (updates.hasOwnProperty('district') && hasAssignableAttr('district')) cvm.district = updates.district;
					if (updates.hasOwnProperty('cityid') && hasAssignableAttr('cityid')) cvm.cityid = updates.cityid;
					if (updates.hasOwnProperty('city') && hasAssignableAttr('city')) cvm.city = updates.city;
					if (updates.hasOwnProperty('area') && hasAssignableAttr('area')) cvm.area = updates.area;
					if (updates.hasOwnProperty('areaid') && hasAssignableAttr('areaid')) cvm.areaid = updates.areaid;
					if (updates.hasOwnProperty('pincodeid') && hasAssignableAttr('pincodeid')) cvm.pincodeid = updates.pincodeid;
					if (updates.hasOwnProperty('pincode') && hasAssignableAttr('pincode')) cvm.pincode = updates.pincode;
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
				countryid: "=?",
				country: "=?",
				candisable: "<?"
			},
			controller: 'countrycontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/countrycontrol.html'
		});
})();