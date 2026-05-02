(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('birthcertificateFormController', birthcertificateFormController);

    function birthcertificateFormController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }
        $scope.item = {
            NoteTypeId: 3,
            doa: utl.Formatter.getCurrentDate(),
            dateofbirth: utl.Formatter.getCurrentDate(),
            DischargeTypeId: 1,
            isCompleted: false,
            NoteTemplateId: -1
        };

        $scope.currentcontext = {};
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

        // $scope.backToList = function () {
        //     if ($scope.currentcontext.ismodal) {
        //         $scope.confirmCallback();
        //     } else
        //         $state.go('app.dischargesummarys');

        // };
        $scope.backToList = function () {
            $state.go('app.birthcertificates');
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
              messageKey: 'medicalcertificate.dischargesummary-form.save.lbl',
 
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
           messageKey: 'medicalcertificate.dischargesummary-form.approved.lbl',
 
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
                               messageKey: 'medicalcertificate.dischargesummary-form.reverseit.lbl',
 
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
              messageKey: 'medicalcertificate.dischargesummary-form.release.lbl',
     
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };

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
                    $scope.canShowSaveBtn = false;
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
                    $scope.canShowSaveBtn = false;
                    $scope.canprintBtn = false;
                    $scope.canShowrelesedBtn = false;

                    // $scope.canShowViewReceipt = true;
                }
                // Bill Cancelled 
                if ($scope.item.CertificateStatusId == 3) {
                    $scope.canShowSaveBtn = false;
                    $scope.canhistoryBtn = true;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canShowCancelBtn = true;
                    $scope.canShowSaveactiveBtn = false;
                    $scope.canbedoccupancyBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canShowreverseBtn = true;
                    $scope.canShowrelesedBtn = true;
                }
                if ($scope.item.CertificateStatusId == 4) {
                    $scope.canShowSaveBtn = true;
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

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                $scope.item.EncounterId = encounter.Id
                $scope.currentcontext.patientid = encounter.PatientId;
                $scope.item.PatientId = encounter.PatientId
                $scope.item.WardId = encounter.WardId
                $scope.item.AdmissionStatusId = encounter.AdmissionStatusId
                $scope.item.VisitIdentifier = encounter.VisitIdentifier
                $scope.item.DoctorId = encounter.DoctorId
                $scope.item.DepartmentId = encounter.DepartmentId
                $scope.item.RoomId = encounter.RoomId
                $scope.item.BedId = encounter.BedId
                $scope.item.AdmissionDate = encounter.AdmissionDate;
                $scope.item.DischargeDate = encounter.DischargeDate;
                $scope.item.Patient = encounter.Patient;
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
                $scope.item.isCompleted = true;
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
                $scope.getItem();
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
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "DischargeType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "NoteType" },
                { "Key": "Department" },
                { "Key": "AdmissionStatus" },
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

    birthcertificateFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();