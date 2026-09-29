(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('citycontrolCtrl', ['utl', '$scope', '$timeout', '$attrs', function (utl, $scope, $timeout, $attrs) {
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
					if (updates.hasOwnProperty('cityid') && hasAssignableAttr('cityid')) cvm.cityid = updates.cityid;
					if (updates.hasOwnProperty('city') && hasAssignableAttr('city')) cvm.city = updates.city;
					if (updates.hasOwnProperty('pincodeid') && hasAssignableAttr('pincodeid')) cvm.pincodeid = updates.pincodeid;
					if (updates.hasOwnProperty('pincode') && hasAssignableAttr('pincode')) cvm.pincode = updates.pincode;
					if (updates.hasOwnProperty('area') && hasAssignableAttr('area')) cvm.area = updates.area;
					if (updates.hasOwnProperty('areaid') && hasAssignableAttr('areaid')) cvm.areaid = updates.areaid;
				});
			};

			cvm.reactProps = {
				cityid: cvm.cityid,
				countryid: cvm.countryid, // We need to add this binding below
				stateid: cvm.stateid,
				districtid: cvm.districtid,
				candisable: cvm.candisable,
				apiFetch: $scope.apiFetch,
				onUpdate: $scope.onUpdate
			};

			$scope.$watchGroup(['cvm.cityid', 'cvm.countryid', 'cvm.stateid', 'cvm.districtid', 'cvm.candisable'], function() {
				cvm.reactProps = {
					cityid: cvm.cityid,
					countryid: cvm.countryid,
					stateid: cvm.stateid,
					districtid: cvm.districtid,
					candisable: cvm.candisable,
					apiFetch: $scope.apiFetch,
					onUpdate: $scope.onUpdate
				};
			});
		}])
		.component('citycontrol', {
			bindings: {
				pincode: "=?",
				pincodeid: "=?",
				area: "=?",
				areaid: "=?",
				city: "=?",
				cityid: "=?",
				countryid: "<?",
				stateid: "<?",
				districtid: "<?",
				candisable: "<?"
			},
			controller: 'citycontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/citycontrol.html'
		});
})();