(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('areacontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.areas = [];
			console.log(cvm);
			$scope.$watch('cvm.cityid',
			function(newValue, oldValue) {
					if (newValue) {
						cvm.searchArea();
					}
				});


			cvm.setAreaInfo = function (areainfo) {
				console.log(areainfo);
				cvm.area = areainfo.AreaName;
				cvm.resetAddress();
			}

			cvm.resetAddress = function () {
				cvm.pincodeid = -1;
				cvm.pincode = '';
			}

			cvm.searchAreaCallback = function (scope, res, options, hasError) {
				var arealist = [];
				for (var idx in res.Data) {
					var item = res.Data[idx];
					var newitem = { Id: item.Id, Text: item.Area, AreaName: item.Area };
					arealist.push(newitem);
				}
				cvm.areas = arealist;
			}
			cvm.searchArea = function () {
				if(cvm.pincode != 'freetext') {
				var inputData = {
					Params: [{ Key: 2, Value: cvm.countryid },
					{ Key: 3, Value: cvm.stateid },
					{ Key: 9, Value: cvm.districtid }, { Key: 4, Value: cvm.cityid }],
					PageContext: {
						PageSize: 1000,
						PageNumber: 1
					}
				};

				var options = {
					action: 'generalmaster/PincodeMaster/GetPincodeMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchAreaCallback
				};
				utl.Http.doAction(options);
			}}

			cvm.init = function () {
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('areacontrol', {
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
			controller: 'areacontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/areacontrol.html'
		})

})();