(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualServiceConfirmOrderController', VirtualServiceConfirmOrderController);

    function VirtualServiceConfirmOrderController($scope, $stateParams, $state, $translate, utl, Upload, $timeout) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;
        $scope.currentcontext = {};
        $scope.orderdata = $stateParams.orderid;
        $scope.currentcontext.id = $scope.orderdata;
        $scope.vcategoryid = $stateParams.ctgryid;
        $scope.vsubcategoryid = $stateParams.subctgryid;
        $scope.lookup = {};
        $scope.VOrderDetails = [];
        $scope.item = {
            RequestTypeId: 1,
            OrderConsultTypeId: -1,
            PaymentModeId: 2,
            OrderModeId: 1,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            VirtualOrderStatusId: 1,
            FacilityId: utl.Session.getCurrentFacilityId()
        }
        $scope.VirtualOrderDetails = [];
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.item.VirtualCategoryId = $scope.currentcontext.vcategoryid;
        $scope.item.VirtualSubCategoryId = $scope.currentcontext.vsubcategoryid;
        $scope.item.OrderFromId = parseInt(utl.Session.getCurrentDepartmentId());

        $scope.CanShowaudio = true;
        $scope.CanShowvideo = true;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.PatientInfo = data;
            if ($scope.PatientInfo) {
                $scope.item.PatientName = $scope.PatientInfo.Title.Description + ' ' + $scope.PatientInfo.FirstName + ' ' + $scope.PatientInfo.LastName;
                $scope.item.PatientMRN = $scope.PatientInfo.MRN;
                $scope.item.PatientMobile = $scope.PatientInfo.mobile;
            }
            $scope.Encounters = $scope.PatientInfo.Encounters[0];
            $scope.item.EncounterTypeId = $scope.Encounters.EncounterTypeId;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.pid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.changeConsulttype = function (ctype) {
            if (ctype == 1) {
                $scope.item.OrderConsultTypeId = 1;
            }
            if (ctype == 2) {
                $scope.item.OrderConsultTypeId = 2;
            }

        }

        $scope.getServiceInfoCallback = function (scope, data, options, hasError) {
            $scope.ServiceInfo = data;
            if ($scope.ServiceInfo) {
                var servicedata = {
                    Id: 0,
                    ServiceId: $scope.ServiceInfo.Id,
                    PatientId: $scope.currentcontext.pid,
                    RequestDate: utl.Formatter.getCurrentDate(),
                    ServiceCode: $scope.ServiceInfo.ShortCode,
                    ServiceName: $scope.ServiceInfo.Name,
                    Quantity: 1,
                    ServiceCategoryId: $scope.ServiceInfo.BillingGroupId,
                    ServicePrice: $scope.drdetail.ConsultAmt,
                    DiscountModeId: $scope.drdetail.DiscountModeId,
                    Discount: $scope.drdetail.Discount,
                    DoctorId: $scope.item.DoctorId,
                    VirtualOrderDetailStatusId: 1,
                }
                $scope.VirtualOrderDetails.push(servicedata);
            }
        };

        $scope.getServiceInfo = function (pageNo) {
            if ($scope.item.ServiceItemId && $scope.item.ServiceItemId > 0) {

                var options = {
                    action: 'clinicalmaster/ServiceItem/GetServiceItemById',
                    data: {
                        Id: $scope.item.ServiceItemId
                    },
                    type: 'post',
                    onComplete: $scope.getServiceInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getvirtualorderDetailsCallback = function (scope, data, options, hasError) {
            $scope.VirtualOrderDetails = data.Data;
            if (data.Data.length > 0) {
                $scope.item.TotalNetAmount = $scope.VirtualOrderDetails[0].VirtualOrder.TotalNetAmount;
            }
        };

        $scope.getvirtualorderDetails = function () {
            if ($scope.orderdata > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.orderdata

                    }],
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualOrderDetail/GetVirtualOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getvirtualorderDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };



        $scope.backToList = function () {
            $state.go('patientportal.virtualserviceselection', {
                drdata: $scope.drdetail,
                slotinfo: $scope.slotdata
            });
        };
        $scope.home = function () {
            $state.go('patientportal.virtualsubcategoryselection', {
                id: 0
            });
        }


        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function () {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.Area = '';
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
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
            $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
                $scope.getPincodeData(pincode);
        });

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function (scope, res, options, hasError) {
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

        $scope.getPincodeData = function (pincode) {
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

        $scope.enablegoogleaddopt = function () {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function () {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */


        $scope.saveorder = function () {
            $scope.saveItem();
        };
        $scope.dashboard = function () {
            $state.go('patientportal.virtualhealthcare');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            utl.Modal.openFixedDialog('patientportal.virtualorderinfo', {
                params: {
                    id: $scope.currentcontext.id,
                },
                confirmCallback: $scope.dashboard
            });
        };

        $scope.saveItem = function () {

            // if (checkMandatoryFields()) {
            var lines = $scope.VirtualOrderDetails;
            var actionName = 'VirtualHealthcare/VirtualOrder/AddVirtualOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualOrder/UpdateVirtualOrder';
            }
            $scope.item.Id = $scope.currentcontext.id;
            var inputData = {
                Header: $scope.item,
                Details: lines,
                PatData: $scope.PatientInfo
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
            // }
        };

        // function getLinesForSave() {
        //     var result = [];
        //     var ordertotal = 0;
        //     for (var idx in $scope.details) {
        //         var item = $scope.details[idx];
        //         item.PatientId = $scope.item.PatientId;
        //         item.GuarantorId = $scope.item.GuarantorId;
        //         item.OrderStatusId = $scope.item.OrderStatusId;
        //         item.IsDirectBill = item.IsDirectBill || false;
        //         if (item.TestId > -1 && item.Status == 1) {
        //             result.push(item);
        //             ordertotal += item.NetAmount;
        //         }
        //     }
        //     for (var didx in $scope.details) {
        //         var ditem = $scope.details[didx];
        //         if (ditem.Id > 0 && ditem.Status == 2) {
        //             result.push(ditem);
        //         }
        //     }
        //     $scope.item.OrderTotal = ordertotal;
        //     return result;
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getItem();
            $scope.getServiceInfo();
            $scope.getvirtualorderDetails();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Title"
                },
                {
                    "Key": "Gender"
                },
                {
                    "Key": "VisitType"
                },
                {
                    "Key": "VipType"
                },
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                                Key: 3,
                                Value: 1
                            } // Clinical Dept Only
                        ]
                    }
                },
                {
                    "Key": "Nationality"
                },
                {
                    "Key": "Referral"
                },
                {
                    "Key": "PaymentType"
                },
                {
                    "Key": "Bank"
                },
                {
                    "Key": "Religion"
                },
                {
                    "Key": "Terminal"
                },
                {
                    "Key": "CardType"
                },
                {
                    "Key": "GuardianType"
                },
                {
                    "Key": "GuarantorType"
                },
                {
                    "Key": "Team"
                },
                {
                    "Key": "MaritalStatus"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "ReferralType"
                },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "DiscountApprover"
                },
                {
                    "Key": "PrivateDueApprover"
                },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 1
                        }]
                    }
                },
                {
                    "Key": "EncounterStatus"
                },
                {
                    "Key": "BloodGroup"
                },
                {
                    "Key": "Gender"
                },
                {
                    "Key": "AppoinmentRequestType",
                    Default: false
                },
                {
                    "Key": "PaymentMode",
                    Default: false
                },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentFacilityId()
                        }]
                    }
                },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    VirtualServiceConfirmOrderController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$timeout'];

})();