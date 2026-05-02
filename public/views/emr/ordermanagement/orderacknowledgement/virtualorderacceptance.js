(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualOrderacceptanceListController', VirtualOrderacceptanceListController);

    function VirtualOrderacceptanceListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            OrderNumber: '',
            BillNumber: '',
            PatientMRN: '',
            OrderPriorityId: -1,
            OrderStatusId: '1',
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            Subdepartmentid: -1
        };
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.backToList = function() {
            $state.go('app.labdashboard');
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            var From = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 23:59:59') || null;
            if ($scope.currentfilter.BillOrderNumber || $scope.currentfilter.Patient) {
                var From = null;
                var To = null;
            }
            var inputData = {
                Params: [

                    {
                        Key: 3,
                        Value: $scope.currentfilter.OrderPriorityId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.OrderStatusId
                    },
                    {
                        Key: 28,
                        Value: $scope.currentfilter.Subdepartmentid
                    },
                    {
                        Key: 32,
                        Value: $scope.currentfilter.BillOrderNumber
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.Patient
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.TestTypeId
                    },
                    {
                        Key: 12,
                        Value: From
                    },
                    {
                        Key: 13,
                        Value: To
                    },
                    {
                        Key: 27,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 33,
                        Value: true
                    },
                    {
                        Key: 35,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrderWithoutDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.handleEvents = function(actionType, entity) {
                if (actionType == 'edit') {
                    $state.go('app.virtualacceptanceform', {
                        id: entity.Id,
                        pid: entity.PatientId,
                        resid: entity.ResultFormatTypeId,
                        tp: entity.TestTypeId
                    })
                } else if (actionType == 'patientinfo') {
                    $scope.patientprofiledetails(entity.PatientId);
                }
            }
            //
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "OrderRequestDate",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.orderdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span > {{entity.OrderRequestDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.OrderRequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "OrderNumber",
                    displayName: $translate.instant('Order#'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OrderNumber}}&nbsp;</span>" + "</div>"
                },
                {
                    field: "OrderScheduleDate",
                    displayName: $translate.instant('Schedule Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span > {{entity.OrderScheduleDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.OrderScheduleDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "SubDeparement.DepartmentName",
                    displayName: $translate.instant('Sub Department')
                },
                {
                    field: "Patient.Mobile",
                    displayName: $translate.instant('Phone#')
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('Patient Id')
                },
                {
                    field: "Patient.FirstName",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.patientinfo.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/<span>" +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div  class="ui-grid-cell-contents">\
                     <span class="grid-action" ng-show="entity.IsPaidFully==true" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "OrderStatus"
                },
                {
                    "Key": "OrderPriority"
                },
                {
                    "Key": "SubDepartment",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: 8
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

    VirtualOrderacceptanceListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();