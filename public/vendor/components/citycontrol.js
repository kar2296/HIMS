(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('citycontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.citys = [];

			$scope.$watch('cvm.districtid',
			function(newValue, oldValue) {
				if (newValue) {
						cvm.searchCity();
					}
				});


			cvm.setCityInfo = function (cityinfo) {
				cvm.city = cityinfo.CityName;
				cvm.resetAddress();
			}

			cvm.resetAddress = function () {
				cvm.pincodeid = -1;
				cvm.pincode = '';
				cvm.area = '';
				cvm.areaid = -1;
			}

			cvm.searchCityCallback = function (scope, res, options, hasError) {
				var citylist = [];
				for (var idx in res.Data) {
					var item = res.Data[idx];
					var newitem = { Id: item.Id, Text: item.CityName, CityName: item.CityName };
					citylist.push(newitem);
				}
				cvm.citys = citylist;
			}
			cvm.searchCity = function () {

				var inputData = {
					Params: [{ Key: 5, Value: cvm.countryid },
					{ Key: 2, Value: cvm.stateid },
					{ Key: 3, Value: cvm.districtid }],
					PageContext: {
						PageSize: 1000,
						PageNumber: 1
					}
				};

				var options = {
					action: 'generalmaster/CityMaster/GetCityMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchCityCallback
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
		.component('citycontrol', {
			bindings: {
				pincode: "=",
				pincodeid: "=",
				city: "=",
				cityid: "=",
				stateid: "=",
				districtid: "=",
				candisable: "<"
			},
			controller: 'citycontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/citycontrol.html'
		})

})();