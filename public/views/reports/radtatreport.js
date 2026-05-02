(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RadTATReportController', RadTATReportController);

    function RadTATReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["MRN", "Patient Name", "Order Number", "Test Name", "Order Status", "Order Date and Time", "Result Entered Time", "Result Approval Time", "Result Dispatch Time", "Total TAT"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var mrn = '';
                var patientName = '';
                var orderNum = '';
                var testName = '';
                var orderStatus = '';
                var orderDate = '';
                var resultTime = '';
                var resultApprove = '';
                var dispatch = '';
                var total = '';

                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.Patient.Title.Description) {
                    patientName = rowArray.Patient.Title.Description;
                }
                if (rowArray.Patient.FirstName) {
                    patientName += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patientName += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.PatientOrder.OrderNumber) {
                    orderNum = rowArray.PatientOrder.OrderNumber;
                }
                if (rowArray.TestName) {
                    testName = rowArray.TestName;
                }

                if (rowArray.PatientOrder.OrderStatus.DisplayName) {
                    orderStatus = rowArray.PatientOrder.OrderStatus.DisplayName;
                }

                if (rowArray.OrderedOn) {
                    // orderDate = rowArray.OrderedOn;
                    orderDate = $filter('date')(rowArray.OrderedOn, 'yyyy-MM-dd') || null;
                }
                if (rowArray.TechValidationOn) {
                    resultTime = rowArray.TechValidationOn;
                }
                if (rowArray.MedValidationOn) {
                    resultApprove = rowArray.MedValidationOn;
                }

                if (rowArray.ReleasedOn) {
                    dispatch = rowArray.ReleasedOn;
                }
                if (rowArray.TAT) {
                    total = rowArray.TAT;
                }

                csvContent += mrn + ',' + patientName + ',' + orderNum + ',' + testName + ',' + orderStatus + ',' + orderDate + ',' + resultTime + ',' + resultApprove + ',' + dispatch + ',' + total + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'radtat-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 10,
                    Value: From
                },
                {
                    Key: 11,
                    Value: To
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.TestId
                },
                {
                    Key: 14,
                    Value: 2
                }
                ],

            };
            var options = {
                action: "lis/ordertat/GetOrderTATs",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var tatdata = res.Data[idx];
                if ($scope.currentfilter.TestId > 0) {
                    $scope.TestName = tatdata.TestName;
                }
                if (tatdata.MedValidationOn) {
                    var orderDate = new Date(tatdata.OrderedOn);
                    var resutDate = new Date(tatdata.MedValidationOn);
                    var msec = resutDate - orderDate;
                    var mins = Math.floor(msec / 60000);
                    var hrs = Math.floor(mins / 60);
                    var days = Math.floor(hrs / 24);
                    mins = mins % 60;
                    hrs = hrs % 24;
                    days = days % 365;
                    $scope.currentcontext.totaltat = days + "Days " + hrs + "Hrs" + mins + "min";
                    tatdata.TAT = $scope.currentcontext.totaltat;
                }
                // if (tatdata.MedValidationOn) {
                //     var orderDate = new Date(tatdata.OrderedOn);
                //     var resutDate = new Date(tatdata.MedValidationOn);
                //     tatdata.TAT = parseInt(Math.round((resutDate - orderDate) / (1000 * 60 * 60 * 24))) +"Days";
                //     // var startTime = moment(tatdata.OrderedOn, 'hh:mm:ss a');
                //     // var endTime = moment(tatdata.MedValidationOn, 'hh:mm:ss a');
                //     // var totalHours = (endTime.diff(startTime, 'hours'));
                //     // var totalMinutes = endTime.diff(startTime, 'minutes');
                //     // var totalseconds = endTime.diff(startTime, 'seconds');
                //     // var clearMinutes = totalMinutes % 60;
                //     // var clearseconds = totalseconds % 60;
                //     // console.log(totalHours + " hours and " + clearMinutes + " minutes" + clearseconds + "seconds");
                //     // $scope.currentcontext.totaltat = totalHours + "Hrs " + clearMinutes + "min " + clearseconds + "sec ";
                //     // tatdata.TAT = $scope.currentcontext.totaltat;
                // }
                vm.gridConfig.data.push(tatdata);
            }

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 10,
                    Value: From
                },
                {
                    Key: 11,
                    Value: To
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.TestId
                },
                {
                    Key: 14,
                    Value: 2
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/ordertat/GetOrderTATs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.TestId = -1;
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
                    FacilityName: $scope.currentfilter.FacilityName,
                    TestName: $scope.TestName
                },
                Params: [{
                    Key: 10,
                    Value: From
                },
                {
                    Key: 11,
                    Value: To
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.TestId
                },
                {
                    Key: 14,
                    Value: 2
                },
                ],
            };
            var options = {
                action: 'lis/ordertat/PrintRadOrdertatReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        // TestMaster AutoSearch
        vm.testcontrolconfig = {
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
                header: 'Name',
                field: 'Name',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {

            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {

            var query = vm.testcontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 6,
                    Value: 2
                },],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
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

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                item.Code = item.Code;
                item.Name = item.Name;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('reports.mrn.lbl'),

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
                field: "PatientOrder.OrderNumber",
                displayName: $translate.instant('reports.orderno.lbl')
            },

            {
                field: "TestName",
                displayName: $translate.instant('reports.testname.lbl')
            },
            {
                field: "PatientOrder.OrderStatus.DisplayName",
                displayName: $translate.instant('reports.orderstatus.lbl')
            },
            {
                field: "OrderedOn",
                displayName: $translate.instant('reports.orderdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OrderedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.OrderedOn| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "TechValidationOn",
                displayName: $translate.instant('reports.resenttime.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TechValidationOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.TechValidationOn| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "MedValidationOn",
                displayName: $translate.instant('reports.resapptime.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.MedValidationOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.MedValidationOn| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "ReleasedOn",
                displayName: $translate.instant('reports.resdistime.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReleasedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReleasedOn| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "TAT",
                displayName: $translate.instant('reports.totaltat.lbl'),
                // cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.SampleCollectedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{entity.SampleCollectedOn| date: 'HH:mm'}}</span>" + "</div>"
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

    RadTATReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();