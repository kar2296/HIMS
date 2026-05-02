(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MedicineUploadController', MedicineUploadController);

    function MedicineUploadController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        // $scope.item.PatientId= parseInt(utl.Session.getPatientPortalPatientId());
        $scope.currentcontext = {};
        $scope.currentcontext.PatientId = $stateParams.patientid;
        if ($stateParams.contextdata) {
            $scope.currentcontext.file = $stateParams.contextdata.file;
        }
        // $scope.currentcontext.id = $stateParams.id;
        //         $scope.currentcontext.file = null;
        $scope.Proceed = false;
        $scope.PresUploadDetails = [];
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        // $scope.addNew = function () {
        //     $state.go('patientportal.medicineordertab.prescriptionupload', {
        //         id: 0,
        //     });
        // }

        $scope.addNew = function () {
            $state.go('patientportal.medicineordertab.prescriptionupload', {
                id: 0,
                // $scope.currentcontext.file = null;
            });
            $scope.PresUploadDetails = [];
            $scope.item = {};
        }

        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        };
        $scope.addNewLineItem = function () {
            var medicinedetail = {
                Id: 0,
                MedicineOrderId: null,
                OrganizationId: utl.Session.getCurrentOrgId(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                DoctorId: null,
                PatientId: null,
                EncounterId: null,
                DrugId: null,
                DrugCode: '',
                DrugName: '',
                MedicineOrderDate: utl.Formatter.getCurrentDate()
            };

            $scope.PresUploadDetails.push(medicinedetail);
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };
        // $scope.proceedattachment = function () {
        //     $scope.Proceed = true;
        // }

        $scope.proceedattachment = function (item) {
            if (!$scope.currentcontext.file) {
                utl.Alert.showErrorMsg($translate.instant('Please Attach Your Prescription'));
                return false;
            }
            $state.go('patientportal.medicineordertab.deliveryaddress', {
                prescriptionData: $scope.item,
                patientid: $scope.currentcontext.PatientId,
                contextdata: $scope.currentcontext
            });
        }

        $scope.saveandApprove = function () {
            $scope.item.MedicineOrderStatusId = 1;
            $scope.saveItem();
        }
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.getImagesCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Image = data.PrescriptionAttachment;
        };

        $scope.getImages = function () {
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

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item = data.Data[0];
                $scope.currentcontext.id = $scope.item.Id;
                $scope.getImages();
            }
            $scope.addNewLineItem();
        };

        $scope.getItem = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.PatientId },
                ]
            };
            var options = {
                action: 'VirtualHealthcare/VirtualMedicineOrder/GetVirtualMedicineOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };


        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            var actionName = 'VirtualHealthcare/VirtualMedicineOrder/AddVirtualMedicineOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualMedicineOrder/UpdateVirtualMedicineOrder';
            }
            var lines = $scope.PresUploadDetails;
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
                }).then(function (resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.currentcontext.file = null;
                    $scope.getItem();
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
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getItem();
            $scope.addNewLineItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ConsultancyType"
            },
            {
                "Key": "Organization"
            },
            {
                "Key": "Facility"
            }

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

    MedicineUploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})(); 