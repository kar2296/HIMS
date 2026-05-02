(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPPharmacyReturnVoucherReportController', IPPharmacyReturnVoucherReportController);

    function IPPharmacyReturnVoucherReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
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
            const JsonFields = ["Return Date", "Return Number", "Patient Name", "MRN", "Visit Number", "Doctor Name", "Room Details", "Return Amount", "Return Discount", "Issued By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var returnDate = '';
                var returnNum = '';
                var patName = '';
                var mrn = '';
                var visitNum = '';
                var docName = '';
                var room = '';
                var returnAmt = '';
                var returnDis = '';
                var issueed = '';

                if (rowArray.ReturnDateTime) {
                    // returnDate = rowArray.ReturnDateTime;
                    // returnDate = $filter('date')(rowArray.ReturnDateTime, 'yyyy-MM-dd') || null;
                    returnDate = utl.Formatter.getDateTimeString(rowArray.ReturnDateTime);
                }
                if (rowArray.BillDateTime) {
                    // returnDate += ' ' + rowArray.BillDateTime;
                    // returnDate += ' ' + $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                    returnDate += ' ' + utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.ReturnNumber) {
                    returnNum = rowArray.ReturnNumber;
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
                        mrn = rowArray.Patient.MRN;
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
                if (rowArray.Encounter.WardMaster) {
                    if (rowArray.Encounter.WardMaster.WardName) {
                        room = rowArray.Encounter.WardMaster.WardName;
                    }
                    if (rowArray.Encounter.WardRoomMaster.RoomNo) {
                        room += ' ' + rowArray.Encounter.WardRoomMaster.RoomNo;
                    }
                    if (rowArray.Encounter.WardRoomBedMaster.BedNo) {
                        room += ' ' + rowArray.Encounter.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.ReturnAmount) {
                    returnAmt = rowArray.ReturnAmount;
                }
                if (rowArray.DiscountAmount) {
                    returnDis = rowArray.DiscountAmount;
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
                docName = docName.replace(/,/g, " ");
                docName = docName.replace(/ /g, " ");
                csvContent += returnDate + ',' + returnNum + ',' + patName + ',' + mrn + ',' + visitNum + ',' + docName + ',' + room + ',' + returnAmt + ',' + returnDis + ',' + issueed + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'ippharmacyreturnvoucher-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalRetAmt = 0;
                $scope.TotalDisAmt = 0;
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
                    Key: 24,
                    Value: From
                },
                {
                    Key: 25,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 27,
                    Value: 2
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.patientname
                }
                ],

            };
            var options = {
                action: "billing/patientreturns/GetPatientReturns",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalreturnamount = 0;
            var totaldiscount = 0;
            var totalgstamount = 0;
            var totalcgstamount = 0;
            var totalsgstamount = 0;
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
                totalreturnamount = totalreturnamount + (item.ReturnAmount);
                totaldiscount = totaldiscount + (item.DiscountAmount);
                totalgstamount = totalgstamount + (item.GstAmount);
                totalcgstamount = totalcgstamount + (item.CGstAmount);
                totalsgstamount = totalsgstamount + (item.SGstAmount);
                vm.gridConfig.data.push(item);
            }
            $scope.TotalRetAmt = totalreturnamount;
            $scope.TotalDisAmt = totaldiscount;
            $scope.TotalGSTAmt = totalgstamount;
            $scope.TotalCGSTAmt = totalcgstamount;
            $scope.TotalSGSTAmt = totalsgstamount;

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
                $scope.TotalRetAmt = 0;
                $scope.TotalDisAmt = 0;
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
                    Key: 24,
                    Value: From
                },
                {
                    Key: 25,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 27,
                    Value: 2
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.patientname
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
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
                    Key: 24,
                    Value: From
                },
                {
                    Key: 25,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 27,
                    Value: 2
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.patientname
                },
                ],
            };
            var options = {
                action: 'billing/patientreturns/PrintIPPharmacyReturnReport',
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
                field: "ReturnDateTime",
                displayName: $translate.instant('reports.returndate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReturnDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "ReturnNumber",
                displayName: $translate.instant('reports.returnno.lbl')
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
                    "<span ng-if='entity.Encounter.WardRoomMaster'>{{entity.Encounter.WardMaster.WardName}} </span>" +
                    "<span ng-if='entity.Encounter.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.Encounter.WardRoomMaster'>{{entity.Encounter.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.Encounter.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.Encounter.WardRoomBedMaster'>{{entity.Encounter.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "ReturnAmount",
                displayName: $translate.instant('reports.returnamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ReturnAmount | displaycurrency}}</span>" + "</div>"

            },
            {
                field: "DiscountAmount",
                displayName: $translate.instant('reports.returndis.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DiscountAmount | displaycurrency}}</span>" + "</div>"
            },
            // {
            //     field: "NetAmount",
            //     displayName: $translate.instant('reports.netamt.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
            // }, 

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

    IPPharmacyReturnVoucherReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();