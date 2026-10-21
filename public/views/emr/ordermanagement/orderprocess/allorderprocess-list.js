(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('allOrderProcessListController', allOrderProcessListController);

    function allOrderProcessListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        var defaultFrom = new Date();
        defaultFrom.setDate(defaultFrom.getDate() - 7);

        $scope.Items = [];
        $scope.currentfilter = {
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            Ordereddate: utl.Formatter.getCurrentDate(),
            EncounterTypeId: -1,
            SubDepartmentId: -1,
            PatientNameMRN: '',
            PatWoNum: '',
            OrderBillNo: '',
            SampleIdentifier: '',
            FromDate: defaultFrom,
            ToDate: utl.Formatter.getCurrentDate(),
            WorkOrderStatusId: null
        };
        $scope.context = $stateParams.context;
        $scope.lookup = {
            WorkOrderStatus: [],
            EncounterType: [],
            Department: [],
            Doctor: []
        };
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        };
        $scope.currentcontext = {};
        if ($scope.currentfilter.TestTypeId == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentfilter.TestTypeId == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentfilter.TestTypeId == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }

        $scope.showsubdept = 0;
        $scope.showsubdept =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'showsubdept');

        // Grid Config
        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                style: {
                    field: 'ColorStatus',
                    value: {
                        6: {
                            'background': 'red',
                            'color': '#fff'
                        },
                        10: {
                            'background': '#ff902b94',
                            'color': '#fff'
                        },
                        11: {
                            'background': '#ed143dad',
                            'color': '#fff'
                        }
                    }
                }
            },
            data: [],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        // React Bridge Props
        $scope.refreshReactProps = function () {
            var dataList = vm.gridConfig.data || [];
            var pager = vm.gridConfig.pagerObj || { totalItems: 0, currentPage: 1, pageSize: 25 };

            $scope.reactProps = {
                rows: dataList,
                items: dataList,
                totalItems: pager.totalItems || dataList.length,
                currentPage: pager.currentPage || 1,
                pageSize: pager.pageSize || 25,
                pagerObj: {
                    totalItems: pager.totalItems || dataList.length,
                    currentPage: pager.currentPage || 1,
                    pageSize: pager.pageSize || 25,
                    startIndex: ((pager.currentPage || 1) - 1) * (pager.pageSize || 25)
                },
                currentfilter: angular.copy($scope.currentfilter),
                lookup: angular.copy($scope.lookup || {}),
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL',
                facilityId: utl.Session.getCurrentFacilityId ? utl.Session.getCurrentFacilityId() : 1,
                showsubdept: $scope.showsubdept,
                context: $scope.context
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
                    if (item.IsCriticalOrder) {
                        item.ColorStatus = 11;
                    }
                    vm.gridConfig.data.push(item);
                }
            }
            if (res && res.PageContext) {
                vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            }
            $scope.disabledept();
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            if (!$scope.currentfilter.FromDate || !$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg($translate.instant('Please select any Date'));
                return;
            } else {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var woStatus = $scope.currentfilter.WorkOrderStatusId;

                if ($scope.currentfilter.OrderBillNo || $scope.currentfilter.PatWoNum || $scope.currentfilter.PatientNameMRN || $scope.currentfilter.SampleIdentifier) {
                    From = null;
                    To = null;
                    woStatus = null;
                }

                var inputData = {
                    Params: [{
                            Key: 3,
                            Value: woStatus
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
                            Key: 6,
                            Value: $scope.currentfilter.TestTypeId
                        },
                        {
                            Key: 38,
                            Value: From
                        },
                        {
                            Key: 39,
                            Value: To
                        },
                        {
                            Key: 40,
                            Value: ['1', '6', '8', '9', '10', '11', '16', '17'] //Cancel and Rejected status should not load
                        },
                        {
                            Key: 29,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        {
                            Key: 30,
                            Value: $scope.currentfilter.VisitIdentifier || null
                        },
                        {
                            Key: 13,
                            Value: ($scope.currentfilter.DoctorId > 0) ? $scope.currentfilter.DoctorId : null
                        },
                        {
                            Key: 16,
                            Value: ($scope.currentfilter.EncounterTypeId > 0) ? $scope.currentfilter.EncounterTypeId : null
                        },
                        {
                            Key: 8,
                            Value: $scope.currentfilter.PatientNameMRN || null
                        },
                        {
                            Key: 23,
                            Value: ($scope.currentfilter.SubDepartmentId > 0) ? $scope.currentfilter.SubDepartmentId : null
                        },
                        {
                            Key: 35,
                            Value: $scope.currentfilter.SampleIdentifier || null
                        },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorders',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
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

        function setDefaults() {
            var createdStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Created');
            var rejectedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Rejected');
            if (!$scope.currentfilter.WorkOrderStatusId && createdStatusId) {
                $scope.currentfilter.WorkOrderStatusId = createdStatusId + (rejectedStautsId ? ',' + rejectedStautsId : '');
            }
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.AssignOrderByIdCallback = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.resultentry', {
                id: $scope.currentcontext.WorkOrderId
            });
        };

        $scope.assignOrder = function (workorderId) {
            $scope.currentcontext.WorkOrderId = workorderId;

            var options = {
                action: 'lis/patientworkorder/AssignOrderById',
                data: {
                    Id: workorderId
                },
                type: 'post',
                onComplete: $scope.AssignOrderByIdCallback
            };
            utl.Http.doAction(options);
        };

        $scope.attendOrder = function (entity) {
            var targetId = entity ? entity.Id : null;
            if (!targetId) return;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.assignOrder,
                itemId: targetId
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.backtoList = function () {
            if ($scope.currentfilter.TestTypeId == 2) {
                $state.go('app.risdashboard');
            } else {
                $state.go('app.labdashboard');
            }
        };

        $scope.canShowAction = function (actionType, entity) {
            if (!entity) return true;
            if (actionType == 'edit') {
                if (entity.UserId == utl.Session.getCurrentUserId()) {
                    return true;
                }
                return false;
            }
            if (actionType == 'attend') {
                if (entity.UserId == utl.Session.getCurrentUserId()) {
                    return false;
                }
                return true;
            }
            return true;
        };

        $scope.handleEvents = function (actionType, entity) {
            if (!entity) return;

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.resultentry', {
                    id: entity.Id,
                    status: entity.WorkOrderStatusId,
                    testtypeid: entity.TestTypeId,
                    filter_from: $scope.currentfilter.FromDate,
                    filter_to: $scope.currentfilter.ToDate,
                    filter_patientname: $scope.currentfilter.PatWoNum,
                    filter_wostatus: $scope.currentfilter.WorkOrderStatusId,
                    filter_subdept: $scope.currentfilter.SubDepartmentId,
                    filter_encType: $scope.currentfilter.EncounterTypeId,
                    context: $scope.context
                });
            } else if (actionType == 'patientinfo') {
                var patId = entity.PatientId || (entity.Patient ? entity.Patient.Id : null);
                if (patId) {
                    $scope.patientprofiledetails(patId);
                }
            } else if (actionType == 'attend') {
                $scope.attendOrder(entity);
            } else if (actionType == 'amend') {
                $state.go('app.resultamendform', {
                    id: entity.Id,
                    pt: 'myapproval'
                });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.tatdetails', {
                    params: {
                        pid: entity.PatientId || (entity.Patient ? entity.Patient.Id : null),
                        oid: (entity.PatientOrder ? entity.PatientOrder.Id : null) || entity.Orderid,
                        odid: entity.PatientOrderDetailId || null,
                        testtypeid: entity.TestTypeId,
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'orderhistory') {
                utl.Modal.open('app.resultentryorderhistory', {
                    params: {
                        pid: entity.PatientId || (entity.Patient ? entity.Patient.Id : null),
                        oid: entity.Id,
                        testtypeid: entity.TestTypeId,
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'worksheet') {
                $scope.printWorkSheet(entity.PatientId, entity.Id);
            }
        };

        $scope.printWorkSheet = function (PatientId, WorkOrderId) {
            var inputData = {
                Id: WorkOrderId
            };
            var options = {
                action: 'lis/patientworkorder/printWorkSheet',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        // Handle Actions from React Component
        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'edit':
                case 'view':
                    if (payload) {
                        $scope.handleEvents('edit', payload);
                    }
                    break;

                case 'patientinfo':
                    if (payload) {
                        var patId = payload.PatientId || (payload.Patient ? payload.Patient.Id : null);
                        if (patId) {
                            $scope.patientprofiledetails(patId);
                        }
                    }
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

                case 'worksheet':
                    if (payload) {
                        $scope.handleEvents('worksheet', payload);
                    }
                    break;

                case 'attend':
                    if (payload) {
                        $scope.attendOrder(payload);
                    }
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
                        if (payload.SampleIdentifier !== undefined) $scope.currentfilter.SampleIdentifier = payload.SampleIdentifier;
                        if (payload.PatWoNum !== undefined) $scope.currentfilter.PatWoNum = payload.PatWoNum;
                        if (payload.PatientNameMRN !== undefined) $scope.currentfilter.PatientNameMRN = payload.PatientNameMRN;
                        if (payload.OrderBillNo !== undefined) $scope.currentfilter.OrderBillNo = payload.OrderBillNo;
                        if (payload.FromDate !== undefined) $scope.currentfilter.FromDate = payload.FromDate;
                        if (payload.ToDate !== undefined) $scope.currentfilter.ToDate = payload.ToDate;
                        if (payload.WorkOrderStatusId !== undefined) $scope.currentfilter.WorkOrderStatusId = payload.WorkOrderStatusId;
                        if (payload.EncounterTypeId !== undefined) $scope.currentfilter.EncounterTypeId = payload.EncounterTypeId;
                        if (payload.SubDepartmentId !== undefined) $scope.currentfilter.SubDepartmentId = payload.SubDepartmentId;
                        if (payload.DoctorId !== undefined) $scope.currentfilter.DoctorId = payload.DoctorId;
                    }
                    vm.gridConfig.pagerObj.currentPage = 1;
                    $scope.getList();
                    break;

                case 'resetFilters':
                    var resetFrom = new Date();
                    resetFrom.setDate(resetFrom.getDate() - 7);
                    $scope.currentfilter.SampleIdentifier = '';
                    $scope.currentfilter.PatWoNum = '';
                    $scope.currentfilter.PatientNameMRN = '';
                    $scope.currentfilter.OrderBillNo = '';
                    $scope.currentfilter.FromDate = resetFrom;
                    $scope.currentfilter.ToDate = utl.Formatter.getCurrentDate();
                    $scope.currentfilter.WorkOrderStatusId = null;
                    $scope.currentfilter.EncounterTypeId = -1;
                    $scope.currentfilter.SubDepartmentId = -1;
                    $scope.currentfilter.DoctorId = null;
                    vm.gridConfig.pagerObj.currentPage = 1;
                    $scope.getList();
                    break;

                default:
                    console.log('Unhandled react action in allorderprocess-list:', actionName, payload);
            }
        };

        // Table column definitions (maintained for fallback / backward compatibility)
        var sno = {
            field: "S.No",
            displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
        };
        var wonum = {
            field: "WorkOrderdid",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workordernumber.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><div style='color: #4407ff; white-space: nowrap;'><span>{{entity.WorkOrderdid || entity.WorkOrderId}}</span></div></div>"
        };
        var ordnum = {
            field: "OrderNumber",
            displayName: $translate.instant('Order No/Bill No'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.PatientOrder.BillNumber}}&nbsp;</span>" + "</div>"
        };
        var Sampleid = {
            field: "SampleIdentifier",
            displayName: $translate.instant('SampleId'),
            cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.SampleIdentifier}} </div>'
        };
        var encType = {
            field: "Encounter.EncounterType.Description",
            displayName: $translate.instant('Patient Type')
        };
        var subDept = {
            field: "SubDepartment.DepartmentName",
            displayName: $translate.instant('Sub Department')
        };
        var wardDet = {
            field: "entity.Encounter.WardRoomMaster",
            displayName: $translate.instant('admissions.roomdetails.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span  ng-if='entity.Encounter.WardRoomMaster'>{{entity.Encounter.WardMaster.WardName }}</span>" +
                "<span  ng-if='entity.Encounter.WardRoomMaster'>/</span>" +
                "<span  ng-if='entity.Encounter.WardRoomMaster'>{{entity.Encounter.WardRoomMaster.RoomNo }}</span>" +
                "<span  ng-if='entity.Encounter.WardRoomMaster'>/</span>" +
                "<span  ng-if='entity.Encounter.WardRoomBedMaster'>{{entity.Encounter.WardRoomBedMaster.BedNo}}</span>" +
                "</div>"
        };
        var orderDate = {
            field: "CreatedAt",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderdate.lbl'),
            cellTemplate: "<ngformatdate datetime-val='entity.CreatedAt'></ngformatdate>"
        };
        var OrderPriority = {
            field: "Patient.MRN",
            displayName: $translate.instant('MRN')
        };
        var PatInfo = {
            field: "PatientMRN",
            displayName: $translate.instant('ordermanagement.orderassignment-list.patientinfo.lbl'),
            width: '40%',
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                "<span ng-if='entity.Patient.Title.Description'><b>{{entity.Patient.Title.Description}}&nbsp;</b></span>" +
                "<span ng-if='entity.Patient.FirstName'><b>{{entity.Patient.FirstName}}&nbsp;</b></span>" +
                "<span ng-if='entity.Patient.LastName'><b>{{entity.Patient.LastName}}</b></span>" +
                "<span ng-if='entity.Patient.Age || entity.Patient.Gender.Description'> / {{entity.Patient.Age}}<span ng-if='entity.Patient.Age && entity.Patient.Gender.Description'> / </span>{{entity.Patient.Gender.Description}}</span>" +
                "</a></div>",
            handleEvent: $scope.handleEvents
        };
        var OrderBy = {
            field: "Orderedby",
            displayName: $translate.instant('Ordered by'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Orderedby.Title.Description}}&nbsp;</span>" + "<span >{{entity.Orderedby.FirstName}}&nbsp;</span>" + "<span >{{entity.Orderedby.LastName}}</span>" + "</div>"
        };
        var WorderStatus = {
            field: "WorkOrderStatus.DisplayName",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderstatus.lbl')
        };
        var actions = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true" uib-tooltip="View"></span>\
                      <span class="grid-action" ng-click="handleEvents(\'ordertat\',entity)" ><i class="fas fa-book" uib-tooltip="Order TAT"></i></span>\
                      <span class="grid-action" ng-click="handleEvents(\'orderhistory\',entity)" ><i class="fas fa-notes-medical" uib-tooltip="Order History"></i></span>\
                 </div>',
            handleEvent: $scope.handleEvents,
        };

        var colDefs = [sno, wonum, ordnum, Sampleid, encType, orderDate, OrderPriority, PatInfo, OrderBy, wardDet, WorderStatus, actions];
        if ($scope.showsubdept == 1) {
            colDefs.splice(9, 0, subDept);
        }
        vm.gridConfig.columnDefs = colDefs;

        $scope.lookupCallback = function (scope, data, options, hasError) {
            if (data) {
                angular.forEach(data, function (value, key) {
                    $scope.lookup[key] = value;
                    if (key == 'Department') {
                        for (var dx in $scope.lookup.Department) {
                            var subdpt = $scope.lookup.Department[dx];
                            if ($scope.currentfilter.SubDepartmentId == subdpt.Id) {
                                $scope.currentfilter.SubDepartmentId = subdpt.Id;
                            } else {
                                $scope.currentfilter.SubDepartmentId = -1;
                            }
                        }
                    }
                });
            }
            setDefaults();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.FromDate = $stateParams.filter_from;
                $scope.currentfilter.ToDate = $stateParams.filter_to;
                $scope.currentfilter.PatWoNum = $stateParams.filter_patientname;
                $scope.currentfilter.WorkOrderStatusId = $stateParams.filter_wostatus;
                $scope.currentfilter.SubDepartmentId = $stateParams.filter_subdept;
                $scope.currentfilter.EncounterTypeId = $stateParams.filter_encType;
                $scope.getList();
            } else {
                $scope.getList();
            }
            $scope.refreshReactProps();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "WorkOrderStatus",
                    Default: false
                },
                {
                    "Key": "Doctor"
                },
                {
                    "Key": "EncounterType"
                },
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: $scope.currentcontext.deptcode
                        }]
                    }
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
    allOrderProcessListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();