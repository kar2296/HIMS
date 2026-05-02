(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientprintController', patientprintController);

    function patientprintController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

        $scope.item = {};

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        };
        $scope.getPatientInfoCallback = function (scope, res, options, hasError) {
            $scope.Patientdata = res.Data[0];
        };

        $scope.getPatients = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.pid }
                ]
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientInfoCallback
            };

            utl.Http.doAction(options);
        };
        $scope.registrationprint = function () {
            var inputData = {
                Id: $scope.currentcontext.pid
            };
            var options = {
                action: 'registration/Patient/PrintPatient',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.registrationlabel = function () {
            var inputData = {
                Id: $scope.currentcontext.pid,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatient',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.patientidcard = function () {
            var inputData = {
                Id: $scope.currentcontext.pid,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.mrdlabel = function () {

            var vTitle = '';
            var vFirstName = '';
            var vLastName = '';
            var vMRN = '';
            var vEncoutnerType = '';
            try {
                if ($scope.Patientdata && $scope.Patientdata.Title
                    && $scope.Patientdata.Title.Description)
                    vTitle += $scope.Patientdata.Title.Description;

                if ($scope.Patientdata && $scope.Patientdata
                    && $scope.Patientdata.FirstName)
                    vFirstName += ' ' + $scope.Patientdata.FirstName;


                if ($scope.Patientdata && $scope.Patientdata
                    && $scope.Patientdata.MRN)
                    vMRN = $scope.Patientdata.MRN;

                // if ($scope.Patientdata && $scope.Patientdata.EncounterType
                //     && $scope.Patientdata.Patientdata.Description)
                //     vEncoutnerType = $scope.Patientdata.EncounterType.Description;


            } catch (ex) { }

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
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
            code += 'A414,254,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
            code += 'A507,174,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
            code += 'B437,116,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
            code += 'P1' + printCodes.new_line;
            printData.push(code);
            $scope.printRaw(printData);

        };
        $scope.visitprint = function () {
            if ($scope.Patientdata.Encounters.length > 0) {
                for (var idx in $scope.Patientdata.Encounters) {
                    var encounters = $scope.Patientdata.Encounters[idx];
                }
                if (encounters.AppointmentId != null) {
                    var inputData = {
                        Id: encounters.AppointmentId
                };
                var options = {
                    action: 'appointment/Appointment/PrintAppointment',
                    data: inputData,
                    type: 'post',
                };
                utl.Http.doDownload(options);
            }
            else {
                utl.Alert.showErrorMsg($translate.instant('No Visit'));
            }
            }
        };
        $scope.patientlabel = function () {
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
                    && $scope.Patientdata.City)
                    vCityTownName = $scope.Patientdata.City;

                if ($scope.Patientdata && $scope.Patientdata
                    && $scope.Patientdata.Encounters[0].DoctorName)
                    vDoctor = $scope.Patientdata.Encounters[0].DoctorName;


            } catch (ex) { }

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
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
            code += 'A582,255,2,4,1,1,N,"' + 'OP#' + '"' + printCodes.new_line;
            code += 'A492,255,2,4,1,1,N,"' + '  :' + ' ' + vMRN + '"' + printCodes.new_line;
            code += 'A351,257,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
            code += 'A220,257,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
            code += 'A582,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
            code += 'A479,226,2,4,1,1,N,"' + ' :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
            code += 'A583,197,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
            code += 'A456,198,2,4,1,1,N,"' + ':' + ' ' + vArea + '"' + printCodes.new_line;
            code += 'A581,169,2,4,1,1,N,"' + 'Phone#' + '"' + printCodes.new_line;
            code += 'A468,169,2,4,1,1,N,"' + ' :' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
            code += 'A225,169,2,4,1,1,N,"' + 'Gender' + '"' + printCodes.new_line;
            code += 'A128,170,2,4,1,1,N,"' + ':' + ' ' + vGender + '"' + printCodes.new_line;
            code += 'A580,140,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
            code += 'A453,141,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
            code += 'A580,113,2,4,1,1,N,"' + 'DOB' + '"' + printCodes.new_line;
            code += 'A453,113,2,4,1,1,N,"' + ':' + ' ' + vDOB + '"' + printCodes.new_line;
            code += 'B415,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
            code += 'P5' + printCodes.new_line;
            printData.push(code);
            $scope.printRaw(printData);
        };
        $scope.opbill = function () {
            var inputData = {
                Id: $scope.currentcontext.pid
            };
            var options = {
                action: 'billing/patientbills/PrintPatientBillsByPatient',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.getPatients();
    }
    patientprintController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();