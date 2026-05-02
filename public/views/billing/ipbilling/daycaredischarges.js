(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DayCaredischargedpatientsListController', DayCaredischargedpatientsListController);

    function DayCaredischargedpatientsListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.Items = [];
        $scope.items = {};
        $scope.item = {
            receiptdate: utl.Formatter.getCurrentDate(),
            ToBeCancelBillId: -1,
            EncounterId: -1,
            BedId: -1
        };

        $scope.currentfilter = {
            WardId: -1,
            PatientMRN: '',
            BillNumber: '',
            VisitIdentifier: '',
            AdmissionStatusId: -1,
            fromdate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), -15),
            // fromdate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), -15),
            todate: utl.Formatter.getCurrentDate()
        };
        // let year = new Date($scope.currentfilter.fromdate).getFullYear();
        // let month = new Date($scope.currentfilter.fromdate).getMonth();
        // let day = new Date($scope.currentfilter.fromdate).getDate();
        // let fromdate = day + '/' + month + '/' + year;
        // $scope.currentfilter.fromdate=fromdate;
        console.clear();
        console.log($scope.currentfilter);
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.backtoList = function () {
            $state.go('app.billingsdashboard');
        };
        $scope.currentcontext = {};

        function initDynamicForm() {
            $scope.advancedfilter = {};

            $scope.advancedfilterDefault = {
                DepartmentId: -1,
                DoctorId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1,
                DOD: utl.Formatter.getCurrentDate()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'date',
                    translate: 'billing.dischargedpatients.doa.lbl',
                    model: 'DOA',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'billing.dischargedpatients.dod.lbl',
                    model: 'DOD',
                    position: {
                        r: 0,
                        c: 1
                    }
                },
                {
                    type: 'text',
                    translate: 'billing.inpatients.phone.lbl',
                    model: 'Phone',
                    position: {
                        r: 1,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'billing.inpatients.guarantor.lbl',
                    model: 'GuarantorId',
                    options: $scope.lookup.Guarantor,
                    position: {
                        r: 1,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'billing.inpatients.guarantortype.lbl',
                    model: 'GuarantorTypeId',
                    options: $scope.lookup.GuarantorType,
                    position: {
                        r: 2,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'billing.inpatients.admittingdoctors.lbl',
                    model: 'DoctorId',
                    options: $scope.lookup.Doctor,
                    position: {
                        r: 2,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'billing.inpatients.department.lbl',
                    model: 'DepartmentId',
                    options: $scope.lookup.Department,
                    position: {
                        r: 3,
                        c: 0
                    }
                },
                {
                    type: 'checkbox',
                    translate: 'billing.inpatients.department.lbl',
                    model: 'IsOutstanding',
                    position: {
                        r: 3,
                        c: 1
                    }
                }
                ],
                actions: [{
                    type: 'apply',
                    translate: 'common.applyaction.lbl',
                    cls: 'btn-primary'
                },
                {
                    type: 'reset',
                    translate: 'common.resetaction.lbl',
                    cls: 'btn-danger'
                }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.DischargeDate).getTime() - new Date(a.DischargeDate).getTime();
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            for (var idx in data.Data) {
                var item = data.Data[idx];
                var finalBills = $filter('filter')(item.FinalBills, {
                    BillTypeId: 2
                });
                if (finalBills.length > 0) {
                    var bill = finalBills[0];
                    // } else if (finalBills.length > 1) {
                    // var lastIndex = finalBills.length - 1;
                    // var bill = finalBills[lastIndex];
                    item.BillDate = bill.BillDateTime;
                    item.BillNumber = bill.BillNumber;
                    item.GrossAmount = parseFloat(bill.BillAmount);
                    item.BillDiscount = parseFloat(bill.BillDiscount);
                    item.CancelReqRaisedStatusId = bill.CancelReqRaisedStatusId;
                    item.NetAmount = (parseFloat(item.GrossAmount) - parseFloat(item.BillDiscount));
                }
                // vm.gridConfig.data.push(item);
                if ($scope.currentfilter.BillNumber) {
                    if (item.DischargedBills.length > 0) {
                        vm.gridConfig.data.push(item);
                    }
                } else {
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // if ($scope.currentfilter.doddate == null) {

            //     utl.Alert.showErrorMsg('Please Select any DOD date');
            //     vm.gridConfig.data = [];
            //     return true;

            // }

            var FrmDOA = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var ToDOA = $filter('date')($scope.advancedfilter.DOD, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDOD = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDOD = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            if ($scope.currentfilter.PatientMRN || $scope.currentfilter.VisitIdentifier) {
                FrmDOD = null;
                ToDOD = null;
            }
            var inputData = {
                Params: [
                //     {
                //     Key: 28,
                //     Value: FrmDOD
                // },
                // {
                //     Key: 29,
                //     Value: ToDOD
                // },
                {
                    Key: 80,
                    Value: FrmDOD//To Retrieve Bill Date Time
                },
                {
                    Key: 81,
                    Value: ToDOD//To Retrieve Bill Date Time
                },
                {
                    Key: 17,
                    Value: FrmDOA
                },
                {
                    Key: 18,
                    Value: ToDOA
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 15,
                    Value: 5
                },
                {
                    Key: 3,
                    Value: 6
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.PatientMRN
                },
                {
                    Key: 13,
                    Value: $scope.currentfilter.VisitIdentifier
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.AdmissionStatusId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 22,
                    Value: true
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.BillNumber
                },
                {
                    Key: 51,
                    Value: false
                }, // Modified
                // {
                //     Key: 74,
                //     Value: true
                // },
                {
                    Key: 69,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/Visit/GetMINIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.cancelBillCallback = function () {
            $scope.getList();
        };

        $scope.onCancelConfirmed = function () {
            var inputData = {
                PatientBillId: $scope.item.ToBeCancelBillId,
                EncounterId: $scope.item.EncounterId,
                BedId: $scope.item.BedId,
                CancelledBy: $scope.item.CancelledBy,
                CancelledOn: $scope.item.CancelledOn,
            };
            var options = {
                action: 'billing/patientbills/CancelIPPatientBill',
                data: {
                    Id: $scope.item.ToBeCancelBillId,
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.cancelBillCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onCancelBill = function (item) {
            var finalBills = $filter('filter')(item.FinalBills, {
                BillTypeId: 2
            });
            if (finalBills.length > 0) {
                var bill = finalBills[0];

                // if (item.FinalBills.length == 1) {
                //     var bill = item.FinalBills[0];
                // } else if (item.FinalBills.length > 1) {
                //     var lastIndex = item.FinalBills.length - 1;
                //     var bill = item.FinalBills[lastIndex];
                // }
                $scope.item.ToBeCancelBillId = bill.Id;
                $scope.item.EncounterId = item.Id;
                $scope.item.BedId = item.BedId;
                $scope.item.CancelledOn = utl.Formatter.getCurrentDate();
                $scope.item.CancelledBy = utl.Session.getCurrentUserId();
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.dischargedpatients.cancelmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onCancelConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        $scope.UpdateCancelRequestPatientbillsCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.UpdateCancelRequestPatientbills = function () {
            $scope.items.CancelReqRaisedStatusId = 1;
            $scope.items.Id = $scope.item.PatientBillId;
            // var lines = getLinesForSaveCancel();
            var actionName = 'Billing/PatientBills/UpdatePatientBillsFromCancel';

            var inputData = {
                Header: $scope.items,
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.UpdateCancelRequestPatientbillsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.CancelRequestCallback = function (scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.currentcontext.id = (typeof data === "number") ? data : $scope.currentcontext.id;
            $scope.UpdateCancelRequestPatientbills();
        };

        $scope.onCancelRequest = function (item) {
            var finalBills = $filter('filter')(item.FinalBills, {
                BillTypeId: 2
            });
            if (finalBills.length > 0) {
                var bill = finalBills[0];
            }
            $scope.item.PatientBillId = bill.Id;
            $scope.item.PatientId = item.PatientId;
            $scope.item.EncounterId = item.Id;
            $scope.item.EncounterTypeId = 5;
            $scope.item.DepartmentId = item.DepartmentId;
            $scope.item.GuarantorId = item.GuarantorId;
            $scope.item.FacilityId = item.FacilityId;
            $scope.item.BillingRequestTypeId = 1;
            $scope.item.BillDateTime = bill.BillDateTime;
            $scope.item.BillingRequestDateTime = utl.Formatter.getCurrentDate();
            $scope.item.BillNumber = bill.BillNumber;
            $scope.item.PatientName = item.Patient.FirstName;
            $scope.item.DoctorId = item.DoctorId;
            $scope.item.BillAmount = bill.BillAmount;
            $scope.item.BillDiscount = bill.BillDiscount;
            $scope.item.PaidAmount = bill.PaidAmount;
            $scope.item.BillGeneratedBy = bill.BillGeneratedBy;
            $scope.item.PatientBillStatusId = bill.PatientBillStatusId;
            $scope.item.BillingRequestStatusId = 1;
            $scope.item.TypeId = 2;
            $scope.item.BillingRequestBy = utl.Session.getCurrentUserId();
            $scope.item.BillingRequestAt = utl.Formatter.getCurrentDate();

            var actionName = 'Billing/BillingRequest/AddBillingRequest';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.CancelRequestCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.ipbillingtab.summary', {
                    id: entity.Id,
                    patientid: entity.PatientId,
                    isdaycare: entity.IsDayCare,
                    from: 'dcdischarges',
                    filter_from: $scope.advancedfilter.DOA,
                    filter_to: $scope.advancedfilter.DOD,
                    filter_phone: $scope.advancedfilter.Phone,
                    filter_guarantor: $scope.advancedfilter.GuarantorId,
                    filter_guarantortype: $scope.advancedfilter.GuarantorTypeId,
                    filter_doctor: $scope.advancedfilter.DoctorId,
                    filter_dept: $scope.advancedfilter.DepartmentId,
                    filter_isout: $scope.advancedfilter.IsOutstanding,
                });
            } else if (actionType == 'cancel') {
                //utl.Dialog.confirmDelete($scope.onCancelConfirmed, entity.Id, entity.BillNumber);
                $scope.onCancelBill(entity);
            } else if (actionType == 'cancelrequest') {
                //utl.Dialog.confirmDelete($scope.onCancelConfirmed, entity.Id, entity.BillNumber);
                $scope.onCancelRequest(entity);
            } else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            }
        };

        var rowtpl = '<div ng-class="{\'nonself\':entity.PatientGuarantor.GuarantorTypeId!=1} "><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "BillDate",
                displayName: $translate.instant('billing.dischargedpatients.billdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "DischargeDate",
                displayName: $translate.instant('Discharge Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "BillNumber",
                displayName: $translate.instant('billing.dischargedpatients.billno.lbl')
            },
            // { field: "VisitIdentifier", displayName: $translate.instant('billing.dischargedpatients.ipnumber.lbl') },
            {
                field: "Patient",
                displayName: $translate.instant('billing.dischargedpatients.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    // + '<a ng-click="handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} / {{entity.Patient.MRN}} / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="left" >'
                    '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" ' +
                    "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "<span >&nbsp;{{entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>",
                handleEvent: $scope.handleEvents,
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('billing.dischargedpatients.admittingdoctors.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<span ng-click="handleEvents(\'patientinfo\',row)">' +
                    "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                    "<span >{{entity.Doctor.LastName}}&nbsp;</span>" +
                    "</span></div>"
            },
            // {
            //     field: "AdmissionDate", displayName: $translate.instant('billing.dischargedpatients.doa.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate | date: 'HH:mm'}}</span>" + "</div>"
            // },
            // {
            //     field: "DischargeDate", displayName: $translate.instant('billing.dischargedpatients.dod.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate | date: 'HH:mm'}}</span>" + "</div>"
            // },
            {
                field: "Guarantor.GuarantorName",
                displayName: $translate.instant('billing.dischargedpatients.guarantor.lbl')
            },
            {
                field: "GrossAmount",
                displayName: $translate.instant('billing.dischargedpatients.billamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.GrossAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "BillDiscount",
                displayName: $translate.instant('billing.dischargedpatients.discountamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillDiscount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('billing.dischargedpatients.netamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.NetAmount | displaycurrency}}</span>' + '</div>'
            },
            // {
            //     field: "OutStandingAmount", displayName: $translate.instant('billing.dischargedpatients.dueamount.lbl'),
            //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.OutStandingAmount | displaycurrency}}</span>' + '</div>'
            // },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents align-buttion">\
                            <span  ng-click="handleEvents(\'edit\',entity)"><i class="fas fa-procedures" uib-tooltip="In patients" aria-hidden="true"></i></span>\
                            <span  ng-click="handleEvents(\'cancel\',entity)"ng-show="entity.CancelReqRaisedStatusId==2"><i class="fas fa-times trash" aria-hidden="true"></i></span>\
                          </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            // <span  ng-click="handleEvents(\'cancelrequest\',entity)" ng-hide="entity.CancelReqRaisedStatusId==1||entity.CancelReqRaisedStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.advancedfilter.DOA = $stateParams.filter_from;
                $scope.advancedfilter.DOD = $stateParams.filter_to;
                $scope.advancedfilter.Phone = $stateParams.filter_phone;
                $scope.advancedfilter.GuarantorId = $stateParams.filter_guarantor;
                $scope.advancedfilter.GuarantorTypeId = $stateParams.filter_guarantortype;
                $scope.advancedfilter.DoctorId = $stateParams.filter_doctor;
                $scope.advancedfilter.DepartmentId = $stateParams.filter_dept;
                $scope.advancedfilter.IsOutstanding = $stateParams.filter_isout;
                $scope.currentfilter.doddate = $stateParams.filter_doddate;
                $scope.getList();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            // {
            //     "Key": "ReceiptType"
            // },
            // {
            //     "Key": "ReceiptStatus"
            // },
            // {
            //     "Key": "Doctor"
            // },
            {
                "Key": "Ward"
            },
            // {
            //     "Key": "Guarantor"
            // },
            // {
            //     "Key": "Department"
            // },
            {
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "GuarantorType"
            }
            ]
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

    DayCaredischargedpatientsListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();