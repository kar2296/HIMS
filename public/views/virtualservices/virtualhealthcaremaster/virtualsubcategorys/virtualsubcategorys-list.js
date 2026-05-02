(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualSubCategorysListController', VirtualSubCategorysListController);

    function VirtualSubCategorysListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            CategoryId:-1,
            // FacilityId: utl.Session.getCurrentFacilityId(),
            SubCategoryName: '',
            ActiveStatusId: 2
        };
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.SubCategoryName },
                    { Key: 1, Value: $scope.currentfilter.CategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'VirtualHealthcare/VirtualSubCategory/GetVirtualSubCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.virtualsubcategoryform', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'VirtualHealthcare/VirtualSubCategory/DeleteVirtualSubCategory',
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
            else if
                (actionType == 'view') {
                $scope.openModal(entity.Id);
            }

            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.CategoryName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('appmanager.specialitys.filter_facility.lbl') },
                { field: "SubCategoryCode", displayName: $translate.instant('SubCategory Code') },
                { field: "SubCategoryName", displayName: $translate.instant('SubCategory Name') },
                { field: "VirtualCategory.CategoryName", displayName: $translate.instant('Category Name') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemcategorys.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" uib-tooltip="View" tooltip-placement="bottom" ng-click="handleEvents(\'view\',entity)"  ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)"  ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" uib-tooltip="Delete" tooltip-placement="bottom" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
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
                { "Key": "VirtualCategory" }
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

    VirtualSubCategorysListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];

})(); 