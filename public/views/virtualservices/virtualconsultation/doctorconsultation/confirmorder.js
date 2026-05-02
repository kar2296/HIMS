(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('confirmorderController', confirmorderController);

    function confirmorderController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.drdetail = $stateParams.drData;
        $scope.slotdata = $stateParams.slotinfo;
        $scope.orderdata = $stateParams.orderid;
        $scope.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.ctypeId = parseInt($stateParams.ctypeId);
        $scope.lookup = {};
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
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.CategoryTypeId = $scope.ctypeId;
        if ($scope.drdetail) {
            $scope.item.ServiceItemId = $scope.drdetail.ServiceItemId;
            $scope.item.OrderTotal = $scope.drdetail.ConsultAmt;
            $scope.item.GrossAmount = $scope.drdetail.Amount;
            $scope.item.DiscountAmount = $scope.drdetail.DiscountAmt;
            $scope.item.TotalNetAmount = $scope.drdetail.ConsultAmt;
            $scope.item.OrderToId = $scope.drdetail.DepartmentId;
            $scope.item.DepartmentId = $scope.drdetail.DepartmentId;
            $scope.item.DoctorId = $scope.drdetail.Id;
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
        $scope.item.OrderFromId = parseInt(utl.Session.getCurrentDepartmentId());
        if ($scope.slotdata) {
            $scope.item.AppointmentDate = $scope.slotdata.AppointmentDate;
            $scope.item.OrderScheduleDate = $scope.slotdata.AppointmentDate;
            $scope.item.StartTime = $scope.slotdata.StartTime;
            $scope.item.EndTime = $scope.slotdata.EndTime;
        }
        $scope.CanShowaudio = true;
        $scope.CanShowvideo = true;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.PatientInfo = data;
            if ($scope.PatientInfo) {
                $scope.item.PatientName = $scope.PatientInfo.Title.Description + ' ' + $scope.PatientInfo.FirstName + ' ' + $scope.PatientInfo.LastName;
                $scope.item.PatientMRN = $scope.PatientInfo.MRN;
                $scope.item.PatientMobile = $scope.PatientInfo.Mobile;
            }
            $scope.Encounters = $scope.PatientInfo.Encounters[0];
            $scope.item.EncounterTypeId = $scope.Encounters.EncounterTypeId;
        };


        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }


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
        };

        $scope.home = function () {
            $state.go('app.createorderdashboard');
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
                    GrossAmount: $scope.drdetail.Amount,
                    NetAmount: $scope.drdetail.ConsultAmt,
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
            $state.go('app.slotschedule', {
                drData: $scope.drdetail,
                slotinfo: $scope.slotdata
            });
        };
        $scope.slotclick = function () {
            $state.go('app.doctorconsultant', {
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
            $state.go('app.createorderdashboard');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            utl.Modal.openFixedDialog('app.virtualorderinfo', {
                params: {
                    context: 'order',
                    id: $scope.currentcontext.id,
                }
            });
            // $scope.dashboard();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.CategoryTypeId == 1) {
                if ($scope.item.OrderConsultTypeId == -1 || !$scope.item.OrderConsultTypeId) {
                    utl.Alert.showErrorMsg($translate.instant('Select Any ConsultType'));
                    return false;
                }
                if ($scope.item.Symptoms == '' || !$scope.item.Symptoms) {
                    utl.Alert.showErrorMsg($translate.instant('Enter Your Symptoms'));
                    return false;
                }
            }
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
            var actionName = 'VirtualHealthcare/VirtualOrder/AddVirtualOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualOrder/UpdateVirtualOrder';
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
        };

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
                    "Key": "AppoinmentRequestType",
                    Default: false
                },
                {
                    "Key": "PaymentMode",
                    Default: false
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

    confirmorderController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();