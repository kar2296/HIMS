(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientkinListController', patientkinListController);

    function patientkinListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));
        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };
        $scope.currentcontext = {};
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.backTolist = function () {
            $state.go('app.fullregistrationtab.basic');
        }
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data;
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.patientid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientKin/GetPatientKins',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function() {
        //     $state.go('app.fullregistrationtab.patientkin', { patientkinid:0 });
        // }
        $scope.addNew = function () {
            utl.Modal.open('app.fullregistrationtab.patientkin', {
                params: { patientkinid: 0, id: $scope.currentcontext.patientid },
                confirmCallback: $scope.getList
            }
            );
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'registration/PatientKin/DeletePatientKin',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.fullregistrationtab.patientkin', {
                    params: { patientkinid: entity.Id, id: $scope.currentcontext.patientid },
                    confirmCallback: $scope.getList
                }
                );
            }
            // if (actionType == 'edit') {
            //     $state.go('app.fullregistrationtab.patientkin', { patientkinid: entity.Id });
            // }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
  {
                    field: "Name",
                    displayName: $translate.instant('registration.patientkin-list.name.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span >{{entity.Title.Description }}</span>" +
                    "<span  > </span>" +
                    "<span  >{{entity.Name}}</span>" +
                    "</div>"
                },
                { field: "Mobile", displayName: $translate.instant('registration.patientkin-list.phoneno.lbl') },
                { field: "Relationship.Description", displayName: $translate.instant('registration.patientkin-list.relationship.lbl') },
                { field: "Comments", displayName: $translate.instant('registration.patientkin-list.comments.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                 <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ]
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        /* React bridge code starts */
        $scope.reactProps = {};

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                currentcontext: $scope.currentcontext,
                flags: {
                    canUpdatePatientInfo: $scope.canUpdatePatientInfo()
                }
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'edit':
                    // Mirrors the real ng-click="handleEvents('edit',entity)" cell action.
                    $scope.handleEvents('edit', payload.entity);
                    return;
                case 'delete':
                    // Mirrors the real ng-click="handleEvents('delete',entity)" cell action.
                    $scope.handleEvents('delete', payload.entity);
                    return;
            }
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };

        $scope.refreshReactProps();
        /* React bridge code ends */

        $scope.initLookup();
    }

    patientkinListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();