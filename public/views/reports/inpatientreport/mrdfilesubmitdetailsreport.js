(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('mrdfilesubmitdetailsreportController', mrdfilesubmitdetailsreportController);

    function mrdfilesubmitdetailsreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Return Date", "Visit No", "Patient Name", "MRN", "Doctor Name", "Admission Date", "Discharge date ", "File Submitted Date","Submitted By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var ReturnDate = '';
                var VisitNo = '';
                var patname = '';
                var mrn = '';
                var docName = '';
                var AdmissionDate = '';
                var DischargeDate = '';
                var ReturnDate = '';
                var FirstName = '';

                if (rowArray.ReturnDate) {
                    ReturnDate = rowArray.ReturnDate;
                }
                if (rowArray.VisitNo) {
                    VisitNo = rowArray.VisitNo;
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
                if (rowArray.DoctorName) {
                    docName = rowArray.DoctorName;
                }
                if (rowArray.AdmissionDate) {
                    AdmissionDate = rowArray.AdmissionDate;
                }
		if (rowArray.DischargeDate) {
                    DischargeDate = rowArray.DischargeDate;
                }
                if (rowArray.ReturnDate) {
                    ReturnDate = rowArray.ReturnDate;
                }
              

 if (rowArray.ReturnedUser.Title.Description) {
    FirstName = rowArray.Patient.Title.Description;
}
if (rowArray.ReturnedUser.FirstName) {
    FirstName += ' ' + rowArray.ReturnedUser.FirstName;
}
if (rowArray.ReturnedUser.LastName) {
    FirstName += ' ' + rowArray.ReturnedUser.LastName;
}
                csvContent += ReturnDate + ',' + VisitNo + ',' + patname + ',' + mrn + ',' + docName + ',' + AdmissionDate + ',' + DischargeDate + ',' + ReturnDate + ',' + FirstName + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'mrdfilesubmitdetailsreport.csv';
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
                    Key: 6,
                    Value: 1
                },
                { Key: 9, Value: From },
                { Key: 10, Value: To },
                ],

            };
            var options = {
                action: 'IPManagement/MRDFiles/GetMRDFiless',
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            if ($scope.currentfilter.DiagnosisId > 0) {
                inputData.Params.push({
                    Key: 9,
                    Value: $scope.currentfilter.DiagnosisId
                });
            }       
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
            if ($scope.currentfilter.DiagnosisId > 0) {
                $scope.DiagnosisName = res.Data[0].Diagnosis.DiagnosisName;
            }
            else {
                $scope.DiagnosisName = '';
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
                    Key: 6,
                    Value: 1
                },
                { Key: 9, Value: From },
                { Key: 10, Value: To },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.DiagnosisId > 0) {
                inputData.Params.push({
                    Key: 9,
                    Value: $scope.currentfilter.DiagnosisId
                });
            }
            var options = {
                action: 'IPManagement/MRDFiles/GetMRDFiless',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.DiagnosisId = -1;
                $scope.getList();
            }
        };

        $scope.backtoReport = function () {
            if ($scope.Context == 'ipopreport') {
                $state.go('app.newreports');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.newreports');
            }
        };
        // $scope.backtoReport = function () {
        //     if ($scope.Context == 'ipopreport') {
        //         $state.go('app.ipopreportstab.inpatientreport');
        //     } else if ($scope.Context == 'billingreport') {
        //         $state.go('app.billingreportstab.ipinvoicebillingreport');
        //     } else if ($scope.Context == 'nursingreport') {
        //         $state.go('app.nursingreport');
        //     } else if ($scope.Context == 'doctorreport') {
        //         $state.go('app.doctorreport');
        //     }
        // };


        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: $scope.currentfilter.FacilityId,

                },
                Params: [{
                    Key: 6,
                    Value: 1
                },
                { Key: 9, Value: From },
                { Key: 10, Value: To },
                ],
            };
            var options = {
                action: 'IPManagement/MRDFiles/PrintMrdFileSubmittedReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "ReturnDate",
                displayName: $translate.instant('Return Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReturnDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReturnDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "VisitNo",
                displayName: $translate.instant('reports.visitnum.lbl')
            },
            {
                field: "FirstName",
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
                field: "DoctorName",
                displayName: $translate.instant('Doctor Name')
            },
            {
                field: "AdmissionDate",
                displayName: $translate.instant('Admission Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "DischargeDate",
                displayName: $translate.instant('Discharge Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
            },
          
            {
                field: "ReturnDate",
                displayName: $translate.instant('File Submitted Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReturnDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReturnDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "FirstName",
                displayName: $translate.instant('Submitted By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.ReturnedUser.Title && entity.ReturnedUser.Title.Description'>{{entity.ReturnedUser.Title.Description}}&nbsp;</span>\
                <span>{{entity.ReturnedUser.FirstName}}</span>&nbsp;<span>{{entity.ReturnedUser.LastName}}</span>\
                 </div>"
            },

            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
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
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')' + selectedItem.Version].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
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
                item.Version = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },]
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

    mrdfilesubmitdetailsreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();