(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VendorPaymentsController', VendorPaymentsController);

    function VendorPaymentsController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;


        $scope.lookup = {};
        var savehitcompleted = 0;
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            VendorPaymentStatusId: -1,
            VendorPaymentDate: utl.Formatter.getCurrentDate(),
            CreatedBy: utl.Session.getCurrentUserId(),
            ApprovedBy: utl.Session.getCurrentUserId(),
            PaymentTypeId: 1,
            isDisabled: false,
            DisplayVendorPaymentStatus: null,
            VendorPaymentIdentifier: ''
        };
        $scope.CanShowBtn = true;
        $scope.currentcontext = {
            id: 0
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.VendorPaymentDetail = [];
        $scope.grnitem = [];

        $scope.getvendorpaymentCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.VendorPaymentStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayVendorPaymentStatus = 'Draft';
            }
            if (data.VendorPaymentStatusId == 2) {
                $scope.CanShowBtn = false;
                $scope.item.isDisabled = true;
                $scope.item.DisplayVendorPaymentStatus = 'Completed';
            }
            if (data.VendorPaymentStatusId == 3) {
                $scope.CanShowBtn = false;
                $scope.item.isDisabled = true;
                $scope.item.DisplayVendorPaymentStatus = 'Cancelled';
            }
        };

        $scope.getvendorpayment = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/VendorPayment/GetVendorPaymentById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getvendorpaymentCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getvendorpaymentDetailsCallback = function (scope, res, options, hasError) {
            $scope.VendorPaymentDetail = [];
            for (var idx in res.Data) {
                var VenpayDetail = res.Data[idx];
                VenpayDetail.InvoiceNumber = VenpayDetail.InvoiceNo;
                VenpayDetail.IdNumber = VenpayDetail.GrnNo;
                VenpayDetail.Date = VenpayDetail.GrnDate;
                $scope.VendorPaymentDetail.push(VenpayDetail);
            }
            $scope.addNewLineItem();

        };

        $scope.getvendorpaymentDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    },

                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/VendorPaymentDetails/GetVendorPaymentDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getvendorpaymentDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.addNewLineItem = function () {
            var VenPayDetail = {
                Id: 0,
                SNo: 0,
                InvoiceNo: '',
                GrnNo: '',
                InvoiceDate: '',
                GrnDate: '',
                TDSAmount: '',
                WriteOff: '',
                PaidAmount: '',
                NetAmount: '',
                BalanceAmount: ''
            };
            if ($scope.currentcontext.id > 0) {
                VenPayDetail.id = $scope.currentcontext.id;
            }
            $scope.VendorPaymentDetail.push(VenPayDetail);

        }

        $scope.getItemCallBack = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.VendorPaymentDetail = res.Data[0];
                $scope.VendorPaymentDetail.PaymentDate = new Date($scope.VendorPaymentDetail.PaymentDate);
                $scope.currentcontext.PaymentTypeId = $scope.VendorPaymentDetail.PaymentTypeId;
                $scope.VendorPaymentDetail.grnitem.forEach((grnitem, i) => {
                    var item = {
                        Id: 0,
                        GrnId: grnitem.Id,
                        VendorPaymentStatusId: 2,
                        Comments: grnitem.Comments
                    }
                    $scope.grnitem.push(item);
                });
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputParams = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 10,
                        PageNumber: 1
                    }
                };
                var actionName = 'pharmacy/VendorPayment/GetVendorPayments';
                var options = {
                    action: actionName,
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getItemCallBack
                };
                utl.Http.doAction(options);
            } else {
                $scope.getgrnList();
            }
        };
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            VendorMasterId: -1,
            GrnNumber: '',
            InvoiceNumber: '',
        };
        $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/VendorPayment/PrintVendorPayment',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }




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

            if (selectedItem && selectedItem.Id)
                $scope.currentfilter.UserId = selectedItem.Id;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: utl.Session.getCurrentFacilityId()
                },],
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
            }
        }

        vm.grncontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Grn No',
                field: 'GrnNumber',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Inv No',
                field: 'InvoiceNumber',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Inv Amount',
                field: 'TotalNetAmount',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Supplier Name',
                field: 'VendorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/grn/GetGrnList',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.grncontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GrnNumber].join('  ');
            } else if (vm.grncontrolconfig.rowdata) {
                result = [vm.grncontrolconfig.rowdata.GrnId, vm.grncontrolconfig.rowdata.GrnNumber].join(' ');
            }

            if (selectedItem && selectedItem.Id)
                $scope.currentfilter.GrnId = selectedItem.Id;

            return result;
        }

        function presearchuser() {
            var query = vm.grncontrolconfig.query;
            var inputData = {
                Params: [
                    {
                        Key: 4,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 6,
                        Value: [2, 3, 4]
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.grncontrolconfig.searchbyid == true) {
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

            vm.grncontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.grncontrolconfig.result) {
                var item = vm.grncontrolconfig.result[idx];
                item.GrnId = item.Id;
            }
        }

        // vm.purchasereturncontrolconfig = {
        //     query: '',
        //     searchbyid: false,
        //     options: [{
        //         header: 'Return No',
        //         field: 'PrnNumber',
        //         datatype: 'string',
        //         headercls: 'td-code',
        //         fieldcls: 'td-code'
        //     },
        //     // {
        //     //     header: 'Inv No',
        //     //     field: 'Grn.GrnNumber',
        //     //     datatype: 'string',
        //     //     headercls: 'td-name',
        //     //     fieldcls: 'td-name'
        //     // },
        //     {
        //         header: 'Return Amt',
        //         field: 'TotalNetAmount',
        //         datatype: 'string',
        //         headercls: 'td-name',
        //         fieldcls: 'td-name'
        //     },
        //     {
        //         header: 'Supplier Name',
        //         field: 'Grn.VendorName',
        //         datatype: 'string',
        //         headercls: 'td-name',
        //         fieldcls: 'td-name'
        //     }
        //     ],
        //     searchparams: {},
        //     result: {},
        //     api: 'pharmacy/PurchaseReturn/GetPurchaseReturns',
        //     formatdisplay: formatselecteduser,
        //     presearch: presearchuser,
        //     postsearch: postsearchuser
        // };

        // function formatselecteduser() {
        //     var selectedItem = vm.purchasereturncontrolconfig.selected;
        //     var result = '';
        //     if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //         result = [selectedItem.PrnNumber].join('  ');
        //     } else if (vm.purchasereturncontrolconfig.rowdata) {
        //         result = [vm.purchasereturncontrolconfig.rowdata.PurchaseReturnId, vm.purchasereturncontrolconfig.rowdata.PrnNumber].join(' ');
        //     }

        //     if (selectedItem && selectedItem.Id)
        //         $scope.currentfilter.PurchaseReturnId = selectedItem.Id;

        //     return result;
        // }

        // function presearchuser() {
        //     var query = vm.purchasereturncontrolconfig.query;
        //     var inputData = {
        //         Params: [
        //             {
        //                 Key: 3,
        //                 Value: $scope.currentfilter.VendorMasterId
        //             },
        //             {
        //                 Key: 5,
        //                 Value: [2, 3, 4]
        //             },
        //         ],
        //         PageContext: {
        //             PageSize: 25,
        //             PageNumber: 1
        //         }
        //     };

        //     if (vm.purchasereturncontrolconfig.searchbyid == true) {
        //         inputData.Params.push({
        //             Key: 0,
        //             Value: query
        //         });
        //     } else if (query && query.length > 2) {
        //         inputData.Params.push({
        //             Key: 1,
        //             Value: query
        //         });
        //     }

        //     vm.purchasereturncontrolconfig.searchparams = inputData;
        // }

        // function postsearchuser() {
        //     for (var idx in vm.purchasereturncontrolconfig.result) {
        //         var item = vm.purchasereturncontrolconfig.result[idx];
        //         item.PurchaseReturnId = item.Id;
        //     }
        // }


        $scope.getPurchasereturnListCallback = function (scope, res, options, hasError) {
            $scope.prnItem = [];
            $scope.VendorPaymentDetail = $scope.prnItem || [];
            for (var prnidx in res.Data) {
                var prnitems = res.Data[prnidx];
                prnitems.picktypeId = 2;
                prnitems.Date = prnitems.PrnDate;
                prnitems.InvoiceAmount = prnitems.TotalNetAmount;
                prnitems.IdNumber = prnitems.PrnNumber;
                prnitems.InvoiceAmount = prnitems.TotalInvoiceAmount;
                prnitems.PaidAmount = prnitems.ReceivedAmount;
                prnitems.BalanceAmount = prnitems.BalanceAmount;
                prnitems.WriteOff = prnitems.WriteOff;
                prnitems.TDSAmount = prnitems.TaxAmount;
                prnitems.NetAmount = prnitems.TotalNetAmount;
                $scope.VendorPaymentDetail.push(prnitems);
            }
        };

        $scope.getPurchasereturnList = function (Info) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: Info.selectId
                }]

            };
            var options = {
                action: 'pharmacy/PurchaseReturn/GetPurchaseReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPurchasereturnListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getGrnDetailsCallback = function (scope, res, options, hasError) {
            $scope.grnItem = [];
            $scope.VendorPaymentDetail = $scope.grnItem || [];
            for (var grnidx in res.Data) {
                var grnitems = res.Data[grnidx];
                grnitems.InvoiceNumber = grnitems.InvoiceNumber;
                grnitems.GrnNumber = grnitems.GrnNumber;
                grnitems.InvoiceAmount = grnitems.TotalInvoiceAmount;
                grnitems.PaidAmount = grnitems.ReceivedAmount;
                grnitems.BalanceAmount = grnitems.BalanceAmount;
                grnitems.WriteOff = grnitems.WriteOff;
                grnitems.TDSAmount = grnitems.TaxAmount;
                grnitems.NetAmount = grnitems.TotalNetAmount;
                $scope.VendorPaymentDetail.push(grnitems);
            }
        };

        $scope.getGrnDetails = function () {
            var From = $filter('date')($scope.currentfilter.GrnDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.GrnDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 8,
                    Value: From
                },
                {
                    Key: 9,
                    Value: To
                },
                {
                    Key: 0,
                    Value: $scope.item.GrnId
                },
                {
                    Key: 4,
                    Value: $scope.item.VendorMasterId
                }],
            };

            var options = {
                action: 'pharmacy/grn/GetGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGrnDetailsCallback
            };
            utl.Http.doAction(options);

        };
        // $scope.getgrnItemCallback = function (scope, data, options, hasError) {
        //     var result = data;
        //     $scope.item.GrnId = result.Id;
        //     $scope.item.NetAmount = result.TotalGrossAmount;
        //     $scope.item.BalanceAmount = result.BalanceAmount;
        //     $scope.item.GrnNumber = result.GrnNumber;
        //     $scope.item.PaidAmount = result.ReceivedAmount;
        //     $scope.item.InvoiceNumber = result.InvoiceNumber;
        //     $scope.item.GrnDate = result.GrnDate;
        // };

        // $scope.getgrnItem = function () {
        //     if ($scope.item.GrnId && $scope.item.GrnId > 0) {
        //         var options = {
        //             action: 'pharmacy/grn/GetGrnById',
        //             data: {
        //                 Id: $scope.item.GrnId
        //             },
        //             type: 'post',
        //             onComplete: $scope.getgrnItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };
        $scope.getloadData = function (data) {
            if (data.picktypeId == 1) {
                $scope.getinvoiceList(data);
            }
            if (data.picktypeId == 2) {
                $scope.getPurchasereturnList(data);

            }
            // $scope.griddata = Details.gridDetails || [];
            // for (var grnidx in $scope.getloadDatagriddata) {
            //     var grnitems = $scope.griddata[grnidx];
            //     grnitems.PickTypeId = grnitems.PickTypeId;
            //     grnitems.GrnId = grnitems.GrnId;
            //     grnitems.PurchaseReturnId = grnitems.PurchaseReturnId;
            //     grnitems.Date = grnitems.Date;
            //     grnitems.InvoiceNumber = grnitems.InvoiceNumber;
            //     grnitems.IdNumber = grnitems.IdNumber;
            //     grnitems.InvoiceAmount = grnitems.InvAmt;
            //     grnitems.PaidAmount = grnitems.RecAmt;
            //     grnitems.BalanceAmount = grnitems.BlnceAmt;
            //     grnitems.WriteOff = grnitems.WriteOff;
            //     grnitems.TDSAmount = grnitems.TaxAmount;
            //     grnitems.NetAmount = grnitems.BlnceAmt;
            //     grnitems.Status = 1;
            //     $scope.VendorPaymentDetail.push(grnitems);
            // }
        }

        $scope.PickList = function () {
            utl.Modal.open('app.picklist', {
                params: {
                    id: 0,
                    vid: $scope.item.VendorMasterId
                },
                confirmCallback: $scope.getloadData
            });
        };


        $scope.getinvoiceListCallback = function (scope, res, options, hasError) {
            $scope.grnitem = res.Data || [];
            for (var idx in $scope.grnitem) {
                var grndata = {};
                grndata = $scope.grnitem[idx];
                grndata.IsTDS = grndata.VendorMaster.IsTDS;
                grndata.TDSId = grndata.VendorMaster.TDSId;
                if (grndata.VendorMaster.GstMaster) {
                    grndata.TDSPercentage = grndata.VendorMaster.GstMaster.GstPercentage;
                }
                grndata.picktypeId = 1;

                grndata.Date = grndata.GrnDate;
                grndata.IdNumber = grndata.GrnNumber;
                grndata.InvoiceAmount = grndata.TotalNetAmount;
                grndata.BalanceAmount = grndata.BalanceAmount;
                grndata.PaidAmount = grndata.ReceivedAmount;
                grndata.WriteOff = grndata.WriteOff || 0;

                if (grndata.IsTDS == true) {
                    if (grndata.TaxAmount > 0) {
                        grndata.TDSAmount = grndata.TaxAmount;
                    } else {
                        grndata.TDSAmount = (grndata.InvoiceAmount) * (grndata.TDSPercentage) / 100;
                    }
                }
                if (grndata.ReceivedAmount > 0) {
                    grndata.NetAmount = grndata.BalanceAmount;
                } else {
                    grndata.NetAmount = (grndata.TotalInvoiceAmount) - (grndata.WriteOff || 0) - (grndata.TDSAmount || 0);
                }
                $scope.totalnetamount = grndata.TotalNetAmount;
                grndata.BalanceAmount = grndata.BalanceAmount;
                if ($scope.VendorPaymentDetail.length >= 1) {
                    for (var idx in $scope.VendorPaymentDetail) {
                        var items = $scope.VendorPaymentDetail[idx];
                        if (items.Id == grndata.Id) {
                            utl.Alert.showErrorMsg('Already Load This Invoice');
                            return;
                        }
                    }
                    $scope.VendorPaymentDetail.push(grndata);
                }
                else if ($scope.VendorPaymentDetail.length == 0) {
                    $scope.VendorPaymentDetail.push(grndata);
                }
            }
            $scope.computeamount();
        };


        $scope.getinvoiceList = function (Info) {

            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: Info.SelectedItem.Id
                }]

            };
            var options = {
                action: 'pharmacy/grn/GetGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getinvoiceListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getVendorListCallback = function (scope, res, options, hasError) {
            // $scope.data = res.Data;
            // 
            var items = [];
            var items = res.Data[Vendoridx];
            for (var Vendoridx in res.Data) {
                var items = res.Data[Vendoridx];
                $scope.item.VendorMasterId = items.Id;
                $scope.item.VendorName = items.VendorName;
                $scope.item.Address = items.AddressLine1;
                $scope.item.ContactPerson = items.ContactPerson
                $scope.item.ContactNo = items.MobileNumber;
                $scope.item.Email = items.EmailAddress;
                $scope.item.IsTDS = items.IsTDS;
                $scope.item.TDSId = items.TDSId;
                $scope.item.BillAmount = items.BillAmount;
                $scope.item.BeforeOutstanding = items.OutStandingAmount;
                $scope.item.PaidAmount = items.PaidAmount;
                $scope.item.ReturnedAmount = items.ReturnedAmount;
                $scope.item.OutStandingAmount = items.OutStandingAmount;
                if (items.GstMaster) {
                    $scope.item.TDSPercentage = items.GstMaster.GstName;
                }
            }
            $scope.getgrnList();
        };

        $scope.getVendorList = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentfilter.VendorMasterId
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/vendormaster/GetVendorMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVendorListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getgrnListCallback = function (scope, res, options, hasError) {
            var grntotalnetamount = 0;
            var grntotaloutstangamt = 0;
            var grninvoiceamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.TotalInvoiceAmount = isNaN(parseFloat(item.TotalInvoiceAmount)) ? (0) : parseFloat(item.TotalInvoiceAmount);
                item.BalanceAmount = isNaN(parseFloat(item.BalanceAmount)) ? (0) : parseFloat(item.BalanceAmount);
                item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);
                item.ReceivedAmount = isNaN(parseFloat(item.ReceivedAmount)) ? (0) : parseFloat(item.ReceivedAmount);
                item.WriteOff = isNaN(parseFloat(item.WriteOff)) ? (0) : parseFloat(item.WriteOff);
                grninvoiceamount = item.TotalNetAmount - (item.ReceivedAmount) - (item.TaxAmount) - (item.WriteOff);
                grntotaloutstangamt = grntotaloutstangamt + item.BalanceAmount;
                grntotalnetamount = grntotalnetamount + (item.TotalInvoiceAmount);
            }
            $scope.GrnOutstandingAmount = grntotaloutstangamt;
        };


        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.vendorpayments', {
                    id: 0
                });
            else
                $state.reload();
        };


        $scope.getgrnList = function (Info) {
            // if ($sccope.item.IsPaidFully == 0)
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentfilter.VendorMasterId
                },
                ],
            };
            var options = {
                action: 'pharmacy/grn/GetGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getgrnListCallback
            };

            utl.Http.doAction(options);

        };


        $scope.save = function () {
            $scope.item.VendorPaymentStatusId = 2; // Draft
            $scope.saveItem();
        }

        $scope.backToList = function () {
            $state.go('app.vendorpaymentlist');
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // if (checkMandatoryFields()) {
            //     var lines = getLinesForSave();
            var lines = getVendorDetails();
            var actionName = 'pharmacy/VendorPayment/AddVendorPayment';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/VendorPayment/UpdateVendorPayment';
            }
            $scope.item.Id = $scope.currentcontext.id;
            var inputData = {
                Header: $scope.item,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
            // }
        };
        $scope.computeamount = function () {
            var totalpaidamount = 0;
            var totalrecamt = 0;
            var totalnetamount = 0;
            var totaltdsamount = 0;
            var totaloutstandingamount = 0;
            var writeoff = 0;
            for (var idx in $scope.VendorPaymentDetail) {
                //                 if($scope.VendorPaymentDetail[0].GrnNumber){
                var detailData = $scope.VendorPaymentDetail[idx];
                //                 if (detailData.GrnNumber) {
                detailData.PaidAmount = isNaN(parseFloat(detailData.PaidAmount)) ? (0) : parseFloat(detailData.PaidAmount);
                detailData.NetAmount = isNaN(parseFloat(detailData.NetAmount)) ? (0) : parseFloat(detailData.NetAmount);
                detailData.TDSAmount = isNaN(parseFloat(detailData.TDSAmount)) ? (0) : parseFloat(detailData.TDSAmount);
                detailData.BalanceAmount = isNaN(parseFloat(detailData.BalanceAmount)) ? (0) : parseFloat(detailData.BalanceAmount);
                detailData.WriteOff = isNaN(parseFloat(detailData.WriteOff)) ? (0) : parseFloat(detailData.WriteOff);

                totalpaidamount = totalpaidamount + (detailData.PaidAmount);
                totalrecamt = totalrecamt + (detailData.ReceivedAmount);
                if (detailData.picktypeId == 1) {
                    totalnetamount = totalnetamount + (detailData.TotalNetAmount);
                } else if (detailData.picktypeId == 2) {
                    totalnetamount = totalnetamount - (detailData.TotalNetAmount);
                }
                totaltdsamount = totaltdsamount + (detailData.TDSAmount);
                totaloutstandingamount = totaloutstandingamount + (detailData.BalanceAmount);
                writeoff = writeoff + (detailData.WriteOff);
            }
            //                 if (detailData.PrnNumber) {
            //                     var prndata = $scope.VendorPaymentDetail[idx];
            //                     prndata.NetAmount = isNaN(parseFloat(detailData.NetAmount)) - parseFloat(prndata.NetAmount);
            //                     totalnetamount = totalnetamount + (prndata.NetAmount);
            //                 }
            //             }
            $scope.item.TotalPaidAmount = totalpaidamount;
            $scope.item.TotReciptAmount = totalrecamt;
            $scope.item.TotalNetAmount = totalnetamount;
            $scope.item.TotalTDSAmount = totaltdsamount;
            $scope.item.TotalOutstandingAmount = totaloutstandingamount;
            $scope.item.WriteOff = writeoff;
        }

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.calculateamount = function (item) {
            $scope.balanceamount = 0;
            $scope.NetAmount = 0;
            $scope.WriteOff = 0;
            $scope.ReceiptAmt = 0;
            // for (var idx in $scope.VendorPaymentDetail) {
                // var grndata = $scope.VendorPaymentDetail[idx];
                // grndata.ReceiptAmt = parseFloat(item.ReceiptAmt);
                if (item.ReceivedAmount > 0) {
                    $scope.TotalNetAmount = item.NetAmount;
                } else {
                    $scope.TotalNetAmount = parseInt(item.TotalNetAmount) - parseInt(item.WriteOff || 0);
                } if (item.ReceivedAmount > 0) {
                    $scope.balanceamount = parseInt(item.TotalNetAmount) - parseInt(item.ReceiptAmt || 0);
                } else {
                    $scope.balanceamount = parseInt(item.TotalNetAmount) - parseInt(item.WriteOff || 0) - parseInt(item.ReceiptAmt || 0);
                }
                if (parseInt(item.ReceiptAmt) > parseInt(item.NetAmount)) {
                    utl.Alert.showErrorMsg('ReceivedAmount is greater than NetAmount')
                }
               
                item.NetAmount = $scope.TotalNetAmount;
                item.BalanceAmount = $scope.balanceamount;
            // }
            // grndata.NetAmount = $scope.TotalNetAmount;
            // grndata.BalanceAmount = $scope.balanceamount;
            $scope.computeamount();
        }

        function getVendorDetails() {
            var vendorDetails = [];
            for (var idx in $scope.VendorPaymentDetail) {
                var grndata = $scope.VendorPaymentDetail[idx];
                var vdetail = {
                    Id: 0,
                    GrnId: grndata.Id,
                    InvoiceNo: grndata.InvoiceNumber,
                    InvoiceDate: grndata.InvoiceDate,
                    GrnNo: grndata.GrnNumber,
                    GrnDate: grndata.GrnDate,
                    InvoiceAmount: grndata.TotalNetAmount,
                    ReceiptAmount: grndata.ReceiptAmount,
                    ReceiptAmt: grndata.ReceiptAmt,
                    PaidAmount: grndata.ReceiptAmt,
                    BalanceAmount: grndata.BalanceAmount,
                    TDSAmount: grndata.TDSAmount,
                    WriteOff: grndata.WriteOff,
                    NetAmount: grndata.NetAmount,

                }

                vendorDetails.push(vdetail);
            }
            return vendorDetails;
        }
        // $scope.draftDelete = function () {
        //     utl.Dialog.confirmDelete($scope.DeleteConfirmed, $scope.currentcontext.id);
        // };

        $scope.deleteDetail = function (idx, selectedItem) {
            // if (selectedItem.GrnId > 0) {
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
            // }
        };

        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        //     $scope.getList();
        // };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $state.reload();
        };

        $scope.onDeleteConfirmed = function (index, selectedItem) {
            index.Status = 2;
            var index1 = $scope.VendorPaymentDetail.indexOf(index);
            $scope.VendorPaymentDetail.splice(index1, 1);
        };

        $scope.DeleteComplete = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id, 'this Bill');
        };

        function checkMandatoryFields() {
            for (var idx in $scope.VendorPaymentDetail) {
                var idxitem = $scope.VendorPaymentDetail[idx];
                if (idxitem.VendorMasterId <= 0) {
                    utl.Alert.showErrorMsg('Please Select Vendor ');
                    return false;
                } else {
                    if (idxitem.VendorMasterId <= 0 && idxitem.GrnNumber == '') {
                        utl.Alert.showErrorMsg('Please Select GRN NO OR Invoice No ');
                        return false;
                    }
                }
            }

            return true;
        }

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [{
                header: 'Supplier Code',
                field: 'VendorCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Supplier Name',
                field: 'VendorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Supplier Contact',
                field: 'MobileNumber',
                datatype: 'string',
                headercls: 'td-phoneno',
                fieldcls: 'td-phoneno'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
                $scope.currentfilter.VendorCode = selectedItem.VendorCode;
                $scope.currentfilter.VendorName = selectedItem.VendorName;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 1
                }, {
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {

                var item = vm.vendorcontrolconfig.result[idx];

                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "InvoiceNumber",
                displayName: $translate.instant('inventory.vendorpayments.invoiceno.lbl')
            },
            {
                field: "GrnNumber",
                displayName: $translate.instant('inventory.vendorpayments.grnno.lbl')
            },
            {
                field: "ItemMaster.ItemName",
                displayName: $translate.instant('inventory.vendorpayments.date.lbl'),
                cellTemplate: "<ngformatdate date-val='entity.ExpiryDate'></ngformatdate>"
            },
            {
                field: "TotalGrossAmount",
                displayName: $translate.instant('inventory.vendorpayments.grossamount.lbl')
            },
            {
                field: "TotalDiscountAmount",
                displayName: $translate.instant('inventory.vendorpayments.discountamount.lbl')
            },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('inventory.vendorpayments.netamount.lbl'),

            },
            {
                field: "TotalCreditAmount",
                displayName: $translate.instant('inventory.vendorpayments.creditamount.lbl')
            },
            {
                field: "TotalBalanceAmount",
                displayName: $translate.instant('inventory.vendorpayments.balanceamount.lbl')
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        function loadData() {
            $scope.getvendorpayment();
            $scope.getvendorpaymentDetails();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                loadData();
            }
        };


        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     forEach(data, function (value, key) {
        //         $scope.lookup[key] = value;

        //     });
        //     // $scope.getgrnList();
        // };

        $scope.initLookup = function () {
            var inputData = [
                // {
                //     "Key": "PaymentType"
                // },
                {
                    "Key": "PaymentType",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: 2
                        }]
                    }
                },
                {
                    "Key": "Bank"
                },
                {
                    "Key": "CardType"
                },
                {
                    "Key": "Terminal"
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "VendorPaymentStatus"
                }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    VendorPaymentsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();