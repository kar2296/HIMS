(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('groupListController', groupListController);

    function groupListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            CodeName: '',
            ActiveStatusId: 2
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

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.CodeName
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.ActiveStatusId
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/group/GetGroups',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.grouptab.general', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/group/DeleteGroup',
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
                $state.go('app.grouptab.general', {
                    id: entity.Id
                });
            } else if (actionType == 'view') {
                $state.go('app.grouptab.general', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GroupName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "GroupCode",
                displayName: $translate.instant('appmanager.groups.groupcode.lbl')
            },
            {
                field: "GroupName",
                displayName: $translate.instant('appmanager.groups.groupname.lbl')
            },
            {
                field: "Description",
                displayName: $translate.instant('appmanager.groups.description.lbl')
            },
            {
                field: "Facility.FacilityName",
                displayName: $translate.instant('Facility')
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('appmanager.groups.status.lbl')
            },
            // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
            //         cellTemplate : 'actionTemplate.html',
            //         actions : [
            //                     {actiontype: 'edit', display : 'common.editaction.lbl'},
            //                     {actiontype: 'delete', display : 'common.deleteaction.lbl'}
            //                  ]
            // }
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
            var inputData = [{
                "Key": "ActiveStatus"
            }, {
                Key: 'Facility',
                Request: {
                    Params: [{ Key: 12, Value: utl.Session.getCurrentOrgId() }]
                }
            },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
            //$scope.getList();
        }

        $scope.initLookup();

    }
    groupListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();