(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('registrationcumvisitController', registrationcumvisitController);

    function registrationcumvisitController($scope, $timeout, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({ $scope: $scope }));
        $scope.currentcontext = { id: 0 };

        var guarantorId_ = 1000;
        var facilityId_ = utl.Session.getCurrentFacilityId();
        if (!facilityId_) facilityId_ = 1;
        guarantorId_ *= facilityId_;

        $scope.item = {
            Id: 0,
            GuarantorTypeId: 1,
            GuarantorId: guarantorId_,
            AppointmentCategoryId: 5,
            VisitTypeId: 1,
            PatientId: null
        };

        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.NoofPrintPatientLabel = 1;
        $scope.clearpreviousaddress = function () {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.Area = '';
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
        }
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = ''; var address2 = ''; var city = '';
            var area = ''; var state = ''; var country = ''; var pincode = '';
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

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

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
        }

        $scope.getPincodeData = function (pincode) {
            var inputData = {
                Params: [{ Key: 5, Value: pincode }],
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
        }

        $scope.enablegoogleaddopt = function () {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function () {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        }
        /* Google Address code ends */

        $scope.EnableSave = false;
        $scope.IsOpenEncounter = false;
        $scope.currentcontext.CanUserManual = utl.Privilege.hasPrivilege('CanUserManual')
        $scope.currentcontext.CanProcessFlow = utl.Privilege.hasPrivilege('CanProcessFlow')
        $scope.clear = function () {
            $scope.item = {
                Id: 0,
                GuarantorTypeId: 1,
                GuarantorId: guarantorId_
            };
            document.getElementById("item_form").reset();
            $scope.IsOpenEncounter = false;
            $scope.currentcontext.canDisableApprove = false;
        };
        $('#myModal').hide();
        $scope.showprocessflow = function () {
            $('#myModal').show();
        }

        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        }
        $scope.addNew = function () {
            $state.reload();
        }

        $scope.backToList = function () {
            $state.go('app.patientsearch');
        }

        $scope.OPDBill = function () {
            $state.go('app.opbilling-list', { id: $scope.item.Id });
        }
        $scope.visitprint = function () {
            var inputData = {
                Id: $scope.Appointment.Id
            };
            var options = {
                action: 'appointment/Appointment/PrintAppointment',
                data: inputData,
                type: 'post',
                // onComplete:$scope.backToList
            };
            utl.Http.doDownload(options);
        }
        $scope.vitals = function () {
            utl.Modal.open('patientemr.patientvital', {
                params: { pid: $scope.item.Id, encounter: $scope.item.EncounterId },
                // confirmCallback: $scope.getList
            });
        }

        $scope.EnableOPD = false;
        $scope.Vitals = false;

        $scope.getPatientCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.PatientId = $scope.item.Id;
            $scope.item.VisitTypeId = $scope.Appointment.VisitTypeId;
            $scope.item.ReferredById = $scope.Appointment.ReferralId;
            $scope.item.DepartmentId = $scope.Appointment.DepartmentId;
            $scope.item.DoctorId = $scope.Appointment.DoctorId;
            $scope.item.Comments = $scope.Appointment.Comments;
            $scope.item.EncounterId = $scope.Appointment.Encounters[0].EncounterId;
            $scope.lookup["Referral"].filter(function (item) {
                if (item.ReferralId == $scope.item.ReferralId)
                    $scope.item.ReferralTypeId = item.ReferralTypeId;
            });
            var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
            $scope.item.ApproxAgeDays = ageObj.d;
            $scope.item.ApproxAgeMonths = ageObj.m;
            $scope.item.Age = ageObj.y;
            $scope.getpatientGuarantor();
        }
        $scope.getPatient = function () {

            var options = {
                action: 'Registration/Patient/GetPatientMinimalInfoById',
                data: { Id: $scope.item.Id },
                type: 'post',
                onComplete: $scope.getPatientCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getAppointmentCallback = function (scope, data, options, hasError) {
            $scope.Appointment = data.Data[0];
            $scope.item.PatientId = $scope.Appointment.PatientId;
            $scope.item.Id = $scope.Appointment.PatientId;
            $scope.getPatient();
        };

        $scope.getAppointment = function () {
            if ($scope.AppointmentId && $scope.AppointmentId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.AppointmentId }
                    ]
                };
                var options = {
                    action: 'Appointment/Appointment/GetAppointments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentCallback
                };

                utl.Http.doAction(options);
            }
        }
        $scope.print = function () {
            var inputData = {
                Id: $scope.item.PatientId,
            };
            var options = {
                action: 'registration/Patient/PrintPatient',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options); //
            // utl.Modal.open('app.appointmentprint', {
            //         params: { id:0 },
            //         confirmCallback: $scope.getList
            // });
        }
        $scope.print2 = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatient',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.print3 = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }



        $scope.requestprint = function () {
            var inputData = {
                Id: $scope.AppointmentId,
                // Data: {
                //     EncounterId: $scope.item.EncounterId
                //     }
            };
            var options = {
                action: 'registration/Patient/regprintform',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.printPatientLabel = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) { noofprint = 1; }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vEncoutnerType = '';
                var vAddress = '';
                var vRegisteredDate = '';
                var vPhoneNumber = '';
                var vGender = '';
                var vDoctor = '';
                var vDOB = '';
                var vArea = '';
                var vCityTownName = '';
                var vGender = '';
                var vAddressLine1 = '';
                var vAddressLine2 = '';
                var vAge = '';
                var vPincode = '';
                try {
                    if ($scope.Patientdata && $scope.Patientdata.Title
                        && $scope.Patientdata.Title.Description)
                        vTitle += $scope.Patientdata.Title.Description;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.FirstName)
                        vFirstName += ' ' + $scope.Patientdata.FirstName;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.LastName)
                        vLastName += ' ' + $scope.Patientdata.LastName;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.MRN)
                        vMRN = $scope.Patientdata.MRN;


                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.DOB)
                        vDOB = $scope.Patientdata.DOB;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.RegisteredDate)
                        vRegisteredDate = $scope.Patientdata.RegisteredDate;
                    var dateString = vRegisteredDate.toString();
                    vRegisteredDate = dateString.substring(10, 0);

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Age)
                        vAge = $scope.Patientdata.Age;
                    vAge = (vAge == "") ? vAge = ((typeof $scope.Patientdata.ApproxAgeMonths != "undefined") ? $scope.Patientdata.ApproxAgeMonths + "M " : "0M ") + $scope.Patientdata.ApproxAgeDays + "D" : vAge + "Y";


                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Mobile)
                        vPhoneNumber = $scope.Patientdata.Mobile;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Gender.Description)
                        vGender = $scope.Patientdata.Gender.Description;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Area)
                        vArea = $scope.Patientdata.Area;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.AddressLine1)
                        vAddressLine1 = $scope.Patientdata.AddressLine1;


                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.AddressLine2)
                        vAddressLine2 = $scope.Patientdata.AddressLine2;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.City)
                        vCityTownName = $scope.Patientdata.City;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Encounters[0].DoctorName)
                        vDoctor = $scope.Patientdata.Encounters[0].DoctorName;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Age)
                        vAge = $scope.Patientdata.Age;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Pincode)
                        vPincode = $scope.Patientdata.Pincode;


                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.clientcode.toLowerCase() == 'lotus' ) {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A305,256,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    code += 'A186,256,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A620,193,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A530,193,2,4,1,1,N,"' + ' :' + ' ' + vAddressLine1 +','+vAddressLine2+'"' + printCodes.new_line;
                    code += 'A620,163,2,4,1,1,N,"' + ' ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + '  '+vArea+','+vCityTownName+'"' + printCodes.new_line;
                    code += 'A620,133,2,4,1,1,N,"' + 'Phone' + '"' + printCodes.new_line;
                    code += 'A530,133,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'A305,133,2,4,1,1,N,"' + 'Gender' + '"' + printCodes.new_line;
                    code += 'A186,133,2,4,1,1,N,"' + ':' + ' ' + vGender + '"' + printCodes.new_line;
                    code += 'A90,133,2,4,1,1,N,"' + '/' + ' ' + vAge + '"' + printCodes.new_line;
                    code += 'A620,98,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
                    code += 'A530,98,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
                    //code += 'A624,65,2,4,1,1,N,"' + 'DOB' + '"' + printCodes.new_line;
                    //code += 'A570,65,2,4,1,1,N,"' + ':' + ' ' + vDOB + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                } else if (window.clientcode.toLowerCase() == 'sundaram') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                    code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A420,225,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A600,197,2,4,1,1,N,"' + 'DOB / Gender' + '"' + printCodes.new_line;
                    code += 'A420,197,2,4,1,1,N,"' + ':' + ' ' + vDOB + ' / ' + vGender + '"' + printCodes.new_line;
                    code += 'A600,169,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
                    code += 'A600,140,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
                    code += 'A420,140,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    //code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    //code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A600,113,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
                    code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
                    code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                } else {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                    code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A420,226,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A600,197,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A420,198,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
                    code += 'A600,169,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
                    code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A600,113,2,4,1,1,N,"' + 'Gender/Age' + '"' + printCodes.new_line;
                    code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vGender + ' /' + vAge + ' /' + vDOB + '"' + printCodes.new_line;
                    code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                }
                    code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;


                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) { console.log(ex); }
        };

        function vistCreated() {
            $scope.EnableOPD = true;
            $scope.Vitals = true;
            $scope.getAppointment();
        }

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) { return primer(x[field]) } :
                function (x) { return x[field] };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.guarantorType = function (guarantorid) {
            for (var idx in $scope.lookup.Guarantor) {
                var item = $scope.lookup.Guarantor[idx];
                if (item.Id == guarantorid)
                    $scope.item.GuarantorTypeId = item.GuarantorTypeId;
            }
        };

        $scope.getPatientGuarantorCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['Guarantor'] = data.PatientGuarantor;

            $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
            $scope.guarantorType($scope.item.GuarantorId);
        };

        $scope.getpatientGuarantor = function () {
            var inputData = [
                { Key: "PatientGuarantor", Request: { Params: [{ Key: 1, Value: 2 }, { Key: 2, Value: $scope.item.Id }] } }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientGuarantorCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getPrevReferralCallback = function (scope, data, options, hasError) {
            $scope.Encounters = data.Data[0];
            if ($scope.Encounters) {
                $scope.item.ReferrerId = $scope.Encounters.ReferralId;
                $scope.item.ReferTypeId = $scope.Encounters.ReferralTypeId;
            }
            // $scope.Encounters = data.Data;
            // for (var idx in $scope.Encounters) {
            //     var EncReferral = $scope.Encounters[idx];
            //     if (EncReferral) {
            //         $scope.item.ReferrerId = EncReferral.ReferralId;
            //         $scope.item.ReferTypeId = EncReferral.ReferralTypeId;
            //     }
            // }
        };

        $scope.getPrevReferral = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId },
                    { Key: 15, Value: 1 },
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevReferralCallback
            };

            utl.Http.doAction(options);
        }
        $scope.patientChange = function () {
            $scope.IsOpenEncounter = false;
            if ($scope.item.PatientId > 0) {
                $scope.item = $scope.selectedPatient;
                $scope.item.PatientId = $scope.selectedPatient.Id;
                $scope.item.Age = parseInt($scope.item.Age);
                if ($scope.item.Encounters.length > 0 && $scope.item.Encounters[0].EncounterStatusId == 1) {
                    utl.Alert.showErrorMsg('Patient Has Existing Appointment');
                    $scope.IsOpenEncounter = true;
                }
                else if ($scope.item.Encounter) {
                    $scope.item.DoctorId = $scope.Encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.Encounter.DepartmentId;
                }
                $scope.item.VisitTypeId = 2;
                $scope.getpatientGuarantor();
                $scope.getPrevReferral();
            }

        };
        $scope.canShowApproxAge = function (vTitleId) {
            if (vTitleId && $scope.lookup) {
                for (var idx in $scope.lookup.Title) {
                    if (vTitleId == $scope.lookup.Title[idx].Id)
                        if ($scope.lookup.Title[idx].Code.toLowerCase() == "babyof")
                            return true;
                }
            }
            return false;
        }
        $scope.addReferral = function () {
            utl.Modal.open('app.referraltab.details', {
                params: { id: 0 },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.fillGenderInfo = function () {
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function () {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
        }

        $scope.calculateDOB = function (age, substractPart) {
            var options = { d: $scope.item.ApproxAgeDays, m: $scope.item.ApproxAgeMonths, y: $scope.item.Age };
            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.IsBirthDateApproximate = true;
        };

        $scope.save = function () {
            $scope.item.PatientStatus = 'Draft'
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientStatus = 'Active';
            $scope.isSaveAndApprove = true;
            var msg = 'Are you Sure Do you Want Register and Create Visit For ' + $scope.item.FirstName;
            if ($scope.item.PatientId > 0)
                msg = 'registration.registrationcumvisit.savemsg.lbl', + $scope.item.FirstName;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        function handlePatientExists(data) {
            var confirmOptions = {
                messageKey: 'registration.fullregistration.patient-exists-msg.lbl',
                placeholder: { patientcount: (data * -1) },
                onSuccessMethod: function () {
                    $scope.item.OverrideDuplicate = true;
                    $scope.saveItem();
                }
            };

            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (data < 0) {
                handlePatientExists(data);
                $scope.currentcontext.canDisableApprove = false;
            } else {
                if (typeof (data) == 'number') {
                    $scope.AppointmentId = data;
                    $scope.EnableSave = true;
                    vistCreated();
                    $scope.requestprint();
                }
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));

            }

        };

        $scope.saveItem = function () {

            if ($scope.IsOpenEncounter) {
                utl.Alert.showErrorMsg('registration.registrationcumvisit.exapp.lbl');
                return false;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (utl.Formatter.isFutureDate($scope.item.DOB)) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.dobdate-cant-future-msg.lbl'));
                return;
            }

            if (!$scope.item.LandLine && !$scope.item.Mobile) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.atleast-one-contactno-msg.lbl'));
                return;
            }

            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }

            var actionName = 'registration/patient/RegistrationCumVisit';
            if ($scope.EnableSave)
                actionName = 'registration/patient/UpdatePatient';
            if ($scope.isSaveAndApprove) {
                $scope.currentcontext.canDisableApprove = true;
            }
            $scope.item.MRNTypeId = 2;

            var options = {
                action: actionName,
                data: { Data: $scope.item, file: null },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
                $scope.item.DepartmentId = selectedItem.DepartmentId;
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.referralTypeChangeCallback = function (scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        };

        $scope.referralTypeChange = function () {
            var inputData = [
                { Key: "Referral", Request: { Params: [{ Key: 3, Value: $scope.item.ReferTypeId }] } }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.referralTypeChangeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDefaultReferralCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var refObj = res.Data[0];
                $scope.item.ReferrerId = refObj.Id;
                $scope.item.ReferTypeId = refObj.ReferralTypeId;
                $scope.item.ReferralName = refObj.Text;
                $scope.item.ReferrerNumber = refObj.PhoneNo;
                $scope.item.ReferrerEmail = refObj.Email;
            }
        };

        $scope.getDefaultReferral = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: 2 },
                    { Key: 6, Value: true },
                ],
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/referral/GetReferrals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDefaultReferralCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.currentcontext.id == 0) {
                $scope.getDefaultReferral();
            }
            $scope.getPrintNoOfCopies();
            // $scope.getItem();
        }

        $scope.getPrintNoOfCopies = function () {
            try {
                $scope.NoofPrintPatientLabel =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'patientlabel');
                $scope.NoofPrintMRDLabel =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'mrdlabel');
            } catch (ex) { }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Title" },
                { "Key": "Gender" },
                { "Key": "VisitType" },
                { "Key": "Department" },
                { "Key": "Referral" },
                { "Key": "GuarantorType" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "ReferralType" },
                { "Key": "GuardianType" },
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

    registrationcumvisitController.$inject = ['$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();