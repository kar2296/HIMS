(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referencevaluegroupListController', referencevaluegroupListController);

    function referencevaluegroupListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            CodeName: '',
            facilityid: utl.Session.getCurrentFacilityId(),
            moduleid: -1,
            ActiveStatusId: 2
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: vm.gridConfig.pagerObj.totalItems || 0,
                pageSize: vm.gridConfig.pagerObj.pageSize || 25,
                currentPage: vm.gridConfig.pagerObj.currentPage || 1,
                lookup: $scope.lookup || {},
                currentfilter: $scope.currentfilter
            };
        };

        $scope.handleReactAction = function (action, payload) {
            $scope.$evalAsync(function () {
                if (action === 'fetchData' && payload) {
                    if (payload.currentPage) vm.gridConfig.pagerObj.currentPage = payload.currentPage;
                    if (payload.pageSize) vm.gridConfig.pagerObj.pageSize = payload.pageSize;
                    if (payload.currentfilter) {
                        angular.extend($scope.currentfilter, payload.currentfilter);
                    }
                    $scope.getList();
                } else if (action === 'addNew') {
                    $scope.addNew();
                } else if (action === 'edit' && payload) {
                    $scope.openModal(payload.Id);
                } else if (action === 'delete' && payload) {
                    $scope.onDeleteConfirmed(payload.Id);
                } else if (action === 'refvalueaction' && payload) {
                    $scope.handleEvents('refvalueaction', payload);
                }
            });
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (!hasError && res && res.Data) {
                vm.gridConfig.data = res.Data;
                vm.gridConfig.pagerObj.totalItems = (res.PageContext && res.PageContext.TotalRecords !== undefined) ? res.PageContext.TotalRecords : res.Data.length;
            } else {
                vm.gridConfig.data = [];
                vm.gridConfig.pagerObj.totalItems = 0;
            }
            $scope.refreshReactProps();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.CodeName
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.facilityid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.moduleid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/referencevaluegroup/GetReferenceValueGroups',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.openModal = function (Id) {
            utl.Modal.open('app.referencevaluegroup', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/referencevaluegroup/DeleteReferenceValueGroup',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'view') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GroupName);
            } else if (actionType == "refvalueaction") {
                $state.go('app.referencevalues', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    groupId: entity.Id,
                    groupCode: entity.GroupCode
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "GroupCode",
                    displayName: $translate.instant('appmanager.referencevaluegroups.code.lbl')
                },
                {
                    field: "GroupName",
                    displayName: $translate.instant('appmanager.referencevaluegroups.name.lbl')
                },
                // {
                //     field: "Facility.FacilityName",
                //     displayName: $translate.instant('appmanager.referencevaluegroups.facility.lbl')
                // },
                // {
                //     field: "ModuleName",
                //     displayName: $translate.instant('appmanager.referencevaluegroups.module.lbl')
                // },
                // {
                //     field: "ScreenName",
                //     displayName: $translate.instant('appmanager.referencevaluegroups.screen.lbl')
                // },
                //{ field: "Description", displayName: $translate.instant('appmanager.referencevaluegroups.description.lbl') },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('appmanager.referencevaluegroups.status.lbl')
                },
                // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                //         cellTemplate : 'actionTemplate.html',
                //         actions : [
                //                     {actiontype: 'edit', display : 'common.editaction.lbl'},
                //                     {actiontype: 'delete', display : 'common.deleteaction.lbl'},
                //                     {actiontype: 'refvalueaction', display : 'appmanager.referencevaluegroups.refvalueaction.lbl'}
                //                  ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            <span class="grid-action" ng-click="handleEvents(\'refvalueaction\',entity)"><i class="fas fa-history"></i></span>\
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
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                // { "Key": "Module" },
                {
                    "Key": "ActiveStatus"
                }
            ]
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

    referencevaluegroupListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();