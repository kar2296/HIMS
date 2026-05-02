(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('NotifiableDiseasesViewController', NotifiableDiseasesViewController);

    function NotifiableDiseasesViewController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            EncounterTypeId: -1,
            NotifiableDiseaseId: -1,
        };
        $scope.lookup = {};

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 8, Value: From },
                    { Key: 9, Value: To },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.NotifiableDiseaseId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.EncounterTypeId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'emr/PatientNotifiableDisease/GetPatientNotifiableDiseases',
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
                    field: "PerformedDate",
                    displayName: $translate.instant('Date'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PerformedDate'></ngformatdate>"
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
                    field: "EncounterType",
                    displayName: $translate.instant('Visit Type'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Encounter.EncounterType.Description}}</span>" + "</div>"
                },
                {
                    field: "Encounter.VisitIdentifier",
                    displayName: $translate.instant('Visit No.'),
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('currentinpatient.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity    )">' +
                        "<span >{{entity.Encounter.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Encounter.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Encounter.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "Encounter.Department.DepartmentName",
                    displayName: $translate.instant('admissions.department.lbl')
                },
                {
                    field: "NotifiableDiseaseName",
                    displayName: $translate.instant('Notified Disease')
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
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "EncounterType"
                },
                {
                    "Key": "NotifiableDiseaseType"
                },
                {
                    "Key": "NotifiableDisease"
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
    NotifiableDiseasesViewController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();