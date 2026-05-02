(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCenterTestListController', LabCenterTestListController);

    function LabCenterTestListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            // FacilityId: utl.Session.getCurrentFacilityId(),
            Code: '',
            Name: '',
            DepartmentId: -1,
            CategoryId: -1,
            ActiveStatusId: 2,
            file: null,
        };
        $scope.currentcontext = {};
        if ($stateParams.tp == 'dt') {
            $stateParams.id = utl.Session.getCurrentFacilityId();
        }
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.resid = parseInt($stateParams.resid);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 34,
                    Value: $scope.currentcontext.id
                },
                {
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
                    var actionName = 'SystemSettingsMasterExport/MasterExportXL';
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

        $scope.addNew = function () {
            utl.Modal.open('app.labcenterprofiletab.labcentertest', {
                params: {
                    sid: 0,
                    FacilityId: parseInt($stateParams.id),
                    resid: $scope.currentcontext.resid,
                    FacilityName: $state.params.FacilityName,
                    IsProfile: $state.params.IsProfile
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.labcenterprofiletab.labcentertest', {
                params: {
                    sid: Id,
                    FacilityId: parseInt($stateParams.id),
                    resid: $scope.currentcontext.resid,
                    FacilityName: $state.params.FacilityName,
                    IsProfile: $state.params.IsProfile
                },
                confirmCallback: $scope.getList
            });
        };

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
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "ItemCode",
                displayName: $translate.instant('Code')
            },
            {
                field: "Name",
                displayName: $translate.instant('Name')
            },
            {
                field: "ItemCost",
                displayName: $translate.instant('Rate'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span >{{entity.ItemCost}}&nbsp;</span>' + '</div>'
            },
            {
                field: "VirtualSubCategory.SubCategoryName",
                displayName: $translate.instant('Category')
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('clinicalmaster.serviceitem-list.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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

    LabCenterTestListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();