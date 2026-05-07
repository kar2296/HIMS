(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargesummaryAmendController', dischargesummaryAmendController);

    function dischargesummaryAmendController($scope, $filter, $stateParams, $state, $translate, utl, ) {
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "item.DataTemplate".split('.');
                var current = parts[0] === 'vm' ? (typeof vm !== 'undefined' ? vm : $scope.vm) : (parts[0] === 'cvm' ? (typeof cvm !== 'undefined' ? cvm : $scope.cvm) : $scope);
                var startIndex = (parts[0] === 'vm' || parts[0] === 'cvm') ? 1 : 0;
                for (var i = startIndex; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

        $scope.onInsertHtmlDone = function() {
            $scope.$evalAsync(function() {
                $scope.addondata = '';
            });
        };

        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
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
            NoteTemplateId: -1
        };
        $scope.tracker = [];
        $scope.track = {}
        $scope.currentcontext = {
            // ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.encounterid = parseInt($stateParams.eid);
        $scope.currentcontext.patientid = parseInt($stateParams.pid);
        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = modalConfig.params.id;
        //     $scope.currentcontext.encounterid = modalConfig.params.eid;
        //     $scope.currentcontext.patientid = modalConfig.params.pid;
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }
        console.log("pid =" + $scope.currentcontext.patientid);
        console.log("eid =" + $scope.currentcontext.encounterid);
        if ($stateParams.context) {
            $scope.currentcontext.context = $stateParams.context;
        }
        if ($stateParams.context == 'summary' && $scope.context == 'emr') {
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
            if ($scope.currentcontext.encounter)
                $scope.currentcontext.aid = $scope.currentcontext.encounter.AppointmentId;
            $scope.currentcontext.doctorid = $scope.currentcontext.encounter.DoctorId;
        }
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else
                $state.go('app.dischargesummarys');
        };
        $scope.addNew = function (item) {
            utl.Modal.open('patientemr.prescription', {
                params: {
                    id: 0, pid: $scope.currentcontext.patientid, eid: $scope.currentcontext.encounterid,
                    context: $scope.currentcontext.context, doctid: item.DoctorId, deptid: item.DepartmentId
                },
                confirmCallback: $scope.refresh
            });
        };
        $scope.refresh = function () {
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
                Params: [
                    { Key: 2, Value: $scope.currentcontext.patientid },
                    { Key: 12, Value: $scope.currentcontext.encounterid },
                    { Key: 16, Value: true },
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: getPrescriptionListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.prescribeprint = function () {
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
        $scope.save = function () {
            $scope.item.CertificateStatusId = 2; // Draft
            $scope.saveItem();
        };
        $scope.saveandActive = function () {
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

        $scope.approve = function () {
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

        $scope.reverse = function () {
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

        $scope.releasedtopatient = function () {
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
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: loadData
            });
        };

        //Doctor config related code starts
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
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }
        //Doctor config related code ends
        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {

                $scope.canShowSaveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowBackBtn = true;
                $scope.canhistoryBtn = false;
                $scope.canShowSaveactiveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;
                $scope.canprintBtn = false;

            } else {
                $scope.canShowSaveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;

                if ($scope.item.CertificateStatusId == 1) {
                    $scope.canShowSaveBtn = true;
                    $scope.canShowPrescribeBtn = true;
                    $scope.canShowPrescribeOrderBtn = true;
                    $scope.canShowClearBtn = true;
                    $scope.canShowCancelBtn = false;
                    $scope.canShowSaveactiveBtn = false;
                    $scope.canShowSaveandApproveBtn = true;
                    $scope.canShowViewReceipt = false;
                    $scope.canprintBtn = true;
                    // $scope.canShowrelesedBtn = false;

                }
                // Bill Completed
                if ($scope.item.CertificateStatusId == 2) {
                    $scope.canhistoryBtn = true;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveactiveBtn = true;
                    $scope.canShowSaveandApproveBtn = true;
                    $scope.canShowCancelBtn = false;
                    $scope.canbedoccupancyBtn = true;
                    $scope.canfitfordischargeBtn = true;
                    $scope.canclinicaldischargeBtn = true;
                    $scope.canphysicaldischargeBtn = false;
                    $scope.canShowSaveBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canShowrelesedBtn = false;

                    // $scope.canShowViewReceipt = true;
                }
                // Bill Cancelled
                if ($scope.item.CertificateStatusId == 3) {
                    $scope.canShowSaveBtn = false;
                    $scope.canhistoryBtn = true;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = true;
                    $scope.canShowCancelBtn = true;
                    $scope.canShowSaveactiveBtn = false;
                    $scope.canbedoccupancyBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canShowreverseBtn = true;
                    $scope.canShowrelesedBtn = true;
                }
                if ($scope.item.CertificateStatusId == 4) {
                    $scope.canShowSaveBtn = false;
                    $scope.canhistoryBtn = true;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveactiveBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canbedoccupancyBtn = true;
                    $scope.canShowCancelBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canphysicaldischargeBtn = false;
                }
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
                if ($scope.item.CertificateStatusId == 6) {
                    $scope.canShowSaveBtn = false;
                    $scope.canhistoryBtn = true;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canShowCancelBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canShowViewReceipt = true;
                }
            }
        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

        //save item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.currentcontext.id = parseInt(data);
            }
            $scope.getItem();
        };

        $scope.saveItem = function () {


            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'PatientCertificate/PatientCertificate/AddPatientCertificate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'PatientCertificate/PatientCertificate/UpdatePatientCertificate';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };


        //GetNoteTemplateById
        $scope.getNoteTemplateByIdCallback = function (scope, data, options, hasError) {
            $scope.item.DataTemplate = data.DataTemplate;
        };
        $scope.onNoteTemplateChange = function () {
            var options = {
                action: 'clinicalmaster/NoteTemplate/GetNoteTemplateById',
                data: { Id: $scope.item.NoteTemplateId },
                type: 'post',
                onComplete: $scope.getNoteTemplateByIdCallback
            };
            utl.Http.doAction(options);
        };

        //Print
        $scope.print = function () {
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
        $scope.print2 = function () {
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

        $scope.getPatientCertificatebyEnIdCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item = data.Data[0];
                $scope.currentcontext.id = data.Data[0].Id;
                $scope.applyVisibilityRules();
                getprescription();
            }
        }

        $scope.getPatientCertificatebyEncounterId = function (encounterid) {
            var inputData = {
                Params: [
                    { Key: 6, Value: encounterid },
                ]
            };
            var options = {
                action: 'DischargeSummary/patientcertificate/GetPatientCertificates',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientCertificatebyEnIdCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getencountersCallback = function (scope, data, options, hasError) {
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
                if (encounter.AdmissionStatusId == 5) {
                    $scope.item.DisplayAdmissionStatus = 'Physical Discharge';
                }
                if (encounter.Id > 0 && !($scope.currentcontext.id)) {
                    $scope.getPatientCertificatebyEncounterId(encounter.Id);
                }
            }
        };

        $scope.getEncounterById = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.encounterid },
                ]
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
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.CertificateStatusId == 3)
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
            if (data.AdmissionStatusId == 5) {
                $scope.item.DisplayAdmissionStatus = 'Physical Discharge';
            }
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'DischargeSummary/PatientCertificate/GetPatientCertificateById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.doctorChange = function () {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
            // setAssignToDetails();
            $scope.getList();
        }

        function loadData() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.getPatientCertificatebyEncounterId($scope.currentcontext.encounterid);
            } else {
                $scope.getEncounterById();
            }
        }
        $scope.generalalerts = function () {
            utl.Modal.open('app.alertview', {
                params: {},
                cancelCallback: $scope.updateCount
            });
        }

        $scope.patientalerts = function () {
            utl.Modal.open('app.alertview', {
                params: { pid: $scope.item.PatientId },
                cancelCallback: $scope.updateCount
            });
        }
        $scope.updateCount = function () {
            $scope.getGeneralAlertsCount();
            $scope.getPatientAlertsCount();
        }
        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.patientAlertsCount = res.Data.length;
        };

        $scope.getPatientAlertsCount = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId },
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() }
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
        $scope.getGeneralAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.generalAlertsCount = res.Data.length;
        };

        $scope.getGeneralAlertsCount = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() },
                    { Key: 7, Value: true }
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
        $scope.addNewTracker = function () {
            $scope.addNewLineItem();
        };
        $scope.addNewLineItem = function () {
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
        $scope.getTrackerCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                for (var idx in res.Data)
                    var data = res.Data[idx];
                $scope.item = data;
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
        $scope.getTracker = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.patientid },
                    { Key: 4, Value: $scope.currentcontext.encounterid },
                    { Key: 6, Value: true },
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
        $scope.addtrackerCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getTracker();
        };
        $scope.addtracker = function () {

            $scope.onDurationPeriodChange = function (track) {
                $scope.track.DurationPeriod = track.Text;
            }
            $scope.track.DurationPeriodId = 1;
            $scope.track.DurationPeriod = 'Days';
            $scope.track.IsDischargeMedication = true;


            var lines = getLinesForSave();
            var options = {
                action: 'appointment/patienttracker/CheckoutPatient',
                data: { Data: $scope.track },
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
                }
                if ($scope.track.Duration && $scope.track.DurationPeriod) {
                    $scope.track.FollowupAppointmentOn = utl.Formatter.computeDateBasedOnPeriod($scope.track.Duration, $scope.track.DurationPeriod);
                    console.log($scope.track.FollowupAppointmentOn);
                }
            }
            return $scope.track;
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        }

        //plugins - START
        $scope.callPluginScreen = function (item) {
            if (item.DischargeSummaryPluginsId > 0) {
                switch (item.DischargeSummaryPluginsId) {
                    case 1:
                        utl.Modal.open('patientemr.dischargepatientdiagnosisform', {
                            params: { id: 0, pid: $scope.currentcontext.patientid, itemid: null },
                            confirmCallback: $scope.getDischargePluginNoteUpdate
                        });
                        break;
                    case 2:
                        utl.Modal.open('patientemr.dischargePrescriptionList', {
                            params: { id: 0, pid: $scope.currentcontext.patientid, itemid: null },
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

        $scope.getDischargePluginNoteUpdate = function (saveddata) {
            if (saveddata.data) {
                var templatedesign = '';
                templatedesign += saveddata.data;
                $scope.addondata = templatedesign;
            }
        }
        //plugins - END

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DischargeType" },
                { "Key": "Doctor" },
                { "Key": "NoteType" },
                { "Key": "Department" },
                { "Key": "AdmissionStatus" },
                { "Key": "DurationPeriod" },
                { "Key": "DischargeSummaryPlugins" },
                { "Key": "NoteTemplate", Request: { Params: [{ Key: 1, Value: $scope.item.NoteTypeId }] } }
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

    dischargesummaryAmendController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();