(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('DelivaryAddressController', DelivaryAddressController);

    function DelivaryAddressController($scope, $stateParams, $state, $translate, $timeout, utl, Upload) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
            MedicineOrderDate: utl.Formatter.getCurrentDate(),
            DeliveryDate: utl.Formatter.getCurrentDate(),

        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.prescriptionInfo = $stateParams.prescriptionData;
        $scope.currentcontext.file = $stateParams.contextdata.file;
        $scope.currentcontext.id = $stateParams.contextdata.id;
        $scope.item.PatientId = $stateParams.patienid;
        if ($stateParams.deliverydata) {
            $scope.item = $stateParams.deliverydata;
        }
        // $scope.item.PrescriptionAttachment = $scope.prescriptionInfo.PrescriptionAttachment;
        // $scope.item.PatientId = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.Proceed = false;
        $scope.PresUploadDetails = [];
        $scope.backToList = function() {
                $state.go('patientportal.medicineordertab.prescriptionupload', {
                    prescriptionData: $scope.item,
                    patientid: $scope.currentcontext.PatientId,
                    contextdata: $scope.currentcontext,
                    file: $scope.currentcontext.file
                });

            }
            /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function() {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.Area = '';
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = '';
            var address2 = '';
            var city = '';
            var area = '';
            var state = '';
            var country = '';
            var pincode = '';
            for (var i = 0; i < addressComponents.length; i++) {
                if (i == 0)
                    $scope.clearpreviousaddress();

                var addressType = addressComponents[i].types[0];
                if (addressType) {
                    if ('premise' == addressType) { // Address 1
                        address1 = addressComponents[i].long_name;
                    } else if ('sublocality_level_1' == addressType) { // Address 2
                        address2 = addressComponents[i].long_name;
                    } else if ('route' == addressType) { // Area
                        city = addressComponents[i].long_name;
                    } else if ('locality' == addressType) { // city
                        area = addressComponents[i].long_name;
                    } else if ('administrative_area_level_1' == addressType) { // state
                        state = addressComponents[i].long_name;
                    } else if ('country' == addressType) { // country
                        country = addressComponents[i].long_name;
                    } else if ('postal_code' == addressType) { // pincode
                        pincode = addressComponents[i].long_name;
                    }
                }
            }
            $scope.item.DeliveryAddress = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            // $scope.item.DeliveryAddress = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
                $scope.getPincodeData(pincode);
        });

        $scope.numberonly = function(e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function(scope, res, options, hasError) {
            if (res.Data) {
                if (res.Data.length > 0) {
                    $scope.item.PinCodeId = res.Data[0].Id;
                    $scope.item.Area = res.Data[0].Area;
                    $scope.item.CityId = res.Data[0].CityId;
                    $scope.item.StateId = res.Data[0].StateId;
                    $scope.item.CountryId = res.Data[0].CountryId;
                }
            }
        };

        $scope.getPincodeData = function(pincode) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: pincode
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/PincodeMaster/GetPincodeMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPincodeDataCallback
            };
            utl.Http.doAction(options);
        };

        $scope.enablegoogleaddopt = function() {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function() {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */

        $scope.addNew = function() {
            $state.go('app.virtualcategoryform', {
                id: 0
            });
        }

        $scope.CheckOrderDate = function(item) {
            var apnmntDate = new Date(utl.Formatter.getDateStringForAppointment(item.MedicineOrderDate));
            var crntdate = new Date(utl.Formatter.getDateStringForAppointment(utl.Formatter.getCurrentDate()));
            if (apnmntDate < crntdate) {
                utl.Alert.showErrorMsg($translate.instant('Order Date Should Be a Future Date'));
                $scope.item.MedicineOrderDate = utl.Formatter.getCurrentDate();
            } else {
                $scope.getOrderBookList()
            }
        }

        $scope.addNewLineItem = function() {
            var medicinedetail = {
                Id: 0,
                MedicineOrderId: null,
                OrganizationId: utl.Session.getCurrentOrgId(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                DoctorId: null,
                PatientId: $scope.item.PatientId,
                PharmacyId: $scope.item.PharmacyId,
                EncounterId: null,
                DrugId: null,
                DrugCode: '',
                DrugName: '',
                MedicineOrderDate: utl.Formatter.getCurrentDate()
            };

            $scope.PresUploadDetails.push(medicinedetail);
        };

        $scope.DeliveryAddress = function(item) {
            // if (!$scope.item.DeliveryDate) {
            //     utl.Alert.showErrorMsg($translate.instant('Please Select DeliveryDate'));
            //     return false;
            // }
            if (!$scope.item.DeliveryAddress) {
                utl.Alert.showErrorMsg($translate.instant('Please Put Your DeliveryAddress'));
                return false;
            }
            if (!$scope.item.PhoneNo) {
                utl.Alert.showErrorMsg($translate.instant('Please Put Your PhoneNo'));
                return false;
            }
            $state.go('patientportal.medicineordertab.selectpharmacy', {
                deliverydata: $scope.item,
                contextdata: $scope.currentcontext
            });
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };
        $scope.proceedattachment = function() {
            $scope.Proceed = true;
        }

        $scope.saveandApprove = function() {
            $scope.item.MedicineOrderStatusId = 1;
            $scope.saveItem();
        }
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
                    Attachment: $scope.item.PrescriptionAttachment
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

        $scope.getItemCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item = data.Data[0];
                $scope.currentcontext.id = $scope.item.Id;
                $scope.getImages();
            }
            $scope.addNewLineItem();
        };

        $scope.getItem = function() {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.item.FacilityId },

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


        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
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
            // $scope.getItem();
            $scope.addNewLineItem();
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

    DelivaryAddressController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$timeout', 'utl', 'Upload'];

})();