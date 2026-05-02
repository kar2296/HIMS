(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipinsurancereportController', ipinsurancereportController);

    function ipinsurancereportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["DOA", "IP Number", "Patient Name", "MRN", "Room Details", "Doctor Name", "Payer Name", "Bill Amount", "Bill Discount", "Paid Amount", "Due Amount", "Department"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var doa = '';
                var ipNum = '';
                var patName = '';
                var mrn = '';
                var room = '';
                var docName = '';
                var insurance = '';
                var billAmt = '';
                var billDis = '';
                var paidAmt = '';
                var dueAmt = '';
                var dept = '';

                if (rowArray.Encounter.AdmissionDate) {
                    // doa = rowArray.Encounter.AdmissionDate;
                    // doa = $filter('date')(rowArray.AdmissionDate, 'yyyy-MM-dd') || null;
                    doa = utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }
                if (rowArray.AdmissionDate) {
                    // doa += ' ' + rowArray.AdmissionDate;
                    // doa += ' ' + $filter('date')(rowArray.AdmissionDate, 'yyyy-MM-dd') || null;
                    doa += ' ' + utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }
                if (rowArray.Encounter.VisitIdentifier) {
                    ipNum = rowArray.Encounter.VisitIdentifier;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patName = rowArray.Patient.Title.Description;
                        }
                    }
                    if (rowArray.Patient.FirstName) {
                        patName += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patName += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.MRN) {
                        mrn = rowArray.Patient.MRN;
                    }
                }
                if (rowArray.WardMaster) {
                    if (rowArray.WardMaster.WardName) {
                        room = rowArray.WardMaster.WardName;
                    }
                }
                if (rowArray.WardRoomMaster) {
                    if (rowArray.WardRoomMaster.RoomNo) {
                        room += ' ' + rowArray.WardRoomMaster.RoomNo;
                    }
                }
                if (rowArray.WardRoomBedMaster) {
                    if (rowArray.WardRoomBedMaster.BedNo) {
                        room += ' ' + rowArray.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.User) {
                    if (rowArray.User.Title) {
                        if (rowArray.User.Title.Description) {
                            docName = rowArray.User.Title.Description;
                        }
                    }
                    if (rowArray.User.FirstName) {
                        docName += ' ' + rowArray.User.FirstName;
                    }
                    if (rowArray.User.LastName) {
                        docName += ' ' + rowArray.User.LastName;
                    }
                }
                if (rowArray.GuarantorName) {
                    insurance = rowArray.GuarantorName;
                }
                if (rowArray.BillAmount) {
                    billAmt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    billDis = rowArray.BillDiscount;
                }
                if (rowArray.PaidAmount) {
                    paidAmt = rowArray.PaidAmount;
                }
                if (rowArray.OutStandingAmount) {
                    dueAmt = rowArray.OutStandingAmount;
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        dept = rowArray.Department.DepartmentName;
                    }
                }

                csvContent += doa + ',' + ipNum + ',' + patName + ',' + mrn + ',' + room + ',' + docName + ',' + insurance + ',' + billAmt + ',' + billDis + ',' + paidAmt + ',' + dueAmt + ',' + dept + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'ipinsurance-reports.csv';
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
                Params: [
                    {
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 58,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 9,
                        Value: [2, 3]
                    },
                    {
                        Key: 45,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: 2
                    }
                ],

            };
            var options = {
                action: "billing/patientbills/GetPatientBillswithoutdetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            // vm.gridConfig.data = res.Data;
            var totalbillamount = 0;
            var totalbilldiscount = 0;
            var totalpaidamount = 0;
            var totaldueamount = 0;
            $scope.DoctorName = '';
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.DoctorId > 0) {
                    if (res.Data.length > 0) {
                        if (item.Doctor.Title)
                            $scope.DoctorName = item.Doctor.Title.Description;
                        if (item.Doctor.FirstName)
                            $scope.DoctorName += item.Doctor.FirstName;
                        if (item.Doctor.LastName)
                            $scope.DoctorName += item.Doctor.LastName;
                    }
                }
                if ($scope.currentfilter.WardId > 0) {
                    if (res.Data.length > 0) {
                        $scope.WardName = item.WardMaster.WardName;
                    }
                }
                else {
                    $scope.WardName = '';
                }
                if ($scope.currentfilter.GuarantorId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorName = item.GuarantorName;
                    }
                }
                else {
                    $scope.GuarantorName = '';
                }

                totalbillamount = totalbillamount + (item.BillAmount);
                totalbilldiscount = totalbilldiscount + (item.BillDiscount);
                totalpaidamount = totalpaidamount + (item.PaidAmount);
                totaldueamount = totaldueamount + (item.OutStandingAmount);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalBillAmt = totalbillamount;
            $scope.TotalDisAmt = totalbilldiscount;
            $scope.TotalPaidAmt = totalpaidamount;
            $scope.TotalDueAmt = totaldueamount;
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
                Params: [
                    {
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 58,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 9,
                        Value: [2, 3]
                    },
                    {
                        Key: 45,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientbills/GetPatientBillswithoutdetails',
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
            if ($scope.Context == 'ipinvoicebillingreport') {
                $state.go('app.billingreportstab.ipinvoicebillingreport');
            } if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
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
                    GuarantorName: $scope.GuarantorName

                },
                Params: [
                    {
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 58,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 9,
                        Value: [2, 3]
                    },
                    {
                        Key: 45,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintIPInsuranceReport',
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
                    "<span ng-if='entity.WardMaster'>{{entity.WardMaster.WardName}} </span>" +
                    "<span ng-if='entity.WardMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}</span>\
                 </div>"
            },
            {
                field: "GuarantorName",
                displayName: $translate.instant('reports.insurance.lbl')
            },
            {
                field: "BillAmount",
                displayName: $translate.instant('reports.billamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "BillDiscount",
                displayName: $translate.instant('reports.billdis.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PaidAmount",
                displayName: $translate.instant('reports.paidamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "OutStandingAmount",
                displayName: $translate.instant('reports.dueamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
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
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: utl.Session.getCurrentFacilityId()
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

    ipinsurancereportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();