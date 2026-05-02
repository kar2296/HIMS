(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPDischargeReportController', IPDischargeReportController);

    function IPDischargeReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["DOA", "DOD", "IP Number", "Patient Name", "MRN", "Room Details", "Doctor Name", "Payer Name", "Department", "Referral", "Discharge Type"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var admdate = '';
                var discharge = '';
                var visitno = '';
                var patname = '';
                var mrn = '';
                var ward = '';
                var docname = '';
                var insurance = '';
                var dept = '';
                var referral = '';
                var dischargetype = '';
                if (rowArray.AdmissionDate) {
                    // admdate = rowArray.AdmissionDate;
                    admdate = utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }
                if (rowArray.DischargeDate) {
                    // discharge = rowArray.DischargeDate;
                    // discharge = $filter('date')(rowArray.DischargeDate, 'yyyy-MM-dd HH:MM:ss') || null;
                    discharge = utl.Formatter.getDateTimeString(rowArray.DischargeDate);
                }
                if (rowArray.VisitIdentifier) {
                    visitno = rowArray.VisitIdentifier;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patname += ' ' + rowArray.Patient.Title.Description;
                        }
                    }
                    if (rowArray.Patient.FirstName) {
                        patname += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patname += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.MRN) {
                        mrn = rowArray.Patient.MRN;
                    }
                }
                if (rowArray.WardMaster) {
                    if (rowArray.WardMaster.WardName) {
                        ward += ' ' + rowArray.WardMaster.WardName;
                    }
                }
                if (rowArray.WardRoomMaster) {
                    if (rowArray.WardRoomMaster.RoomNo) {
                        ward += ' ' + rowArray.WardRoomMaster.RoomNo;
                    }
                }
                if (rowArray.WardRoomBedMaster) {
                    if (rowArray.WardRoomBedMaster.BedNo) {
                        ward += ' ' + rowArray.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.Doctor) {
                    if (rowArray.Doctor.Title) {
                        if (rowArray.Doctor.Title.Description) {
                            docname += ' ' + rowArray.Doctor.Title.Description;
                        }
                    }
                    if (rowArray.Doctor.FirstName) {
                        docname += ' ' + rowArray.Doctor.FirstName;
                    }
                    if (rowArray.Doctor.LastName) {
                        docname += ' ' + rowArray.Doctor.LastName;
                    }
                }
                if (rowArray.Guarantor) {
                    if (rowArray.Guarantor.GuarantorName) {
                        insurance = rowArray.Guarantor.GuarantorName;
                    }
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        dept = rowArray.Department.DepartmentName;
                    }
                }
                if (rowArray.Referral) {
                    if (rowArray.Referral.ReferralName) {
                        referral = rowArray.Referral.ReferralName;
                    }
                }
                if (rowArray.DischargeType) {
                    if (rowArray.DischargeType.Description) {
                        dischargetype = rowArray.DischargeType.Description;
                    }
                }
                docname = docname.replace(/,/g, " ");
                docname = docname.replace(/ /g, " ");

                dept = dept.replace(/,/g, " ");
                dept = dept.replace(/ /g, " ");

                referral = referral.replace(/,/g, " ");
                referral = referral.replace(/ /g, " ");
                csvContent += admdate + ',' + discharge + ',' + visitno + ',' + patname + ',' + mrn + ',' + ward + ',' + docname + ',' + insurance + ',' + dept + ',' + referral + ',' + dischargetype + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'ipdischargereport.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 28,
                    Value: From
                },
                {
                    Key: 29,
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
                    Key: 2,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: 6
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
            if ($scope.currentfilter.WardId > 0) {
                $scope.WardName = res.Data[0].WardMaster.WardName;
            } else {
                $scope.WardName = '';
            }
            if ($scope.currentfilter.GuarantorId > 0) {
                $scope.GuarantorName = res.Data[0].Guarantor.GuarantorName;
            } else {
                $scope.GuarantorName = '';
            }
            if ($scope.currentfilter.DischargeTypeId > 0) {
                $scope.DischargeType = res.Data[0].DischargeType.Description;
            } else {
                $scope.DischargeType = '';
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
                    Key: 28,
                    Value: From
                },
                {
                    Key: 29,
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
                    Key: 2,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: 6
                },
                {
                    Key: 27,
                    Value: $scope.currentfilter.DischargeTypeId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

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
                $scope.getList();
            }
        };
        // $scope.backtoReport = function () {
        //     if ($scope.Context == 'ipopreport') {
        //         $state.go('app.ipopreportstab.inpatientreport');
        //     }
        //     if ($scope.Context == 'billingreport') {
        //         $state.go('app.billingreportstab.ipinvoicebillingreport');
        //     } else if($scope.Context == 'doctorreport') {
        //         $state.go('app.doctorreport');
        //     } else if($scope.Context == 'nursingreport') {
        //         $state.go('app.nursingreport');
        //     }
        // };


        $scope.backtoReport = function () {
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            }
            if ($scope.Context == 'ipinvoicebillingreport') {
                $state.go('app.billingreportstab.ipinvoicebillingreport');
            }
            if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
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
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    DoctorName: $scope.DoctorName,
                    WardName: $scope.WardName,
                    GuarantorName: $scope.GuarantorName,
                    DischargeType: $scope.DischargeType

                },
                Params: [{
                    Key: 28,
                    Value: From
                },
                {
                    Key: 29,
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
                    Key: 2,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: 6
                },
                {
                    Key: 27,
                    Value: $scope.currentfilter.DischargeTypeId
                },
                ],
            };
            var options = {
                action: 'Visit/Visit/PrintIPDischargeReport',
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
                displayName: $translate.instant('reports.doa.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "DischargeDate",
                displayName: $translate.instant('reports.dod.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
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
                field: "Guarantor.GuarantorName",
                displayName: $translate.instant('reports.insurance.lbl')
            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "Referral.ReferralName",
                displayName: $translate.instant('Referral')
            },
            {
                field: "DischargeType.Description",
                displayName: $translate.instant('DischargeType')
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
                "Key": "DischargeType"
            },
            {
                "Key": "Department"
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

    IPDischargeReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();