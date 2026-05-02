(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dummyOPVisitsController', dummyOPVisitsController);

    function dummyOPVisitsController($rootScope, $scope, $stateParams, $state, $timeout, $translate, utl, $filter) {
        var vm = this;
        $scope.LoadOldInfo = 0;
        $scope.AllEncounterByDeptGender = {};
        $scope.DummyVisitInfo = {};
        $scope.Encounter = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            VisitTypeId: 1,
            AdmissionDate: utl.Formatter.getCurrentDate(),
            AdmissionToDate: utl.Formatter.getCurrentDate(),
            TransactionDate: utl.Formatter.getCurrentDate(),
            IsAdditionalVisitOnly: false,
            checkout: true
        };
        $scope.item = {};
        $scope.TotActVisitCount = 0;
        $scope.TotDmyVisitCount = 0;
        $scope.TotMaleVisitCount = 0;
        $scope.TotFemaleVisitCount = 0;
        $scope.TotFinalVisitCount = 0;

        $scope.getOldPatientList = function () {
            $scope.LoadOldInfo = 1;
            var fromdt = $filter('date')($scope.currentcontext.AdmissionDate, 'yyyy-MM-dd 00:00:00');
            var todt = $filter('date')($scope.currentcontext.AdmissionToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.FacilityId
                },
                {
                    Key: 6,
                    Value: $scope.currentcontext.DepartmentId
                },
                {
                    Key: 15,
                    Value: 1 // OP
                },
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.VisitTypeId == 2) {
                inputData.Params.push({
                    Key: 50,
                    Value: true
                });
                // inputData.Params.push({
                //     Key: 52,
                //     Value: true
                // });
            } else {
                inputData.Params.push({
                    Key: 50,
                    Value: false
                });
            }
            if (fromdt && todt) {
                inputData.Params.push({
                    Key: 16,
                    Value: [fromdt, todt]
                });
            }
            var options = {
                action: 'Visit/Visit/GetAdditionalVisitwithoutIP',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOldPatientListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getOldPatientListCallback = function (scope, res, options, hasError) {
            $scope.Encounter = [];
            if (res && res.Data) {
                var Encounter = res.Data;
                for (var idx in res.Data) {
                    Encounter[idx] = res.Data[idx];
                    if (res.Data[idx] && res.Data[idx].Patient && res.Data[idx].Patient.GenderId)
                        Encounter[idx].GenderId = res.Data[idx].Patient.GenderId;
                }
            }
            if (Encounter && Encounter.length > 0) {
                var Encounter_Dept_Group = groupByMulti(Encounter, ['DepartmentId']);
                $scope.AllEncounterByDeptGender = groupByMulti(Encounter, ['DepartmentId', 'GenderId']);
                $scope.EncounterDept = Encounter_Dept_Group;
                for (var idx in $scope.AllEncounterByDeptGender) {
                    var depid = -1;
                    try {
                        depid = parseInt(idx);
                    } catch (ex) {
                        depid = -1;
                    }

                    var Disabledmale = false;
                    var Disabledfemale = false;
                    var admittingdept = 0;
                    for (var didx in $scope.lookup.Department) {
                        var deptinfo = $scope.lookup.Department[didx];
                        if (deptinfo.Id && deptinfo.Id == depid) {
                            if (deptinfo.IsAdmittingDept) {
                                admittingdept = 1;

                                if (deptinfo.GenderId && deptinfo.GenderId == 1)
                                    Disabledfemale = true;
                                if (deptinfo.GenderId && deptinfo.GenderId == 2)
                                    Disabledmale = true;

                                break;
                            }
                        }
                    }

                    if (admittingdept) {
                        var encounterinfo = $scope.AllEncounterByDeptGender[idx];
                        var DeptMaleCount = 0;
                        var DeptFemaleCount = 0;
                        for (var idx1 in encounterinfo) {
                            var genderId = -1;
                            try {
                                genderId = parseInt(idx1);
                            } catch (ex) {
                                genderId = -1;
                            }
                            var LenOfGenderId = encounterinfo[idx1];
                            if (genderId == 1) // Male
                                DeptMaleCount = LenOfGenderId.length;
                            else if (genderId == 2) // FeMale
                                DeptFemaleCount = LenOfGenderId.length;
                        }

                        let encdata = {
                            DepartmentId: depid,
                            DepartmentName: encounterinfo[idx1][0].Department.DepartmentName,
                            DepartmentCount: (DeptMaleCount + DeptFemaleCount),
                            DepartmentMaleCount: DeptMaleCount,
                            DepartmentFeMaleCount: DeptFemaleCount,
                            DummyVisitCount: 0,
                            MaleVisitCount: 0,
                            FemaleVisitCount: 0,
                            ValMaleVisitCount: 0,
                            ValFemaleVisitCount: 0,
                            TotalVisitCount: (DeptMaleCount + DeptFemaleCount),
                            WardId: -1,
                            AvailableBeds: 0,
                            Status: 1,
                            disabledmale: Disabledmale,
                            disabledfemale: Disabledfemale,
                        };
                        $scope.Encounter.push(encdata);
                    }
                }
            }

            $scope.CalFullTotalCount();
        };

        $scope.getList = function () {
            $scope.LoadOldInfo = 0;
            var fromdt = $filter('date')($scope.currentcontext.AdmissionDate, 'yyyy-MM-dd 00:00:00');
            var todt = $filter('date')($scope.currentcontext.AdmissionDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.FacilityId
                },
                {
                    Key: 6,
                    Value: $scope.currentcontext.DepartmentId
                },
                {
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 54,
                    Value: $scope.currentcontext.VisitTypeId
                },
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.IsAdditionalVisitOnly) {
                inputData.Params.push({
                    Key: 50,
                    Value: true
                });
            } else {
                inputData.Params.push({
                    Key: 50,
                    Value: false
                });
            }
            if (fromdt && todt) {
                inputData.Params.push({
                    Key: 16,
                    Value: [fromdt, todt]
                });
            }
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Encounter = [];
            if (res && res.Data) {
                var Encounter = res.Data;
                console.log(Encounter);
            }
            if (Encounter && Encounter.length > 0) {
                var Encounter_Dept_Group = groupByMulti(Encounter, ['DepartmentId']);
                $scope.EncounterDept = Encounter_Dept_Group;
                console.log(Encounter_Dept_Group);
                for (var idx in $scope.EncounterDept) {
                    var depid = -1;
                    try {
                        depid = parseInt(idx);
                    } catch (ex) {
                        depid = -1;
                    }
                    var encounterinfo = $scope.EncounterDept[idx]
                    var DeptMaleCount = 0;
                    var DeptFemaleCount = 0;
                    for (var idx in encounterinfo) {
                        var patdata = encounterinfo[idx].Patient;
                        if (patdata.GenderId == 1) // Male{
                            DeptMaleCount++;
                        else if (patdata.GenderId == 2) // FeMale{
                            DeptFemaleCount++;
                    }

                    let encdata = {
                        DepartmentId: depid,
                        DepartmentName: encounterinfo[0].Department.DepartmentName,
                        DepartmentCount: encounterinfo.length,
                        DepartmentMaleCount: DeptMaleCount,
                        DepartmentFeMaleCount: DeptFemaleCount,
                        DummyVisitCount: 0,
                        MaleVisitCount: 0,
                        FemaleVisitCount: 0,
                        ValMaleVisitCount: 0,
                        ValFemaleVisitCount: 0,
                        TotalVisitCount: encounterinfo.length,
                        WardId: -1,
                        AvailableBeds: 0,
                        Status: 1,
                        disabledmale: false,
                        disabledfemale: false,
                    };
                    $scope.Encounter.push(encdata);
                }
            }
            for (var didx in $scope.lookup.Department) {
                var deptinfo = $scope.lookup.Department[didx];

                if (deptinfo.IsAdmittingDept) {
                    var DepCheck = 0;
                    for (var edidx in $scope.Encounter) {
                        var exideptinfo = $scope.Encounter[edidx];
                        if (exideptinfo.DepartmentId === deptinfo.Id) {
                            DepCheck = 1;
                            break;
                        }
                    }
                    if (DepCheck === 0) {
                        if (deptinfo.Id > 0) {
                            let depdata = {
                                DepartmentId: deptinfo.Id,
                                DepartmentName: deptinfo.DepartmentName,
                                DepartmentCount: 0,
                                DepartmentMaleCount: 0,
                                DepartmentFeMaleCount: 0,
                                DummyVisitCount: 0,
                                MaleVisitCount: 0,
                                FemaleVisitCount: 0,
                                ValMaleVisitCount: 0,
                                ValFemaleVisitCount: 0,
                                TotalVisitCount: 0,
                                RemarkId: -1,
                                Status: 1,
                                disabledmale: false,
                                disabledfemale: false,
                            };
                            $scope.Encounter.push(depdata);
                        }
                    }
                }

            }
            $scope.CalFullTotalCount();
        };


        var groupByMulti = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.CalTotalCount = function (enc) {
            var visitcount = parseInt(enc.DepartmentCount) || 0;
            var malevisitcount = parseInt(enc.MaleVisitCount) || 0;
            var femalevisitcount = parseInt(enc.FemaleVisitCount) || 0;
            var totalvisitcount = parseInt(enc.TotalVisitCount) || 0;
            enc.DummyVisitCount = malevisitcount + femalevisitcount;
            var dummyvisitcount = parseInt(enc.DummyVisitCount) || 0;
            enc.TotalVisitCount = (visitcount + dummyvisitcount);
            $scope.CalFullTotalCount();
        };

        $scope.CalFullTotalCount = function () {
            $scope.TotActVisitCount = 0;
            $scope.TotDmyVisitCount = 0;
            $scope.TotMaleVisitCount = 0;
            $scope.TotFemaleVisitCount = 0;
            $scope.TotFinalVisitCount = 0;
            for (var idx in $scope.Encounter) {
                var enc = $scope.Encounter[idx];
                try {
                    $scope.TotActVisitCount += parseInt(enc.DepartmentCount);
                } catch (ex) {
                    $scope.TotActVisitCount += 0;
                }
                try {
                    $scope.TotDmyVisitCount += parseInt(enc.DummyVisitCount);
                } catch (ex) {
                    $scope.TotDmyVisitCount += 0;
                }
                try {
                    $scope.TotMaleVisitCount += parseInt(enc.MaleVisitCount);
                } catch (ex) {
                    $scope.TotMaleVisitCount += 0;
                }
                try {
                    $scope.TotFemaleVisitCount += parseInt(enc.FemaleVisitCount);
                } catch (ex) {
                    $scope.TotFemaleVisitCount += 0;
                }
                try {
                    $scope.TotFinalVisitCount += parseInt(enc.TotalVisitCount);
                } catch (ex) {
                    $scope.TotFinalVisitCount += 0;
                }
            }
        };

        $scope.deleterow = function (index, enc) {
            enc.Status = 2;
        };

        $scope.saveAndApprove = function () {
            var transdate = $filter('date')($scope.currentcontext.TransactionDate, 'dd/MM/yyyy');
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are You Sure to Accept this ' + transdate + ' Transaction Date',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveitem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.saveitem = function () {
            if ($scope.LoadOldInfo == 0) {
                var msg = "Load from Old Data";
                utl.Alert.showErrorMsg(msg);
                return false;
            }
            if ($scope.checkMandatory()) {

                for (var idx in $scope.Encounter) {
                    var enc = $scope.Encounter[idx];
                    enc.ValMaleVisitCount = enc.MaleVisitCount;
                    enc.ValFemaleVisitCount = enc.FemaleVisitCount;
                    var dummyvisitcount = 0;
                    try {
                        dummyvisitcount = parseInt(enc.DummyVisitCount);
                    } catch (ex) {
                        dummyvisitcount = 0;
                    }
                    if (!dummyvisitcount || dummyvisitcount <= 0) enc.Status = 0;
                }

                $scope.DummyVisitInfo = {};

                if ($scope.currentcontext.VisitTypeId == 1) $scope.ProcessPatientInfo();
                else $scope.FollowUpProcessPatientInfo();

                $scope.DummyOPVisitInfo = [];
                for (var idx in $scope.DummyVisitInfo) {
                    $scope.DummyOPVisitInfo.push($scope.DummyVisitInfo[idx]);
                }

                $scope.DummyOPVisitInfo.sort($scope.custom_sort);
                for (var idx in $scope.DummyOPVisitInfo) {
                    console.log($scope.DummyOPVisitInfo[idx].AdmissionDate);
                }

                if ($scope.DummyOPVisitInfo && $scope.DummyOPVisitInfo.length) {
                    var actionName = 'registration/patient/DummyVisitCreation';
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.DummyOPVisitInfo
                        },
                        type: 'post',
                        onComplete: $scope.saveItemCallback
                    };
                    utl.Http.doAction(options);
                }

            }
        };

        $scope.custom_sort = function (a, b) {
            if (a.AdmissionDate < b.AdmissionDate) return -1;
            else if (a.AdmissionDate > b.AdmissionDate) return 1;
            else return 0;
        };

        $scope.ProcessPatientInfo = function () {
            $scope.LoadOldInfo = 0;
            var totalcount = 0;
            for (var ctidx in $scope.Encounter) {
                var enc = $scope.Encounter[ctidx];
                try {
                    totalcount += parseInt(enc.DummyVisitCount);
                } catch (ex) { }
            }

            var TransDatetime = $filter('date')($scope.currentcontext.TransactionDate, 'yyyy-MM-dd HH:mm:ss');

            $scope.EncounterPatName = {};
            $scope.EncounterAddss = {};
            while (totalcount > 0) {
                var malecompeleted = 0;
                var femalecompeleted = 0;

                if ($scope.Encounter.length == 0) totalcount = 0;

                for (var idx in $scope.Encounter) {

                    var malefemaleselection = Math.floor((Math.random() * 2) + 1);

                    if (!malefemaleselection) malefemaleselection = 1;

                    if (totalcount <= 0)
                        break;

                    var enc = $scope.Encounter[idx];


                    // Exit from infinite loop

                    var totMFCount = 0;
                    for (var allzero in $scope.Encounter) {
                        var infi = $scope.Encounter[allzero];
                        totMFCount += (infi.ValMaleVisitCount + infi.ValFemaleVisitCount);
                    }
                    if (totMFCount == 0)
                        totalcount = 0;

                    // Exit from infinite loop


                    var dummyvisitcount = 0;
                    try {
                        dummyvisitcount = parseInt(enc.DummyVisitCount);
                    } catch (ex) {
                        dummyvisitcount = 0;
                    }
                    if (dummyvisitcount <= 0)
                        continue;

                    if (dummyvisitcount) {

                        for (var deptidx in $scope.AllEncounterByDeptGender) {
                            try {
                                deptidx = parseInt(deptidx);
                            } catch (ex) {
                                deptidx = 0;
                            }

                            if (malecompeleted || femalecompeleted) {
                                malecompeleted = 0;
                                femalecompeleted = 0;
                                break;
                            }

                            if (enc.DepartmentId == deptidx) {
                                var AllEncounter = [];

                                if (enc.ValMaleVisitCount && malefemaleselection == 1) {

                                    var AllEncounter = []; // create empty array to hold copy
                                    for (var i = 0, len = $scope.AllEncounterByDeptGender[deptidx][1].length; i < len; i++) {
                                        AllEncounter[i] = {}; // empty object to hold properties added below
                                        for (var prop in $scope.AllEncounterByDeptGender[deptidx][1][i]) {
                                            AllEncounter[i][prop] = $scope.AllEncounterByDeptGender[deptidx][1][i][prop];
                                            // copy properties from arObj to ar2
                                        }
                                    }

                                    if (AllEncounter && AllEncounter.length) {
                                        TransDatetime = $filter('date')(TransDatetime, 'yyyy-MM-dd HH:mm:ss');
                                        var newEncDataM = $scope.TransformPatientInfo(
                                            enc.RemarkId, TransDatetime,
                                            deptidx, $scope.currentcontext.VisitTypeId,
                                            AllEncounter);
                                        TransDatetime = $filter('date')(newEncDataM.AdmissionDate, 'yyyy-MM-dd HH:mm:ss');
                                        console.log(" M = " + TransDatetime);
                                        console.log(" EM = " + newEncDataM.AdmissionDate);
                                        $scope.DummyVisitInfo[totalcount] = newEncDataM;
                                        enc.ValMaleVisitCount--;
                                        totalcount--;
                                        malecompeleted = 1;
                                    }

                                } else if (enc.ValFemaleVisitCount && malefemaleselection == 2) {
                                    var AllEncounter = []; // create empty array to hold copy
                                    for (var i = 0, len = $scope.AllEncounterByDeptGender[deptidx][2].length; i < len; i++) {
                                        AllEncounter[i] = {}; // empty object to hold properties added below
                                        for (var prop in $scope.AllEncounterByDeptGender[deptidx][2][i]) {
                                            AllEncounter[i][prop] = $scope.AllEncounterByDeptGender[deptidx][2][i][prop];
                                            // copy properties from arObj to ar2
                                        }
                                    }

                                    if (AllEncounter && AllEncounter.length) {
                                        TransDatetime = $filter('date')(TransDatetime, 'yyyy-MM-dd HH:mm:ss');
                                        var newEncDataF = $scope.TransformPatientInfo(
                                            enc.RemarkId, TransDatetime,
                                            deptidx, $scope.currentcontext.VisitTypeId,
                                            AllEncounter);
                                        TransDatetime = $filter('date')(newEncDataF.AdmissionDate, 'yyyy-MM-dd HH:mm:ss');
                                        console.log(" F = " + TransDatetime);
                                        console.log(" EF = " + newEncDataF.AdmissionDate);
                                        $scope.DummyVisitInfo[totalcount] = newEncDataF;
                                        enc.ValFemaleVisitCount--;
                                        totalcount--;
                                        femalecompeleted = 1;
                                    }
                                }
                            }
                        }
                    }
                }

            }

            console.log($scope.DummyVisitInfo);

        }


        $scope.TransformPatientInfo = function (RemarkId, TransDatetime, DepartmentId,
            ActuavlVisitTypeId, AllEncounter) {

            var MaxRandomSize = AllEncounter.length - 1;
            var Firstindex = 0;
            var Secondindex = 0;
            var Thirdindex = 0;

            if (MaxRandomSize > 3) {
                Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                Secondindex = Math.floor((Math.random() * (MaxRandomSize - 2)) + 1);
                Thirdindex = Math.floor((Math.random() * (MaxRandomSize - 1)) + 1);
            } else if (MaxRandomSize > 2) {
                Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                Secondindex = Math.floor((Math.random() * (MaxRandomSize)) + 1);
                Thirdindex = Math.floor((Math.random() * MaxRandomSize - 1) + 1);
            } else if (MaxRandomSize > 1) {
                Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                Secondindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                Thirdindex = 0;
            }
            if (Firstindex > MaxRandomSize) Firstindex = 0;
            if (Secondindex > MaxRandomSize) Secondindex = 0;
            if (Thirdindex > MaxRandomSize) Thirdindex = 0;
            var Encounter1 = AllEncounter[Firstindex]; // Additional Visit Random Patient
            var Encounter2 = AllEncounter[Secondindex]; // First Name , DOB, Age
            var Encounter3 = AllEncounter[Thirdindex]; // Address


            var MissingLastName = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Y'];

            var AdmissionDate = moment(TransDatetime).add(40, 'seconds').toDate();
            var AdmissionEndDate = moment(AdmissionDate).add(2, 'minutes').toDate();

            if (ActuavlVisitTypeId === 1) {
                Encounter1.Patient.Id = null;
                Encounter1.Patient.MRN = null;
            }

            if (!Encounter1.Appointment || !Encounter1.Appointment.Id) {
                Encounter1.Appointment = {
                    Id: null,
                    AppointmentTypeId: 1,
                    AppointmentStatusId: 6,
                    AppointmentDate: AdmissionDate,
                    AppointmentCategoryId: 5,
                    PatientId: Encounter1.Patient.Id,
                    FacilityId: Encounter1.FacilityId,
                    DepartmentId: DepartmentId,
                    DoctorId: Encounter1.DoctorId,
                    ResourceId: null,
                    ResearchProjectId: null,
                    IsForceBooking: 0,
                    StartTime: null,
                    EndTime: null,
                    ReferralId: null,
                    PriorityId: 3,
                    RemarkId: RemarkId,
                    Comments: null,
                    VisitTypeId: Encounter1.VisitTypeId,
                    CancelledRemarks: null,
                    IsAssignedToUser: 0,
                    IsAssignedToGroup: 0,
                    IsMRDFile: 0,
                    AssignedUserId: Encounter1.DoctorId,
                    AssignedGroupId: null,
                    PatientGuarantorId: null,
                    AssignedUserName: null,
                    ReferralName: null,
                    ReferralTypeId: null,
                    Remarks: null,
                    Status: 1,
                    Rev: 0,
                    CreatedBy: utl.Session.getCurrentUserId(),
                    CreatedAt: new Date(),
                    UpdatedBy: utl.Session.getCurrentUserId(),
                    UpdatedAt: new Date(),
                }
            }


            Encounter1.Appointment.Id = null;
            Encounter1.Appointment.AppointmentId = null;
            Encounter1.Appointment.PatientId = null;


            if (Encounter1.Id) Encounter1.OriginalId = Encounter1.Id;
            if (Encounter1.Id) Encounter1.Id = null;
            if (Encounter1.PatientId) Encounter1.PatientId = null;
            if (Encounter1.AppointmentId) Encounter1.AppointmentId = null;
            if (Encounter1.EncounterId) Encounter1.EncounterId = null;
            if (Encounter1.VisitIdentifier) Encounter1.VisitIdentifier = null;

            Encounter1.VisitTypeId = ActuavlVisitTypeId;

            Encounter1.AdmissionDate = AdmissionDate;
            Encounter1.DepartmentId = DepartmentId;
            Encounter1.DiagnosisId = -1;

            Encounter1.Diagnosis2Id = null;
            Encounter1.Diagnosis3Id = null;
            Encounter1.RemarkId = RemarkId;
            Encounter1.IsLatest = 1;
            Encounter1.AppointmentDate = AdmissionDate;
            Encounter1.Appointment.DepartmentId = DepartmentId;
            Encounter1.Appointment.RemarkId = RemarkId;
            Encounter1.Appointment.AppointmentTypeId = 1;
            Encounter1.Appointment.AppointmentCategoryId = 5;
            Encounter1.Appointment.FacilityId = $scope.currentcontext.FacilityId;
            Encounter1.Appointment.DoctorId = Encounter1.DoctorId;
            Encounter1.Appointment.StartTime = moment(AdmissionDate).format('HH:mm:ss');
            Encounter1.Appointment.EndTime = moment(AdmissionEndDate).format('HH:mm:ss');
            Encounter1.Appointment.AssignedUserId = Encounter1.DoctorId;

            var itransform = 0;
            var sPatientdata = "";
            var sPatAddress = "";
            var duplication = false;
            var patduplication = false;
            var addsduplication = false;
            do {
                duplication = false;
                patduplication = false;
                addsduplication = false;

                if (MaxRandomSize > 3) {
                    Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                    Secondindex = Math.floor((Math.random() * (MaxRandomSize - 2)) + 1);
                    Thirdindex = Math.floor((Math.random() * (MaxRandomSize - 1)) + 1);
                } else if (MaxRandomSize > 2) {
                    Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                    Secondindex = Math.floor((Math.random() * (MaxRandomSize)) + 1);
                    Thirdindex = Math.floor((Math.random() * MaxRandomSize - 1) + 1);
                } else if (MaxRandomSize > 1) {
                    Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                    Secondindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                    Thirdindex = 0;
                }

                if (Secondindex > MaxRandomSize) Secondindex = 0;
                if (Thirdindex > MaxRandomSize) Thirdindex = 0;

                Encounter2 = AllEncounter[Secondindex]; // First Name , DOB, Age
                Encounter3 = AllEncounter[Thirdindex]; // Address


                try {
                    if (Encounter1 && Encounter1.Patient) {
                        var LastNameindex = Math.floor((Math.random() * (MissingLastName.length - 1)) + 1);
                        Encounter1.Patient.LastName = "" + MissingLastName[LastNameindex];
                    }
                } catch (ex) {
                    console.log('LastName Exception');
                }

                if ((Encounter1.Patient) &&
                    (Encounter2.Patient && Encounter2.Patient.FirstName))
                    Encounter1.Patient.FirstName = Encounter2.Patient.FirstName;

                if ((Encounter1.Patient) &&
                    (Encounter2.Patient && Encounter2.Patient.DOB))
                    Encounter1.Patient.DOB = Encounter2.Patient.DOB;

                if ((Encounter1.Patient) &&
                    (Encounter2.Patient && Encounter2.Patient.Age))
                    Encounter1.Patient.Age = Encounter2.Patient.Age;

                if ((Encounter1.Patient) && (Encounter3.Patient &&
                    Encounter3.Patient.AddressLine1))
                    Encounter1.Patient.AddressLine1 = Encounter3.Patient.AddressLine1;

                if ((Encounter1.Patient) && (Encounter3.Patient &&
                    Encounter3.Patient.AddressLine2))
                    Encounter1.Patient.AddressLine2 = Encounter3.Patient.AddressLine2;

                if ((Encounter1.Patient) && (Encounter3.Patient &&
                    Encounter3.Patient.Pincode))
                    Encounter1.Patient.Pincode = Encounter3.Patient.Pincode;

                if ((Encounter1.Patient) && (Encounter3.Patient &&
                    Encounter3.Patient.Area))
                    Encounter1.Patient.Area = Encounter3.Patient.Area;

                if ((Encounter1.Patient) && (Encounter3.Patient &&
                    Encounter3.Patient.City))
                    Encounter1.Patient.City = Encounter3.Patient.City;

                if ((Encounter1.Patient) && (Encounter3.Patient &&
                    Encounter3.Patient.State))
                    Encounter1.Patient.State = Encounter3.Patient.State;

                if ((Encounter1.Patient) && (Encounter3.Patient &&
                    Encounter3.Patient.Country))
                    Encounter1.Patient.Country = Encounter3.Patient.Country;

                if (!Encounter1.Patient.FirstName)
                    Encounter1.Patient.FirstName = "";
                if (!Encounter1.Patient.LastName)
                    Encounter1.Patient.LastName = "";
                if (!Encounter1.Patient.Age)
                    Encounter1.Patient.Age = "";
                if (!Encounter1.Patient.AddressLine1)
                    Encounter1.Patient.AddressLine1 = "";
                if (!Encounter1.Patient.AddressLine2)
                    Encounter1.Patient.AddressLine2 = "";
                if (!Encounter1.Patient.Pincode)
                    Encounter1.Patient.Pincode = "";
                if (!Encounter1.Patient.Area)
                    Encounter1.Patient.Area = "";
                if (!Encounter1.Patient.City)
                    Encounter1.Patient.City = "";
                if (!Encounter1.Patient.State)
                    Encounter1.Patient.State = "";
                if (!Encounter1.Patient.Country)
                    Encounter1.Patient.Country = "";


                sPatientdata = "" + Encounter1.Patient.FirstName + "" + Encounter1.Patient.LastName + "" +
                    Encounter1.Patient.Age;
                sPatAddress = "" + Encounter1.Patient.AddressLine1 + "" +
                    Encounter1.Patient.AddressLine2 + "" + Encounter1.Patient.Pincode + "" + Encounter1.Patient.Area + "" +
                    Encounter1.Patient.City + "" + Encounter1.Patient.State + "" + Encounter1.Patient.Country;

                if (sPatientdata.length > 0) {
                    if (!$scope.EncounterPatName[sPatientdata]) {
                        $scope.EncounterPatName[sPatientdata] = sPatientdata;
                    } else {
                        duplication = true;
                        patduplication = true;
                    }
                }
                if (sPatAddress.length > 0) {
                    if (!$scope.EncounterAddss[sPatAddress]) {
                        $scope.EncounterAddss[sPatAddress] = sPatAddress;
                    } else {
                        duplication = true;
                        addsduplication = true;
                    }
                }

                itransform++;
            } while (itransform < MaxRandomSize && duplication);

            if (duplication) {
                if (patduplication) {
                    utl.Alert.showErrorMsg('Duplicate Patient Information "' + sPatientdata + '"' + 'Kindly take more patients information try again...');
                    return null;
                } else if (addsduplication) {
                    utl.Alert.showErrorMsg('Duplicate Address Information "' + sPatAddress + '"' + 'Kindly take more patients information try again...');
                    return null;
                } else {
                    utl.Alert.showErrorMsg('Duplicate Information "' + sPatientdata + ' - ' + sPatAddress + '"' + 'Kindly take more patients information try again...');
                    return null;
                }
            }

            return Encounter1;

        }

        $scope.FollowUpProcessPatientInfo = function () {
            $scope.LoadOldInfo = 0;
            var totalcount = 0;
            for (var ctidx in $scope.Encounter) {
                var enc = $scope.Encounter[ctidx];
                try {
                    totalcount += parseInt(enc.DummyVisitCount);
                } catch (ex) { }
            }

            var TransDatetime = $scope.currentcontext.TransactionDate;

            var MaleEncLen = 0;
            var FemaleEncLen = 0;
            while (totalcount > 0) {
                var malecompeleted = 0;
                var femalecompeleted = 0;

                if ($scope.Encounter.length == 0) totalcount = 0;

                for (var idx in $scope.Encounter) {

                    var malefemaleselection = Math.floor((Math.random() * 2) + 1);

                    if (!malefemaleselection) malefemaleselection = 1;

                    if (totalcount <= 0)
                        break;

                    var enc = $scope.Encounter[idx];

                    // Exit from infinite loop

                    var totMFCount = 0;
                    for (var allzero in $scope.Encounter) {
                        var infi = $scope.Encounter[allzero];
                        totMFCount += (infi.ValMaleVisitCount + infi.ValFemaleVisitCount);
                    }
                    if (totMFCount == 0)
                        totalcount = 0;

                    // Exit from infinite loop


                    var dummyvisitcount = 0;
                    try {
                        dummyvisitcount = parseInt(enc.DummyVisitCount);
                    } catch (ex) {
                        dummyvisitcount = 0;
                    }
                    if (dummyvisitcount <= 0)
                        continue;

                    if (dummyvisitcount) {
                        for (var deptidx in $scope.AllEncounterByDeptGender) {

                            try {
                                deptidx = parseInt(deptidx);
                            } catch (ex) {
                                deptidx = 0;
                            }

                            if (malecompeleted || femalecompeleted) {
                                malecompeleted = 0;
                                femalecompeleted = 0;
                                break;
                            }

                            if (enc.DepartmentId == deptidx) {
                                var AllEncounter = [];

                                if (enc.ValMaleVisitCount && malefemaleselection == 1) {

                                    var AllEncounter = []; // create empty array to hold copy
                                    for (var i = 0, len = $scope.AllEncounterByDeptGender[deptidx][1].length; i < len; i++) {
                                        AllEncounter[i] = {}; // empty object to hold properties added below
                                        for (var prop in $scope.AllEncounterByDeptGender[deptidx][1][i]) {
                                            AllEncounter[i][prop] = $scope.AllEncounterByDeptGender[deptidx][1][i][prop];
                                            // copy properties from arObj to ar2
                                        }
                                    }

                                    if (AllEncounter && AllEncounter.length) {
                                        MaleEncLen = enc.MaleVisitCount - (enc.ValMaleVisitCount);
                                        if (MaleEncLen <= AllEncounter.length) {
                                            TransDatetime = $filter('date')(TransDatetime, 'yyyy-MM-dd HH:mm:ss');
                                            TransDatetime = moment(TransDatetime).add(30, 'seconds').toDate();
                                            AllEncounter[MaleEncLen].AdmissionDate = TransDatetime;
                                            AllEncounter[MaleEncLen].WardId = enc.MaleWardId;
                                            AllEncounter[MaleEncLen].DepartmentId = enc.DepartmentId;
                                            AllEncounter[MaleEncLen].VisitTypeId = $scope.currentcontext.VisitTypeId;
                                            $scope.DummyVisitInfo[totalcount] = AllEncounter[MaleEncLen];
                                            enc.ValMaleVisitCount--;
                                            totalcount--;
                                            malecompeleted = 1;
                                        }
                                    }

                                }
                                if (enc.ValFemaleVisitCount && malefemaleselection == 2) {

                                    var AllEncounter = []; // create empty array to hold copy
                                    for (var i = 0, len = $scope.AllEncounterByDeptGender[deptidx][2].length; i < len; i++) {
                                        AllEncounter[i] = {}; // empty object to hold properties added below
                                        for (var prop in $scope.AllEncounterByDeptGender[deptidx][2][i]) {
                                            AllEncounter[i][prop] = $scope.AllEncounterByDeptGender[deptidx][2][i][prop];
                                            // copy properties from arObj to ar2
                                        }
                                    }

                                    if (AllEncounter && AllEncounter.length) {
                                        FemaleEncLen = enc.FemaleVisitCount - (enc.ValFemaleVisitCount);
                                        if (FemaleEncLen <= AllEncounter.length) {
                                            TransDatetime = $filter('date')(TransDatetime, 'yyyy-MM-dd HH:mm:ss');
                                            TransDatetime = moment(TransDatetime).add(30, 'seconds').toDate();
                                            AllEncounter[FemaleEncLen].AdmissionDate = TransDatetime;
                                            AllEncounter[FemaleEncLen].WardId = enc.FemaleWardId;
                                            AllEncounter[FemaleEncLen].DepartmentId = enc.DepartmentId;
                                            AllEncounter[FemaleEncLen].VisitTypeId = $scope.currentcontext.VisitTypeId;
                                            $scope.DummyVisitInfo[totalcount] = AllEncounter[FemaleEncLen];
                                            enc.ValFemaleVisitCount--;
                                            totalcount--;
                                            femalecompeleted = 1;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            console.log($scope.DummyVisitInfo);

        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.Encounter = [];
            $scope.item = {};
            $scope.TotActVisitCount = 0;
            $scope.TotDmyVisitCount = 0;
            $scope.TotMaleVisitCount = 0;
            $scope.TotFemaleVisitCount = 0;
            $scope.TotFinalVisitCount = 0;
            $timeout(function () {
                $scope.getList();
            }, 1000);
        };

        $scope.FetchingChanged = function () {
            $scope.LoadOldInfo = 0;
        }

        $scope.checkMandatory = function () {
            var fromdt = $filter('date')($scope.currentcontext.AdmissionDate, 'yyyy-MM-dd');
            var todt = $filter('date')($scope.currentcontext.AdmissionToDate, 'yyyy-MM-dd');
            var today = new Date();
            var transdate = $filter('date')($scope.currentcontext.TransactionDate, 'yyyy-MM-dd');
            if (transdate == fromdt) {
                var msg = "Transaction Date should not same as Fetch From Date";
                utl.Alert.showErrorMsg(msg);
                return false;
            }
            if (transdate == todt) {
                var msg = "Transaction Date should not same as Fetch To Date";
                utl.Alert.showErrorMsg(msg);
                return false;
            }
            if ($scope.currentcontext.TransactionDate > today) {
                var msg = "Transaction date should not be a future date";
                utl.Alert.showErrorMsg(msg);
                return false;
            }
            var totaldummycount = 0;
            for (var idx in $scope.Encounter) {
                var enc = $scope.Encounter[idx];
                var deptId = enc.DepartmentId || 0;
                var visitcount = 0;
                var visitmalecount = 0;
                var visitfemalecount = 0;
                var dummyvisitcount = 0;
                var malevisitcount = 0;
                var femalevisitcount = 0;
                var totalvisitcount = 0;
                try {
                    visitcount = parseInt(enc.DepartmentCount);
                } catch (ex) {
                    visitcount = 0;
                }
                try {
                    visitmalecount = parseInt(enc.DepartmentMaleCount);
                } catch (ex) {
                    visitmalecount = 0;
                }
                try {
                    visitfemalecount = parseInt(enc.DepartmentFeMaleCount);
                } catch (ex) {
                    visitfemalecount = 0;
                }

                try {
                    dummyvisitcount = parseInt(enc.DummyVisitCount);
                } catch (ex) {
                    dummyvisitcount = 0;
                }
                try {
                    malevisitcount = parseInt(enc.MaleVisitCount);
                } catch (ex) {
                    malevisitcount = 0;
                }
                try {
                    femalevisitcount = parseInt(enc.FemaleVisitCount);
                } catch (ex) {
                    femalevisitcount = 0;
                }
                try {
                    totalvisitcount = parseInt(enc.TotalVisitCount);
                } catch (ex) {
                    totalvisitcount = 0;
                }

                if (deptId && dummyvisitcount > 0 && enc.Status == 1) {
                    totaldummycount += dummyvisitcount;
                    if (!dummyvisitcount || dummyvisitcount <= 0) {
                        var msg = enc.DepartmentName + " New Visit Count is Required";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if ((!malevisitcount || malevisitcount <= 0) && (!femalevisitcount || femalevisitcount <= 0)) {
                        var msg = enc.DepartmentName + " Male Visit Count OR Female Visit Count is Required";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if (malevisitcount && visitmalecount < malevisitcount) {
                        var msg = enc.DepartmentName + " Male Visit Count shoule not greater than Actual Male Count";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if (femalevisitcount && visitfemalecount < femalevisitcount) {
                        var msg = enc.DepartmentName + " Female Visit Count shoule not greater than Actual Female Count";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if (dummyvisitcount != (malevisitcount + femalevisitcount)) {
                        var msg = enc.DepartmentName + " New Visit Count Not Matched with Male and Female Count";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if (totalvisitcount != (visitcount + dummyvisitcount)) {
                        var msg = enc.DepartmentName + " Total Visit Count Not Matched with Visit Count and Dummy Visit Count";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    }
                }
            }

            if (!totaldummycount || totaldummycount <= 0) {
                var msg = "New Visit Count is Required";
                utl.Alert.showErrorMsg(msg);
                return false;
            }

            return true;
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            removeFloatingNav();
        };

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }, {
                        Key: 5,
                        Value: 2
                    }, {
                        Key: 9,
                        Value: true
                    }]
                }
            },
            {
                "Key": "Facility"
            },
            {
                "Key": "VisitType"
            },
            {
                "Key": "Remark",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }, {
                        Key: 5,
                        Value: 2
                    }]
                }
            }
            ];

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

    dummyOPVisitsController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$timeout', '$translate', 'utl', '$filter'];

})();