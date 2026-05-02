(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorcardlistController', guarantorcardlistController);

    function guarantorcardlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentfilter = {

        };







        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.id = parseInt($stateParams.id);
//$scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
       // $scope.currentcontext.pid = isMainContext() ? 0 : parseInt(utl.Session.getEMRPatientId());
        // if ($stateParams.tp) {
        //     $scope.currentfilter.TestTypeId = $stateParams.tp;
        // }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {


            var inputData = {
                Params: [
                    // { Key: 5, Value: $scope.currentcontext.guarantorid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/CardMaster/GetCardMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };








        function getDetailsForOrder() {
            var inputArr = [];
            var selectedRows = getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }

        $scope.excuteorderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.guarantor = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
 messageKey: 'generalmaster.guarantor-form.save.lbl',

                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.ExcutedOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.ExcutedOrder = function () {

            var inputData = { Header: $scope.inputArr };
            var inputArr = getDetailsForExcute(true);
            var options = {
                action: 'generalmaster/GuarantorCardType/AddGuarantorCardType',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.excuteorderCallback
            };
            utl.Http.doAction(options);

        };
        function getDetailsForExcute() {
            var inputArr = [];
            var selectedRows = getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }


//var rowtpl = '<div ng-class="{\'priority\':row.entity.OrderPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.cardmaster-list.facility.lbl') },
                { field: "CardMasterType.Description", displayName: $translate.instant('generalmaster.cardmaster-list.type.lbl') },
                { field: "Code", displayName: $translate.instant('generalmaster.cardmaster-list.code.lbl') },
                { field: "CardName", displayName: $translate.instant('generalmaster.cardmaster-list.cardname.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.cardmaster-list.status.lbl') },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.currentfilter.Id = row.entity.Id, row.entity.PatientId;
            });
        };
        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
//initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "CardMasterType" },
                { "Key": "ActiveStatus" }];

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

    guarantorcardlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();