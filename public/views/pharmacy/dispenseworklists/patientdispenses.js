(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientDispenseListController', PatientDispenseListController);

    function PatientDispenseListController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            DispenseNumber: '',
            DispenseStatusId: 2,
            DispenseTypeId: 1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            PatientName: null,
            PatientRequestNumber: '',
            WardId: -1
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.advancedfilter = {
            FromDate: null,
            ToDate: null,
            FromFacility: -1,
            ToFacility: -1,
            CreatedUser: -1,
            ApprovedUser: -1
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {};
            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.stocktransfers.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.stocktransfers.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.stocktransfers.dispensedby.lbl', model: 'DispensedBy', options: $scope.lookup.DispensedUser, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.status.lbl', model: 'DispenseStatusId', options: $scope.lookup.DispenseStatus, position: { r: 2, c: 0 } },
                    { position: { r: 2, c: 1 } },

                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
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

        vm.pharmacyitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Item Code',
                field: 'ItemCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Item Name',
                field: 'ItemName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemStoreMaps',
            formatdisplay: formatselectedpharmacyitem,
            presearch: presearchpharmacyitem,
            postsearch: postsearchpharmacyitem
        };

        function formatselectedpharmacyitem() {
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, '(', selectedItem.ItemCode, ')'].join(' ');
            } else if (vm.pharmacyitemcontrolconfig.rowdata) {
                result = [vm.pharmacyitemcontrolconfig.rowdata.ItemName, vm.pharmacyitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.item.ToStoreId },
                    // { Key: 4, Value: 1 }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.pharmacyitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                // if (item.ItemMaster.ProductType !== null) {
                //     item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                // } else {
                //     item.ProductTypeName = '';
                // }
                // item.GenericName = item.ItemMaster.GenericName;
                // item.ManufacturerName = item.ItemMaster.ManufacturerName;
                /*
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                // if (item.ItemMaster.StockItem !== null) {
                //     item.StockInHand = item.ItemMaster.StockItem.Quantity;
                // } else {
                //     item.StockInHand = 0;
                // }
            }
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalnetamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);

                totalnetamount = totalnetamount + (item.TotalNetAmount)

                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetamount = totalnetamount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            // var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            if (!$scope.currentfilter.FromDate||!$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg('Please Select Disp.Date');
                return false;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DispenseNumber },
                    { Key: 2, Value: $scope.currentfilter.DispenseTypeId },
                    /* { Key: 3, Value: $scope.currentfilter.DispenseStatusId }, */
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 8, Value: $scope.currentfilter.PatientRequestNumber },
                    { Key: 9, Value: $scope.currentfilter.PatientName },
                    { Key: 10, Value: $scope.currentfilter.WardId },
                    { Key: 11, Value: From },
                    { Key: 12, Value: To },
                    // { Key: 11, Value: FromReq },
                    // { Key: 12, Value: ToReq },
                    { Key: 14, Value: $scope.advancedfilter.ApprovedBy },
                    { Key: 15, Value: $scope.advancedfilter.DispensedBy },
                    { Key: 16, Value: $scope.advancedfilter.DispenseStatusId },
                    // { Key: 22, Value: $scope.currentfilter.ItemMasterId }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientDispense/GetPatientDispensedListWithoutDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.stocktransfer', { id: 0 });
        };

        $scope.filter = function () {
            $state.go('app.stocktransfers.transferfilter', { transferfilterid: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/StockTransfer/DeleteStockTransfer',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.patientdispense-view', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DispenseIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.patientdispense-view', { id: entity.Id, PatientDispenseId: entity.Id, DispenseStatusId: entity.DispenseStatusId, StoreMasterId: entity.StoreMasterId });
            }
        };

        vm.gridConfig = {
            columnDefs: [{
                field: "DispenseDateTime",
                displayName: $translate.instant('billing.patientdispenses.dispensedatetime.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DispenseDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.DispenseDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "DispenseNumber", displayName: $translate.instant('billing.patientdispenses.dispensenumber.lbl') },
            { field: "DispenseStore.StoreName", displayName: $translate.instant('billing.patientdispenses.mystore.lbl') },
            {
                field: "Patient",
                displayName: $translate.instant('admissions.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                    '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                    // + '<a ng-click="handleEvents(\'patientinfo\',entity)">'
                    +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "{{entity.Patient.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.Patient.FirstName}}&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            },
            {
                field: "WardMaster",
                displayName: $translate.instant('billing.patientdispenses.wardroom.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.WardMaster.WardName}}&nbsp;</span>" + " / " + "<span >{{entity.WardRoomMaster.RoomNo}}</span>" + "</div>"
            },
            { field: "PatientRequestNumber", displayName: $translate.instant('billing.patientdispenses.orderno.lbl') },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('billing.patientdispenses.totalnetamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "DispensedBy",
                displayName: $translate.instant('billing.patientdispenses.dispensedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DispensedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.DispensedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.DispensedUser.LastName}}</span>" + "</div>"
            },
            { field: "DispenseStatus.Description", displayName: $translate.instant('billing.patientdispenses.dispensestatus.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.DispenseStatusId == 2 || entity.DispenseStatusId == 3 || entity.DispenseStatusId == 4"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                </div>',
                                                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        /*
        function setDefaults() {
            var DispensedId = utl.Lookup.getDefault($scope.lookup.DispenseStatus, 'Dispensed');
            var AcceptedId = utl.Lookup.getDefault($scope.lookup.DispenseStatus, 'Accepted');
            $scope.currentfilter.DispenseStatusId = DispensedId + "," + AcceptedId;
        }
        */
$timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            /* setDefaults(); */
            $scope.getList();
            initDynamicForm();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "DispenseStatus" },
                { "Key": "Ward" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
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
    PatientDispenseListController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();