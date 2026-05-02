(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RevenueSummaryByDoctorController', RevenueSummaryByDoctorController);

    function RevenueSummaryByDoctorController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            const JsonFields = ["Doctor Name", "OP", "IP", "Total"]
            let csvContent = JsonFields.join(",") + "\n";
            $scope.DoctorInfo = data;
            $scope.DoctorData = [];
            $scope.opdoctor = [];
            $scope.totopdoctor = [];
            $scope.ipdoctor = [];
            $scope.totipdoctor = [];
            if ($scope.DoctorInfo) {
                var opdoctorcollection = [];
                var ipdoctorcollection = [];
                var directdoctorcollection = [];
                if ($scope.DoctorInfo.length > 0)
                    opdoctorcollection = $scope.DoctorInfo[0].Value;


                if ($scope.DoctorInfo.length > 1)
                    ipdoctorcollection = $scope.DoctorInfo[1].Value;

                if ($scope.DoctorInfo.length > 2)
                    directdoctorcollection = $scope.DoctorInfo[2].Value;

                var opTotNetAmt = 0;
                var opTotBillAmt = 0;
                var opTotDisAmt = 0;
                var opTotnetrevenue = 0;
                for (var idx in opdoctorcollection) {
                    var coll = opdoctorcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var NetRevenue = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName.Title)
                            $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                        NetRevenue += coll[idx].NetRevenue;
                    }
                    opTotNetAmt += NetAmt;
                    opTotBillAmt += BillAmt;
                    opTotDisAmt += DisAmt;
                    opTotnetrevenue += NetRevenue;
                    $scope.DoctorData.push({
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
                for (var idx in ipdoctorcollection) {
                    var coll = ipdoctorcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName.Title)
                            $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                    }
                    ipTotNetAmt += NetAmt;
                    ipTotBillAmt += BillAmt;
                    ipTotDisAmt += DisAmt;
                    var valappended = 0;
                    $scope.DoctorData.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.DoctorData.push({
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
                if ($scope.currentfilter.DoctorId == -1 || !$scope.currentfilter.DoctorId) {
                    for (var idx in directdoctorcollection) {
                        var coll = directdoctorcollection[idx];
                        var NetAmt = 0;
                        var BillAmt = 0;
                        var DisAmt = 0;
                        var NetRevenue = 0;
                        var key = '';
                        for (var idx in coll) {
                            $scope.docName = '';
                            if (coll[idx].DoctorName)
                                $scope.docName = coll[idx].DoctorName;

                            key = $scope.docName;
                            NetAmt += coll[idx].BillAmount;
                            BillAmt += coll[idx].GrossAmount;
                            DisAmt += coll[idx].BillDiscount;
                            NetRevenue += coll[idx].NetRevenue;

                        }
                        directNetAmt += NetAmt;
                        directBillAmt += BillAmt;
                        directDisAmt += DisAmt;
                        directnetrevenue += NetRevenue;

                        $scope.DoctorData.push({
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
                }
                opwithdirectBillamt = opTotBillAmt + directBillAmt;
                opwithdirectDisamt = opTotDisAmt + directDisAmt;
                opwithdirectNetamt = opTotNetAmt + directNetAmt;
                opwithdirectnetrevenue = opTotnetrevenue + directnetrevenue;

                var netgross = opwithdirectBillamt + ipTotBillAmt;
                var netbill = opwithdirectNetamt + ipTotNetAmt;
                var netdis = opwithdirectDisamt + ipTotDisAmt;
                var netrev = opwithdirectnetrevenue + ipTotNetAmt;
                $scope.DoctorData.push({
                    'Key': 'Total',
                    'Value': {
                        'OP': opwithdirectNetamt,
                        'OPBill': opwithdirectBillamt,
                        'OPDis': opwithdirectDisamt,
                        'OPRev': opwithdirectnetrevenue,
                        'IP': ipTotNetAmt,
                        'IPBill': ipTotBillAmt,
                        'IPDis': ipTotDisAmt,
                    }
                });

            }


            $scope.DoctorData.forEach(function (rowArray) {
                var DoctorName = '';
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
                    DoctorName = rowArray.Key;
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
                // if (rowArray.Profit) {
                //     total = rowArray.Profit;
                // }

                csvContent += DoctorName + ',' + oprev + ',' + ip + ',' + total + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'DoctorRevenue-report.csv';
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
                    DoctorId: $scope.currentfilter.DoctorId || 0,

                },
            };

            var options = {
                action: 'billing/patientbills/GetRevenueDoctorSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.DoctorInfo = res;
            $scope.doctor = [];
            $scope.totdoctor = [];
            $scope.opdoctor = [];
            $scope.ipdoctor = [];
            if ($scope.DoctorInfo) {
                var opdoctorcollection = [];
                var ipdoctorcollection = [];
                var directdoctorcollection = [];
                if ($scope.DoctorInfo.length > 0)
                    opdoctorcollection = $scope.DoctorInfo[0].Value;


                if ($scope.DoctorInfo.length > 1)
                    ipdoctorcollection = $scope.DoctorInfo[1].Value;

                if ($scope.DoctorInfo.length > 2)
                    directdoctorcollection = $scope.DoctorInfo[2].Value;

                var opTotNetAmt = 0;
                var opTotBillAmt = 0;
                var opTotDisAmt = 0;
                var opTotnetrevenue = 0;
                for (var idx in opdoctorcollection) {
                    var coll = opdoctorcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var NetRevenue = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName.Title)
                            $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                        NetRevenue += coll[idx].NetRevenue;
                    }
                    opTotNetAmt += NetAmt;
                    opTotBillAmt += BillAmt;
                    opTotDisAmt += DisAmt;
                    opTotnetrevenue += NetRevenue;
                    $scope.doctor.push({
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
                for (var idx in ipdoctorcollection) {
                    var coll = ipdoctorcollection[idx];
                    var NetAmt = 0;
                    var BillAmt = 0;
                    var DisAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName.Title)
                            $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].BillAmount;
                        BillAmt += coll[idx].GrossAmount;
                        DisAmt += coll[idx].BillDiscount;
                    }
                    ipTotNetAmt += NetAmt;
                    ipTotBillAmt += BillAmt;
                    ipTotDisAmt += DisAmt;
                    var valappended = 0;
                    $scope.doctor.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            item.Value.IPBill = BillAmt;
                            item.Value.IPDis = DisAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.doctor.push({
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
                if ($scope.currentfilter.DoctorId == -1 || !$scope.currentfilter.DoctorId) {
                    for (var idx in directdoctorcollection) {
                        var coll = directdoctorcollection[idx];
                        var NetAmt = 0;
                        var BillAmt = 0;
                        var DisAmt = 0;
                        var NetRevenue = 0;
                        var key = '';
                        for (var idx in coll) {
                            $scope.docName = '';
                            if (coll[idx].DoctorName)
                                $scope.docName = coll[idx].DoctorName;

                            key = $scope.docName;
                            NetAmt += coll[idx].BillAmount;
                            BillAmt += coll[idx].GrossAmount;
                            DisAmt += coll[idx].BillDiscount;
                            NetRevenue += coll[idx].NetRevenue;
                        }
                        directNetAmt += NetAmt;
                        directBillAmt += BillAmt;
                        directDisAmt += DisAmt;
                        directnetrevenue += NetRevenue;

                        $scope.doctor.push({
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
                }
                opwithdirectBillamt = opTotBillAmt + directBillAmt;
                opwithdirectDisamt = opTotDisAmt + directDisAmt;
                opwithdirectNetamt = opTotNetAmt + directNetAmt;
                opwithdirectnetrevenue = opTotnetrevenue + directnetrevenue;

                var netgross = opwithdirectBillamt + ipTotBillAmt;
                var netbill = opwithdirectNetamt + ipTotNetAmt;
                var netdis = opwithdirectDisamt + ipTotDisAmt;
                var netrev = opwithdirectnetrevenue + ipTotNetAmt;
                $scope.totdoctor.push({
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
                    DoctorId: $scope.currentfilter.DoctorId || 0,

                },
            };

            var options = {
                action: 'billing/patientbills/GetRevenueDoctorSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DoctorId: $scope.currentfilter.DoctorId || 0,
                    DoctorName: $scope.DoctorName
                }
            };
            var options = {
                action: 'billing/PatientBills/PrintRevenueSummaryDoctorReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName].join(' ');
            }
            $scope.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.searchbyid == true) {
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
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.DoctorId = 0;
                // $scope.GetFacilityDashboardOptions();
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

                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
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
        // $scope.LoadDashboard = function() {
        //     $scope.GetFacilityDashboardOptions();
        // }

        // $scope.LoadDashboard();
    }
    RevenueSummaryByDoctorController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();