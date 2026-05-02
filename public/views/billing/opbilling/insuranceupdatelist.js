(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InsuranceUpdateListController', InsuranceUpdateListController);

    function InsuranceUpdateListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        }
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
        };

        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: [FrmDate, ToDate]
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.BillTypeId
                    },

                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.GuarantorTypeId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.GuarantorId
                    },

                    {
                        Key: 12,
                        Value: $scope.currentfilter.PatientId
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.MRN
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.MobileNo
                    },
                    {
                        Key: 15,
                        Value: $scope.currentfilter.PatientName
                    }

                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientbills/GetPatientBillsforInsuranceupdate',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.insuranceupdateform', {
                params: {
                    id: Id,
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'view') {
                $scope.openModal(entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "PatientMrn",
                    displayName: $translate.instant('billing.findbill-list.mrn.lbl')
                },
                {
                    field: "BillNumber",
                    displayName: $translate.instant('billing.findbill-list.billnumber.lbl')
                },
                // {
                //     field: "EncountertypeId",
                //     displayName: $translate.instant('billing.findbill-list.ipnumber.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">{{"OP"}}</div>'
                // },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                    // cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
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
                    field: "PaidAmount",
                    displayName: $translate.instant('billing.findbill-list.paidamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.PaidAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contentsname">\
                                                    <span class="grid-action" uib-tooltip="View" tooltip-placement="bottom" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                   </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
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



        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList()
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

    InsuranceUpdateListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();