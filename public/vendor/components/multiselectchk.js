(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('multiselectchkCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;

			cvm.settings = {
				enableSearch: true, smartButtonMaxItems: 4,
				idProperty: 'Id', displayProp: 'Text',
				showCheckAll: false, showUncheckAll: false, scrollable: true
			};

			cvm.selectedArr = [];

			cvm.listEvents = {
				'onSelectionChanged': function () { // This event is not firing on selection of max limit
					var selectedIds = [];
					for (var idx in cvm.selectedArr) {
						var item = cvm.selectedArr[idx];
						selectedIds.push(item.Id);
					}
					cvm.selected = selectedIds.join();

					$timeout(function () {
						cvm.change();
					}, 100);
				}
			}

			$scope.$watch('cvm.selected',
				function (newValue, oldValue) {
					if (newValue) {
						if (cvm.selected) {
							var resultArr = [];
							var idArray = cvm.selected.split(",");
							for (var idx in idArray) {
								var id = parseInt(idArray[idx]);
								var item = { Id: id };
								resultArr.push(item);
							}
							cvm.selectedArr = resultArr;
						}
					}
				});

			cvm.init = function () {
				//Init logic
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('multiselectchk', {
			bindings: {
				selected: "=",
				list: "=",
				change: "&"
			},
			controller: 'multiselectchkCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/multiselectchk.html'
		})

})();