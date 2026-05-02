(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryEntryFormController', SurgeryEntryFormController);

    function SurgeryEntryFormController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));

        $scope.item = {
            EncounterId: $stateParams.eid,
            isCompleted: false,
            isApproved: false,
            SurgeryStartedate: utl.Formatter.getCurrentDate(),
            DisplayCertificateStatus: null,
            NoteTypeId: 1,
            AnaesthesiaTypeId: 1,
            AnaesthesistId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: utl.Session.getCurrentOrgId()
        };
        $scope.lookup = {};
        $scope.Procedures = [];
        $scope.TotalHours = '';
        $scope.otCharge = 0;
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            CurrentDate: utl.Formatter.getCurrentDate(),
        };
        $scope.updateFlag = 0;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        let surindex = 1;

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
        $scope.CheckendDate = function (item) {
            var surdate = new Date(item.SurgeryStartedate);
            var startdate = surdate.getDate();
            var starthrs = surdate.getHours();
            var startmins = surdate.getMinutes();
            var surenddtae = new Date(item.SurgeryEndDate);
            var enddate = surenddtae.getDate();
            var endhrs = surenddtae.getHours();
            var endmins = surenddtae.getMinutes();

            // var hrs = endhrs - starthrs;
            // var mins = endmins - startmins;
            // $scope.TotalHours = ('0' + hrs).slice(-2) + ":" + ('0' + mins).slice(-2);
            var diff = new Date(item.SurgeryEndDate).getTime() - new Date(item.SurgeryStartedate).getTime();

            var msec = diff;
            var hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            var mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
            var ss = Math.floor(msec / 1000);
            msec -= ss * 1000;

            if (parseInt(hh) < 0) {
                utl.Alert.showErrorMsg($translate.instant('Check Surgery End Date ..'));
                $scope.TotalHours = "00:00";
            }

            console.log(hh + ":" + mm + ":" + ss);
            $scope.TotalHours = ('0' + hh).slice(-2) + ":" + ('0' + mm).slice(-2);

            if (parseInt(mm) >= 30) {
                $scope.otCharge = parseInt(hh) + 1;
            } else {
                    $scope.otCharge = parseInt(hh);
                }

            if (startdate > enddate) {
                utl.Alert.showErrorMsg($translate.instant('Surgery End Date Should not be a Past Date'));
                $scope.TotalHours = "00:00";
            }
            if (endhrs > 0) {
                if (startdate <= enddate) {
                    if (starthrs >= endhrs) {
                        utl.Alert.showErrorMsg($translate.instant('Surgery End Date Should not be a Past Date'));
                        $scope.TotalHours = "00:00";
                    }
                }
            }


            // var a = moment(item.SurgeryStartedate);//now
            // var b = moment(item.SurgeryEndDate);
            // console.log(a);
            // console.log(b);
            // console.log(a.diff(b, 'minutes')) // 44700
            // console.log(a.diff(b, 'hours')) // 745
            // console.log(a.diff(b, 'days')) // 31
            // console.log(a.diff(b, 'weeks')) // 4
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId()
            if (data.SurgeryEntryDetails) {
                $scope.Procedures = data.SurgeryEntryDetails;
            }
          // $scope.CheckendDate($scope.item);
          if (data.SurgeryStartedate) {
            $scope.item.SurgeryStartedate = data.SurgeryStartedate;
        }
        if (data.SurgeryEndDate) {
            $scope.item.SurgeryEndDate = data.SurgeryEndDate;
        }
        if (data.SurgeryStartedate && $scope.item.SurgeryEndDate) {
            $scope.CheckendDate($scope.item);
        }
            if (data.SurgeryEntryStatusId == 2)
                $scope.item.isApproved = true;
            $scope.buttonVisiblity();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'OtManagement/SurgeryEntry/GetSurgeryEntryById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.buttonVisiblity();
            }
        };

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
                    $scope.CanShowApprove = false;
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
                    $scope.CanShowCancel = false;
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
            $state.go('app.surgeryentries');
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
            api: 'Visit/Visit/GetMinEncounters',
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

        function diff(start, end) {
            start = start.split(":");
            end = end.split(":");
            var startDate = new Date(0, 0, 0, start[0], start[1], 0);
            var endDate = new Date(0, 0, 0, end[0], end[1], 0);
            var diff = endDate.getTime() - startDate.getTime();
            var hours = Math.floor(diff / 1000 / 60 / 60);
            diff -= hours * 1000 * 60 * 60;
            var minutes = Math.floor(diff / 1000 / 60);

            // If using time pickers with 24 hours format, add the below line get exact hours
            if (hours < 0)
                hours = hours + 24;

            return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
        }
        // autosearch related code starts for Doctors
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
        //     iteminfo: {},
        //     api: 'SystemSettings/User/GetUsers',
        //     formatdisplay: formatselecteddoctor,
        //     presearch: presearchdoctor,
        //     postsearch: postsearchdoctor
        // };

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
        //     return result;
        // }

        // function presearchdoctor() {
        //     var query = vm.doctorcontrolconfig.query;

        //     //Search only DoctorGroup
        //     var inputData = {
        //         Params: [{
        //             Key: 3,
        //             Value: 2
        //         },
        //         {
        //             Key: 5,
        //             Value: 2
        //         },
        //         {
        //             Key: 2,
        //             Value: [-1, $scope.item.FacilityId]
        //         }
        //         ],
        //         PageContext: {
        //             PageSize: 25,
        //             PageNumber: 1
        //         }
        //     };

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
        //         item.Speciality = item.Department ? item.Department.DepartmentName : '';
        //     }
        // }
        // //autosearch related code ends for Doctors

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
            $scope.item.ProcedureName = result;
            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [{
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
                // if (item.ProcedureCategory)
                //     item.Category = item.ProcedureCategory.Description;
                // if (item.ProcedureTechnique)
                //     item.Technique = item.ProcedureTechnique.Description;
            }
        }

        $scope.addProcedure = function () {

            if (($scope.item.ProcedureId == null) || ($scope.item.ChiefSurgeonId == null)) {
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
                DepartmentName: $scope.item.DepartmentName,
                chiefiddesc: "chiefsurgeon" + surindex++
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

            if (($scope.item.ProcedureId == null) || ($scope.item.ChiefSurgeonId == null)) {
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
            $scope.updateIndex = -1;
            $scope.ClearData();

        };
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
            $scope.item.SurgeryRegisteredOn = utl.Formatter.getCurrentDate();
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

            if (!$scope.item.EncounterId || $scope.item.EncounterId <= 0) {
                utl.Alert.showErrorMsg('Visit Information is not set, Again enter the patient information ');
                $('#pid').focus();
                return;
            }
            // if (!$scope.item.ChiefSurgeonId || $scope.item.ChiefSurgeonId == -1) {
            //     utl.Alert.showErrorMsg('Select Any Surgeon');
            //     return;
            // }
            // if (!$scope.item.ProcedureId || $scope.item.ProcedureId == -1) {
            //     utl.Alert.showErrorMsg('Select Any Procedures');
            //     return;
            // }
            // if (!$scope.item.AnaesthesistId || $scope.item.AnaesthesistId == -1) {
            //     utl.Alert.showErrorMsg('Select Any Procedures');
            //     return;
            // }
            // if (!$scope.item.AssistantSurgeonId || $scope.item.AssistantSurgeonId == -1) {
            //     utl.Alert.showErrorMsg('Select Any AssistantSurgeon');
            //     return;
            // }
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    // $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
            }
            // if (data === true) {
            //     $scope.currentcontext.id = options.data.Data.Id;
            // } else {
            //     $scope.currentcontext.id = data;
            // }
            $scope.getItem();
        };

        $scope.saveItem = function () {
            if (!$scope.item.PatientId) {
                utl.Alert.showErrorMsg('Please Select Patient...');
                $('#pid').focus();
                return;
            }

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
            $scope.item.Id = $scope.currentcontext.id;
            console.log($scope.TotalHours);
            console.log($scope.otCharge);
            if ($scope.otCharge == 0)
                $scope.otCharge = 1;
            $scope.item.totalSurgeryTime = $scope.otCharge;

            if (!$scope.item.Procedures || $scope.item.Procedures.length <= 0) {
                utl.Alert.showErrorMsg('Valid Procedures not Present.. Please set');
                return;
            }
            // console.log($scope.item);return;
            var actionName = 'OtManagement/SurgeryEntry/AddSurgeryEntry';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'OtManagement/SurgeryEntry/UpdateOTSurgeryEntry';
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
            $scope.getItem();
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
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
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

    SurgeryEntryFormController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();