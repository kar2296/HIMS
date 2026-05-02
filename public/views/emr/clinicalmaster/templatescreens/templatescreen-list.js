(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('templateScreenListController', templateScreenListController);

    function templateScreenListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: '',
            ActiveStatusId: 2,
            ProfilemasterTypeId: -1

        };
        $scope.backtoList = function() {
            $state.go('app.medicalmasterdashboard');
        }
        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {

            var inputData = {
                Params: [
                    /* { Key: 1, Value: $scope.currentfilter.name ? $scope.currentfilter.name : "" } */
                    {
                        Key: 1,
                        Value: $scope.currentfilter.Name
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ProfilemasterTypeId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/ProfileMaster/GetProfileMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function () {
        //     $scope.openModal(0);
        // }


        // $scope.openModal = function (Id) {
        //     utl.Modal.open('app.templatescreen', {
        //         params: {
        //             id: Id
        //         },
        //         confirmCallback: $scope.initLookup
        //     });
        // }
        $scope.addNew = function() {
            $state.go('app.templatescreentab.templatescreen');
        };
        $scope.openProfileSection = function(ProfileId, name) {
            $state.go('app.templatescreensection', {
                profileId: ProfileId,
                name: name
            });
        }


        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'clinicalmaster/ProfileMaster/DeleteProfileMaster',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.templatescreentab.templatescreen', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    UserName: entity.UserName
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'mapping') {
                $scope.openProfileSection(entity.Id, entity.Name);

            } else if (actionType == 'printconfig') {
                utl.Modal.open('app.templatescreenprintconfig', {
                    params: {
                        profileId: entity.Id,
                        profileid: entity.ProfileId,
                        name: entity.Name
                    },
                    confirmCallback: $scope.initLookup
                });
            } else if (actionType == 'profileusers') {
                $state.go('app.templatescreenusers', {
                    pid: entity.Id,
                    name: entity.Name
                });
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "Name",
                    displayName: $translate.instant('clinicalmaster.profile-list.name.lbl')
                },
                {
                    field: "SectionNoteType.Description",
                    displayName: $translate.instant('clinicalmaster.profile-list.profiletype.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('clinicalmaster.notetemplate-list.status.lbl')
                },

                // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                //         cellTemplate : 'actionTemplate.html',
                //         actions : [
                //                     {actiontype: 'edit', display : 'common.editaction.lbl'},
                //                     {actiontype: 'delete', display : 'common.deleteaction.lbl'},
                //                     {actiontype: 'profilesection', display : 'clinicalmaster.profile-list.profilesection.lbl'},
                //                     {actiontype: 'printconfig', display : 'clinicalmaster.profile-list.printconfig.lbl', icon: 'fa-print' },
                //                     {actiontype: 'profileusers', display : 'clinicalmaster.profile-list.profileusers.lbl', icon : 'fa-users'}
                //                  ]
                // }
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //                                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==2||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //                                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                //                                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'printconfig\',entity)"><i class="btn btn-success btn-rounded fa fa-print" aria-hidden="true"></i></span>\
                //                                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'profilesection\',entity)"><i class="btn btn-primary btn-rounded fa fa-history" aria-hidden="true"></i></span>\
                //                                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'profileusers\',entity)"><i class="btn btn-success btn-rounded fa fa-users" aria-hidden="true"></i></span>\
                //                    </div>',
                //     actions: []
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==2||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'printconfig\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==2||entity.ActiveStatusId==3"><i class="fa fa-print" aria-hidden="true"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    // actions: [
                    //     { actiontype: 'profilemapping', display: 'common.editaction.lbl' },
                    //     { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                    //     { actiontype: 'printconfig', display: 'clinicalmaster.profile-list.printconfig.lbl' },
                    //     { actiontype: 'mapping', display: 'clinicalmaster.profile-list.profileusers.lbl' },
                    //     { actiontype: 'profileusers', display: 'clinicalmaster.profile-list.profileusers.lbl' }
                    // ]
                }
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
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "SectionNoteType"
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

    templateScreenListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();