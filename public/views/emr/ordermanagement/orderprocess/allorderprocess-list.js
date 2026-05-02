(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('allOrderProcessListController', allOrderProcessListController);

    function allOrderProcessListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            Ordereddate: utl.Formatter.getCurrentDate(),
            EncounterTypeId: -1,
            SubDepartmentId: -1,
            PatientNameMRN: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            // SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || -1,
            // WorkOrderStatusId: '1,6'
        };
        $scope.context = $stateParams.context;
        $scope.lookup = {};
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        }
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

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
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
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };

        $scope.getList = function () {
            if (!$scope.currentfilter.FromDate || !$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg($translate.instant('Please select any Date'));
                return;
            } else {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                if ($scope.currentfilter.OrderBillNo || $scope.currentfilter.PatWoNum || $scope.currentfilter.PatientNameMRN) {
                    var From = null;
                    var To = null;
                    $scope.currentfilter.WorkOrderStatusId = null;
                }

                var inputData = {
                    Params: [{
                            Key: 3,
                            Value: $scope.currentfilter.WorkOrderStatusId
                        },
                        {
                            Key: 28,
                            Value: $scope.currentfilter.OrderBillNo
                        },
                        {
                            Key: 32,
                            Value: $scope.currentfilter.PatWoNum
                        },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.TestTypeId
                        },
                        // {
                        //     Key: 11,
                        //     Value: From
                        // },
                        // {
                        //     Key: 12,
                        //     Value: To
                        // },
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
                            Value: $scope.currentfilter.VisitIdentifier
                        },
                        {
                            Key: 13,
                            Value: $scope.currentfilter.DoctorId
                        },
                        {
                            Key: 16,
                            Value: $scope.currentfilter.EncounterTypeId
                        },
                        {
                            Key: 8,
                            Value: $scope.currentfilter.PatientNameMRN
                        },
                        {
                            Key: 23,
                            Value: $scope.currentfilter.SubDepartmentId
                        },
                        {
                            Key: 35,
                            Value: $scope.currentfilter.SampleIdentifier
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
            $rootScope.app.layout.isCollapsed = true;
        }

        function setDefaults() {
            //Setting default status filters starts
            var createdStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Created');
            var assignedStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Assigned & In-progress');
            var partiallycompletedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Partially Completed');
            var rejectedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Rejected');
            $scope.currentfilter.WorkOrderStatusId = createdStatusId + ',' + rejectedStautsId;
            //Setting default status filters ends
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

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

        $scope.attendOrder = function (row) {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.assignOrder,
                itemId: entity.Id
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        }

        $scope.canShowAction = function (actionType, row) {
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
        }


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
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
                $scope.patientprofiledetails(entity.Patient.Id);
            } else if (actionType == 'attend') {
                $scope.attendOrder(entity);
            }

            if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    }
                });
            } else if (actionType == 'amend') {
                $state.go('app.resultamendform', {
                    id: entity.Id,
                    pt: 'myapproval'
                });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.lisordertat', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.PatientOrder.Id,
                        testtypeid: entity.TestTypeId,
                    },
                    confirmCallback: $scope.onDetailSave
                });
            } else if (actionType == 'orderhistory') {
                utl.Modal.open('app.resultentryorderhistory', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.Id,
                        testtypeid: entity.TestTypeId,
                    },
                    confirmCallback: $scope.onDetailSave
                });
            } else if (actionType == 'worksheet') {
                $scope.printWorkSheet(entity.PatientId, entity.Id);
            }

        }

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
        }



        var sno = {
            field: "S.No",
            displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
        };
        var wonum = {
            field: "WorkOrderdid",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workordernumber.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>\<div style='color: #4407ff;class='col-sm-2'><span>{{entity.WorkOrderdid}}</span></div>\
                       &nbsp;\</div>"
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
            field: "OrderPriority.Description",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.priority.lbl')
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
                "<span ><b>{{entity.Patient.Title.Description}}&nbsp;</b></span>" +
                "<span ><b>{{entity.Patient.FirstName}}&nbsp;</b></span>" +
                "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                "<span >/<span>" +
                "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                "<span >{{entity.Patient.Age}}</span>" +
                "<span >/</span>" +
                "<span >{{entity.Patient.Gender.Description}}</span>" +
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
            // cellTemplate: 'conditionActionTemplate.html',
            cellTemplate: '<div class="ui-grid-cell-contents">\
                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true" uib-tooltip="View"></span>\
                      <span class="grid-action" ng-click="handleEvents(\'ordertat\',entity)" ><i class="fas fa-book" uib-tooltip="Order TAT"></i></span>\
                      <span class="grid-action" ng-click="handleEvents(\'orderhistory\',entity)" ><i class="fas fa-notes-medical" uib-tooltip="Order History"></i></span>\
                 </div>',
            handleEvent: $scope.handleEvents,
        };
        if ($scope.showsubdept == 1) {
            var colDefs = [sno, wonum,
                ordnum, Sampleid, encType, orderDate,
                OrderPriority, PatInfo, OrderBy, subDept, wardDet, WorderStatus, actions
            ];
        } else {
            var colDefs = [sno, wonum,
                ordnum, Sampleid, encType, orderDate,
                OrderPriority, PatInfo, OrderBy, wardDet, WorderStatus, actions
            ];
        }
        if ($scope.currentfilter.TestTypeId == 2) {
            if ($scope.showsubdept == 1) {
                var colDefs = [sno, wonum,
                    ordnum, encType, orderDate,
                    OrderPriority, PatInfo, OrderBy, subDept, WorderStatus, actions
                ];
            } else {
                var colDefs = [sno, wonum,
                    ordnum, encType, orderDate,
                    OrderPriority, PatInfo, OrderBy, WorderStatus, actions
                ];
            }
        }
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
            columnDefs: colDefs,
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.getDateDiff = function () {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromDate,
                $scope.currentfilter.ToDate
            );
            if (!(resultInHours >= 0 && resultInHours <= 72)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
                $scope.currentfilter.FromDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                $scope.currentfilter.ToDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                return false;
            } else {
                $scope.getList();
            }
        }
        $scope.getDateDiffInHours = function (Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

        $('#patientname').focus();
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
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
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "WorkOrderStatus",
                    Default: false
                },
                // {
                //     "Key": "Doctor"
                // },
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
        }

        $scope.initLookup();
    }
    allOrderProcessListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();