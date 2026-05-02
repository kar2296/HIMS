(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingbillListController', pendingbillListController);

    function pendingbillListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            FromBillDate: utl.Formatter.getCurrentDate(),
            ToBillDate: utl.Formatter.getCurrentDate(),
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.id = modalConfig.params.id
        $scope.currentcontext.BillType = modalConfig.params.billtype
        $scope.currentcontext.pid = modalConfig.params.pid


        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {

                BillStatusId: 1, // Only Draft Bills (Pending Bills)

                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                BillTypeId: -1,

                GuarantorTypeId: -1,
                GuarantorId: -1,
                DoctorId: -1,

                MRN: null,
                MobileNo: null,
                PatientId: -1,

            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    // { type: 'date', translate: 'billing.findbill-list.date.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    // { type: 'date', translate: 'billing.findbill-list.todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    // { type: 'select', translate: 'billing.findbill-list.billtype.lbl', model: 'BillTypeId', options: $scope.lookup.BillType, position: { r: 2, c: 0 } },

                    // { type: 'select', translate: 'billing.findbill-list.consdoctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 2, c: 1 } },
                    // { type: 'select', translate: 'billing.findbill-list.guarantor.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 3, c: 0 } },
                    // { type: 'select', translate: 'billing.findbill-list.guarantortype.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 3, c: 1 } },


                    // { type: 'text', translate: 'billing.findbill-list.mrn.lbl', model: 'MRN', position: { r: 4, c: 0 } },
                    // { type: 'text', translate: 'billing.findbill-list.mobileno.lbl', model: 'MobileNo', position: { r: 4, c: 1 } },
                    // { type: 'text', translate: 'billing.findbill-list.patientname.lbl', model: 'PatientName', position: { r: 5, c: 0 } }
                    {
                        type: 'text',
                        translate: 'billing.findbill-list.patientname.lbl',
                        model: 'PatBillNum',
                        placeholder: 'Name/UHID/Bill#',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'billing.findbill-list.fromdate.lbl',
                        model: 'FromDate',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'date',
                        translate: 'billing.findbill-list.todate.lbl',
                        model: 'ToDate',
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                    {
                        type: 'checkbox',
                        translate: 'billing.findbill-list.isoutstanding.lbl',
                        model: 'IsOutStanding',
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'billing.findbill-list.billstatus.lbl',
                        model: 'PatientBillStatusId',
                        options: $scope.lookup.PatientBillStatus,
                        position: {
                            r: 1,
                            c: 1
                        }
                    }
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'fetch'
                    },
                    // { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            $scope.getList();
        }

        //Dynamic form  ends
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
        };

        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.currentcontext.FromBillDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentcontext.ToBillDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [

                    {
                        Key: 12,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.BillType
                    },
                    // {
                    //     Key: 4,
                    //     Value: 1
                    // },

                    // {
                    //     Key: 1,
                    //     Value: [FrmDate, ToDate]
                    // },
                    // {
                    //     Key: 6,
                    //     Value:  $scope.currentcontext.BillType
                    // },

                    // {
                    //     Key: 7,
                    //     Value: $scope.modeldata.DoctorId
                    // },
                    // {
                    //     Key: 9,
                    //     Value: $scope.modeldata.GuarantorTypeId
                    // },
                    // {
                    //     Key: 10,
                    //     Value: $scope.modeldata.GuarantorId
                    // },

                    // {
                    //     Key: 12,
                    //     Value: $scope.currentcontext.pid
                    // },
                    {
                        Key: 13,
                        Value: $scope.modeldata.MRN
                    },
                    {
                        Key: 14,
                        Value: $scope.modeldata.MobileNo
                    },
                    // {
                    //     Key: 12,
                    //     Value: $scope.currentcontext.id
                    // },
                    // {
                    //     Key: 15,
                    //     Value: $scope.modeldata.PatientName
                    // }

                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                $scope.confirmCallback({
                    BillId: entity.Id
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "Id",
                    displayName: $translate.instant('Select'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="btn btn-check btn-rounded fa fa-check" aria-hidden="true"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('billing.findbill-list.mrn.lbl')
                },
                // {
                //     field: "BillNumber",
                //     displayName: $translate.instant('billing.findbill-list.billnumber.lbl')
                // },
                // {
                //     field: "EncountertypeId",
                //     displayName: $translate.instant('billing.findbill-list.ipnumber.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">{{"OP"}}</div>'
                // },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
                },
                // {
                //     field: "Date", displayName: $translate.instant('billing.findbill-list.date.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.BillDateTime ? (entity.BillDateTime | date : "dd/MM/yyyy HH:mm:ss") : "N/A"}} </div>'
                // },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findbill-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
                },

                // {
                //     field: "ConsDoctor",
                //     displayName: $translate.instant('billing.findbill-list.consdoctor.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.User.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
                // },
                {
                    field: "PatientBillStatus.Description",
                    displayName: $translate.instant('billing.findbill-list.status.lbl')
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billing.findbill-list.dueamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.OutStandingAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billing.findbill-list.paidamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.PaidAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillAmount | displaycurrency}}</span>' + '</div>'
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true


        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(entity.Id);
                $scope.confirmCallback({
                    BillId: entity.Id
                });
            });
        };
        //Grid selection related code ends

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            if ($scope.currentcontext.id >= 1) {
                $scope.getList()
            };
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "BillPriority"
                },
                {
                    "Key": "BillType"
                },
                {
                    "Key": "PatientBillStatus"
                },
                {
                    "Key": "ServiceCategory"
                },
            ];
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

    pendingbillListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();