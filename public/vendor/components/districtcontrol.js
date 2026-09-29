(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('districtcontrolCtrl', ['utl', '$scope', '$timeout', '$attrs', function (utl, $scope, $timeout, $attrs) {
			var cvm = this;

			var hasAssignableAttr = function(attr) {
				if (!$attrs) return false;
				var val = $attrs[attr] || $attrs[attr.toLowerCase()];
				return typeof val === 'string' && val.trim().length > 0 && val !== 'undefined';
			};

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
				pincode: "=?",
				pincodeid: "=?",
				district: "=?",
				districtid: "=?",
				area: "=?",
				areaid: "=?",
				city: "=?",
				cityid: "=?",
				state: "=?",
				stateid: "<?",
				country: "=?",
				countryid: "<?",
				candisable: "<?"
			},
			controller: 'districtcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/districtcontrol.html'
		});
})();