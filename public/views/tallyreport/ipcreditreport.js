(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipcreditreportController', ipcreditreportController);

    function ipcreditreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDueCollections = [];
            $scope.TotCashDue = 0;
            $scope.TotCardDue = 0;
            $scope.TotChequeOthersDue = 0;
            $scope.TotDues = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientDueCollections = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientDue = res.Data[idx];
                    var receiptDt = PatientDue.ReceiptDateTime;
                    var receiptnumber = PatientDue.ReceiptNumber;
                    var billnumber = '';
                    if (PatientDue.PatientBill) {
                        billnumber = PatientDue.PatientBill.BillNumber;
                    }
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;

                    if (PatientDue.User && PatientDue.User.Title && PatientDue.User.Title.Description)
                        drname += PatientDue.User.Title.Description;

                    if (PatientDue.User && PatientDue.User.FirstName)
                        drname += ' ' + PatientDue.User.FirstName;

                    if (PatientDue.User && PatientDue.User.LastName)
                        drname += ' ' + PatientDue.User.LastName;


                    if (PatientDue.Patient && PatientDue.Patient.Title && PatientDue.Patient.Title.Description)
                        PatientName += PatientDue.Patient.Title.Description;

                    if (PatientDue.Patient && PatientDue.Patient.FirstName)
                        PatientName += ' ' + PatientDue.Patient.FirstName;

                    if (PatientDue.Patient && PatientDue.Patient.LastName)
                        PatientName += ' ' + PatientDue.Patient.LastName;

                    if (PatientDue.Patient && PatientDue.Patient.MRN)
                        PatientName += ' / ' + PatientDue.Patient.MRN;

                    if (!PatientName)
                        PatientName = PatientDue.PatientName;

                    if (PatientDue.ReceiptTypeId == 3 && PatientDue.PatientBill) {
                        // if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientDue.CreatedBy) {
                        if (PatientDue.PaymentTypeId == 1 && PatientDue.ReceiptStatusId == 1) {
                            Cash = PatientDue.AmountPaid;
                            $scope.TotCashDue += PatientDue.AmountPaid;
                            $scope.TotDues += PatientDue.AmountPaid;
                        } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6 && PatientDue.ReceiptStatusId == 1) {
                            Card = PatientDue.AmountPaid;
                            $scope.TotCardDue += PatientDue.AmountPaid;
                            $scope.TotDues += PatientDue.AmountPaid;
                        } else if (PatientDue.PaymentTypeId == 2 && PatientDue.PaymentTypeId == 3 && PatientDue.PaymentTypeId == 4 && PatientDue.ReceiptStatusId == 1) {
                            ChequeOthers = PatientDue.AmountPaid;
                            $scope.TotChequeOthersDue += PatientDue.AmountPaid;
                            $scope.TotDues += PatientDue.AmountPaid;
                        }

                        if (PatientDue.ReceiptStatus && PatientDue.ReceiptStatus.Description) {
                            Status = PatientDue.ReceiptStatus.Description;
                        }

                        if (PatientDue.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            //$scope.TotCardDue = 0; 
                            //$scope.TotChequeOthersDue = 0;
                        } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6) { //CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            //$scope.TotCashDue = 0; 
                            //$scope.TotChequeOthersDue = 0;
                        } else if (PatientDue.PaymentTypeId == 2 || PatientDue.PaymentTypeId == 3 || PatientDue.PaymentTypeId == 4) { // CHEQUE
                            Cash = 0;
                            Card = 0;
                            //$scope.TotCashDue = 0; 
                            //$scope.TotCardDue = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                            //$scope.TotDues += (Cash + Card + ChequeOthers);
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReceiptDt: receiptDt,
                                Receiptnumber: receiptnumber,
                                Billnumber: billnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                Status: Status,
                                MBillType: 1,
                            };
                            SNo++;
                            $scope.PaymentOPDueCollections.push(PaymentCollectionModel);
                        }
                        // }
                    }
                }
            }

            try {
                $scope.TotCashDue = ($scope.TotCashDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCardDue = ($scope.TotCardDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthersDue = ($scope.TotChequeOthersDue).toFixed(2);
            } catch (e) { }

        };
        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 26,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.UserId
                    },
                    {
                        Key: 5,
                        Value: 1
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 11,
                        Value: [1, 4]
                    },
                    {
                        Key: 13,
                        Value: false
                    },
                ],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
            };

            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;

            if ($scope.currentfilter.FromDate || $scope.currentfilter.ToDate) {
                inputData.Params.push({
                    Key: 27,
                    Value: From
                })
                inputData.Params.push({
                    Key: 28,
                    Value: To
                });
            }

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
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
            $state.go('app.billingreportstab.opinvoicebillingreport')
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
                    Key: 27,
                    Value: From
                },
                {
                    Key: 28,
                    Value: To
                },
                {
                    Key: 26,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 11,
                    Value: [1, 4]
                },
                {
                    Key: 13,
                    Value: false
                },
                ],
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintOPDueCollectionReport',
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
            $scope.UserName = result;
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
            var inputData = [{
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

    }

    ipcreditreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();