(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemSubCategorysListController', itemSubCategorysListController);

    function itemSubCategorysListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            subcategorycode: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            CategoryId: -1,
            subcategoryname: '',
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [

                    {
                        Key: 1,
                        Value: $scope.currentfilter.subcategorycode
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.subcategoryname
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.CategoryId
                    }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemsubcategory/GetItemSubCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.itemsubcategory', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/itemsubcategory/DeleteItemSubCategory',
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
                $state.go('app.itemsubcategory', {
                    id: entity.Id
                });
            } else if (actionType == 'view') {
                $state.go('app.itemsubcategory', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.SubCategoryName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "Facility.FacilityName",
                    displayName: $translate.instant('appmanager.specialitys.filter_facility.lbl')
                },
                {
                    field: "SubCategoryCode",
                    displayName: $translate.instant('inventory.itemsubcategorys.code.lbl')
                },
                {
                    field: "SubCategoryName",
                    displayName: $translate.instant('inventory.itemsubcategorys.name1.lbl')
                },
                {
                    field: "ItemCategory.CategoryName",
                    displayName: $translate.instant('inventory.itemcategory.name.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('inventory.itemsubcategorys.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: /*  vidya 17/2/2017 */ '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    \
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
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
                    "Key": "Facility"
                },
                {
                    "Key": "ItemCategory"
                },
                {
                    "Key": "ActiveStatus"
                }
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

    itemSubCategorysListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();