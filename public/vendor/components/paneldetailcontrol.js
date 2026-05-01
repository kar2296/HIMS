(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('paneldetailcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.items = [];

			cvm.controlMap = {
				1: {
					LookupKey: 'ProcedureTests',
					LookupParams: {
						"Key": "ProcedureTests",
						Request: {
							Params: [{
								Key: 1,
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
				5: {
					LookupKey: 'Vital',
					LookupParams: {
						"Key": "Vital",
						Request: {
							Params: [{
								Key: 1,
								Value: ''
							}]
						}
					}
				}
			};

			cvm.setSelectedItemInfo = function (selectediteminfo) {
				cvm.selectediteminfo = selectediteminfo;

				$timeout(function () {
					cvm.changeev();
				}, 100);
			}

			cvm.searchItemCallback = function (scope, res, options, hasError) {
				var result = [];
				var lookupKey = cvm.controlMap[cvm.itemtypeid]["LookupKey"];
				var items = res[lookupKey];
				if (cvm.itemtypeid != 3 && cvm.itemtypeid != 1) {
					for (var idx in items) {
						var item = items[idx];
						var strCode = item.Code || '';
						var newitem = {
							Id: item.Id,
							Text: item.Text,
							Code: strCode
						};
						if (cvm.itemtypeid == 5 && newitem.Text.toLowerCase() == "bmi")
							continue;
						result.push(newitem);
					}
				} else if (cvm.itemtypeid == 1) {
					for (var idx in items) {
						var item = items[idx];
						var strCode = item.ShortCode || '';
						var newitem = {
							Id: item.Id,
							Text: item.Name || item.Text,
							Code: strCode,
							ServiceCategoryId: item.CategoryId
						};
						if (cvm.itemtypeid == 5 && newitem.Text.toLowerCase() == "bmi")
							continue;
						result.push(newitem);
					}
				} else if (cvm.itemtypeid == 3) {
					for (var idx in items) {
						var item = items[idx];
						var strCode = item.Code || '';
						var newitem = {
							Id: item.Id,
							Text: item.Text,
							Code: strCode,
							TestTypeId: item.TESTMASTERTYPId,
							IsDirectBill: item.IsDirectBill
						};
						if (cvm.itemtypeid == 5 && newitem.Text.toLowerCase() == "bmi")
							continue;
						result.push(newitem);
					}
				}
				cvm.items = result;

			};

			cvm.searchItem = function (query, isSearchByGenericId) {

				var canSearch = false;
				var inputData = [];
				if (query && query.length > 2) {
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
		.component('paneldetailcontrol', {
			bindings: {
				itemtypeid: "=",
				selectediteminfo: "=",
				changeev: "&"
			},
			controller: 'paneldetailcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/paneldetailcontrol.html'
		})

})();