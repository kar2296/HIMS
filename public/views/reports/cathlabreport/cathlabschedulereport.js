(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cathlabschedulereportController', cathlabschedulereportController);

    function cathlabschedulereportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            DoctorId: -1,

        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        }
        $scope.CanShowPrint = false;

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Patient Name", "MRN", "Procedure Name", "Surgeon", "Anaesthesist Name", "Surgery Room", "Diagnosis", "Anaesthesist Type"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var patientName = '';
                var mrn = '';
                var procedureName = '';
                var surgeon = '';
                var anaesthesist = '';
                var surgery = '';
                var diagnosis = '';
                var AnaesthesistType = '';

                if (rowArray.OTScheduledOn) {
                    date = rowArray.OTScheduledOn;
                }
                if (rowArray.Patient.Title.Description) {
                    patientName = rowArray.Patient.Title.Description;
                }
                if (rowArray.Patient.FirstName) {
                    patientName += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patientName += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.Procedure) {
                    if (rowArray.Procedure.ProcedureName) {
                        procedureName = rowArray.Procedure.ProcedureName;
                    }
                }
                if (rowArray.Doctor) {
                    if (rowArray.Doctor.Title.Description) {
                        surgeon = rowArray.Doctor.Title.Description;
                    }
                    if (rowArray.Doctor.FirstName) {
                        surgeon += ' ' + rowArray.Doctor.FirstName;
                    }
                    if (rowArray.Doctor.LastName) {
                        surgeon += ' ' + rowArray.Doctor.LastName;
                    }
                }
                if (rowArray.Anaesthesist) {
                    if (rowArray.Anaesthesist.Title.Description) {
                        anaesthesist = rowArray.Anaesthesist.Title.Description;
                    }
                    if (rowArray.Anaesthesist.FirstName) {
                        anaesthesist += ' ' + rowArray.Anaesthesist.FirstName;
                    }
                    if (rowArray.Anaesthesist.LastName) {
                        anaesthesist += ' ' + rowArray.Anaesthesist.LastName;
                    }
                }
                if (rowArray.OTRoom) {
                    if (rowArray.OTRoom.Description) {
                        surgery = rowArray.OTRoom.Description;
                    }
                }
                if (rowArray.Diagnosis) {
                    if (rowArray.Diagnosis.DiagnosisName) {
                        diagnosis = rowArray.Diagnosis.DiagnosisName;
                    }
                }
                if (rowArray.AnaesthesiaType.Description) {
                    AnaesthesistType = rowArray.AnaesthesiaType.Description;
                }
                csvContent += date + ',' + patientName + ',' + mrn + ',' + procedureName + ',' + surgeon + ',' + anaesthesist + ',' + surgery + ',' + diagnosis + ',' + AnaesthesistType + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'otschedule-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            $scope.CanShowPrint = false;
            var inputData = {
                Params: [{
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 18,
                        Value: true
                    },
                ],

            };
            var options = {
                action: "OtManagement/OtSchedule/GetOtSchedules",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;

                if ($scope.currentfilter.DoctorId > 0) {
                    if (res.Data[0].Doctor.Title) {
                        $scope.DoctorName = res.Data[0].Doctor.Title.Description;
                    }
                    if (res.Data[0].Doctor.FirstName) {
                        $scope.DoctorName += res.Data[0].Doctor.FirstName;
                    }
                    if (res.Data[0].Doctor.LastName) {
                        $scope.DoctorName += res.Data[0].Doctor.LastName;
                    }
                }
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            $scope.CanShowPrint = false;
            var inputData = {
                Params: [
                    // { Key: 17, Value: $scope.currentfilter.OTRoomId },
                    // { Key: 2, Value: $scope.currentfilter.OTScheduleStatusId },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 18,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'surgery') {
                inputData.Params.push({
                    Key: 6,
                    Value: $scope.currentcontext.pid
                });
            }
            var options = {
                action: 'OtManagement/OtSchedule/GetCathlabSchedule',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'cathlabreport') {
                $state.go('app.cathlabreports');
            }
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
            }
        };

        $scope.surgerydashboard = function () {
            $state.go('app.surgerydashboard');
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "OTScheduledOn",
                    displayName: $translate.instant('reports.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OTScheduledOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.OTScheduledOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Patient Name",
                    displayName: $translate.instant('reports.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('reports.mrn.lbl')
                },
                {
                    field: "Procedure.ProcedureName",
                    displayName: $translate.instant('reports.procedure.lbl')
                },
                {
                    field: "Doctor Name",
                    displayName: $translate.instant('reports.surgeon.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ entity.Doctor.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Doctor.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Doctor.LastName}}</span>' + '</div>'
                },
                {
                    field: "Anaesthesist",
                    displayName: $translate.instant('reports.anaesthesist.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ entity.Anaesthesist.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Anaesthesist.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Anaesthesist.LastName}}</span>' + '</div>'
                },
                {
                    field: "OTRoom.Description",
                    displayName: $translate.instant('reports.otroom.lbl')
                },
                {
                    field: "Diagnosis.DiagnosisName",
                    displayName: $translate.instant('reports.diagnosis.lbl')
                },
                {
                    field: "StartTime",
                    displayName: $translate.instant('Start Time')
                },
                {
                    field: "EndTime",
                    displayName: $translate.instant('End Time')
                },
                {
                    field: "AnaesthesiaType.Description",
                    displayName: $translate.instant('reports.anaesthesist-type.lbl'),
                },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    Surgeon: $scope.DoctorName
                    // AdmissionStatus: $scope.AdmissionStatus2 

                },
                Params: [{
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 18,
                        Value: true
                    },
                ],
            };
            var options = {
                action: 'OtManagement/OtSchedule/PrintOtSchedulereport',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "OTScheduleStatus"
                },
                {
                    "Key": "Procedure"
                },
                {
                    'Key': 'Ward'
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "SurgeryType"
                },
                {
                    "Key": "Priority"
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "SurgeryRoom"
                },
                {
                    "Key": "Team"
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
            ];

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

    cathlabschedulereportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();