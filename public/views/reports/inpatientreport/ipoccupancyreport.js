(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPOccupancyReportController', IPOccupancyReportController);

    function IPOccupancyReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            DoctorId: -1,
            WardId: -1,
            AdmissionStatusId: -1,
            GuarantorId: -1,

        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.lookup = {};
        $scope.AdmsnLookup = [];
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["DOA", "IP Number", "Patient Name", "MRN", "Room Details", "Doctor Name", "Payer Name", "Department", "Admission Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var admdate = '';
                var visitno = '';
                var patname = '';
                var mrn = '';
                var ward = '';
                var docname = '';
                var insurance = '';
                var dept = '';
                var admstatus = '';
                if (rowArray.AdmissionDate) {
                    // admdate = rowArray.AdmissionDate;
                    // admdate = $filter('date')(rowArray.AdmissionDate, 'yyyy-MM-dd HH:MM:ss') || null;
                    admdate = utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }
                if (rowArray.Encounter.VisitIdentifier) {
                    visitno = rowArray.Encounter.VisitIdentifier;
                }
                if (rowArray.Patient.Title.Description) {
                    patname += ' ' + rowArray.Patient.Title.Description;
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
                if (rowArray.WardMaster.WardName) {
                    ward += ' ' + rowArray.WardMaster.WardName;
                }
                if (rowArray.WardRoomMaster.RoomNo) {
                    ward += ' ' + rowArray.WardRoomMaster.RoomNo;
                }
                if (rowArray.WardRoomBedMaster.BedNo) {
                    ward += ' ' + rowArray.WardRoomBedMaster.BedNo;
                }
                if (rowArray.Doctor.Title.Description) {
                    docname += ' ' + rowArray.Doctor.Title.Description;
                }
                if (rowArray.Doctor.FirstName) {
                    docname += ' ' + rowArray.Doctor.FirstName;
                }
                if (rowArray.Doctor.LastName) {
                    docname += ' ' + rowArray.Doctor.LastName;
                }
                if (rowArray.Encounter.Guarantor.GuarantorName) {
                    insurance = rowArray.Encounter.Guarantor.GuarantorName;
                }
                if (rowArray.Encounter.Department.DepartmentName) {
                    dept = rowArray.Encounter.Department.DepartmentName;
                }
                if (rowArray.Encounter.AdmissionStatus.Description) {
                    admstatus = rowArray.Encounter.AdmissionStatus.Description;
                }
                docname = docname.replace(/,/g, " ");
                docname = docname.replace(/ /g, " ");

                insurance = insurance.replace(/,/g, " ");
                insurance = insurance.replace(/ /g, " ");

                dept = dept.replace(/,/g, " ");
                dept = dept.replace(/ /g, " ");
                csvContent += admdate + ',' + visitno + ',' + patname + ',' + mrn + ',' + ward + ',' + docname + ',' + insurance + ',' + dept + ',' + admstatus + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'ipoccupancyreport.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [{
                    Key: 10,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 2,
                    Value: 1
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.FacilityId
                },
                    // {
                    //     Key: 6,
                    //     Value: [2, 3, 4, 5]
                    // },
                ],

            };
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1){
                inputData.Params.push({
                    Key: 6,
                    Value: [2, 3, 4, 5]
                })}
                if ($scope.currentfilter.AdmissionStatusId>0){
                    inputData.Params.push({
                        Key: 6,
                        Value: $scope.currentfilter.AdmissionStatusId
                    })}
            var options = {
                action: "IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.DoctorName = '';
            if ($scope.currentfilter.DoctorId > 0) {
                if (res.Data[0].Doctor.Title)
                    $scope.DoctorName = res.Data[0].Doctor.Title.Description;
                if (res.Data[0].Doctor.FirstName)
                    $scope.DoctorName += res.Data[0].Doctor.FirstName;
                if (res.Data[0].Doctor.LastName)
                    $scope.DoctorName += res.Data[0].Doctor.LastName;
            }
            if ($scope.currentfilter.WardId > 0) {
                $scope.WardName = res.Data[0].WardMaster.WardName;
            } else {
                $scope.WardName = '';
            }
            if ($scope.currentfilter.GuarantorId > 0) {
                $scope.GuarantorName = res.Data[0].Encounter.Guarantor.GuarantorName;
            } else {
                $scope.GuarantorName = '';
            }
            if ($scope.currentfilter.AdmissionStatusId > 0) {
                $scope.AdmissionStatus = res.Data[0].Encounter.AdmissionStatus.Description;
            } else {
                $scope.AdmissionStatus = '';
            }


            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 10,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 2,
                    Value: 1
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.FacilityId
                },
                    // {
                    //     Key: 6,
                    //     Value: [2, 3, 4, 5]
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1){
                inputData.Params.push({
                    Key: 6,
                    Value: [2, 3, 4, 5]
                })}
                if ($scope.currentfilter.AdmissionStatusId>0){
                    inputData.Params.push({
                        Key: 6,
                        Value: $scope.currentfilter.AdmissionStatusId
                    })}
            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
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
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            }
            if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            }
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
            }
            if ($scope.Context == 'nursingreport') {
                $state.go('app.nursingreport');
            }

        };


        $scope.print = function () {
            var inputData = {
                Data: {
                    DoctorName: $scope.DoctorName,
                    WardName: $scope.WardName,
                    GuarantorName: $scope.GuarantorName,
                    AdmissionStatus: $scope.AdmissionStatus

                },
                Params: [{
                    Key: 10,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 2,
                    Value: 1
                },
                    // {
                    //     Key: 6,
                    //     Value: [2, 3, 4, 5]
                    // },
                    // {
                    //     Key: 6,
                    //     Value: "2,3,4,5,"
                    // }
                ],
            };
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1){
                inputData.Params.push({
                    Key: 6,
                    Value: [2, 3, 4, 5]
                })}
                if ($scope.currentfilter.AdmissionStatusId>0){
                    inputData.Params.push({
                        Key: 6,
                        Value: $scope.currentfilter.AdmissionStatusId
                    })}
            var options = {
                action: 'IPManagement/BedOccupancyHistory/PrintBedOccupancyHistorys',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx",
                displayName: $translate.instant('S.Nos'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "Encounter.AdmissionDate",
                displayName: $translate.instant('reports.doa.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Encounter.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "Encounter.VisitIdentifier",
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
                field: "WardRoomMaster",
                displayName: $translate.instant('reports.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}}&nbsp;</span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}}&nbsp;</span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
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
                field: "Encounter.Guarantor.GuarantorName",
                displayName: $translate.instant('reports.insurance.lbl')
            },
            {
                field: "Encounter.Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "Encounter.AdmissionStatus.Description",
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'AdmissionStatus') {
                    for (var sx in $scope.lookup.AdmissionStatus) {
                        var admsn = $scope.lookup.AdmissionStatus[sx];
                        if (admsn.Id != 1 && admsn.Id != 6 && admsn.Id != 7) {
                            $scope.AdmsnLookup.push(admsn);
                        }
                    }
                }
            });
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

    IPOccupancyReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();