(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('productTypesListController', productTypesListController);

    function productTypesListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            producttypecode: '',
            FacilityId: [utl.Session.getCurrentFacilityId(), -1],
            // FacilityId: -1,
            CategoryId: -1,
            SubCategoryId: -1,
            producttypename: '',
            ActiveStatusId: 2

        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.producttypecode },
                    { Key: 2, Value: $scope.currentfilter.producttypename },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.CategoryId },
                    { Key: 6, Value: $scope.currentfilter.SubCategoryId }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/producttype/GetProductTypes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.producttype', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/producttype/DeleteProductType',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.producttype', { id: entity.Id });
            }
            if (actionType == 'view') {
                $state.go('app.producttype', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ProductTypeName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ItemCategory.CategoryName", displayName: $translate.instant('inventory.itemcategory.name.lbl') },
                { field: "ItemSubCategory.SubCategoryName", displayName: $translate.instant('inventory.itemsubcategorys.filter_subcategoryname.lbl') },
                { field: "ProductTypeCode", displayName: $translate.instant('inventory.producttypes.code.lbl') },
                { field: "ProductTypeName", displayName: $translate.instant('inventory.producttypes.name.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.producttypes.status.lbl') },
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
        /*   2/12/2016 */
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            /*   2/12/2016 */
            $scope.getList();
        }
        /*   2/12/2016 */
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "ItemCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "ItemSubCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
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

    /*   2/12/2016 */
    productTypesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();