(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GatePassFormController', GatePassFormController);

        // function GatePassFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        function GatePassFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            GatePassDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = parseInt(modalConfig.params.id);
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.GatePassStatusId == 2)
                $scope.item.isRequested = true;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/GatePass/GetGatePassById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.gatepassprint = function () {
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentfilter.GatePassTypeId },
                    // {
                    //     Key: 8,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentfilter.GatePassStatusId
                    // },
                    // { Key: 6, Value: utl.Formatter.getFilterDate(From) },
                    // { Key: 7, Value: utl.Formatter.getFilterDate(To) },
                ],
            };
            var options = {
                action: 'AssetManagement/GatePass/PrintGatePass',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);

        };

        $scope.gatepassprint1 = function () {
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentfilter.GatePassTypeId },
                    // {
                    //     Key: 8,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentfilter.GatePassStatusId
                    // },
                    // { Key: 6, Value: utl.Formatter.getFilterDate(From) },
                    // { Key: 7, Value: utl.Formatter.getFilterDate(To) },
                ],
            };
            var options = {
                action: 'AssetManagement/GatePass/PrintGatePass1',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);

        };
        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.TransferedDate && $scope.item.TransferedDate != '') {
                var TransferedDate = new Date($scope.item.TransferedDate);
                $scope.item.ExpectedDischargeDate = new Date(TransferedDate.getFullYear(),
                    TransferedDate.getMonth(),
                    TransferedDate.getDate() + parseInt($scope.item.ALOS));
            }
        }
        $scope.save = function () {
            $scope.item.GatePassStatusId = 2;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            $scope.item.GatePassStatusId = 2;
            $scope.saveItem();
        }

        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.assettransfer', { id: 0 });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
            $scope.gatepassprint1();
        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/GatePass/AddGatePass';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/GatePass/UpdateGatePass';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        //autosearch related code starts -
        vm.assettransfercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Asset Name', field: 'AssetName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-assetname' },
                { header: 'Asset Type', field: 'AssetTypeId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-assettype' },
                { header: 'Serial Number', field: 'Serial', datatype: 'string', headercls: 'td-name', fieldcls: 'td-serialnumber' },
                { header: 'Model Number', field: 'ModelNum', datatype: 'string', headercls: 'td-name', fieldcls: 'td-modelnumber' },
                { header: 'Manufacturer', field: 'ManufacturerId', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Vendor', field: 'VendorMaster.VendorName', datatype: 'string', headercls: 'td-vendor', fieldcls: 'td-vendor' }
            ],
            searchparams: {},
            result: {},
            api: 'AssetManagement/Asset/GetAssets',
            presearch: presearchpurchaseitem,
            formatdisplay: formatselectedpurchaseitem,
            postsearch: postsearchpurchaseitem
        };

        function formatselectedpurchaseitem() {
            var selectedItem = vm.assettransfercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.AssetName].join(' ');
                $scope.item.ManufacturerId = selectedItem.ManufacturerId;
                $scope.item.VendorId = selectedItem.VendorId;
                $scope.item.AssetTypeId = selectedItem.AssetTypeId;
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.SerialNo = selectedItem.Serial;
                $scope.item.AssetName = selectedItem.AssetName;
                $scope.item.ModelNo = selectedItem.ModelNum;
            } else if (vm.assettransfercontrolconfig.rowdata) {
                result = [vm.assettransfercontrolconfig.rowdata.AssetName,
                vm.assettransfercontrolconfig.rowdata.AssetTypeId,
                vm.assettransfercontrolconfig.rowdata.Serial,
                vm.assettransfercontrolconfig.rowdata.ModelNum,
                vm.assettransfercontrolconfig.rowdata.ManufacturerId,
                vm.assettransfercontrolconfig.rowdata.VendorId,
                ].join(' ');
            }
            return result;
        }

        function presearchpurchaseitem() {
            var query = vm.assettransfercontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    //  { Key: 2, Value: $scope.item.AssetName },
                    // { Key: 5, Value: $scope.item.AssetId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.assettransfercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 14, Value: query });
            }

            vm.assettransfercontrolconfig.searchparams = inputData;
        }

        function postsearchpurchaseitem() {
            for (var idx in vm.assettransfercontrolconfig.result) {
                var item = vm.assettransfercontrolconfig.result[idx];
                item.AssetName = item.AssetName;
                item.AssetTypeId = item.AssetTypeId;
                item.SerialNo = item.Serial;
                item.ModelNo = item.ModelNum;
                //item.ManufacturerId = item.Manufacturer.Description;
                item.VendorId = item.VendorId;
            }
        }
        //autosearch related code ends -

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                {
                    "Key": "Department"
                    // Request: {
                    //     Params: [
                    //         { Key: 5, Value: 2 },
                    //         { Key: 17, Value: curdeptids }, // Institution dept filter
                    //     ]
                    // }
                },
                { "Key": "GatePassType" },
                { "Key": "DispatchedType" },
                { "Key": "AssetType" },
                { "Key": "VendorMaster" },
                { "Key": "Company" },
                // { "Key": "TransferType" },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
                        }]
                    }
                },
                // { "Key": "LOCATION" },
                { "Key": "VendorMaster" },
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

    GatePassFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();