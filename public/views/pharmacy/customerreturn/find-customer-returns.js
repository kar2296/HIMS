(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findcustomerreturnsListController', findcustomerreturnsListController);

    function findcustomerreturnsListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            TotalReturnAmount: 0,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.id = modalConfig.params.id;

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                MRN: null,
                DoctorId: -1,
                MobileNo: null,
                ReturnPriorityId: -1,
                ReturnStatusId: -1,
                PharmacyReturnTypeId: 1,
                CustomerId: -1,
                CustomerReturnStatusId: 3,
                ReturnNumber: null,
                FacilityId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    {
                        type: 'text',
                        translate: 'billing.findreturn-list.patientname.lbl',
                        model: 'CustomerName',
                        position: {
                            r: 0,
                            c: 0
                        },placeholder: 'Name / UHID' 
                    },
                    {
                        type: 'date',
                        translate: 'billing.findreturn-list.date.lbl',
                        model: 'FromDate',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'billing.findreturn-list.todate.lbl',
                        model: 'ToDate',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'billing.findreturn-list.returnnumber.lbl',
                        model: 'ReturnNumber',
                        position: {
                            r: 2,
                            c: 0
                        }
                    },

                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'fetch'
                    },
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }

            $scope.getList();
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.ReturnDateTime).getTime() - new Date(a.ReturnDateTime).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;
            $scope.currentcontext.TotalReturnAmount = 0;
            for (var idx in $scope.gridData) {
                var billitem = $scope.gridData[idx];
                $scope.currentcontext.TotalReturnAmount = $scope.currentcontext.TotalReturnAmount + billitem.ReturnAmount;
            }
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#ReturnNumber').focus();
        };

        /* Pharmacy Sales Find Bills - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 13) { // Enter Key
                $scope.actionClick('apply');
            }
        }
        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Pharmacy Sales Find Bills - Shortcut Keys - End */

        $scope.getList = function (pageNo) {
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            if ($scope.modeldata.ReturnNumber || $scope.modeldata.MRN ||
                $scope.modeldata.MobileNo|| $scope.modeldata.CustomerName) {
                $scope.modeldata.FromDate = null;
                $scope.modeldata.ToDate = null;
            }
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: [FrmDate, ToDate]
                    },
                    {
                        Key: 2,
                        Value: $scope.modeldata.ReturnNumber
                    },
                    {
                        Key: 4,
                        Value: $scope.modeldata.CustomerReturnStatusId
                    },
                    {
                        Key: 5,
                        Value: $scope.modeldata.ReturnPriorityId
                    },
                    {
                        Key: 6,
                        Value: [1, 2, 3, 4]
                    },
                    {
                        Key: 8,
                        Value: $scope.modeldata.FacilityId
                    },
                    {
                        Key: 12,
                        Value: $scope.modeldata.CustomerMasterId
                    },
                    {
                        Key: 15,
                        Value: $scope.modeldata.CustomerName
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.id
                    },
                    // {
                    //     Key: 19,
                    //     Value: $scope.modeldata.PharmacyReturnTypeId
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'billing/customerreturns/GetCustomerReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.customerprofiledetails = function (customerMasterId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: customerMasterId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                $scope.confirmCallback({
                    ReturnId: entity.Id,
                    CustomerMasterId: entity.CustomerMasterId
                });
                //    $state.go('app.ipbillingtab.summary');
            } else if (actionType == 'patientinfo') {
                $scope.customerprofiledetails(entity.CustomerMasterId.Id);
            }
        };

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
                    field: "ReturnNumber",
                    displayName: $translate.instant('billing.findreturn-list.returnnumber.lbl')
                },
                {
                    field: "CustomerName",
                    displayName: $translate.instant('Customer Name')
                },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findreturn-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReturnDateTime'></ngformatdate>"
                },
                {
                    field: "CustomerReturnStatus.Description",
                    displayName: $translate.instant('billing.findreturn-list.status.lbl')
                },
                {
                    field: "RefundedAmount",
                    displayName: $translate.instant('billing.findreturn-list.refundedamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RefundedAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "CreatedName",
                    displayName: $translate.instant('billing.findbill-list.createdname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.CreatedUser.Title.Description}} {{entity.CreatedUser.FirstName}} {{entity.CreatedUser.LastName}}</div>'
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

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.confirmCallback({
                    ReturnId: entity.Id,
                    CustomerMasterId: entity.CustomerMasterId
                });
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ReturnPriority"
                },
                // {
                //     "Key": "PharmacyReturnType"
                // },
                {
                    "Key": "CustomerReturnStatus"
                },
                {
                    "Key": "Facility"
                },
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

    findcustomerreturnsListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();