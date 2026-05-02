(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchasereturnsListController', purchasereturnsListController);

    function purchasereturnsListController($rootScope, $scope, $stateParams, $filter, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            VendorMasterId: -1,
            PrnNumber: '',
            StoreMasterId: 0,
            PrnTypeId: -1,
            PrnStatusId: 2,
            PrnDate: utl.Formatter.getCurrentDate(),
            FromDate: new Date(),
            ToDate:utl.Formatter.getCurrentDate()
        };
        $scope.currentfilter.FromDate.setDate($scope.currentfilter.FromDate.getDate() - 7);
        $scope.backtoList = function () {
            $state.go('app.storedashboard');
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.advancedfilter = {
            From: '',
            To: '',
            FromFacilityId: 1,
            ApprovedBy: -1,
            StoreId: 0,
            ToStoreId: -1,
            AuthorizedBy: -1,
            ToFacilityId: -1
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentcontext.prnid = parseInt(utl.Session.getEMRPatientId());

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.TotalGrossAmount = isNaN(parseFloat(item.TotalGrossAmount)) ? (0) : parseFloat(item.TotalGrossAmount);
                item.TotalDiscountAmount = isNaN(parseFloat(item.TotalDiscountAmount)) ? (0) : parseFloat(item.TotalDiscountAmount);
                item.TotalGstAmount = isNaN(parseFloat(item.TotalGstAmount)) ? (0) : parseFloat(item.TotalGstAmount);
                item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {
            var FromReq = $filter('date')($scope.advancedfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var FromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.PrnNumber
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.PrnTypeId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.PrnStatusId
                },
                {
                    Key: 7,
                    Value: $scope.advancedfilter.FacilityId
                },
                {
                    Key: 12,
                    Value: $scope.advancedfilter.GrnNumber
                },
                {
                    Key: 13,
                    Value: $scope.advancedfilter.ReturnedBy
                },
                {
                    Key: 12,
                    Value: $scope.advancedfilter.GrnNumber
                },
                {
                    Key: 15,
                    Value: $scope.advancedfilter.InvoiceNumber
                },
                {
                    Key: 16,
                    Value: $scope.advancedfilter.ApprovedBy
                },
                {
                    Key: 9,
                    Value: FromDate
                },
                {
                    Key: 10,
                    Value: ToDate
                },
                {
                    Key: 9,
                    Value: FromReq
                },
                {
                    Key: 10,
                    Value: ToReq
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };


            var options = {
                action: 'pharmacy/PurchaseReturn/GetPurchaseReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.purchasereturn', {
                id: 0,
                poid: $scope.currentcontext.poid
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/PurchaseReturn/DeletePurchaseReturn',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.purchasereturn', {
                    id: entity.Id,
                    prnid: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.PrnNumber);
            } else if (actionType == 'view') {
                $state.go('app.purchasereturn', {
                    id: entity.Id,
                    prnid: entity.Id
                });
            }else if (actionType == 'amend') {
                $state.go('app.purchasereturnamend', {
                    id: entity.Id,
                    prnid: entity.Id
                });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('inventory.purchasereturns.sno.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "PrnNumber",
                displayName: $translate.instant('inventory.purchasereturns.returnno.lbl')
            },
            {
                field: "PrnDate",
                displayName: $translate.instant('inventory.purchasereturns.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PrnDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "VendorMaster.VendorName",
                displayName: $translate.instant('inventory.purchasereturns.vendorname.lbl')
            },
            {
                field: "Grn.GrnNumber",
                displayName: $translate.instant('inventory.purchasereturns.invoice.lbl')
            },

            // { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.purchasereturns.returnstore.lbl') },
            // { field: "PrnType.Description", displayName: $translate.instant('inventory.purchasereturns.type.lbl') },
            //{ field: "ReturnReason.Description", displayName: $translate.instant('inventory.purchasereturns.reason.lbl') },

            {
                field: "TotalGrossAmount",
                displayName: $translate.instant('inventory.purchasereturns.grossamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGrossAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalDiscountAmount",
                displayName: $translate.instant('inventory.purchasereturns.discountamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalDiscountAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalDiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalGstAmount",
                displayName: $translate.instant('inventory.purchasereturns.gstamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGstAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('inventory.purchasereturns.netamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },

            {
                field: "PrnStatus.Description",
                displayName: $translate.instant('inventory.purchasereturns.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.PrnStatusId==2||entity.PrnStatusId==3||entity.PrnStatusId==4||entity.PrnStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                    <span class="grid-action" ng-click="handleEvents(\'amend\',entity)" ng-show="entity.PrnStatusId==2">Amend</span>\
                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.PrnStatusId==1"><i class="fas fa-calendar-plus"></i></span>\
                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.PrnStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
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
            }
        };

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
                field: 'MobileNumber',
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
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }

            $scope.getList();

            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [],
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

        function initDynamicForm() {
            $scope.advancedfilterDefault = {
                //From: utl.Formatter.getCurrentDate(),
                //To: utl.Formatter.getCurrentDate(),
                FromFacility: utl.Session.getCurrentUserId(),
                ApprovedBy: utl.Session.getCurrentUserId()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'date',
                    translate: 'inventory.purchasereturns.fromdate.lbl',
                    model: 'FromDate',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'inventory.purchasereturns.todate.lbl',
                    model: 'ToDate',
                    position: {
                        r: 0,
                        c: 1
                    }
                },
                {
                    type: 'text',
                    translate: 'inventory.purchasereturns.grnno.lbl',
                    model: 'GrnNumber',
                    position: {
                        r: 1,
                        c: 0
                    }
                },
                {
                    type: 'text',
                    translate: 'inventory.purchasereturns.invno.lbl',
                    model: 'InvoiceNumber',
                    options: $scope.lookup.ToStore,
                    position: {
                        r: 1,
                        c: 1
                    }
                },
                //{ type: 'select', translate: 'inventory.purchasereturns.itemname.lbl', model: 'ItemMasterId', options: $scope.lookup.ItemMaster, position: { r: 2, c: 0 } },
                //{ type: 'select', translate: 'inventory.purchasereturns.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 2, c: 1 } },
                {
                    type: 'select',
                    translate: 'inventory.purchasereturns.returnedby.lbl',
                    model: 'ReturnedBy   ',
                    options: $scope.lookup.ReturnedUser,
                    position: {
                        r: 3,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.purchasereturns.approvedby.lbl',
                    model: 'ApprovedBy',
                    options: $scope.lookup.ApprovedUser,
                    position: {
                        r: 3,
                        c: 1
                    }
                }
                ],
                actions: [{
                    type: 'apply',
                    translate: 'common.applyaction.lbl',
                    cls: 'btn-success'
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

        function setDefaults() {
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.PrnStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PrnStatus, 'Authorized');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.PrnStatus, 'Completed');
            $scope.currentfilter.PrnStatusId = ApprovedId + "," + AuthorizedId + "," + CompletedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });

            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ApprovedUser"
            },
            {
                "Key": "ReturnedUser"
            },
            {
                "Key": "ItemMasterId"
            },
            {
                "Key": "Facility"
            },
            {
                "Key": "PrnStatus",
                Default: false
            },
            {
                "Key": "PrnType"
            },
            {
                "Key": "UserStores",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                },
                Default: false
            }
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

    purchasereturnsListController.$inject = ['$rootScope', '$scope', '$stateParams', '$filter', '$state', '$translate', 'utl', '$timeout'];

})();