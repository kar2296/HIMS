(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('panelcontrolCtrl', ['utl', '$scope', '$timeout', 'uibButtonConfig', function (utl, $scope, $timeout, uibButtonConfig) {
			var cvm = this;

			uibButtonConfig.activeClass = "btn-success";

			cvm.list = [];
			cvm.listItemMap = {};
			cvm.listmodel = {};

			$scope.$watch('cvm.config.paneltypeid',
				function (newValue) {
					if (newValue) {
						cvm.getPanelMasters();
					}
				});

			//cvm.savePanels
			cvm.savePanels = function (iteminfo) {
				//console.log(cvm.listmodel);
				cvm.config.selectedlist = {};
				cvm.config.selectedlist = iteminfo;
				// for (var itemId in cvm.listmodel) {
				// 	var isselected = cvm.listmodel[itemId];
				// 	if (isselected == true) {
				// 		var panel = cvm.listItemMap[itemId];
				// 		cvm.config.selectedlist.push(panel);
				// 		cvm.listmodel[itemId] = false; //resetting the panel
				// 	}
				// }
				if (cvm.config.selectedlist) {
					cvm.saveclick();
				}
			}

			cvm.setItemInfo = function (iteminfo) {
				cvm.panelinfo = iteminfo;
				$timeout(function () {
					if (cvm.changeev) {
						cvm.changeev();
					}
				}, 100);
			}


			//get panel list
			cvm.getPanelMastersCallback = function (scope, res, options, hasError) {
				var result = [];
				result = [{
					Id: -1,
					Name: 'Please Select'
				}]
				for (var idx in res.Data) {
					var item = res.Data[idx];
					if (item.AccessibleTypeId == 1 && item.UserId == utl.Session.getCurrentUserId() &&
						item.DepartmentId == parseInt(utl.Session.getCurrentDepartmentId())) {
						result.push(item);
					} else if (item.AccessibleTypeId == 2) {
						result.push(item);
					}
				}
				cvm.list = result;
			}
			cvm.getPanelMasters = function () {

				var inputData = {
					Params: [{
							Key: 3,
							Value: cvm.config.paneltypeid
						},
						{
							Key: 4,
							Value: 2
						}
					],
					PageContext: {
						PageSize: 1000,
						PageNumber: 1
					}
				};

				var options = {
					action: 'clinicalmaster/TemplateMaster/GetTemplateMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.getPanelMastersCallback
				};
				utl.Http.doAction(options);
			}

			cvm.init = function () {}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('panelcontrol', {
			bindings: {
				config: "=",
				saveclick: "&",
				changeev: "&"
			},
			controller: 'panelcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/panelcontrol.html'
		})

})();