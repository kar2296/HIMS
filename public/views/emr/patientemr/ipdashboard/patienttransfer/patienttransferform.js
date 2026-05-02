(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientTransferController', patientTransferController);

    function patientTransferController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {};
        $scope.item = {
            EncounterId: utl.Session.getEncounterId(),
            TransRefDischargeTypeId: -1,
            TransferDate: new Date(),
            StartTime: new Date(),
            AdmissionDepartmentId: -1,
            AdmissionWardId: -1,
            ReferralDeptartmentId: -1,
            DeptartmentComments: '',
            FacilityDeptartmentId: -1,
            FromFcilityId: utl.Session.getCurrentFacilityId(),
            FromDepartmentId: utl.Session.getCurrentDepartmentId(),
            FacilityId: -1,
            FacilityComments: '',
            ReferOtherFacilityId: -1,
            ReferOtherDepartmentId: -1,
            ReferOtherComments: '',
            DischargeComments: '',
        };

        $scope.patienttrasnferinfo = [];
        $scope.lookup = {};
        if ($scope.item.EncounterId)
            $scope.currentcontext.eid = $scope.item.EncounterId;

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
        }

        $scope.currentcontext.encountertypeid = 1;
        if ($scope.currentcontext.encounter &&
            $scope.currentcontext.encounter.EncounterTypeId)
            $scope.currentcontext.encountertypeid = $scope.currentcontext.encounter.EncounterTypeId;

        if (!$scope.currentcontext.encountertypeid)
            $scope.currentcontext.encountertypeid = 1;

        $scope.item.PatientId = $scope.currentcontext.pid;


        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.patienttrasnferinfo = res.Data;
            // if (res && res.Data &&
            //     res.Data.length > 0) {
            //     $scope.item = res.Data[0];
            //     if ($scope.item.TransferDate) {
            //         var start = $scope.item.TransferDate;
            //         $scope.item.StartTime = utl.Formatter.getTimeString24Hour(start);
            //     }
            // }
        };

        $scope.getList = function () {
            $scope.patienttrasnferinfo = [];
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.pid },
                    ],
                    PageContext: {
                        PageSize: 5,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/PatientTransfer/GetPatientTransfers',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.viewPatientTransfer = function (item) {
            utl.Modal.openFixedDialog('app.patienttransferview', {
                params: {
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    item: item,
                    encountertypeid: $scope.currentcontext.encountertypeid,
                }
            });
        }

        $scope.selectTypeId = function (typeid) {
            $scope.item.TransRefDischargeTypeId = typeid.Id;
        }


        $scope.clearItem = function () {
            $scope.setDischargetype();
            $scope.item = {};
            $scope.item.PatientId = $scope.currentcontext.pid;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            $scope.item.TransRefDischargeTypeId = -1;
            $scope.item.TransferDate = new Date();
            $scope.item.StartTime = new Date();
            $scope.item.FacilityId = -1;
            $scope.item.ReferOtherFacilityId = -1;
            $('#FacilityId').val("");
            $('#ReferOtherFacilityId').val("");
        }

        $scope.saveAndApprove = function () {

            try {
                var dateval = moment($scope.item.TransferDate).format("YYYY-MM-DD");
                var timeval = moment($scope.item.StartTime).format("HH:mm");
                $scope.item.TransferDate = moment(dateval + ' ' + timeval).toDate();
            } catch (ex) { $scope.item.StartTime = ''; }

            if (!$scope.item.TransferDate) {
                utl.Alert.showErrorMsg('TransferDate is required');
                return;
            }
            if (!$scope.item.StartTime) {
                utl.Alert.showErrorMsg('Time is required');
                return;
            }

            var actionName = 'emr/PatientTransfer/AddPatientTransfer';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PatientTransfer/UpdatePatientTransfer';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.clearItem();
            $scope.patient_dashboard();
        };

        $scope.setDischargetype = function () {
            for (var idx in $scope.lookup.TransRefDischargeType) {
                var type = $scope.lookup.TransRefDischargeType[idx];
                type.status = 0;
            }
        };

        $scope.getOtherFacilityDept = function (FacilityId) {
            $scope.loadCommonDept();
            if (FacilityId) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: FacilityId }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                }
                var options = {
                    action: 'SystemSettings/facility/GetDepartments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getUserFacilityDeptListCallback
                }
                utl.Http.doAction(options);
            }
        };

        $scope.getUserFacilityDeptListCallback = function (scope, res, options, hasError) {
            for (var idx in res) {
                var dept = res[idx];
                if (dept.DepartmentTypeId == 1) {
                    var deptObj = utl.Lookup.getObject($scope.lookup.Department, dept.DepartmentId);
                    var isExist = 0;
                    for (var exst in $scope.lookup.CurtDepartment) {
                        var dataitm = $scope.lookup.CurtDepartment[exst];
                        if (dataitm.Id == deptObj.Id) {
                            isExist = 1;
                            break;
                        }
                    }
                    if (isExist == 0 && deptObj.Id) {
                        $scope.lookup.CurtDepartment.push(deptObj);
                    }
                }
            }
        };

        $scope.getreferdept = function () {
            if ($scope.item.ReferOtherDepartmentId > 0
                && $scope.item.ReferOtherFacilityId > 0) {
                $scope.item.ReferralDeptartmentId = -1;
                $scope.item.FacilityDeptartmentId = -1;
                $scope.item.AdmissionDepartmentId = -1;
                $scope.getOtherFacilityDept($scope.item.ReferOtherFacilityId);
            } else {
                $scope.item.ReferOtherDepartmentId = -1;
                $scope.getOtherFacilityDept(utl.Session.getCurrentFacilityId());
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getOtherFacilityDept(utl.Session.getCurrentFacilityId());
            $scope.getList();
        };


        vm.facilityitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Facility Code', field: 'FacilityCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Facility Name', field: 'FacilityName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/Facility/GetFacilitys',
            formatdisplay: formatselectedfacilityitem,
            presearch: presearchfacilityitem,
            postsearch: postsearchfacilityitem
        };

        function formatselectedfacilityitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.facilityitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.FacilityName;
                // [selectedItem.FacilityName, selectedItem.FacilityCode].join(' ');
            } else if (vm.facilityitemcontrolconfig.rowdata) {
                result = vm.facilityitemcontrolconfig.rowdata.FacilityName;
                // [vm.facilityitemcontrolconfig.rowdata.FacilityName, vm.facilityitemcontrolconfig.rowdata.FacilityCode].join(' ');
            }
            $scope.item.FacilityCode = selectedItem.FacilityCode;
            $scope.item.FacilityName = selectedItem.FacilityName;
            return result;
        }


        function presearchfacilityitem() {
            var query = vm.facilityitemcontrolconfig.query;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [
                    { Key: 4, Value: true }
                ],
                PageContext: { PageSize: 500, PageNumber: 1 }
            };

            if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.facilityitemcontrolconfig.searchparams = inputData;
        }

        function postsearchfacilityitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.facilityitemcontrolconfig.result) {
                var item = vm.facilityitemcontrolconfig.result[idx];
                $scope.item.FacilityCode = item.FacilityCode;
                $scope.item.FacilityName = item.FacilityName;
            }
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "TransRefDischargeType", Default: false },
                { "Key": "Department" },
                {
                    "Key": "Ward",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId() || null
                        },
                        {
                            Key: 3,
                            Value: 2
                        },
                        {
                            Key: 7,
                            Value: 1
                        },
                        ]
                    }
                },
            ];
            $scope.getLookUp(inputData);
        };
        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();

        $scope.loadCommonDept = function () {
            $scope.lookup.CurtDepartment = [];
            var deptdata = {
                Id: -1,
                Text: "Please Select"
            };
            $scope.lookup.CurtDepartment.push(deptdata);
            for (var idx in $scope.lookup.Department) {
                var deptitem = $scope.lookup.Department[idx];
                if (deptitem && deptitem.DepartmentTypeId == 1
                    && deptitem.InstitutionFilterId == 1) {
                    $scope.lookup.CurtDepartment.push(deptitem);
                }
            }
        }



    }

    patientTransferController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();