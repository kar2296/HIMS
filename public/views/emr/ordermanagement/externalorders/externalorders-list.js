(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExternalOrdersListController', ExternalOrdersListController);

    function ExternalOrdersListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            uid: utl.Session.getCurrentUserId(),
            Ordereddate: utl.Formatter.getCurrentDate(),
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            WorkOrderStatusId: 1,
            EncounterTypeId: -1,
            WorkOrderdid: ''
        };

        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };
        $scope.getList = function () {

            var From = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 23:59:59') || null;
            if ($scope.currentfilter.OrderBillNo || $scope.currentfilter.PatWoNum) {
                var From = null;
                var To = null;
                $scope.currentfilter.WorkOrderStatusId = null
            }
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentfilter.WorkOrderStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.TestTypeId
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
                        Key: 9,
                        Value: $scope.currentfilter.WorkOrderdid
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
                        Key: 18,
                        Value: $scope.currentfilter.ExternalProviderId
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
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 34,
                        Value: true
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

        function print(entity) {
            var inputData = {
                Id: entity.Id
            };
            var options = {
                action: 'lis/patientworkorder/PrintExternallabSlip',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'assign') {
                utl.Modal.open('app.externalorderform', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        oid: entity.Orderid
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'print') {
                print(entity);
            } else if (actionType == 'upload') {
                utl.Modal.open('app.externalclinicaldocument', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        eid: entity.EncounterId
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "WorkOrderdid",
                    displayName: $translate.instant('ordermanagement.myresultapproval-list.workordernumber.lbl')
                },
                {
                    field: "OrderNumber",
                    displayName: $translate.instant('Order No/Bill No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.PatientOrder.BillNumber}}&nbsp;</span>" + "</div>"
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
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
                },
                {
                    field: "PatientMRN",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.patientinfo.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/<span>" +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "WorkOrderStatus.DisplayName",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.workorderstatus.lbl')
                },
                {
                    field: "ExternalProvider.ProviderName",
                    displayName: $translate.instant('External Provider')
                },
                {
                    field: "ExternalProvider.ProviderName",
                    displayName: $translate.instant('External Provider')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <a class="grid-action" ng-click="handleEvents(\'assign\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true" uib-tooltip="Assign" tooltip-placement="bottom"></a>\
                                    <a class="grid-action" ng-click="handleEvents(\'upload\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true" uib-tooltip="Upload Document" tooltip-placement="bottom"></a>\
                                    <a class="grid-action"  ng-click="handleEvents(\'print\',entity)"><img class="drhms-edit-button" src="assets/svg/print-black.svg" style="width: 16px;" aria-hidden="true" uib-tooltip="print" tooltip-placement="bottom"></a>\
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
            $rootScope.app.layout.isCollapsed = true;
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
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
                },
                {
                    "Key": "ExternalProvider"
                }
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

    ExternalOrdersListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();