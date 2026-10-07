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
            $scope.refreshReactProps();
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
            $scope.refreshReactProps();
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                rows: vm.gridConfig.data
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'statusChange':
                    $scope.currentfilter.ActiveStatusId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'addNew':
                    $scope.addNew();
                    break;
                case 'edit':
                    $scope.handleEvents('edit', payload);
                    break;
                case 'delete':
                    $scope.handleEvents('delete', payload);
                    break;
            }
            $scope.$applyAsync();
        };

        // ------------------------------------------------------------------
        // Show only the answer to the latest list request (new code; getList and
        // getListCallback above are unchanged). Changing filters quickly sends several
        // requests; an older answer that arrived last used to replace the newer one, so the
        // table showed results for a filter that was no longer selected. Each request now
        // carries a number and answers to older requests are ignored.
        // ------------------------------------------------------------------
        var latestListRequest = 0;
        var latestOnlyGetList = $scope.getList;
        $scope.getList = function () {
            var requestNo = ++latestListRequest;
            var originalDoAction = utl.Http.doAction;
            utl.Http.doAction = function (options) {
                if (options) {
                    options.listRequestNo = requestNo;
                }
                return originalDoAction.apply(this, arguments);
            };
            try {
                return latestOnlyGetList.apply(this, arguments);
            } finally {
                utl.Http.doAction = originalDoAction;
            }
        };
        var latestOnlyGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, data, options, hasError) {
            if (options && options.listRequestNo !== undefined && options.listRequestNo !== latestListRequest) {
                return; // answer to an older request
            }
            return latestOnlyGetListCallback.apply(this, arguments);
        };


        // ------------------------------------------------------------------
        // Delete (new function; onDeleteConfirmed above is left as it was). The original
        // called generalmaster/GuarantorPromotionalScheme/DeleteGuarantorPromotionalScheme,
        // which does not exist in the API, so deleting a Draft scheme always failed. The API's
        // own delete for promotional schemes is billing/PromotionalScheme/DeletePromotionalScheme
        // (marks the scheme as deleted). handleEvents('delete') looks up
        // $scope.onDeleteConfirmed when the confirmation is answered, so pointing it at the new
        // function is enough.
        // ------------------------------------------------------------------
        $scope.deletePromotionalScheme = function (deleteId) {
            utl.Http.doAction({
                action: 'billing/PromotionalScheme/DeletePromotionalScheme',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            });
        };
        $scope.onDeleteConfirmed = $scope.deletePromotionalScheme;

        // ------------------------------------------------------------------
        // Status filter starts from page 1 (new code; handleReactAction above is unchanged).
        // Changing the status while on page 2 or later used to keep that page number, so a
        // status with fewer schemes showed an empty table even though it had records.
        // ------------------------------------------------------------------
        var pageResetHandleReactAction = $scope.handleReactAction;
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'statusChange') {
                vm.gridConfig.pagerObj.currentPage = 1;
            }
            return pageResetHandleReactAction.apply(this, arguments);
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    promotionalSchemeListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();