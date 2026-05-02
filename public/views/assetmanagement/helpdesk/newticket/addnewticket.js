(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('addnewticketController', addnewticketController);

    function addnewticketController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.item = {
            PriorityId: 1,
            ServiceTypeId: -1,
            SeviorityId: 2,
            FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            FacilityId: utl.Session.getCurrentFacilityId(),
            ReportedById: utl.Session.getCurrentUserId(),
            OnBehalfofUser: false,
        };
        $scope.IsDisbled = false;
        $scope.BehalfofUser = true;
        $scope.currentcontext = {
            file: null,
            view: 'inhouse',
            usergroupid: parseInt(utl.Session.getUserGroupId()),
            CurrentDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext.CanSave = utl.Privilege.hasPrivilege('CanSave')
        $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove')
        $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint')
        $scope.lookup = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($scope.currentcontext.usergroupid == 7) {
            $scope.item.OnBehalfofUser = true;
            $scope.BehalfofUser = false;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.requestedName;
            if (data.AssetTicketStatusId == 1) {
                $scope.item.AssetTicketStatus = "Draft";
            }
            if (data.AssetTicketStatusId == 2) {
                $scope.item.AssetTicketStatus = "Created";
                $scope.IsDisbled = true;
                $scope.item.requestedName;
            }
            if (data.AssetTicketStatusId == 3) {
                $scope.item.AssetTicketStatus = "Assigned to FieldAgent";
            }
            if (data.AssetTicketStatusId == 4) {
                $scope.item.AssetTicketStatus = "Assigned to ExternalStockHolder";
            }
            if (data.AssetTicketStatusId == 5) {
                $scope.item.AssetTicketStatus = "Assigned to Institution";
            }
            if (data.AssetTicketStatusId == 6) {
                $scope.item.AssetTicketStatus = "Deferred";
                $scope.IsDisbled = true;
            }
            if (data.AssetTicketStatusId == 7) {
                $scope.item.AssetTicketStatus = "Resolved";
                $scope.IsDisbled = true;
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.AssetTicketStatus = "Closed";
                $scope.IsDisbled = true;
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.AssetTicketStatus = "Cancelled";
                $scope.IsDisbled = true;
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.AssetTicketStatus = "Reopened";
                $scope.IsDisbled = true;
            }


            // $scope.getCreatedUser();
            $scope.applyVisibilityRules();
            // $scope.item.CreatedUser = utl.Formatter.getCurrentUserId();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.IsDisbled = true;
                $scope.BehalfofUser = true;
                var options = {
                    action: 'AssetManagement/ServiceRequest/GetServiceRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }

        };
        $scope.SetDispExpDate = function (item) {
            item.dispExpDate = moment(item.ExpectedDate);
            $scope.checkexpeceddate(item);
        };
        $scope.checkexpeceddate = function (item) {
            if (item.dispExpDate < $scope.currentcontext.CurrentDate) {
                utl.Alert.showErrorMsg($translate.instant('Expected Date Should Be a Future Date'));
                $scope.item.ExpectedDate = '';
            }
        }

        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };
        $scope.downloadFile = function (item) {
            var inputData = { FilePath: item.FilePath };
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequestFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.download = function (item) {
            $scope.downloadFile(item);
        }

        // attachment code starts
        $scope.fileSelected = function () {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.Name = $scope.currentcontext.file.name;
            }
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.save = function () {
            if ($scope.currentcontext.id == 0) { $scope.item.AssetTicketStatusId = 1; }
            $scope.saveItem();
        };

        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {
                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowApproveBtn = true;
            } else {
                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = false;
                $scope.canShowApproveBtn = true;
                if ($scope.item.AssetTicketStatusId == 1) { //draft
                    $scope.canShowCancelRequestBtn = true;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = false;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = true;
                }
                if ($scope.item.AssetTicketStatusId == 2) { //created
                    $scope.canShowCancelRequestBtn = true;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 3) { //assigned
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 4) { //processed
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 5) { //Deferred
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 6) { //solved
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 7) { //resolved
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 8) { //closed
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
            }
        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AssetTicketStatusId = 2;
            $scope.item.RequestedBy = utl.Session.getCurrentUserId();
            $scope.item.RequestedBy = utl.Session.getCurrentUserId();
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.requestmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.cancelticket = function () {
            $scope.item.AssetTicketStatusId = 9;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (options.data.Data.AssetTicketStatusId == 2) {
                $scope.backToList();
            }
            if (options.data.Data.AssetTicketStatusId == 9) {
                $scope.confirmCallback();
                $state.reload();
            }
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'AssetManagement/ServiceRequest/AddServiceRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
                if ($scope.item.AssetTicketStatusId == 1) {
                    $scope.item.AssetTicketStatusId = 2;
                }
            }
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.currentcontext.file = null;
                    $scope.backToList();
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // user autosearch starts
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
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
            if ($scope.currentcontext.id == 0) {
                $scope.item.PhoneNo = selectedItem.Mobile;
            }
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserName].join(' ');
            }
            return result;
        }
        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [
                    // { Key: 2, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 5, Value: 2 },
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };
            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.usercontrolconfig.searchparams = inputData;
        }
        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                if (item.Title)
                    item.UserName = item.Title.Description + ' ' + item.FirstName;
                $scope.item.requestedName = item.UserName;
            }
        }

        // user autosearch ends

        //facility autosearch starts
        vm.facilitycontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Facility Code', field: 'FacilityCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Facility Name', field: 'FacilityName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/Facility/GetFacilitys',
            formatdisplay: formatselectedfacilityitem,
            presearch: presearchfacilityitem,
            postsearch: postsearchfacilityitem
        };

        function formatselectedfacilityitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.facilitycontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.FacilityName;
            } else if (vm.facilitycontrolconfig.rowdata) {
                result = vm.facilitycontrolconfig.rowdata.FacilityName;
            }
            $scope.item.FacilityCode = selectedItem.FacilityCode;
            $scope.item.FacilityName = selectedItem.FacilityName;
            return result;
        }

        function presearchfacilityitem() {
            var query = vm.facilitycontrolconfig.query;
            var inputData = {
                Params: [
                    // { Key: 0, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 3, Value: 2 },
                    { Key: 4, Value: false }
                ],
                // PageContext: { PageSize: 100, PageNumber: 1 }
            };

            if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.facilitycontrolconfig.searchparams = inputData;
        }

        function postsearchfacilityitem() {
            for (var idx in vm.facilitycontrolconfig.result) {
                var item = vm.facilitycontrolconfig.result[idx];
                $scope.item.FacilityCode = item.FacilityCode;
                $scope.item.FacilityName = item.FacilityName;
            }
        }
        //facility autosearch ends

        //autosearch related code starts -
        vm.assetcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Asset Name', field: 'AssetName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-assetname' },
                { header: 'Asset Type', field: 'AssetTypeId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-assettype' },
                { header: 'Serial Number', field: 'Serial', datatype: 'string', headercls: 'td-name', fieldcls: 'td-serialnumber' },
                { header: 'Model Number', field: 'ModelNum', datatype: 'string', headercls: 'td-name', fieldcls: 'td-modelnumber' },
                { header: 'Manufacturer', field: 'ManufacturerId', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Vendor', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-vendor' }
            ],
            searchparams: {},
            result: {},
            api: 'AssetManagement/Asset/GetAssets',
            formatdisplay: formatselectedpurchaseitem,
            presearch: presearchpurchaseitem,
            postsearch: postsearchpurchaseitem
        };

        function formatselectedpurchaseitem() {
            var selectedItem = vm.assetcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.AssetName].join(' ');
                $scope.item.ManufacturerId = selectedItem.ManufacturerId;
                $scope.item.VendorId = selectedItem.VendorId;
                $scope.item.AssetTypeId = selectedItem.AssetTypeId;
                $scope.item.Serial = selectedItem.Serial;
                $scope.item.AssetName = selectedItem.AssetName;
                $scope.item.ModelNum = selectedItem.ModelNum;
            } else if (vm.assetcontrolconfig.rowdata) {
                result = [vm.assetcontrolconfig.rowdata.AssetName,
                vm.assetcontrolconfig.rowdata.AssetTypeId,
                vm.assetcontrolconfig.rowdata.Serial,
                vm.assetcontrolconfig.rowdata.ModelNum,
                vm.assetcontrolconfig.rowdata.ManufacturerId,
                vm.assetcontrolconfig.rowdata.VendorId,
                ].join(' ');
            }
            return result;
        }

        function presearchpurchaseitem() {
            var query = vm.assetcontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    { Key: 17, Value: $scope.item.FacilityId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.assetcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 14, Value: query });
            }

            vm.assetcontrolconfig.searchparams = inputData;
        }

        function postsearchpurchaseitem() {
            for (var idx in vm.assetcontrolconfig.result) {
                var item = vm.assetcontrolconfig.result[idx];
                item.AssetName = item.AssetName;
                if (item.AssetType)
                    item.AssetTypeId = item.AssetType.Description;
                item.Serial = item.Serial;
                item.ModelNum = item.ModelNum;
                if (item.Manufacturer)
                    item.ManufacturerId = item.Manufacturer.Description;
                if (item.Vendor)
                    item.VendorName = item.Vendor.VendorName;
            }
        }
        //autosearch related code ends - -
        $scope.assetdetails = function (AssetId) {
            utl.Modal.open('app.assetprofile', {
                params: { aid: AssetId },
                confirmCallback: $scope.getList
            });
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }

        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initAllLookup = function () {
            var inputData = [
                { "Key": "Severity" },
                {"Key": "Company" },
                { "Key": "AssetTicketStatus" },
                { "Key": "PRIORITY" },
                { "Key": "AssetServiceType" },
                { "Key": "AssetType" },
                { "Key": "AssignType" },
                // {
                //     "Key": "User",
                //     Request: {
                //         Params: [
                //             { Key: 2, Value: utl.Session.getCurrentFacilityId() },
                //             { Key: 5, Value: 2 },
                //         ]
                //     }
                // },
                { "Key": "Department" },
                { "Key": "AssetDepartment" },
                { "Key": "SubDepartment" },
                { "Key": "TicketCategory" },

            ]
            $scope.lookupCall(inputData);
            $scope.getItem();
        }

        $scope.initAllLookup();
    }
    addnewticketController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload'];

})();