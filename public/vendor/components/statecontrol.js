(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('statecontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.states = [];

			$scope.$watch('cvm.countryid',
				function (newValue) {
					if (newValue) {
						console.log(newValue);
						cvm.searchState();
					}
				});

			cvm.resetAddress = function () {
				cvm.pincodeid = -1;
				cvm.pincode = '';
				cvm.cityid = -1;
				cvm.city = '';
				cvm.area = '';
				cvm.areaid = -1;
				cvm.districtid = -1;
				cvm.district = '';
			}

			cvm.setStateInfo = function (stateinfo) {
				cvm.state = stateinfo.StateName;
				cvm.resetAddress();
			}

			cvm.searchStateCallback = function (scope, res, options, hasError) {
				var statelist = [];
				for (var idx in res.Data) {
					var item = res.Data[idx];
					var newitem = { Id: item.Id, Text: item.StateName, StateName: item.StateName };
					statelist.push(newitem);
				}
				cvm.states = statelist;
			}
			cvm.searchState = function () {

				var inputData = {
					Params: [{ Key: 2, Value: cvm.countryid }],
					PageContext: {
						PageSize: 1000,
						PageNumber: 1
					}
				};

				var options = {
					action: 'generalmaster/StateMaster/GetStateMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchStateCallback
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
		.component('statecontrol', {
			bindings: {
				pincode: "=",
				pincodeid: "=",
				area: "=",
				city: "=",
				cityid: "=",
				state: "=",
				stateid: "=",
				country: "=",
				countryid: "=",
				district: "=",
				districtid: "=",
				candisable: "<"

			},
			controller: 'statecontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/statecontrol.html'
		})

})();