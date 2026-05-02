(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceScheduleController', ServiceScheduleController);

    function ServiceScheduleController($scope, $stateParams, $state, $translate, utl, Upload) {

        $scope.currentcontext = {};
        $scope.orderid = parseInt($stateParams.orderdata);
        $scope.slotdata = $stateParams.slotinfo;
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.currentcontext.ctypeId = parseInt($stateParams.ctypeId);
        $scope.item = {}
        $scope.VOrderDetails = [];

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };
        $scope.getvirtualorderDetailsCallback = function (scope, data, options, hasError) {
            $scope.VOrderDetails = data.Data;
            $scope.OrderScheduleDate = $scope.VOrderDetails[0].VirtualOrder.OrderScheduleDate;
            $scope.currentcontext.TotalNetAmount = $scope.VOrderDetails[0].VirtualOrder.TotalNetAmount;
        };

        $scope.getvirtualorderDetails = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.orderid

                }],
            };
            var options = {
                action: 'VirtualHealthcare/VirtualOrderDetail/GetVirtualOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvirtualorderDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.selectedPatient.PhotoPath) {
                var inputData = {
                    Id: $scope.selectedPatient.Id,
                    PhotoPath: $scope.selectedPatient.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.Encounter = data.Encounters[0];
            $scope.getPatientProfilePic();
        }


        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }
        $scope.home = function () {
            $state.go('app.createorderdashboard');
        }
        $scope.backToList = function () {
            $state.go('app.serviceselectInfo', {
                docData: $scope.drdetail,
            });
        };
        $scope.confirmorder = function () {
            $state.go('app.confirmorder', {
                pid: $scope.selectedPatient.Id,
                orderid: $scope.orderid,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId
            });
        }
        $scope.quickreg = function () {
            $state.go('app.quickreg', {
                id: 0
            });
        }
        $scope.track = function () {
            utl.Modal.open('app.patientpendingorder', {
                params: {
                    pid: $scope.selectedPatient.Id,
                    ctgryid: $scope.currentcontext.vcategoryid,
                    drData: $scope.drdetail,
                    slotinfo: $scope.slotdata,
                },
                confirmCallback: $scope.patientChange
            });
        }
        $scope.getvirtualorderDetails();
    }

    ServiceScheduleController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();