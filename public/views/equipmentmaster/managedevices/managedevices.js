(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('manageDeviceListController', manageDeviceListController);

    function manageDeviceListController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DeviceName: '',
            DeviceCode: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            ActiveStatusId: 2

        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DeviceName },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 2, Value: $scope.currentfilter.DeviceManufacturerId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/Device/GetDevices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('app.managedeviceform', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/Device/DeleteDevice',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.open('app.managedeviceform', {
                    params: {
                        id: entity.Id
                    },
                    confirmCallback: $scope.getList
                });
            }
            if (actionType == 'view') {
                utl.Modal.open('app.managedeviceform', {
                    params: {
                        id: entity.Id
                    },
                    confirmCallback: $scope.getList
                });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DeviceName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "DeviceCode", displayName: $translate.instant('Code') },
                { field: "DeviceName", displayName: $translate.instant('Name') },
                { field: "DeviceManufacturer.DeviceManufacturerName", displayName: $translate.instant('Device Manufacturer') },
                { field: "Location", displayName: $translate.instant('Location') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('Status') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate:
                        '<div class="ui-grid-cell-contents">\
                                                      <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    \
                                                </div>',
                    handleEvent: $scope.handleEvents,

                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" },
                {
                    Key: 'DeviceManufacturer',
                    Request: {
                        Params: [{ Key: 4, Value: utl.Session.getCurrentFacilityId() }]

                    }
                },
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


    manageDeviceListController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl'];

})();