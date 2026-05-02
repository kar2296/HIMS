(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDetailsFormController', patientDetailsFormController);

    function patientDetailsFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {};
        $scope.Encounter = {};
        $scope.Patient = {};
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.pid);
            $scope.currentcontext.AdmissionStatusId = parseInt(modalConfig.params.asid)
            $scope.currentcontext.IsAttender = modalConfig.params.IsAttender || false;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.UpdateLinks = function () {
            $scope.LinkItems = [];
            $scope.LinkItems.push({
                Text: 'EMR', state: 'patientemr.patientrecords',
                Params: { eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: false, isEMR: true
            });
            $scope.LinkItems.push({
                Text: 'House Keeping Request', state: 'app.housekeeprequest',
                Params: { id: 0, eid: $scope.Encounter.Id, pid: $scope.Patient.Id, isbed: true }, isModal: true, isEMR: false
            });
            $scope.LinkItems.push({
                Text: 'Transportation Request', state: 'app.transportrequest',
                Params: { id: 0, eid: $scope.Encounter.Id, pid: $scope.Patient.Id, isbed: true }, isModal: true, isEMR: false
            });
            if (!$scope.Encounter.IsBillLock && $scope.item.WardMasterType == 1)
                $scope.LinkItems.push({
                    Text: 'Bed Transfer', state: 'app.bedtransferform',
                    Params: { historyid: $scope.OccupancyHistory.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
                });
            // if (!$scope.Encounter.IsBillLock && $scope.item.WardMasterType == 1)
            //     $scope.LinkItems.push({
            //         Text: 'OT Transfer', state: 'app.otbedtransferform',
            //         Params: { historyid: $scope.OccupancyHistory.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
            //     });
            // if ($scope.item.WardMasterType == 1)
            //     $scope.LinkItems.push({
            //         Text: 'OT Receive', state: 'app.otbedtransferform',
            //         Params: { historyid: $scope.OccupancyHistory.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
            //     });

            // if ($scope.item.WardMasterType == 3)
            //     $scope.LinkItems.push({
            //         Text: 'OT Register', state: 'app.otregistertab.otregister',
            //         Params: { id: 0, pid: $scope.Patient.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
            //     });
            // if ($scope.item.WardMasterType == 3)
            //     $scope.LinkItems.push({
            //         Text: 'OT Request Details', state: 'app.otrequest',
            //         Params: { historyid: $scope.OccupancyHistory.Id, pid: $scope.Patient.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
            //         // Params: { historyid: $scope.OccupancyHistory.Id, pid: $scope.Patient.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
            //     });
            // if ($scope.item.WardMasterType == 3)
            // if (!$scope.Encounter.IsBillLock) {
            //     $scope.LinkItems.push({
            //         Text: 'Medical Equipments', state: 'app.equipmentsused',
            //         Params: { historyid: $scope.OccupancyHistory.Id, pid: $scope.Patient.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
            //     });
            // }

            // if ($scope.item.WardMasterType == 3)
            //     $scope.LinkItems.push({
            //         Text: 'Material Issues', state: 'app.material',
            //         Params: { historyid: $scope.OccupancyHistory.Id, pid: $scope.Patient.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
            //     });
            if ($scope.item.WardMasterType == 3)
                $scope.LinkItems.push({
                    Text: 'Transfer To bed', state: 'app.bedtransferform',
                    Params: { historyid: $scope.OccupancyHistory.Id, encounterid: $scope.Encounter.Id }, isModal: true, isEMR: false
                });
            $scope.LinkItems.push({
                Text: 'Bed Transfer History', state: 'app.bedoccupancyhistory',
                Params: { pid: $scope.Patient.Id }, isModal: true, isEMR: false
            });
            // if (!$scope.Encounter.IsBillLock)
            //     $scope.LinkItems.push({
            //         Text: 'Clinical Orders', state: 'patientemr.patientorder',
            //         Params: { id: 0, eid: $scope.Encounter.Id, context: 'emr', pid: $scope.Patient.Id }, isModal: true, isEMR: false
            //     });
            // $scope.LinkItems.push({
            //     Text: 'Lab Results', state: 'patientemr.labresults',
            //     Params: { eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: true, isEMR: false
            // });
            // $scope.LinkItems.push({
            //     Text: 'Prescription(Rx)', state: 'patientemr.prescription',
            //     Params: { id: 0, eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: true, isEMR: true
            // });
            if (!$scope.Encounter.IsBillLock) {
                if ($scope.currentcontext.AdmissionStatusId <= 4) {
                    $scope.LinkItems.push({
                        Text: 'Medicine Request', state: 'app.medicinerequest',
                        Params: { id: 0, eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: true, isEMR: false
                    });
                    $scope.LinkItems.push({
                        Text: 'Medicine Return', state: 'app.medicinereturn',
                        Params: { id: 0, eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: true, isEMR: false
                    });
                }
            }
            if (!$scope.Encounter.IsBillLock)
                $scope.LinkItems.push({
                    Text: 'Bill Other Services', state: 'app.ipbillingprofiledetails',
                    Params: { id: $scope.Encounter.Id, pid: $scope.Patient.Id, bedcontext: true }, isModal: true, isEMR: false
                });
            $scope.LinkItems.push({
                Text: 'Discharge Summary', state: 'app.dischargesummary-form',
                Params: { id: 0, eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: true, isEMR: false
            });
            $scope.LinkItems.push({
                Text: 'Previous Orders & Bills', state: 'app.previousorders',
                Params: { eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: true, isEMR: false
            });
            $scope.LinkItems.push({
                Text: 'Feedbacks', state: 'patientemr.patientfeedback',
                Params: { id: 0, eid: $scope.Encounter.Id, pid: $scope.Patient.Id }, isModal: true, isEMR: false
            });
        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.Patient.Id },
                confirmCallback: $scope.getItem
            });
        }

        $scope.getOccupancyHistoryCallBack = function (scope, res, options, hasError) {
            $scope.OccupancyHistory = res.Data[0];
            $scope.UpdateLinks();
        }

        $scope.getOccupancyHistory = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.Encounter.Id },
                    { Key: 2, Value: 1 },
                    { Key: 5, Value: true },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOccupancyHistoryCallBack
            };
            utl.Http.doAction(options);
        }

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            $scope.item.Photo = photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = { Id: $scope.item.Id, PhotoPath: $scope.item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
            if (!$scope.currentcontext.IsAttender)
                $scope.getOccupancyHistory();
        };

        $scope.Navigateto = function (item) {
            if (item.isModal) {
                utl.Modal.open(item.state, {
                    params: item.Params,
                    confirmCallback: $scope.getItem
                });
            } else {
                if (item.isEMR)
                    utl.Session.setEMRPatientId($scope.Patient.Id);
                $state.go(item.state, item.Params);
            }
            $scope.cancelCallback();
        }
        $scope.DischargeAttenderBedCallback = function (scope, res, options, hasError) {
            if (res)
                $scope.cancelCallback()
        };

        $scope.DischargeAttenderBed = function () {
            if ($scope.Encounter && $scope.Encounter.Id > 0) {
                var inputData = { EncounterId: $scope.Encounter.Id };
                var options = {
                    action: 'IPManagement/BedOccupancyHistory/DischargeAttenderBed',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.DischargeAttenderBedCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.Encounter = {};
            if (res.Data.length > 0) {
                $scope.Encounter = res.Data[0];
                $scope.item.VisitIdentifier = $scope.Encounter.VisitIdentifier;
                $scope.Doctor = $scope.Encounter.Doctor;
                // $scope.item.Doctor = $scope.Doctor.Title.Description + ' ' + $scope.Doctor.FirstName + ' ' + $scope.Doctor.LastName;
                $scope.item.Doctor = (($scope.Doctor.Title ? $scope.Doctor.Title.Description : '')
                    + ' ' + $scope.Doctor.FirstName + ' ' + ($scope.Doctor.LastName !== null ? $scope.Doctor.LastName : ''));
                $scope.item.Status = $scope.Encounter.AdmissionStatus.Description;
                $scope.item.AdmissionDate = $scope.Encounter.AdmissionDate;
                $scope.item.AdmitReason = ($scope.Encounter.AdmittingReason) ? $scope.Encounter.AdmittingReason.Description : '';
                $scope.item.LengthOfStay = $scope.Encounter.ALOS;
                $scope.Patient = $scope.Encounter.Patient;
                if ($scope.Patient.PhotoPath !== null)
                    $scope.item.PhotoPath = $scope.Patient.PhotoPath;
                $scope.item.GenderId = $scope.Patient.GenderId;
                $scope.item.PatientInformation = (($scope.Patient.Title ? $scope.Patient.Title.Description : '')
                    + ' ' + $scope.Patient.FirstName + ' ' + ($scope.Patient.LastName !== null ? $scope.Patient.LastName : '') + ' / ' + $scope.Patient.MRN + ' / '
                    + $scope.Patient.Age + ' / ' + $scope.Patient.Gender.Description);
                $scope.item.WardName = $scope.Encounter.WardMaster.WardName;
                $scope.item.WardMasterType = $scope.Encounter.WardMaster.WardMasterTypeId;
                $scope.item.RoomNo = $scope.Encounter.WardRoomMaster.RoomNo;
                $scope.item.Bed = $scope.Encounter.WardRoomBedMaster.Description;
                $scope.item.GuarantorName = $scope.Encounter.Guarantor.GuarantorName;
                $scope.getPatientProfilePic();
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback($scope.item);
        }

        $scope.getItem = function () {
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 4, Value: $scope.currentcontext.id },
                        { Key: 3, Value: $scope.currentcontext.AdmissionStatusId }
                    ],
                    PageContext: {
                        PageSize: 50,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        }
        $scope.getItem();
    }
    patientDetailsFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();