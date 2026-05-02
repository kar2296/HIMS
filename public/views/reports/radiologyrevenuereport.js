(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('radiologyrevenuereportController', radiologyrevenuereportController);

    function radiologyrevenuereportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Bill No", "Patient Type", "Patient Name", "MRN", "Doctor Name", "Test Name", "Test Code", "Rate", "Discount", "NetAmount"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var billno = '';
                var patientType = '';
                var patientName = '';
                var mrn = '';
                var docName = '';
                var testName = '';
                var testCode = '';
                var rate = '';
                var disc = '';
                var netamt = '';

                
                if (rowArray.PatientBill.BillDateTime) {
                    // date += ' ' + rowArray.BillDateTime;
                    date = $filter('date')(rowArray.PatientBill.BillDateTime, 'yyyy-MM-dd') || null;
                }
                if (rowArray.PatientBill.BillNumber) {
                    billno = rowArray.PatientBill.BillNumber;
                }
                if (rowArray.PatientBill.BillType) {
                    if (rowArray.PatientBill.BillType.Description) {
                        patientType = rowArray.PatientBill.BillType.Description;
                    }
                }
                if (rowArray.PatientBill.Patient.Title.Description) {
                    patientName = rowArray.PatientBill.Patient.Title.Description;
                }
                if (rowArray.PatientBill.Patient.FirstName) {
                    patientName += ' ' + rowArray.PatientBill.Patient.FirstName;
                }
                if (rowArray.PatientBill.Patient.LastName) {
                    patientName += ' ' + rowArray.PatientBill.Patient.LastName;
                }
                if (rowArray.PatientBill.Patient.MRN) {
                    mrn = rowArray.PatientBill.Patient.MRN;
                }
                if (rowArray.User) {
                    if (rowArray.User.Title.Description) {
                        docName = rowArray.User.Title.Description;
                    }
                    if (rowArray.User.FirstName) {
                        docName += ' ' + rowArray.User.FirstName;
                    }
                    if (rowArray.User.LastName) {
                        docName += ' ' + rowArray.User.LastName;
                    }
                }
                if (rowArray.ServiceName) {
                    testName = rowArray.ServiceName;
                }
                if (rowArray.ServiceCode) {
                    testCode = rowArray.ServiceCode;
                }
                if (rowArray.Rate) {
                    rate = rowArray.Rate;
                } 
                    if (rowArray.DiscountAmount) {
                        disc = rowArray.DiscountAmount;
                    }
                    if (rowArray.NetAmount) {
                        netamt = rowArray.NetAmount;
                    } 
                csvContent += date + ',' + billno + ',' + patientType + ',' + patientName + ',' + mrn + ',' + docName + ',' + testName + ',' + testCode + ',' + rate + ',' + disc +  ',' + netamt +"\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'radiologyorderdetail-report.csv';
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
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.EncounterTypeId
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 49,
                    Value: 62
                },
                ],

            };
            var options = {
                action: "billing/PatientBillDetails/GetPatientBillDetails",
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

                if ($scope.currentfilter.SubDepartmentId > 0) {
                    $scope.DepartmentName = item.Department.DepartmentName;
                } else {
                    $scope.DepartmentName = '';
                }

                vm.gridConfig.data.push(item);
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
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.EncounterTypeId
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 49,
                    Value: 62
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: "billing/PatientBillDetails/GetPatientBillDetails",
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ServiceId = -1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.radiologyreports')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: $scope.currentfilter.FacilityId,
                    FacilityName: $scope.currentfilter.FacilityName,
                    PatientType: $scope.PatientType,
                    TestName: $scope.TestName,
                    DepartmentName: $scope.DepartmentName
                },
                Params: [
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                    {
                        Key: 33,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 28,
                        Value: $scope.currentfilter.ServiceId
                    },
                    {
                        Key: 17,
                        Value: $scope.currentfilter.EncounterTypeId
                    },

                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 49,
                        Value: 62
                    },
                ],
            };
            var options = {
                action: 'billing/PatientBillDetails/PrintRadiologyRevenueReport',
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


        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Service Code',
                field: 'ServiceCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Service Name',
                field: 'ServiceName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        };

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                // if (otherservicemiddlesearch) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
                // }
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        };

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
            }
        };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "PatientBill.BillDateTime",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientBill.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PatientBill.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('Bill No')
            },
            {
                field: "Patient Name",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientBill.Patient.Title && entity.PatientBill.Patient.Title.Description'>{{entity.PatientBill.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientBill.Patient.FirstName}}</span>&nbsp;<span>{{entity.PatientBill.Patient.LastName}}</span>\
                                        </div>"
            },
            {
                field: "PatientBill.Patient.MRN",
                displayName: $translate.instant('reports.mrn.lbl')
            },
            {
                field: "PatientBill.BillType.Description",
                displayName: $translate.instant('reports.patienttype.lbl')
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
                field: "ServiceCode",
                displayName: $translate.instant('reports.testcode.lbl')
            },
            {
                field: "ServiceName",
                displayName: $translate.instant('reports.testname.lbl')
            },
            {
                field: "Rate",
                displayName: $translate.instant('Rate')
            },
            {
                field: "DiscountAmount",
                displayName: $translate.instant('Discount')
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('NetAmount')
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
                "Key": "EncounterType"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: 8
                    }]
                }
            },
                // { "Key": "Department" }
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

    radiologyrevenuereportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();