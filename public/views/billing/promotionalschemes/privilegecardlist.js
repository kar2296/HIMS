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

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    privilegecardListController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();