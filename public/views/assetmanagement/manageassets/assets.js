(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetListController', assetListController);

    function assetListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            DepartmentId: -1,
            EmployeeId: -1
        };
        $scope.currentcontext = {};
        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                ModelNum: " ",
                Serial: "",
                GRNNum: "",
                PONum: "",
                PurchaseValue: "",
                CurrentValue: "",
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),


            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'text',
                        translate: 'assetmanagement.filter.modelnum.lbl',
                        model: 'ModelNum',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'assetmanagement.filter.serial.lbl',
                        model: 'Serial',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'assetmanagement.filter.grn#.lbl',
                        model: 'GRNNum',
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'assetmanagement.filter.po#.lbl',
                        model: 'PONum',
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'assetmanagement.filter.purchasevalue.lbl',
                        model: 'PurchaseValue',
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'assetmanagement.filter.currentvalue.lbl',
                        model: 'CurrentValue',
                        position: {
                            r: 2,
                            c: 1
                        }
                    },

                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

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
                    {
                        Key: 2,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    // {
                    //     Key: 5,
                    //     Value: $scope.advancedfilter.ModelNum
                    // },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.AssetName
                    },
                    // {
                    //     Key: 7,
                    //     Value: $scope.currentfilter.Description
                    // },
                    // {
                    //     Key: 8,
                    //     Value: $scope.currentfilter.Manufacturer
                    // },
                    // {
                    //     Key: 14,
                    //     Value: $scope.currentfilter.AssetName
                    // },
                    // {
                    //     Key: 9,
                    //     Value: $scope.advancedfilter.Serial
                    // },
                    // {
                    //     Key: 10,
                    //     Value: $scope.advancedfilter.PONum
                    // },
                    // {
                    //     Key: 11,
                    //     Value: $scope.advancedfilter.GRNNum
                    // },
                    // {
                    //     Key: 12,
                    //     Value: $scope.advancedfilter.PurchaseValue
                    // },
                    // {
                    //     Key: 13,
                    //     Value: $scope.advancedfilter.CurrentValue
                    // },
                    // {
                    //     Key: 17,
                    //     Value: utl.Session.getCurrentFacilityId()
                    // },
                    // {
                    //     Key: 18,
                    //     Value: $scope.currentfilter.EmployeeId
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

        $scope.enenter = function () {
            if ($scope.currentfilter.EmployeeId == undefined) {
                $scope.getList();
            }
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.assets', {
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
        //     if (actionType == 'edit' || actionType == 'view') {
        //         var deptname = '';
        //         if (entity.Department && entity.Department.DepartmentName)
        //             deptname = entity.Department.DepartmentName;
        //         $state.go('app.assettab.details', {
        //             id: entity.Id,
        //             IsProfile: entity.IsProfile,
        //             AssetName: entity.Id + ' - ' + entity.AssetName + ' - ' + deptname,
        // Status: entity.ActiveStatus.Description
        //         });
        //     } 
            if (actionType == 'edit') {
                $state.go('app.assettab.details', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    UserName: entity.UserName,
                    AssetCode:entity.ShortCode,
                    AssetName:entity.AssetName
                });
            } else if (actionType == 'Active') {
                $scope.Update(entity.Id, 2);
            } else if (actionType == 'Inactive') {
                $scope.Update(entity.Id, 3);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AssetName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ShortCode",
                    displayName: $translate.instant('assetmanagement.asset.shortcode.lbl')
                },
                {
                    field: "AssetType.Description",
                    displayName: $translate.instant('assetmanagement.assets.type.lbl')
                },
                {
                    field: "AssetCategory.Description",
                    displayName: $translate.instant('assetmanagement.assets.cetegory.lbl')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('assetmanagement.assets.installeddepartment.lbl')
                },
                {
                    field: "ModelNum",
                    displayName: $translate.instant('assetmanagement.assets.modelno.lbl')
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
                    field: "Description",
                    displayName: $translate.instant('assetmanagement.assets.description.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('assetmanagement.assets.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    \</div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
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
            // initDynamicForm();
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
                //         Params: [
                //             {
                //                 Key: 5,
                //                 Value: 2
                //             },
                //             {
                //                 Key: 17,
                //                 Value: curdeptids
                //             }, // Institution dept filter
                //         ]
                //     }
                // },
                {
                    "Key": "Department"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "ModelNum"
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
                    "Key": "ModelNum"
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

    assetListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();