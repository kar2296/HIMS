(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleListController', roleListController);

    function roleListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            rolename: '',
            rolecode: '',
            ActiveStatusId: 2
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

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.CodeName
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.FacilityId
                },
                // {
                //     Key: 2,
                //     Value: $scope.currentfilter.rolecode
                // },
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
                action: 'SystemSettings/role/GetRoles',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.roletab.general', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/role/DeleteRole',
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
                $state.go('app.roletab.general', {
                    id: entity.Id,
                    code: entity.RoleCode
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RoleName);
            } else if (actionType == 'rolecontrolmap') {
                utl.Modal.open('app.rolecontrolmap', {
                    params: {
                        id: entity.Id,
                        role: entity.RoleName
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "RoleName",
                displayName: $translate.instant('appmanager.roles.rolename.lbl')
            },
            // {
            //     field: "RoleCode",
            //     displayName: $translate.instant('appmanager.roles.Code.lbl')
            // },

            {
                field: "Description",
                displayName: $translate.instant('appmanager.roles.roledetails.lbl')
            },
            {
                field: "Facility.FacilityName",
                displayName: $translate.instant('Facility')
            },
            //{ field: "Comments", displayName: $translate.instant('appmanager.roles.comments.lbl') },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('appmanager.roles.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-hide="entity.ActiveStatusId == 2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            <span class="grid-action" ng-click="handleEvents(\'rolecontrolmap\',entity)"uib-tooltip="Role controls"><i class="fa fa-cogs    fa-sm" aria-hidden="true"></i></span>\
                        </div>',
                handleEvent: $scope.handleEvents,
                actions: [

                ]
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
            },
            {
                Key: 'Facility',
                Request: {
                    Params: [{ Key: 12, Value: utl.Session.getCurrentOrgId() }]
                }
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
    roleListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();