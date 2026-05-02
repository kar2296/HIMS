(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetreconcileFormController', AssetreconcileFormController);

    function AssetreconcileFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        vm.gridConfig = {};
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.Data = [];
        $scope.item = {
            DepartmentId: utl.Session.getCurrentDepartmentId(),
            FacilityId: utl.Session.getCurrentFacilityId(),


        };
        $scope.gridData = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);


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
                        { Key: 3, Value: $scope.item.StartDate },
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
        $scope.getItemCallback = function (scope, data, options, hasError) {
            // $scope.item = data;
            // $scope.getDetails();
            $scope.item = {

                DepartmentId: utl.Session.getCurrentDepartmentId(),
                AuditNameId: utl.Session.getCurrentUserId(),
                AuditStatusId: 3,
            };
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

        $scope.saveAndReconcile = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AuditStatusId = 4;
            $scope.saveItem();
        }

        $scope.backToList = function () {
            $state.go('app.assetreconcile');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };
        $scope.clear = function () {
            $scope.item = {};
        }

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

        //Visibility rules starts
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "AssetTypeId", displayName: $translate.instant('assetmanagement.assetaudit.type.lbl') },
                { field: "AssetName", displayName: $translate.instant('assetmanagement.assetaudit.assetname.lbl') },
                { field: "Serial", displayName: $translate.instant('assetmanagement.assetaudit.serialno.lbl') },
                { field: "DepartmentId", displayName: $translate.instant('assetmanagement.assetaudit.department.lbl') },
                { field: "LOCATION.Description", displayName: $translate.instant('assetmanagement.assetaudit.location.lbl') },
                { field: "Quantity", displayName: $translate.instant('assetmanagement.assetaudit.quantity.lbl') },
                {
                    field: "ExpectedQuantity", displayName: $translate.instant('assetmanagement.assetreconcile.expectedquantity.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='row.entity.ExpectedQuantity' class='form-control' />\
                                          </div>" },
                {
                    field: "ReconcileQuantity", displayName: $translate.instant('assetmanagement.assetreconcile.reconcilequantity.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='row.entity.ReconcileQuantity' class='form-control' />\
                                          </div>" },

                { field: "StartDate", displayName: $translate.instant('assetmanagement.assetreconcile.lastaccounthistory.lbl'), cellTemplate: "<ngformatdate date-val='row.entity.StartDate'></ngformatdate>" },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            data: $scope.gridData
        };
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

    AssetreconcileFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();