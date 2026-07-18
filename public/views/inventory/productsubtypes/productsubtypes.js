(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('productSubTypesListController', productSubTypesListController);

    function productSubTypesListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            subproducttypecode: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            ProductTypeId:-1,
            subproducttypename: '',
            ActiveStatusId: 2


        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.subproducttypecode },
                    { Key: 2, Value: $scope.currentfilter.subproducttypename },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.productsubtype },
                    { Key: 5, Value: $scope.currentfilter.ProductTypeId },
                    { Key: 6, Value: $scope.currentfilter.FacilityId }


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/productsubtype/GetProductSubTypes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.productsubtype', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/productsubtype/DeleteProductSubType',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.productsubtype', { id: entity.Id });
            }
            else if (actionType == 'view') {
                $state.go('app.productsubtype', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.SubProductTypeName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "SubProductTypeCode", displayName: $translate.instant('inventory.productsubtypes.code.lbl') },
                { field: "SubProductTypeName", displayName: $translate.instant('inventory.productsubtypes.name.lbl') },
                { field: "ProductType.ProductTypeName", displayName: $translate.instant('inventory.producttype.name.lbl') },
                { field: "ItemCategory.CategoryName", displayName: $translate.instant('inventory.itemcategory.name.lbl') },
                { field: "ItemSubCategory.SubCategoryName", displayName: $translate.instant('inventory.itemsubcategorys.filter_subcategoryname.lbl') },


                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.productsubtypes.status.lbl') },
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {"Key":"ProductType"},
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

    productSubTypesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();
