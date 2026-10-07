(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('privilegecardListController', privilegecardListController);

    function privilegecardListController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ActiveStatusId: 2,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function(pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.CardTypeId },
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/PrivilegeCard/GetPrivilegeCards',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function() {
            $state.go('app.facilityitemmastertab.facilityitemmaster');
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'billing/PrivilegeCard/DeletePrivilegeCard',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backtoList = function() {
            $state.go('app.frontdashboard');
        };
        $scope.addNew = function() {
            $state.go('app.privilegecardregistration', {
                id: 0
            });
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'view') {
                $state.go('app.privilegecardregistration', {
                    id: entity.Id,
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.UserName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                { field: "PromotionSchemeType.Description", displayName: $translate.instant('Scheme Type') },
                {
                    field: "ValidTo",
                    displayName: $translate.instant('Eligibile Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ValidTo | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "</div>"
                },
                { field: "CardNo", displayName: $translate.instant('Card#') },
                {
                    field: "PromotionSchemeName",
                    displayName: $translate.instant('PromtionalScheme Name')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                  <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                    \</div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "PromotionSchemeType" },
                { "Key": "SchemeType" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                rows: vm.gridConfig.data
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'membershipNumberChange':
                    $scope.currentfilter.MembershipNumber = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'fromDateChange':
                    $scope.currentfilter.FromDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'toDateChange':
                    $scope.currentfilter.ToDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'cardTypeChange':
                    $scope.currentfilter.CardTypeId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'fetch':
                    $scope.getList();
                    break;
                case 'addNew':
                    $scope.addNew();
                    break;
                case 'view':
                    $scope.handleEvents('view', payload);
                    break;
                case 'delete':
                    $scope.handleEvents('delete', payload);
                    break;
            }
            $scope.$applyAsync();
        };

        // ------------------------------------------------------------------
        // Fixes for the privilege card list (new code only; the functions above are not
        // changed).
        //
        // 1. Card# search: the search box at the top was bound to currentfilter.MembershipNumber
        //    but getList() never sent it, so typing and pressing Enter returned the same list.
        //    When the box has text it is now sent as the API's CardNo filter (Key 7, "contains").
        //    With the box empty the request is exactly the same as before.
        // 2. Latest answer only: changing dates or scheme type quickly sends several requests;
        //    an older answer that arrived last used to replace the newer one, so the table showed
        //    cards for filters that were no longer selected. Older answers are now ignored.
        // 3. Filters start from page 1: changing a filter while on page 2 or later kept that
        //    page number, so a smaller result showed an empty table.
        // 4. Dates: the date box gives "yyyy-MM-dd", which new Date() reads as UTC midnight
        //    (the previous day in time zones behind UTC). It is now read as a local date.
        // ------------------------------------------------------------------
        // 5. Screen not updating: the React bridge only re-renders when the props look
        //    different, and it compares a shallow copy, so a change inside currentfilter
        //    (a date, the scheme type, the search text) was never shown on screen. React
        //    now gets a fresh copy of the filter each time, so every change is shown.
        var pcOriginalRefreshReactProps = $scope.refreshReactProps;
        $scope.refreshReactProps = function () {
            pcOriginalRefreshReactProps.apply(this, arguments);
            $scope.reactProps.currentfilter = angular.extend({}, $scope.currentfilter);
        };

        var pcListRequestNo = 0;
        var pcOriginalGetList = $scope.getList;
        $scope.getList = function () {
            var requestNo = ++pcListRequestNo;
            var cardNo = ($scope.currentfilter.MembershipNumber || '').toString().trim();
            var originalDoAction = utl.Http.doAction;
            utl.Http.doAction = function (options) {
                if (options) {
                    options.listRequestNo = requestNo;
                    if (cardNo && options.data && angular.isArray(options.data.Params)) {
                        options.data.Params.push({ Key: 7, Value: cardNo }); // PrivilegeCardFilters.CardNo
                    }
                }
                return originalDoAction.apply(this, arguments);
            };
            try {
                return pcOriginalGetList.apply(this, arguments);
            } finally {
                utl.Http.doAction = originalDoAction;
            }
        };

        var pcOriginalGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (options && options.listRequestNo !== undefined && options.listRequestNo !== pcListRequestNo) {
                return; // answer to an older request
            }
            return pcOriginalGetListCallback.apply(this, arguments);
        };

        // "yyyy-MM-dd" -> Date at local midnight (null when empty or invalid).
        function pcParseInputDate(value) {
            if (!value) {
                return null;
            }
            var parts = String(value).split('-');
            if (parts.length !== 3) {
                return null;
            }
            var date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return isNaN(date.getTime()) ? null : date;
        }

        var pcOriginalHandleReactAction = $scope.handleReactAction;
        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'fromDateChange':
                case 'toDateChange':
                    vm.gridConfig.pagerObj.currentPage = 1;
                    $scope.currentfilter[actionName === 'fromDateChange' ? 'FromDate' : 'ToDate'] =
                        pcParseInputDate(payload && payload.value);
                    $scope.refreshReactProps();
                    $scope.getList();
                    $scope.$applyAsync();
                    return;
                case 'cardTypeChange':
                case 'fetch':
                    vm.gridConfig.pagerObj.currentPage = 1;
                    break;
            }
            var result = pcOriginalHandleReactAction.apply(this, arguments);
            if (actionName === 'fetch') {
                $scope.refreshReactProps(); // the original 'fetch' case does not refresh
            }
            return result;
        };

        // ------------------------------------------------------------------
        // Pagination, loading state and empty-page handling (new code only; the functions above
        // are not changed).
        // 6. Pagination now lives in the React screen (the old uib-pagination footer is removed
        //    from privilegecardlist.html); it calls the same getList() with the chosen page.
        // 7. A loading message is shown while the list is being fetched and "No records" when
        //    nothing matches; a failed request clears the loading state and shows the error.
        // 8. Deleting the last card on the last page moves back one page instead of showing an
        //    empty table.
        // ------------------------------------------------------------------
        var pcLoading = false;
        var pcLoadingTimer = null;
        var pcOuterRequestNo = 0;

        function pcSetLoading(loading) {
            pcLoading = loading;
            if (pcLoadingTimer) {
                clearTimeout(pcLoadingTimer);
                pcLoadingTimer = null;
            }
            if (loading) {
                // Safety net: a request that fails without a response calls no callback.
                pcLoadingTimer = setTimeout(function () {
                    $scope.$evalAsync(function () { pcSetLoading(false); $scope.refreshReactProps(); });
                }, 60000);
            }
        }

        var pcPagerRefreshReactProps = $scope.refreshReactProps;
        $scope.refreshReactProps = function () {
            pcPagerRefreshReactProps.apply(this, arguments);
            var pager = vm.gridConfig.pagerObj;
            $scope.reactProps.pager = {
                totalItems: pager.totalItems || 0,
                currentPage: pager.currentPage || 1,
                pageSize: pager.pageSize || 25
            };
            $scope.reactProps.loading = pcLoading;
        };

        // Called by the HTTP helper when the list request fails. With onError set the helper no
        // longer shows the message for an error code itself, so it is shown here.
        function pcListError(data, options) {
            $scope.$evalAsync(function () {
                if (options && options.pcOuterRequestNo !== pcOuterRequestNo) {
                    return; // failure of an older request
                }
                pcSetLoading(false);
                $scope.refreshReactProps();
                if (data && data.Error && data.Error.Code) {
                    utl.Alert.showErrorMsg($translate.instant('common.errors.' + data.Error.Code + '.lbl'));
                }
            });
        }

        var pcLoadingGetList = $scope.getList;
        $scope.getList = function () {
            var requestNo = ++pcOuterRequestNo;
            pcSetLoading(true);
            var originalDoAction = utl.Http.doAction;
            utl.Http.doAction = function (options) {
                if (options) {
                    options.pcOuterRequestNo = requestNo;
                    options.onError = pcListError;
                }
                return originalDoAction.apply(this, arguments);
            };
            try {
                return pcLoadingGetList.apply(this, arguments);
            } finally {
                utl.Http.doAction = originalDoAction;
                $scope.refreshReactProps();
            }
        };

        var pcLoadingGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (options && options.pcOuterRequestNo !== undefined && options.pcOuterRequestNo !== pcOuterRequestNo) {
                return; // answer to an older request
            }
            pcSetLoading(false);
            var result = pcLoadingGetListCallback.apply(this, arguments);
            var pager = vm.gridConfig.pagerObj;
            var total = pager.totalItems || 0;
            var lastPage = Math.max(1, Math.ceil(total / (pager.pageSize || 25)));
            if ((!res || !res.Data || res.Data.length === 0) && total > 0 && pager.currentPage > lastPage) {
                pager.currentPage = lastPage; // e.g. the only card on the last page was deleted
                $scope.getList();
            }
            $scope.refreshReactProps();
            return result;
        };

        var pcPagerHandleReactAction = $scope.handleReactAction;
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
                $scope.getList();
                $scope.$applyAsync();
                return;
            }
            return pcPagerHandleReactAction.apply(this, arguments);
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    privilegecardListController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();