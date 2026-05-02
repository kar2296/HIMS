(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietMultipleordersController', dietMultipleordersController);

    function dietMultipleordersController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            WardId: -1,
            fromdate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

         $scope.addNew = function () {
            utl.Modal.open('app.dietmultipleorder', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }
        $scope.getList = function () {

            var inputData = {
                Params: [
                  

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: '',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {field: "patientname", displayName: $translate.instant('dietmultipleorders.patientname.lbl'),},
                { field: "roomdetails", displayName: $translate.instant('dietmultipleorders.roomdetails.lbl'), },
                { field: "addeditems", displayName: $translate.instant('dietmultipleorders.addeditems.lbl'), },
                { field: "priority", displayName: $translate.instant('dietmultipleorders.priority.lbl'), },
                { field: "type", displayName: $translate.instant('dietmultipleorders.type.lbl'), },
                { field: "preference", displayName: $translate.instant('dietmultipleorders.preference.lbl'), },
                { field: "therabetictype", displayName: $translate.instant('dietmultipleorders.therabetictype.lbl'),},
                { field: "nbm", displayName: $translate.instant('dietmultipleorders.nbm.lbl'), },
                { field: "en", displayName: $translate.instant('dietmultipleorders.en.lbl') },
                { field: "tpn", displayName: $translate.instant('dietmultipleorders.tpn.lbl') },
                { field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

            vm.gridConfig.enableRowSelection = true;
            vm.gridConfig.enableFullRowSelection = true;
            vm.gridConfig.onRegisterApi = function(gridApi) {
                $scope.gridApi = gridApi;
            }

            function getSelectionRows() {
                var currentSelection = $scope.gridApi.selection.getSelectedRows();
                return currentSelection;
            };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                 { "Key": "Ward" }

            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
 
        $scope.initLookup();
    }

    dietMultipleordersController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();