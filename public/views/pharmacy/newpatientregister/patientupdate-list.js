(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientUpdateListController', PatientUpdateListController);

    function PatientUpdateListController( $rootScope,$scope, $stateParams, $state, $translate, utl, $filter,$timeout) {
        var vm = this;

        $scope.currentfilter = {
            PatientStatusId: 2,
            RegisteredDate: utl.Formatter.getCurrentDate()
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var FrRegDt = $filter('date')($scope.currentfilter.RegisteredDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToRegDt = $filter('date')($scope.currentfilter.RegisteredDate, 'yyyy-MM-dd 23:59:59') || null;
            // if ($scope.currentfilter.RegisteredDate) {
            //     var FrRegDt = $filter('date')($scope.currentfilter.RegisteredDate, 'yyyy-MM-dd 00:00:00');
            //     var ToRegDt = $filter('date')($scope.currentfilter.RegisteredDate, 'yyyy-MM-dd 23:59:59');
            // }
            if ($scope.currentfilter.Patientinfo) {
                $scope.currentfilter.RegisteredDate = null;
                var FrRegDt = '';
                var ToRegDt = '';
            }
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.currentfilter.Patientinfo
                    },
                    {
                        Key: 9,
                        Value: FrRegDt
                    },
                    {
                        Key: 10,
                        Value: ToRegDt
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.PatientStatusId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.open('app.newpatientregister', {
                    params: {
                        id: entity.Id
                    },
                    confirmCallback: $scope.getList
                });
            }
            else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.Id
                    },
                    confirmCallback: $scope.getitem
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "index",
                    displayName: $translate.instant('registration.updatepatient.snum.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "RegisteredDate",
                    displayName: $translate.instant('registration.updatepatient.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RegisteredDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.RegisteredDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PatientInfo",
                    displayName: $translate.instant('registration.updatepatient.patplaceholder.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        // '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Title.Description}} ' + '{{entity.FirstName }} ' +
                        // '{{entity.LastName}}" tooltip-placement="bottom">' +
                        '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)"'+
                        "<span ng-if='entity.Title && entity.Title.Description' >" +
                        "{{entity.Title.Description}}</span>" +
                        "<span >&nbsp;</span>" +
                        "<span >{{entity.FirstName}}</span>" +
                        "<span >&nbsp;</span>" +
                        "<span >{{entity.LastName}}</span>" +
                        "</a></div>",
                        handleEvent: $scope.handleEvents
                },
                {
                    field: "Age",
                    displayName: $translate.instant('registration.updatepatient.age.lbl')
                },
                {
                    field: "Mobile",
                    displayName: $translate.instant('registration.updatepatient.mobile.lbl')
                },
                {
                    field: "MRN",
                    displayName: $translate.instant('registration.updatepatient.patid.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img src="assets/svg/edit.svg" alt=""></span>\
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
                "Key": "PatientStatus"
            }, ]
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

    PatientUpdateListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter','$timeout'];

})();