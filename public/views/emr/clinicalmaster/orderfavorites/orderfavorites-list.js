(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderFavoritesListController', OrderFavoritesListController);

    function OrderFavoritesListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Name: "",
            FacilityId: utl.Session.getCurrentFacilityId(),
            TickSheetTypeId: -1,
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.Name
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.TickSheetTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.AccessibleTypeId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/TickSheetMaster/GetTickSheetMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.orderfavorite', {
                id: 0
            });
        }
        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/TickSheetMaster/DeleteTickSheetMaster',
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
                $state.go('app.orderfavorite', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "TickSheetType.Description",
                    displayName: $translate.instant('clinicalmaster.ticksheet-list.type.lbl')
                },
                {
                    field: "TickSheetName",
                    displayName: $translate.instant('clinicalmaster.ticksheet-list.name.lbl')
                },
                {
                    field: "ParentDepartment.DepartmentName",
                    displayName: $translate.instant('clinicalmaster.ticksheet-list.department.lbl')
                },
                {
                    field: "AccessibleType.Description",
                    displayName: $translate.instant('clinicalmaster.ticksheet-list.accessiabletype.lbl')
                },
                {
                    field: "TickSheetMasterType.Description",
                    displayName: $translate.instant('clinicalmaster.ticksheet-list.subdepartment.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('clinicalmaster.ticksheet-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                      </div>',
                    handleEvent: $scope.handleEvents,
                    // actions: [{
                    //         actiontype: 'edit',
                    //         display: 'common.editaction.lbl'
                    //     },
                    //     {
                    //         actiontype: 'delete',
                    //         display: 'common.deleteaction.lbl'
                    //     }
                    // ]
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
                    "Key": "TickSheetType"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "AccessibleType"
                },
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

    OrderFavoritesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();