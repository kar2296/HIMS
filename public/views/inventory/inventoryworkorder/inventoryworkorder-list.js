(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('WorkOrdersListController', WorkOrdersListController);

    function WorkOrdersListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.item = {}
        var currentdate =  utl.Formatter.getCurrentDate();
        var startdate = new Date(currentdate.setDate(currentdate.getDate() - 30));
        $scope.currentfilter = {
            InvWorkorderStatusId: 3,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            InvWorkorderDate: utl.Formatter.getCurrentDate(),
            FromDate:startdate,
            ToDate: utl.Formatter.getCurrentDate(),
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        // $scope.getdefaultList = function (pageNo) {
        //     $scope.currentfilter.InvWorkorderNumber = '';
        //     $scope.currentfilter.InvWorkorderDate = '';
        //     $scope.currentfilter.InvWorkorderTypeId = -1;
        //     $scope.currentfilter.DepartmentId = -1;
        //     $scope.currentfilter.InvWorkorderStatusId = -1;

        //     var From = $filter('date')($scope.currentfilter.InvWorkorderDate, 'yyyy-MM-dd 00:00:00') || null;
        //     var To = $filter('date')($scope.currentfilter.InvWorkorderDate, 'yyyy-MM-dd 23:59:59') || null;
        //     var inputData = {
        //         Params: [{
        //                 Key: 1,
        //                 Value: $scope.currentfilter.DepartmentId
        //             },
        //             // { Key: 2, Value: [From, To] },
        //             {
        //                 Key: 8,
        //                 Value: $scope.currentfilter.VendorMasterId
        //             },
        //             {
        //                 Key: 7,
        //                 Value: $scope.currentfilter.InvWorkorderNumber
        //             },
        //             {
        //                 Key: 6,
        //                 Value: $scope.currentfilter.InvWorkorderStatusId
        //             },
        //             {
        //                 Key: 3,
        //                 Value: From
        //             },
        //             {
        //                 Key: 4,
        //                 Value: To
        //             },
        //         ],
        //         PageContext: {
        //             PageSize: vm.gridConfig.pagerObj.pageSize,
        //             PageNumber: vm.gridConfig.pagerObj.currentPage
        //         }
        //     };

        //     var options = {
        //         action: 'pharmacy/InvWorkorder/GetInvWorkorders',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getListCallback
        //     };

        //     utl.Http.doAction(options);
        // };
        $scope.getList = function (pageNo) {
            if ($scope.currentfilter.InvWorkorderNumber) {
                $scope.currentfilter.InvWorkorderDate = '';
                $scope.currentfilter.InvWorkorderTypeId = -1;
                $scope.currentfilter.DepartmentId = -1;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    // { Key: 2, Value: [From, To] },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.InvWorkorderTypeId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.InvWorkorderNumber
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.InvWorkorderStatusId
                    },
                    {
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/InvWorkorder/GetInvWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Vendor Code',
                    field: 'VendorCode',
                    datatype: 'string',
                    headercls: 'td-vendorcode',
                    fieldcls: 'td-vendorcode'
                },
                {
                    header: 'Vendor Name',
                    field: 'VendorName',
                    datatype: 'string',
                    headercls: 'td-vendorname',
                    fieldcls: 'td-vendorname'
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
                $scope.item.VendorId = selectedItem.VendorMasterId;
                $scope.item.VendorCode = selectedItem.VendorCode;
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.MobileNumber = selectedItem.MobileNumber;
                $scope.item.EmailAddress = selectedItem.EmailAddress;
                $scope.item.PaymentTermsId = selectedItem.PaymentTermsId;
                $scope.item.PANNo = selectedItem.PANNo;
                $scope.item.GSTNo = selectedItem.GSTNo;
                $scope.item.TANNo = selectedItem.TANNo;
                $scope.item.AddressLine1 = selectedItem.AddressLine1;
                $scope.item.AddressLine2 = selectedItem.AddressLine2;
                $scope.item.AddressLine3 = selectedItem.AddressLine3;
                result = [selectedItem.VendorName + '(' + selectedItem.VendorCode + ')'].join('    ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [{
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
                    Value: $scope.item.VendorId
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
            }
        }

        //Grid Actions
        $scope.onEnter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ProcedureId = -1;
                $scope.getList();
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/InvWorkorder/DeleteInvWorkorder',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            $state.go('app.invworkorderform', {
                id: 0
            });
        };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.invworkorderform', {
                    id: entity.Id,
                    FacilityName: entity.FacilityCode + ' - ' + entity.FacilityName
                });
            } else if (actionType == 'view') {
                $state.go('app.invworkorderform', {
                    id: entity.Id,
                    FacilityName: entity.FacilityCode + ' - ' + entity.FacilityName
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.FacilityName);
            } else if (actionType == 'amend') {
                $state.go('app.invworkorderform-amendment', {
                    id: entity.Id
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.inventoryworkorder.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "InvWorkorderDate",
                    displayName: $translate.instant('inventory.inventoryworkorder.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.InvWorkorderDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.InvWorkorderDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "InvWorkorderNo",
                    displayName: $translate.instant('inventory.inventoryworkorder.workorderno.lbl')
                },
                {
                    field: "VendorMaster.VendorName",
                    displayName: $translate.instant('inventory.inventoryworkorder.vendor.lbl')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('inventory.inventoryworkorder.department.lbl')
                },
                // { field: "NetAmount", displayName: $translate.instant('inventory.inventoryworkorder.amount.lbl') },
                {
                    field: "TotalAmount",
                    displayName: $translate.instant('inventory.inventoryworkorder.amount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "InvWorkorderStatus.Description",
                    displayName: $translate.instant('inventory.inventoryworkorder.status.lbl')
                },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)"  uib-tooltip="View"  tooltip-placement="bottom"   ng-show="entity.InvWorkorderStatusId==2||entity.InvWorkorderStatusId==3||entity.InvWorkorderStatusId==4||entity.InvWorkorderStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" uib-tooltip="Edit"  tooltip-placement="bottom"   ng-show="entity.InvWorkorderStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                            <span class="grid-action" uib-tooltip="Amend" tooltip-placement="bottom" ng-click="handleEvents(\'amend\',entity)" ng-show="entity.InvWorkorderStatusId==3"><i class="fas fa-calendar-plus"></i></button></span>\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" uib-tooltip="Delete"  tooltip-placement="bottom"  ng-show="entity.InvWorkorderStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "VendorMaster"
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "InvWorkorderStatus"
                },
                {
                    "Key": "InvWorkorderType"
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

    WorkOrdersListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();