(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('treatmentplanfollowupListController', treatmentplanfollowupListController);

    function treatmentplanfollowupListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            Ordereddate: utl.Formatter.getCurrentDate(),
            TestTypeId: -1,
            FollowupStatusId: 1,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: $scope.currentfilter.FollowupStatusId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.PatWoNum
                },
                {
                    Key: 4,
                    Value: From
                },
                {
                    Key: 5,
                    Value: To
                },
                {
                    Key: 8,
                    Value: utl.Session.getCurrentFacilityId()
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'emr/TreatmentPlanFollowup/GetTreatmentPlanFollowups',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'update') {
                utl.Modal.open('app.treatmentplanflwupupdate', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        oid: entity.Orderid
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
                field: "TreatmentRequestDate",
                displayName: $translate.instant('ordermanagement.resultdispatch-list.orderdate.lbl'),
                cellTemplate: "<ngformatdate datetime-val='entity.TreatmentRequestDate'></ngformatdate>"
            },
            {
                field: "TreatmentScheduleDate",
                displayName: $translate.instant('Scheduled Date'),
                cellTemplate: "<ngformatdate date-val='entity.TreatmentScheduleDate'></ngformatdate>"
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
                field: "Encounter.EncounterType.Description",
                displayName: $translate.instant('Visit Type')
            },
            {
                field: "PatientMRN",
                displayName: $translate.instant('Doctor Name'),
                width: '20%',
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<b>{{entity.Doctor.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Doctor.FirstName}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Doctor.LastName}}</b></span>" +
                    "</div>"
            },
            {
                field: "ServiceName",
                displayName: $translate.instant('Treatment Name'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ><b>{{entity.ServiceName}}</b></span>" +
                    "<span >(<span>" +
                    "<span >{{entity.ServiceCode}}</span>" + "<span>)<span>" +
                    "</div>"
            },
            {
                field: "OrderFollowupStatus.Description",
                displayName: $translate.instant('Status')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <a class="grid-action" ng-click="handleEvents(\'update\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true" uib-tooltip="Followup" tooltip-placement="bottom"></a>\
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
                "Key": "OrderFollowupStatus"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }]
                }
            }];

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

    treatmentplanfollowupListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();