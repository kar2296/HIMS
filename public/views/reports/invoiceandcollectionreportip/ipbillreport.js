(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillReportController', IPBillReportController);

    function IPBillReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Bill Date", "Bill Number", "DOA", "DOD", "Visit NO", "MRN",
                "Patient Name", "Doctor Name", "Payer", "Department", "Room Details",
                "Bill Amount", "Bill Discount", "Net Amount", "Paid Amount", "Due Amount", "Refund Amount",
                "To Be Refund Amount", "TDS Amount", "Disallowed Amount"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var billdate = '';
                var billno = '';
                var visitno = '';
                var doa = '';
                var dod = '';
                var mrn = '';
                var patname = '';
                var docname = '';
                var insurance = '';
                var dept = '';
                var ward = '';
                var billamt = '';
                var netamt = '';
                var paidamt = '';
                var billdis = '';
                var OutStandingAmount = '';
                var RefundAmount = '';
                var ToBeRefunded = '';
                var TDSAmount = '';
                var Disallowed = '';
                if (rowArray.BillDateTime) {
                    // billdate = rowArray.BillDateTime;
                    // billdate = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                    billdate = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.BillNumber) {
                    billno = rowArray.BillNumber;
                }
                if (rowArray.Encounter.VisitIdentifier) {
                    visitno = rowArray.Encounter.VisitIdentifier;
                }
                if (rowArray.Encounter.AdmissionDate) {
                    doa = rowArray.Encounter.AdmissionDate;
                }
                if (rowArray.Encounter.DischargeDate) {
                    dod = rowArray.Encounter.DischargeDate;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.MRN) {
                        mrn = rowArray.Patient.MRN;
                    }
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patname = rowArray.Patient.Title.Description;
                        }
                    }
                    if (rowArray.Patient.FirstName) {
                        patname += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patname += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.User) {
                    if (rowArray.User.Title) {
                        if (rowArray.User.Title.Description) {
                            docname += ' ' + rowArray.User.Title.Description;
                        }
                    }
                    if (rowArray.User.FirstName) {
                        docname += ' ' + rowArray.User.FirstName;
                    }
                    if (rowArray.User.LastName) {
                        docname += ' ' + rowArray.User.LastName;
                    }
                }
                if (rowArray.GuarantorName) {
                    insurance = rowArray.GuarantorName;
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        dept = rowArray.Department.DepartmentName;
                    }
                }
                if (rowArray.WardMaster) {
                    if (rowArray.WardMaster.WardName) {
                        ward += ' ' + rowArray.WardMaster.WardName;
                    }
                    if (rowArray.WardRoomBedMaster.WardRoomMaster.RoomNo) {
                        ward += ' ' + rowArray.WardRoomBedMaster.WardRoomMaster.RoomNo;
                    }
                    if (rowArray.WardRoomBedMaster.BedNo) {
                        ward += ' ' + rowArray.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.BillAmount) {
                    billamt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    billdis = rowArray.BillDiscount || 0;
                }
                if (rowArray.BillAmount) {
                    netamt = rowArray.BillAmount - rowArray.BillDiscount;
                }
                if (rowArray.PaidAmount) {
                    paidamt = rowArray.PaidAmount || 0;
                }
                if (rowArray.OutStandingAmount) {
                    OutStandingAmount = rowArray.OutStandingAmount || 0;
                }
                if (rowArray.RefundAmount) {
                    RefundAmount = rowArray.RefundAmount || 0;
                }
                if (rowArray.ToBeRefunded) {
                    ToBeRefunded = rowArray.ToBeRefunded || 0;
                }
                if (rowArray.TDSAmount) {
                    TDSAmount = rowArray.TDSAmount || 0;
                }
                if (rowArray.Disallowed) {
                    Disallowed = rowArray.Disallowed || 0;
                }
                docname = docname.replace(/,/g, " ");
                docname = docname.replace(/ /g, " ");

                dept = dept.replace(/,/g, " ");
                dept = dept.replace(/ /g, " ");

                ward = ward.replace(/,/g, " ");
                ward = ward.replace(/ /g, " ");


                csvContent += billdate + ',' + billno + ',' + doa + ',' + dod + ','
                    + visitno + ',' + mrn + ',' + patname + ',' + docname + ',' + insurance + ',' + dept + ','
                    + ward + ',' + billamt + ',' + billdis + ',' + netamt + ',' + paidamt + ',' + OutStandingAmount + ','
                    + RefundAmount + ',' + ToBeRefunded + ',' + TDSAmount + ',' + Disallowed + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'ipbillreport.csv';
            hiddenElement.click();

        };
        $scope.excelDownload = function () {
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
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 58,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 4,
                    Value: 3
                },
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }

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
            var totalbillamount = 0;
            var totalbilldiscount = 0;
            var totalnetamount = 0;
            var totalpaidamount = 0;
            var totaldueamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.DoctorId > 0) {
                    if (item.User.Title)
                        $scope.DoctorName = item.User.Title.Description;
                    if (item.User.FirstName)
                        $scope.DoctorName += ' ' + item.User.FirstName;
                    if (item.User.LastName)
                        $scope.DoctorName += ' ' + item.User.LastName;
                } else {
                    $scope.DoctorName = '';
                }
                if ($scope.currentfilter.GuarantorId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorName = item.Guarantor.GuarantorName;
                    }
                } else {
                    $scope.GuarantorName = '';
                }
                if ($scope.currentfilter.WardId > 0) {
                    $scope.WardName = item.WardMaster.WardName;
                } else {
                    $scope.WardName = '';
                }
                if ($scope.currentfilter.DepartmentId > 0) {
                    if (res.Data.length > 0) {
                        $scope.DepartmentName = item.Department.DepartmentName;
                    }
                } else {
                    $scope.DepartmentName = '';
                }
                totalbillamount = totalbillamount + (item.BillAmount);
                totalbilldiscount = totalbilldiscount + (item.BillDiscount);
                item.NetAmount = parseInt(item.BillAmount) - parseInt(item.BillDiscount);
                totalnetamount = totalnetamount + (item.NetAmount);
                totalpaidamount = totalpaidamount + (item.PaidAmount);
                totaldueamount = totaldueamount + (item.OutStandingAmount);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalBillAmt = totalbillamount;
            $scope.TotalDisAmt = totalbilldiscount;
            $scope.TotalNetAmt = totalnetamount;
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
                $scope.TotalBillAmt = 0;
                $scope.TotalDisAmt = 0;
                $scope.TotalNetAmt = 0;
                $scope.TotalPaidAmt = 0;
                $scope.TotalDueAmt = 0;
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
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 58,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 4,
                    Value: 3
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
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
            }
            if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
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
                    GuarantorName: $scope.GuarantorName,
                    WardName: $scope.WardName
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
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 58,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 4,
                    Value: 3
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintIPBillReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "BillDateTime",
                displayName: $translate.instant('reports.billdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "BillNumber",
                displayName: $translate.instant('reports.billno.lbl')
            },
            {
                field: "Encounter.AdmissionDate",
                displayName: $translate.instant('DOA'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Encounter.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.Encounter.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "Encounter.DischargeDate",
                displayName: $translate.instant('DOD'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Encounter.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.Encounter.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "Encounter.VisitIdentifier",
                displayName: $translate.instant('Visit No')
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('MRN')
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
                field: "Doctor Name",
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
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('reports.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.WardMaster'>{{entity.WardMaster.WardName}} </span>" +
                    "<span ng-if='entity.WardRoomBedMaster.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster.WardRoomMaster'>{{entity.WardRoomBedMaster.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.WardRoomBedMaster.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
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
                field: "NetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
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
                field: "RefundAmount",
                displayName: $translate.instant('Refund Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RefundAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "ToBeRefunded",
                displayName: $translate.instant('To Be Refund Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ToBeRefunded | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "TDSAmount",
                displayName: $translate.instant('TDS Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TDSAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Disallowed",
                displayName: $translate.instant('Disallowance Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Disallowed | displaycurrency}}</span>" + "</div>"
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
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "Ward"
            },
            {
                "Key": "Department"
            }
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

    IPBillReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();