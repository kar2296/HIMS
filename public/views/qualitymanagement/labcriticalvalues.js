(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCriticalValuesController', LabCriticalValuesController);

    function LabCriticalValuesController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            EncounterTypeId: -1,
            SubDepartmentId: -1,
        };
        $scope.lookup = {};
        $scope.SubdeptDisable = true;
        $scope.disabledept = function() {
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

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };

        $scope.getList = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 11, Value: From },
                    { Key: 12, Value: To },
                    { Key: 6, Value: 1 },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.SubDepartmentId
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.EncounterTypeId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'lis/PatientCriticalOrder/GetPatientCriticalOrders',
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

        $scope.backtoList = function() {
            $state.go('app.qualitymanagement');
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "WorkOrderdid",
                    displayName: $translate.instant('WorkOrder No.'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientWorkorder.WorkOrderdid}}</span>" + "</div>"
                },
                {
                    field: "OrderNumber",
                    displayName: $translate.instant('Order No/Bill No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.PatientOrder.BillNumber}}&nbsp;</span>" + "</div>"
                },
                {
                    field: "EncounterType",
                    displayName: $translate.instant('Visit Type'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.Encounter.EncounterType.Description}}</span>" + "</div>"
                },
                {
                    field: "OrderRequestDate",
                    displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PatientOrder.OrderRequestDate'></ngformatdate>"
                },

                {
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
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
                    field: "OrderPriority.Description",
                    displayName: $translate.instant('Test Details'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AnalyteName}}&nbsp;/</span>" +
                        "<span>-</span>" + "<span >{{entity.Resultvalue}}&nbsp;</span>" + "<span >{{entity.PatientWorkorderdetail.AnalyteUOM}}&nbsp;</span>" + "</div>"
                },
                {
                    field: "OrderedBy",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.orderedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.DoctorName}}</span>" + "</div>"
                },

            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
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

            $scope.getList();

        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "EncounterType"
                },
                {
                    "Key": "Department",
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
    LabCriticalValuesController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();