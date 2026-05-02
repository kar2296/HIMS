(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DashboardController', DashboardController);

    function DashboardController($scope, $stateParams, $state, $translate, $filter, utl) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentcontext.TestTypeId = $stateParams.tp ? parseInt($stateParams.tp) : -1;
        $scope.FacilityReceipt = [];
        if ($scope.currentcontext.TestTypeId == 1) { //lab
            $scope.DeptId = 8;
        } else if ($scope.currentcontext.TestTypeId == 2) { //radiology
            $scope.DeptId = 62;
        } else if ($scope.currentcontext.TestTypeId == 4) { //endoscopy
            $scope.DeptId = 60;
        }
        // $scope.DeptId = 8; // LABORATORY

        $scope.rows = [];
        $scope.row = { cols: [] };
        $scope.headerRow = { cols: [] };

        $scope.Items = {
            AllSupDept: {},
            AllOrdStatus: {}
        };

        $scope.Items.LISStockRequestCount = '0';
        $scope.Items.LISStockReveivedCount = '0';
        $scope.Items.LISInventoryItemsCount = '0';
        $scope.Items.LISPatientOrderACKCount = '0';
        $scope.Items.LISPatientOrderCount = '0';
        $scope.Items.LISResultNotApprovalCount = '0';
        $scope.Items.LISRejectedOrderProcessCount = '0';
        $scope.Items.LISResultNotReleaseCount = '0';
        $scope.Items.LISNotOrderProcessCount = '0';
        $scope.Items.LISSampleCollectionCount = '0';
        $scope.Items.LISSampleReviewCount = '0';


        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            Testtypeid: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            SubDepartmentId: [],
            OrderStatusId: []
        };

        $scope.currentfilter = {
            name: '',
            codemnemonicsnamedesc: '',
            code: '',
            ActiveStatusId: 2,
            CONTAINTYPId: -1,
            COLORId: -1,
            mnemonics: ''
        };

        $scope.getLABDeptListCallBack = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                $scope.currentcontext.SubDepartmentId.push(res.Data[idx].Id);
                var id = res.Data[idx].Id;
                var name = res.Data[idx].DepartmentName;
                $scope.Items.AllSupDept[id] = name;
            }
            $scope.getOrderStatusList();
        }

        $scope.getLABDeptList = function () {
            var inputData = {
                Params: [
                    { Key: 6, Value: $scope.DeptId }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/department/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLABDeptListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getOrderStatusListCallBack = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                $scope.currentcontext.OrderStatusId.push(res.Data[idx].Id);
                var id = res.Data[idx].Id;
                var name = res.Data[idx].DisplayName;
                $scope.Items.AllOrdStatus[id] = name;
            }
            $scope.getList();
        }

        $scope.lisregister = function () {
            $state.go('app.lisregistration', { id: 0 })
        };
        $scope.dgbilling = function () {
            $state.go('app.opbilling-list', { id: 0, tp: 'DG' });
        };
        $scope.b2bbilling = function () {
            $state.go('app.b2bbilling-form', { id: 0 })
        };
        $scope.pendingbills = function () {
            $state.go('app.pendingorders')
        };
        $scope.getOrderStatusList = function () {
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'LIS/OrderStatus/GetOrderStatuss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOrderStatusListCallBack
            };
            utl.Http.doAction(options);
        };


        $scope.GetLISDashboardHeadingCallBack = function (scope, res, options, hasError) {
            $scope.Items.LISPatientOrderACKCount = res.patientorderbo.LABPatientOrderACKCount;
            $scope.Items.LISPatientOrderCount = res.patientorderbo.LABPatientOrderCount;
            $scope.Items.LISResultNotApprovalCount = res.patientworkorderbo.LABResultNotApprovalCount;
            $scope.Items.LISRejectedOrderProcessCount = res.patientworkorderbo.LABRejectedOrderProcessCount;
            $scope.Items.LISResultNotReleaseCount = res.patientworkorderbo.LABResultNotReleaseCount;
            $scope.Items.LISNotOrderProcessCount = res.patientworkorderbo.LABNotOrderProcessCount;
            $scope.Items.LISSampleCollectionCount = res.workordersamplebo.LISSampleCollectionCount;
            $scope.Items.LISSampleReviewCount = res.workordersamplebo.LISSampleReviewCount;



            if (!$scope.Items.LISPatientOrderACKCount)
                $scope.Items.LISPatientOrderACKCount = '0';
            if (!$scope.Items.LISPatientOrderCount)
                $scope.Items.LISPatientOrderCount = '0';
            if (!$scope.Items.LISResultNotApprovalCount)
                $scope.Items.LISResultNotApprovalCount = '0';
            if (!$scope.Items.LISRejectedOrderProcessCount)
                $scope.Items.LISRejectedOrderProcessCount = '0';
            if (!$scope.Items.LISResultNotReleaseCount)
                $scope.Items.LISResultNotReleaseCount = '0';
            if (!$scope.Items.LISNotOrderProcessCount)
                $scope.Items.LISNotOrderProcessCount = '0';
            if (!$scope.Items.LISSampleCollectionCount)
                $scope.Items.LISSampleCollectionCount = '0';
            if (!$scope.Items.LISSampleReviewCount)
                $scope.Items.LISSampleReviewCount = '0';



            $scope.getSubDeptList();

        };

        $scope.getList = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'patientorderbo' }, { Key: 'workordersamplebo' },
                    { Key: 'patientworkorderbo' }]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'LIS/LABDashboard/GetLABDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetLISDashboardHeadingCallBack
            };
            utl.Http.doAction(options);
        };

        var groupByMulti = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        var getDeptLabel = function (key) {
            var deptname = $scope.Items.AllSupDept[key] || "";
            return deptname;
        };

        var getOrderStatusLabel = function (key) {
            var ordsts = $scope.Items.AllOrdStatus[key] || key;
            return ordsts;
        };
        var fillEmptyCols = function (colIndexes, cols) {
            for (var cIndex = cols.length; cIndex < colIndexes.length; cIndex++) {
                cols.push({ text: '' });
            }
        };

        var constructTable = function (gItems) {
            var colIndexes = ['Department', 'Total'];
            var totalcolIndexes = ['Department', 'Total'];
            $scope.rows = [];
            $scope.total = [];
            for (var sdKey in gItems) {
                $scope.row = { cols: [] };
                $scope.total = { cols: [] };
                fillEmptyCols(colIndexes, $scope.row.cols);
                fillEmptyCols(totalcolIndexes, $scope.total.cols);
                //0 - subdepartment name
                $scope.row.cols[0] = { text: getDeptLabel(sdKey) };
                $scope.total.cols[0] = { text: 'TotalDisplay' }
                //1 - compute overall total
                var total = 0;
                for (var osKey in gItems[sdKey]) {
                    var osIndex = colIndexes.indexOf(osKey);
                    var osTotal = gItems[sdKey][osKey].length;
                    if (osIndex === -1) {
                        colIndexes.push(osKey);
                        osIndex = colIndexes.indexOf(osKey);
                        fillEmptyCols(colIndexes, $scope.row.cols);
                    }
                    $scope.row.cols[osIndex] = { text: osTotal };
                    total += osTotal;
                }
                $scope.row.cols[1] = { text: total };

                $scope.rows.push($scope.row);
            }
            var grandtotal = 0;
            for (var idx in $scope.rows) {
                var total = $scope.rows[idx];
                for (var iddx in total.cols)
                    var gtTotal = total.cols[1];
                grandtotal += gtTotal.text;
            }
            $scope.total.cols[1] = { text: grandtotal }
            $scope.headerRow = { cols: [] };
            for (var cIndex = 0; cIndex < colIndexes.length; cIndex++) {
                $scope.headerRow.cols.push({ text: getOrderStatusLabel(colIndexes[cIndex]) });
            }
            //$scope.rows.splice(0,0, $scope.headerRow);

            for (var rIndex = 0; rIndex < $scope.rows.length; rIndex++) {
                fillEmptyCols(colIndexes, $scope.rows[rIndex].cols);
            }
            return $scope.rows;
        };

        $scope.GetLISDashboardSubDeptCallBack = function (scope, res, options, hasError) {

            var sourceData = res.patientorderdetailbo.LisSubDeptTotaldata;
            var groupedItems = groupByMulti(sourceData, ['SubDepartmentId', 'OrderStatusId']);
            var table = constructTable(groupedItems);
            //console.log(JSON.stringify(table));
        };

        $scope.getSubDeptList = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'patientorderdetailbo' }]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'LIS/LABDashboard/GetLABDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetLISDashboardSubDeptCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.GetCategoryCollection = function () {
            $scope.FacilityInfo.category = [];
            $scope.FacilityInfo.totcategory = [];
            $scope.FacilityInfo.opcategory = [];
            $scope.FacilityInfo.totopcategory = [];
            $scope.FacilityInfo.ipcategory = [];
            $scope.FacilityInfo.totipcategory = [];
            if ($scope.FacilityInfo.categorycollection) {
                var opcollection = [];
                var ipcollection = [];

                if ($scope.FacilityInfo.categorycollection.length > 0)
                    opcollection = $scope.FacilityInfo.categorycollection[0].Value;


                if ($scope.FacilityInfo.categorycollection.length > 1)
                    ipcollection = $scope.FacilityInfo.categorycollection[1].Value;

                var opTotNetAmt = 0;
                for (var idx in opcollection) {
                    var coll = opcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    opTotNetAmt += NetAmt;
                    $scope.FacilityInfo.opcategory.push({ 'Key': key, 'Value': NetAmt });
                    $scope.FacilityInfo.category.push({ 'Key': key, 'Value': { 'OP': NetAmt, 'IP': 0.00 } });
                }
                $scope.FacilityInfo.totopcategory.push({ 'Key': 'Total', 'Value': opTotNetAmt });
                var ipTotNetAmt = 0;
                for (var idx in ipcollection) {
                    var coll = ipcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    ipTotNetAmt += NetAmt;
                    $scope.FacilityInfo.ipcategory.push({ 'Key': key, 'Value': NetAmt });

                    var valappended = 0;
                    $scope.FacilityInfo.category.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.FacilityInfo.category.push({ 'Key': key, 'Value': { 'OP': 0.00, 'IP': NetAmt } });

                }
                $scope.FacilityInfo.totipcategory.push({ 'Key': 'Total', 'Value': ipTotNetAmt });

                $scope.FacilityInfo.category.push({ 'Key': 'Total', 'Value': { 'OP': opTotNetAmt, 'IP': ipTotNetAmt } });

            }
        }
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
            if (res.billrefund) {
                for (var idx in res.billrefund)
                    $scope.FacilityReceipt.push(res.billrefund[idx]);
            }
            if (res.receipt) {
                $scope.FacilityReceipt.push(res.receipt[0]);
            }
            if ($scope.FacilityInfo.receipt)
                $scope.FacilityInfo.receipt.sort($scope.custom_sort);
            $scope.GetCategoryCollection();

            //console.log($scope.FacilityInfo);

        }

        $scope.GetFacilityDashboardOptions = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'receipt' },
                        { Key: 'billrefund' },
                        { Key: 'categorycollection' }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getLABDeptList();
        }

        $scope.initLookup = function () {
            var inputData = [

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
        $scope.GetFacilityDashboardOptions();

    }

    DashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();