(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralListController', referralListController);

    function referralListController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ReferralTypeId: -1,
            ReferralName: '',
            MarketingPersonId: -1,
            ActiveStatusId: 2
        };

        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                StartDate: '',
                EndDate: '',
                ProjectMember: '',
                IsIncharge: ''
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [

                    {
                        type: 'date',
                        translate: 'generalmaster.referral-form.activefrom.lbl',
                        model: 'ActveFrom',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'generalmaster.referral-form.activeto.lbl',
                        model: 'ActveTo',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'generalmaster.referral-form.markettingperson.lbl',
                        model: 'MarketingPersonId',
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'generalmaster.referral-form.phoneno.lbl',
                        model: 'PhoneNo',
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'generalmaster.referral-form.city.lbl',
                        model: 'CityId',
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'generalmaster.referral-form.country.lbl',
                        model: 'CountryId',
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'generalmaster.referral-form.pincode.lbl',
                        model: 'PincodeId',
                        position: {
                            r: 3,
                            c: 0
                        }
                    },

                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $scope.backtoList = function () {
            $state.go('app.commondashboard');
        }
        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        //Dynamic form  ends

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.ReferralName
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ReferralTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.MarketingPersonId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/referral/GetReferrals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.referraltab.details', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/referral/DeleteReferral',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.referraltab.details', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ReferralName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.referral-list.facility.lbl') },
                {
                    field: "ReferralType.Description",
                    displayName: $translate.instant('generalmaster.referral-list.refrerraltype.lbl')
                },
                // { field: "ReferralCode", displayName: $translate.instant('generalmaster.referral-list.code.lbl') },
                {
                    field: "ReferralName",
                    displayName: $translate.instant('generalmaster.referral-list.referralname.lbl')
                },
                // { field: "MarketingPerson.Description", displayName: $translate.instant('generalmaster.referral-list.markettingperson.lbl') },
                // { field: "LoginId", displayName: $translate.instant('generalmaster.referral-list.loginid.lbl') },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('generalmaster.referral-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                    // {actiontype: 'delete', display : 'common.deleteaction.lbl'}
                    //                      ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "ReferralType"
                },
                {
                    "Key": "MarketingPerson"
                },
                {
                    "Key": "ActiveStatus"
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // ------------------------------------------------------------------
        // React view (new code only; the functions above are not changed).
        // referral-list.html now mounts MasterListScreen. This controller still loads the
        // lookups, runs GetReferrals, confirms and runs DeleteReferral, and navigates.
        //
        // Fixes made here:
        // 1. Type, Person and Status can be set back to "All" (-1, which the API ignores).
        //    The old drop-downs had no such entry, so a chosen Type or Person could not be cleared.
        // 2. Changing a filter or searching starts from page 1. Before, the page number was kept,
        //    so a smaller result showed an empty table.
        // 3. Only the answer to the latest list request is shown. Changing filters quickly sends
        //    several requests; an older answer that arrived last used to replace the newer one.
        // 4. Deleting the last referral on the last page moves back one page instead of showing
        //    an empty table.
        // 5. A loading message is shown while the list is being fetched, and "No records" when
        //    nothing matches.
        // ------------------------------------------------------------------
        var rlLoading = false;
        var rlLoadingTimer = null;
        var rlRequestNo = 0;

        function rlText(key, fallback) {
            var text = $translate.instant(key);
            return text && text !== key ? text : fallback;
        }

        function rlFilterId(value) {
            return value === undefined || value === null || value === '' ? -1 : value;
        }

        function rlSetLoading(loading) {
            rlLoading = loading;
            if (rlLoadingTimer) {
                clearTimeout(rlLoadingTimer);
                rlLoadingTimer = null;
            }
            if (loading) {
                // Safety net: a request that fails without a response calls no callback.
                rlLoadingTimer = setTimeout(function () {
                    $scope.$evalAsync(function () { rlSetLoading(false); });
                }, 60000);
            }
        }

        $scope.buildReferralListReactProps = function () {
            var lookup = $scope.lookup || {};
            var data = vm.gridConfig.data || [];
            var pager = vm.gridConfig.pagerObj;
            var edit = { action: 'edit', title: 'Edit', icon: 'edit' };
            var del = { action: 'delete', title: 'Delete', icon: 'delete' };
            return {
                id: 'referrallist',
                labels: {
                    title: rlText('generalmaster.referraltab.addnewtooltip.lbl', 'Referrals'),
                    searchPlaceholder: rlText('generalmaster.referral-list.filter_referralname.lbl', 'Name/Code'),
                    addTooltip: rlText('generalmaster.referral-list.pagetitle.lbl', 'Manage Referrals'),
                    homeTooltip: 'Dashboard',
                    colActions: rlText('common.actions_col.lbl', 'Actions'),
                    loading: 'Loading...',
                    noRecords: 'No records found'
                },
                search: { value: $scope.currentfilter.ReferralName || '' },
                filters: [
                    {
                        key: 'ReferralTypeId', allLabel: 'All', value: rlFilterId($scope.currentfilter.ReferralTypeId),
                        label: rlText('generalmaster.referral-list.filter_referraltype.lbl', 'Type'), options: lookup.ReferralType || []
                    },
                    {
                        key: 'MarketingPersonId', allLabel: 'All', value: rlFilterId($scope.currentfilter.MarketingPersonId),
                        label: rlText('generalmaster.referral-list.filter_markettingperson.lbl', 'Person'), options: lookup.MarketingPerson || []
                    },
                    {
                        key: 'ActiveStatusId', allLabel: 'All', value: rlFilterId($scope.currentfilter.ActiveStatusId),
                        label: rlText('generalmaster.referral-list.filter_status.lbl', 'Status'), options: lookup.ActiveStatus || []
                    }
                ],
                columns: [
                    { key: 'referralType', label: rlText('generalmaster.referral-list.refrerraltype.lbl', 'Referral Type') },
                    { key: 'referralName', label: rlText('generalmaster.referral-list.referralname.lbl', 'Referral Name') },
                    { key: 'status', label: rlText('generalmaster.referral-list.status.lbl', 'Status') }
                ],
                rows: data.map(function (entity, index) {
                    return {
                        index: index,
                        cells: {
                            referralType: (entity.ReferralType && entity.ReferralType.Description) || '',
                            referralName: entity.ReferralName || '',
                            status: (entity.ActiveStatus && entity.ActiveStatus.Description) || ''
                        },
                        // same rules as the old grid: edit always, delete only for Draft
                        actions: entity.ActiveStatusId == 1 ? [edit, del] : [edit]
                    };
                }),
                pager: {
                    totalItems: pager.totalItems || 0,
                    currentPage: pager.currentPage || 1,
                    pageSize: pager.pageSize || 25
                },
                loading: rlLoading,
                showHome: true
            };
        };

        $scope.reactProps = $scope.buildReferralListReactProps();
        $scope.$watch($scope.buildReferralListReactProps, function (props) {
            $scope.reactProps = props;
        }, true);

        function rlSearchFromFirstPage() {
            vm.gridConfig.pagerObj.currentPage = 1;
            $scope.getList();
        }

        var rlFilterKeys = ['ReferralTypeId', 'MarketingPersonId', 'ActiveStatusId'];

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            $scope.$evalAsync(function () {
                switch (actionName) {
                    case 'setSearch':
                        $scope.currentfilter.ReferralName = payload.value;
                        break;
                    case 'search':
                        rlSearchFromFirstPage();
                        break;
                    case 'setFilter':
                        if (rlFilterKeys.indexOf(payload.key) >= 0) {
                            $scope.currentfilter[payload.key] = payload.value;
                            rlSearchFromFirstPage();
                        }
                        break;
                    case 'page':
                        vm.gridConfig.pagerObj.currentPage = payload.page;
                        $scope.getList();
                        break;
                    case 'addNew':
                        $scope.addNew();
                        break;
                    case 'home':
                        $scope.backtoList();
                        break;
                    case 'rowAction':
                        var entity = (vm.gridConfig.data || [])[payload.index];
                        if (entity && (payload.action === 'edit' || payload.action === 'delete')) {
                            $scope.handleEvents(payload.action, entity);
                        }
                        break;
                }
            });
        };

        // Latest request only, plus the loading state.
        var rlOriginalGetList = $scope.getList;
        $scope.getList = function () {
            var requestNo = ++rlRequestNo;
            rlSetLoading(true);
            var originalDoAction = utl.Http.doAction;
            utl.Http.doAction = function (options) {
                if (options) {
                    options.listRequestNo = requestNo;
                    options.onError = rlListError;
                }
                return originalDoAction.apply(this, arguments);
            };
            try {
                return rlOriginalGetList.apply(this, arguments);
            } finally {
                utl.Http.doAction = originalDoAction;
            }
        };

        // Called by the HTTP helper when the list request fails. With onError set the helper no
        // longer shows the message for an error code itself, so it is shown here.
        function rlListError(data, options) {
            $scope.$evalAsync(function () {
                if (options && options.listRequestNo !== rlRequestNo) {
                    return; // failure of an older request
                }
                rlSetLoading(false);
                if (data && data.Error && data.Error.Code) {
                    utl.Alert.showErrorMsg($translate.instant('common.errors.' + data.Error.Code + '.lbl'));
                }
            });
        }

        var rlOriginalGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (options && options.listRequestNo !== undefined && options.listRequestNo !== rlRequestNo) {
                return; // answer to an older request
            }
            rlSetLoading(false);
            var result = rlOriginalGetListCallback.apply(this, arguments);
            var pager = vm.gridConfig.pagerObj;
            var total = pager.totalItems || 0;
            var lastPage = Math.max(1, Math.ceil(total / (pager.pageSize || 25)));
            if ((!res || !res.Data || res.Data.length === 0) && total > 0 && pager.currentPage > lastPage) {
                pager.currentPage = lastPage; // e.g. the only referral on the last page was deleted
                $scope.getList();
            }
            return result;
        };

        $scope.initLookup();
    }

    referralListController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl'];

})();