(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findbillListController', findbillListController);

    function findbillListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.Context = modalConfig.params.context;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.id = modalConfig.params.id

        if ($scope.Context == 'OP') {
            $scope.billtype = 1;
            $scope.isdirectdgbill = false;
        } else if ($scope.Context == 'DG') {
            $scope.billtype = 5;
            $scope.isdirectdgbill = true;
        } else
            $scope.billtype = 1 || 5;


        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                MRN: null,
                DoctorId: -1,
                MobileNo: null,
                BillPriorityId: -1,
                BillStatusId: -1,
                BillTypeId: -1,
                PatientId: -1,
                PatientBillStatusId: 3,
                BillNumber: null,
                FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
                GuarantorTypeId: -1,
                GuarantorId: -1,
                IsOutStanding: false
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [{
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
                    },
                    {
                        type: 'select',
                        translate: 'billing.findbill-list.referedby.lbl',
                        model: 'ReferralId',
                        options: $scope.lookup.Referral,
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                    // {
                    //     type: 'text',
                    //     translate: 'billing.findbill-list.mrn.lbl',
                    //     model: 'MRN',
                    //     position: {
                    //         r: 0,
                    //         c: 2
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findbill-list.consdoctor.lbl',
                    //     model: 'DoctorId',
                    //     options: $scope.lookup.Doctor,
                    //     position: {
                    //         r: 1,
                    //         c: 0
                    //     }
                    // },
                    // {
                    //     type: 'text',
                    //     translate: 'billing.findbill-list.mobileno.lbl',
                    //     model: 'MobileNo',
                    //     position: {
                    //         r: 1,
                    //         c: 1
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findbill-list.billpriority.lbl',
                    //     model: 'BillPriorityId',
                    //     options: $scope.lookup.BillPriority,
                    //     position: {
                    //         r: 1,
                    //         c: 2
                    //     }
                    // },

                    // { type: 'select', translate: 'billing.findbill-list.billtype.lbl', model: 'BillTypeId', options: $scope.lookup.BillType, position: { r: 2, c: 1 } },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findbill-list.guarantortype.lbl',
                    //     model: 'GuarantorTypeId',
                    //     options: $scope.lookup.GuarantorType,
                    //     position: {
                    //         r: 2,
                    //         c: 1
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findbill-list.facility.lbl',
                    //     model: 'FacilityId',
                    //     options: $scope.lookup.Facility,
                    //     position: {
                    //         r: 2,
                    //         c: 2
                    //     }
                    // },

                    // {
                    //     type: 'text',
                    //     translate: 'billing.findbill-list.billnumber.lbl',
                    //     model: 'BillNumber',
                    //     position: {
                    //         r: 3,
                    //         c: 1
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findbill-list.guarantor.lbl',
                    //     model: 'GuarantorId',
                    //     options: $scope.lookup.Guarantor,
                    //     position: {
                    //         r: 3,
                    //         c: 2
                    //     }
                    // },

                    // { type: '', translate: '', model: '', position: { r: 4, c: 1 } },
                    // { type: 'select', translate: 'billing.findbill-list.guarantortype.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 4, c: 0 } },
                    // { type: 'checkbox', translate: 'billing.findbill-list.isoutstanding.lbl', model: 'IsOutStanding', position: { r: 4, c: 1 } },
                    // { type: '', translate: '', model: '', position: { r: 4, c: 2 } }
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'fetch'
                    },
                    // {
                    //     type: 'reset',
                    //     translate: 'common.resetaction.lbl',
                    //     cls: 'btn-danger'
                    // }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }
            $scope.getList();
        }

        //Dynamic form  ends
        //getList
        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;

            if ($scope.billtype == undefined) {
                var items = [];
                for (var idx in $scope.gridData) {
                    var v = $scope.gridData[idx];
                    if (v.BillTypeId == 1 || v.BillTypeId == 5) {
                        items.push(v);
                    }
                }
                vm.gridConfig.data = items;
            } else
                vm.gridConfig.data = $scope.gridData;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            // if ($scope.modeldata.PatBillNum) {
            //     $scope.modeldata.FromDate = '';
            //     $scope.modeldata.ToDate = '';
            // }
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            var inputData = {
                Params: [{
                        Key: 49,
                        Value: $scope.modeldata.PatBillNum
                    },
                    {
                        Key: 4,
                        Value: $scope.modeldata.PatientBillStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.billtype
                    },
                    {
                        Key: 7,
                        Value: $scope.modeldata.DoctorId
                    },
                    {
                        Key: 8,
                        Value: $scope.modeldata.FacilityId
                    },
                    {
                        Key: 47,
                        Value: $scope.isdirectdgbill
                    },
                    {
                        Key: 11,
                        Value: OutStandingcond
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.id
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }

            };
            if ($scope.modeldata.FromDate || $scope.modeldata.ToDate) {
                // $scope.modeldata.FromDate = '';
                // $scope.modeldata.ToDate = '';
                inputData.Params.push({
                    Key: 1,
                    Value: [FrmDate, ToDate]
                }, )

            }
            var options = {
                action: 'billing/patientbills/GetFindPatientBills',
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
        }
        //Grid Actions
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                $scope.confirmCallback({
                    BillId: entity.Id,
                    PatientId: entity.PatientId,
                    BillTypeId: entity.BillTypeId
                });
                //    $state.go('app.ipbillingtab.summary');
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "Id",
                    displayName: $translate.instant('Select'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="btn btn-check btn-rounded fa fa-check" aria-hidden="true"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }, {
                    field: "BillNumber",
                    displayName: $translate.instant('billing.findbill-list.billnumber.lbl')
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('billing.findbill-list.mrn.lbl')
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.FirstName}}" tooltip-placement="left" >' +
                        "<span ><b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                        "</a></div>"
                },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findbill-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "BillDiscount",
                    displayName: $translate.instant('billing.findbill-list.disamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billing.findbill-list.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billing.findbill-list.dueamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PatientBillStatus.Description",
                    displayName: $translate.instant('billing.findbill-list.status.lbl')
                },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true


        };

        // //Grid selection related code starts
        // vm.gridConfig.enableRowSelection = true;
        // vm.gridConfig.multiSelect = false
        // vm.gridConfig.onRegisterApi = function (gridApi) {
        //     //set gridApi on scope
        //     $scope.gridApi = gridApi;
        //     gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        //         console.log(entity.Id);
        //         $scope.confirmCallback({
        //             BillId: entity.Id,
        //             PatientId: entity.PatientId,
        //             BillTypeId: entity.BillTypeId
        //         });
        //     });
        // };
        //Grid selection related code ends

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();

        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "BillType"
                },
                {
                    "Key": "PatientBillStatus"
                },
                {
                    "Key": "Referral"
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

    findbillListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();