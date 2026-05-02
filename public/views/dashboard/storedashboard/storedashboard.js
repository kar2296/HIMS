(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StoredashboardController', StoredashboardController);

    function StoredashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = [];
        $scope.lookup = {};
        $scope.ExpiredData = [];
        $scope.NearExpiryData = [];
        $scope.PurchaseIndent = [];
        $scope.PendingIndents = [];
        $scope.PurchaseIndentApproval = [];
        $scope.PendingReceive = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), +30),
            FromTodayDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToTodayDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.item = {
            StoreMasterId: 0
        };

        $scope.Items = [];
        // $scope.ExpiredMedicine = [];
        $scope.Items.appoinmentCount = '0';
        $scope.Items.checkedincount = '0';
        $scope.Items.inpatientcount = '0';
        $scope.Items.otschedulecount = '0';
        $scope.Items.otnotescount = '0';
        $scope.Items.pendingdischargescount = '0';
        $scope.Items.labresultcount = '0';
        $scope.Items.imagingradiologycount = '0';
        $scope.Items.endoscopycount = '0';
        $scope.Items.abnormalcount = '0';
        $scope.Items.prescriptioncount = '0';
        $scope.Items.surgeryrequestcount = '0';
        $scope.Items.admissionrequestcount = '0';
        $scope.Items.physiotheraphycount = '0';


        $scope.currentcontext.CanPurchaseOrders = utl.Privilege.hasAccess('CanPurchaseOrders');
        $scope.currentcontext.CanInvoiceEntry = utl.Privilege.hasAccess('CanInvoiceEntry');
        $scope.currentcontext.CanPurchase_Order_Pending_Approvals = utl.Privilege.hasAccess('CanPurchase_Order_Pending_Approvals');
        $scope.currentcontext.CanInvoice_Returns = utl.Privilege.hasAccess('CanInvoice_Returns');
        $scope.currentcontext.CanStock_Indents = utl.Privilege.hasAccess('CanStock_Indents');
        $scope.currentcontext.CanIndent_WorkLists = utl.Privilege.hasAccess('CanIndent_Work_Lists');
        $scope.currentcontext.CanStock_Status = utl.Privilege.hasAccess('CanStock_Status');
        $scope.currentcontext.CanStock_Movement = utl.Privilege.hasAccess('CanStock_Movement');
        $scope.currentcontext.CanStock_Receives = utl.Privilege.hasAccess('CanStock_Receives');
        $scope.currentcontext.CanCustomer_Sales = utl.Privilege.hasAccess('CanCustomer_Sales');
        $scope.currentcontext.CanCustomer_Returns = utl.Privilege.hasAccess('CanCustomer_Returns');
        $scope.currentcontext.CanStoreReports = utl.Privilege.hasAccess('CanStoreReports');
        $scope.currentcontext.CanVendorPayment = utl.Privilege.hasAccess('CanVendorPayment');

        // $scope.getdoctDashboardCountCallBack = function (scope, res, options, hasError) {
        //     $scope.Items.appoinmentCount = res.appointment.appoinmentCount;
        //     $scope.Items.checkedincount = res.mycheckedin.checkedincount;
        // $scope.Items.inpatientcount = res.myinpatient.inpatientcount;
        // $scope.Items.otschedulecount = res.otschedule.otschedulecount;
        // $scope.Items.otnotescount = res.reviewnotes.otnotescount;
        // $scope.Items.pendingdischargescount = res.pendingdischarge.pendingdischargescount;
        // $scope.Items.labresultcount = res.resultreview.labresultcount;
        // $scope.Items.imagingradiologycount = res.radiologyresult.imagingradiologycount;
        // $scope.Items.endoscopycount = res.endoscopyresults.endoscopycount;
        // $scope.Items.abnormalcount = res.abnormalresults.abnormalcount;
        // $scope.Items.prescriptioncount = res.prescription.prescriptioncount;
        // $scope.Items.surgeryrequestcount = res.surgeryrequest.surgeryrequestcount;
        // $scope.Items.admissionrequestcount = res.admissionrequest.admissionrequestcount;
        // $scope.Items.physiotheraphycount = res.physiotheraphy.physiotheraphycount;
        // $scope.Items.doctormedicalauditcount = res.doctormedicalauditcount.doctormedicalauditcount;


        //     if (!$scope.Items.appoinmentCount)
        //         $scope.Items.appoinmentCount = '0';
        //     if (!$scope.Items.checkedincount)
        //         $scope.Items.checkedincount = '0';
        //     if (!$scope.Items.inpatientcount)
        //         $scope.Items.inpatientcount = '0';
        //     if (!$scope.Items.otschedulecount)
        //         $scope.Items.otschedulecount = '0';
        //     if (!$scope.Items.otnotescount)
        //         $scope.Items.otnotescount = '0';
        //     if (!$scope.Items.pendingdischargescount)
        //         $scope.Items.pendingdischargescount = '0';
        //     if (!$scope.Items.labresultcount)
        //         $scope.Items.labresultcount = '0';
        //     if (!$scope.Items.imagingradiologycount)
        //         $scope.Items.imagingradiologycount = '0';
        //     if (!$scope.Items.endoscopycount)
        //         $scope.Items.endoscopycount = '0';
        //     if (!$scope.Items.abnormalcount)
        //         $scope.Items.abnormalcount = '0';
        //     if (!$scope.Items.prescriptioncount)
        //         $scope.Items.prescriptioncount = '0';
        //     if (!$scope.Items.surgeryrequestcount)
        //         $scope.Items.surgeryrequestcount = '0';
        //     if (!$scope.Items.admissionrequestcount)
        //         $scope.Items.admissionrequestcount = '0';
        //     if (!$scope.Items.physiotheraphycount)
        //         $scope.Items.physiotheraphycount = '0';
        //     if (!$scope.Items.doctormedicalauditcount)
        //         $scope.Items.doctormedicalauditcount = '0';
        // };

        $scope.getExpiredMedicineCallback = function (scope, data, options, hasError) {
            $scope.ExpiredData = data.Data;
            $scope.ExpiredData = [];
            for (var idx in data.Data) {
                var storemaster = data.Data[idx];
                if (storemaster.Quantity > 0) {
                    $scope.ExpiredData.push(storemaster);
                }
            }

        };

        $scope.getExpiredMedicine = function () {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [
                    {
                        Key: 8,
                        Value: TodayDate
                    },
                    {
                        Key: 2,
                        Value: $scope.item.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: 15,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetExpiredSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getExpiredMedicineCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getpendingindentsCallback = function (scope, data, options, hasError) {
            $scope.PendingIndents = data.Data;
        };

        $scope.getpendingindents = function () {

            var fromDate = $filter('date')($scope.currentcontext.FromTodayDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentcontext.ToTodayDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    { Key: 4, Value: [fromDate, toDate] },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 7,
                        Value: $scope.item.StoreMasterId
                    }]
            };

            var options = {
                action: 'pharmacy/stockrequest/GetStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpendingindentsCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getPendingreceiveCallback = function (scope, data, options, hasError) {
            $scope.PendingReceive = data.Data;
        };

        $scope.getPendingreceive = function () {
            var fromDate = $filter('date')($scope.currentcontext.FromTodayDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentcontext.ToTodayDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 4, Value: [fromDate, toDate] },
                    { Key: 5, Value: $scope.currentcontext.FacilityId },
                    { Key: 7, Value: $scope.item.StoreMasterId },
                    { Key: 9, Value: 1 },
                ]
            };
            var options = {
                action: 'pharmacy/StockTransfer/GetStockTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingreceiveCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getpurchaseindentCallback = function (scope, data, options, hasError) {
            $scope.PurchaseIndent = data.Data;
        };

        $scope.getpurchaseindent = function () {
            var fromDate = $filter('date')($scope.currentcontext.FromTodayDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentcontext.ToTodayDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.item.StoreMasterId },
                    { Key: 4, Value: 2 },
                    { Key: 5, Value: $scope.currentcontext.FacilityId },
                    { Key: 6, Value: [fromDate, toDate] },
                ]
            };
            var options = {
                action: 'pharmacy/purchaserequest/GetPurchaseRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpurchaseindentCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getpurchaseindentapprovalCallback = function (scope, data, options, hasError) {
            $scope.PurchaseIndentApproval = data.Data;
        };

        $scope.getpurchaseindentapproval = function () {
            var fromDate = $filter('date')($scope.currentcontext.FromTodayDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentcontext.ToTodayDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.item.StoreMasterId },
                    { Key: 4, Value: 2 },
                    { Key: 5, Value: $scope.currentcontext.FacilityId },
                    { Key: 6, Value: [fromDate, toDate] },
                ]
            };
            var options = {
                action: 'pharmacy/purchaserequest/GetPurchaseRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpurchaseindentapprovalCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getPurchaseorderapprovalCallback = function (scope, data, options, hasError) {
            $scope.Purchaseorderapproval = data.Data;
        };

        $scope.getPurchaseorderapproval = function () {
            var fromDate = $filter('date')($scope.currentcontext.FromTodayDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentcontext.ToTodayDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 7, Value: [fromDate, toDate] },
                    { Key: 6, Value: $scope.item.StoreMasterId },
                    { Key: 4, Value: 2 },
                    { Key: 16, Value: $scope.currentcontext.FacilityId },
                ],
            };

            var options = {
                action: 'pharmacy/purchaseorder/GetPurchaseOrderList',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPurchaseorderapprovalCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getNearExpiryCallback = function (scope, data, options, hasError) {
            $scope.NearExpiryData = data.Data;
            // $scope.NearExpiryData = [];
            // for (var idx in data.Data) {
            //     var storemaster = data.Data[idx];
            //     storemaster.ExpiryWarningDays = storemaster.StoreMaster.ExpiryWarningDays;
            //     $scope.NearExpiryData.push(storemaster);
            // }

        };
        $scope.getNearExpiry = function () {
            $scope.currentcontext.warningToDate = utl.Formatter.addDays(utl.Formatter.getCurrentDate(), +$scope.item.ExpiryWarningDays);
            var From = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.warningToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 7,
                        Value: From
                    },
                    {
                        Key: 8,
                        Value: To
                    },
                    {
                        Key: 11,
                        Value: '0'
                    },
                    { Key: 2, Value: $scope.item.StoreMasterId },
                ],
                PageContext: {
                    PageSize: 15,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getNearExpiryCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getNonMovementListCallback = function (scope, data, options, hasError) {
            $scope.NonMovement = [];
            $scope.NonMovement = data;
        };

        $scope.getNonMovementList = function () {
            var From = $filter('date')($scope.currentcontext.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: $scope.currentcontext.ToTodayDate,
                },
                Params: [
                    {
                        Key: 11,
                        Value: '0'
                    },
                    { Key: 2, Value: $scope.item.StoreMasterId },

                ],
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItemsforNonMovements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getNonMovementListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getHighPriceListCallback = function (scope, data, options, hasError) {
            $scope.HighPrice = [];
            $scope.HighPrice = data.Data;
        };

        $scope.getHighPriceList = function () {
            var From = $filter('date')($scope.currentcontext.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: $scope.currentcontext.ToTodayDate,
                },
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 11,
                        Value: $scope.item.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };

            var options = {
                action: "pharmacy/itemmaster/GetItemMastersdashboard",
                data: inputData,
                type: 'post',
                onComplete: $scope.getHighPriceListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getStockTransistListCallback = function (scope, data, options, hasError) {
            $scope.StockTransist = [];
            $scope.StockTransist = data.Data;
        };

        $scope.getStockTransistList = function () {
            var From = $filter('date')($scope.currentcontext.FromTodayDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.ToTodayDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {

                Params: [
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.item.StoreMasterId
                    },
                    {
                        Key: 7,
                        Value: '0'
                    },
                ],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };

            var options = {
                action: "pharmacy/StockTransferDetail/GetStockTransferDetails",
                data: inputData,
                type: 'post',
                onComplete: $scope.getStockTransistListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getFastMovingListCallback = function (scope, data, options, hasError) {
            $scope.FastMoving = [];
            $scope.FastMoving = data.Data;
        };

        $scope.getFastMovingList = function () {
            var From = $filter('date')($scope.currentcontext.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: $scope.currentcontext.ToTodayDate,
                },
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 2,
                        Value: $scope.item.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };

            var options = {
                action: "pharmacy/StockMovement/GetStockMovements",
                data: inputData,
                type: 'post',
                onComplete: $scope.getFastMovingListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getddCount = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'appointment'
                    },
                    {
                        Key: 'mycheckedin'
                    }
                        //     {
                        //         Key: 'doctormedicalauditcount'
                        //     }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'Visit/DoctorDashboard/GetDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdoctDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };

        // $scope.appoinment = function () {
        //     $state.go('app.doctorappointment');
        // }
        // $scope.checkedinpatients = function () {
        //     // $state.go('app.checkedinpatients');
        //     $state.go('app.oppatienttab.mycheckin');
        // }
        // $scope.inpatients = function () {
        //     $state.go('app.currentinpatient');
        // }
        // $scope.otschedules = function () {
        //     $state.go('app.otdoctorschedule');
        // }
        // $scope.otnotes = function () {
        //     $state.go('app.otdoctornotes', {
        //         context: 'doctor'
        //     });
        // }
        // $scope.pendingdischarges = function () {
        //     $state.go('app.pendingdischarges');
        // }
        // $scope.labresult = function () {
        //     $state.go('app.labresultreviews', {
        //         context: 'doctor'
        //     });
        // }
        // $scope.imagingradiology = function () {
        //     $state.go('app.radiologyresults');
        // }
        // $scope.endoscopyresults = function () {
        //     $state.go('app.endoscopyresultreview');
        // }
        // $scope.upnormalresults = function () {
        //     $state.go('app.abnormallabresults');
        // }
        // $scope.prescription = function () {
        //     $state.go('app.doctorprescription');
        // }
        // $scope.surgeryrequest = function () {
        //     $state.go('app.otrequests');
        // }
        // $scope.admissionrequest = function () {
        //     $state.go('app.admissionrequests');
        // }
        // $scope.physiotheraphy = function () {
        //     $state.go('app.physiotheraphytab.details');
        // }
        // $scope.doctorMedicalAudit = function () {
        //     $state.go('app.medicalauditemr');
        // }

        $scope.po = function () {
            $state.go('app.purchaseorders', { context: 'store' });
        }
        $scope.inventry = function () {
            $state.go('app.grns', { context: 'store' });
        }
        $scope.popending = function () {
            $state.go('#');
        }
        $scope.invreturn = function () {
            $state.go('app.purchasereturns', { context: 'store' });
        }
        $scope.stockindent = function () {
            $state.go('app.stockrequests', { context: 'store' });
        }
        $scope.indentwork = function () {
            $state.go('app.storeworklisttab.storeworklists', { context: 'store' });
        }
        $scope.stockstatus = function () {
            $state.go('app.stockstatus', { context: 'store' });
        }
        $scope.stockmovement = function () {
            $state.go('app.stockmovement', { context: 'store' });
        }
        $scope.stockrereceives = function () {
            $state.go('app.stocktacceptencelist', { context: 'store' });
        }
        $scope.customersales = function () {
            $state.go('app.customer-sales', { id: 0, context: 'store' });
        }
        $scope.customerreturns = function () {
            $state.go('#');
        }
        $scope.report = function () {
            $state.go('app.storereporttab.stackmanagementreport', { context: 'store' });
        }
        $scope.vendorpayment = function () {
            $state.go('app.vendorpaymentlist', { context: 'store' });
        }
        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.getOutPatientList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 5,
                    Value: $scope.currentcontext.DoctorId
                },
                {
                    Key: 17,
                    Value: FromDate
                },
                {
                    Key: 18,
                    Value: ToDate
                }
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOutPatientListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getOutPatientListCallBack = function (scope, res, options, hasError) {
            $scope.outpatientlist = res.Data;
        }


        $scope.GetFacilityDashboardOptions = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'encounter'
                    }, {
                        Key: 'patient'
                    },
                    {
                        Key: 'appointment'
                    },
                        // {
                        //     Key: 'newborn'
                        // }
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

        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
        }
        $scope.loadInfo = function () {
            $scope.getddCount();
            $scope.getExpiredMedicine();
            $scope.getNearExpiry();
            $scope.GetFacilityDashboardOptions();
            $scope.getOutPatientList();
            $scope.getpurchaseindent();
            $scope.getpendingindents();
            $scope.getPendingreceive();
            $scope.getPurchaseorderapproval();
            $scope.getpurchaseindentapproval();
            $scope.getNonMovementList();
            $scope.getHighPriceList();
            $scope.getStockTransistList();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.ExpiryWarningDays = $scope.lookup['UserStores'][userstoreid].StoreMaster.ExpiryWarningDays;
                        }
                    }
                }
            });
            $scope.loadInfo();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: $scope.item.FacilityId
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                }];

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
    StoredashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];
})();