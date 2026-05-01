(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('ticksheetitemcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.items = [];

			cvm.controlMap = {
				1: {
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
				2: {
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
				3: {
					LookupKey: 'DietItemMaster',
					LookupParams: {
						"Key": "DietItemMaster",
						Request: {
							Params: [{
								Key: 4,
								Value: ''
							}]
						}
					}
				},
				4: {
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
				}

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

				$timeout(function () {
					cvm.changeev();
				}, 100);
			}

			cvm.searchItemCallback = function (scope, res, options, hasError) {
				var result = [];
				var lookupKey = cvm.controlMap[cvm.itemtypeid]["LookupKey"];
				var items = res[lookupKey];
				if (cvm.itemtypeid != 2 && cvm.itemtypeid != 4) {
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
				} else if (cvm.itemtypeid == 2) {
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
						result.push(newitem);
					}
				} else if (cvm.itemtypeid == 4) {
					for (var idx in items) {
						var item = items[idx];
						var strCode = item.ShortCode || '';
						var newitem = {
							Id: item.Id,
							Text: item.Name || item.Text,
							Code: strCode,
							ServiceCategoryId: item.CategoryId
						};
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
		.component('ticksheetitemcontrol', {
			bindings: {
				itemtypeid: "=",
				selectediteminfo: "=",
				changeev: "&"
			},
			controller: 'ticksheetitemcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/ticksheetitemcontrol.html'
		})

})();