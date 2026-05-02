(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dummyIPVisitsController', dummyIPVisitsController);

    function dummyIPVisitsController($rootScope, $scope, $stateParams, $state, $timeout, $translate, utl, $filter) {
        var vm = this;
        $scope.AllEncounterByDeptGender = {};
        $scope.DummyVisitInfo = {};
        $scope.Encounter = [];
        $scope.LoadFromFollowUp = 0;
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            AdmissionTypeId: 1,
            VisitTypeId: 1,
            AdmissionDate: utl.Formatter.getCurrentDate(),
            AdmissionToDate: utl.Formatter.getCurrentDate(),
            TransactionDate: utl.Formatter.getCurrentDate(),
        };
        $scope.item = {};
        $scope.TotActVisitCount = 0;
        $scope.TotDmyVisitCount = 0;
        $scope.TotMaleVisitCount = 0;
        $scope.TotFemaleVisitCount = 0;
        $scope.TotFinalVisitCount = 0;


        $scope.getFollowUpList = function () {
            $scope.LoadFromFollowUp = 1;
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
                    {
                        Key: 50,
                        Value: true
                    },
                    {
                        Key: 54,
                        Value: $scope.currentcontext.VisitTypeId
                    },
                ],
                Data: {
                    frmdt: fromdt
                },
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
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
                onComplete: $scope.getFollowUpListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getFollowUpListCallback = function (scope, res, options, hasError) {
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
                                if (deptinfo.GenderId && deptinfo.GenderId == 1) Disabledfemale = true;
                                if (deptinfo.GenderId && deptinfo.GenderId == 2) Disabledmale = true;
                                break;
                            }
                        }
                    }

                    var onlydept = 0;
                    for (var idxw in $scope.lookup.Ward) {
                        var wardinfo = $scope.lookup.Ward[idxw];
                        if (depid && wardinfo.DepartmentId &&
                            wardinfo.DepartmentId == depid) {
                            onlydept = 1;
                            break;
                        }
                    }

                    var MaleWardInfo = [];
                    var FemaleWardInfo = [];
                    for (var idxw in $scope.lookup.Ward) {
                        var wardinfo = $scope.lookup.Ward[idxw];
                        if (onlydept) {
                            if (wardinfo.Id == -1) { // Please Select
                                MaleWardInfo.push(wardinfo);
                                FemaleWardInfo.push(wardinfo);
                            }
                            if (wardinfo.DepartmentId && wardinfo.DepartmentId == depid &&
                                wardinfo.GenderId) { // Gender && Department
                                if (wardinfo.GenderId == 1) MaleWardInfo.push(wardinfo);
                                if (wardinfo.GenderId == 2) FemaleWardInfo.push(wardinfo);
                            } else if (!wardinfo.GenderId && wardinfo.DepartmentId &&
                                wardinfo.DepartmentId == depid) { // No Gender && Department
                                MaleWardInfo.push(wardinfo);
                                FemaleWardInfo.push(wardinfo);
                            }
                        } else {
                            if (wardinfo.DepartmentId && wardinfo.DepartmentId == depid &&
                                wardinfo.GenderId) { // Gender && Department
                                if (wardinfo.GenderId == 1) MaleWardInfo.push(wardinfo);
                                if (wardinfo.GenderId == 2) FemaleWardInfo.push(wardinfo);
                            } else if (!wardinfo.DepartmentId &&
                                wardinfo.GenderId) { // Gender && No Department
                                if (wardinfo.GenderId == 1) MaleWardInfo.push(wardinfo);
                                if (wardinfo.GenderId == 2) FemaleWardInfo.push(wardinfo);
                            } else if (!wardinfo.GenderId && wardinfo.DepartmentId &&
                                wardinfo.DepartmentId == depid) { // No Gender && Department
                                MaleWardInfo.push(wardinfo);
                                FemaleWardInfo.push(wardinfo);
                            } else if (!wardinfo.DepartmentId &&
                                !wardinfo.GenderId) { // No Gender && No Department
                                MaleWardInfo.push(wardinfo);
                                FemaleWardInfo.push(wardinfo);
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
                            MaleWard: MaleWardInfo,
                            FemaleWard: FemaleWardInfo,
                            MaleWardId: -1,
                            FemaleWardId: -1,
                            MaleAvailableBeds: 0,
                            FemaleAvailableBeds: 0,
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
            $scope.LoadFromFollowUp = 0;
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
                        Value: 2 // IP
                    }

                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
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
            }
            if (Encounter && Encounter.length > 0) {
                var Encounter_Dept_Group = groupByMulti(Encounter, ['DepartmentId']);
                $scope.EncounterDept = Encounter_Dept_Group;
                for (var idx in $scope.EncounterDept) {
                    var depid = -1;
                    try {
                        depid = parseInt(idx);
                    } catch (ex) {
                        depid = -1;
                    }
                    var encounterinfo = $scope.EncounterDept[idx];
                    var DeptMaleCount = 0;
                    var DeptFemaleCount = 0;
                    for (var idx in encounterinfo) {
                        var patdata = encounterinfo[idx].Patient;
                        if (patdata.GenderId == 1) // Male
                            DeptMaleCount++;
                        else if (patdata.GenderId == 2) // FeMale
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
                        MaleWard: [],
                        FemaleWard: [],
                        MaleWardId: -1,
                        FemaleWardId: -1,
                        MaleAvailableBeds: 0,
                        FemaleAvailableBeds: 0,
                        Status: 1,
                        disabledmale: false,
                        disabledfemale: false,
                    };
                    $scope.Encounter.push(encdata);
                }
            }

            for (var didx in $scope.lookup.Department) {
                var deptinfo = $scope.lookup.Department[didx];
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
                            MaleWard: [],
                            FemaleWard: [],
                            MaleWardId: -1,
                            FemaleWardId: -1,
                            MaleAvailableBeds: 0,
                            FemaleAvailableBeds: 0,
                            Status: 1,
                            disabledmale: false,
                            disabledfemale: false,
                        };
                        $scope.Encounter.push(depdata);
                    }
                }
            }
            $scope.CalFullTotalCount();
        };

        $scope.onSelectedMaleWard = function (enc, selectedItem, idx) {
            if (selectedItem.Id) {
                var inputData = {
                    Params: [{
                            Key: 0,
                            Value: enc.MaleWardId
                        },
                        {
                            Key: 6,
                            Value: true
                        }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    },
                    enc: enc,
                };
                var options = {
                    action: 'generalmaster/WardMaster/GetWardMasters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAvailableMaleBedsCallBack
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getAvailableMaleBedsCallBack = function (scope, res, options, hasError) {
            if (options && options.data && options.data.enc) {
                options.data.enc.MaleAvailableBeds = 0;
                if (res && res.Data) {
                    for (var idx in res.Data) {
                        var wardinfo = res.Data[idx]
                        if (wardinfo && wardinfo.AvailableBeds) {
                            options.data.enc.MaleAvailableBeds += wardinfo.AvailableBeds;
                        }
                    }
                }
            }
        }

        $scope.onSelectedFemaleWard = function (enc, selectedItem, idx) {
            if (selectedItem.Id) {
                var inputData = {
                    Params: [{
                            Key: 0,
                            Value: enc.FemaleWardId
                        },
                        {
                            Key: 6,
                            Value: true
                        }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    },
                    enc: enc,
                };
                var options = {
                    action: 'generalmaster/WardMaster/GetWardMasters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAvailableFemaleBedsCallBack
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getAvailableFemaleBedsCallBack = function (scope, res, options, hasError) {
            if (options && options.data && options.data.enc) {
                options.data.enc.FemaleAvailableBeds = 0;
                if (res && res.Data) {
                    for (var idx in res.Data) {
                        var wardinfo = res.Data[idx]
                        if (wardinfo && wardinfo.AvailableBeds) {
                            options.data.enc.FemaleAvailableBeds += wardinfo.AvailableBeds;
                        }
                    }
                }
            }
        }

        $scope.getWardAvailableBeds = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 6,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/WardMaster/GetWardMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWardAvailableBedsCallBack
            };

            utl.Http.doAction(options);
        };

        $scope.getWardAvailableBedsCallBack = function (scope, res, options, hasError) {
            $scope.lookup["Ward"] = [];
            $scope.lookup["Ward"] = res.Data;
            var pleaseselect = {
                Id: -1,
                WardName: "Please Select"
            };
            $scope.lookup["Ward"].push(pleaseselect);
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
            if ($scope.LoadFromFollowUp == 0) {
                var msg = "Load from followup";
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

                $scope.ProcessPatientInfo();

                $scope.DummyIPVisitInfo = [];
                for (var idx in $scope.DummyVisitInfo) {
                    $scope.DummyIPVisitInfo.push($scope.DummyVisitInfo[idx]);
                }

                $scope.DummyIPVisitInfo.sort($scope.custom_sort);

                if ($scope.DummyIPVisitInfo && $scope.DummyIPVisitInfo.length) {
                    var actionName = 'registration/patient/DummyIPVisitCreation';
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.DummyIPVisitInfo
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
            $scope.LoadFromFollowUp = 0;
            var totalcount = 0;
            for (var ctidx in $scope.Encounter) {
                var enc = $scope.Encounter[ctidx];
                try {
                    totalcount += parseInt(enc.DummyVisitCount);
                } catch (ex) {}
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
            $scope.LoadFromFollowUp = 0;
        }

        $scope.checkMandatory = function () {

            var today = new Date();
            if ($scope.currentcontext.TransactionDate > today) {
                var msg = "Transaction date should not greater than current date";
                utl.Alert.showErrorMsg(msg);
                return false;
            }

            var fromdt = $filter('date')($scope.currentcontext.AdmissionDate, 'yyyy-MM-dd');
            var todt = $filter('date')($scope.currentcontext.AdmissionToDate, 'yyyy-MM-dd');
            var trasdt = $filter('date')($scope.currentcontext.TransactionDate, 'yyyy-MM-dd');

            if (fromdt != trasdt) {
                var msg = "Transaction date should be equal to From date";
                utl.Alert.showErrorMsg(msg);
                return false;
            }

            if (todt != trasdt) {
                var msg = "Transaction date should be equal to To date";
                utl.Alert.showErrorMsg(msg);
                return false;
            }

            var totaldummycount = 0;
            var WardExist = {};
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
                var malebedcount = 0;
                var femalebedcount = 0;

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
                    malebedcount = parseInt(enc.MaleAvailableBeds);
                } catch (ex) {
                    malebedcount = 0;
                }

                try {
                    femalebedcount = parseInt(enc.FemaleAvailableBeds);
                } catch (ex) {
                    femalebedcount = 0;
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
                    } else if (malevisitcount && (!enc.MaleWardId || enc.MaleWardId <= 0)) {
                        var msg = enc.DepartmentName + " Male Ward Information is required";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if (femalevisitcount && (!enc.FemaleWardId || enc.FemaleWardId <= 0)) {
                        var msg = enc.DepartmentName + " Female Ward Information is required";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if (malevisitcount && (malevisitcount > malebedcount)) {
                        var msg = enc.DepartmentName + " Male visit count should not greater than Male Bed Count";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    } else if (femalevisitcount && (femalevisitcount > femalebedcount)) {
                        var msg = enc.DepartmentName + " Female visit count should not greater than Female Bed Count";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    }
                    if (enc.MaleWardId > 0 && !WardExist[enc.MaleWardId]) {
                        WardExist[enc.MaleWardId] = enc.MaleWardId;
                    } else if (WardExist[enc.MaleWardId]) {
                        var msg = enc.DepartmentName + " Male Ward Info. Already Exist, change the ward info. ";
                        utl.Alert.showErrorMsg(msg);
                        return false;
                    }
                    if (enc.FemaleWardId > 0 && !WardExist[enc.FemaleWardId]) {
                        WardExist[enc.FemaleWardId] = enc.FemaleWardId;
                    } else if (WardExist[enc.FemaleWardId]) {
                        var msg = enc.DepartmentName + " Female Ward Info. Already Exist, change the ward info.  ";
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
            $scope.getWardAvailableBeds();
            $scope.getList();
            removeFloatingNav();
        };

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
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
                    "Key": "AdmissionType"
                }, 
                {
                    "Key": "VisitType"
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

    dummyIPVisitsController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$timeout', '$translate', 'utl', '$filter'];

})();