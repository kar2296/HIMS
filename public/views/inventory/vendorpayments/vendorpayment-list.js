(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VendorPaymentListController', VendorPaymentListController);

    function VendorPaymentListController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.Items = [];
        $scope.currentfilter = {
            VendorPaymentStatusId: 2,
            VendorPaymentDate: utl.Formatter.getCurrentDate(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.lookup = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.VendorMasterId },
                    { Key: 6, Value: $scope.currentfilter.VendorPaymentStatusId },
                    { Key: 7, Value: $scope.currentfilter.VendorPaymentIdentifier },
                    {
                        Key: 3,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 4,
                        Value: utl.Formatter.getFilterDate(To)
                    }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'pharmacy/VendorPayment/GetVendorPayments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            $state.go('app.vendorpayments', { id: 0 });
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/VendorPayment/DeleteVendorPayment',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.vendorpayments', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.VendorPaymentIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.vendorpayments', { id: entity.Id });
            }
        };
        // $scope.getPatientInfo = function (row) {
        //     console.log(row);
        // };

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [{
                    header: 'Supplier Code',
                    field: 'VendorCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Supplier Name',
                    field: 'VendorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Supplier Contact',
                    field: 'PhoneNumber',
                    datatype: 'string',
                    headercls: 'td-phoneno',
                    fieldcls: 'td-phoneno'
                }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
                $scope.currentfilter.VendorCode = selectedItem.VendorCode;
                $scope.currentfilter.VendorName = selectedItem.VendorName;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 1
                }, {
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {

                var item = vm.vendorcontrolconfig.result[idx];

                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.vendorpayments.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "VendorPaymentDate",
                    displayName: $translate.instant('inventory.vendorpayments.paymentdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.VendorPaymentDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.VendorPaymentDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "VendorPaymentIdentifier", displayName: $translate.instant('inventory.vendorpayments.paymentno.lbl') },
                { field: "VendorName", displayName: $translate.instant('inventory.vendorpayments.supplier.lbl') },

                { field: "PaymentType.Description", displayName: $translate.instant('inventory.vendorpayments.paymenttype.lbl') },
                {
                    field: "TotalPaidAmount", displayName: $translate.instant('inventory.vendorpayments.Paymentamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalPaidAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                // {
                //     field: "TransferedBy",
                //     displayName: $translate.instant('inventory.vendorpayments.transferedby.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CreatedUser.LastName}}</span>" + "</div>"
                // },
                { field: "VendorPaymentStatus.Description", displayName: $translate.instant('inventory.vendorpayments.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.VendorPaymentStatusId==3||entity.VendorPaymentStatusId==4><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.VendorPaymentStatusId==2||entity.VendorPaymentStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.VendorPaymentStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        function setDefaults() {
            var DrafrId = utl.Lookup.getDefault($scope.lookup.VendorPaymentStatus, 'Draft');
            var completedId = utl.Lookup.getDefault($scope.lookup.VendorPaymentStatus, 'Completed');
            var CancelledId = utl.Lookup.getDefault($scope.lookup.VendorPaymentStatus, 'Cancelled');
            $scope.currentfilter.VendorPaymentStatusId = completedId;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.backtoList = function () {
            $state.go('app.storedashboard');
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "VendorPaymentStatus"},
                // { "Key": "TransferType" },
                // { "Key": "ToStore" },
                // { "Key": "TranferedUser" },
                // {
                //     "Key": "UserStores",
                //     Request: {
                //         Params: [
                //             { Key: 1, Value: utl.Session.getCurrentUserId() },
                //             { Key: 5, Value: 2 }
                //         ]
                //     },
                //     Default: false
                // },
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
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
    }
    VendorPaymentListController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();