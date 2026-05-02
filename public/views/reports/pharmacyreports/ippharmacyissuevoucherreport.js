(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPPharmacyIssueVoucherReportController', IPPharmacyIssueVoucherReportController);

    function IPPharmacyIssueVoucherReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Bill Date", "Bill Number", "Patient Name", "Visit Number", "Doctor Name", "Room Details", "Bill Amount", "Issued By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var billDate = '';
                var billnum = '';
                var patName = '';
                var visitNum = '';
                var docName = '';
                var room = '';
                var billAmt = '';
                var issueed = '';

                if (rowArray.BillDateTime) {
                    //  = rowArray.BillDateTime;
                    // billdate = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                    billDate = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.BillNumber) {
                    billnum = rowArray.BillNumber;
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
                    if (rowArray.Patient.MRN) {
                        patName += ' ' + rowArray.Patient.MRN;
                    }
                }
                if (rowArray.Encounter.VisitIdentifier) {
                    visitNum = rowArray.Encounter.VisitIdentifier;
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
                if (rowArray.WardMaster) {
                    if (rowArray.WardMaster.WardName) {
                        room = rowArray.WardMaster.WardName;
                    }
                    if (rowArray.WardRoomMaster.RoomNo) {
                        room += ' ' + rowArray.WardRoomMaster.RoomNo;
                    }
                    if (rowArray.WardRoomBedMaster.BedNo) {
                        room += ' ' + rowArray.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.BillAmount) {
                    billAmt = rowArray.BillAmount;
                }
                if (rowArray.CreatedUser) {
                    if (rowArray.CreatedUser.Title) {
                        if (rowArray.CreatedUser.Title.Description) {
                            issueed = rowArray.CreatedUser.Title.Description;
                        }
                    }
                    if (rowArray.CreatedUser.FirstName) {
                        issueed += ' ' + rowArray.CreatedUser.FirstName;
                    }
                    if (rowArray.CreatedUser.LastName) {
                        issueed += ' ' + rowArray.CreatedUser.LastName;
                    }
                }
                csvContent += billDate + ',' + billnum + ',' + patName + ',' + visitNum + ',' + docName + ',' + room + ',' + billAmt + ',' + issueed + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'ippharmacyissuevoucher-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalBillAmt = 0;
                $scope.TotalGSTAmt = 0;
                $scope.TotalCGSTAmt = 0;
                $scope.TotalSGSTAmt = 0;
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
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 58,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: 3
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 22,
                    Value: 6
                },
                {
                    Key: 57,
                    Value: $scope.currentfilter.patientname
                }
                ],

            };
            var options = {
                action: "billing/patientbills/GetPatientBills",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalbillamount = 0;
            var totalgst = 0;
            var totalcgst = 0;
            var totalsgst = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.StoreMaster.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.WardId > 0) {
                    $scope.WardName = item.WardMaster.WardName;
                }
                else {
                    $scope.WardName = '';
                }
                totalbillamount = totalbillamount + (item.BillAmount);
                totalgst = totalgst + (item.GSTAmount);
                totalcgst = totalcgst + (item.CGstAmount);
                totalsgst = totalsgst + (item.SGstAmount);
                vm.gridConfig.data.push(item);
            }
            $scope.TotalBillAmt = totalbillamount;
            $scope.TotalGST = totalgst;
            $scope.TotalCGST = totalcgst;
            $scope.TotalSGST = totalsgst;
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
                $scope.TotalBillAmt = 0;
                $scope.TotalGSTAmt = 0;
                $scope.TotalCGSTAmt = 0;
                $scope.TotalSGSTAmt = 0;
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
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 58,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: 3
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 22,
                    Value: 6
                },
                {
                    Key: 57,
                    Value: $scope.currentfilter.patientname
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientbills/GetPatientBills',
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
            if ($scope.Context == 'invoicecollectionreport') {
                $state.go('app.pharmacytabreport.invoicecollectionreport');
            } if ($scope.Context == 'pharmacyreport') {
                $state.go('app.financereporttab.pharmacyreport');
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
                    StoreName: $scope.StoreName,
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
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 6,
                    Value: 3
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 22,
                    Value: 6
                },
                {
                    Key: 58,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 57,
                    Value: $scope.currentfilter.patientname
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintIPPharmacyIssueReport',
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
                field: "idx", displayName: $translate.instant('S.No'),
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
                field: "Patient Name",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}&nbsp/<span>{{entity.Patient.MRN}}</span>\
                                        </div>"
            },
            {
                field: "Encounter.VisitIdentifier",
                displayName: $translate.instant('reports.opvisitnum.lbl')
            },
            {
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}\
                                        </div>"
            },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('reports.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}} </span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "BillAmount",
                displayName: $translate.instant('reports.billamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"

            },
            {
                field: "Issued Name",
                displayName: $translate.instant('reports.issuedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}\
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
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
                "Key": "UserStores",
                Default: false,
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                }
            },
            {
                "Key": "Ward"
            }]
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

    IPPharmacyIssueVoucherReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();