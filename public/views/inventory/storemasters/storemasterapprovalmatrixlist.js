(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storemasterApprovalMatrixListController', storemasterApprovalMatrixListController);

    function storemasterApprovalMatrixListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };
        var storemasterid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 3, Value: storemasterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/storeapprovalmatrix/GetStoreApprovalMatrix',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.storemastertab.storemasterapprovalmatrix', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
        $scope.addNew = function () {
             $scope.openModal(0);
           // $state.go('app.storemastertab.storemasterapprovalmatrix', { storeapprovalmatrixid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/storeapprovalmatrix/DeleteStoreApprovalMatrix',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id)
               // $state.go('app.storemastertab.storemasterapprovalmatrix', { storeapprovalmatrixid: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "PoType.Description", displayName: $translate.instant('inventory.storeapprovalmatrix.potype.lbl') },
                { field: "PoStatus.Description", displayName: $translate.instant('inventory.storeapprovalmatrix.status.lbl') },
                //{ field: "User.UserName", displayName: $translate.instant('inventory.storeapprovalmatrix.username.lbl') },
                {
                    field: "User", displayName: $translate.instant('inventory.storeapprovalmatrix.username.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span ng-click="grid.appScope.handleEvents(\'userinfo\',entity)">'
                    + "<span >{{entity.User.Title.Description}}&nbsp;</span>"
                    + "<span >{{entity.User.FirstName}}&nbsp;</span>"
                    + "<span >{{entity.User.LastName}}&nbsp;</span>"
                    + "</span></div>"
                },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.storeapprovalmatrix.storename.lbl') },
                { field: "MinPoValue", displayName: $translate.instant('inventory.storeapprovalmatrix.minpovalue.lbl') },
                { field: "MaxPoValue", displayName: $translate.instant('inventory.storeapprovalmatrix.maxpovalue.lbl') },
                { field: "ActiveFrom", displayName: $translate.instant('inventory.storeapprovalmatrix.activefrom.lbl'), cellTemplate: "<ngformatdate date-val='entity.ActiveFrom'></ngformatdate>" },
                { field: "ActiveTo", displayName: $translate.instant('inventory.storeapprovalmatrix.activeto.lbl'), cellTemplate: "<ngformatdate date-val='entity.ActiveTo'></ngformatdate>" },
                { field: "IsFinalApprover", displayName: $translate.instant('inventory.storeapprovalmatrix.isfinalapprover.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
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
                { "Key": "Facility" },
                { "Key": "UserType" },
                { "Key": "User" },
                { "Key": "RequestType" },
                { "Key": "PoType" },
                { "Key": "PoStatus" }
            ]
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

    storemasterApprovalMatrixListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();