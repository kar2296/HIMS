(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceMasterExceluploadController', ServiceMasterExceluploadController);

    function ServiceMasterExceluploadController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};

        $scope.backtoDashboard = function () {
            $state.go('app.exceluploads');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.importservicemasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.itemUpload = function() {
            $scope.openModal(0,false);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 36, Value: true },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/serviceitem/GetServiceItems',
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
                action: 'clinicalmaster/serviceitem/DeleteServiceItem',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id,false);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ItemCode", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemcode.lbl') },
                { field: "Name", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemname.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.description.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.serviceitem-list.department.lbl') },
                { field: "ParentCategory.ServiceCategoryName", displayName: $translate.instant('clinicalmaster.serviceitem-list.category.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

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

    ServiceMasterExceluploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();