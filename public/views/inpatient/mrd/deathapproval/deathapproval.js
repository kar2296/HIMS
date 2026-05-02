(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DeathApprovalController', DeathApprovalController);

    function DeathApprovalController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.temptype) {
            $scope.TempType = $stateParams.temptype;
        }
        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            DeathStatusId: 1
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.DeathStatusId
                    },
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Registration/PatientDeath/GetPatientDeaths',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.revertDeathCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('Death Reverted'));
            $scope.getList();
        };

        $scope.revertDeath = function (entity) {
            entity.DeathReversedBy = utl.Session.getCurrentUserId();
            entity.DeathStatusId = 3;
            entity.DeathReversedDate = utl.Formatter.getCurrentDate();
            var options = {
                action: 'Registration/PatientDeath/UpdatePatientDeath',
                data: {
                    Data: entity
                },
                type: 'post',
                onComplete: $scope.revertDeathCallback
            };
            utl.Http.doAction(options);
        }

        $scope.approveCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('Death Approved'));
            $scope.getList();
        };

        $scope.approveDeath = function (entity) {
            entity.DeathApprovedBy = utl.Session.getCurrentUserId();
            entity.DeathStatusId = 2;
            entity.DeathApprovedDate = utl.Formatter.getCurrentDate();
            var options = {
                action: 'Registration/PatientDeath/UpdatePatientDeath',
                data: {
                    Data: entity
                },
                type: 'post',
                onComplete: $scope.approveCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'approve') {
                var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'Do you want to approve this patient death',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod: function () {
                        $scope.approveDeath(entity);
                    }
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else if (actionType == 'revert') {
                // utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AllergyName);
                var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'Do you want to revert this patient death',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod: function () {
                        $scope.revertDeath(entity);
                    }
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "Encounter.VisitIdentifier",
                    displayName: $translate.instant('Visit No')
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('Patient Name'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                           <span ng-if='entity.Patient && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                           <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                            </div>"
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('Doctor Name'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                           <span ng-if='entity.Doctor && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                                           <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                                            </div>"
                },
                {
                    field: "Encounter.AdmissionDate",
                    displayName: $translate.instant('Admission Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Encounter.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>"+ "</div>"
                },
                {
                    field: "DeathDate",
                    displayName: $translate.instant('Death Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DeathDate | date : 'dd-MMM-yyyy'}} </span>" + "</div>"
                },
                {
                    field: "DeathComments",
                    displayName: $translate.instant('Death Comments')
                },
                {
                    field: "DeathRequestedUser",
                    displayName: $translate.instant('Death Requested By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                           <span ng-if='entity.DeathRequestedUser && entity.DeathRequestedUser.Title.Description'>{{entity.DeathRequestedUser.Title.Description}}&nbsp;</span>\
                                           <span>{{entity.DeathRequestedUser.FirstName}}</span>&nbsp;<span>{{entity.DeathRequestedUser.LastName}}</span>\
                                            </div>"
                },
                {
                    field: "DeathApprovedUser",
                    displayName: $translate.instant('Death Approved By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                           <span ng-if='entity.DeathApprovedUser && entity.DeathApprovedUser.Title.Description'>{{entity.DeathApprovedUser.Title.Description}}&nbsp;</span>\
                                           <span>{{entity.DeathApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.DeathApprovedUser.LastName}}</span>\
                                            </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'approve\',entity) "style="margin-right: 10px;" ng-show="entity.DeathStatusId==1"><i class="fa-solid fa-person-circle-check" uib-tooltip="Death Approve"  aria-hidden="true" tooltip-placement="top"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'revert\',entity)" ng-show="entity.DeathStatusId==1"><i class="fa-solid fa-clock-rotate-left" uib-tooltip="Death Revert"  aria-hidden="true" tooltip-placement="top"></i></span>\
               </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
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
            var inputData = [
                {
                    "Key": "DeathStatus"
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

    DeathApprovalController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();

