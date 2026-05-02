(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('slotscheduleController', slotscheduleController);

    function slotscheduleController($scope, $stateParams, $state, $translate, utl, Upload) {

        $scope.currentcontext = {};
        $scope.drdetail = $stateParams.drData;
        $scope.slotdata = $stateParams.slotinfo;
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.currentcontext.ctypeId = parseInt($stateParams.ctypeId);

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };
        $scope.home = function () {
            $state.go('app.createorderdashboard');
        }

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
            $scope.EncounterId = $scope.Encounter.Id;
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
        $scope.backToList = function () {
            $state.go('app.bookappointment', {
                docData: $scope.drdetail,
            });
        }

        $scope.confirmorder = function () {
            $state.go('app.confirmorder', {
                pid: $scope.selectedPatient.Id,
                eid: $scope.EncounterId || 0,
                drData: $scope.drdetail,
                slotinfo: $scope.slotdata,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId
            });
        }
        $scope.quickreg = function () {
            $state.go('app.quickreg', {
                drData: $scope.drdetail,
                slotinfo: $scope.slotdata,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId
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

        // $scope.track = function () {
        //     $state.go('app.virtualpatienttrackertab.virtualpendingorder', {
        //         context: 'bypid',
        //         pid: $scope.selectedPatient.Id,
        //         ctgryid: $scope.currentcontext.vcategoryid,
        //         drData: $scope.drdetail,
        //         slotinfo: $scope.slotdata,
        //     });
        // }
    }

    slotscheduleController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();