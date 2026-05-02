(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceRequestFormController', serviceRequestFormController);

    function serviceRequestFormController($scope, $stateParams, $state, $translate, utl,$uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {
            PriorityId: 1,
            ServiceTypeId: -1,
            SeviorityId: 2,
            WOStatusId: -1,
            AssignTypeId: -1,
            FromDepartmentId: utl.Session.getCurrentDepartmentId(),
        };

        $scope.currentcontext = {
            file: null
        };
        $scope.lookup = {};
       if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.selectedPatient = {};
        $scope.getPatientInfo = function(scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }
        $scope.assetfilterconfig = {
            isvisitinprogress: false
        };
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function() {
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

        $scope.getCreatedUserCallback = function(scope, res, options, hasError) {
            $scope.CreatedUser = res.Data[0];
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getCreatedUser = function() {
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

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            //$scope.currentfilter.PatientId = $scope.item.PatientId;
            // $scope.item.AdmissionDate = new Date(data.AdmissionDate);
            // if ($scope.item.ServiceRequestStatusId >= 2) { $scope.isDisabled = true; }
            // $scope.loadAdditionalLookup();
            // $scope.visiblityRule();


            if (data.ServiceRequestStatusId == 1) {
                $scope.item.ServiceRequestStatus = "Draft";
            }
            if (data.ServiceRequestStatusId == 2) {
                $scope.item.ServiceRequestStatus = "Requested";
            }
            if (data.ServiceRequestStatusId == 3) {
                $scope.item.ServiceRequestStatus = "Assigned";
            }
            if (data.ServiceRequestStatusId == 4) {
                $scope.item.ServiceRequestStatus = "Completed";
            }
            if (data.ServiceRequestStatusId == 5) {
                $scope.item.ServiceRequestStatus = "Cancelled";
            }
            if (data.ServiceRequestStatusId == 6) {
                $scope.item.ServiceRequestStatus = "OnHold";
            }
            if (data.ServiceRequestStatusId == 7) {
                $scope.item.ServiceRequestStatus = "InProgress";
            }
            if (data.ServiceRequestStatusId == 8) {
                $scope.item.ServiceRequestStatus = "Closed";
            }

            $scope.getCreatedUser();
            $scope.applyVisibilityRules();
            $scope.item.CreatedUser = utl.Formatter.getCurrentUserId();
        };

        $scope.getItem = function(pageNo) {
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
        $scope.fileSelected = function() {
                if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                    $scope.item.Name = $scope.currentcontext.file.name;
                }
            }
            // attachment code ends
        // $scope.backToList = function() {
        //     $state.go('patientemr.patientfeedbacks');
        // }
  $scope.backToList = function () {
         $scope.confirmCallback();
    }
        $scope.clearItem = function() {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.save = function() {
            if ($scope.currentcontext.id == 0) { $scope.item.ServiceRequestStatusId = 1; }

            $scope.saveItem();
        };

        $scope.applyVisibilityRules = function() {
            // Draft

            if ($scope.currentcontext.id <= 0) {

                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowApproveBtn = true;


            } else {
                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowApproveBtn = true;

                if ($scope.item.ServiceRequestStatusId == 1) { //draft
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = true;

                }

                if ($scope.item.ServiceRequestStatusId == 2) { //requested
                    $scope.canShowCancelRequestBtn = true;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;


                }

                if ($scope.item.ServiceRequestStatusId == 3) { //assigned
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.ServiceRequestStatusId == 4) { //completed
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.ServiceRequestStatusId == 5) { //cancelled
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.ServiceRequestStatusId == 6) { //onhold
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.ServiceRequestStatusId == 8) { //closed
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
        $scope.saveAndApprove = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.ServiceRequestStatusId = 2;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.requestmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);


        };
        $scope.saveAndAssign = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.ServiceRequestStatusId = 3;
            $scope.saveItem();
        }
        $scope.saveAndComplete = function() {
            $scope.item.ServiceRequestStatusId = 4;
            $scope.saveItem();
        }
        $scope.onCancelConfirmed = function() {
            $scope.item.ServiceRequestStatusId = 5;
            var actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.CancelRequest = function() {
            utl.Dialog.confirmCancel($scope.onCancelConfirmed, $scope.currentcontext.id, $scope.item.TicketNumberIdentifier);
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };


        // $scope.changeServiceRateCategory = function (selectedItem) {
        //     $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategory.Id;
        // }
        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'AssetManagement/ServiceRequest/AddServiceRequest';
            var actionUrl = utl.Http.getRootPath() + actionName;
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
                if ($scope.item.ServiceRequestStatusId == 1) {
                    $scope.item.ServiceRequestStatusId = 2;
                }
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
            Upload.upload({
                url: actionUrl,
                data: {
                    file: $scope.currentcontext.file,
                    Data: $scope.item
                }
            }).then(function(resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.currentcontext.file = null;
                    $scope.backToList();
                },
                function(resp) { //catch error
                    console.log('Error status: ' + resp.status);
                    utl.Alert.showErrorMsg('Error status: ' + resp.status);
                },
                function(evt) {
                    console.log(evt);
                });
        };
        //autosearch related code starts - 
        vm.servicerequestcontrolconfig = {
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
            } else if (vm.servicerequestcontrolconfig.rowdata) {
                result = [vm.servicerequestcontrolconfig.rowdata.AssetName,
                    vm.servicerequestcontrolconfig.rowdata.AssetTypeId,
                    vm.servicerequestcontrolconfig.rowdata.Serial,
                    vm.servicerequestcontrolconfig.rowdata.ModelNum,
                    vm.servicerequestcontrolconfig.rowdata.ManufacturerId,
                    vm.servicerequestcontrolconfig.rowdata.VendorId,
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
                item.ManufacturerId = item.Manufacturer.Description;
                item.VendorId = item.VendorId;
            }
        }
        //autosearch related code ends - - 


        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            });
        }

        $scope.lookupCall = function(inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initAllLookup = function() {
            var inputData = [
                { "Key": "Severity" },
                { "Key": "ServiceRequestStatus" },
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
    serviceRequestFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();