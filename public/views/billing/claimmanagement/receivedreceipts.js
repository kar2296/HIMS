(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('receivedreceiptsListController', receivedreceiptsListController);

    function receivedreceiptsListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentfilter = {
            PaymentDate: utl.Formatter.getCurrentDate(),
            GuarantorTypeId: -1,
            GuarantorId: -1,
            PaymentIdentifier: '',
            InsurancePaymentStatusId: 3
        };


        $scope.custom_sort = function (a, b) {
            return new Date(b.PaymentDate).getTime() - new Date(a.PaymentDate).getTime();
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.Data.length;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.PaymentDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.PaymentDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.PaymentIdentifier },
                    { Key: 3, Value: $scope.currentfilter.InsurancePaymentStatusId },
                    { Key: 4, Value: $scope.currentfilter.GuarantorTypeId },
                    { Key: 5, Value: $scope.currentfilter.GuarantorId },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if ($scope.currentfilter.PaymentDate)
                inputData.Params.push({ Key: 6, Value: [FrmDate, ToDate] });

            var options = {
                action: 'billing/insurancepayment/GetInsurancePayments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.GuarantorTypeChange = function (selectedItem) {
            $scope.lookup.SelectedGuarantor = [];
            var len = $scope.lookup.Guarantor.length;
            for (var i = 0; i < len; i++) {
                if ($scope.lookup.Guarantor[i].Id > 0) {
                    if (SelectedGuarantorType.Id == $scope.lookup.Guarantor[i].GuarantorTypeId) {
                        $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                    }
                } else {
                    $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                }
            }

            if ($scope.lookup.SelectedGuarantor && $scope.lookup.SelectedGuarantor.length > 1) {
                $scope.item.GuarantorId = $scope.lookup.SelectedGuarantor[1].Id;
                $scope.item.GuarantorName = $scope.lookup.SelectedGuarantor[1].Text;
            }
        };
        //Guarantor List
        vm.guarantorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                {
                    header: 'Guarantor Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                }, {
                    header: 'Guarantor Name',
                    field: 'GuarantorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/Guarantor/GetGuarantors',
            formatdisplay: formatselectedguarantor,
            presearch: presearchguarantor,
            postsearch: postsearchguarantor
        };

        function formatselectedguarantor() {
            var selectedItem = vm.guarantorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                // $scope.item.GuarantorId = selectedItem.Id;
                // $scope.item.GuarantorName = selectedItem.GuarantorName;
                $scope.currentfilter.GuarantorId = selectedItem.Id;
                $scope.currentfilter.GuarantorName = selectedItem.GuarantorName;
                result = [selectedItem.GuarantorName].join(' ');
            } else if (vm.guarantorcontrolconfig.rowdata) {
                result = [vm.guarantorcontrolconfig.rowdata.GuarantorName].join(' ');
            }
            return result;
        }

        function presearchguarantor() {
            var query = vm.guarantorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };


            if (vm.guarantorcontrolconfig.searchbyid === true) {
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

            vm.guarantorcontrolconfig.searchparams = inputData;
        }

        function postsearchguarantor() {
            for (var idx in vm.guarantorcontrolconfig.result) {
                var item = vm.guarantorcontrolconfig.result[idx];
                item.GuarantorName = item.GuarantorName;
                item.GuarantorCode = item.GuarantorCode;
            // $scope.currentcontext.GuarantorTypeId = item.GuarantorTypeId;
            // $scope.item.TpaId = item.TPAId;
                // if (item.RemarkType) {
                //     item.RemarkType = item.RemarkType.Description;
                // }
            }
        }

        $scope.addNew = function () {
            $state.go('app.claimmanagement-listtab.newreceipts', {
                id: 0
            });
        };

        $scope.NavigateForm = function (Id) {
            $state.go('app.claimmanagement-listtab.newreceipts', { id: Id });
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'cancel') {

            }
            if (actionType == 'edit') {
                $scope.NavigateForm(entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No",
                    displayName: $translate.instant('currentinpatient.ipno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                field: "PaymentDate",
                displayName: $translate.instant('billing.claimmanagement.date.lbl'),
                cellTemplate: "<ngformatdate datetime-val='entity.PaymentDate'></ngformatdate>"
            },
            {
                field: "PaymentIdentifier",
                displayName: $translate.instant('billing.claimmanagement.receiptnos.lbl')
            },
            {
                field: "GuarantorName",
                displayName: $translate.instant('billing.claimmanagement.guarantorname.lbl')
            },
            // {
            //     field: "ToBeClaimAmount",
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ToBeClaimAmount | displaycurrency}}</span>" + "</div>",
            //     displayName: $translate.instant('billing.claimmanagement.tobeclaimedamount.lbl')
            // },
            {
                field: "ReceivedAmount",
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReceivedAmount | displaycurrency}}</span>" + "</div>",
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ReceivedAmount | displaycurrency}}</span>" + "</div>",
                displayName: $translate.instant('billing.claimmanagement.receivedamount.lbl')
            },
            {
                field: "TDSAmount",
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TDSAmount | displaycurrency}}</span>" + "</div>",
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TDSAmount | displaycurrency}}</span>" + "</div>",
                displayName: $translate.instant('billing.claimmanagement.tds.lbl')
            },
            {
                field: "Disallowed",
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Disallowed | displaycurrency}}</span>" + "</div>",
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Disallowed | displaycurrency}}</span>" + "</div>",
                displayName: $translate.instant('billing.claimmanagement.disallowed.lbl')
            },
            {
                field: "InsurancePaymentStatus.Description",
                displayName: $translate.instant('billing.claimmanagement.status.lbl')
            },
            {
                field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                     <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.InsurancePaymentStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.InsurancePaymentStatusId==1||entity.InsurancePaymentStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    </div>',
                                                    handleEvent: $scope.handleEvents,
                                                    actions: [
                                                            { actiontype: 'cancel', display: 'common.cancelaction.lbl' },
                                                            { actiontype: 'edit', display: 'common.editaction.lbl' }
                                                        ]
                // cellTemplate: 'actionTemplate.html',
                // actions: [
                //     // { actiontype: 'cancel', display: 'common.cancelaction.lbl' },
                //     { actiontype: 'edit', display: 'common.editaction.lbl' }
                // ]
            }],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "GuarantorType" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "InsurancePaymentStatus" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                rows: vm.gridConfig.data
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'paymentIdentifierChange') {
                $scope.currentfilter.PaymentIdentifier = payload.value;
            } else if (actionName === 'fetch') {
                $scope.getList();
            } else if (actionName === 'paymentDateChange') {
                $scope.currentfilter.PaymentDate = payload.value;
                $scope.getList();
            } else if (actionName === 'statusChange') {
                $scope.currentfilter.InsurancePaymentStatusId = payload.value;
                $scope.getList();
            } else if (actionName === 'edit') {
                $scope.NavigateForm(payload.Id);
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }
    receivedreceiptsListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];
})();