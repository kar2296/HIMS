(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('printcontrolCtrl', ['utl', '$scope', '$timeout', '$uibModal', '$translate', function (utl, $scope, $timeout, $uibModal, $translate) {
			var cvm = this;

			angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

			cvm.printaction = function () {
				cvm.withheader = cvm.WithHeader;
				cvm.withoutheader = cvm.WithoutHeader;
				$timeout(function () {
					if (cvm.printclick) {
						cvm.printclick();
					}
				}, 100);
			}
			if (cvm.withheader) {
				cvm.WithHeader = cvm.withheader;
			} else {
				cvm.WithHeader = false;
			}

			if (cvm.withoutheader) {
				cvm.WithoutHeader = cvm.withoutheader;
			} else {
				cvm.WithoutHeader = false;
			}

			cvm.proceedPrint = function (e) {
				if (!cvm.Comments) {
					utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
					return;
				}
				cvm.reason = cvm.Comments;
				cvm.withheader = cvm.WithHeader;
				cvm.withoutheader = cvm.WithoutHeader;
				cvm.closePrintModal();

				$timeout(function () {
					if (cvm.originalprintclick) {
						cvm.originalprintclick();
					}
				}, 100);
			}

			cvm.originalprintaction = function () {
				cvm.withheader = cvm.WithHeader;
				cvm.withoutheader = cvm.WithoutHeader;
				cvm.printModalInstance = $uibModal.open({
					templateUrl: 'printConfirmModal.html',
					size: 'md',
					scope: $scope
				});
			}

			cvm.closePrintModal = function () {
				cvm.printModalInstance.dismiss('cancel');
			}

			cvm.checkHeader = function (iVal) {
				if (iVal == 1) {
					cvm.WithoutHeader = false;
				}
				if (iVal == 2) {
					cvm.WithHeader = false;
				}
			};

			cvm.init = function () {

			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('printcontrol', {
			bindings: {
				printclick: "&",
				originalprintclick: "&",
				reason: "=",
				entity: "=",
				withheader: "=",
				withoutheader: "=",
				// checkHeader: "="
			},
			controller: 'printcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/printcontrol.html'
		})

})();