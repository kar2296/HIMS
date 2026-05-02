(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyRefundReportController', PharmacyRefundReportController);

    function PharmacyRefundReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalrefamount = 0;  
            for (var idx in res.Data) {
                var item = res.Data[idx];
            if ($scope.currentfilter.PaymentTypeId > 0) {
                $scope.PaymentType = res.Data[0].PaymentType.Description;
            }
            totalrefamount = totalrefamount + (item.RefundAmount);
            vm.gridConfig.data.push(item);
        }
        $scope.TotalRefundAmount = totalrefamount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

            var Cash = 0;
            var Card = 0;
            var ChequeOthers = 0;
            $scope.TotCash = 0;
            $scope.TotCard = 0;
            $scope.TotChequeOthers = 0;
            $scope.TotSales = 0;
            for (var payrefidx in vm.gridConfig.data) {
                var PatientRefund = vm.gridConfig.data[payrefidx];
                if (PatientRefund.RefundTypeId == 4) {
                    if (PatientRefund.PaymentTypeId == 1 && PatientRefund.RefundStatusId == 1) {
                        Cash = PatientRefund.RefundAmount;
                        $scope.TotCash += PatientRefund.RefundAmount;
                        $scope.TotSales += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6 && PatientRefund.RefundStatusId == 1) {
                        Card = PatientRefund.RefundAmount;
                        $scope.TotCard += PatientRefund.RefundAmount;
                        $scope.TotSales += PatientRefund.RefundAmount;
                    } else if ((PatientRefund.PaymentTypeId == 2 || PatientRefund.PaymentTypeId == 3 || PatientRefund.PaymentTypeId == 4) && PatientRefund.RefundStatusId == 1) {
                        ChequeOthers = PatientRefund.RefundAmount;
                        $scope.TotChequeOthers += PatientRefund.RefundAmount;
                        $scope.TotSales += PatientRefund.RefundAmount;
                    }
                    if (PatientRefund.PaymentTypeId == 1) { // CASH
                        Card = 0;
                        ChequeOthers = 0;
                    } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6) { //CARD
                        Cash = 0;
                        ChequeOthers = 0;
                    } else if (PatientRefund.PaymentTypeId == 2 || PatientRefund.PaymentTypeId == 3 || PatientRefund.PaymentTypeId == 4) { // CHEQUE
                        Cash = 0;
                        Card = 0;
                    }

                    if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                        let PaymentrefundModel = {
                            Cash: Cash,
                            Card: Card,
                            ChequeOthers: ChequeOthers,
                        };
                        $scope.RefundData = PaymentrefundModel;
                    }
                    // }
                }
            }
        }; 

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 12,
                    Value: From
                },
                {
                    Key: 13,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
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
        $scope.backtoReport = function() {
            $state.go('app.reports')
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    UserName: $scope.currentfilter.UserName,
                    PaymentType: $scope.PaymentType
                },
                Params: [{
                    Key: 12,
                    Value: From
                },
                {
                    Key: 13,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                ],
            };
            var options = {
                action: 'Billing/PatientRefund/PrintPharmacyRefundReport',
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
                field: "PatientReturn.ReturnDateTime",
                displayName: $translate.instant('reports.returndate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientReturn.ReturnDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientReturn.ReturnNumber",
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
                field: "PatientReturn.ReturnAmount",
                displayName: $translate.instant('reports.returnamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientReturn.ReturnAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PatientReturn.DiscountAmount",
                displayName: $translate.instant('reports.returndis.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientReturn.DiscountAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PatientReturn.NetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientReturn.NetAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('reports.paymenttype.lbl')
            },
            {
                field: "RefundAmount",
                displayName: $translate.instant('reports.refundamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RefundAmount | displaycurrency}}</span>" + "</div>"
            },   
            {
                field: "Cashier Name",
                displayName: $translate.instant('reports.cashiername.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
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
                "Key": "PaymentType"
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

    PharmacyRefundReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();