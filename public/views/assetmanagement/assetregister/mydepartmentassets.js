(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MyDepartmentAssetsController', MyDepartmentAssetsController);

    function MyDepartmentAssetsController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            // DepartmentId: -1,
            EmployeeId: utl.Session.getCurrentUserId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
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
                    // { Key: 1, Value: $scope.currentfilter.AssetTypeId },
                    // // { Key: 2, Value: $scope.currentfilter.AssetCategoryId },
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    // // { Key: 6, Value: $scope.currentfilter.ModelName },
                    // // { Key: 7, Value: $scope.currentfilter.Description },
                    // // { Key: 8, Value: $scope.currentfilter.Manufacturer },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.AssetName
                    },
                    // {
                    //     Key: 17,
                    //     Value: utl.Session.getCurrentFacilityId()
                    // },
                    {
                        Key: 18,
                        Value: $scope.currentfilter.EmployeeId
                    },

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
            utl.Modal.open('app.assetregview', {
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

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                var deptname = '';
                if (row.entity.Department && row.entity.Department.DepartmentName)
                    deptname = row.entity.Department.DepartmentName;
                $scope.openModal({
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    AssetName: entity.Id + ' - ' + entity.AssetName + ' - ' + deptname
                });
                // $state.go('app.assettab.details', {
                //     id: row.entity.Id,
                //     IsProfile: row.entity.IsProfile,
                //     AssetName: row.entity.Id + ' - ' + row.entity.AssetName + ' - ' + deptname
                // });
            } else if (actionType == 'Active') {
                $scope.Update(row.entity.Id, 2);
            } else if (actionType == 'Inactive') {
                $scope.Update(row.entity.Id, 3);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AssetName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : row.entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            }
        }

        /* autosearch starts */
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Employee Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Department',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        /* autosearch End */

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
                field: "Manufacturer.Description",
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
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><i class=" fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                    </div>',
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
            // var curdeptids = utl.Session.getUserDepartments();
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
            // {
            //     "Key": "ModelName"
            // },
            // {
            //     "Key": "Description"
            // },
            // {
            //     "Key": "Manufacturer"
            // },
            // {
            //     "Key": "Serial"
            // },
            // {
            //     "Key": "PONum"
            // },
            // {
            //     "Key": "GRNNum"
            // },
            // {
            //     "Key": "PurchaseValue"
            // },
            // {
            //     "Key": "CurrentValue"
            // },
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

    MyDepartmentAssetsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();