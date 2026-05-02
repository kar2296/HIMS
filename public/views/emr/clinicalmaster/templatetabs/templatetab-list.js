(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templateTabListController', templateTabListController);

    function templateTabListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
        }
        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.Name
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ParentSectionId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.SectionTypeId
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.DockPositionId
                    // },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.SectionNoteTypeId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/SectionMaster/GetSectionMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.templatetab', {
                id: 0
            });
        }

        // $scope.openModal = function (Id) {
        //     utl.Modal.open('app.templatetab', {
        //         params: { id: Id }, confirmCallback: $scope.initLookup
        //     }
        //     );
        // }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/SectionMaster/DeleteSectionMaster',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        // $scope.handleEvents = function (actionType, entity) {

        //     if (actionType == 'edit') {
        //         $scope.openModal(entity.Id);
        //     }
        //     else if (actionType == 'delete') {
        //         utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
        //     }
        // }
        // Cancel Requests from List Screen Function

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.templatetab', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }

        }


        vm.gridConfig = {
            columnDefs: [{
                    field: "Name",
                    displayName: $translate.instant('clinicalmaster.section-list.name.lbl')
                },
                // { field: "Description", displayName: $translate.instant('clinicalmaster.section-list.description.lbl') },
                {
                    field: "SectionType.Description",
                    displayName: $translate.instant('clinicalmaster.clinicalmasters.tabtype.lbl')
                },
                {
                    field: "SectionNoteType.Description",
                    displayName: $translate.instant('clinicalmaster.clinicalmasters.notetype.lbl')
                },
                // { field: "DockPosition.Description", displayName: $translate.instant('clinicalmaster.section-list.dockposition.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        },
                        {
                            actiontype: 'delete',
                            display: 'common.deleteaction.lbl'
                        }
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
            var inputData = [
                // {
                //     "Key": "DockPosition"
                // },
                {
                    "Key": "SectionType"
                },
                // {
                //     "Key": "SectionMaster"
                // },
                {
                    "Key": "SectionNoteType"
                },
                // {
                //     "Key": "Category"
                // }
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

    templateTabListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();