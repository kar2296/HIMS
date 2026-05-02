(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientkinFormController', patientkinFormController);

    function patientkinFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.item = {
            CountryId: 1
        };

        // $scope.currentcontext = { patient: {} };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        // $scope.currentcontext.id = parseInt($stateParams.patientkinid);
        // $scope.currentcontext.patientid = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.patientkinid);
            $scope.currentcontext.patientid = parseInt(modalConfig.params.id);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getPatientItemCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.patient = data;
            $scope.item.AddressLine1 = $scope.currentcontext.patient.AddressLine1;
            $scope.item.AddressLine2 = $scope.currentcontext.patient.AddressLine2;
            $scope.item.PinCodeId = $scope.currentcontext.patient.PinCodeId;
            $scope.item.CityId = $scope.currentcontext.patient.CityId;
            $scope.item.StateId = $scope.currentcontext.patient.StateId;
            // $scope.item.CountryId = 1;
            $scope.item.Pincode = $scope.currentcontext.patient.Pincode;
            $scope.item.Area = $scope.currentcontext.patient.Area;
            $scope.item.City = $scope.currentcontext.patient.City;
            $scope.item.State = $scope.currentcontext.patient.State;
            $scope.item.Country = $scope.currentcontext.patient.Country;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'registration/patientkin/GetPatientKinById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.getPatientItem = function () {
            if ($scope.currentcontext.patientid && $scope.currentcontext.patientid > 0) {

                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentcontext.patientid },
                    type: 'post',
                    onComplete: $scope.getPatientItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal)
                $scope.confirmCallback();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!$scope.item.LandLine && !$scope.item.Mobile) {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.atleast-one-contactno-msg.lbl'));
                return;
            }
            var actionName = 'registration/patientkin/AddPatientKin';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'registration/patientkin/UpdatePatientKin';
            }

            $scope.item.PatientId = $scope.currentcontext.patientid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.fillGenderInfo = function () {

            if ($scope.item.TitleId == 10) { // 10-MR 
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };
        $scope.canShowApproxAge = function () {
            return $scope.lookup && $scope.lookup.Title && $scope.item.TitleId == utl.Lookup.getDefault($scope.lookup.Title, 'BABY OF');
        }
        $scope.calculateAge = function () {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
            $scope.item.IsBirthDateApproximate = false;
        }
        $scope.calculateDOB = function (age, substractPart) {
            if (substractPart == 'days') {
                $scope.item.ApproxAgeMonths = '';
                $scope.item.Age = null;
            } else if (substractPart == 'months') {
                $scope.item.ApproxAgeDays = '';
                $scope.item.Age = null;
            } else if (substractPart == 'years') {
                $scope.item.ApproxAgeDays = '';
                $scope.item.ApproxAgeMonths = '';
            }

            $scope.item.DOB = utl.Formatter.getDOBFromAge(age, substractPart);
            $scope.item.IsBirthDateApproximate = true;
        };
        $scope.sameaddress = function () {
            if ($scope.item.SameAddress) {
                $scope.getPatientItem();

            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Relationship" },
                { "Key": "Title" },
                { "Key": "Gender" },
                { "Key": "BloodGroup" },
                { "Key": "Relationship" },
                //  { "Key": "Pincode" },
                // { "Key": "City" },
                // { "Key": "State" },
                //  { "Key": "Country" },
            ];

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

    patientkinFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();