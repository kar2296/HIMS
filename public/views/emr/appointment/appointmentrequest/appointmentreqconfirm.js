(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('apptReqtConfirmController', apptReqtConfirmController);

    function apptReqtConfirmController($scope, $stateParams, $state, $filter, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.item = {};

        $scope.notsubmitted = true;

        $scope.item.Id = -1;
        $scope.item.IsActive = true;
        $scope.item.AppointmentCategoryId = 5;
        $scope.item.AppointmentDate = null;
        $scope.item.ApptDispDate = null;
        $scope.item.AppointmentId = null;
        $scope.item.AppointmentRequestStatus = '';
        $scope.item.AppointmentRequestStatusId = -1;
        $scope.item.AppointmentStatusId = -1;
        $scope.item.AppointmentTypeId = 1;
        $scope.item.DepartmentId = -1;
        $scope.item.DoctorId = -1;
        $scope.item.DoctorName = '';
        $scope.item.PatientName = '';
        $scope.item.MRN = '';
        $scope.item.MobileNr = '';
        $scope.item.DOB = '';
        $scope.item.Age = '';
        $scope.item.EndTime = null;
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.item.orderscheduleId = -1;
        $scope.item.PatientGuarantorId = -1;
        $scope.item.PatientId = -1;
        $scope.item.PriorityId = 3;
        $scope.item.StartTime = null;
        $scope.item.Comments = null;
        $scope.item.Reason = null;
        $scope.item.ValidateDuplicateEncounter = true;
        $scope.item.ActiveFrom = new Date();

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.item.Id = parseInt(modalConfig.params.id);
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.AppointmentId = modalConfig.params.appointmentid;
            $scope.item.AppointmentDate = modalConfig.params.appointmentDate;
            $scope.item.DepartmentId = modalConfig.params.deptid;
            $scope.item.DoctorId = modalConfig.params.doctorid;
            $scope.item.StartTime = modalConfig.params.starttime;
            $scope.item.EndTime = modalConfig.params.endtime;
            $scope.item.Comments = modalConfig.params.reason;
            $scope.item.Reason = modalConfig.params.reason;
            $scope.item.DoctorName = modalConfig.params.doctorname;
            $scope.item.AppointmentRequestStatusId = modalConfig.params.appointmentrequeststatusid;
            $scope.item.AppointmentStatusId = modalConfig.params.appointmentstatusid;
            $scope.item.ApptDispDate = modalConfig.params.appointmentDate;
            $scope.item.AppointmentRequestStatus = modalConfig.params.appointmentreqstatus;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getPatientInfoCallback = function (scope, data, options, hasError) {
            if (data && data.Id) {
                $scope.currentcontext.PatientName = '';
                $scope.item.MRN = '';
                $scope.item.MobileNr = '';
                $scope.item.DOB = '';
                $scope.item.Age = '';
                if (data.Title && data.Title.Description) {
                    $scope.item.PatientName += data.Title.Description;
                }
                if (data.FirstName) {
                    $scope.item.PatientName += ' ' + data.FirstName;
                }
                if (data.LastName) {
                    $scope.item.PatientName += ' ' + data.LastName;
                }
                $scope.item.MRN =  data.MRN;
                $scope.item.MobileNr =  data.Mobile;
                $scope.item.Age =  data.Age;
                $scope.item.DOB = $filter('date')(data.DOB, 'dd-MMM-yyyy') || null;

            }
        };

        $scope.getPatientInfo = function (pageNo) {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/Patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.SaveItem = function (action , TypeId) {
            var msg = "Are you want to schedule...";
            if (TypeId == 2) {
                msg = "Are you want to confirm...";
            } else if (TypeId == 3) {
                msg = "Are you want to cancel...";
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: action,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.schedule = function () {
            $scope.notsubmitted = false;
            $scope.item.AppointmentRequestStatusId = 2;
            $scope.item.AppointmentStatusId = 2;
            var actionName = 'appointment/AppointmentRequest/AddAppointmentRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'appointment/AppointmentRequest/ManageAppointmentRequest';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.confirm = function () {
            $scope.notsubmitted = false;
            $scope.item.AppointmentRequestStatusId = 3;
            $scope.item.AppointmentStatusId = 3;
            var actionName = 'appointment/AppointmentRequest/AddAppointmentRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'appointment/AppointmentRequest/ManageAppointmentRequest';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);

        }

        $scope.cancel = function () {
            $scope.notsubmitted = false;
            $scope.item.AppointmentRequestStatusId = 5;
            $scope.item.AppointmentStatusId = 5;
            var actionName = 'appointment/AppointmentRequest/AddAppointmentRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'appointment/AppointmentRequest/ManageAppointmentRequest';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);

        }

        $scope.getPatientInfo();



    }

    apptReqtConfirmController.$inject = ['$scope', '$stateParams', '$state', '$filter' ,'$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();