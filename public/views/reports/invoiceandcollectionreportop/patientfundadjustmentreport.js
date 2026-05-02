(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientfundadjustmentreportController', patientfundadjustmentreportController);

    function patientfundadjustmentreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.AllDetailInfo = [];
            var GroupedBatchData = _.groupBy(res.Data, 'ParentReceiptId');


            for (var idx in GroupedBatchData) {
                var TransDetails = { AdvInfoRecDate: '', RecNumber: '', AdvanceAmount: '', AdjustDetails: [] }
                var GrpData = GroupedBatchData[idx];
                for (var gdx in GrpData) {
                    var billInfo = {
                        TransactionNum: '',
                        TransDate: '',
                        BillDate: '',
                        AdjustedAmount: 0,
                        BalanceAmt: 0,
                    }
                    TransDetails.AdvInfoRecDate = GrpData[0].AdvanceDetail.ReceiptDateTime;
                    TransDetails.RecNumber = GrpData[0].AdvanceDetail.ReceiptNumber;
                    TransDetails.AdvanceAmount = GrpData[0].AdvanceDetail.AmountPaid;
                    var adjData = GrpData[gdx];
                    billInfo.TransactionNum = adjData.PatientBill.BillNumber;
                    billInfo.TransDate = adjData.BillingDetail.ReceiptDateTime;
                    billInfo.BillDate = adjData.PatientBill.BillDateTime;
                    billInfo.AdjustedAmount = adjData.AdvanceAdjusted;
                    billInfo.BalanceAmt = adjData.BalanceAdvance;
                    TransDetails.AdjustDetails.push(billInfo);
                }
                $scope.AllDetailInfo.push(TransDetails);
            }

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
                    Key: 11,
                    Value: From
                },
                {
                    Key: 12,
                    Value: To
                },
                {
                    Key: 13,
                    Value: $scope.currentfilter.FacilityId
                },
                    // {
                    //     Key: 53,
                    //     Value: $scope.currentfilter.DepartmentId
                    // }, 
                    // {
                    //     Key: 5,
                    //     Value: 1
                    // },
                    // {
                    //     Key: 13,
                    //     Value: false
                    // },
                    // {
                    //     Key: 21,
                    //     Value: 1
                    // },
                ],
            };

            var options = {
                action: 'Billing/PatientPaymentAdjustments/GetPatientPaymentAdjustments',
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
            if ($scope.Context == 'opinvoicebillingreport') {
                $state.go('app.billingreportstab.opinvoicebillingreport');
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
                    GuarantorName: $scope.GuarantorName,
                    DepartmentName: $scope.DepartmentName
                },
                Params: [{
                    Key: 11,
                    Value: From
                },
                {
                    Key: 12,
                    Value: To
                },
                {
                    Key: 13,
                    Value: $scope.currentfilter.FacilityId
                },
                ],
            };
            var options = {
                action: 'Billing/PatientPaymentAdjustments/PrintPatientFundAdjustmentReport',
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



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [

                { "Key": "Department" }]
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

    patientfundadjustmentreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();