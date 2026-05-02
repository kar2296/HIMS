(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceRequestFormController', serviceRequestFormController);

    function serviceRequestFormController($scope, $stateParams, Upload, $state, $translate, utl) {
        var vm = this;
        $scope.item = {
            PriorityId: 1,
            ServiceTypeId: -1,
            SeviorityId: 2,
            WOStatusId: -1,
            AssignTypeId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDepartmentId: utl.Session.getCurrentDepartmentId(),
        };

        $scope.currentcontext = {
            file: null
        };
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.selectedPatient = {};
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }
        $scope.assetfilterconfig = {
            isvisitinprogress: false
        };
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function () {
            //console.log($scope.item.PatientId);
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'AssetManagement/Asset/GetAssetById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getCreatedUserCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getCreatedUser = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.id }
                ]
            };

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCreatedUserCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            //$scope.currentfilter.PatientId = $scope.item.PatientId;
            // $scope.item.AdmissionDate = new Date(data.AdmissionDate);
            // if ($scope.item.AssetTicketStatusId >= 2) { $scope.isDisabled = true; }
            // $scope.loadAdditionalLookup();
            // $scope.visiblityRule();


            if (data.AssetTicketStatusId == 1) {
                $scope.item.isRequested = false;
                $scope.item.AssetTicketStatus = "Draft";
            }
            if (data.AssetTicketStatusId == 2) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Created";
            }
            if (data.AssetTicketStatusId == 3) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Assigned";
            }
            if (data.AssetTicketStatusId == 4) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Processing/Pending";
            }
            if (data.AssetTicketStatusId == 5) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Deferred";
            }
            if (data.AssetTicketStatusId == 6) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Solved";
            }
            if (data.AssetTicketStatusId == 7) {
                $scope.item.isRequested = false;
                $scope.item.AssetTicketStatus = "Resolved";
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Closed";
            }

            $scope.getCreatedUser();
            $scope.applyVisibilityRules();
            $scope.item.CreatedUser = utl.Formatter.getCurrentUserId();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.IsDisbled = false;
                var options = {
                    action: 'AssetManagement/ServiceRequest/GetServiceRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }

        };
        // attachment code starts
        $scope.fileSelected = function () {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.Name = $scope.currentcontext.file.name;
            }
        }
        // attachment code ends
        $scope.backToList = function () {
            $state.go('app.serviceRequestList');
        }

        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.save = function () {
            // if ($scope.currentcontext.id == 0) { $scope.item.AssetTicketStatusId = 1; }

            // $scope.saveItem();
            
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AssetTicketStatusId = 2;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.requestmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {

                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = false;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowApproveBtn = true;


            } else {
                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowApproveBtn = true;

                if ($scope.item.AssetTicketStatusId == 1) { //draft
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = true;

                }

                if ($scope.item.AssetTicketStatusId == 2) { //created
                    $scope.canShowCancelRequestBtn = true;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = true;


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
            $scope.item.AssetTicketStatusId = 7;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.requestmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);


        };
        $scope.saveAndAssign = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AssetTicketStatusId = 3;
            $scope.saveItem();
        }
        $scope.saveAndComplete = function () {
            $scope.item.AssetTicketStatusId = 5;
            $scope.saveItem();
        }
        $scope.onCancelConfirmed = function () {
            $scope.item.AssetTicketStatusId = 4;
            var actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.CancelRequest = function () {
            utl.Dialog.confirmCancel($scope.onCancelConfirmed, $scope.currentcontext.id, $scope.item.TicketNumberIdentifier);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        // $scope.print = function () {
        //     var inputData = {
        //         Id: $scope.currentcontext.id,
        //     };
        //     var options = {
        //         action: 'AssetManagement/ServiceRequest/PrintServiceRequest',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // };

        // $scope.changeServiceRateCategory = function (selectedItem) {
        //     $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategory.Id;
        // }
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

            // var options = {
            //     action: actionName,
            //     data: { Data: $scope.item },
            //     type: 'post',
            //     onComplete: $scope.saveItemCallback
            // };
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
        //autosearch related code starts -
        vm.servicerequestcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Asset Name', field: 'AssetName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-assetname' },
                { header: 'Unique Id', field: 'ShortCode', datatype: 'string', headercls: 'td-name', fieldcls: 'td-uniqueid' },
                { header: 'Asset Type', field: 'AssetTypeId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-assettype' },
                { header: 'Serial Number', field: 'Serial', datatype: 'string', headercls: 'td-name', fieldcls: 'td-serialnumber' },
                { header: 'Model Number', field: 'ModelNum', datatype: 'string', headercls: 'td-name', fieldcls: 'td-modelnumber' },
                { header: 'Manufacturer', field: 'ManufacturerId', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Vendor', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-vendor' },

            ],
            searchparams: {},
            result: {},
            api: 'AssetManagement/Asset/GetAssets',
            formatdisplay: formatselectedpurchaseitem,
            presearch: presearchpurchaseitem,
            postsearch: postsearchpurchaseitem
        };

        function formatselectedpurchaseitem() {
            var selectedItem = vm.servicerequestcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.AssetName].join(' ');
                $scope.item.ManufacturerId = selectedItem.ManufacturerId;
                $scope.item.VendorId = selectedItem.VendorId;
                $scope.item.AssetTypeId = selectedItem.AssetTypeId;
                $scope.item.Serial = selectedItem.Serial;
                $scope.item.AssetName = selectedItem.AssetName;
                $scope.item.ModelNum = selectedItem.ModelNum;
                $scope.item.ShortCode = selectedItem.ShortCode;


            } else if (vm.servicerequestcontrolconfig.rowdata) {
                result = [vm.servicerequestcontrolconfig.rowdata.AssetName,
                vm.servicerequestcontrolconfig.rowdata.AssetTypeId,
                vm.servicerequestcontrolconfig.rowdata.Serial,
                vm.servicerequestcontrolconfig.rowdata.ModelNum,
                vm.servicerequestcontrolconfig.rowdata.ManufacturerId,
                vm.servicerequestcontrolconfig.rowdata.VendorId,
                vm.servicerequestcontrolconfig.rowdata.ShortCode,

                ].join(' ');
            }
            return result;
        }

        function presearchpurchaseitem() {
            var query = vm.servicerequestcontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    // //  { Key: 4, Value: $scope.item.AssetName },
                    // { Key: 4, Value: $scope.item.ActiveStatusId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.servicerequestcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 14, Value: query });
            }

            vm.servicerequestcontrolconfig.searchparams = inputData;
        }

        function postsearchpurchaseitem() {
            for (var idx in vm.servicerequestcontrolconfig.result) {
                var item = vm.servicerequestcontrolconfig.result[idx];
                item.AssetName = item.AssetName;
                item.AssetTypeId = item.AssetType.Description;
                item.Serial = item.Serial;
                item.ModelNum = item.ModelNum;
                if (item.Manufacturer)
                    item.ManufacturerId = item.Manufacturer.Description;
                item.VendorId = item.VendorId;
                item.ShortCode = item.ShortCode;

            }
        }
        //autosearch related code ends - -

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
                { "Key": "AssetTicketStatus" },
                { "Key": "PRIORITY" },
                { "Key": "ServiceType" },
                { "Key": "AssetType" },
                { "Key": "AssignType" },
                { "Key": "User" },
                { "Key": "Department" },
                { "Key": "SubDepartment" },

            ]
            $scope.lookupCall(inputData);
            $scope.getItem();
        }

        $scope.initAllLookup();
    }
    serviceRequestFormController.$inject = ['$scope', '$stateParams', 'Upload', '$state', '$translate', 'utl'];

})();