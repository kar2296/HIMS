(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryconfirmFormController', SurgeryconfirmFormController);

    function SurgeryconfirmFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.isotlensinfo = false;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }
        // $scope.currentcontext = {};
        $scope.currentfilter = {};
        // $scope.currentcontext.SearchAllPatient = 0;
        $scope.item = {
            OTScheduledOn: utl.Formatter.getCurrentDate(),
            // OTScheduleStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AnaesthesiaTypeId: 1,
            PriorityId: 3,
            OP: 0
        };
        $scope.updateFlag = 0;
        $scope.updateIndex = 0;
        $scope.Procedures = [];
        function setDefaults() {
            if (utl.Session.getUserTypeId() == 2) // 2=> Physician
            {
                $scope.item.DoctorId = utl.Session.getCurrentUserId();
            }
        }
        $scope.DrTeam = [];
        $scope.lookup = {};
        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt($stateParams.pid);

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                Status: 1,
                ProcedureId: 2,
                ProcedureName: '',
                ChiefSurgeonId: '',
                ChiefSurgeonName: '',
                FacilityId: utl.Session.getCurrentFacilityId(),
                SecondSurgeonId: '',
                SecondSurgeonName: '',
                AssistantSurgeonId: '',
                AssistantSurgeonName: '',
            };
            $scope.Procedures.push(lineItem);

        };

        $scope.addProcedure = function () {

            if(($scope.item.ProcedureId == null) || ($scope.item.ChiefSurgeonId == null) ) {
                utl.Alert.showErrorMsg('Please Enter Procedure Name and Chief surgeon Name');
                return;
            }
            var lineItem = {
                Id: 0,
                Status: 1,
                PatientId: $scope.item.PatientId,
                EncounterId: $scope.item.EncounterId,
                ProcedureId: $scope.item.ProcedureId,
                ProcedureName: $scope.item.ProcedureName,
                ChiefSurgeonId: $scope.item.ChiefSurgeonId,
                ChiefSurgeonName: $scope.item.ChiefSurgeonName,
                FacilityId: utl.Session.getCurrentFacilityId(),
                SecondSurgeonId: $scope.item.SecondSurgeonId,
                SecondSurgeonName: $scope.item.SecondSurgeonName,
                AssistantSurgeonId: $scope.item.AssistantSurgeonId,
                AssistantSurgeonName: $scope.item.AssistantSurgeonName,
                DepartmentId: $scope.item.DepartmentId,
                DepartmentName: $scope.item.DepartmentName
            };
            $scope.Procedures.push(lineItem);
            $scope.item.ProcedureId = null;
            $scope.item.ProcedureName = "";
            $scope.item.ChiefSurgeonId = null;
            $scope.item.ChiefSurgeonName = "";
            $scope.item.SecondSurgeonId = null;
            $scope.item.SecondSurgeonName = "";
            $scope.item.AssistantSurgeonId = null;
            $scope.item.AssistantSurgeonName = "";
            $scope.ClearData();

        };

        $scope.updateProcedure = function (index) {

            if(($scope.item.ProcedureId == null) || ($scope.item.ChiefSurgeonId == null) ) {
                utl.Alert.showErrorMsg('Please Enter Procedure Name and Chief surgeon Name');
                return;
            }

            $scope.Procedures[index].ProcedureId = $scope.item.ProcedureId;

            $scope.Procedures[index].ProcedureName = $scope.item.ProcedureName,
            $scope.Procedures[index].ChiefSurgeonId = $scope.item.ChiefSurgeonId,
            $scope.Procedures[index].ChiefSurgeonName = $scope.item.ChiefSurgeonName,
            $scope.Procedures[index].FacilityId = utl.Session.getCurrentFacilityId(),
            $scope.Procedures[index].SecondSurgeonId = $scope.item.SecondSurgeonId,
            $scope.Procedures[index].SecondSurgeonName = $scope.item.SecondSurgeonName,
            $scope.Procedures[index].AssistantSurgeonId = $scope.item.AssistantSurgeonId,
            $scope.Procedures[index].AssistantSurgeonName = $scope.item.AssistantSurgeonName,
            $scope.Procedures[index].DepartmentId = $scope.item.DepartmentId,
            $scope.Procedures[index].DepartmentName = $scope.item.DepartmentName

            $scope.item.ProcedureId = null;
            $scope.item.ProcedureName = "";
            $scope.item.ChiefSurgeonId = null;
            $scope.item.ChiefSurgeonName = "";
            $scope.item.SecondSurgeonId = null;
            $scope.item.SecondSurgeonName = "";
            $scope.item.AssistantSurgeonId = null;
            $scope.item.AssistantSurgeonName = "";
            $scope.updateFlag = 0;
            $scope.updateIndex = 1;
            $scope.ClearData();

        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if(data.OtScheduleDetails.length > 0) {
                $scope.Procedures = data.OtScheduleDetails;
            }
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
            $scope.patientChange();
            $scope.onDoctorSelected();
            $scope.applyVisibilityRules();
        };

        $scope.addnewpatient = function () {
            utl.Modal.openFixedDialog('app.newpatientregister', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.ReturnData
            });
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'OtManagement/OtSchedule/GetOtScheduleById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            $scope.applyVisibilityRules();
        };

        $scope.applyVisibilityRules = function () {
            // New
            if (!$scope.item.OTScheduleStatusId) {
                $scope.canShowSaveBtn = true;
                $scope.canShowConfirmBtn = false;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.OTScheduleStatusId == 1) {
                $scope.canShowSaveBtn = false;
                $scope.canShowConfirmBtn = false;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.OTScheduleStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowConfirmBtn = true;
                $scope.canShowCancelBtn = true;
            }
            if ($scope.item.OTScheduleStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowConfirmBtn = false;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.OTScheduleStatusId == 4) {
                $scope.canShowSaveBtn = false;
                $scope.canShowConfirmBtn = false;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.OTScheduleStatusId == 5) {
                $scope.canShowSaveBtn = false;
                $scope.canShowConfirmBtn = false;
                $scope.canShowCancelBtn = false;
            }
        }

        $scope.editItem = function (index, servItem) {
            // document.getElementById("procedureid").value = servItem.ProcedureId;
            // document.getElementById("surgeon1id").value = servItem.ChiefSurgeonId;
            // document.getElementById("surgeon2id").value = servItem.SecondSurgeonId;
            // document.getElementById("assitant1id").value = servItem.AssistantSurgeonId;
            $scope.item.ProcedureId = servItem.ProcedureId;
            $scope.item.ChiefSurgeonId = servItem.ChiefSurgeonId;
            $scope.item.SecondSurgeonId = servItem.SecondSurgeonId;
            $scope.item.AssistantSurgeonId = servItem.AssistantSurgeonId;
            $scope.item.ProcedureName = servItem.ProcedureName;
            $scope.item.ChiefSurgeonName = servItem.ChiefSurgeonName;
            $scope.item.SecondSurgeonName = servItem.SecondSurgeonName;
            $scope.item.AssistantSurgeonName = servItem.AssistantSurgeonName;
            $scope.item.DepartmentId = servItem.DepartmentId;
            $scope.item.DepartmentName = servItem.DepartmentName;
            $scope.updateIndex = index;
            $scope.updateFlag = 1;
        }

        $scope.deleteItem = function (index, servItem) {
            servItem.Status = 2;
        }

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.GuarantorId = 0;
            $scope.getEncounters();

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
        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.Encounters = data.Data[0];
                $scope.item.EncounterId = $scope.Encounters.Id;
                if (!$scope.item.DoctorId) {
                    $scope.item.DoctorId = $scope.Encounters.DoctorId;
                } else {
                    $scope.item.DoctorId = $scope.item.DoctorId;
                }
                $scope.item.PatientId = $scope.Encounters.PatientId;
            }
            $scope.loadPatientGuarantors();
        };
        $scope.getEncounters = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.item.PatientId
                },
                { Key: 52, Value: true }
                    // { Key: 15, Value: 2 }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetMinEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
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


        $scope.patientChanged = function () {
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
            // $scope.$parent.SelectedItem.DoctorName = $scope.Encounter.Doctor.Title.Description + ' ' + $scope.Encounter.Doctor.FirstName;
            $scope.item.AdmissionDate = $scope.Encounter.AdmissionDate;
            $scope.item.IsBillLocked = $scope.Encounter.IsBillLock;
            $scope.item.IsBillFinalized = $scope.Encounter.IsBillFinalized;

        //     if ($scope.currentcontext.id == 0) {
        //         $scope.item.isCompleted = false;
        //     }
        };

        // function presearchEncounter() {
        //     var query = vm.patientcontrolconfig.query;
        //     var inputData = {
        //         Params: [{
        //             Key: 15,
        //             Value: 2
        //         },
        //         {
        //             Key: 31,
        //             Value: [2, 3, 4]
        //         }
        //         ],
        //         PageContext: {
        //             PageSize: 200,
        //             PageNumber: 1
        //         }
        //     };

        //     if (vm.patientcontrolconfig.searchbyid == true) {
        //         inputData.Params.push({
        //             Key: 0,
        //             Value: query
        //         });
        //     } else if (query && query.length > 2) {
        //         inputData.Params.push({
        //             Key: 11,
        //             Value: query
        //         });
        //     }

        //     vm.patientcontrolconfig.searchparams = inputData;
        // }

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

        function onGuarantorSelected(dataFromModal) {
            $scope.item.GuarantorId = dataFromModal.gid;
            $scope.loadPatientGuarantors();
        }
        $scope.addGuarantor = function () {
            utl.Modal.open('app.patientguarantorlist', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    parent: 'txn',
                    isFinalized: $scope.isFinalized
                },
                confirmCallback: onGuarantorSelected,
                cancelCallback: $scope.loadPatientGuarantors
            });
        }
        $scope.surgeonChange = function (val) {
            //Set selected doctor department id to appointment department
            let doctorObj = {};
            if (val == 'Chief') {
                doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.ChiefSurgeonId);
                if (doctorObj) {
                    $scope.item.ChiefSurgeonName = 'Dr. ';
                    $scope.item.ChiefSurgeonName += (doctorObj.Text);
                    $scope.item.DepartmentId = doctorObj.DepartmentId;
                    $scope.item.DepartmentName = doctorObj.Department.DepartmentName;

                }
            } else if (val == 'SecondSurgeon') {
                doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.SecondSurgeonId);
                if (doctorObj) {
                    $scope.item.SecondSurgeonName = 'Dr. ';
                    $scope.item.SecondSurgeonName += (doctorObj.Text);
                }

            } else if (val == 'Assistant') {
                doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.AssistantSurgeonId);
                if (doctorObj) {
                    $scope.item.AssistantSurgeonName = 'Dr. ';
                    $scope.item.AssistantSurgeonName += (doctorObj.Text);
                }
            }



            // for (var idx in $scope.lookup.Department) {
            //     if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
            //         if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
            //             $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
            //         }
            //     }
            // }
            // if ($scope.currentcontext.selecteddept.length > 0)
            //     $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;

        }
        $scope.doctorChange = function () {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            for (var idx in $scope.lookup.Department) {
                if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                    if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                    }
                }
            }
            if ($scope.currentcontext.selecteddept && $scope.currentcontext.selecteddept.length > 0)
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;

        }

        $scope.getdeptCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
            var dept = [];
            for (var idx in data) {
                dept.push(data[idx])
                for (var iddx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[iddx].Id == dept[idx].DepartmentId)
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[iddx]);
                }
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            }
            $scope.doctorChange();
        };
        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.getdepartment();
            console.log(data);
        }
        $scope.getdepartment = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.DoctorId
                }]
            };
            var options = {
                action: 'SystemSettings/User/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };
        $scope.onStatusSelected = function () {
            var statusObj = utl.Lookup.getObject($scope.lookup.OTScheduleStatus);
            for (var idx in $scope.lookup.OTScheduleStatus) {
                if ($scope.item.OTScheduleStatusId == 2)
                    if ($scope.lookup.OTScheduleStatus[idx].Id == $scope.item.OTScheduleStatusId) {
                        $scope.item.istime = false;
                    }
            }
        }

        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you Sure,You Want To Save?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.OTScheduleStatusId = 1,
                $scope.item.ScheduleBy = utl.Session.getCurrentUserId(),
                $scope.item.ScheduleDate = utl.Formatter.getCurrentDate(),
                $scope.saveItem();
        }
        // $scope.saveAndApprove = function () {

        //     $scope.saveItem();
        // }

        $scope.Scheduled = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you Sure,You Want To Schedule?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onScheduledConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onScheduledConfirmed = function () {
            $scope.item.OTScheduleStatusId = 2,
                $scope.item.ScheduleBy = utl.Session.getCurrentUserId(),
                $scope.item.ScheduleDate = utl.Formatter.getCurrentDate(),
                $scope.saveItem();
        }
        $scope.Cancelled = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you Sure,You Want To Cancel?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelledConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onCancelledConfirmed = function () {
            $scope.item.OTScheduleStatusId = 4,
                $scope.item.CancelledBy = utl.Session.getCurrentUserId(),
                $scope.item.CancelledDate = utl.Formatter.getCurrentDate(),
                $scope.saveItem();
        }
        $scope.Confirmed = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you Sure,You Want To Confirmed?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onConfirmedConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onConfirmedConfirmed = function () {
            $scope.item.OTScheduleStatusId = 3,
                $scope.item.ConfirmedBy = utl.Session.getCurrentUserId(),
                $scope.item.ConfirmedDate = utl.Formatter.getCurrentDate(),
                $scope.saveItem();
        }
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

        // $scope.backToList = function () {
        //     $scope.confirmCallback();
        // }
        $scope.backToList = function () {
            $state.go('app.surgeryconfirmation');
        };
        $scope.ClearData = function () {
            document.getElementById("procedureid").value = '';
            document.getElementById("surgeon1id").value = '';
            document.getElementById("surgeon2id").value = '';
            document.getElementById("assitant1id").value = '';
            // $scope.item.ServiceItemId = 0;
            // $scope.item.Quantity = 1;
            // $scope.item.ServicePrice = '';
            // $scope.item.OrderPriorityId = 1;
            // $scope.item.Comments = '';
            // $scope.CanShowOrder = true;
            // $scope.canShowPrint = false;
        };

        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            // $state.go('app.surgeryscheduleform', {
            //     id: 0
            // });
            if ($stateParams.id > 0)
                $state.go('app.surgeryscheduleform', {
                    id: 0
                });
            else
                $state.reload();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            $scope.getItem();
            // $scope.backToList();
        };
        $scope.saveItem = function () {
            if (!$scope.item.PatientId) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Patient Name'));
                return false;
            }
            if ($scope.Procedures.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Procedure'));
                return false;
            }
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'OtManagement/OtSchedule/AddOtSchedule';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'OtManagement/OtSchedule/UpdateOtSchedule';
            }

            $scope.item.Procedures = $scope.Procedures;
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
            $scope.getDoctorTeam();
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
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }
        //autosearch related code ends for Doctors

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
            $scope.item.SurgeryName = result;
            $scope.item.ProcedureName = result;
            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            //Search only nurse
            var inputData = {
                Params: [
                    {
                        Key: 9,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                ],
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
            }
        }
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
        $scope.OnProcedureSelected = function (idx, item) {
            var ProcedureObj = item.SelectedItem;
            // $scope.item.IsOtherProcedures = ProcedureObj.IsFreeText;
            // if (ProcedureObj.IsFreeText == false)
            $scope.item.ProcedureName = ProcedureObj.ProcedureName;
        }
        //autosearch related code ends for Anaesthisist
        $scope.departmentChangeCallback = function (scope, data, options, hasError) {
            if ($scope.canShowPhysicianArea()) {
                $scope.lookup.Doctor = data.Doctor;
            } else if ($scope.canShowResourceArea()) {
                $scope.lookup.Resource = data.Resource;
            }
        }
        $scope.departmentChange = function () {
            var inputData = [];

            if ($scope.canShowPhysicianArea()) {
                inputData.push({
                    Key: "Doctor",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: $scope.item.DepartmentId
                        }]
                    }
                });
            } else if ($scope.canShowResourceArea()) {
                inputData.push({
                    Key: "Resource",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: $scope.item.DepartmentId
                        }]
                    }
                });
            }

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.departmentChangeCallback
            };
            utl.Http.doAction(options);
        }

        //autosearch related code starts

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
            api: 'Visit/Visit/GetMinEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            if (selectedItem) {
                if (selectedItem.IsBillFinalized) {
                    var msg = 'Bill has been Finalized';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem) {
                result = '';
                if (selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = '';
                if (selectedItem.Patient && selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
        }

        $scope.patientChanged = function () {
            var selectedItem = $scope.item.SelectedItem;
            if (selectedItem) {
                if (!$scope.item.DoctorId) {
                    $scope.item.DoctorId = selectedItem.DoctorId;
                } else {
                    $scope.item.DoctorId = $scope.item.DoctorId;
                }
                $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                $scope.item.OrderFromId = selectedItem.DepartmentId;
                $scope.item.OrderToId = 8;
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientName = '';
                if (selectedItem.Patient.Title)
                    $scope.item.PatientName += selectedItem.Patient.Title.Description;

                if (selectedItem.Patient.FirstName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.FirstName;

                if (selectedItem.Patient.LastName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.LastName;

                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
                $scope.item.EncounterId = selectedItem.Id;
                $scope.item.LocationId = selectedItem.LocationId;
                $scope.item.WardId = selectedItem.WardId;
                $scope.item.RoomId = selectedItem.RoomId;
                $scope.item.BedId = selectedItem.BedId;
                $scope.item.GuarantorId = selectedItem.GuarantorId;
                $scope.currentfilter.patientnamemrn = selectedItem.patientnamemrn;
                $scope.loadPatientGuarantors();
            }
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;
            var enc_type = 2;
            //Only ip encounter
            if ($scope.item.OP == 1) {
                enc_type = 1;
            }
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: enc_type
                },
                    // {
                    //     Key: 3,
                    //     Value: [2, 3, 4]
                    // }
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
                    Key: 11,
                    Value: query
                });
            }
            if ($scope.item.OP == false) {
                inputData.Params.push({
                    Key: 31,
                    Value: [2, 3, 4]
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
        //autosearch related code ends
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
                // item.Version = item.DiagnosisVersion.Description;
                // item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) {
                    return primer(x[field])
                } :
                function (x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.guarantorType = function (guarantorid) {
            for (var idx in $scope.lookup.PatientGuarantor) {
                var item = $scope.lookup.PatientGuarantor[idx];
                if (item.Id == guarantorid)
                    $scope.item.GuarantorTypeId = item.GuarantorTypeId;
            }
        };
        //Load patient guarantors
        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;
            if (!$scope.item.GuarantorId) {
                $scope.item.GuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            }
            $scope.guarantorType($scope.item.GuarantorId);
        }

        $scope.loadPatientGuarantors = function () {
            //Get only active guarantors - 2
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: 2
                        }, {
                            Key: 2,
                            Value: $scope.item.PatientId
                        }]
                    }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        }
        $scope.getDoctorTeamCallback = function (scope, res, options, hasError) {
            //console.log(res);
            if (res && res.length > 0) {
                var team = [];
                for (var idx in res) {
                    for (var iddx in $scope.lookup.Team) {
                        if ($scope.lookup.Team[iddx].Id == res[idx].TeamId)
                            $scope.DrTeam.push($scope.lookup.Team[iddx]);
                    }
                    if ($scope.DrTeam.length > 0) {
                        $scope.lookup.Team = $scope.DrTeam;
                    }
                    $scope.item.TeamId = $scope.DrTeam[0].Id;
                }
            } else {
                $scope.item.TeamId = -1;
                $scope.lookup.Team = [];
            }
        }

        $scope.getDoctorTeam = function () {
            if ($scope.item.DoctorId) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.DoctorId
                    },
                        // { Key: 3, Value: true },
                    ],
                    PageContext: {
                        PageSize: 10,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'SystemSettings/UserTeam/GetUserTeams',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDoctorTeamCallback
                };
                utl.Http.doAction(options);
            }
        }
        $scope.getRoomLookUp = function () {
            var inputData = [{
                "Key": "Room",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.WardId || null
                    }]
                }
            }];
            $scope.lookupCall(inputData);
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.isotlensinfo = utl.FacilitySetting.getFacilitySettingValue('billing', 'isotlensinfo');
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            // $scope.lookup = hasError ? {} : data;
            // setDefaults();
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "SurgeryType"
            },
            {
                "Key": "Priority"
            },
            { "Key": "OTTechnician" },
            {
                Key: 'Nurse',
                Request: { Params: [{ Key: 5, Value: 2 }] }
            },
            {
                "Key": "OtRooms"
            },
            {
                "Key": "Room"
            },
            // {
            //     "Key": "Department"
            // },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            // {
            //     "Key": "Doctor"
            // },
            {
                "Key": "OTScheduleStatus"
            },
            {
                "Key": "Facility"
            },
            {
                "Key": "PatientGuarantor"
            },
            // {
            //     "Key": "Procedure"
            // },
            {
                "Key": "SurgeryRoom",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }],

                }
            }
                // {
                //     "Key": "SurgeryRoom"
                // },
            ];
            $scope.lookupCall(inputData);
            $scope.loadAdditionalLookup();
            // var options = {
            //     action: 'General/Options/getoptions',
            //     data: inputData,
            //     type: 'post',
            //     onComplete: $scope.lookupCallback
            // };
            // utl.Http.doAction(options);
        }
        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.loadAdditionalLookup = function () {
            $scope.getRoomLookUp();
        }
        $scope.initLookup();
    }

    SurgeryconfirmFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();