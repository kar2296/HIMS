(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('pincodecontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.pincodes = [];
			console.log(cvm.pincode);
			$scope.$watch('cvm.cityid',
				function (newValue) {
					if (newValue) {
						cvm.searchPincode();
					}
				});


			// cvm.setPincodeInfo = function (pincodeinfo) {
			// 	console.log(pincodeinfo);
			// 	cvm.pincode = pincodeinfo.PincodeName;
			// 	// cvm.resetAddress();
			// }
			cvm.setPincodeInfo = function (pincodeinfo) {
				cvm.pincodeinfo = pincodeinfo;
				cvm.pincode = cvm.pincodeinfo.Pincode;
				cvm.area = cvm.pincodeinfo.Area;
				cvm.areaid = cvm.pincodeinfo.Id;
				cvm.city = cvm.pincodeinfo.City;
				cvm.cityid = cvm.pincodeinfo.CityId;
				cvm.district = cvm.pincodeinfo.District;
				cvm.districtid = cvm.pincodeinfo.DistrictId;
				cvm.state = cvm.pincodeinfo.State;
				cvm.stateid = cvm.pincodeinfo.StateId;
				cvm.country = cvm.pincodeinfo.Country;
				cvm.countryid = cvm.pincodeinfo.CountryId;
			}
			// cvm.resetAddress = function () {
			// 	cvm.pincodeid = -1;
			// 	cvm.pincode = '';
			// }

			// cvm.searchPincodeCallback = function (scope, res, options, hasError) {
			// 	var pincodelist = [];
			// 	for (var idx in res.Data) {
			// 		var item = res.Data[idx];
			// 		var newitem = { Id: item.Id, Text: item.Pincode, PincodeName: item.Pincode };
			// 		pincodelist.push(newitem);
			// 	}
			// 	cvm.pincodes = pincodelist;
			// }
			cvm.searchPincodeCallback = function (scope, res, options, hasError) {
				cvm.pincodes.splice(0, res.Data.length);
				for (var idx in res.Data) {
					var item = res.Data[idx];
					var newitem = {
						Id: item.Id, Text: item.Pincode,
						Pincode: item.Pincode,
						Area: item.Area,
						AreaId: item.Id,
						CityId: item.CityId,
						City: item.CityMaster.CityName,
						DistrictId: item.DistrictId,
						District: item.DistrictMaster.DistrictName,
						StateId: item.StateId,
						State: item.StateMaster.StateName,
						CountryId: item.CountryId,
						Country: item.CountryMaster.CountryName
					};

					cvm.pincodes.push(newitem);
				}
				//var pincodeinfo = utl.Common.getItemByProp(pincodes, 'Id', cvm.pincodeid);
				//cvm.setPincodeInfo(pincodeinfo);
			};
			cvm.searchPincode = function () {
				if(cvm.pincode != 'freetext') {
					var inputData = {
						Params: [{ Key: 2, Value: cvm.countryid },
						{ Key: 3, Value: cvm.stateid },
						{ Key: 9, Value: cvm.districtid },
						{ Key: 4, Value: cvm.cityid }],
						PageContext: {
							PageSize: 1000,
							PageNumber: 1
						}
					};

					var options = {
						action: 'generalmaster/PincodeMaster/GetPincodeMasters',
						data: inputData,
						type: 'post',
						onComplete: cvm.searchPincodeCallback
					};
					utl.Http.doAction(options);
				}

			}

			cvm.init = function () {
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('pincodecontrol', {
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
			controller: 'pincodecontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/pincodecontrol.html'
		})

})();