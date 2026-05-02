(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cathlabentryreportController', cathlabentryreportController);

    function cathlabentryreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            DoctorId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
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

        $scope.backtoReport = function () {
            if ($scope.Context == 'cathlabreport') {
                $state.go('app.cathlabreports');
            }
        };

        $scope.surgerydashboard = function () {
            $state.go('app.surgerydashboard');
        };

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Patient Name", "MRN", "Procedure Name", "Procedure2", "Procedure3", "Surgeon", "Anaesthesist Name", "Surgery Room", "Diagnosis", "Anaesthesist Type"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var patientName = '';
                var mrn = '';
                var procedureName = '';
                var procedure2 = '';
                var procedure3 = '';
                var surgeon = '';
                var anaesthesist = '';
                var surgery = '';
                var diagnosis = '';
                var AnaesthesistType = '';

                if (rowArray.SurgeryRegisteredOn) {
                    date = rowArray.SurgeryRegisteredOn;
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
                if (rowArray.Procedure2) {
                    if (rowArray.Procedure2.ProcedureName) {
                        procedureName = rowArray.Procedure2.ProcedureName;
                    }
                }
                if (rowArray.Procedure3) {
                    if (rowArray.Procedure3.ProcedureName) {
                        procedureName = rowArray.Procedure3.ProcedureName;
                    }
                }
                if (rowArray.ChiefSurgeon) {
                    if (rowArray.ChiefSurgeon.Title.Description) {
                        surgeon = rowArray.ChiefSurgeon.Title.Description;
                    }
                    if (rowArray.ChiefSurgeon.FirstName) {
                        surgeon += ' ' + rowArray.ChiefSurgeon.FirstName;
                    }
                    if (rowArray.ChiefSurgeon.LastName) {
                        surgeon += ' ' + rowArray.ChiefSurgeon.LastName;
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
                if (rowArray.SurgeryRoomMaster) {
                    if (rowArray.SurgeryRoomMaster.Name) {
                        surgery = rowArray.SurgeryRoomMaster.Name;
                    }
                }
                if (rowArray.PreDiagnosis) {
                    if (rowArray.PreDiagnosis.DiagnosisName) {
                        diagnosis = rowArray.PreDiagnosis.DiagnosisName;
                    }
                }
                if (rowArray.AnaesthesiaType.Description) {
                    AnaesthesistType = rowArray.AnaesthesiaType.Description;
                }
                csvContent += date + ',' + patientName + ',' + mrn + ',' + procedureName + ',' + procedure2 + ',' + procedure3 + ',' + surgeon + ',' + anaesthesist + ',' + surgery + ',' + diagnosis + ',' + AnaesthesistType + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'surgeryentry-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.ProcedureId
                    },
                    {
                        Key: 16,
                        Value: From
                    },
                    {
                        Key: 17,
                        Value: To
                    },
                    {
                        Key: 19,
                        Value: true
                    }
                ],

            };
            var options = {
                action: "OtManagement/SurgeryEntry/GetSurgeryEntrys",
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
            }
            if ($scope.currentfilter.DoctorId > 0) {
                if (res.Data[0].ChiefSurgeon.Title) {
                    $scope.DoctorName = res.Data[0].ChiefSurgeon.Title.Description;
                }
                if (res.Data[0].ChiefSurgeon.FirstName) {
                    $scope.DoctorName += res.Data[0].ChiefSurgeon.FirstName;
                }
                if (res.Data[0].ChiefSurgeon.LastName) {
                    $scope.DoctorName += res.Data[0].ChiefSurgeon.LastName;
                }
            }
            if ($scope.currentfilter.ProcedureId > 0) {
                if (res.Data.length > 0) {
                    $scope.ProcedureName = item.Procedure.ProcedureName;
                }
            } else {
                $scope.ProcedureName = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.ProcedureId
                    },
                    {
                        Key: 16,
                        Value: From
                    },
                    {
                        Key: 17,
                        Value: To
                    },
                    {
                        Key: 19,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.Context == 'surgery') {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.pid
                })
            }
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    Surgeon: $scope.DoctorName,
                    ProcedureName: $scope.ProcedureName
                },
                Params: [{
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.ProcedureId
                    },
                    {
                        Key: 16,
                        Value: From
                    },
                    {
                        Key: 17,
                        Value: To
                    },
                    {
                        Key: 19,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/PrintSurgeryEntryReport',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doDownload(options);
        };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "SurgeryRegisteredOn",
                    displayName: $translate.instant('reports.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.SurgeryRegisteredOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.SurgeryRegisteredOn| date: 'HH:mm'}}</span>" + "</div>"
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
                    field: "Procedure2.ProcedureName",
                    displayName: $translate.instant('Procedure2')
                },
                {
                    field: "Procedure3.ProcedureName",
                    displayName: $translate.instant('Procedure3')
                },
                {
                    field: "Doctor Name",
                    displayName: $translate.instant('reports.surgeon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.ChiefSurgeon.Title && entity.ChiefSurgeon.Title.Description'>{{entity.ChiefSurgeon.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.ChiefSurgeon.FirstName}}</span>&nbsp;<span>{{entity.ChiefSurgeon.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "Anaesthesist",
                    displayName: $translate.instant('reports.anaesthesist.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ entity.Anaesthesist.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Anaesthesist.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Anaesthesist.LastName}}</span>' + '</div>'
                },
                {
                    field: "SurgeryRoomMaster.Name",
                    displayName: $translate.instant('reports.otroom.lbl')
                },
                {
                    field: "SurgeryStartedate",
                    displayName: $translate.instant('Start Date')
                },
                {
                    field: "SurgeryEndDate",
                    displayName: $translate.instant('End Date')
                },
                {
                    field: "PreDiagnosis.DiagnosisName",
                    displayName: $translate.instant('reports.diagnosis.lbl')
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

    cathlabentryreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();