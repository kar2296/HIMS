(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RevenueSummaryByDeptController', RevenueSummaryByDeptController);

    function RevenueSummaryByDeptController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Department Name", "OP", "IP", "Total"]
            let csvContent = JsonFields.join(",") + "\n";
            $scope.Department = [];
            $scope.DepartmentInfo = data;
            // $scope.totdepartment = [];
            $scope.opdepartment = [];
            $scope.totopdepartment = [];
            $scope.ipdepartment = [];
            $scope.totipdepartment = [];
            if ($scope.DepartmentInfo) {
                var opdepartmentcollection = [];
                var ipdepartmentcollection = [];
                var directdepartmentcollection = [];

                if ($scope.DepartmentInfo.length > 0)
                    opdepartmentcollection = $scope.DepartmentInfo[0].Value;


                if ($scope.DepartmentInfo.length > 1)
                    ipdepartmentcollection = $scope.DepartmentInfo[1].Value;

                if ($scope.DepartmentInfo.length > 2)
                    directdepartmentcollection = $scope.DepartmentInfo[2].Value;

                var opTotNetAmt = 0;
                var opTotBillAmt = 0;
                var opTotDisAmt = 0;
                var opTotnetrevenue = 0;
                for (var idx in opdepartmentcollection) {
                    var coll = opdepartmentcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var NetRevenue = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                        NetRevenue += coll[idx].NetRevenue;
                    }
                    opTotNetAmt += NetAmt;
                    opTotBillAmt += BillAmt;
                    opTotDisAmt += DisAmt;
                    opTotnetrevenue += NetRevenue;
                    $scope.Department.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'OPBill': BillAmt,
                            'OPDis': DisAmt,
                            'OPRev': NetRevenue,
                            'IP': 0.00,
                            'IPBill': 0.00,
                            'IPDis': 0.00,
                        }
                    });
                }

                var ipTotNetAmt = 0;
                var ipTotBillAmt = 0;
                var ipTotDisAmt = 0;
                for (var idx in ipdepartmentcollection) {
                    var coll = ipdepartmentcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                    }
                    ipTotNetAmt += NetAmt;
                    ipTotBillAmt += BillAmt;
                    ipTotDisAmt += DisAmt;
                    var valappended = 0;
                    $scope.Department.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            item.Value.IPBill = BillAmt;
                            item.Value.IPDis = DisAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.Department.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'OPBill': 0.00,
                                'OPDis': 0.00,
                                'OPRev': 0.00,
                                'IP': NetAmt,
                                'IPBill': BillAmt,
                                'IPDis': DisAmt,
                            }
                        });

                }
                var valappended = 0;


                var directNetAmt = 0;
                var directBillAmt = 0;
                var directDisAmt = 0;
                var directnetrevenue = 0;
                var opwithdirectBillamt = 0;
                var opwithdirectDisamt = 0;
                var opwithdirectNetamt = 0;
                var opwithdirectnetrevenue = 0;
                for (var idx in directdepartmentcollection) {
                    var coll = directdepartmentcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var NetRevenue = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                        NetRevenue += coll[idx].NetRevenue;
                    }
                    directNetAmt += NetAmt;
                    directBillAmt += BillAmt;
                    directDisAmt += DisAmt;
                    directnetrevenue += NetRevenue;
                    $scope.Department.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'OPBill': BillAmt,
                            'OPDis': DisAmt,
                            'OPRev': NetRevenue,
                            'IP': 0.00,
                            'IPBill': 0.00,
                            'IPDis': 0.00,
                        }
                    });
                }
                opwithdirectBillamt = opTotBillAmt + directBillAmt;
                opwithdirectDisamt = opTotDisAmt + directDisAmt;
                opwithdirectNetamt = opTotNetAmt + directNetAmt;
                opwithdirectnetrevenue = opTotnetrevenue + directnetrevenue;

                var netgross = opwithdirectBillamt + ipTotBillAmt;
                var netbill = opwithdirectNetamt + ipTotNetAmt;
                var netdis = opwithdirectDisamt + ipTotDisAmt;
                var netrev = opwithdirectnetrevenue + ipTotNetAmt;
                $scope.Department.push({
                    'Key': 'Total',
                    'Value': {
                        'OP': opwithdirectNetamt,
                        'OPBill': opwithdirectBillamt,
                        'OPDis': opwithdirectDisamt,
                        'OPRev': opwithdirectnetrevenue,
                        'IP': ipTotNetAmt,
                        'IPBill': ipTotBillAmt,
                        'IPDis': ipTotDisAmt,
                        // 'NetGross': netgross,
                        // 'NetBill': netbill,
                        // 'NetDis': netdis,
                    }
                });

            }


            $scope.Department.forEach(function (rowArray) {
                var DepartmentName = '';
                var opbill = 0;
                var opdis = 0;
                var op = 0;
                var oprev = 0;
                var ipbill = 0;
                var ipdis = 0;
                var ip = 0;
                var totalbill = 0;
                var totaldis = 0;
                var total = 0;

                if (rowArray.Key) {
                    DepartmentName = rowArray.Key;
                }

                if (rowArray.Value.OPBill) {
                    opbill = rowArray.Value.OPBill;
                }
                if (rowArray.Value.OPDis) {
                    opdis = rowArray.Value.OPDis;
                }
                if (rowArray.Value.OP) {
                    op = rowArray.Value.OP;
                }
                if (rowArray.Value.OPRev) {
                    oprev = rowArray.Value.OPRev;
                }
                if (rowArray.Value.IPBill) {
                    ipbill = rowArray.Value.IPBill;
                }
                if (rowArray.Value.IPDis) {
                    ipdis = rowArray.Value.IPDis;
                }
                if (rowArray.Value.IP) {
                    ip = rowArray.Value.IP;
                }
                totalbill = opbill + ipbill;
                totaldis = opdis + ipdis;
                total = oprev + ip;

                csvContent += DepartmentName + ',' + oprev + ',' + ip + ',' + total + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'DepartmentRevenue-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DepartmentId: $scope.currentfilter.DepartmentId || 0
                },
            };

            var options = {
                action: 'billing/patientbills/GetRevenueDepartmentSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.DepartmentInfo = res;
            $scope.department = [];
            $scope.totdepartment = [];
            $scope.opdepartment = [];
            // $scope.totdepartment = [];
            $scope.ipdepartment = [];
            // $scope.totipdepartment = [];
            if ($scope.DepartmentInfo) {
                var opdepartmentcollection = [];
                var ipdepartmentcollection = [];
                var directdepartmentcollection = [];

                if ($scope.DepartmentInfo.length > 0)
                    opdepartmentcollection = $scope.DepartmentInfo[0].Value;


                if ($scope.DepartmentInfo.length > 1)
                    ipdepartmentcollection = $scope.DepartmentInfo[1].Value;

                if ($scope.DepartmentInfo.length > 2)
                    directdepartmentcollection = $scope.DepartmentInfo[2].Value;

                var opTotNetAmt = 0;
                var opTotBillAmt = 0;
                var opTotDisAmt = 0;
                var opTotnetrevenue = 0;
                for (var idx in opdepartmentcollection) {
                    var coll = opdepartmentcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var NetRevenue = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                        NetRevenue += coll[idx].NetRevenue;
                    }
                    opTotNetAmt += NetAmt;
                    opTotBillAmt += BillAmt;
                    opTotDisAmt += DisAmt;
                    opTotnetrevenue += NetRevenue;
                    $scope.department.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'OPBill': BillAmt,
                            'OPDis': DisAmt,
                            'OPRev': NetRevenue,
                            'IP': 0.00,
                            'IPBill': 0.00,
                            'IPDis': 0.00,
                        }
                    });
                }

                var ipTotNetAmt = 0;
                var ipTotBillAmt = 0;
                var ipTotDisAmt = 0;
                for (var idx in ipdepartmentcollection) {
                    var coll = ipdepartmentcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                    }
                    ipTotNetAmt += NetAmt;
                    ipTotBillAmt += BillAmt;
                    ipTotDisAmt += DisAmt;
                    // $scope.ipdepartment.push({
                    //     'Key': key,
                    //     'Value': NetAmt,
                    //     'Value': BillAmt,
                    //     'Value': DisAmt
                    // });

                    var valappended = 0;
                    $scope.department.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            item.Value.IPBill = BillAmt;
                            item.Value.IPDis = DisAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.department.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'OPBill': 0.00,
                                'OPDis': 0.00,
                                'OPRev': 0.00,
                                'IP': NetAmt,
                                'IPBill': BillAmt,
                                'IPDis': DisAmt,
                            }
                        });

                }
                var valappended = 0;


                var directNetAmt = 0;
                var directBillAmt = 0;
                var directDisAmt = 0;
                var directnetrevenue = 0;
                var opwithdirectBillamt = 0;
                var opwithdirectDisamt = 0;
                var opwithdirectNetamt = 0;
                var opwithdirectnetrevenue = 0;
                for (var idx in directdepartmentcollection) {
                    var coll = directdepartmentcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var NetRevenue = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                        NetRevenue += coll[idx].NetRevenue;
                    }
                    directNetAmt += NetAmt;
                    directBillAmt += BillAmt;
                    directDisAmt += DisAmt;
                    directnetrevenue += NetRevenue;
                    $scope.department.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'OPBill': BillAmt,
                            'OPDis': DisAmt,
                            'OPRev': NetRevenue,
                            'IP': 0.00,
                            'IPBill': 0.00,
                            'IPDis': 0.00,
                        }
                    });
                }
                opwithdirectBillamt = opTotBillAmt + directBillAmt;
                opwithdirectDisamt = opTotDisAmt + directDisAmt;
                opwithdirectNetamt = opTotNetAmt + directNetAmt;
                opwithdirectnetrevenue = opTotnetrevenue + directnetrevenue;

                var netgross = opwithdirectBillamt + ipTotBillAmt;
                var netbill = opwithdirectNetamt + ipTotNetAmt;
                var netdis = opwithdirectDisamt + ipTotDisAmt;
                var netrev = opwithdirectnetrevenue + ipTotNetAmt;
                $scope.totdepartment.push({
                    'Key': 'Total',
                    'TotOpNet': opwithdirectNetamt,
                    'TotOpBill': opwithdirectBillamt,
                    'TotOpDis': opwithdirectDisamt,
                    'TotOpNetRev': opwithdirectnetrevenue,
                    'TotIPNet': ipTotNetAmt,
                    'TotIPBill': ipTotBillAmt,
                    'TotIPDis': ipTotDisAmt,
                    'NetGross': netgross,
                    'NetBill': netbill,
                    'NetDis': netdis,
                    'NetRev': netrev,

                });

            }
        }

        $scope.GetFacilityDashboardOptions = function () {
            
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }

            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DepartmentId: $scope.currentfilter.DepartmentId || 0
                },
            };

            var options = {
                action: 'billing/patientbills/GetRevenueDepartmentSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.SelectedDepartment = function (selectedItem) {
            $scope.currentfilter.DepartmentName = selectedItem.DepartmentName;
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DepartmentId: $scope.currentfilter.DepartmentId || 0,
                    DepartmentName: $scope.currentfilter.DepartmentName
                }
            };
            var options = {
                action: 'billing/PatientBills/PrintRevenueSummaryDepartmentReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'revenuesummary') {
                $state.go('app.financereporttab.revenuesummary');
            }
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
            }

        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.GetFacilityDashboardOptions();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                {
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
    RevenueSummaryByDeptController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();