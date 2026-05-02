(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('NewAssetRequestFormController', NewAssetRequestFormController);

    function NewAssetRequestFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsManufacturer: true,
            IsPreferredSupplier: true,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            AssetRequestStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            RequestedDate: utl.Formatter.getCurrentDate(),
            ApprovedDate: utl.Formatter.getCurrentDate(),

        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.CanshowSavebtn = false;
        $scope.CanshowSaveandApprovedbtn = false;
        
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (!$scope.item.AssetRequestStatusId) {
                $scope.CanshowSavebtn = false;
                $scope.CanshowSaveandApprovedbtn = true;
            }
            if ($scope.item.AssetRequestStatusId == 1) {
                $scope.CanshowSavebtn = false;
                $scope.CanshowSaveandApprovedbtn = true;
            }
            if ($scope.item.AssetRequestStatusId == 2) {
                $scope.CanshowSavebtn = false;
                $scope.CanshowSaveandApprovedbtn = false;
            }
            // if (data.AssetRequestStatusId == 2)
            //     $scope.item.isRequested = true;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/NewAssetRequest/GetNewAssetRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        /* autosearch starts */
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Name',
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
                Params: [
                    { Key: 5, Value: 2 },
                    { Key: 2, Value: utl.Session.getCurrentFacilityId() }
                ],
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

        // $scope.populateEstimateDisDate = function () {
        //     if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.TransferedDate && $scope.item.TransferedDate != '') {
        //         var TransferedDate = new Date($scope.item.TransferedDate);
        //         $scope.item.ExpectedDischargeDate = new Date(TransferedDate.getFullYear(),
        //             TransferedDate.getMonth(),
        //             TransferedDate.getDate() + parseInt($scope.item.ALOS));
        //     }
        // }
        $scope.save = function () {
            $scope.item.AssetRequestStatusId = 1;
            $scope.saveItem();
        }

        $scope.Requested = function () {
            $scope.item.AssetRequestStatusId = 2;
            $scope.saveItem();
        }

        $scope.Approved = function () {
            $scope.item.AssetRequestStatusId = 3;
            $scope.saveItem();
        }

        $scope.Rejected = function () {
            $scope.item.AssetRequestStatusId = 4;
            $scope.saveItem();
        }

        $scope.Cancelled = function () {
            $scope.item.AssetRequestStatusId = 5;
            $scope.saveItem();
        }


        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/NewAssetRequest/AddNewAssetRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/NewAssetRequest/UpdateNewAssetRequest';
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
                { "Key": "Department" },
                { "Key": "AssetRequestType" },
                { "Key": "Manufacturer" },
                { "Key": "PreferredSupplier" },
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

    NewAssetRequestFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();