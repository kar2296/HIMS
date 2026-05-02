(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryConfirmationEntryFormController', SurgeryConfirmationEntryFormController);

    function SurgeryConfirmationEntryFormController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));

        $scope.item = {
            // EncounterId: $stateParams.eid,
            isCompleted: false,
            isApproved: false,
            SurgeryStartedate: utl.Formatter.getCurrentDate(),
            DisplayCertificateStatus: null,
            NoteTypeId: 1,
            AnaesthesiaTypeId: 1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.items = {};
        $scope.lookup = {};
        $scope.Procedures = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            CurrentDate: utl.Formatter.getCurrentDate(),
        };

        $scope.currentcontext.sid = parseInt(modalConfig.params.sid);
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

        if (modalConfig && modalConfig.params) {
            $scope.item.EncounterId = modalConfig.params.encounterid;
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            if (modalConfig.params.eid)
                $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            if (modalConfig.params.pid) {
                $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
                $scope.item.PatientId = $scope.currentcontext.pid;
            } else {
                $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());
            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.CheckendDate = function (item) {
            var surdate = new Date(item.SurgeryStartedate);
            var startdate = surdate.getDate();
            var starthrs = surdate.getHours();
            var surenddtae = new Date(item.SurgeryEndDate);
            var enddate = surenddtae.getDate();
            var endhrs = surenddtae.getHours();
            if (startdate > enddate) {
                utl.Alert.showErrorMsg($translate.instant('Surgery End Date Should not be a Past Date'));
            }
            if (endhrs > 0) {
                if (startdate <= enddate) {
                    if (starthrs >= endhrs) {
                        utl.Alert.showErrorMsg($translate.instant('Surgery End Date Should not be a Past Date'));
                    }
                }
            }
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.items = data;
            if(data.OtScheduleDetails.length > 0)
            {
                for (var i = 0, len = data.OtScheduleDetails.length; i < len; i++) {
                    var procedure = data.OtScheduleDetails[i];
                    procedure.htmlid = 'procedure' + (i+1);
                    procedure.OTScheduleDetailId = procedure.Id;
                    procedure.Id = 0;
                    $scope.Procedures.push(procedure);
                    // $scope.PatientBillDetails[i].RdoDiscountMode = flag;
                    // $scope.PatientBillDetails[i].RdoDiscountTypeId = flag;
                }
            }
            $scope.item.AnaesthesiaTypeId = $scope.items.AnaesthesiaTypeId;
            // $scope.item.SurgeryTypeId = $scope.item.ScheduleTypeId;
            // $scope.item.ScheduleTypeId = $scope.item.ScheduleTypeId;
            $scope.item.SurgeryRoomId = $scope.items.OTRoomId;
            $scope.item.ChiefSurgeonId = $scope.items.DoctorId;
            $scope.item.DoctorId = $scope.items.DoctorId;
            // $scope.item.StartTime = $scope.items.StartTime;
            // $scope.item.EndTime = $scope.items.EndTime;
            $scope.item.OTScheduleStatusId = $scope.items.OTScheduleStatusId;
            $scope.item.OTScheduledOn = $scope.items.OTScheduledOn;
            $scope.item.ScheduleDate = $scope.items.ScheduleDate;
            $scope.item.ScheduleBy = $scope.items.ScheduleBy;
            $scope.item.PreoperativeDignosisId = $scope.items.DiagnosisId;
            $scope.item.ProcedureId = $scope.items.ProcedureId;
            $scope.item.SurgeryTypeId = $scope.items.SurgeryTypeId;
            $scope.item.AnaesthesistId = $scope.items.AnaesthesistId;
            $scope.item.OtherDiagnosis = $scope.items.OtherDiagnosisName;
            $scope.item.OtherSurgeon = $scope.items.OtherSurgeon;
            if (data.OTScheduleStatusId == 1) {
                $scope.item.isRequested = true;
                $scope.item.istime = true;

            }
            if (data.OTScheduleStatusId == 2) {
                $scope.item.isRequested = true;

            }
            if (data.OTScheduleStatusId == 3) {
                $scope.item.isRequested = true;
                $scope.item.istime = true;

            }
            // $scope.patientChange();
            // // $scope.onDoctorSelected();
            // $scope.applyVisibilityRules();


        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.sid && $scope.currentcontext.sid > 0) {

                var options = {
                    action: 'OtManagement/OtSchedule/GetOtScheduleById',
                    data: {
                        Id: $scope.currentcontext.sid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            // $scope.applyVisibilityRules();
        };
        // $scope.getItemCallback = function(scope, data, options, hasError) {
        //     $scope.item = data;
        //     if (data.SurgeryEntryStatusId == 2)
        //         $scope.item.isApproved = true;
        //     $scope.buttonVisiblity();
        // };

        // $scope.getItem = function(pageNo) {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         var options = {
        //             action: 'OtManagement/SurgeryEntry/GetSurgeryEntryById',
        //             data: {
        //                 Id: $scope.currentcontext.id
        //             },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     } else {
        //         $scope.buttonVisiblity();
        //     }
        // };

        $scope.buttonVisiblity = function () {
            if ($scope.currentcontext.id == 0) {
                $scope.CanShowSave = true;
                $scope.CanShowApprove = true;
                $scope.CanShowClear = true;
                $scope.CanShowCancel = false;
                $scope.CanShowAuthorize = false;
                $scope.CanShowPrint = false;
                $scope.CanShowPharmacyPrint = false;
            } else if ($scope.currentcontext.id > 0) {
                if ($scope.item.SurgeryEntryStatusId == 1) {
                    $scope.CanShowSave = true;
                    $scope.CanShowApprove = true;
                    $scope.CanShowClear = true;
                    $scope.CanShowCancel = true;
                    $scope.CanShowAuthorize = false;
                    $scope.CanShowPrint = false;
                    $scope.CanShowPharmacyPrint = false;
                }
                if ($scope.item.SurgeryEntryStatusId == 2) {
                    $scope.CanShowSave = false;
                    $scope.CanShowApprove = true;
                    $scope.CanShowCancel = true;
                    $scope.CanShowPrint = true;
                    $scope.CanShowPharmacyPrint = true;
                    $scope.CanShowClear = false;
                    $scope.CanShowAuthorize = true;
                }
                if ($scope.item.SurgeryEntryStatusId == 3) {
                    $scope.CanShowSave = false;
                    $scope.CanShowApprove = false;
                    $scope.CanShowClear = false;
                    $scope.CanShowCancel = true;
                    $scope.CanShowAuthorize = false;
                    $scope.CanShowPrint = true;
                    $scope.CanShowPharmacyPrint = true;
                }
                if ($scope.item.SurgeryEntryStatusId == 4) {
                    $scope.CanShowSave = false;
                    $scope.CanShowApprove = false;
                    $scope.CanShowCancel = false;
                    $scope.CanShowPrint = true;
                    $scope.CanShowPharmacyPrint = true;
                    $scope.CanShowClear = false;
                    $scope.CanShowAuthorize = false;
                }

            }
        };

        $scope.backToList = function () {
            $state.go('app.surgeryentries', { confirmCallback: $scope.getList });
        };

        $scope.addNew = function () {
            $state.go('app.surgeryentry-form', {
                id: 0
            });
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.Procedure = function () {
            utl.Modal.open('app.proceduretab.details', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.Diagnosis = function () {
            utl.Modal.open('app.diagnosisform', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
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
            if (selectedItem) {
                if (selectedItem.IsBillLock) {
                    var msg = 'otregister-form.billlockalert.lbl';

                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                } else if (selectedItem.IsBillFinalized) {
                    var msg = 'otregister-form.billfinalizealert.lbl';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                var strTitle = selectedItem.Patient && selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';

                if (strTitle)
                    result += strTitle;
                if (selectedItem && selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem && selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;

                if (!$scope.currentcontext.ismodal) {
                    $scope.patientChanged();
                }
            }

            return result;
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 31,
                    Value: '2,3,4,5'
                }
                ],
                PageContext: {
                    PageSize: 200,
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
                    Key: 11,
                    Value: query
                });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';

                item.PatientName = '';
                if (item.Patient.FirstName)
                    item.PatientName += item.Patient.FirstName;
                if (item.Patient.LastName)
                    item.PatientName += item.Patient.LastName;

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
        // $scope.getPatientCallback = function (scope, res, options, hasError) {
        //     if (res.Data && res.Data.length > 0) {
        //         // $scope.Patientdata = res.Data[0];
        //         $scope.item = res.Data[0];
        //     }
        // };

        // $scope.patientChange = function () {
        //     var inputData = {
        //         Params: [{
        //             Key: 0,
        //             Value: $scope.currentcontext.pid
        //         },],
        //         PageContext: {
        //             PageSize: 50,
        //             PageNumber: 1
        //         }
        //     };
        //     var options = {
        //         action: 'registration/patient/GetPatients',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getPatientCallback
        //     };
        //     utl.Http.doAction(options);
        // };
        $scope.patientChange = function () {
            $scope.Encounter = $scope.item.SelectedItem;
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.EncounterId = $scope.Encounter.Id;
            $scope.item.DoctorId = $scope.Encounter.DoctorId;
            $scope.item.AdmissionDoctorId = $scope.Encounter.DoctorId;
            $scope.item.WardId = $scope.Encounter.WardId;
            $scope.item.RoomId = $scope.Encounter.RoomId;
            $scope.item.BedId = $scope.Encounter.BedId;
            $scope.item.DoctorName = $scope.Encounter.DoctorName;
            $scope.item.ServiceRateCategoryId = $scope.Encounter.ServiceRateCategoryId;
            $scope.item.AdmissionDate = $scope.Encounter.AdmissionDate;
            $scope.item.IsBillLocked = $scope.Encounter.IsBillLock;
            $scope.item.IsBillFinalized = $scope.Encounter.IsBillFinalized;

            if ($scope.currentcontext.id == 0) {
                $scope.item.isCompleted = false;
            }
        };

        //autosearch related code starts for Doctors
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
            iteminfo: {},
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
            // $scope.getDoctorTeam();
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;

            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                },
                {
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 2,
                    Value: [-1, $scope.item.FacilityId]
                }
                ],
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
                // item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }
        //autosearch related code ends for Doctors

        // vm.doctorcontrolconfig = {
        //     query: '',
        //     searchbyid: false,
        //     options: [{
        //         header: 'Doctor Id',
        //         field: 'DoctorId',
        //         datatype: 'string',
        //         headercls: 'td-code',
        //         fieldcls: 'td-code'
        //     },
        //     {
        //         header: 'Doctor Name',
        //         field: 'DoctorName',
        //         datatype: 'string',
        //         headercls: 'td-name',
        //         fieldcls: 'td-name'
        //     },
        //     {
        //         header: 'Qualification',
        //         field: 'Qualification',
        //         datatype: 'string',
        //         headercls: 'td-Qualification',
        //         fieldcls: 'td-Qualification'
        //     },
        //     {
        //         header: 'Speciality',
        //         field: 'Speciality',
        //         datatype: 'string',
        //         headercls: 'td-dept',
        //         fieldcls: 'td-dept'
        //     },
        //     ],
        //     searchparams: {},
        //     result: {},
        //     api: 'SystemSettings/User/GetUsers',
        //     formatdisplay: formatselecteddoctor,
        //     presearch: presearchdoctor,
        //     postsearch: postsearchdoctor
        // };

        // function setChiefSurgeon() {
        //     if ($scope.item.ChiefSurgeon)
        //         var surgeon = '';
        //     if ($scope.item.ChiefSurgeon.Title) surgeon = $scope.item.ChiefSurgeon.Title.Description
        //     if ($scope.item.ChiefSurgeon.FirstName) surgeon += ' ' + $scope.item.ChiefSurgeon.FirstName
        //     if ($scope.item.ChiefSurgeon.LastName) surgeon += ' ' + $scope.item.ChiefSurgeon.LastName
        //     $scope.$parent.SelectedItem.ChiefSurgeon = surgeon;
        // }

        // function setAnaesthetist() {
        //     if ($scope.item.Anaesthetist)
        //         var anaesthetist = '';
        //     if ($scope.item.Anaesthetist.Title) anaesthetist = $scope.item.Anaesthetist.Title.Description
        //     if ($scope.item.Anaesthetist.FirstName) anaesthetist += ' ' + $scope.item.Anaesthetist.FirstName
        //     if ($scope.item.Anaesthetist.LastName) anaesthetist += ' ' + $scope.item.Anaesthetist.LastName
        //     $scope.$parent.SelectedItem.Anaesthetist = anaesthetist;
        // }

        // function formatselecteddoctor() {
        //     var selectedItem = vm.doctorcontrolconfig.selected;
        //     var result = '';
        //     if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //         result = [selectedItem.DoctorName].join('  ');
        //     } else if (vm.doctorcontrolconfig.rowdata) {
        //         result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
        //         vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
        //         ].join(' ');
        //     }
        //     if (vm.doctorcontrolconfig.searchbyid == true)
        //         if (vm.doctorcontrolconfig.field == 'chiefsurgeon') {
        //             if (!$scope.currentcontext.ismodal) {
        //                 setChiefSurgeon();
        //             }
        //         }
        //     if (vm.doctorcontrolconfig.field == 'anesthesist') {
        //         setAnaesthetist();
        //     }
        //     return result;
        // }

        // function presearchdoctor() {
        //     var query = vm.doctorcontrolconfig.query;
        //     var inputData = {
        //         Params: [{
        //             Key: 3,
        //             Value: 2
        //         }, {
        //             Key: 2,
        //             Value: [-1, $scope.item.FacilityId]
        //         }],
        //         PageContext: {
        //             PageSize: 25,
        //             PageNumber: 1
        //         }
        //     };
        //     if (vm.doctorcontrolconfig.field == 'surgeon' || vm.doctorcontrolconfig.field == 'chiefsurgeon')
        //         inputData.Params.push({
        //             Key: 12,
        //             Value: true
        //         });
        //     if (vm.doctorcontrolconfig.field == 'anesthesist')
        //         inputData.Params.push({
        //             Key: 11,
        //             Value: true
        //         });
        //     if (vm.doctorcontrolconfig.searchbyid == true) {
        //         inputData.Params.push({
        //             Key: 0,
        //             Value: query
        //         });
        //     } else if (query && query.length > 2) {
        //         inputData.Params.push({
        //             Key: 1,
        //             Value: query
        //         });
        //     }

        //     vm.doctorcontrolconfig.searchparams = inputData;
        // }

        // function postsearchdoctor() {
        //     for (var idx in vm.doctorcontrolconfig.result) {
        //         var item = vm.doctorcontrolconfig.result[idx];
        //         // item.DoctorId = item.Id;
        //         item.DoctorName = item.Title.Description + ' ' + item.FirstName;
        //         item.Qualification = item.Qualification;
        //         item.Speciality = item.Department.DepartmentName;
        //     }
        // }

        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'DiagnosisName',
                field: 'DiagnosisName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
                // {
                //     header: 'Version',
                //     field: 'Version',
                //     datatype: 'string',
                //     headercls: 'td-Version',
                //     fieldcls: 'td-Version'
                // },
                // {
                //     header: 'Speciality',
                //     field: 'Speciality',
                //     datatype: 'string',
                //     headercls: 'td-Speciality',
                //     fieldcls: 'td-Speciality'
                // },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {
            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
            }
        }

        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Procedure Name',
                field: 'ProcedureName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
                // {
                //     header: 'Category',
                //     field: 'Category',
                //     datatype: 'string',
                //     headercls: 'td-category',
                //     fieldcls: 'td-category'
                // },
                // {
                //     header: 'Technique',
                //     field: 'Technique',
                //     datatype: 'string',
                //     headercls: 'td-technique',
                //     fieldcls: 'td-technique'
                // },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            // $scope.item.ProcedureName = result;
            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [{ Key: 9, Value: utl.Session.getCurrentFacilityId() }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
                // if (item.ProcedureCategory)
                //     item.Category = item.ProcedureCategory.Description;
                // if (item.ProcedureTechnique)
                //     item.Technique = item.ProcedureTechnique.Description;
            }
        }

        // $scope.OnProcedureSelected = function (idx, item) {
        //     var ProcedureObj = item.SelectedItem;
        //     $scope.item.IsOtherProcedures = ProcedureObj.IsFreeText;
        //     if (ProcedureObj.IsFreeText == false)
        //         $scope.item.ProcedureName = ProcedureObj.ProcedureName;
        // }

        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.SurgeryEntryStatusId = 1;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'otregister-form.save.lbl',

                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };

            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (!$scope.item.PatientId) {
                utl.Alert.showErrorMsg('Please Select Patient...');
                $('#pid').focus();
                return;
            }
            $scope.item.EncounterId = $scope.currentcontext.eid;
            if (!$scope.item.EncounterId || $scope.item.EncounterId <= 0) {
                utl.Alert.showErrorMsg('Visit Information is not set, Again enter the patient information ');
                $('#pid').focus();
                return;
            }
            if (!$scope.item.ChiefSurgeonId || $scope.item.ChiefSurgeonId == -1) {
                utl.Alert.showErrorMsg('Select Any Surgeon');
                return;
            }
            // if (!$scope.item.ProcedureId || $scope.item.ProcedureId == -1) {
            //     utl.Alert.showErrorMsg('Select Any Procedures');
            //     return;
            // }

            if (!$scope.Procedures) {
                utl.Alert.showErrorMsg('Select Any Procedures');
                return;
            }
            // if (!$scope.item.AnaesthesistId || $scope.item.AnaesthesistId == -1) {
            //     utl.Alert.showErrorMsg('Select Any Procedures');
            //     return;
            // }
            // if (!$scope.item.AssistantSurgeonId || $scope.item.AssistantSurgeonId == -1) {
            //     utl.Alert.showErrorMsg('Select Any AssistantSurgeon');
            //     return;
            // }
            $scope.item.SurgeryScheduleId = $scope.currentcontext.sid;
            $scope.item.SurgeryEntryStatusId = 2;
            $scope.item.SurgeryRegisteredOn = utl.Formatter.getCurrentDate();

            var confirmOptions = {
                itemId: 2,
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'otregister-form.approve.lbl',

                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };

            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.Completed = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.SurgeryEntryStatusId = 3;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'otregister-form.complete.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };

            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OTCancel = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.SurgeryEntryStatusId = 4;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'otregister-form.cancelentry.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.getSurgeryentryCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data;
            if(res.Data.SurgeryEntryDetails) {

            }
        };

        $scope.getSurgeryentry = function () {
            var inputData = {
                Params: [{
                    Key: 21,
                    Value: $scope.currentfilter.sid
                }]
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSurgeryentryCallback
            };

            utl.Http.doAction(options);
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            if (!$scope.item.PatientId) {
                utl.Alert.showErrorMsg('Please Select Patient...');
                $('#pid').focus();
                return;
            }
            $scope.item.EncounterId = $scope.currentcontext.eid;
            if (!$scope.item.EncounterId || $scope.item.EncounterId <= 0) {
                utl.Alert.showErrorMsg('Visit Information is not set, Again enter the patient information ');
                $('#pid').focus();
                return;
            }

            if ($scope.item.PaymentTypeId <= 0) {
                utl.Alert.showSuccessMsg($translate.instant('admission.selectthepaymentmode.lbl'));

                return;
            }

            if ($scope.item.IsBillLocked) {
                utl.Alert.showErrorMsg($translate.instant('otregister-form.billlocked.lbl'));
                return;
            }

            if ($scope.item.IsBillFinalized) {
                utl.Alert.showErrorMsg($translate.instant('otregister-form.billfinalized.lbl'));

                return;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.ChiefSurgeon) {
                var surgeon = '';
                if ($scope.item.ChiefSurgeon.Title) surgeon = $scope.item.ChiefSurgeon.Title.Description
                if ($scope.item.ChiefSurgeon.FirstName) surgeon += ' ' + $scope.item.ChiefSurgeon.FirstName
                if ($scope.item.ChiefSurgeon.LastName) surgeon += ' ' + $scope.item.ChiefSurgeon.LastName
                $scope.item.ChiefSurgeon = surgeon;
            }
            $scope.item.Procedures = $scope.Procedures;
            var actionName = 'OtManagement/SurgeryEntry/AddSurgeryEntry';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'OtManagement/SurgeryEntry/UpdateSurgeryEntry';
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
        //autosearch related code starts for Anaesthisist
        vm.usercontrolconfig = {
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
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 11,
                    Value: 1
                }, {
                    Key: 2,
                    Value: [-1, $scope.item.FacilityId]
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Anaesthisist

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/PrintSurgeryEntry',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.print2 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: false
                }
            };
            var options = {
                action: 'billing/patientbills/PrintOTBillingPharmacyBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.item.SurgeryEntryStatusId) {
                $scope.getSurgeryentry();
            } else {
                $scope.getItem();
            }
            // $scope.patientChange();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "SurgeryType"
            },
            {
                "Key": "ProcedureCategory"
            },
            // {
            //     "Key": "SurgeryRoom"
            // },
            {
                "Key": "SurgeryRoom",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }],

                }
            },
            {
                "Key": "AnaesthesiaType"
            },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    SurgeryConfirmationEntryFormController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();