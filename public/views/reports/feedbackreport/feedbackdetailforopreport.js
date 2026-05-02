(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FeedbackdetailforOPReportController', FeedbackdetailforOPReportController);

    function FeedbackdetailforOPReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Visit Date", "Visit Number", "Patient Name", "MRN", "Doctor Name", "Address", "Mobile", "Payer Name", "Department", "OP BillAmt", "Pharmacy BillAmt"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var visitDate = '';
                var visitNum = '';
                var patname = '';
                var mrn = '';
                var docName = '';
                var address = '';
                var mobile = '';
                var insurence = '';
                var dept = '';
                var opbillamt = '';
                var pharbillamt = '';

                if (rowArray.AdmissionDate) {
                    visitDate = rowArray.AdmissionDate;
                }
                if (rowArray.VisitIdentifier) {
                    visitNum = rowArray.VisitIdentifier;
                }
                if (rowArray.Patient.Title.Description) {
                    patname = rowArray.Patient.Title.Description;
                }
                if (rowArray.Patient.FirstName) {
                    patname += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patname += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.Doctor.Title.Description) {
                    docName = rowArray.Doctor.Title.Description;
                }
                if (rowArray.Doctor.FirstName) {
                    docName += ' ' + rowArray.Doctor.FirstName;
                }
                if (rowArray.Doctor.LastName) {
                    docName += ' ' + rowArray.Doctor.LastName;
                }
                if (rowArray.Patient.AddressLine2) {
                    address = rowArray.Patient.AddressLine2;
                }
                if (rowArray.Patient.AddressLine1) {
                    address += ' ' + rowArray.Patient.AddressLine1;
                }
                if (rowArray.Patient.Mobile) {
                    mobile = rowArray.Patient.Mobile;
                }
                if (rowArray.Guarantor.GuarantorName) {
                    insurence = rowArray.Guarantor.GuarantorName;
                }
                if (rowArray.Department.DepartmentName) {
                    dept = rowArray.Department.DepartmentName;
                }
                if (rowArray.OPBillAmount) {
                    opbillamt = rowArray.OPBillAmount;
                }
                if (rowArray.PharmacyBillAmount) {
                    pharbillamt = rowArray.PharmacyBillAmount;
                }

                csvContent += visitDate + ',' + visitNum + ',' + patname + ',' + mrn + ',' + docName + ',' + address + ',' + mobile + ',' + insurence + ',' + dept + ',' + opbillamt + ',' + pharbillamt + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'outpatient-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 54,
                        Value: $scope.currentfilter.VisitTypeId
                    },
                    {
                        Key: 68,
                        Value: $scope.currentfilter.PatientTypeId
                    },
                    {
                        Key: 15,
                        Value: [1, 4]
                    },
                    // {
                    //     Key: 14,
                    //     Value: 1
                    // },
                    // {
                    //     Key: 52,
                    //     Value: true
                    // },
                    {
                        Key: 64,
                        Value: true
                    },
                ],

            };
            var options = {
                action: "Visit/Visit/GetEncounters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            // for (var idx in res.Data) {
            //     var item = res.Data[idx]; 
            //     vm.gridConfig.data.push(item);
            // }  
            $scope.DoctorName = '';
            if ($scope.currentfilter.DoctorId > 0) {
                if (res.Data[0].Doctor.Title)
                    $scope.DoctorName = res.Data[0].Doctor.Title.Description;
                if (res.Data[0].Doctor.FirstName)
                    $scope.DoctorName += res.Data[0].Doctor.FirstName;
                if (res.Data[0].Doctor.LastName)
                    $scope.DoctorName += res.Data[0].Doctor.LastName;
            }
            if ($scope.currentfilter.GuarantorId > 0) {
                $scope.GuarantorName = res.Data[0].Guarantor.GuarantorName;
            } else {
                $scope.GuarantorName = '';
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 54,
                        Value: $scope.currentfilter.VisitTypeId
                    },
                    {
                        Key: 68,
                        Value: $scope.currentfilter.PatientTypeId
                    },
                    {
                        Key: 15,
                        Value: [1, 4]
                    },
                    // {
                    //     Key: 14,
                    //     Value: 1
                    // },
                    // {
                    //     Key: 52,
                    //     Value: true
                    // },
                    {
                        Key: 64,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/PatientFeedbackDetails/GetPatientFeedbackDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.feedbackreports');
        };


        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    DoctorName: $scope.DoctorName,
                    GuarantorName: $scope.GuarantorName

                },
                Params: [{
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 54,
                        Value: $scope.currentfilter.VisitTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 54,
                        Value: $scope.currentfilter.VisitTypeId
                    },
                    {
                        Key: 68,
                        Value: $scope.currentfilter.PatientTypeId
                    },
                    {
                        Key: 15,
                        Value: [1, 4]
                    },
                    // {
                    //     Key: 14,
                    //     Value: 1
                    // },
                    // {
                    //     Key: 52,
                    //     Value: true
                    // },
                    {
                        Key: 64,
                        Value: true
                    },
                ],
            };
            var options = {
                action: 'Visit/Visit/PrintOutPatientReport',
                data: inputData,
                type: 'post'
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
                    field: "AdmissionDate",
                    displayName: $translate.instant('reports.visit.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "VisitIdentifier",
                    displayName: $translate.instant('reports.opvisitnum.lbl')
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('reports.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>&nbsp;/<span>{{entity.Patient.MRN}}</span>&nbsp;/<span>{{entity.Patient.Age}}</span>&nbsp;/<span>{{entity.Patient.Gender.Description}}</span></a></div>"
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('reports.mrn.lbl')
                },
                {
                    field: "Age",
                    displayName: $translate.instant('reports.age.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                           <span>{{entity.Patient.Age}}</span>&nbsp;/<span>{{entity.Patient.Gender.Description}}</span>\
                                     </div>"
                },

                {
                    field: "FirstName",
                    displayName: $translate.instant('Address'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span>{{entity.Patient.AddressLine1}}</span>&nbsp;<span>{{entity.Patient.AddressLine2}}</span>\
                 </div>"
                },
                {
                    field: "Patient.Mobile",
                    displayName: $translate.instant('Mobile')
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('reports.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                 </div>"
                },
                // {
                //     field: "Guarantor.GuarantorName",
                //     displayName: $translate.instant('reports.insurance.lbl')
                // },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('reports.dep.lbl')
                },
                {
                    field: "Patient.Remark.Remarks",
                    displayName: $translate.instant('reports.reason.lbl')
                },
                {
                    field: "OPBillAmount",
                    displayName: $translate.instant('OP BillAmt')
                },
                {
                    field: "PharmacyBillAmount",
                    displayName: $translate.instant('Pharmacy BillAmt')
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
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
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
                    "Key": "VisitType"
                },
                {
                    "Key": "PatientType"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
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

    FeedbackdetailforOPReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();