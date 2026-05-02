(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetauditFormController', AssetauditFormController);

    function AssetauditFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        vm.gridConfig = {};
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.Data = [];
        $scope.item = {
            DepartmentId: utl.Session.getCurrentDepartmentId(),
            AuditNameId: utl.Session.getCurrentUserId(),
            LOCATIONId: -1,
            AuditStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId(),


        };
        $scope.gridData = [];
        $scope.AssetAuditDetails = [];

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.saveAndFetch = function () {
            if ($scope.item.AssetId) {
                var item = {
                    AssetId: $scope.item.AssetId,
                    AssetName: $scope.item.AssetName,
                    AssetTypeId: $scope.item.AssetTypeId,
                    Serial: $scope.item.Serial,
                    DepartmentId: $scope.item.DepartmentId,
                    ModelNum: $scope.item.ModelNum,
                    ManufacturerId: $scope.item.ManufacturerId,
                    Quantity: $scope.item.Quantity,
                    LOCATIONId: $scope.item.LOCATIONId,
                    StartDate: $scope.item.StartDate,
                    AuditStatusId: $scope.AuditStatusId
                };
                $scope.gridData.push(item);
            } else if (!$scope.item.AssetName) {
                utl.Alert.showErrorMsg($translate.instant('Please Select any AssetItem'));
            }
        }
        $scope.applyFilter = function () {
            vm.gridConfig.data = $filter('filterArrayItems')($scope.gridData, [
                { search: 1, fields: ['Status'] }
            ]);
        }


        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            //$scope.applyFilter();
        };

        $scope.getDetails = function () {
            if ($scope.item.Id && $scope.item.Id > 0) {

                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.item.Id },
                    ]
                };

                var options = {
                    action: 'AssetManagement/AssetAuditDetail/GetAssetAuditDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $state.go('app.assetaudit');
        }
        $scope.save = function () {
            if ($scope.currentcontext.id == 0) { $scope.item.AuditStatusId = 1; }

            $scope.saveItem();
        };
        $scope.saveAndAudit = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AuditStatusId = 3;
            $scope.saveItem();
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetails();

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/AssetAudit/GetAssetAuditById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };
        $scope.clear = function () {
            $scope.item = {};
        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/AssetAudit/AddAssetAudit';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/AssetAudit/UpdateAssetAudit';
            }
            var inputData = { Header: $scope.item, Details: $scope.gridData };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };



        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.StartDate && $scope.item.StartDate != '') {
                var StartDate = new Date($scope.item.StartDate);
                $scope.item.ExpectedDischargeDate = new Date(StartDate.getFullYear(),
                    StartDate.getMonth(),
                    StartDate.getDate() + parseInt($scope.item.ALOS));
            }
        }

        function loadData() {
            $scope.getItem();
            $scope.getAssetAuditDetails();
        }
        //Visibility rules starts
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "AssetTypeId", displayName: $translate.instant('assetmanagement.assetaudit.type.lbl') },
                { field: "AssetName", displayName: $translate.instant('assetmanagement.assetaudit.assetname.lbl') },
                { field: "Serial", displayName: $translate.instant('assetmanagement.assetaudit.serialno.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('assetmanagement.assetaudit.department.lbl') },
                { field: "LOCATION.Description", displayName: $translate.instant('assetmanagement.assetaudit.location.lbl') },
                { field: "Quantity", displayName: $translate.instant('assetmanagement.assetaudit.quantity.lbl') },
                { field: "StartDate", displayName: $translate.instant('assetmanagement.assetaudit.auditon.lbl'), cellTemplate: "<ngformatdate date-val='row.entity.StartDate'></ngformatdate>" },
                // { field: "AuditStatus.Description", displayName: $translate.instant('assetmanagement.assetaudit.auditstatus.lbl') },
                { field: "ModelNum", displayName: $translate.instant('assetmanagement.assetaudit.model.lbl') },
                { field: "ManufacturerId", displayName: $translate.instant('assetmanagement.assetaudit.manufacture.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            data: $scope.gridData
        };
        //autosearch related code starts -
        vm.assetauditdetailscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Asset Name', field: 'AssetName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-assetname' },
                { header: 'Asset Type', field: 'AssetTypeId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-assettype' },
                { header: 'Serial Number', field: 'Serial', datatype: 'string', headercls: 'td-name', fieldcls: 'td-serialnumber' },
                { header: 'Model Number', field: 'ModelNum', datatype: 'string', headercls: 'td-name', fieldcls: 'td-modelnumber' },
                { header: 'Manufacturer', field: 'ManufacturerId', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-departmentname', fieldcls: 'td-departmentname' },
                { header: 'Vendor', field: 'VendorId', datatype: 'string', headercls: 'td-vendorname', fieldcls: 'td-vendorname' }
            ],
            searchparams: {},
            result: {},
            api: 'AssetManagement/Asset/GetAssets',
            presearch: presearchassetitem,
            formatdisplay: formatselectedassetitem,
            postsearch: postsearchassetitem
        };

        function formatselectedassetitem() {
            var selectedItem = vm.assetauditdetailscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.AssetName].join(' ');
                $scope.item.ManufacturerId = selectedItem.ManufacturerId;
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.VendorId = selectedItem.VendorId;
                $scope.item.AssetTypeId = selectedItem.AssetTypeId;
                $scope.item.Serial = selectedItem.Serial;
                $scope.item.AssetName = selectedItem.AssetName;
                $scope.item.ModelNum = selectedItem.ModelNum;
            } else if (vm.assetauditdetailscontrolconfig.rowdata) {
                result = [vm.assetauditdetailscontrolconfig.rowdata.AssetName,
                vm.assetauditdetailscontrolconfig.rowdata.AssetTypeId,
                vm.assetauditdetailscontrolconfig.rowdata.Serial,
                vm.assetauditdetailscontrolconfig.rowdata.ModelNum,
                vm.assetauditdetailscontrolconfig.rowdata.ManufacturerId,
                vm.assetauditdetailscontrolconfig.rowdata.DepartmentId,
                vm.assetauditdetailscontrolconfig.rowdata.VendorId
                ].join(' ');
                vm.gridconfig.Data.push(selectedItem)
            }
            return result;
        }

        function presearchassetitem() {
            var query = vm.assetauditdetailscontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    //  { Key: 2, Value: $scope.item.AssetName },
                    // { Key: 1, Value: $scope.item.AssetId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.assetauditdetailscontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 14, Value: query });
            }

            vm.assetauditdetailscontrolconfig.searchparams = inputData;
        }

        function postsearchassetitem() {
            for (var idx in vm.assetauditdetailscontrolconfig.result) {
                var item = vm.assetauditdetailscontrolconfig.result[idx];
                item.AssetName = item.AssetName;
                item.AssetTypeId = item.AssetType.Description
                item.Serial = item.Serial;
                item.ModelNum = item.ModelNum;
                if (item.Manufacturer)
                    item.ManufacturerId = item.Manufacturer.Description;
                if (item.Department)
                    item.Department = item.Department.DepartmentName;
                item.Vendor = item.VendorId;
            }
        }

        //autosearch related code ends -
        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.item.Id = row.entity.Id;
            });
        };
        //Grid selection related code ends

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                { "Key": "AuditStatus" },
                { "Key": "LOCATION" },
                {
                    "Key": "Department",
                    Request: {
                        Params: [
                            { Key: 5, Value: 2 },
                            { Key: 17, Value: curdeptids }, // Institution dept filter
                        ]
                    }
                },
                { "Key": "User" },

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

    AssetauditFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();