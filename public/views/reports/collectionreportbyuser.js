(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CollectionReportByUsersController', CollectionReportByUsersController);

    function CollectionReportByUsersController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.lookup = {};
        $scope.lookup.PaymentType = [];


        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.UserId = utl.Session.getCurrentUserId();
        $scope.currentfilter.PaymentTypeId = -1;

        $scope.Patientpaymentdetails = false;
        $scope.PatientRefunds = false;

        $scope.Cash = 0;
        $scope.Card = 0;
        $scope.Other = 0;
        $scope.NetCollection = 0;


        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     $scope.Patientpaymentdetails= res.Data;
        $scope.getCollectionListCallback = function (scope, res, options, hasError) {
            $scope.Paymentdetails = [];
            $scope.TotalCash = 0;
            $scope.TotalCard = 0;
            $scope.TotalOther = 0;
            $scope.TotalCollection = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.Patientpaymentdetails = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var Patientpaymentdetails = res.Data[idx];

                    var UserName = '';
                    var Cash = 0;
                    var Card = 0;
                    var Others = 0;
                    var NetCollection = 0;

                    if (Patientpaymentdetails.CreatedUser && Patientpaymentdetails.CreatedUser.Title && Patientpaymentdetails.CreatedUser.Title.Description) {
                        UserName += Patientpaymentdetails.CreatedUser.Title.Description;
                    }
                    if (Patientpaymentdetails.CreatedUser && Patientpaymentdetails.CreatedUser.FirstName) {
                        UserName += ' ' + Patientpaymentdetails.CreatedUser.FirstName;
                    }
                    if (Patientpaymentdetails.CreatedUser && Patientpaymentdetails.CreatedUser.LastName) {
                        UserName += ' ' + Patientpaymentdetails.CreatedUser.LastName;
                    }
                    if (Patientpaymentdetails.CreatedUser && Patientpaymentdetails.CreatedUser.MRN) {
                        UserName += ' ' + Patientpaymentdetails.CreatedUser.MRN;
                    }
                    if (!UserName) {
                        UserName = Patientpaymentdetails.UserName;
                    }
                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == Patientpaymentdetails.CreatedBy) {
                        if (Patientpaymentdetails.PaymentTypeId == 1 && Patientpaymentdetails.ReceiptStatusId == 1) {
                            Cash = Patientpaymentdetails.AmountPaid;
                            $scope.TotalCash += Patientpaymentdetails.AmountPaid;
                            $scope.TotalCollection += Patientpaymentdetails.AmountPaid;
                        } else if (Patientpaymentdetails.PaymentTypeId == 5 || Patientpaymentdetails.PaymentTypeId == 6 && Patientpaymentdetails.ReceiptStatusId == 1) {
                            Card = Patientpaymentdetails.AmountPaid;
                            $scope.TotalCard += Patientpaymentdetails.AmountPaid;
                            $scope.TotalCollection += Patientpaymentdetails.AmountPaid;
                        } else if (Patientpaymentdetails.PaymentTypeId == 2 || Patientpaymentdetails.PaymentTypeId == 3 || Patientpaymentdetails.PaymentTypeId == 4 && Patientpaymentdetails.ReceiptStatusId == 1) {
                            ChequeOthers = Patientpaymentdetails.AmountPaid;
                            $scope.TotalOther += Patientpaymentdetails.AmountPaid;
                            $scope.TotalCollection += Patientpaymentdetails.AmountPaid;
                        }

                        if (Patientpaymentdetails.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            Others = 0;
                            //$scope.TotalCardRefunds = 0;
                            //$scope.TotalChequeOtherRefunds = 0;
                        } else if (Patientpaymentdetails.PaymentTypeId == 5 || Patientpaymentdetails.PaymentTypeId == 6) { //CARD
                            Cash = 0;
                            Others = 0;
                            //$scope.TotalCashRefunds = 0;
                            //$scope.TotalChequeOtherRefunds = 0;
                        } else if (Patientpaymentdetails.PaymentTypeId == 2 || Patientpaymentdetails.PaymentTypeId == 3 || Patientpaymentdetails.PaymentTypeId == 4) { // CHEQUE
                            Cash = 0;
                            Card = 0;
                            //$scope.TotalCashRefunds = 0;
                            //$scope.TotalCardRefunds = 0;
                        }

                        if (Cash > 0 || Card > 0 || Others > 0) {
                            //$scope.TotalRefunds += (Cash + Card + ChequeOthers);
                            let PatientpaymentdetailsModel = {
                                SNo: SNo,
                                // BillDt: billDt,
                                // Billnumber: billnumber,
                                // RefundDt: refundDt,
                                // Refundnumber: refundnumber,
                                // Drname: drname,
                                UserName: UserName,
                                Cash: Cash,
                                Card: Card,
                                Others: Others,
                                NetCollection: Cash + Card + Others
                            };
                            SNo++;
                            $scope.Paymentdetails.push(PatientpaymentdetailsModel);
                        }
                    }
                }
            }

            try {
                $scope.TotalCash = ($scope.TotalCash).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalCard = ($scope.TotalCard).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalOther = ($scope.TotalOther).toFixed(2);
            } catch (e) { }

            $scope.getRefundList();

        };
        // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;


        $scope.getCollectionList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 27, Value: From },
                    { Key: 28, Value: To },
                ],
                // PageContext: {
                //     PageSize: vm.gridConfig.pagerObj.pageSize,
                //     PageNumber: vm.gridConfig.pagerObj.currentPage
                // }
            };

            // if ($scope.currentfilter.FromDate || $scope.currentfilter.ToDate) {
            //     inputData.Params.push({
            //         Key: 3,
            //         Value: [$scope.currentfilter.FromDate, $scope.currentfilter.ToDate]
            //     })
            // }
            var options = {
                action: 'billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCollectionListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getRefundListCallback = function (scope, res, options, hasError) {
            $scope.Refund = [];
            $scope.TotalCash = 0;
            $scope.TotalCard = 0;
            $scope.TotalOther = 0;
            $scope.TotalCollection = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientRefunds = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientRefunds = res.Data[idx];

                    var UserName = '';
                    var Cash = 0;
                    var Card = 0;
                    var Others = 0;
                    var NetCollection = 0;

                    if (PatientRefunds.CreatedUser && PatientRefunds.CreatedUser.Title && PatientRefunds.CreatedUser.Title.Description) {
                        UserName += PatientRefunds.CreatedUser.Title.Description;
                    }
                    if (PatientRefunds.CreatedUser && PatientRefunds.CreatedUser.FirstName) {
                        UserName += ' ' + PatientRefunds.CreatedUser.FirstName;
                    }
                    if (PatientRefunds.CreatedUser && PatientRefunds.CreatedUser.LastName) {
                        UserName += ' ' + PatientRefunds.CreatedUser.LastName;
                    }
                    if (PatientRefunds.CreatedUser && PatientRefunds.CreatedUser.MRN) {
                        UserName += ' ' + PatientRefunds.CreatedUser.MRN;
                    }
                    if (!UserName) {
                        UserName = PatientRefunds.UserName;
                    }
                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientRefunds.CreatedBy) {
                        if (PatientRefunds.PaymentTypeId == 1 && PatientRefunds.ReceiptStatusId == 1) {
                            Cash = PatientRefunds.RefundAmount;
                            $scope.TotalCash += PatientRefunds.RefundAmount;
                            $scope.TotalCollection += PatientRefunds.RefundAmount;
                        } else if (PatientRefunds.PaymentTypeId == 5 || PatientRefunds.PaymentTypeId == 6 && PatientRefunds.ReceiptStatusId == 1) {
                            Card = PatientRefunds.RefundAmount;
                            $scope.TotalCard += PatientRefunds.RefundAmount;
                            $scope.TotalCollection += PatientRefunds.RefundAmount;
                        } else if (PatientRefunds.PaymentTypeId == 2 || PatientRefunds.PaymentTypeId == 3 || PatientRefunds.PaymentTypeId == 4 && PatientRefunds.ReceiptStatusId == 1) {
                            ChequeOthers = PatientRefunds.RefundAmount;
                            $scope.TotalOther += PatientRefunds.RefundAmount;
                            $scope.TotalCollection += PatientRefunds.RefundAmount;
                        }

                        if (PatientRefunds.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            Others = 0;
                            //$scope.TotalCardRefunds = 0;
                            //$scope.TotalChequeOtherRefunds = 0;
                        } else if (PatientRefunds.PaymentTypeId == 5 || PatientRefunds.PaymentTypeId == 6) { //CARD
                            Cash = 0;
                            Others = 0;
                            //$scope.TotalCashRefunds = 0;
                            //$scope.TotalChequeOtherRefunds = 0;
                        } else if (PatientRefunds.PaymentTypeId == 2 || PatientRefunds.PaymentTypeId == 3 || PatientRefunds.PaymentTypeId == 4) { // CHEQUE
                            Cash = 0;
                            Card = 0;
                            //$scope.TotalCashRefunds = 0;
                            //$scope.TotalCardRefunds = 0;
                        }

                        if (Cash > 0 || Card > 0 || Others > 0) {
                            //$scope.TotalRefunds += (Cash + Card + ChequeOthers);
                            let PatientRefundsModel = {
                                SNo: SNo,
                                // BillDt: billDt,
                                // Billnumber: billnumber,
                                // RefundDt: refundDt,
                                // Refundnumber: refundnumber,
                                // Drname: drname,
                                UserName: UserName,
                                Cash: Cash,
                                Card: Card,
                                Others: Others,
                                NetCollection: Cash + Card + Others
                            };
                            SNo++;
                            $scope.Paymentdetails.push(PatientRefundsModel);
                        }
                    }
                }
            }

            try {
                $scope.TotalCash = ($scope.TotalCash).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalCard = ($scope.TotalCard).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalOther = ($scope.TotalOther).toFixed(2);
            } catch (e) { }

        };
        // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;


        $scope.getRefundList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 12, Value: From },
                    { Key: 13, Value: To },
                ],
                // PageContext: {
                //     PageSize: vm.gridConfig.pagerObj.pageSize,
                //     PageNumber: vm.gridConfig.pagerObj.currentPage
                // }
            };

            // if ($scope.currentfilter.FromDate || $scope.currentfilter.ToDate) {
            //     inputData.Params.push({
            //         Key: 3,
            //         Value: [$scope.currentfilter.FromDate, $scope.currentfilter.ToDate]
            //     })
            // }
            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRefundListCallback
            };

            utl.Http.doAction(options);
        };
        // $scope.onenter = function (data) {
        //     if (data == undefined) {
        //         $scope.getList();
        //     }
        // };
        $scope.backtoReport = function() {
            $state.go('app.reports')
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 27, Value: From },
                    { Key: 28, Value: To },
                ],
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintCollectionReportByUsers',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        // vm.referralcontrolconfig = {
        //     query: '',
        //     searchbyid: false,
        //     options: [
        //         { header: 'Referral Code', field: 'ReferralCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
        //         { header: 'Referral Name', field: 'ReferralName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
        //         { header: 'Referral Type', field: 'ReferralType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
        //         { header: 'PhoneNo', field: 'PhoneNo', datatype: 'string', headercls: 'td-phone', fieldcls: 'td-phone' },
        //         { header: 'Area', field: 'Area', datatype: 'string', headercls: 'td-area', fieldcls: 'td-area' }
        //     ],
        //     searchparams: {},
        //     result: {},
        //     api: 'generalmaster/referral/GetReferrals',
        //     formatdisplay: formatselectedreferral,
        //     presearch: presearchreferral,
        //     postsearch: postsearchreferral
        // };

        // function formatselectedreferral() {
        //     var selectedItem = vm.referralcontrolconfig.selected;
        //     var result = '';
        //     if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //         result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
        //     } else if (vm.referralcontrolconfig.rowdata) {
        //         result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
        //     }
        //     return result;
        // }

        // function presearchreferral() {
        //     var query = vm.referralcontrolconfig.query;
        //     var inputData = {
        //         Params: [

        //         ],
        //         PageContext: { PageSize: 25, PageNumber: 1 }
        //     };

        //     if (vm.referralcontrolconfig.searchbyid === true) {
        //         inputData.Params.push({ Key: 0, Value: $scope.item.ReferralId });
        //     } else if (query && query.length > 2) {
        //         inputData.Params.push({ Key: 1, Value: query });
        //     }

        //     vm.referralcontrolconfig.searchparams = inputData;
        // }

        // function postsearchreferral() {
        //     for (var idx in vm.referralcontrolconfig.result) {
        //         var item = vm.referralcontrolconfig.result[idx];
        //         item.ReferralCode = item.ReferralCode;
        //         if (item.ReferralType)
        //             item.ReferralType = item.ReferralType.Description;
        //         item.PhoneNo = item.PhoneNo;
        //         if (item.AddressLine1)
        //             item.Area = item.AddressLine1 + ',' + item.CityName;
        //     }
        // }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "SNo",
                displayName: $translate.instant('reports.snum.lbl')
            },
            {
                field: "UserName",
                displayName: $translate.instant('reports.username.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='row.entity.CreatedUser.Title && row.entity.CreatedUser.Title.Description'>{{row.entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{row.entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{row.entity.CreatedUser.LastName}}</span>\
                                        </div>"
            },
            // {
        //         field: "Age",
        //         displayName: $translate.instant('reports.age.lbl'),
        //         cellTemplate: "<div class='ui-grid-cell-contents'>\
        //                    <span>{{row.entity.Age}}</span>&nbsp;/<span>{{row.entity.Gender.Description}}</span>\
        //                              </div>"
        //     },
        //     {
        //         field: "MRN",
        //         displayName: $translate.instant('reports.mrn.lbl')
        //     },

        //     {
        //         field: "AdmissionDate",
        //         displayName: $translate.instant('reports.visit.lbl'),
        //         cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.Encounter.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{row.entity.Encounter.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
        //     },
        //     {
        //         field: "Referral.ReferralName",
        //         displayName: $translate.instant('reports.referraldoctor.lbl')
        //     },
        //     {
        //         field: "CityMaster.CityName",
        //         displayName: $translate.instant('reports.city.lbl')
        //     },
        //     {
        //         field: "Encounter.ClinicalNotes",
        // //         displayName: $translate.instant('reports.reason.lbl')
        //     },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getList();
        // }
        $scope.getList = function () {
            //var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            //var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            $scope.getCollectionList();
            $scope.getRefundList();

        };

        // $scope.initLookup = function () {
        //     $scope.lookup.PaymentType.push({
        //         Id: -1,
        //         Text: "Please Select"
        //     });
        //     $scope.lookup.PaymentType.push({
        //         Id: 1,
        //         Text: "CASH"
        //     });
        //     $scope.lookup.PaymentType.push({
        //         Id: 2,
        //         Text: "CARD"
        //     });
        //     $scope.lookup.PaymentType.push({
        //         Id: 3,
        //         Text: "OTHERS"
        //     });
        //     $scope.getList();
        // };

        $scope.getCollectionList();

    }

    CollectionReportByUsersController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();