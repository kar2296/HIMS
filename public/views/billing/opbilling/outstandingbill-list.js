(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('outstandingbillListController', outstandingbillListController);

    function outstandingbillListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        if (modalConfig.params && modalConfig.params.id) { // Condition based on IP or OP Bill 
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.eid = 0;
            $scope.IsPicker = true;
        }
        if (modalConfig.params && modalConfig.params.eid) { // Condition based on IP or OP Bill 
            $scope.currentcontext.id = 0;
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.IsPicker = false;
        }

        $scope.currentcontext.totalOutStandingAmount = 0;

        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                MRN: null,
                DoctorId: -1,
                MobileNo: null,
                BillPriorityId: -1,
                BillStatusId: 3,
                BillTypeId: -1,
                PatientId: -1,
                BillNumber: null,
                FacilityId: -1, //parseInt(utl.Session.getCurrentFacilityId())
                GuarantorTypeId: -1,
                GuarantorId: -1,
                IsOutStanding: true
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [{
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
                ],
                actions: [{
                    type: 'apply',
                    translate: 'common.applyaction.lbl',
                    cls: 'fetch'
                }, ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }
            // if ($scope.currentcontext.id >= 1) {
            $scope.getList();
            // }
        }

        //Dynamic form  ends
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            res.Data.forEach((v, i) => {
                $scope.currentcontext.totalOutStandingAmount = (isNaN(parseFloat($scope.currentcontext.totalOutStandingAmount)) ? 0 : parseFloat($scope.currentcontext.totalOutStandingAmount)) +
                    (isNaN(parseFloat(v.OutStandingAmount)) ? 0 : parseFloat(v.OutStandingAmount));
            });
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            if ($scope.IsPicker) { // Condition based on IP or OP Bill 
                var inputData = {
                    Params: [{
                            Key: 1,
                            Value: [FrmDate, ToDate]
                        },
                        {
                            Key: 2,
                            Value: $scope.modeldata.BillNumber
                        },
                        {
                            Key: 4,
                            Value: $scope.modeldata.BillStatusId
                        },
                        {
                            Key: 5,
                            Value: $scope.modeldata.BillPriorityId
                        },
                        {
                            Key: 6,
                            Value: 1
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
                            Key: 9,
                            Value: $scope.modeldata.GuarantorTypeId
                        },
                        {
                            Key: 10,
                            Value: $scope.modeldata.GuarantorId
                        },
                        {
                            Key: 11,
                            Value: OutStandingcond
                        },
                        // {
                        //     Key: 12,
                        //     Value: $scope.modeldata.PatientId
                        // },
                        {
                            Key: 13,
                            Value: $scope.modeldata.MRN
                        },
                        {
                            Key: 14,
                            Value: $scope.modeldata.MobileNo
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
            } else if (!$scope.IsPicker) { // Condition based on IP or OP Bill 
                inputData = {
                    Params: [{
                            Key: 11,
                            Value: OutStandingcond
                        },
                        {
                            Key: 12,
                            Value: $scope.currentcontext.eid
                        }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
            }
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
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "Id",
                    displayName: $translate.instant('Select'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="fa fa-check" aria-hidden="true"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('billing.findbill-list.mrn.lbl')
                },
                {
                    field: "BillNumber",
                    displayName: $translate.instant('billing.findbill-list.billnumber.lbl')
                },
                // {
                //     field: "EncounterType.Description",
                //     displayName: $translate.instant('billing.findbill-list.ipnumber.lbl')
                // },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
                },
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
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billing.findbill-list.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },

            enableFullRowSelection: $scope.IsPicker

        };
        // if ($scope.IsPicker) { // To Enable Only for Op billing
        //     //Grid selection related code starts
        //     vm.gridConfig.enableRowSelection = true;
        //     vm.gridConfig.multiSelect = false
        //     vm.gridConfig.onRegisterApi = function (gridApi) {
        //         //set gridApi on scope
        //         $scope.gridApi = gridApi;
        //         gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        //             console.log(entity.Id);
        //             $scope.confirmCallback({
        //                 BillId: entity.Id
        //             });
        //         });
        //     };
        //     //Grid selection related code ends
        // } else {
        //     vm.gridConfig.enableRowSelection = false;
        // }

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
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

    outstandingbillListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();