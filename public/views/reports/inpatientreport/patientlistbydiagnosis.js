(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientlistbydiagnosisController', patientlistbydiagnosisController);

    function patientlistbydiagnosisController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["DOA", "IP Number", "Patient Name", "MRN", "Doctor Name", "Code", "ICD", "Diagnosis", "Room Details", "DOD", "Admission Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var doa = '';
                var ipNum = '';
                var patname = '';
                var mrn = '';
                var docName = '';
                var code = '';
                var version = '';
                var diagnosis = '';
                var room = '';
                var dod = '';
                var admission = '';

                if (rowArray.AdmissionDate) {
                    // doa = rowArray.AdmissionDate;
                    doa = utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }
                if (rowArray.VisitIdentifier) {
                    ipNum = rowArray.VisitIdentifier;
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
                if (rowArray.Diagnosis.Code) {
                    code = rowArray.Diagnosis.Code;
                }
                if (rowArray.Diagnosis.DiagnosisVersion.Description) {
                    version = rowArray.Diagnosis.DiagnosisVersion.Description;
                }
                if (rowArray.Diagnosis.DiagnosisName) {
                    diagnosis = rowArray.Diagnosis.DiagnosisName;
                }


                if (rowArray.WardMaster.WardName) {
                    room = rowArray.WardMaster.WardName;
                }
                if (rowArray.WardRoomMaster.RoomNo) {
                    room += ' ' + rowArray.WardRoomMaster.RoomNo;
                }
                if (rowArray.WardRoomBedMaster.BedNo) {
                    room += ' ' + rowArray.WardRoomBedMaster.BedNo;
                }
                if (rowArray.DischargeDate) {
                    // dod = rowArray.DischargeDate;
                    dod = utl.Formatter.getDateTimeString(rowArray.DischargeDate);
                }
                if (rowArray.AdmissionStatus.Description) {
                    admission = rowArray.AdmissionStatus.Description;
                }
                docName = docName.replace(/,/g, " ");
                docName = docName.replace(/ /g, " ");

                diagnosis = diagnosis.replace(/,/g, " ");
                diagnosis = diagnosis.replace(/ /g, " ");
                csvContent += doa + ',' + ipNum + ',' + patname + ',' + mrn + ',' + docName + ',' + code + ',' + version + ',' + diagnosis + ',' + room + ',' + dod + ',' + admission + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'patientlistbydiagnosis-report.csv';
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
                // {
                //     Key: 9,
                //     Value: $scope.currentfilter.DiagnosisId
                // },
                {
                    Key: 57,
                    Value: '0'
                },//only diagnosis
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: [2, 3, 4, 5, 6]
                }
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
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
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
                // {
                //     Key: 9,
                //     Value: $scope.currentfilter.DiagnosisId
                // },
                {
                    Key: 57,
                    Value: '0'
                },//only diagnosis
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: [2, 3, 4, 5, 6]
                },
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
                action: 'Visit/Visit/GetEncounters',
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
                $state.go('app.ipopreportstab.inpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
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
                    FacilityName: $scope.currentfilter.FacilityName,
                    DoctorName: $scope.DoctorName,
                    DiagnosisName: $scope.DiagnosisName,

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
                // {
                //     Key: 9,
                //     Value: $scope.currentfilter.DiagnosisId
                // },
                {
                    Key: 57,
                    Value: '0'
                },//only diagnosis
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: [2, 3, 4, 5, 6]
                },
                ],
            };
            var options = {
                action: 'Visit/Visit/PrintPatientListByDiagnosisReport',
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
                field: "AdmissionDate",
                displayName: $translate.instant('reports.doa.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "VisitIdentifier",
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
                field: "FirstName",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                 </div>"
            },
            {
                field: "Diagnosis.Code",
                displayName: $translate.instant('Code')
            },
            {
                field: "Diagnosis.DiagnosisVersion.Description",
                displayName: $translate.instant('ICD')
            },
            {
                field: "Diagnosis.DiagnosisName",
                displayName: $translate.instant('reports.diagnosis.lbl')
            },

            {
                field: "WardRoomMaster",
                displayName: $translate.instant('reports.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}}</span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}}</span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "DischargeDate",
                displayName: $translate.instant('reports.dod.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "AdmissionStatus.Description",
                displayName: $translate.instant('reports.admstatus.lbl')
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
                "Key": "Department"
            },
            {
                "Key": "AdmissionStatus"
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
            {
                "Key": "Ward"
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

    patientlistbydiagnosisController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();