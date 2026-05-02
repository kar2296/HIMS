(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('promotionalSchemeListController', promotionalSchemeListController);

    function promotionalSchemeListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {};
        $scope.currentfilter = {};
        $scope.currentcontext = {};
        // $scope.currentcontext.guarantorid = parseInt($stateParams.gid);
        $scope.currentfilter.ActiveStatusId = 2;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // if ($scope.currentcontext.guarantorid > 0) {
                var inputData = {
                    Params: [
                        // { Key: 1, Value: $scope.currentcontext.guarantorid },
                        { Key: 2, Value: $scope.currentfilter.ActiveStatusId }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'billing/PromotionalScheme/GetPromotionalSchemesWithoutDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            // }
        };

        $scope.addNew = function () {
            $state.go('app.promotionalschemeform', {
                id: 0
            });
        };

        $scope.backToForm = function () {
            $state.go('app.guarantors');
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/GuarantorPromotionalScheme/DeleteGuarantorPromotionalScheme',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.openFixedDialog('app.guarantortab.guarantorpromotionalscheme-form', {
                params: { id: Id },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.promotionalschemeform', {
                    id: entity.Id
                });
                //$scope.openModal('app.guarantortab.guarantorpromotionalschemes', { gid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "PromotionSchemeCode", displayName: $translate.instant('Scheme Code') },
                { field: "PromotionSchemeName", displayName: $translate.instant('Scheme Name') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('Status') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
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
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PromotionSchemeType" },
                { "Key": "ActiveStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    promotionalSchemeListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();