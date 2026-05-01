(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('favoritedetailcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.items = [];

			cvm.controlMap = {
				// 1: { LookupKey: 'Allergy', LookupParams: { "Key": "Allergy", Request: { Params: [{ Key: 1, Value: '' }] } } },
				// 2: { LookupKey: 'Immunization', LookupParams: { "Key": "Immunization", Request: { Params: [{ Key: 1, Value: '' }] } } },
				1: {
					LookupKey: 'Procedure',
					LookupParams: {
						"Key": "Procedure",
						Request: {
							Params: [{
								Key: 3,
								Value: ''
							}]
						}
					}
				},
				2: {
					LookupKey: 'Condition',
					LookupParams: {
						"Key": "Condition",
						Request: {
							Params: [{
								Key: 3,
								Value: ''
							}]
						}
					}
				},
				3: {
					LookupKey: 'TestMaster',
					LookupParams: {
						"Key": "TestMaster",
						Request: {
							Params: [{
								Key: 1,
								Value: ''
							}]
						}
					}
				},
				4: {
					LookupKey: 'Drug',
					LookupParams: {
						"Key": "Drug",
						Request: {
							Params: [{
								Key: 1,
								Value: ''
							}]
						}
					}
				},
				// 5: {
				// 	LookupKey: 'SocialType',
				// 	LookupParams: {
				// 		"Key": "SocialType"
				// 	}
				// },
				// 6: { LookupKey: 'Procedure', LookupParams: { "Key": "Procedure", Request: { Params: [{ Key: 3, Value: '' }] } } },
				// 7: { LookupKey: 'ChiefComplaint', LookupParams: { "Key": "ChiefComplaint", Request: { Params: [{ Key: 1, Value: '' }] } } },
				// 8: { LookupKey: 'EyeDiagnosis', LookupParams: { "Key": "EyeDiagnosis", Request: { Params: [{ Key: 3, Value: '' }] } } },
				// 9: { LookupKey: 'ExaminationSystem', LookupParams: { "Key": "ExaminationSystem", Request: { Params: [{ Key: 1, Value: '' }] } } },
				// 10: { LookupKey: 'SurgeryAdvice', LookupParams: { "Key": "SurgeryAdvice", Request: { Params: [{ Key: 1, Value: '' }] } } },
				// 11: { LookupKey: 'InjectionAdvice', LookupParams: { "Key": "InjectionAdvice", Request: { Params: [{ Key: 1, Value: '' }] } } },
				// 12: { LookupKey: 'LaserAdvice', LookupParams: { "Key": "LaserAdvice", Request: { Params: [{ Key: 1, Value: '' }] } } },
			};

			$scope.$watch('cvm.itemtypeid',
				function (newValue) {
					if (newValue) {
						cvm.items = [];
						cvm.itemid = null;
					}
				});


			cvm.setSelectedItemInfo = function (selectediteminfo) {
				cvm.selectediteminfo = selectediteminfo;

				/*
				$timeout(function() {
					cvm.changeev();
				}, 100);
				*/
			}

			cvm.searchItemCallback = function (scope, res, options, hasError) {
				var result = [];
				var lookupKey = cvm.controlMap[cvm.itemtypeid]["LookupKey"];
				var items = res[lookupKey];
				for (var idx in items) {
					var item = items[idx];
					var strCode = item.Code || '';
					var newitem = {
						Id: item.Id,
						Text: item.Text,
						Code: strCode
					};
					result.push(newitem);
				}
				cvm.items = result;
			};

			cvm.searchItem = function (query, isSearchByGenericId) {

				var canSearch = false;
				var inputData = [];
				if (cvm.itemtypeid == 5) { //Social history
					inputData = cvm.controlMap[cvm.itemtypeid].LookupParams;
					canSearch = true;
				} else if (query && query.length > 2) {
					inputData = cvm.controlMap[cvm.itemtypeid].LookupParams;
					inputData["Request"]["Params"][0]["Value"] = query;
					canSearch = true;
				}

				if (canSearch == true) {
					var options = {
						action: 'General/Options/getoptions',
						data: [inputData],
						type: 'post',
						onComplete: cvm.searchItemCallback
					};

					utl.Http.doAction(options);
				}
			}

			cvm.init = function () {
				//Init logic
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('favoritedetailcontrol', {
			bindings: {
				itemtypeid: "=",
				selectediteminfo: "=",
				changeev: "&"
			},
			controller: 'favoritedetailcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/favoritedetailcontrol.html'
		})

})();