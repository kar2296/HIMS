(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MyAssetsController', MyAssetsController);

    function MyAssetsController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            DepartmentId: -1,
            // EmployeeId: utl.Session.getCurrentUserId(),
        };
        $scope.currentcontext = {};
        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            // item.InstallationCharges = parseFloat(item.InstallationCharges).toFixed(2);
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.AssetName
                    },
                    // {
                    //     Key: 17,
                    //     Value: utl.Session.getCurrentFacilityId()
                    // },
                    // {
                    //     Key: 18,
                    //     Value: utl.Session.getCurrentUserId()
                    // },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/Asset/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

      

        $scope.openModal = function (Id) {
            utl.Modal.openFixedDialog('app.assetregview', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.assettab.details', {
                id: 0
            });
            // $scope.openModal(0);
        }


        $scope.findGrn = function () {
            $state.go('app.findgrnform', {
                findid: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/Asset/DeleteAsset',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'view') {
                 var deptname = '';
                if (entity.Department && entity.Department.DepartmentName)
                    deptname = entity.Department.DepartmentName;
                $state.go('app.assetregview', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    AssetName: entity.Id + ' - ' + entity.AssetName + ' - ' + deptname
                });
            } else if (actionType == 'edit') {
                $state.go('app.assetregview', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    AssetName: entity.Id + ' - ' + entity.AssetName + ' - ' + deptname
                });
            } else if (actionType == 'Active') {
                $scope.Update(entity.Id, 2);
            } else if (actionType == 'Inactive') {
                $scope.Update(entity.Id, 3);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AssetName);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "AssetName",
                displayName: $translate.instant('assetmanagement.assets.code.lbl')
            },
            {
                field: "Description",
                displayName: $translate.instant('assetmanagement.assets.assetname.lbl')
            },
            {
                field: "AssetType.Description",
                displayName: $translate.instant('assetmanagement.assets.type.lbl')
            },
            {
                field: "Serial",
                displayName: $translate.instant('assetmanagement.assets.serialno.lbl')
            },
            {
                field: "ModelName",
                displayName: $translate.instant('assetmanagement.assets.modelname.lbl')
            },
            {
                field: "Manufacturer",
                displayName: $translate.instant('assetmanagement.asset.manufacturer.lbl')
            },
            {
                field: "PurchaseValue",
                displayName: $translate.instant('assetmanagement.assets.purchasevalue.lbl')
            },
            {
                field: "DepreciationValue",
                displayName: $translate.instant('assetmanagement.assets.depreciationvalue.lbl')
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('assetmanagement.assets.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><i class="fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                    </div>',
                handleEvent: $scope.handleEvents,
                actions: [{
                    actiontype: 'edit',
                    display: 'common.editaction.lbl'
                },
                {
                    actiontype: 'delete',
                    display: 'common.deleteaction.lbl'
                }
                ]
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
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [{
                "Key": "AssetType"
            },
            {
                "Key": "AssetCategory"
            },
            // {
            //     "Key": "Department",
            //     Request: {
            //         Params: [{
            //             Key: 5,
            //             Value: 2
            //         },
            //         {
            //             Key: 17,
            //             Value: curdeptids
            //         }, // Institution dept filter
            //         ]
            //     }
            // },
            {
                "Key": "ActiveStatus"
            },
            {
                "Key": "ModelName"
            },
            {
                "Key": "Description"
            },
            {
                "Key": "Manufacturer"
            },
            {
                "Key": "Serial"
            },
            {
                "Key": "PONum"
            },
            {
                "Key": "GRNNum"
            },
            {
                "Key": "PurchaseValue"
            },
            {
                "Key": "CurrentValue"
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

    MyAssetsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();