(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorfeedbackconfirmorderController', doctorfeedbackconfirmorderController);

    function doctorfeedbackconfirmorderController($scope, $stateParams, $state, $translate, utl, Upload, $timeout) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var windowVar;
        var vm = this;
        $scope.PaymentgatewayNo = "";
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.drdetail = $stateParams.drData;
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.slotdata = $stateParams.slotinfo;
        $scope.orderdata = $stateParams.orderid;
        $scope.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.ctypeId = parseInt($stateParams.ctypeId);
        $scope.lookup = {};
        // $scope.PaymentMode = false;
        $scope.VOrderDetails = [];
        $scope.item = {
            RequestTypeId: 1,
            OrderConsultTypeId: -1,
            PaymentModeId: 2,
            OrderModeId: 2,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            VirtualOrderStatusId: 1,
        }
        $scope.VirtualOrderDetails = [];
        $scope.item.CategoryTypeId = $scope.ctypeId;
        $scope.item.PatientId = $scope.currentcontext.pid;
        if ($scope.drdetail) {
            $scope.item.ServiceItemId = $scope.drdetail.ServiceItemId;
            $scope.item.OrderTotal = $scope.drdetail.ConsultAmt;
            $scope.item.GrossAmount = $scope.drdetail.Amount;
            $scope.item.DiscountAmount = $scope.drdetail.DiscountAmt;
            $scope.item.TotalNetAmount = $scope.drdetail.ConsultAmt;
            $scope.item.OrderToId = $scope.drdetail.DepartmentId;
            $scope.item.DepartmentId = $scope.drdetail.DepartmentId;
            $scope.item.DoctorId = $scope.drdetail.Id;
            $scope.item.FacilityId = $scope.drdetail.FacilityId;
            var docName = '';
            $scope.item.DoctorName = '';
            if ($scope.drdetail.Title)
                docName = $scope.drdetail.Title.Description;
            if ($scope.drdetail.FirstName)
                docName += ' ' + $scope.drdetail.FirstName;
            if ($scope.drdetail.LastName)
                docName += ' ' + $scope.drdetail.LastName;

            $scope.item.DoctorName = docName;

        }
        if ($scope.orderdata) {
            $scope.item.ServiceItemId = $scope.orderdata.ServiceItemId;
        }
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.item.VirtualCategoryId = $scope.currentcontext.vcategoryid;
        $scope.item.VirtualSubCategoryId = $scope.currentcontext.vsubcategoryid;
        if ($scope.slotdata) {
            $scope.item.AppointmentDate = $scope.slotdata.AppointmentDate;
            $scope.item.OrderScheduleDate = $scope.slotdata.AppointmentDate;
            $scope.item.StartTime = $scope.slotdata.StartTime;
            $scope.item.EndTime = $scope.slotdata.EndTime;
        }
        $scope.CanShowaudio = true;
        $scope.CanShowvideo = true;
        $scope.directasign = 0;
        $scope.directasign =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'virtualassign');
        var isSavecompleted = 0;
        $scope.CanDisableSave = false;
        $scope.item.IsDirectAssign = $scope.directasign;

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.PatientInfo = data;
            if ($scope.PatientInfo) {
                $scope.item.PatientName = $scope.PatientInfo.Title.Description + ' ' + $scope.PatientInfo.FirstName + ' ' + $scope.PatientInfo.LastName;
                $scope.item.PatientMRN = $scope.PatientInfo.MRN;
                $scope.item.PatientMobile = $scope.PatientInfo.mobile;
            }
            $scope.Encounters = $scope.PatientInfo.Encounters[0];
            $scope.item.EncounterId = $scope.Encounters.Id;
            $scope.item.EncounterTypeId = $scope.Encounters.EncounterTypeId;
        };

        $scope.getItem = function(pageNo) {
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

        $scope.changeConsulttype = function(ctype) {
            if (ctype == 1) {
                $scope.item.OrderConsultTypeId = 1;
            }
            if (ctype == 2) {
                $scope.item.OrderConsultTypeId = 2;
                $scope.item.PaymentModeId = 1;
                // $scope.PaymentMode = true;
            }
        };
        $scope.home = function() {
            $state.go('patientportal.virtualhealthcare');
        }

        $scope.getServiceInfoCallback = function(scope, data, options, hasError) {
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

        $scope.getServiceInfo = function(pageNo) {
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

        $scope.getvirtualorderDetailsCallback = function(scope, data, options, hasError) {
            $scope.VirtualOrderDetails = data.Data;
            if (data.Data.length > 0) {
                $scope.item.TotalNetAmount = $scope.VirtualOrderDetails[0].VirtualOrder.TotalNetAmount;
            }
        };

        $scope.getvirtualorderDetails = function() {
            if ($scope.currentcontext.id > 0) {
                var options = {
                    action: 'VirtualHealthcare/VirtualOrderDetail/GetVirtualOrderDetailById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getvirtualorderDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('patientportal.bookvirtualappointment', {
                docData: $scope.drdetail,
                ctgryInfo: $scope.ctgryInfo,
            });
        };

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
            $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
                $scope.getPincodeData(pincode);
        });

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


        $scope.saveorder = function() {
            if ($scope.item.OrderConsultTypeId == -1) {
                utl.Alert.showErrorMsg($translate.instant('Select Any ConsultType'));
                return false;
            }
            // if ($scope.item.OrderConsultTypeId == 2) {
            //     utl.Alert.showErrorMsg($translate.instant('Please Pay Now...'));
            //     return false;
            // }
            $scope.item.PaymentModeId = 2;
            isSavecompleted = 1;
            $scope.saveItem();
        };

        $scope.dashboard = function() {
            $state.go('patientportal.virtualhealthcare');
        };

        $scope.getPatientUsersCallback = function(scope, data, options, hasError) {
            var userpatId = data.Data[0].PatientId;
            var UserId = data.Data[0].Id
            if ($scope.currentcontext.pid == userpatId) {
                $scope.item.PatUserId = UserId;
            }
        };
        $scope.getPatientUsers = function() {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 8
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                    {
                        Key: 23,
                        Value: $scope.currentcontext.pid
                    },

                ],
            };
            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientUsersCallback
            };

            utl.Http.doAction(options);
        }
        $scope.pad = function(n, width, z) {
            z = z || "0";
            n = n + "";
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }
        $scope.payNow = function () {
            $state.go('patientportal.selectpaymentprovider', {
                drData: $scope.docInfo,
                slotinfo: $scope.item,
                ctgryInfo: $scope.ctgryInfo,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId,
            })
        }
        // $scope.payNow = function() {
        //     isSavecompleted = 1;
        //     var id = Date.now();
        //     var amt = $scope.item.TotalNetAmount;
        //     var fix = amt.toFixed(2);
        //     var mutate = fix * 100;
        //     var round = parseInt(mutate);
        //     var parsePrice = $scope.pad(round, 12);
        //     var urlBind = 'https://payment.swostha.com/?process_payment=1&prod_desc=appoinment&inv=' + id + '&amount=' + parsePrice;

        //     windowVar = window.open(
        //         urlBind,
        //         "New Window",
        //         "width=600,height=500,top=70,left=500"
        //     );
        //     // sysend.proxy("http://3.22.42.48");
        //     sysend.proxy("https://ap01.swostha.com");
        //     sysend.proxy("https://swostha.com");
        //     sysend.proxy("https://payment.swostha.com");
        //     // sysend.proxy("http://localhost");
        //     // sysend.proxy("http://localhost:3000");
        //     sysend.on("foo", function(message) {
        //         console.log(message);
        //         if (windowVar) {
        //             if (message && message.message === 'success' && message.transRef) {
        //                 $scope.PaymentgatewayNo = message.transRef;
        //                 $scope.PaymentModeId = 1;
        //                 $scope.IsPaidFully = true;
        //                 $scope.saveItem();
        //             }
        //             windowVar.close();
        //         }
        //     });
        // }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            // utl.Modal.openFixedDialog('patientportal.virtualorderinfo', {
            //     params: {
            //         id: $scope.currentcontext.id,
            //     },
            //     confirmCallback: $scope.dashboard
            // });
            $scope.dashboard();
        };

        $scope.saveItem = function() {
            $scope.CanDisableSave = true;
            //             if (isSavecompleted == 1) {
            //                 return;
            //             }
            if ($scope.item.CategoryTypeId == 1) {
                if ($scope.item.OrderConsultTypeId == -1 || !$scope.item.OrderConsultTypeId) {
                    utl.Alert.showErrorMsg($translate.instant('Select Any ConsultType'));
                    return false;
                }
            }
            // if ($scope.item.OrderConsultTypeId == 2) {
            //     if ($scope.item.PaymentModeId == 2) {
            //         utl.Alert.showErrorMsg($translate.instant('Payment Mode Should be Pay Now'));
            //         $scope.item.PaymentModeId = 1;
            //         return false;
            //     }
            // }
            if (!$scope.item.PaymentModeId) {
                utl.Alert.showErrorMsg($translate.instant('Select Any Payment Mode'));
                return false;
            }
            if (!$scope.item.RequestTypeId) {
                utl.Alert.showErrorMsg($translate.instant('Select Any RequestType'));
                return false;
            }

            if ($scope.orderdata > 0) {
                $scope.currentcontext.id = $scope.orderdata;
                $scope.item.Id = $scope.currentcontext.id;
            }
            var lines = $scope.VirtualOrderDetails;
            var actionName = 'VirtualHealthcare/VirtualOrder/AddDoctorConsultVirtualOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualOrder/UpdateVirtualOrder';
            }
            if ($scope.PaymentgatewayNo) {
                $scope.item.PaymentGatewayRefNo = $scope.PaymentgatewayNo;
            }
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getServiceInfo();
            $scope.getPatientUsers();
            $scope.getItem();
        };

        $scope.payRazorPay = function() {
            if ($scope.item.OrderConsultTypeId == -1) {
                utl.Alert.showErrorMsg($translate.instant('Select Any ConsultType'));
                return false;
            }
            $scope.item.PaymentModeId = 1;
            console.clear();
            console.log('logging');
            console.log($scope.drdetail);
            var razorpayoption = {
                'key': 'rzp_test_N3RvbAy7wbhsQN',
                // Insert the amount here, dynamically, even
                'amount': ($scope.drdetail.Amount) * 100,
                'name': $scope.drdetail.FirstName,
                'description': 'Thankyou For your payment',
                'image': '',
                'handler': function(transaction) {
                    console.log(transaction);
                    $scope.PaymentgatewayNo = transaction.razorpay_payment_id;
                    $scope.saveItem();
                    //   $scope.transactionHandler(transaction);
                },
                'prefill': {
                    'name': '',
                    'email': '',
                    'contact': ''
                }
            };
            var rzp1 = new Razorpay(razorpayoption);
            rzp1.open();

        }

        $scope.initLookup = function() {
            var inputData = [{
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

    doctorfeedbackconfirmorderController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$timeout'];

})();