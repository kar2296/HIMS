(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('SelectPharmacyController', SelectPharmacyController);

    function SelectPharmacyController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
            lat: '',
            lng: ''
        };
        // $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.deliveryInfo = $stateParams.deliverydata;
        // $scope.currentcontext.file = $stateParams.file;
        $scope.currentcontext.file = $stateParams.contextdata.file;
        $scope.currentcontext.id = $stateParams.contextdata.id;
        $scope.item.MedicineOrderDate = $scope.deliveryInfo.MedicineOrderDate;
        $scope.item.DeliveryAddress = $scope.deliveryInfo.DeliveryAddress;
        $scope.item.FirstName = $scope.deliveryInfo.FirstName;
        $scope.item.LastName = $scope.deliveryInfo.LastName;
        $scope.item.PhoneNo = $scope.deliveryInfo.PhoneNo;
        $scope.item.PinCode = $scope.deliveryInfo.PinCode;
        $scope.item.LandMark = $scope.deliveryInfo.LandMark;
        $scope.item.PrescriptionAttachment = $scope.deliveryInfo.PrescriptionAttachment;
        $scope.item.DeliveryDate = $scope.deliveryInfo.DeliveryDate;
        $scope.item.CityId = $scope.deliveryInfo.CityId;
        $scope.item.StateId = $scope.deliveryInfo.StateId;
        $scope.Proceed = false;
        $scope.PresUploadDetails = [];
        $scope.VirtualFacility = [];

        $scope.backToList = function() {
            $state.go('patientportal.medicineordertab.deliveryaddress', {
                deliverydata: $scope.item,
                contextdata: $scope.currentcontext
            });
            $scope.getItem();
        }

        $scope.orderreview = function(item) {
            $state.go('patientportal.medicineordertab.orderreview', {
                pharmacydata: $scope.item,
                contextdata: $scope.currentcontext,
                facilityinfo: item
            });
        }

        $scope.custom_sort = function(a, b) {
            return parseInt(a.km) - parseInt(b.km);
        };

        $scope.getFacilityCallback = function(scope, res, options, hasError) {
            $scope.VirtualFacility = res.Data;
            for (let i = 0; i < $scope.VirtualFacility.length; i++) {
//                 var a = new google.maps.LatLng($scope.item.lat, $scope.item.lng);
//                 var b = new google.maps.LatLng($scope.VirtualFacility[i].Lat, $scope.VirtualFacility[i].Lng);
//                 var distance = google.maps.geometry.spherical.computeDistanceBetween(a, b);
//                 var value = distance / 1000;
//                 console.log('value', distance);
                var labfac = {
                    Id: $scope.VirtualFacility[i].Id,
                    FacilityName: $scope.VirtualFacility[i].FacilityName,
                    AddressLine1: $scope.VirtualFacility[i].AddressLine1,
                    AddressLine2: $scope.VirtualFacility[i].AddressLine2,
                    Area: $scope.VirtualFacility[i].Area,
//                     km: value
                }
                $scope.items.push(labfac);
//                 $scope.items.sort($scope.custom_sort);
//                 console.log('km', $scope.items)
            }
        };

        $scope.getFacility = function() {

            var inputData = {
                Params: [
                    { Key: 7, Value: 1 },
                ]
            };

            var options = {
                action: 'SystemSettings/facility/GetOtherFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacilityCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function() {
            $state.go('app.virtualcategoryform', {
                id: 0
            });
        }

        $scope.addNewLineItem = function() {
            var medicinedetail = {
                Id: 0,
                MedicineOrderId: null,
                OrganizationId: utl.Session.getCurrentOrgId(),
                // FacilityId: utl.Session.getCurrentFacilityId(),
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


        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };
        // $scope.proceedattachment = function () {
        //     $scope.Proceed = true;
        // }

        $scope.proceedattachment = function(item) {
            $state.go('patientportal.medicineordertab.deliveryaddress', {
                prescriptionData: item,
            });
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

        $scope.getLocation = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        }

        function showPosition(position) {
            $scope.item.lat = position.coords.latitude;
            $scope.item.lng = position.coords.longitude;
            $scope.getFacility();
            console.log('lat', $scope.item.lat)
        }

        // $scope.getLocation();
        $scope.getFacility();
    }

    SelectPharmacyController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();