(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('chiefComplaintListController', chiefComplaintListController);

    function chiefComplaintListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ChiefComplaint: '',
            ChiefComplaintCategoryId: -1,
            ActiveStatusId: 2
        };
        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.ChiefComplaint },
                    { Key: 2, Value: $scope.currentfilter.ChiefComplaintCategoryId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/chiefcomplaint/GetChiefComplaints',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.chiefcomplaint', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        //Grid Actions
        // $scope.addNew = function() {
        //     $state.go('app.chiefcomplaint', { id:0 });
        // }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/chiefcomplaint/DeleteChiefComplaint',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ChiefComplaint);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ChiefComplaint", displayName: $translate.instant('clinicalmaster.chiefcomplaint-list.chiefcomplaint.lbl') },
                { field: "ChiefComplaintCategory.Description", displayName: $translate.instant('clinicalmaster.chiefcomplaint-list.category.lbl') },
                // { field: "Description", displayName: $translate.instant('clinicalmaster.chiefcomplaint-list.description.lbl') },
                // { field: "ReferrenceLink", displayName: $translate.instant('clinicalmaster.chiefcomplaint-list.referrencelink.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.chiefcomplaint-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
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
                { "Key": "ChiefComplaintCategory" },
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                pagerObj: vm.gridConfig.pagerObj,
                currentfilter: $scope.currentfilter,
                lookup: {
                    ChiefComplaintCategory: ($scope.lookup && $scope.lookup.ChiefComplaintCategory) || [],
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || []
                }
            };
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.ChiefComplaint = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'statusFilterChange') {
                $scope.currentfilter.ActiveStatusId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    chiefComplaintListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();