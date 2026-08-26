(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimprocessController', claimprocessController);

    function claimprocessController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ClaimSubmissionStatusId: "3,2"
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.SubmittedOn).getTime() - new Date(a.SubmittedOn).getTime();
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            vm.gridConfig.data = data.Data || [];
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshReactProps();
        }
        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.BatchNo },
                    { Key: 2, Value: $scope.currentfilter.GuarantorId },
                    { Key: 3, Value: FrmDate },
                    { Key: 4, Value: ToDate },
                    { Key: 5, Value: $scope.currentfilter.ClaimSubmissionStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/ClaimSubmission/GetClaimSubmissions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        }

        $scope.addNew = function () {
            $state.go('app.claimsubmission-form', { id: 0 })
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'claim') {
                $state.go('app.claimprocessform', { id: row.entity.Id })
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "SubmittedOn",
                    displayName: $translate.instant('billing.claimprocess.claimno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.SubmittedOn | date : 'dd-MMM-yyyy'}}&nbsp;</span>"
                    + "<span >{{row.entity.SubmittedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "ClaimNumber", displayName: $translate.instant('billing.claimprocess.mrn.lbl')
                },
                {
                    field: "Guarantor.GuarantorName", displayName: $translate.instant('appointment.appointment-list.patientname.lbl')
                },
                {
                    field: "ClaimAmount",
                    displayName: $translate.instant('billing.claimprocess.claimdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.ClaimAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.ClaimAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "Createdy",
                    displayName: $translate.instant('billing.claimprocess.insurancename.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span >{{row.entity.CreatedUser.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.CreatedUser.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.CreatedUser.LastName}}</span>" +
                    "</span></div>"
                },
                { field: "ClaimSubmissionStatus.Description", displayName: $translate.instant('billing.claimsubmission-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <a class="grid-action btn btn-warning btn-xs" ng-click="grid.appScope.handleEvents(\'claim\',row)"><i class="fa fa-usd" aria-hidden="true"></i></a>\
                                                </div>',
                    actions: [

                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [

                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Facility" },
                { "Key": "ClaimSubmissionStatus", Default: false }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                rows: vm.gridConfig.data
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'batchNoChange') {
                $scope.currentfilter.BatchNo = payload.value;
            } else if (actionName === 'fetch') {
                $scope.getList();
            } else if (actionName === 'fromDateChange') {
                $scope.currentfilter.FromDate = payload.value;
                $scope.getList();
            } else if (actionName === 'toDateChange') {
                $scope.currentfilter.ToDate = payload.value;
                $scope.getList();
            } else if (actionName === 'guarantorChange') {
                $scope.currentfilter.GuarantorId = payload.value;
                $scope.getList();
            } else if (actionName === 'claim') {
                $scope.handleEvents('claim', { entity: payload });
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }
    claimprocessController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();