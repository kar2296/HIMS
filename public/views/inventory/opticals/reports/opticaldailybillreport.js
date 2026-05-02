(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalDailybillReportController', OpticalDailybillReportController);

    function OpticalDailybillReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = [" Bill Date", "Bill Number", "Patient Name", "Doctor", "Bill Amount", "Bill Discount", "Net Amount", "Paid Amount", "Due Amount"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var billdate = '';
                var billno = '';
                var patname = '';
                var docname = '';
                var billamt = '';
                var billdis = '';
                var netamt = '';
                var paidamt = '';
                var dueAmt = '';

                if (rowArray.BillDateTime) {
                    billdate = rowArray.BillDateTime;
                }
                if (rowArray.BillNumber) {
                    billno = rowArray.BillNumber;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title.Description) {
                        patname = rowArray.Patient.Title.Description;
                    }
                    if (rowArray.Patient.FirstName) {
                        patname += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patname += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.UserDoctor) {
                    if (rowArray.UserDoctor.Title.Description) {
                        docname = rowArray.UserDoctor.Title.Description;
                    }
                    if (rowArray.UserDoctor.FirstName) {
                        docname += ' ' + rowArray.UserDoctor.FirstName;
                    }
                    if (rowArray.UserDoctor.LastName) {
                        docname += ' ' + rowArray.UserDoctor.LastName;
                    }
                }
                if (rowArray.BillAmount) {
                    billamt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    billdis = rowArray.BillDiscount;
                }
                if (rowArray.NetAmount) {
                    netamt = rowArray.NetAmount;
                }
                if (rowArray.PaidAmount) {
                    paidamt = rowArray.PaidAmount;
                }
                if (rowArray.OutStandingAmount) {
                    dueAmt = rowArray.OutStandingAmount;
                }
                csvContent += billdate + ',' + billno + ',' + patname + ',' + docname + ',' + billamt + ',' + billdis + ',' + netamt + ',' + paidamt + ',' + dueAmt + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'opticaldailybillreport.csv';
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
                        Key: 6,
                        Value: 4
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
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
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.UserId > 0) {
                    $scope.UserName = item.CreatedUser.Title.Description + ' ' + item.CreatedUser.FirstName + ' ' + item.CreatedUser.LastName;
                }
                item.NetAmount = parseInt(item.BillAmount) - parseInt(item.BillDiscount);
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
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
                        Key: 6,
                        Value: 4
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
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
            $state.go('app.opticalreports')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    UserName: $scope.UserName
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
                        Key: 39,
                        Value: $scope.currentfilter.UserId
                    },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintOpticalDailybillReport',
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
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
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
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "UserDoctor",
                    displayName: $translate.instant('Doctor'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.UserDoctor.Title && entity.UserDoctor.Title.Description'>{{entity.UserDoctor.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.UserDoctor.FirstName}}</span>&nbsp;<span>{{entity.UserDoctor.LastName}}</span>\
                                        </div>"
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    },
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

    OpticalDailybillReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();