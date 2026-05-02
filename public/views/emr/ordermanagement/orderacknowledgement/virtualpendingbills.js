(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('virtualpendingbillsListController', virtualpendingbillsListController);

    function virtualpendingbillsListController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
        };
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.addNew = function () {
            $state.go('app.billingsdashboard', {
                id: 0
            });
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var FromschDate = $filter('date')($scope.currentfilter.OrderScheduleDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToschDate = $filter('date')($scope.currentfilter.OrderScheduleDate, 'yyyy-MM-dd 23:59:59') || null;
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
                        Key: 37,
                        Value: FromschDate
                    },
                    {
                        Key: 38,
                        Value: ToschDate
                    },
                    {
                        Key: 40,
                        Value: From
                    },
                    {
                        Key: 41,
                        Value: To
                    },
                    // {
                    //     Key: 51,
                    //     Value: utl.Formatter.getFilterDate(From)
                    // },
                    // {
                    //     Key: 52,
                    //     Value: utl.Formatter.getFilterDate(To)
                    // },
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
                        Value: false
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

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'bill') {
                $state.go('app.virtualorderbilling', {
                    id: entity.Id,
                    bid: entity.BillingId,
                    pid: entity.PatientId,
                    resid: entity.ResultFormatTypeId,
                    tp: entity.TestTypeId
                })
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        }

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
                field: "GrossAmount",
                displayName: $translate.instant('Amount'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OrderTotal}}&nbsp;</span>" + "</div>"
            },
            {
                field: "Patient.AddressLine1",
                displayName: $translate.instant('Patient Address'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.AddressLine1}}&nbsp;{{entity.Patient.AddressLine2}}</span>" + "</div>"
            },
            {
                field: "PatientMRN",
                displayName: $translate.instant('Patient Id'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientMRN}}&nbsp;</span>" + "</div>"
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
                       <span class="grid-action"  ng-click="handleEvents(\'bill\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "OrderStatus"
            },
            {
                "Key": "OrderPriority"
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

    virtualpendingbillsListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();