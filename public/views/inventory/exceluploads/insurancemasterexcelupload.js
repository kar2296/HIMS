(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InsuranceMasterExceluploadController', InsuranceMasterExceluploadController);

    function InsuranceMasterExceluploadController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};

        $scope.openModal = function (Id) {
            utl.Modal.open('app.importinsurancemasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.itemUpload = function () {
            $scope.openModal(0, false);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 12, Value: true },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/guarantor/GetGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/guarantor/DeleteGuarantor',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id, false);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('generalmaster.guarantor-list.code.lbl') },
                { field: "GuarantorName", displayName: $translate.instant('generalmaster.guarantor-list.guarantorname.lbl') },
                { field: "GuarantorType.Description", displayName: $translate.instant('generalmaster.guarantor-list.type.lbl') },
                {
                    field: "ContractDate", displayName: $translate.instant('generalmaster.guarantor-list.contractdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.ContractDate'></ngformatdate>"
                },
                {
                    field: "ContractExpiryDate", displayName: $translate.instant('generalmaster.guarantor-list.expirydate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.ContractExpiryDate'></ngformatdate>"
                },
                // { field: "TPA.Description", displayName: $translate.instant('generalmaster.guarantor-list.tpa.lbl') },
                { field: "CreditLimit", displayName: $translate.instant('generalmaster.guarantor-list.creditlimit.lbl') },
                // { field: "AvailableLimit", displayName: $translate.instant('generalmaster.guarantor-list.availablelimit.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.guarantor-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                               </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.backtoDashboard = function () {
            $state.go('app.exceluploads');
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },]
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

    InsuranceMasterExceluploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();