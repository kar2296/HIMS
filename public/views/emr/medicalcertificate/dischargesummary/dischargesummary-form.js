(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargesummaryFormController', dischargesummaryFormController);

    function dischargesummaryFormController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.context = 'main';
        $scope.prescription = [];
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }
        $scope.item = {
            NoteTypeId: 1,
            doa: utl.Formatter.getCurrentDate(),
            dateofbirth: utl.Formatter.getCurrentDate(),
            DischargeTypeId: 1,
            isCompleted: false,
            NoteTemplateId: -1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.tracker = [];
        $scope.track = {}
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = parseInt($stateParams.id || 0);
        $scope.currentcontext.encounterid = parseInt($stateParams.eid);
        $scope.currentcontext.patientid = parseInt($stateParams.pid);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.encounterid = modalConfig.params.eid;
            $scope.currentcontext.patientid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        console.log("pid =" + $scope.currentcontext.patientid);
        console.log("eid =" + $scope.currentcontext.encounterid);
        if ($stateParams.context) {
            $scope.currentcontext.context = $stateParams.context;
        }
        if ($stateParams.context == 'summary' && $scope.context == 'emr') {
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
            if ($scope.currentcontext.encounter) {
                $scope.currentcontext.encounterid = $scope.currentcontext.encounter.Id;
                $scope.currentcontext.aid = $scope.currentcontext.encounter.AppointmentId;
                $scope.currentcontext.doctorid = $scope.currentcontext.encounter.DoctorId;
            }
        }


        $scope.backToList = function() {
            if ($scope.context == 'main') {
                $state.go('app.dischargesummarys');
            }
            if ($scope.context == 'emr') {
                $state.go('patientemr.dischargesummarys');
            }
            // if ($scope.currentcontext.ismodal) {
            //     $scope.confirmCallback();
            // } else
            //     $state.go('app.dischargesummarys');
        };
        $scope.addNew = function(item) {
            utl.Modal.open('patientemr.prescription', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.patientid,
                    eid: $scope.currentcontext.encounterid,
                    context: $scope.currentcontext.context,
                    doctid: item.DoctorId,
                    deptid: item.DepartmentId
                },
                confirmCallback: getprescription
            });
        };
        $scope.refresh = function() {
            $scope.$$childTail.initLookup();
        };
        //Prescriptions
        function getPrescriptionListCallback(scope, res, options, hasError) {

            $scope.prescription = res.Data;

            var presdetails = [];
            $scope.prescription = res.Data || [];
            for (var idx in $scope.prescription) {
                var detail = $scope.prescription[idx];
                for (var iddx in detail.PrescriptionDetails)
                    presdetails.push(detail.PrescriptionDetails[iddx]);
            }
            $scope.PrescriptionDetails = presdetails;
            $scope.getTracker();
        };

        function getprescription() {

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.patientid
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.encounterid
                    },
                    {
                        Key: 16,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: getPrescriptionListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.prescribeprint = function() {
            var inputData = {
                Id: $scope.currentcontext.encounterid
            };
            var options = {
                action: 'emr/Prescription/PrintActiveMedication',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Title',
                    field: 'Title',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'PatientName',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Age/Gender',
                    field: 'Age',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'DOB',
                    field: 'DOB',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'MRN',
                    field: 'MRN',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Visit#',
                    field: 'VisitIdentifier',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Ward/Room/Bed',
                    field: 'WardDetail',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            if (selectedItem) {
                result = '';
                if (selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
                // if (selectedItem.Patient.Department)
                //     result += '' + selectedItem.Department;
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = '';
                if (selectedItem.Patient && selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
                // if (selectedItem.Patient && selectedItem.Patient.Department)
                //     result += '' + selectedItem.Patient.Department;
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;

            //Only ip encounter
            var inputData = {
                Params: [{
                        Key: 15, //EncounterTypeId
                        Value: 2
                    }, {
                        Key: 38, //AdmissionStatusId
                        Value: [2, 3, 4, 5, 6]
                    },
                    {
                        Key: 1,
                        Value: utl.Session.getCurrentFacilityId()
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 11, //PatientNameMRN
                    Value: query
                });
            }
            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                if (item.Patient.LastName) item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                else item.PatientName = item.Patient.FirstName;
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        }

        $scope.patientChanged = function() {
            $scope.Encounter = $scope.item.SelectedItem;
            var selectedItem = $scope.item.SelectedItem;
            if (selectedItem) {
                $scope.item.EncounterId = selectedItem.Id;
                $scope.item.AdmissionDate = selectedItem.AdmissionDate;
                $scope.item.DeathDate = selectedItem.DeathDate;
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.DepartmentName = selectedItem.Department.DepartmentName;
                $scope.item.WardId = selectedItem.WardId
                $scope.item.RoomId = selectedItem.RoomId;
                $scope.item.BedId = selectedItem.BedId;
                $scope.item.GuarantorId = selectedItem.GuarantorId;
                $scope.item.AdmissionStatusId = selectedItem.AdmissionStatusId;
                $scope.item.DischargeTypeId = selectedItem.DischargeTypeId;
                if (selectedItem.AdmissionStatusId == 6) {
                    $scope.item.DischargeDate = selectedItem.DischargeDate;
                } else {
                    $scope.item.DischargeDate = utl.Formatter.getCurrentDate();
                }
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientMrn = selectedItem.PatientMrn;
                $scope.item.VisitIdentifier = selectedItem.VisitIdentifier;
                $scope.item.Age = selectedItem.Patient.Age;
                $scope.item.Mobile = selectedItem.Patient.Mobile;
                $scope.item.GuarantorName = selectedItem.Guarantor.GuarantorName;
                $scope.item.PatientName = '';
                $scope.item.DoctorName = '';
                // $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                if (selectedItem.Doctor.Title)
                    $scope.item.DoctorName += selectedItem.Doctor.Title.Description;
                if (selectedItem.Doctor.FirstName)
                    $scope.item.DoctorName += ' ' + selectedItem.Doctor.FirstName;
                if (selectedItem.Doctor.LastName)
                    $scope.item.DoctorName += ' ' + selectedItem.Doctor.LastName;
                if (selectedItem.Patient.Title)
                    $scope.item.PatientName += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.LastName;
                if (selectedItem.Patient.Gender)
                    $scope.item.Gender = selectedItem.Patient.Gender.Description;
                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                    if (selectedItem.WardMaster) {
                        $scope.item.WardDetail = selectedItem.WardMaster.WardName;
                    }
                    if (selectedItem.WardRoomMaster) {
                        $scope.item.WardDetail += ' / ' + selectedItem.WardRoomMaster.RoomNo;
                    }
                    if (selectedItem.WardRoomBedMaster) {
                        $scope.item.WardDetail += ' / ' + selectedItem.WardRoomBedMaster.BedNo;
                    }
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
            }
            if ($scope.currentcontext.id == 0 || !$scope.currentcontext.id) {
                $scope.getPrevPatCertByPatId();
            }
        }

        $scope.EncInfoCallBack = function(scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            var selectedItem = $scope.Encounter;
            if (selectedItem) {
                $scope.item.EncounterId = selectedItem.Id;
                $scope.item.AdmissionDate = selectedItem.AdmissionDate;
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.DepartmentName = selectedItem.Department.DepartmentName;
                $scope.item.WardId = selectedItem.WardId
                $scope.item.RoomId = selectedItem.RoomId;
                $scope.item.BedId = selectedItem.BedId;
                $scope.item.GuarantorId = selectedItem.GuarantorId;
                $scope.item.AdmissionStatusId = selectedItem.AdmissionStatusId;
                if (selectedItem.AdmissionStatusId == 6) {
                    $scope.item.DischargeDate = selectedItem.DischargeDate;
                } else {
                    $scope.item.DischargeDate = utl.Formatter.getCurrentDate();
                }
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientMrn = selectedItem.PatientMrn;
                $scope.item.VisitIdentifier = selectedItem.VisitIdentifier;
                $scope.item.Age = selectedItem.Patient.Age;
                $scope.item.Mobile = selectedItem.Patient.Mobile;
                $scope.item.GuarantorName = selectedItem.Guarantor.GuarantorName;
                $scope.item.PatientName = '';
                $scope.item.DoctorName = '';
                // $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                if (selectedItem.Doctor.Title)
                    $scope.item.DoctorName += selectedItem.Doctor.Title.Description;
                if (selectedItem.Doctor.FirstName)
                    $scope.item.DoctorName += ' ' + selectedItem.Doctor.FirstName;
                if (selectedItem.Doctor.LastName)
                    $scope.item.DoctorName += ' ' + selectedItem.Doctor.LastName;
                if (selectedItem.Patient.Title)
                    $scope.item.PatientName += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.LastName;
                if (selectedItem.Patient.Gender)
                    $scope.item.Gender = selectedItem.Patient.Gender.Description;
                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                    if (selectedItem.WardMaster) {
                        $scope.item.WardDetail = selectedItem.WardMaster.WardName;
                    }
                    if (selectedItem.WardRoomMaster) {
                        $scope.item.WardDetail += ' / ' + selectedItem.WardRoomMaster.RoomNo;
                    }
                    if (selectedItem.WardRoomBedMaster) {
                        $scope.item.WardDetail += ' / ' + selectedItem.WardRoomBedMaster.BedNo;
                    }
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
            }
            if ($scope.currentcontext.id == 0 || !$scope.currentcontext.id) {
                $scope.getPrevPatCertByPatId();
            }
        }


        $scope.EncInfo = function() {
            if ($scope.currentcontext.encounterid && $scope.currentcontext.encounterid > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.encounterid
                    }]
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.EncInfoCallBack
                };
                utl.Http.doAction(options);
            }
        };

        $scope.save = function() {
            $scope.item.CertificateStatusId = 2; // Draft
            $scope.saveItem();
        };
        $scope.saveandActive = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 1; // Created
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };

        $scope.approve = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 3; // Approved
            $scope.item.AprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedOn = utl.Formatter.getCurrentDate();
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.saveItem();
        };

        $scope.reverse = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 2; // Draft
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.msg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };

        $scope.releasedtopatient = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 5; // Released To Patient
            $scope.item.ReleasedBy = utl.Session.getCurrentUserId();
            $scope.item.ReleasedOn = utl.Formatter.getCurrentDate();
            $scope.item.ReleasedToPatient = 1;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.releasemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };

        /*
                $scope.onCancelConfirmed = function () {
                    $scope.item.CertificateStatusId = 4; // Cancelled
                    $scope.saveItem();
                }

                $scope.Cancel = function () {
                    var confirmOptions = {
                        headingKey: 'common.confirm-modal-header.lbl',
                        messageKey: 'medicalcertificate.dischargesummary-form.cancelmsg.lbl',
                        yesKey: 'common.yeskey.lbl',
                        noKey: 'common.nokey.lbl',
                        placeholder: $scope.item.ReceiptNumber,
                        onSuccessMethod: $scope.onCancelConfirmed,
                    };
                    utl.Dialog.confirmMessage(confirmOptions, $scope.item.ReceiptNumber);
                }
        */
        /*
                $scope.labresult = function () {
                    utl.Modal.open('patientemr.labresults', {
                        params: {
                            eid: $scope.currentcontext.encounterid, pid: $scope.currentcontext.patientid
                        },
                        confirmCallback: $scope.getItem
                    });
                };
                $scope.radiologyresult = function () {
                    utl.Modal.open('patientemr.radiologyresults', {
                        params: {
                            eid: $scope.currentcontext.encounterid, pid: $scope.currentcontext.patientid
                        },
                        confirmCallback: $scope.getItem
                    });
                }
        */
        $scope.labresult = function() {
            var inputData = {
                Id: $scope.item.EncounterId
            };
            var options = {
                action: 'emr/patientorder/PrintConsolidatedLabResult',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.radiologyresult = function() {
            var inputData = {
                Id: $scope.item.EncounterId
            };
            var options = {
                action: 'emr/patientorder/PrintConsolidatedRadiologyResult',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.patientprofiledetails = function() {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: loadData
            });
        };

        //Doctor config related code starts
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
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
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }
        //Doctor config related code ends

        $scope.applyVisibilityRules = function() {
            // Draft

            if (!$scope.currentcontext.id || $scope.currentcontext.id <= 0) {

                $scope.canShowSaveBtn = true;
                $scope.canShowBackBtn = true;
                $scope.canShowSaveactiveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canprintBtn = false;

            }
            // else {
            //     $scope.canShowSaveBtn = false;
            //     $scope.canShowDeleteBtn = false;
            //     $scope.canShowCancelledBtn = false;
            //     $scope.canShowSaveandApproveBtn = true;
            //     $scope.canShowClearBtn = true;
            //     $scope.canShowAddNewBtn = true;

            if ($scope.item.CertificateStatusId == 1) {
                $scope.canShowSaveBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowSaveactiveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canprintBtn = true;

            }
            // Bill Completed
            if ($scope.item.CertificateStatusId == 2) {
                $scope.canShowSaveBtn = true;
                $scope.canShowBackBtn = true;
                $scope.canShowSaveactiveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canprintBtn = true;
            }
            // Bill Cancelled
            if ($scope.item.CertificateStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowSaveactiveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canprintBtn = true;
                $scope.canShowreverseBtn = true;
                $scope.canShowrelesedBtn = true;
            }
            // if ($scope.item.CertificateStatusId == 4) {
            //     $scope.canShowSaveBtn = false;
            //     $scope.canhistoryBtn = true;
            //     $scope.canShowPrescribeOrderBtn = false;
            //     $scope.canShowClearBtn = false;
            //     $scope.canShowSaveactiveBtn = false;
            //     $scope.canShowSaveandApproveBtn = false;
            //     $scope.canbedoccupancyBtn = true;
            //     $scope.canShowCancelBtn = true;
            //     $scope.canprintBtn = true;
            //     $scope.canphysicaldischargeBtn = false;
            // }
            if ($scope.item.CertificateStatusId == 5) {
                $scope.canShowSaveBtn = false;
                $scope.canhistoryBtn = true;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowSaveactiveBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.canbedoccupancyBtn = false;
                $scope.canprintBtn = true;
                $scope.canShowreverseBtn = false;
                $scope.canphysicaldischargeBtn = true;
                $scope.canShowrelesedBtn = false;
            }
            // if ($scope.item.CertificateStatusId == 6) {
            //     $scope.canShowSaveBtn = false;
            //     $scope.canhistoryBtn = true;
            //     $scope.canShowPrescribeOrderBtn = false;
            //     $scope.canShowClearBtn = false;
            //     $scope.canShowSaveandApproveBtn = false;
            //     $scope.canShowCancelBtn = true;
            //     $scope.canprintBtn = true;
            //     $scope.canShowViewReceipt = true;
            // }
            // }


        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

        //save item
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.currentcontext.id = parseInt(data);
            }
            $scope.getItem();
        };

        $scope.saveItem = function() {


            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'dischargesummary/PatientCertificate/AddPatientCertificate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'dischargesummary/PatientCertificate/UpdatePatientCertificate';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };


        //GetNoteTemplateById
        $scope.getNoteTemplateByIdCallback = function(scope, data, options, hasError) {
            $scope.item.DataTemplate = data.DataTemplate;
        };
        $scope.onNoteTemplateChange = function() {
            var options = {
                action: 'clinicalmaster/NoteTemplate/GetNoteTemplateById',
                data: {
                    Id: $scope.item.NoteTemplateId
                },
                type: 'post',
                onComplete: $scope.getNoteTemplateByIdCallback
            };
            utl.Http.doAction(options);
        };

        //Print
        $scope.print = function() {
            var inputData = {
                Id: $scope.item.EncounterId
            };
            var options = {
                action: 'DischargeSummary/patientcertificate/PrintPatientCertificate',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.print2 = function() {
            var inputData = {
                Id: $scope.item.EncounterId
            };
            var options = {
                action: 'DischargeSummary/patientcertificate/PrintPatientCertificatewithoutheader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        // $scope.getPatientCertificatebyEnIdCallback = function (scope, data, options, hasError) {
        //     if (data.Data.length > 0) {
        //         if (data.Data.length > 0) {
        //             utl.Alert.showErrorMsg($translate.instant('Already Summary Created for this Patient'));
        //             $scope.canShowSaveBtn = false;
        //             $scope.canShowSaveactiveBtn = false;
        //             $scope.canShowSaveandApproveBtn = false;
        //         }
        //     }
        // }

        $scope.getPatientCertificatebyEnIdCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                if (data.Data.length > 0) {
                    utl.Alert.showErrorMsg($translate.instant('Already Summary Created for this Patient'));
                    $scope.canShowSaveBtn = false;
                    $scope.canShowSaveactiveBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    // if ($scope.context == 'emr') {
                    //     $scope.currentcontext.id = data.Data[0].Id;
                    //     $scope.getItem();
                    // }
                }
            }
        }



        $scope.getPrevPatCertByPatId = function() {
            var inputData = {
                Params: [{
                    Key: 10,
                    Value: $scope.item.PatientId
                }, {
                    Key: 6,
                    Value: $scope.item.EncounterId
                }]
            };
            var options = {
                action: 'DischargeSummary/patientcertificate/GetPatientCertificates',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientCertificatebyEnIdCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getencountersCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                $scope.item.EncounterId = encounter.Id;
                $scope.currentcontext.patientid = encounter.PatientId;
                $scope.item.PatientId = encounter.PatientId
                $scope.item.WardId = encounter.WardId
                $scope.item.VisitIdentifier = encounter.VisitIdentifier
                $scope.item.DoctorId = encounter.DoctorId
                $scope.item.DepartmentId = encounter.DepartmentId
                $scope.item.RoomId = encounter.RoomId
                $scope.item.BedId = encounter.BedId
                $scope.item.AdmissionDate = encounter.AdmissionDate;
                $scope.item.DischargeDate = encounter.DischargeDate;
                $scope.item.Patient = encounter.Patient;
                if (encounter.AdmissionStatusId == 1) {
                    $scope.item.DisplayAdmissionStatus = 'Draft';
                }
                if (encounter.AdmissionStatusId == 2) {
                    $scope.item.DisplayAdmissionStatus = 'Admitted';
                }
                if (encounter.AdmissionStatusId == 3) {
                    $scope.item.DisplayAdmissionStatus = 'Fit For Discharge';
                }
                if (encounter.AdmissionStatusId == 4) {
                    $scope.item.DisplayAdmissionStatus = 'Clinical Discharge';
                }
                if (encounter.AdmissionStatusId == 5) {
                    $scope.item.DisplayAdmissionStatus = 'Financial Discharge';
                }
                if (encounter.AdmissionStatusId == 6) {
                    $scope.item.DisplayAdmissionStatus = 'Physical Discharge';
                }
                if (encounter.Id > 0 && !($scope.currentcontext.id)) {
                    $scope.getPatientCertificatebyEncounterId(encounter.Id);
                }
            }
        };

        $scope.getEncounterById = function() {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.encounterid
                }, ]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };


        //get item
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.VisitIdentifier = data.Encounter.VisitIdentifier;
            $scope.item.Age = data.Patient.Age;
            if (data.Encounter.PatientGuarantor) {
                $scope.item.GuarantorName = data.Encounter.PatientGuarantor.GuarantorName;
            }
            $scope.item.Mrn = data.Patient.MRN;


            // $scope.item.DoctorName = '';
            // if (data.Doctor.Title)
            //     $scope.item.DoctorName += data.Doctor.Title.Description;
            // if (data.Doctor.FirstName)
            //     $scope.item.DoctorName += ' ' + data.Doctor.FirstName;
            // if (data.Doctor.LastName)
            //     $scope.item.DoctorName += ' ' + data.Doctor.LastName;

            $scope.item.PatientName = '';
            if (data.Patient.Title)
                $scope.item.PatientName += data.Patient.Title.Description;
            if (data.Patient.FirstName)
                $scope.item.PatientName += ' ' + data.Patient.FirstName;
            if (data.Patient.LastName)
                $scope.item.PatientName += ' ' + data.Patient.LastName;
            if (data.Patient.Gender)
                $scope.item.Gender = data.Patient.Gender.Description;

            if (data.WardMaster.WardName) {
                $scope.item.WardDetail = data.WardMaster.WardName;
            }
            if (data.WardRoomMaster.RoomNo) {
                $scope.item.WardDetail += ' / ' + data.WardRoomMaster.RoomNo;
            }
            if (data.WardRoomBedMaster) {
                $scope.item.WardDetail += ' / ' + data.WardRoomBedMaster.BedNo;
            }

            if (data.CertificateStatusId == 3)
                $scope.item.isCompleted = true;
            if (data.AdmissionStatusId == 1) {
                $scope.item.DisplayAdmissionStatus = 'Draft';
            }
            if (data.AdmissionStatusId == 2) {
                $scope.item.DisplayAdmissionStatus = 'Admitted';
            }
            if (data.AdmissionStatusId == 3) {
                $scope.item.DisplayAdmissionStatus = 'Fit For Discharge';
            }
            if (data.AdmissionStatusId == 4) {
                $scope.item.DisplayAdmissionStatus = 'Clinical Discharge';
            }
            if (data.AdmissionStatusId == 5) {
                $scope.item.DisplayAdmissionStatus = 'Financial Discharge';
            }
            if (data.AdmissionStatusId == 6) {
                $scope.item.DisplayAdmissionStatus = 'Physical Discharge';
            }

            // $scope.item.CreatedUser = '';
            if (data.CreatedUser) {
                if (data.CreatedUser.Title)
                    $scope.CreatedBy = data.CreatedUser.Title.Description;
                if (data.CreatedUser.FirstName)
                    $scope.CreatedBy += ' ' + data.CreatedUser.FirstName;
                if (data.CreatedUser.LastName)
                    $scope.CreatedBy += ' ' + data.CreatedUser.LastName;
            }

            // $scope.item.AprovedUser = '';
            if (data.AprovedUser) {
                if (data.AprovedUser.Title)
                    $scope.AprovedBy = data.AprovedUser.Title.Description;
                if (data.AprovedUser.FirstName)
                    $scope.AprovedBy += ' ' + data.AprovedUser.FirstName;
                if (data.AprovedUser.LastName)
                    $scope.AprovedBy += ' ' + data.AprovedUser.LastName;
            }
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'DischargeSummary/PatientCertificate/GetPatientCertificateById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
                $scope.EncInfo();
            }
        };

        $scope.doctorChange = function() {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
            // setAssignToDetails();
            $scope.getList();
        }

        // function loadData() {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         $scope.getPatientCertificatebyEncounterId($scope.currentcontext.encounterid);
        //     } else {
        //         $scope.getItem();
        //     }
        // }
        $scope.generalalerts = function() {
            utl.Modal.open('app.alertview', {
                params: {},
                cancelCallback: $scope.updateCount
            });
        }

        $scope.patientalerts = function() {
            utl.Modal.open('app.alertview', {
                params: {
                    pid: $scope.item.PatientId
                },
                cancelCallback: $scope.updateCount
            });
        }
        $scope.updateCount = function() {
            $scope.getGeneralAlertsCount();
            $scope.getPatientAlertsCount();
        }
        $scope.getPatientAlertsCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.patientAlertsCount = res.Data.length;
        };

        $scope.getPatientAlertsCount = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getGeneralAlertsCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.generalAlertsCount = res.Data.length;
        };

        $scope.getGeneralAlertsCount = function() {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 7,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGeneralAlertsCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addNewTracker = function() {
            $scope.addNewLineItem();
        };
        $scope.addNewLineItem = function() {
            var lineItem = {
                Id: 0,
                DoctorId: $scope.currentcontext.doctorid,
                Duration: '',
                DurationPeriod: 'Days',
                TrackerComments: '',
                IsDischargeMedication: true
            };
            $scope.tracker.push(lineItem);
        }
        $scope.getTrackerCallback = function(scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                for (var idx in res.Data)
                    var data = res.Data[idx];
                // $scope.item = data;
                $scope.tracker = [];
                $scope.tracker = res.Data;
                $scope.track.DoctorId = data.DoctorId;
                if ($scope.item.FollowupAppointmentOn && $scope.item.FollowupAppointmentOn != '' && $scope.item.CreatedAt && $scope.item.CreatedAt != '') {
                    var CreatedAt = new Date($scope.item.CreatedAt);
                    var FollowupAppointmentOn = new Date($scope.item.FollowupAppointmentOn);
                    if (FollowupAppointmentOn != CreatedAt) {
                        $scope.item.Duration = parseInt(Math.round((FollowupAppointmentOn - CreatedAt) / (1000 * 60 * 60 * 24)));
                    }
                }
                $scope.getItem();
            }
        };
        $scope.getTracker = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.patientid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.encounterid
                    },
                    {
                        Key: 6,
                        Value: true
                    },
                ]
            };

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getTrackerCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addtrackerCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getTracker();
        };
        $scope.addtracker = function() {

            $scope.onDurationPeriodChange = function(track) {
                    $scope.track.DurationPeriod = track.Text;
                }
                // $scope.track.DurationPeriodId = 1;
                // $scope.track.DurationPeriod = 'Days';
                // $scope.track.IsDischargeMedication = true;


            var lines = getLinesForSave();
            var options = {
                action: 'appointment/patienttracker/CheckoutPatient',
                data: {
                    Data: $scope.track
                },
                type: 'post',
                onComplete: $scope.addtrackerCallback
            };
            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            var lastIndex = $scope.tracker.length - 1;

            for (var idx in $scope.tracker) {
                var item = $scope.tracker[idx];
                if (item.Duration) {
                    item.PatientId = $scope.currentcontext.patientid;
                    item.EncounterId = $scope.currentcontext.encounterid;
                    item.AppointmentId = $scope.currentcontext.aid;
                    $scope.track = item;
                    $scope.track.DurationPeriodId = 1;
                    $scope.track.DurationPeriod = 'Days';
                    $scope.track.IsDischargeMedication = true;
                }
                if ($scope.track.Duration && $scope.track.DurationPeriod) {
                    $scope.track.FollowupAppointmentOn = utl.Formatter.computeDateBasedOnPeriod($scope.track.Duration, $scope.track.DurationPeriod);
                    console.log($scope.track.FollowupAppointmentOn);
                }
            }
            return $scope.track;
        };
        //back
        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        }


        //plugins - START
        $scope.callPluginScreen = function(item) {
            if (item.DischargeSummaryPluginsId > 0) {
                switch (item.DischargeSummaryPluginsId) {
                    case 1:
                        utl.Modal.open('patientemr.dischargepatientdiagnosisform', {
                            params: {
                                id: 0,
                                pid: $scope.currentcontext.patientid,
                                itemid: null
                            },
                            confirmCallback: $scope.getDischargePluginNoteUpdate
                        });
                        break;
                    case 2:
                        utl.Modal.open('patientemr.dischargePrescriptionList', {
                            params: {
                                id: 0,
                                pid: $scope.currentcontext.patientid,
                                itemid: null
                            },
                            confirmCallback: $scope.getDischargePluginNoteUpdate
                        });
                        break;
                    case 3:
                        utl.Modal.open('patientemr.otnotesplugin', {
                            params: {
                                id: 0,
                                pid: $scope.currentcontext.patientid,
                                eid: $scope.currentcontext.encounterid,
                                itemid: null
                            },
                            confirmCallback: $scope.getDischargePluginNoteUpdate
                        });
                        break;
                    case 4:
                        utl.Modal.open('patientemr.labresultplugin', {
                            params: {
                                id: 0,
                                pid: $scope.currentcontext.patientid,
                                eid: $scope.currentcontext.encounterid,
                                itemid: null
                            },
                            confirmCallback: $scope.getDischargePluginNoteUpdate
                        });
                        break;
                    case 5:
                        utl.Modal.open('patientemr.radiologyresultplugin', {
                            params: {
                                id: 0,
                                pid: $scope.currentcontext.patientid,
                                eid: $scope.currentcontext.encounterid,
                                itemid: null
                            },
                            confirmCallback: $scope.getDischargePluginNoteUpdate
                        });
                        break;

                }
                item.DischargeSummaryPluginsId = -1;
            }
        }

        $scope.getDischargePluginNoteUpdate = function(saveddata) {
                if (saveddata.data) {
                    var templatedesign = '';
                    templatedesign += saveddata.data;
                    $scope.addondata = templatedesign;
                }
            }
            //plugins - END
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        //lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "DischargeType"
                },
                // {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "NoteType"
                },
                // {
                //     "Key": "Department"
                // },
                {
                    "Key": "AdmissionStatus"
                },
                // {
                //     "Key": "DurationPeriod"
                // },
                // {
                //     "Key": "DischargeSummaryPlugins"
                // },
                {
                    "Key": "NoteTemplate",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: $scope.item.NoteTypeId
                        }]
                    }
                }
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

    dischargesummaryFormController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout'];

})();