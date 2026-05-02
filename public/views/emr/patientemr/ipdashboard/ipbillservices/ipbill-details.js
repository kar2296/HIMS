(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipbillingdetailsController', ipbillingdetailsController);

    function ipbillingdetailsController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.SelectedIndex = -1;

        $scope.item = {
            doadate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.id = parseInt($stateParams.eid);
        $scope.IsLocked = $scope.$parent.Islocked;
        $scope.currentfilter = {
            DoctorId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext.CanDelete = $scope.HasAccess('EMR_BUTTONS', 'CANCEL_BILLSERVICE');
        
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }

        $scope.fillDefaultValues = function () {
            $scope.currentcontext.PaymentTypeId = 2; // Defaulted to CASH
        };

        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res;
            $scope.PatientId = $scope.Encounter.PatientId;
            if($scope.Encounter && $scope.Encounter.IsBillLock) {
                $scope.IsBillLocked = $scope.Encounter.IsBillLock;
                $scope.IsLocked = $scope.Encounter.IsBillLock;
            }

        };

        $scope.doctor_dashboard = function () {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        $scope.getEncounters = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.currentcontext.id
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            // for(var idx in res.Data){
            //     res.Data[idx].BillAmount = parseFloat(res.Data[idx].BillAmount).toFixed(2);
            //     res.Data[idx].BillDiscount = parseFloat(res.Data[idx].BillDiscount).toFixed(2);
            // }

            //vm.gridConfig.data = res.Data;
            var Bills = res.Data;
            $scope.BillsNetAmount = 0;
            $scope.BillsDiscount = 0;
            $scope.BillsGross = 0;
            for (var idx in Bills) {
                var item = Bills[idx];
                Bills[idx].NetAmount = Bills[idx].BillAmount - Bills[idx].BillDiscount;
                item.showDelete = $scope.currentcontext.CanDelete ? 1 : 0;
                console.log("Show",item.showDelete)
                if (Bills[idx].PatientBillStatusId == 3) {
                    $scope.BillsNetAmount = $scope.BillsNetAmount + (Bills[idx].BillAmount - Bills[idx].BillDiscount);
                    $scope.BillsDiscount = $scope.BillsDiscount + Bills[idx].BillDiscount;
                    $scope.BillsGross = $scope.BillsGross + Bills[idx].BillAmount;
                }
            }
            vm.gridConfig.data = Bills;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        // Currency Decimal Formating Function Start
        // $scope.amountConversion = function (amount) {
        //     return isNaN(parseFloat(amount)) ? (0).toFixed(2) : parseFloat(amount).toFixed(2);
        // }
        // Currency Decimal Formating Function End

        // $scope.CheckserviceDate = function (item) {

        //     var admsnDate = new Date($scope.Encounter.AdmissionDate);
        //     var dateformat = "YYYY-MM-DD";
        //     var from = new moment(moment(item.BillDateTime).format(dateformat));
        //     var to = new moment(moment(admsnDate).format(dateformat));

        //     var timecheck = from < to;
        //     console.log(timecheck);
        //     if (timecheck) {
        //         utl.Alert.showErrorMsg('Date Should not be less than Admission Date');
        //         item.BillDateTime = utl.Formatter.getCurrentDate();
        //     }
        // }

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 6,
                        Value: 3
                    },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 17,
                        Value: FrmDate
                    },
                    {
                        Key: 18,
                        Value: ToDate
                    },
                    {
                        Key: 52,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'billing/PatientBills/GetPatientBillsemrbillingservice',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.billingFilter = function (item) {
            if (item.Status == 1 && item.PackageMasterServiceId == 0) {
                return item;
            }
        };

        $scope.CheckFinalizeCallback = function (scope, res, options, hasError) {
            $scope.BillFinalized = false;
            if (res.Data.length > 0)
                $scope.BillFinalized = true;
            $scope.IsDisabled = $scope.BillFinalized || $scope.IsLocked ? true : false;

        };
        $scope.CheckFinalize = function () {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.id
                    }
                ]
            };
            var options = {
                action: 'billing/PatientBills/GetPatientBillsemrbillingservice',
                data: inputData,
                type: 'post',
                onComplete: $scope.CheckFinalizeCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            if ($scope.item.AdmissionStatusId == 6) {
                $state.go('app.ipbilling-listtab.dischargedpatients');
            } else {
                $state.go('app.ipbilling-listtab.inpatients');
            }
        };
        $scope.print2 = function () {

            // if ($scope.item.PatientBillId && $scope.item.PatientBillId > 0) {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isFinalized: $scope.BillFinalized
                }
            };
            var options = {
                action: 'billing/patientbills/PrintInpatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
            // }
        };
        $scope.print = function () {

            // if ($scope.item.PatientBillId && $scope.item.PatientBillId > 0) {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isFinalized: $scope.BillFinalized
                }
            };
            var options = {
                action: 'billing/PatientBillSummary/PrintPatientBillSummary',
                data: inputData,

                type: 'post'
            };
            utl.Http.doDownload(options);
            // }
        };

        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.PatientBillDetails = [];
            $scope.PatientBillDetails = res.Data;
            //vm.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getItem = function (PatientBillId) {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: PatientBillId
                }]
            };
            var options = {
                action: 'Billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };


        // $scope.print = function () {
        //     utl.Modal.open('app.ipbillingtab.summary', {
        //         params: { id: 0 },
        //         confirmCallback: $scope.getList
        //     });
        // }
        $scope.ipbillingcancel = function (Id) {
            if (!$scope.IsDisabled) {
                utl.Modal.openFixedDialog('patientemr.ipbillcancel', {
                    params: {
                        id: Id,
                        pid: $scope.PatientId,
                        bid: Id,
                        eid: $scope.currentcontext.id,
                        status: status,
                        billtotal: $scope.BillsNetAmount
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };
        $scope.ipbillingprofiles = function (BillId, status) {
            if (!$scope.IsDisabled) {
                utl.Modal.openFixedDialog('patientemr.ipbillingprofiledetails', {
                    params: {
                        id: $scope.currentcontext.id,
                        pid: $scope.PatientId,
                        bid: BillId,
                        status: status,
                        billtotal: $scope.BillsNetAmount
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.ipbillingorders = function (BillId, status) {
            if (!$scope.IsDisabled) {
                utl.Modal.openFixedDialog('patientemr.ipbillingorderdetails', {
                    params: {
                        id: $scope.currentcontext.id,
                        pid: $scope.PatientId,
                        bid: BillId,
                        status: status,
                        billtotal: $scope.BillsNetAmount
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.cancelItem = function () {
            $scope.item.PatientBillStatusId = 2;
            var lines = getLinesForSave();
            var paymentlines = getpaymentsLinesForSave();
            for (var idx in lines) {
                lines[idx].PatientBillStatusId = 2;
            }
            var inputData = {
                Header: $scope.item,
                Details: lines,
                paymentDetail: paymentlines
            };
            var options = {
                action: 'billing/patientbills/UpdatePatientBills',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.getList
            };
            utl.Http.doAction(options);
        };

        $scope.PatientPaymentDetails = [];

        function getpaymentsLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientPaymentDetails) {
                var item = $scope.PatientPaymentDetails[idx];
                if (item.AmountPaid > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];

                if ((item.Quantity > 0 && item.NetAmount > 0) || item.PackageMasterServiceId > 0) {
                    item.GrossAmount = item.Amount;
                    item.DiscountAmount = item.DiscountAmount;
                    item.DoctorDiscountAmount = 0;
                    item.GSTId = item.GSTId;
                    item.TaxId = item.GSTId;
                    item.TaxCode = item.TaxCode;
                    item.TaxCost = item.GSTAmount;
                    item.IsPackageItem = 0;
                    item.PackageId = 0;
                    item.PackageName = '';
                    item.OrderId = 0;
                    item.OrderDetailId = 0;
                    item.OrderDateTime = utl.Formatter.getCurrentDate();
                    item.RequestDate = utl.Formatter.getCurrentDate();
                    item.IsModified = 0;
                    item.IsSupplimentary = 0;
                    item.IsBillable = 0;
                    item.IsDoctorDiscount = 0;
                    item.IsGstDoctor = 0;
                    item.StartDateTime = null;
                    item.EndDateTime = null;
                    item.DiscountTypeId = item.DiscountTypeId;
                    item.DiscountAuthorizedBy = 0;
                    item.DoctorShare = item.DoctorShare;
                    item.ReferalShare = 0;
                    item.CancelReason = 0;
                    item.CancelledBy = 0;
                    item.Comments = '';

                    result.push(item);
                }
            }
            return result;
        }
        $scope.cancelCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem();
        };

        $scope.onCancelConfirmed = function (CancelId) {
            var options = {
                action: 'billing/patientbills/GetPatientBillsById',
                data: {
                    Id: CancelId
                },
                type: 'post',
                onComplete: $scope.cancelCallback
            };
            utl.Http.doAction(options);
        };

        //autosearch related code starts -
        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                // { header : 'ServiceRate Catogory', field : 'ServiceRateCategory', datatype: 'string', headercls:'td-category', fieldcls:'td-category' },
                {
                    header: 'ServiceItem Rate',
                    field: 'ServiceItemRate',
                    datatype: 'string',
                    headercls: 'td-rate',
                    fieldcls: 'td-rate'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            //Search only active patients
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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
            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0)
                    item.ServiceItemRate = item.ServiceItemTariffDetails[0].Rate;
            }
        }

        $scope.previousOrders = function () {
            utl.Modal.openFixedDialog('app.previousorders', {
                params: {
                    eid: $scope.Encounter.Id,
                    pid: $scope.Encounter.PatientId
                },
                confirmCallback: $scope.getList
            });
        };
        //autosearch related code ends -
        $scope.openModal = function (Id) {
            utl.Modal.openFixedDialog('patientemr.ipbillcancel', {
                params: {
                    id: Id,
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, entity) {
            // if (actionType == 'edit') {
            //     $scope.ipbillingprofiles(entity.Id, entity.PatientBillStatusId)
            //     // $state.go('app.ipbillingtab.summary', { id: entity.Id });
            //     // //    $state.go('app.ipbillingtab.summary');
            // }
            if (actionType == 'cancel') {
                if (entity.IsPharmacyBill) {
                    utl.Alert.showErrorMsg('Pharmacy Bill Cannot be Cancelled');
                    return false;
                }
                if (!$scope.IsDisabled) {
                    $scope.getItem(entity.Id);
                    $scope.ipbillingcancel(entity.Id);
                    // utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity.Id, entity.BillNumber);
                } else {
                    var msg = '';
                    msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                }
            } else if (actionType == 'view') {
                $scope.BillAmount = parseFloat(entity.BillAmount);
                $scope.BillDiscount = parseFloat(entity.BillDiscount);
                $scope.BillNetAmount = parseFloat($scope.BillAmount) - parseFloat($scope.BillDiscount);
                $scope.getItem(entity.Id);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "BillDateTime",
                    displayName: $translate.instant('billing.billing-details.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime '></ngformatdate>"
                },
                {
                    field: "BillNumber",
                    displayName: $translate.instant('billing.billing-details.transationid.lbl')
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('billing.billing-details.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.User.Title.Description}}&nbsp;</span>" + "<span >{{entity.User.FirstName}}&nbsp;</span>" + "<span >{{entity.User.LastName}}</span>" + "</div>"
                },
                //{ field: "Description", displayName: $translate.instant('billing.summary.description.lbl') },
                // {
                //     field: "BillAmount",
                //     displayName: $translate.instant('billing.billing-details.amount.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillAmount | displaycurrency}}</span>' + '</div>'
                // },
                // {
                //     field: "BillDiscount",
                //     displayName: $translate.instant('billing.billing-details.discount.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillDiscount | displaycurrency}}</span>' + '</div>'
                // },
                // {
                //     field: "NetAmount",
                //     displayName: $translate.instant('billing.billing-details.net.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.NetAmount | displaycurrency}}</span>' + '</div>'
                // },
                {
                    field: "PatientBillStatus.Description",
                    displayName: $translate.instant('billing.billing-details.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" uib-tooltip="View" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span> \
                                                    <span class="grid-action" uib-tooltip="Cancel" ng-click="handleEvents(\'cancel\',entity)" ng-if="entity.showDelete === 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div> ',
                    handleEvent: $scope.handleEvents,

                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        //lookup
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getEncounters();
        //     $scope.getList();
        //     $scope.CheckFinalize();
        // }

        // $scope.initLookup = function () {
        //     var inputData = [{
        //         "Key": "Doctor"
        //     },];

        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     utl.Http.doAction(options);
        // }

        // $scope.initLookup();
        $scope.getEncounters();
        $scope.getList();
        $scope.CheckFinalize();
    }

    ipbillingdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();