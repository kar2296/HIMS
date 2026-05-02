(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualserviceListController', VirtualserviceListController);

    function VirtualserviceListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Code: '',
            Name: '',
            DepartmentId: -1,
            CategoryId: -1,
            ActiveStatusId: 2,
            file: null
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.Code
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.CategoryId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 31,
                        Value: true
                    },
                    {
                        Key: 32,
                        Value: $scope.currentfilter.VirtualCategoryId
                    },
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

        $scope.exportServiceItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        }

        $scope.exportServiceItem = function () {
            if (!(vm.gridConfig.data)) {
                utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            } else {
                if (vm.gridConfig.data) {
                    var actionName = 'SystemSettings/MasterExport/MasterExportXL';
                    var options = {
                        action: actionName,
                        data: {
                            Data: {
                                'targetcontext': 'ServiceItemMaster',
                                'Code': $scope.currentfilter.Code,
                                'DepartmentId': $scope.currentfilter.DepartmentId,
                                'CategoryId': $scope.currentfilter.CategoryId,
                                'ActiveStatus': $scope.currentfilter.ActiveStatusId,
                                'SubCategoryId': $scope.advancedfilter.SubCategoryId,
                                'FacilityId': $scope.advancedfilter.FacilityId,
                                'MasterTypeId': $scope.advancedfilter.MasterTypeId,
                                'SubDepartmentId': $scope.advancedfilter.SubDepartmentId,
                                'IsPackage': $scope.advancedfilter.IsPackage,
                                'MasterName': $scope.advancedfilter.MasterName,
                            }
                        },
                        type: 'post',
                        onComplete: $scope.exportServiceItemCallback
                    };

                    utl.Http.doAction(options);
                }
            }
        }

        $scope.uploadServiceItem = function () {
            utl.Alert.showSuccessMsg('please wait....');
        }


        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.virtualtab.virtualserviceform', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/serviceitem/DeleteServiceItem',
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
                $state.go('app.virtualtab.virtualserviceform', {
                    id: entity.Id,
                    TestmasterId: entity.MasterItemId,
                    ServiceName: entity.ItemCode + ' - ' + entity.Name
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ItemCode",
                    displayName: $translate.instant('clinicalmaster.serviceitem-list.itemcode.lbl')
                },
                {
                    field: "Name",
                    displayName: $translate.instant('clinicalmaster.serviceitem-list.itemname.lbl')
                },
                {
                    field: "Description",
                    displayName: $translate.instant('clinicalmaster.serviceitem-list.description.lbl')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('clinicalmaster.serviceitem-list.department.lbl')
                },
                {
                    field: "VirtualCategory.CategoryName",
                    displayName: $translate.instant('Category')
                },
                {
                    field: "VirtualSubCategory.SubCategoryName",
                    displayName: $translate.instant('Sub Category')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('clinicalmaster.serviceitem-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                      </div>',
                    handleEvent: $scope.handleEvents,
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Department"
                },
                {
                    "Key": "SubDepartment"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "ServiceSubCategory"
                },
                {
                    "Key": "ServiceCategory"
                },
                {
                    "Key": "ServiceGroup"
                },
                {
                    "Key": "MasterType"
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "VirtualCategory"
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

        $scope.initLookup();
    }

    VirtualserviceListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();