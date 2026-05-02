(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('carepathclinicalordersListController', carepathclinicalordersListController);

    function carepathclinicalordersListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };

        $scope.currentcontext = {};
        $scope.currentcontext.carepathid = parseInt($stateParams.id);
        // 13-02-17
        $scope.backToForm = function () {
            $state.go('app.carepathtab.details');
        }
        // 13-02-17
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.carepathid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/CarePathClinicalOrder/GetCarePathClinicalOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function () {
        //     $state.go('app.carepathtab.carepathclinicalorder', { carepathclinicalorderid: 0 });
        // }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.carepathtab.carepathclinicalorder', {
                params: { id: Id }, confirmCallback: $scope.getList
            })
        };
        $scope.addNew = function () {
            $scope.openModal(0);
        };
        $scope.backToList = function () {
            $state.go('app.carepaths', { id: 0 });
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/CarePathClinicalOrder/DeleteCarePathClinicalOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                // $state.go('app.carepathtab.carepathclinicalorder', { carepathclinicalorderid: row.entity.Id });

                $scope.openModal(row.entity.Id)
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "TESTMASTERTYP.Description", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.type.lbl') },
                { field: "Testmaster.Name", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.testname.lbl') },
                { field: "LoginCode", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.logincode.lbl') },
                { field: "Quantity", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.quantity.lbl') },
                { field: "Days", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.days.lbl') },
                { field: "IsManditory", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.ismanditory.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [

                { "Key": "ActiveStatus" }
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

    carepathclinicalordersListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();