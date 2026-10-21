(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('allResultApprovalListController', allResultApprovalListController);

    function allResultApprovalListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        var defaultFrom = new Date();
        defaultFrom.setDate(defaultFrom.getDate() - 7);

        $scope.Items = [];
        $scope.currentfilter = {
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : 1,
            WorkOrderStatusId: null, // Send for approval default or all
            EncounterTypeId: -1,
            WorkOrderDate: utl.Formatter.getCurrentDate(),
            Ordereddate: utl.Formatter.getCurrentDate(),
            WorkOrderdid: '',
            LabAssignTypeId: 1,
            ExternalProviderId: -1,
            FromDate: defaultFrom,
            ToDate: utl.Formatter.getCurrentDate(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || -1,
        };
        $scope.currentcontext = {};
        $scope.lookup = {
            WorkOrderStatus: [],
            EncounterType: [],
            Department: [],
            Doctor: [],
            Ward: [],
            Guarantor: [],
            GuarantorType: [],
            LabAssignType: []
        };
        if ($scope.currentfilter.TestTypeId == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentfilter.TestTypeId == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentfilter.TestTypeId == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        };

        $scope.showsubdept = 0;
        $scope.showsubdept =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'showsubdept');

        // Grid config
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

        function setDefaults() {
            var sendforapproval = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Send For Approval');
            if (sendforapproval == -1) {
                sendforapproval = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'SEND FOR DOCTOR APPROVAL');
            }
            // If explicit status not set in currentfilter, use sendforapproval or keep flexible
            if (!$scope.currentfilter.WorkOrderStatusId && sendforapproval && sendforapproval !== -1) {
                // leave as null to allow overview or set default
            }
        }

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
            var From = null;
            var To = null;

            if ($scope.currentfilter.FromDate) {
                From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            }
            if ($scope.currentfilter.ToDate) {
                To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            }

            var woStatus = $scope.currentfilter.WorkOrderStatusId;

            if ($scope.currentfilter.OrderBillNo || $scope.currentfilter.PatWoNum || $scope.currentfilter.PatientMRN || $scope.currentfilter.WorkOrderdid || $scope.currentfilter.SampleIdentifier) {
                From = null;
                To = null;
            }

            var inputData = {
                Params: [{
                        Key: 3,
                        Value: woStatus ? parseInt(woStatus) : null
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
                        Key: 8,
                        Value: $scope.currentfilter.PatientMRN || null
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.WorkOrderdid || null
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
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
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
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.backtoList = function () {
            if ($scope.currentfilter.TestTypeId == 2) {
                $state.go('app.risdashboard');
            } else {
                $state.go('app.labdashboard');
            }
        };

        $scope.handleEvents = function (actionType, entity) {
            if (!entity) return;

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.resultentry', {
                    id: entity.Id,
                    testtypeid: entity.TestTypeId,
                    filter_from: $scope.currentfilter.FromDate,
                    filter_to: $scope.currentfilter.ToDate,
                    filter_patientname: $scope.currentfilter.PatWoNum,
                    filter_wostatus: $scope.currentfilter.WorkOrderStatusId,
                    filter_subdept: $scope.currentfilter.SubDepartmentId,
                    filter_encType: $scope.currentfilter.EncounterTypeId,
                    context: $scope.context,
                    pt: 'myapproval'
                });
            } else if (actionType == 'patientinfo') {
                var patId = entity.PatientId || (entity.Patient ? entity.Patient.Id : null);
                if (patId) {
                    $scope.patientprofiledetails(patId);
                }
            } else if (actionType == 'amend') {
                $state.go('app.amendresultentry', {
                    id: entity.Id,
                    pt: 'myapproval'
                });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.tatdetails', {
                    params: {
                        pid: entity.PatientId || (entity.Patient ? entity.Patient.Id : null),
                        oid: (entity.PatientOrder ? entity.PatientOrder.Id : null) || entity.Orderid,
                        odid: entity.PatientOrderDetailId || entity.Id,
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
            }
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

                case 'amend':
                    if (payload) {
                        $scope.handleEvents('amend', payload);
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
                        if (payload.PatientMRN !== undefined) $scope.currentfilter.PatientMRN = payload.PatientMRN;
                        if (payload.OrderBillNo !== undefined) $scope.currentfilter.OrderBillNo = payload.OrderBillNo;
                        if (payload.WorkOrderdid !== undefined) $scope.currentfilter.WorkOrderdid = payload.WorkOrderdid;
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

        // Table column definitions (maintained for fallback)
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
            field: "Ordereddate",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderdate.lbl'),
            cellTemplate: "<ngformatdate datetime-val='entity.Ordereddate'></ngformatdate>"
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
                      <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                      <span class="grid-action" ng-click="handleEvents(\'amend\',entity)" uib-tooltip="Amend"></span>\
                      <span class="grid-action" ng-click="handleEvents(\'ordertat\',entity)"><i class="fas fa-book" uib-tooltip="Order TAT"></i></span>\
                      <span class="grid-action" ng-click="handleEvents(\'orderhistory\',entity)"><i class="fas fa-notes-medical" uib-tooltip="Order History"></i></span>\
                      </div>',
            handleEvent: $scope.handleEvents,
        };

        var colDefs = [sno, wonum, ordnum, Sampleid, encType, orderDate, OrderPriority, PatInfo, OrderBy, wardDet, WorderStatus, actions];
        if ($scope.showsubdept == 1) {
            colDefs.splice(9, 0, subDept);
        }
        if ($scope.currentfilter.TestTypeId == 2) {
            colDefs = [sno, wonum, ordnum, encType, orderDate, OrderPriority, PatInfo, OrderBy, WorderStatus, actions];
            if ($scope.showsubdept == 1) {
                colDefs.splice(8, 0, subDept);
            }
        }
        vm.gridConfig.columnDefs = colDefs;

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

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
                },
                {
                    "Key": "Guarantor"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "OrderStatus"
                },
                {
                    "Key": "LabAssignType"
                },
                {
                    "Key": "ExternalProvider"
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
    allResultApprovalListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();