(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipbilldetailsListController', ipbilldetailsListController);

    function ipbilldetailsListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        // $scope.currentcontext.CanIPDEL_ADDNEW = utl.Privilege.hasAccess('CanIPDEL_ADDNEW');
        $scope.currentcontext.CanIPDEL_ADDNEW = $scope.HasAccess('IPBILLING_DETAILS', 'CanIPDEL_ADDNEW');
        $scope.currentcontext.CanIPDEL_PREVIOUS_ORDER = utl.Privilege.hasAccess('CanIPDEL_PREVIOUS_ORDER');
        $scope.currentcontext.CanDelete = $scope.HasAccess('IPBILLING_DETAILS', 'CanDeletedBillButton');
        $scope.SelectedIndex = -1;
        $scope.CanShowIns = false;
        $scope.item = {
            doadate: utl.Formatter.getCurrentDate(),
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        console.log(utl.Session.getUserRoles());
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.IsLocked = $scope.$parent.Islocked;
        $scope.currentfilter = {
            DoctorId: -1
        };
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];


        $scope.fillDefaultValues = function () {
            $scope.currentcontext.PaymentTypeId = 2; // Defaulted to CASH
        };

        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res;
            if ($scope.Encounter.GuarantorTypeId > 1) {
                $scope.CanShowIns = true;
            }
            $scope.PatientId = $scope.Encounter.PatientId;
        };

        $scope.getEncounters = function () {
            // var inputData = {
            //     Params: [
            //         { Key: 0, Value: $scope.currentcontext.id }
            //     ]
            // };
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
                Bills[idx].GrossAmount = Bills[idx].BillAmount;
                Bills[idx].showDelete = $scope.currentcontext.CanDelete ? 1 : 0;
                Bills[idx].NetAmount = Bills[idx].BillAmount - Bills[idx].BillDiscount;
                if (Bills[idx].PatientBillStatusId == 3) {
                    $scope.BillsNetAmount = $scope.BillsNetAmount + (Bills[idx].BillAmount - Bills[idx].BillDiscount);
                    $scope.BillsDiscount = $scope.BillsDiscount + Bills[idx].BillDiscount;
                    $scope.BillsGross = $scope.BillsGross + Bills[idx].BillAmount;
                }
            }
            vm.gridConfig.data = Bills;
            $scope.refreshReactProps();
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        // Currency Decimal Formating Function Start
        // $scope.amountConversion = function (amount) {
        //     return isNaN(parseFloat(amount)) ? (0).toFixed(2) : parseFloat(amount).toFixed(2);
        // }
        // Currency Decimal Formating Function End

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
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'billing/PatientBills/GetIPBillPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.PatientBillDetails = [];
            for (var pdx in res.Data) {
                var detail = res.Data[pdx];
                detail.DocName = '';
                if (detail.User) {
                    if (detail.User.Title) {
                        detail.DocName = detail.User.Title.Description;
                    }
                    if (detail.User.FirstName) {
                        detail.DocName += ' ' + detail.User.FirstName;
                    }
                    if (detail.User.LastName) {
                        detail.DocName += ' ' + detail.User.LastName;
                    }
                } else {
                    if (detail.Doctor) {
                        if (detail.Doctor.Title) {
                            detail.DocName = detail.Doctor.Title.Description;
                        }
                        if (detail.Doctor.FirstName) {
                            detail.DocName += ' ' + detail.Doctor.FirstName;
                        }
                        if (detail.Doctor.LastName) {
                            detail.DocName += ' ' + detail.Doctor.LastName;
                        }
                    }
                }
                $scope.PatientBillDetails.push(detail);
            }
            // $scope.PatientBillDetails = res.Data;
            //vm.pagerObj.totalItems = res.PageContext.TotalRecords;
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
                action: 'billing/PatientBills/GetPatientBills',
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
        $scope.getFacInfoCallbck = function (scope, data, options, hasError) {

            $scope.item.IsDoctorShare = data.IsDoctorShare;
            $scope.ShowDoctorShare = false;
            if (data.IsDoctorShare) {
                $scope.ShowDoctorShare = true;
            }
        };

        $scope.getFacInfo = function () {
            var options = {
                action: 'SystemSettings/facility/GetFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getFacInfoCallbck
            };
            utl.Http.doAction(options);
        };

        $scope.ipbillingprofiles = function (BillId) {
            var role = utl.Session.getUserRoles();
            if (role.toLowerCase() == 'billing') {
                $scope.IsDisabled = false;
            }
            if (!$scope.IsDisabled) {
                utl.Modal.openFixedDialog('app.ipbillingprofiledetails', {
                    params: {
                        id: $scope.currentcontext.id,
                        pid: $scope.PatientId,
                        bid: BillId,
                        status: $scope.item.PatientBillStatusId,
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

        $scope.ipbillingorders = function (BillId) {
            if (!$scope.IsDisabled) {
                utl.Modal.openFixedDialog('app.ipbillingorderdetails', {
                    params: {
                        id: $scope.currentcontext.id,
                        pid: $scope.PatientId,
                        bid: BillId,
                        status: $scope.item.PatientBillStatusId,
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
            utl.Modal.open('app.previousorders', {
                params: {
                    eid: $scope.Encounter.Id,
                    pid: $scope.Encounter.PatientId
                },
                confirmCallback: $scope.getList
            });
        };
        //autosearch related code ends -

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
                    utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity.Id, entity.BillNumber);
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
            } else if (actionType == 'print') {
                print(entity);
            }
        }

        function print(entity) {
            var inputData = {
                Id: entity.Id,
                Data: {
                    ipprint: true,
                    withHeader: true,
                }
            };
            // var actionName = 'billing/patientbills/PrintPatientBills';
            var actionName = 'billing/patientbills/PrintOPPatientBills';
            var options = {
                action: actionName,
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        //React bridge for the <custom-table config="vm.gridConfig"> grid only.
        //The header buttons (Previous Orders / Add New, gated by
        //ng-if="HasAccess('IPBILLING_DETAILS','IPDEL_PREVIOUS_ORDER')" and
        //'IPDEL_ADDNEW') and every other control stay untouched native markup,
        //so all privilege gating is unchanged. The screen's only <ui-select>
        //is commented out in the template and was left that way.
        //Row actions dispatch into the existing, unchanged $scope.handleEvents.
        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (actionType == 'rowAction') {
                $scope.handleEvents(payload.key, entity);
            }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function cur(v) { return $filter('displaycurrency')(v); }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'billdate', header: hdr(0) },
                        { key: 'billno', header: hdr(1), sortable: true },
                        { key: 'doctor', header: hdr(2) },
                        { key: 'gross', header: hdr(3), align: 'right' },
                        { key: 'discount', header: hdr(4), align: 'right' },
                        { key: 'net', header: hdr(5), align: 'right' },
                        { key: 'status', header: hdr(6), sortable: true }
                    ],
                    actionsHeader: hdr(7) || 'Actions',
                    hasActions: true,
                    //config.background.style: PatientBillStatusId 2 -> pink/#fff.
                    highlightStyle: { background: 'pink', color: '#fff' },
                    rows: items.map(function (entity) {
                        var acts = [
                            //Both print and view are unconditional in the original.
                            { key: 'print', label: '', icon: 'fa fa-print', variant: 'icon', title: 'Print' },
                            { key: 'view', label: '', icon: 'fas fa-edit', variant: 'icon', title: 'View' }
                        ];
                        //ng-if="entity.showDelete === 1" ng-hide="entity.PatientBillStatusId == 2"
                        //showDelete comes from currentcontext.CanDelete, i.e. the real
                        //HasAccess('IPBILLING_DETAILS','CanDeletedBillButton') privilege.
                        if (entity.showDelete === 1 && entity.PatientBillStatusId != 2) {
                            acts.push({ key: 'cancel', label: '', icon: 'fas fa-trash', variant: 'icon', title: 'Cancel' });
                        }
                        return {
                            id: entity.Id,
                            highlight: entity.PatientBillStatusId == 2,
                            actions: acts,
                            cells: {
                                //Original cellTemplate uses the <ngformatdate> directive
                                //(vendor/common/ngCommonHelper.js), whose datetime-val
                                //branch renders date:'dd-MMM-yyyy HH:mm'.
                                billdate: entity.BillDateTime ? $filter('date')(entity.BillDateTime, 'dd-MMM-yyyy HH:mm') : '',
                                billno: entity.BillNumber,
                                //The column's field is DoctorName but its cellTemplate
                                //renders entity.User's title/first/last -- kept as-is.
                                doctor: ((entity.User && entity.User.Title && entity.User.Title.Description ? entity.User.Title.Description + ' ' : '') + (entity.User && entity.User.FirstName ? entity.User.FirstName : '') + ' ' + (entity.User && entity.User.LastName ? entity.User.LastName : '')).replace(/\s+/g, ' ').trim(),
                                gross: cur(entity.GrossAmount),
                                discount: cur(entity.BillDiscount),
                                //PRE-EXISTING QUIRK: this column's field is BillAmount but
                                //its cellTemplate renders entity.NetAmount. Reproduced.
                                net: cur(entity.NetAmount),
                                status: entity.PatientBillStatus && entity.PatientBillStatus.Description
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                style: {
                    field: 'PatientBillStatusId',
                    value: {
                        2: {
                            'background': 'pink',
                            'color': '#fff'
                        }
                    }
                }
            },
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
            {
                field: "GrossAmount",
                displayName: $translate.instant('billing.billing-details.amount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.GrossAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "BillDiscount",
                displayName: $translate.instant('billing.billing-details.discount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillDiscount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "BillAmount",
                displayName: $translate.instant('billing.billing-details.net.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "PatientBillStatus.Description",
                displayName: $translate.instant('billing.billing-details.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'print\',entity)" ><i class="fa fa-print" aria-hidden="true"></i></span> \
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span> \
                                                    <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-if="entity.showDelete === 1" ng-hide="entity.PatientBillStatusId ==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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

        $scope.refreshReactProps();


        //lookup
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getEncounters();
        //     $scope.getList();
        //     $scope.CheckFinalize();
        //     $scope.getFacInfo();
        // }

        // $scope.initLookup = function () {
        //     var inputData = [
        //         //     {
        //         //     "Key": "Doctor"
        //         // },
        //     ];

        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     utl.Http.doAction(options);
        // }

        $scope.getEncounters();
        $scope.getList();
        $scope.CheckFinalize();
        $scope.getFacInfo();
    }

    ipbilldetailsListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();