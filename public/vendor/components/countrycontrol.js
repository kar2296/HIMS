(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('countrycontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.countrys = [];

			cvm.resetAddress = function () {
				cvm.pincodeid = -1;
				cvm.pincode = '';
				cvm.stateid = -1;
				cvm.state = '';
				cvm.districtid = -1;
				cvm.district = '';
				cvm.cityid = -1;
				cvm.city = '';
				cvm.area = '';
				cvm.areaid = -1;
			}

			cvm.setCountryInfo = function (countryinfo) {
				cvm.country = countryinfo.CountryName;
				cvm.resetAddress();
			}

			cvm.searchCountryCallback = function (scope, res, options, hasError) {
				var countryslist = [];
				for (var idx in res.Data) {
					var item = res.Data[idx];
					var newitem = { Id: item.Id, Text: item.CountryName, CountryName: item.CountryName };
					countryslist.push(newitem);
				}
				cvm.countrys = countryslist;
			}
			cvm.searchCountry = function () {
				var inputData = {
					Params: [],
					PageContext: {
						PageSize: 25,
						PageNumber: 1
					}
				};

				var options = {
					action: 'generalmaster/CountryMaster/GetCountryMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchCountryCallback
				};
				utl.Http.doAction(options);
			}

			cvm.init = function () {
				cvm.searchCountry();
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
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
		})

})();