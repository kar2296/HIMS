(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VaccineResultInfoController', VaccineResultInfoController);

    function VaccineResultInfoController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.VaccineData = {};
        $scope.currentcontext = {};
        $scope.currentcontext.oid = parseInt(modalConfig.params.oid);
        $scope.currentcontext.selfcard = modalConfig.params.selfcard;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.PatInfo = {};
            if (data.Patient) {
                if (data.Patient.Title) {
                    $scope.PatInfo.PatientName = data.Patient.Title.Description;
                }
                if (data.Patient.FirstName) {
                    $scope.PatInfo.PatientName += ' ' + data.Patient.FirstName;
                }
                if (data.Patient.LastName) {
                    $scope.PatInfo.PatientName += ' ' + data.Patient.LastName;
                }
            }
            $scope.getDetails();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.woid && $scope.currentcontext.woid > 0) {

                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorderById',
                    data: {
                        Id: $scope.currentcontext.woid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.VaccineData = res.Data[0];
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.getDetails = function () {
            if ($scope.currentcontext.woid && $scope.currentcontext.woid > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.woid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'lis/patientworkorderdetails/GetVaccineCardOrderdetailss',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getvaccinecenterCallback = function (scope, res, options, hasError) {
            $scope.data = res.Data;
            $scope.item.VaccineCenterId = $scope.data[0].Id;
            $scope.item.VaccineCenterName = $scope.data[0].VaccineCenterName;
            $scope.item.VaccinatedBy = $scope.data[0].HealthWorker;
        };


        $scope.getvaccinecenter = function (item) {

            var inputData = {
                Params: [{ Key: 0, Value: $scope.item.VaccineCenterId },],
            };

            var options = {
                action: 'SystemSettings/VaccineCenter/GetVaccineCenters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvaccinecenterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.woid,
            };
            if ($scope.currentcontext.selfcard) {
                var actionName = 'lis/patientworkorder/PrintPatientVaccineCardWorkorder';
            } else {
                var actionName = 'lis/patientworkorder/PrintPatientVaccineWorkorder';
            }

            var options = {
                action: actionName,
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.items = res.Data[0];
                $scope.currentcontext.woid = $scope.items.Id;
                $scope.getItem();
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: $scope.currentcontext.oid,
                },]
            };

            var options = {
                action: 'lis/patientworkorder/GetVirtualPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getList();
    }

    VaccineResultInfoController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();