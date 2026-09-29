(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('printcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;

			angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

            cvm.refreshReactProps = function () {
                cvm.reactPropsContainer = {
                    onAction: cvm.handleReactAction,
                    reactProps: {
                        withHeader: !!cvm.withheader,
                        withoutHeader: !!cvm.withoutheader,
                        privileges: {
                            canOriginalPrint: cvm.HasAccess ? cvm.HasAccess(cvm.entity, 'ORIGINAL_PRINT') : true
                        }
                    }
                };
            };

            cvm.handleReactAction = function (actionName, payload) {
                if (actionName === 'previewPrint') {
                    $timeout(function () {
                        if (cvm.printclick) cvm.printclick();
                    }, 0);
                } else if (actionName === 'originalPrint') {
                    cvm.reason = payload.reason;
                    $timeout(function () {
                        if (cvm.originalprintclick) cvm.originalprintclick();
                    }, 0);
                } else if (actionName === 'setHeader') {
                    cvm.withheader = payload.withHeader;
                    cvm.withoutheader = payload.withoutHeader;
                    cvm.refreshReactProps();
                    // trigger digest to propagate 2-way binding up to parent
                    $timeout(function() {}, 0);
                }
            };

			cvm.init = function () {
                cvm.refreshReactProps();
			};

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			};

            // Watch for external binding changes to sync down to React
            $scope.$watchGroup([
                function() { return cvm.withheader; },
                function() { return cvm.withoutheader; },
                function() { return cvm.entity; }
            ], function() {
                cvm.refreshReactProps();
            });

		}])
		.component('printcontrol', {
			bindings: {
				printclick: "&",
				originalprintclick: "&",
				reason: "=?",
				entity: "=?",
				withheader: "=?",
				withoutheader: "=?",
			},
			controller: 'printcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/printcontrol.html'
		});

})();