(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dispatchResultListController', dispatchResultListController);

    function dispatchResultListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        var defaultFrom = new Date();
        defaultFrom.setDate(defaultFrom.getDate() - 7);

        $scope.Items = [];
        $scope.item = {};
        $scope.item.WithoutHeader = true;

        $scope.currentfilter = {
            uid: utl.Session.getCurrentUserId(),
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : 1,
            EncounterTypeId: -1,
            WorkOrderdid: '',
            name: '',
            FromDate: defaultFrom,
            ToDate: utl.Formatter.getCurrentDate(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || -1,
            WorkOrderStatusId: 7
        };

        $scope.lookup = {
            WorkOrderStatus: [],
            EncounterType: [],
            Doctor: [],
            Department: [],
            Ward: []
        };

        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        };

        $scope.currentcontext = {};

        // React Bridge Props Sync
        $scope.refreshReactProps = function () {
            var dataList = vm.gridConfig.data || [];
            var pager = vm.gridConfig.pagerObj || { totalItems: 0, currentPage: 1, pageSize: 25 };

            $scope.reactProps = {
                rows: dataList,
                items: dataList,
                totalItems: (pager.totalItems !== undefined && pager.totalItems !== null) ? pager.totalItems : dataList.length,
                currentPage: pager.currentPage || 1,
                pageSize: pager.pageSize || 25,
                pagerObj: {
                    totalItems: (pager.totalItems !== undefined && pager.totalItems !== null) ? pager.totalItems : dataList.length,
                    currentPage: pager.currentPage || 1,
                    pageSize: pager.pageSize || 25,
                    startIndex: ((pager.currentPage || 1) - 1) * (pager.pageSize || 25)
                },
                currentfilter: angular.copy($scope.currentfilter),
                lookup: angular.copy($scope.lookup || {}),
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL',
                facilityId: utl.Session.getCurrentFacilityId ? utl.Session.getCurrentFacilityId() : 1,
                withoutHeader: $scope.item.WithoutHeader,
                tp: $stateParams.tp ? parseInt($stateParams.tp) : 1
            };
            $scope.$applyAsync();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    item.ColorStatus = item.WorkOrderStatusId;
                    if (item.IsPrinted) {
                        item.ColorStatus = 10;
                    }
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = (res && res.PageContext && res.PageContext.TotalRecords !== undefined) ? res.PageContext.TotalRecords : vm.gridConfig.data.length;
            $scope.disabledept();
            $scope.refreshReactProps();
        };

        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };

        $scope.getList = function () {
            var From = null;
            var To = null;

            if ($scope.currentfilter.FromDate) {
                From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            }
            if ($scope.currentfilter.ToDate) {
                To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            }

            var statusVal = $scope.currentfilter.WorkOrderStatusId;
            if (statusVal === '' || statusVal === undefined) {
                statusVal = null;
            } else if (statusVal !== null) {
                statusVal = parseInt(statusVal);
            }

            if ($scope.currentfilter.OrderBillNo || $scope.currentfilter.PatWoNum || $scope.currentfilter.PatientMRN || $scope.currentfilter.WorkOrderdid) {
                From = null;
                To = null;
                statusVal = null;
            }

            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: statusVal
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.TestTypeId
                    },
                    {
                        Key: 28,
                        Value: $scope.currentfilter.OrderBillNo || null
                    },
                    {
                        Key: 32,
                        Value: $scope.currentfilter.PatWoNum || null
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.WorkOrderdid || null
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.PatientMRN || null
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.DoctorId && $scope.currentfilter.DoctorId > 0 ? $scope.currentfilter.DoctorId : null
                    },
                    {
                        Key: 16,
                        Value: $scope.currentfilter.EncounterTypeId && $scope.currentfilter.EncounterTypeId > 0 ? $scope.currentfilter.EncounterTypeId : null
                    },
                    {
                        Key: 11,
                        Value: From
                    },
                    {
                        Key: 12,
                        Value: To
                    },
                    {
                        Key: 23,
                        Value: $scope.currentfilter.SubDepartmentId && $scope.currentfilter.SubDepartmentId > 0 ? $scope.currentfilter.SubDepartmentId : null
                    },
                    {
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize || 25,
                    PageNumber: vm.gridConfig.pagerObj.currentPage || 1
                }
            };

            var options = {
                action: 'lis/patientworkorder/GetPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        function setDefaults() {
            var approved = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Approved');
            if (approved && approved !== -1 && ($scope.currentfilter.WorkOrderStatusId === null || $scope.currentfilter.WorkOrderStatusId === undefined)) {
                $scope.currentfilter.WorkOrderStatusId = approved;
            }
        }

        // Grid Actions
        $scope.addNew = function () {
            $state.go('', {});
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: '',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'release') {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'ordermanagement.resultdispatch-list.cnfreleasemsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: releaseDispatch,
                    itemId: entity
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else if (actionType == 'patientinfo') {
                var pId = entity.PatientId || (entity.Patient ? entity.Patient.Id : null);
                if (pId) {
                    utl.Modal.open('registration.patientprofile', {
                        params: {
                            pid: pId
                        }
                    });
                }
            } else if (actionType == 'print') {
                if (entity.TestTypeId == 1 && !entity.IsCulture) {
                    printBIO(entity);
                } else if (entity.TestTypeId == 1 && entity.IsCulture) {
                    printHIS(entity);
                } else if (entity.TestTypeId == 2) {
                    printRIS(entity);
                } else {
                    printBIO(entity);
                }
            } else if (actionType == 'prints') {
                printPath(entity);
            } else if (actionType == 'print1') {
                printHIS(entity);
            } else if (actionType == 'print2') {
                printMIC(entity);
            } else if (actionType == 'print3') {
                printRIS(entity);
            } else if (actionType == 'print4') {
                printEndo(entity);
            } else if (actionType == 'print5') {
                printERCP(entity);
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.tatdetails', {
                    params: {
                        pid: entity.PatientId || (entity.Patient ? entity.Patient.Id : null),
                        oid: entity.PatientOrder ? entity.PatientOrder.Id : entity.Orderid,
                        odid: entity.PatientOrderDetailId || entity.Id,
                        testtypeid: entity.TestTypeId || 1,
                    },
                    confirmCallback: $scope.onDetailSave
                });
            } else if (actionType == 'orderhistory') {
                utl.Modal.open('app.resultentryorderhistory', {
                    params: {
                        pid: entity.PatientId || (entity.Patient ? entity.Patient.Id : null),
                        oid: entity.Id,
                        testtypeid: entity.TestTypeId || 1,
                    },
                    confirmCallback: $scope.onDetailSave
                });
            }
        };

        $scope.canDisableReleaseAction = function (entity) {
            var result = entity.ReleasedDate ? true : false;
            return result;
        };

        // Handle React Component Events
        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'release':
                    if (payload) {
                        releaseDispatch(payload);
                    }
                    break;

                case 'print':
                    if (payload) {
                        $scope.handleEvents('print', payload);
                    }
                    break;

                case 'printBIO':
                    if (payload) printBIO(payload);
                    break;

                case 'printPath':
                    if (payload) printPath(payload);
                    break;

                case 'printHIS':
                    if (payload) printHIS(payload);
                    break;

                case 'printMIC':
                    if (payload) printMIC(payload);
                    break;

                case 'printRIS':
                    if (payload) printRIS(payload);
                    break;

                case 'ordertat':
                    if (payload) {
                        $scope.handleEvents('ordertat', payload);
                    }
                    break;

                case 'orderhistory':
                    if (payload) {
                        $scope.handleEvents('orderhistory', payload);
                    }
                    break;

                case 'patientinfo':
                    if (payload) {
                        $scope.handleEvents('patientinfo', payload);
                    }
                    break;

                case 'toggleWithoutHeader':
                    $scope.item.WithoutHeader = !!payload;
                    $scope.refreshReactProps();
                    break;

                case 'dashboard':
                    $scope.backtoList();
                    break;

                case 'refresh':
                    $scope.getList();
                    break;

                case 'pageChange':
                    if (payload) {
                        if (payload.page !== undefined) {
                            vm.gridConfig.pagerObj.currentPage = payload.page;
                        }
                        if (payload.pageSize !== undefined) {
                            vm.gridConfig.pagerObj.pageSize = payload.pageSize;
                        }
                    }
                    $scope.getList();
                    break;

                case 'search':
                    if (payload) {
                        if (payload.PatWoNum !== undefined) $scope.currentfilter.PatWoNum = payload.PatWoNum;
                        if (payload.OrderBillNo !== undefined) $scope.currentfilter.OrderBillNo = payload.OrderBillNo;
                        if (payload.WorkOrderdid !== undefined) $scope.currentfilter.WorkOrderdid = payload.WorkOrderdid;
                        if (payload.PatientMRN !== undefined) $scope.currentfilter.PatientMRN = payload.PatientMRN;
                        if (payload.FromDate !== undefined) $scope.currentfilter.FromDate = payload.FromDate;
                        if (payload.ToDate !== undefined) $scope.currentfilter.ToDate = payload.ToDate;
                        if (payload.WorkOrderStatusId !== undefined) $scope.currentfilter.WorkOrderStatusId = payload.WorkOrderStatusId;
                        if (payload.SubDepartmentId !== undefined) $scope.currentfilter.SubDepartmentId = payload.SubDepartmentId;
                        if (payload.EncounterTypeId !== undefined) $scope.currentfilter.EncounterTypeId = payload.EncounterTypeId;
                        if (payload.DoctorId !== undefined) $scope.currentfilter.DoctorId = payload.DoctorId;
                    }
                    vm.gridConfig.pagerObj.currentPage = 1;
                    $scope.getList();
                    break;

                default:
                    break;
            }
        };

        vm.gridConfig = {
            background: {
                style: {
                    field: 'ColorStatus',
                    value: {
                        8: {
                            'background': '#e69dcf',
                            'color': '#fff'
                        },
                        10: {
                            'background': '#ff902b94',
                            'color': '#fff'
                        }
                    }
                }
            },
            data: [],
            columnDefs: [
                {
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span>{{index+1}}</span></div>"
                },
                {
                    field: "WorkOrderdid",
                    displayName: $translate.instant('ordermanagement.myresultapproval-list.workordernumber.lbl')
                },
                {
                    field: "OrderNumber",
                    displayName: $translate.instant('Order No/Bill No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span>{{entity.PatientOrder.OrderNumber}}&nbsp;/</span><span>{{entity.PatientOrder.BillNumber}}&nbsp;</span></div>"
                },
                {
                    field: "PatientOrder.OrderRequestDate",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.orderdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PatientOrder.OrderRequestDate'></ngformatdate>"
                },
                {
                    field: "OrderPriority.Description",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.priority.lbl')
                },
                {
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span>{{entity.Patient.MRN}}</span></div>"
                },
                {
                    field: "PatientMRN",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.patientinfo.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;" +
                        "<b>{{entity.Patient.FirstName}}</b>&nbsp;" +
                        "<b>{{entity.Patient.LastName}}</b>" +
                        " / " +
                        "<span>{{entity.Patient.Age}}</span> / <span>{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "WorkOrderStatus.DisplayName",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.workorderstatus.lbl')
                },
                {
                    field: "SubDepartment.DepartmentName",
                    displayName: $translate.instant('Sub Department')
                },
                {
                    field: "ReleasedDate",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.releaseddate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReleasedDate'></ngformatdate>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <a class="grid-action" ng-class="{\'release-disabled\': handleEvents.canDisableReleaseAction(entity)}" ng-click="handleEvents(\'release\',entity)" ng-hide="entity.WorkOrderStatusId==8"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true" uib-tooltip="Release" tooltip-placement="bottom"></a>\
                                    <a class="grid-action" ng-click="handleEvents(\'print\',entity)"><img class="drhms-edit-button" src="assets/svg/print-black.svg" style="width: 16px;" aria-hidden="true" uib-tooltip="print" tooltip-placement="bottom"></a>\
                                    <span class="grid-action" ng-click="handleEvents(\'ordertat\',entity)"><i class="fas fa-book" uib-tooltip="Order TAT"></i></span>\
                                    <span class="grid-action" ng-click="handleEvents(\'orderhistory\',entity)"><i class="fas fa-notes-medical" uib-tooltip="Order History"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

        function releaseDispatchCallback() {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        }

        function releaseDispatch(itemId) {
            var inputData = {
                Id: itemId.Id,
                Data: {
                    itemId: itemId,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'lis/patientworkorder/DispatchResult',
                data: inputData,
                type: 'post',
                onComplete: releaseDispatchCallback
            };

            utl.Http.doAction(options);
        }

        function printBIO(entity) {
            var inputData = {
                Id: entity.Id,
                Data: {
                    isfrom: 'resultdispatch',
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorderWithoutheader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printPath(entity) {
            var inputData = {
                Id: entity.Id,
                Data: {
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'lis/patientworkorder/Printpathaology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printHIS(entity) {
            var inputData = {
                Id: entity.Id,
                Data: {
                    isfrom: 'resultdispatch',
                    withoutHeader: $scope.item.WithoutHeader,
                    ids: 1,
                }
            };
            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorderWithoutheader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printMIC(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printmicrobiology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printRIS(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printradiology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printEndo(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printendoscopy',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printERCP(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printercp',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        // Lookups
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : (data || {});
            setDefaults();
            $scope.getList();
            $scope.refreshReactProps();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "WorkOrderStatus"
                },
                {
                    "Key": "EncounterType"
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Ward"
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

    dispatchResultListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();