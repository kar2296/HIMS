(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemCategorysListController', itemCategorysListController);

    function itemCategorysListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            categorycode: '',
            FacilityId: utl.Session.getCurrentFacilityId(),

            categoryname: '',
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 1, Value: $scope.currentfilter.categorycode },
                    { Key: 2, Value: $scope.currentfilter.categoryname },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemcategory/GetItemCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.itemcategory', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/itemcategory/DeleteItemCategory',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.itemcategory', { id: row.entity.Id });
            }
              else if
                (actionType == 'view') {
                $state.go('app.itemcategory', { id: row.entity.Id });
            }
            
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.CategoryName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('appmanager.specialitys.filter_facility.lbl') },
                { field: "CategoryCode", displayName: $translate.instant('inventory.itemcategorys.code.lbl') },
                { field: "CategoryName", displayName: $translate.instant('inventory.itemcategorys.name.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemcategorys.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 
 /*  vidya 17/2/2017 */  
                    '<div class="ui-grid-cell-contents">\
                                                      <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.ActiveStatusId==2||row.entity.ActiveStatusId==3||row.entity.ActiveStatusId==4||row.entity.ActiveStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    \
                                                </div>',
                                                 /*  vidya 17/2/2017 */ 
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" }
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

    itemCategorysListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})(); 