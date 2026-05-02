(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('genericListController', genericListController);

    function genericListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            GenericName: "",
            AllergenTypeId: -1,
            ActiveStatusId: 2
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                ScheduleTypeId: -1,
                //IsPrescribed: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'select', translate: 'clinicalmaster.generic-list.scheduletype.lbl', model: 'ScheduleTypeId', options: $scope.lookup.ScheduleType, position: { r: 0, c: 0 } },
                    { type: 'checkbox', translate: 'clinicalmaster.generic-list.isprescribe.lbl', model: 'IsPrescribed', position: { r: 0, c: 1 } },

                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-success' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }
        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.GenericName },
                    { Key: 2, Value: $scope.currentfilter.AllergenTypeId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.advancedfilter.ScheduleTypeId },
                    { Key: 5, Value: $scope.advancedfilter.IsPrescribed },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/GenericMaster/GetGenericMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.generics', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
        //Grid Actions
        // $scope.addNew = function() {
        //     $state.go('app.generic', { id:0 });
        // }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/GenericMaster/DeleteGenericMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GenericName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('clinicalmaster.generic-list.code.lbl') },
                { field: "GenericName", displayName: $translate.instant('clinicalmaster.generic-list.name.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.generic-list.description.lbl') },
                // { field: "AllergenType.Description", displayName: $translate.instant('clinicalmaster.generic-list.allergentype.lbl') },
                { field: "ScheduleType.Description", displayName: $translate.instant('clinicalmaster.generic-list.scheduletype.lbl') },
                // { field: "IsPrescribed", displayName: $translate.instant('clinicalmaster.generic-list.isprescribe.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.generic-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
       handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();

        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AllergenType" },
                { "Key": "ActiveStatus" },
                { "Key": "ScheduleType" }
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

    genericListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();