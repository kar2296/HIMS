(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderHistoryViewController', OrderHistoryViewController);

    function OrderHistoryViewController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.pharmacyInfo = $stateParams.pharmacydata;
        $scope.facilityinfo = $stateParams.facilityinfo;
        $scope.currentcontext.id = $stateParams.id;
        $scope.currentcontext.file = $stateParams.contextdata.file;
        $scope.currentcontext.image = null;
        $scope.CanShowDownload = false;

        $scope.canShowDeliveryBtn = false;
        $scope.canShowCancelBtn = false;
        // $scope.currentcontext.file = $stateParams.file.file;
        // $scope.item.MedicineOrderDate = $scope.pharmacyInfo.MedicineOrderDate;
        // $scope.item.DeliveryAddress = $scope.pharmacyInfo.DeliveryAddress;
        // $scope.item.FirstName = $scope.pharmacyInfo.FirstName;
        // $scope.item.LastName = $scope.pharmacyInfo.LastName;
        // $scope.item.PhoneNo = $scope.pharmacyInfo.PhoneNo;
        // $scope.item.PinCode = $scope.pharmacyInfo.PinCode;
        // $scope.item.LandMark = $scope.pharmacyInfo.LandMark;
        // $scope.item.PrescriptionAttachment = $scope.pharmacyInfo.PrescriptionAttachment;
        // $scope.item.CityId = $scope.pharmacyInfo.CityId;
        // $scope.item.PharmacyId = $scope.facilityinfo.Id;
        // $scope.item.StateId = $scope.pharmacyInfo.StateId;
        // $scope.item.PrescriptionAttachment = $scope.pharmacyInfo.PrescriptionAttachment;
        // $scope.item.PatientId = parseInt(utl.Session.getPatientPortalPatientId());
        //         $scope.currentcontext.file = null;
        $scope.Proceed = false;
        $scope.PresUploadDetails = [];
        $scope.backToList = function() {
            $state.go('patientportal.medicineordertab.orderhistory', {
                id: 0
            });
        }
        $scope.addNewLineItem = function() {
            var medicinedetail = {
                Id: 0,
                MedicineOrderId: null,
                OrganizationId: utl.Session.getCurrentOrgId(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                DoctorId: 0,
                PatientId: $scope.item.PatientId,
                PharmacyId: $scope.item.PharmacyId,
                EncounterId: 0,
                DrugId: 0,
                DrugCode: '',
                DrugName: '',
                MedicineOrderDate: utl.Formatter.getCurrentDate(),
                Status: 1
            };

            $scope.PresUploadDetails.push(medicinedetail);
        };

        $scope.DeliveryAddress = function(item) {
            $state.go('patientportal.medicineordertab.selectpharmacy', {
                deliverydata: $scope.item,
                contextdata: $scope.currentcontext
            });
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.home();
            // $scope.getItem();
        };
        $scope.home = function() {
            $state.go('patientportal.virtualhealthcare');
        }
        $scope.proceedattachment = function() {
            $scope.Proceed = true;
        }

        $scope.saveandApprove = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to Deliver Order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onsaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onsaveandApproveConfirmed = function() {
            $scope.item.MedicineOrderStatusId = 2;
            $scope.saveItem();
        };

        $scope.cancelorder = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to Cancel Order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.oncancelorderConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.oncancelorderConfirmed = function() {
            $scope.item.MedicineOrderStatusId = 4;
            $scope.saveItem();
        };
        $scope.clear = function() {
            $scope.item = {};
        }

        $scope.getImagesCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Image = data.PrescriptionAttachment;
        };

        $scope.getImages = function() {
            if ($scope.item.PrescriptionAttachment) {
                var inputData = {
                    Id: $scope.item.Id,
                    PrescriptionAttachment: $scope.item.PrescriptionAttachment
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualMedicineOrder/GetAttachmentFile',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getImagesCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.getImages1Callback = function (scope, data, options, hasError) {
        //     $scope.currentcontext.Image1 = data.InvoiceAttachment;
        // };

        // $scope.getImages1 = function () {
        //     if ($scope.item.InvoiceAttachment) {
        //         var inputData = {
        //             Id: $scope.item.Id,
        //             InvoiceAttachment: $scope.item.InvoiceAttachment
        //         };
        //         var options = {
        //             action: 'VirtualHealthcare/VirtualMedicineOrder/GetInvoiceAttachmentFile',
        //             data: {
        //                 Data: inputData
        //             },
        //             type: 'post',
        //             onComplete: $scope.getImages1Callback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     $scope.item = data;
        //     // if (data.Data.length > 0) {
        //     //     $scope.item = data.Data[0];
        //     //     $scope.currentcontext.id = $scope.item.Id;
        //     //     $scope.item.MedicineOrderDate = $scope.pharmacyInfo.MedicineOrderDate;
        //     //     $scope.item.DeliveryAddress = $scope.pharmacyInfo.DeliveryAddress;
        //     //     $scope.item.FirstName = $scope.pharmacyInfo.FirstName;
        //     //     $scope.item.LastName = $scope.pharmacyInfo.LastName;
        //     //     $scope.item.PhoneNo = $scope.pharmacyInfo.PhoneNo;
        //     //     $scope.item.PinCode = $scope.pharmacyInfo.PinCode;
        //     //     $scope.item.LandMark = $scope.pharmacyInfo.LandMark;
        //     //     $scope.item.PrescriptionAttachment = $scope.pharmacyInfo.PrescriptionAttachment;
        //     //     $scope.item.CityId = $scope.pharmacyInfo.CityId;
        //     //     $scope.item.PharmacyId = $scope.facilityinfo.Id;
        //     //     $scope.item.StateId = $scope.pharmacyInfo.StateId;
        //     //     $scope.item.PrescriptionAttachment = $scope.pharmacyInfo.PrescriptionAttachment;
        //     //     $scope.item.PatientId = parseInt(utl.Session.getPatientPortalPatientId());
        //     //     $scope.getImages();
        //     // } else {
        //     //     $scope.addNewLineItem();
        //     // }
        // };

        // $scope.getItem = function () {
        //     var inputData = {
        //         Params: [
        //             { Key: 2, Value: $scope.currentcontext.id },

        //         ]
        //     };
        //     var options = {
        //         action: 'VirtualHealthcare/VirtualMedicineOrder/GetVirtualMedicineOrders',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getItemCallback
        //     };

        //     utl.Http.doAction(options);
        // };
        $scope.applyVisibilityRules = function() {
            // New
            if (!$scope.item.MedicineOrderStatusId) {
                $scope.canShowDeliveryBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.item.DisplayStatus = '';
            }
            if ($scope.item.MedicineOrderStatusId == 1) {
                $scope.canShowDeliveryBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.item.DisplayStatus = 'Pending';
            }
            if ($scope.item.MedicineOrderStatusId == 2) {
                $scope.canShowDeliveryBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.item.DisplayStatus = 'Delivery';
            }
            if ($scope.item.MedicineOrderStatusId == 3) {
                $scope.canShowDeliveryBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.item.DisplayStatus = 'Completed';
            }
            if ($scope.item.MedicineOrderStatusId == 4) {
                $scope.canShowDeliveryBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.item.DisplayStatus = 'Cancelled';
            }
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            if (data.InvoiceAttachment) {
                $scope.CanShowDownload = true;
            }
            $scope.item = data;
            $scope.item.DeliveryAddress = $scope.item.DeliveryAddress;
            $scope.item.DeliveryAmount = $scope.item.DeliveryAmount;
            $scope.item.DeliveryDate = $scope.item.DeliveryDate;
            $scope.item.StateId = $scope.item.StateId;
            $scope.item.CityId = $scope.item.CityId;
            $scope.item.PhoneNo = $scope.item.PhoneNo;
            $scope.item.MedicineOrderStatusId = $scope.item.MedicineOrderStatusId;
            $scope.item.MedicineOrderDate = $scope.item.MedicineOrderDate;
            $scope.item.MedicineOrderNo = $scope.item.MedicineOrderNo;
            $scope.item.PharmacyId = $scope.item.PharmacyId;
            $scope.item.PharmacyName = $scope.item.PharmacyFacility.FacilityName;
            $scope.item.PharmacyAddress1 = $scope.item.PharmacyFacility.AddressLine1;
             $scope.item.PharmacyAddress2 = $scope.item.PharmacyFacility.AddressLine2;
              $scope.item.PharmacyNo = $scope.item.PharmacyFacility.Mobile;
            $scope.applyVisibilityRules();
            // $scope.getImages1();
            $scope.getImages();
        };

        $scope.getItem = function() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'VirtualHealthcare/VirtualMedicineOrder/GetVirtualMedicineOrderById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };


        $scope.getImagesCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Image = data.PrescriptionAttachment;
        };

        $scope.getImages = function() {
            if ($scope.item.PrescriptionAttachment) {
                var inputData = {
                    Id: $scope.item.Id,
                    PrescriptionAttachment: $scope.item.PrescriptionAttachment
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualMedicineOrder/GetAttachmentFile',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getImagesCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getprescriptionImagesCallback = function(scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };
        // 
        $scope.getprescriptionImages = function(item) {
            // if ($scope.item.PrescriptionAttachment) {
            var inputData = { PrescriptionAttachment: item.PrescriptionAttachment };
            var options = {
                action: 'VirtualHealthcare/VirtualMedicineOrder/GetPrescriptionAttachmentFile',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.getprescriptionImagesCallback
            };
            utl.Http.doDownload(options);
            // }
        };

        //Download File
        $scope.downloadFileCallback = function(scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function(item) {
            var inputData = { InvoiceAttachment: item.InvoiceAttachment };
            var options = {
                action: 'VirtualHealthcare/VirtualMedicineOrder/GetInvoiceAttachmentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.fileSelected = function() {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.Name = $scope.currentcontext.file.name;
            }
        }


        $scope.saveItem = function() {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            var actionName = 'VirtualHealthcare/VirtualMedicineOrder/AddVirtualMedicineOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualMedicineOrder/UpdateVirtualMedicineOrderDelivery';
            }
            var lines = $scope.PresUploadDetails;
            $scope.item.DoctorId = 0;
            $scope.item.EncounterId = 0;
            $scope.item.CityId = 0;
            $scope.item.StateId = 0;
            $scope.item.latitudeId = 0;
            $scope.item.longitudeId = 0;
            $scope.item.PaymentModeId = 0;
            $scope.item.OrderAmount = 0;
            $scope.item.TotalNetAmount = 0;
            $scope.item.DeliveryAmount = 0;
            $scope.item.DeliveryDate = utl.Formatter.getCurrentDate();
            var inputData = {
                Header: $scope.item,
                Details: lines
            }
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: inputData
                    },
                }).then(function(resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.getItem();
                    },
                    function(resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function(evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            // $scope.addNewLineItem();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "ConsultancyType"
                },
                {
                    "Key": "Organization"
                },
                {
                    "Key": "Facility"
                },
                { "Key": "MedicineOrderStatus" }

            ]
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

    OrderHistoryViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();