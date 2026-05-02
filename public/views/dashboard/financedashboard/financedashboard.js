(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('financedashboardController', financedashboardController);

    function financedashboardController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.Items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            // FacilityName: utl.Session.getCurrentFacilityName(),
            // FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            // ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            CurrentDate: utl.Formatter.getCurrentDate(),
        }
        $scope.currentfilter = {
            // FacilityId: utl.Session.getCurrentFacilityId(),
            // FacilityName: utl.Session.getCurrentFacilityName(),
            // BillDate: utl.Formatter.getCurrentDate(),
            GuarantorTypeId: -1,
            BillTypeId: -1,
            GuarantorId: -1,
        };
        $scope.Items.TotalOccupancyCount = '0';
        $scope.Items.OtSchedule = '0';
        $scope.Items.OtEntries = '0';
        $scope.Items.CathLabSchedule = '0';
        $scope.Items.OPReferral = '0';
        $scope.Items.IPReferral = '0';

        $scope.Items.AdmittedCount = '0';
        $scope.Items.DischargeCount = '0';
        $scope.Items.RegistrationCount = '0';
        $scope.Items.OPVisitCount = '0';
        $scope.Items.PendingdischargeCount = '0';

        $scope.patientlistreports = function () {
            $state.go('app.patientlistreports', { context: 'financedashboard' });
        }
        $scope.outpatientreport = function () {
            $state.go('app.outpatientreport', { context: 'financedashboard' });
        }
        $scope.appointmentschedulereport = function () {
            $state.go('app.appointmentschedulereport', { context: 'financedashboard' });
        }
        $scope.ipoccupancyreport = function () {
            $state.go('app.ipoccupancyreport', { context: 'financedashboard' });
        }
        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', { context: 'financedashboard' });
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'financedashboard' });
        }
        $scope.revenuesummarybydept = function () {
            $state.go('app.revenuesummarybydept', { context: 'financedashboard' });
        }
        $scope.dailypurchasesummary = function () {
            $state.go('app.dailypurchasesummary', { context: 'financedashboard' });
        }
        $scope.patientipdispensedreport = function () {
            $state.go('app.patientipdispensedreport', { context: 'financedashboard' });
        }
        $scope.inpatientbilling = function () {
            $state.go('app.inpatient-billing', { context: 'financedashboard' });
        }
        $scope.dischargedpatients = function () {
            $state.go('app.discharged-patients', { context: 'financedashboard' });
        }
        $scope.revenuesummarybydoctor = function () {
            $state.go('app.revenuesummarybydoctor', { context: 'financedashboard' });
        }
        $scope.billingrequestlist = function () {
            $state.go('app.billingrequestlist', { context: 'financedashboard' });
        }
        $scope.ipbillingrequestlist = function () {
            $state.go('app.ipbillingrequestlist', { context: 'financedashboard' });
        }
        $scope.discountapproval = function () {
            $state.go('app.discountapproval', { context: 'financedashboard' });
        }
        $scope.otschedulereport = function () {
            $state.go('app.otschedulereport', { context: 'financedashboard' });
        }
        $scope.surgeryentryreports = function () {
            $state.go('app.surgeryentryreports', { context: 'financedashboard' });
        }
        $scope.cathlabschedulereport = function () {
            $state.go('app.cathlabschedulereport', { context: 'financedashboard' });
        }
        $scope.opreferraldoctorreport = function () {
            $state.go('app.opreferraldoctorreport', { context: 'financedashboard' });
        }
        $scope.ipreferraldoctorreport = function () {
            $state.go('app.ipreferraldoctorreport', { context: 'financedashboard' });
        }
        $scope.insuranceagingreport = function () {
            $state.go('app.insuranceagingreport', { context: 'financedashboard' });
        }
        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        }

        $scope.custom_sort = function (a, b) {
            if (b.Value && a.Value && b.Value.DisplayOrder && a.Value.DisplayOrder)
                return a.Value.DisplayOrder - b.Value.DisplayOrder;
            else
                return 0;
        }

        $scope.prOccCount = function () {
            $scope.Items.PresentOccupancyCount = '0';
            $scope.Items.PresentOccupancyCount = ($scope.Items.TotalOccupancyCount || 0) - ($scope.Items.PendingdischargeCount || 0);
        }
        $scope.getoccupancyCountCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.TotalOccupancyCount = res.Data.length;
            } else {
                $scope.Items.TotalOccupancyCount = '0';
            }
            $scope.prOccCount();
        };

        $scope.getoccupancyCount = function () {
            // $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            // $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [

                    {
                        Key: 2,
                        Value: 1
                    },
                    {
                        Key: 6,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 9,
                        Value: $scope.currentcontext.FacilityId
                    },
                ],

            };

            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getoccupancyCountCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getOtScheduleListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.OtSchedule = res.Data.length;
            } else {
                $scope.Items.OtSchedule = '0';
            }

        };

        $scope.getOtScheduleList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    // { Key: 17, Value: $scope.currentfilter.OTRoomId },
                    // { Key: 2, Value: $scope.currentfilter.OTScheduleStatusId },
                    { Key: 7, Value: $scope.currentfilter.DoctorId },
                    { Key: 10, Value: $scope.currentcontext.FromDate },
                    { Key: 11, Value: $scope.currentcontext.ToDate },
                    { Key: 18, Value: false },
                    { Key: 17, Value: $scope.currentfilter.OTRoomId },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
            };
            if ($scope.context == 'surgery') {
                inputData.Params.push({ Key: 6, Value: $scope.currentcontext.pid });
            }
            var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOtScheduleListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOtEntriesListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.OtEntries = res.Data.length;
            } else {
                $scope.Items.OtEntries = '0';
            }

        };

        $scope.getOtEntriesList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.ProcedureId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 16,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 17,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 19,
                    Value: false
                }
                ],

            };
            if ($scope.Context == 'surgery') {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.pid
                })
            }
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOtEntriesListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getCathLabScheduleListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.CathLabSchedule = res.Data.length;
            } else {
                $scope.Items.CathLabSchedule = '0';
            }

        };

        $scope.getCathLabScheduleList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    // { Key: 17, Value: $scope.currentfilter.OTRoomId },
                    // { Key: 2, Value: $scope.currentfilter.OTScheduleStatusId },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 11,
                        Value: $scope.currentcontext.ToDate
                    },
                    {
                        Key: 18,
                        Value: true
                    },
                ],
            };
            if ($scope.context == 'surgery') {
                inputData.Params.push({
                    Key: 6,
                    Value: $scope.currentcontext.pid
                });
            }
            var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCathLabScheduleListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOPReferralListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.OPReferral = res.Data.length;
            } else {
                $scope.Items.OPReferral = '0';
            }

        };

        $scope.getOPReferralList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                    Key: 17,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 56,
                    Value: $scope.currentfilter.ReferralTypeId
                },
                {
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 77,
                    Value: 9
                },
                ],
            };
            if ($scope.currentfilter.ReferralId > 0) {
                inputData.Params.push({
                    Key: 41,
                    Value: $scope.currentfilter.ReferralId
                })
            }
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPReferralListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getIPReferralListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.IPReferral = res.Data.length;
            } else {
                $scope.Items.IPReferral = '0';
            }

        };

        $scope.getIPReferralList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                    Key: 17,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 56,
                    Value: $scope.currentfilter.ReferralTypeId
                },
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.AdmissionStatusId
                },
                {
                    Key: 77,
                    Value: 9
                },
                ],
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getIPReferralListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = [];
            $scope.FacilityInfo = res;
            if ($scope.FacilityInfo.encounter) {
                $scope.IPCounts = $scope.FacilityInfo.encounter;
                if ($scope.IPCounts.DischargeCount) {
                    $scope.Items.DischargeCount = $scope.IPCounts.DischargeCount;
                } else {
                    $scope.Items.DischargeCount = '0';
                }
                if ($scope.IPCounts.AdmissionCount) {
                    $scope.Items.AdmittedCount = $scope.IPCounts.AdmissionCount;
                } else {
                    $scope.Items.AdmittedCount = '0';
                }
                if ($scope.IPCounts.OPVisitCount) {
                    $scope.Items.OPVisitCount = $scope.IPCounts.OPVisitCount;
                } else {
                    $scope.Items.OPVisitCount = '0';
                }
                if ($scope.IPCounts.PendingdischargeCount) {
                    $scope.Items.PendingdischargeCount = $scope.IPCounts.PendingdischargeCount;
                } else {
                    $scope.Items.PendingdischargeCount = '0';
                }
            }
            if ($scope.FacilityInfo.patient) {
                if ($scope.FacilityInfo.patient.RegistrationCount) {
                    $scope.Items.RegistrationCount = $scope.FacilityInfo.patient.RegistrationCount;
                } else {
                    $scope.Items.RegistrationCount = '0';
                }
            }
            if (res.ippharmacydue) {
                for (var idx in res.ippharmacydue)
                    $scope.FacilityInfo.receipt.push(res.ippharmacydue[idx]);
            }
            if (res.billrefund) {
                for (var idx in res.billrefund)
                    $scope.FacilityInfo.receipt.push(res.billrefund[idx]);
            }
            if (res.refund) {
                for (var idx in res.refund)
                    $scope.FacilityInfo.receipt.push(res.refund[idx]);
            }

            if ($scope.FacilityInfo.receipt)
                $scope.FacilityInfo.receipt.sort($scope.custom_sort);

            $scope.TotCashAmt = 0;
            $scope.TotCardAmt = 0;
            $scope.TotOtherAmt = 0;

            var totalcollectioncash = ($scope.FacilityInfo.receipt[0].Value.CashAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.CashAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.CashAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.CashAmount || 0);

            var totalrefundcash = ($scope.FacilityInfo.receipt[3].Value.CashAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.CashAmount || 0);

            $scope.TotCashAmt = totalcollectioncash - totalrefundcash;

            var totalcollectioncard = ($scope.FacilityInfo.receipt[0].Value.CardAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.CardAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.CardAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.CardAmount || 0);

            var totalrefundcard = ($scope.FacilityInfo.receipt[3].Value.CardAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.CardAmount || 0);

            $scope.TotCardAmt = totalcollectioncard - totalrefundcard;

            var totalcollectionother = ($scope.FacilityInfo.receipt[0].Value.OtherAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.OtherAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.OtherAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.OtherAmount || 0);

            var totalrefundother = ($scope.FacilityInfo.receipt[3].Value.OtherAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.OtherAmount || 0);

            $scope.TotOtherAmt = totalcollectionother - totalrefundother;

            var totalcollection = ($scope.FacilityInfo.receipt[0].Value.BillAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.BillAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.BillAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.BillAmount || 0);

            var totalrefund = ($scope.FacilityInfo.receipt[3].Value.BillAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.BillAmount || 0);

            $scope.TotAmt = totalcollection - totalrefund;

            $scope.prOccCount();


            //console.log($scope.FacilityInfo);

        }
        $scope.GetFacilityDashboardOptions = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'encounter'
                    },
                    {
                        Key: 'patient'
                    },
                    {
                        Key: 'appointment'
                    },
                    {
                        Key: 'newborn'
                    },
                    {
                        Key: 'receipt'
                    },
                    // { Key: 'ippharmacydue' },
                    {
                        Key: 'refund'
                    },
                    {
                        Key: 'billrefund'
                    },
                    {
                        Key: 'categorycollection'
                    },
                    {
                        Key: 'dispense'
                    }
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
        $scope.getPurchaseListCallback = function (scope, res, options, hasError) {
            $scope.Purchase = [];
            var totalgrossamount = 0;
            var totalnetamount = 0;
            var GroupedBatchData = _.groupBy(res.Data, 'ItemMasterId');
            for (var jdx in GroupedBatchData) {
                var itemgrouped = GroupedBatchData[jdx];
                var itemData = {
                    ItemName: '',
                    ManufactureName: '',
                    GrnQuantity: 0,
                    FreeQty: 0,
                    GrnQuantityAfterConversion: 0,
                    PurchasePrice: 0,
                    GrossAmount: 0,
                    NetAmount: 0
                }
                for (var imdx in itemgrouped) {
                    var item = itemgrouped[imdx];
                    itemData.ItemName = item.ItemName;
                    itemData.ManufactureName = item.ItemMaster.ManufacturerName;
                    itemData.GrnQuantity += item.GrnQuantity;
                    itemData.FreeQty += item.FreeQty;
                    itemData.GrnQuantityAfterConversion += item.GrnQuantityAfterConversion;
                    itemData.PurchasePrice += item.PurchasePrice;
                    itemData.GrossAmount += item.GrossAmount;
                    itemData.NetAmount += item.NetAmount;
                }
                totalgrossamount = totalgrossamount + (itemData.GrossAmount);
                totalnetamount = totalnetamount + (itemData.NetAmount);
                $scope.Purchase.push(itemData);
            }

            $scope.TotalGrossAmt = totalgrossamount;
            $scope.TotalNetAmt = totalnetamount;

            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getPurchaseList = function () {

            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 8,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 11,
                    Value: [2, 3, 4]
                },
                {
                    Key: 14,
                    Value: $scope.currentcontext.FacilityId
                },

                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/grndetail/GetGrnDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPurchaseListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getBillInfoDashBoardCallBack = function (scope, res, options, hasError) {
            $scope.Bills = [];
            $scope.Bills = res.Data;
        }

        $scope.getBillInfoDashBoard = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: {
                    FacilityId: $scope.currentcontext.FacilityId
                }
            };

            var options = {
                action: 'billing/patientbills/GetBillInfoDashBoard',
                data: inputData,
                type: 'post',
                onComplete: $scope.getBillInfoDashBoardCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getDischargeNoticedListCallBack = function (scope, res, options, hasError) {
            $scope.fitfordischarge = [];
            $scope.fitfordischarge = res.Data;
        }

        $scope.getDischargeNoticedList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 3
                },
                {
                    Key: 17,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 1,
                    Value: $scope.currentcontext.FacilityId
                }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargeNoticedListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getDischargedListCallBack = function (scope, res, options, hasError) {
            $scope.dischargedlist = [];
            $scope.dischargedlist = res.Data;
        }

        $scope.getDischargedList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 6
                },
                {
                    Key: 28,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 29,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 1,
                    Value: $scope.currentcontext.FacilityId
                }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargedListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getAdmittedListCallBack = function (scope, res, options, hasError) {
            $scope.admissionlist = [];
            $scope.admissionlist = res.Data;
        }

        $scope.getAdmittedList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                },
                {
                    Key: 17,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.ToDate
                }, {
                    Key: 1,
                    Value: $scope.currentcontext.FacilityId
                }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAdmittedListCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.GetRevenueCallBack = function (scope, res, options, hasError) {
            $scope.RevenueInfo = res;
            $scope.HosRev = [];

            if ($scope.RevenueInfo) {
                if ($scope.RevenueInfo.length > 0) {
                    for (var jx in $scope.RevenueInfo) {
                        var revne = $scope.RevenueInfo[jx];
                        var revInfo = {
                            Key: '',
                            BillAmount: 0.00
                        }
                        revInfo.Key = revne.Key;
                        revInfo.BillAmount = revne.Value.BillAmt;
                        $scope.HosRev.push(revInfo);
                    }
                }
            }
            $scope.TotalAmount = 0;
            var totalamount = 0;
            for (var idx in $scope.HosRev) {
                var netsummary = $scope.HosRev[idx];
                if (netsummary.BillAmount) {
                    totalamount += netsummary.BillAmount;
                }
            }
            $scope.TotalAmount = totalamount;


        }
        $scope.GetRevenue = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Data: {
                    FromDate: $scope.currentcontext.FromDate,
                    ToDate: $scope.currentcontext.ToDate,
                    FacilityId: $scope.currentcontext.FacilityId,
                },
            };

            var options = {
                action: 'billing/patientbills/GetRevenueDetals',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetRevenueCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.GetDoctorRevenueCallBack = function (scope, res, options, hasError) {
            $scope.DoctorInfo = res;
            $scope.DrRevenue = 0;
            var drrevenue = 0;
            for (var ix in $scope.DoctorInfo) {
                var DocInfo = $scope.DoctorInfo[ix].Value;
                for (var iv in DocInfo) {
                    var Info = DocInfo[iv];
                    for (var idn in Info) {
                        var DocData = Info[idn];
                        drrevenue += DocData.BillAmount;
                    }

                }
            }
            $scope.DrRevenue = drrevenue;

        }
        $scope.GetDoctorRevenue = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Data: {
                    FromDate: $scope.currentcontext.FromDate,
                    ToDate: $scope.currentcontext.ToDate,
                    FacilityId: $scope.currentcontext.FacilityId,
                    DoctorId: 0
                },
            };

            var options = {
                action: 'billing/patientbills/GetRevenueDoctorSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetDoctorRevenueCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {

        }

        $scope.prepareMailData = function () {
            var DataTable = '';
            if ($scope.FacilityInfo &&
                $scope.FacilityInfo.receipt &&
                $scope.FacilityInfo.receipt.length > 0) {
                DataTable += '<table>';
                DataTable += '<thead>';
                DataTable += '<td><span>Particulars</span></td>';
                DataTable += '<td><span>Amount</span></td>';
                DataTable += '<td><span>Cash</span></td>';
                DataTable += '<td><span>Card</span></td>';
                DataTable += '<td><span>Others</span></td>';
                DataTable += '</thead>';
                for (var idx in $scope.FacilityInfo.receipt) {
                    var item = $scope.FacilityInfo.receipt[idx];
                    DataTable += '<tr>';
                    DataTable += '<td ><span>' + item.Key + '</span></td>';
                    DataTable += '<td align= "right">' + item.Value.BillAmount || 0.00 + '</td>';
                    DataTable += '<td align= "right">' + item.Value.CashAmount || 0.00 + '</td>';
                    DataTable += '<td align= "right">' + item.Value.CardAmount || 0.00 + '</td>';
                    DataTable += '<td align= "right">' + item.Value.OtherAmount || 0.00 + '</td>';
                    DataTable += '</tr>';
                    DataTable += '</table>';
                }
            }
            return DataTable;
        }


        $scope.print = function () {
            var inputData = {
                Id: 0,
                Data: {
                    Keys: [{
                        Key: 'encounter'
                    }, {
                        Key: 'patient'
                    },
                    {
                        Key: 'appointment'
                    }, {
                        Key: 'newborn'
                    }, {
                        Key: 'receipt'
                    },
                    {
                        Key: 'ippharmacydue'
                    }, {
                        Key: 'refund'
                    }, {
                        Key: 'billrefund'
                    },
                    {
                        Key: 'categorycollection'
                    }
                    ]
                },
                Attributes: $scope.currentcontext
            };
            var options = {
                action: 'SystemSettings/facilitydashboard/PrintFacilityDashboard',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };

        $scope.sendmail = function () {
            // var MailData = $scope.prepareMailData();
            // if(MailData.length > 0) {
            var inputData = {
                Data: {
                    MailData
                }
            };
            var options = {
                action: 'SystemSettings/facilitydashboard/SendFacilityDashboardMail',
                data: inputData,
                type: 'post',
                onComplete: $scope.sendmailCallBack
            };
            utl.Http.doAction(options);
            //}
        };


        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.LoadDashboard();
            // $scope.getScheduled();
            // $scope.getcheckin();
            // $scope.getcancelled();
            // $scope.getnoshown();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },

            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        }

        $scope.initLookup();
        $scope.LoadDashboard = function () {
            $scope.GetFacilityDashboardOptions();
            $scope.getDischargeNoticedList();
            $scope.getDischargedList();
            $scope.getAdmittedList();
            $scope.getoccupancyCount();
            $scope.getPurchaseList();
            $scope.GetDoctorRevenue();
            $scope.getOtScheduleList();
            $scope.getOtEntriesList();
            $scope.getOPReferralList();
            $scope.getIPReferralList();
            // $scope.getInsuranceAgeingList();
            $scope.GetRevenue();
        }
    }
    financedashboardController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();