(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('districtcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.districts = [];

			$scope.$watch('cvm.stateid',
			function(newValue, oldValue) {
					if (newValue) {
						cvm.searchDistrict();
					}
				});


			cvm.setDistrictInfo = function (districtinfo) {
				cvm.district = districtinfo.DistrictName;
				cvm.resetAddress();
			}

			cvm.resetAddress = function () {
				cvm.pincodeid = -1;
				cvm.pincode = '';
				cvm.cityid = -1;
				cvm.city = '';
				cvm.area = '';
				cvm.areaid = -1;
			}

			cvm.searchDistrictCallback = function (scope, res, options, hasError) {
				var districtlist = [];
				for (var idx in res.Data) {
					var item = res.Data[idx];
					var newitem = { Id: item.Id, Text: item.DistrictName, DistrictName: item.DistrictName };
					districtlist.push(newitem);
				}
				cvm.districts = districtlist;
			}
			cvm.searchDistrict = function () {

				var inputData = {
					Params: [{ Key: 5, Value: cvm.countryid },
					{ Key: 2, Value: cvm.stateid }],
					PageContext: {
						PageSize: 1000,
						PageNumber: 1
					}
				};

				var options = {
					action: 'generalmaster/DistrictMaster/GetDistrictMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchDistrictCallback
				};
				utl.Http.doAction(options);
			}

			cvm.init = function () {
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
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
				stateid: "=",
				country: "=",
				countryid: "=",
				candisable: "<"
			},
			controller: 'districtcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/districtcontrol.html'
		})

})();