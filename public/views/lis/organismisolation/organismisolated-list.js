(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrganismIsolatedListController', OrganismIsolatedListController);

    function OrganismIsolatedListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Code },
                    { Key: 2, Value: $scope.currentfilter.MnemonicName },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/OrgIsolation/GetOrgIsolations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);

        };

        $scope.openModal = function(Id) {
                utl.Modal.open('app.orgisolted-form', {
                    params: { id: Id },
                    confirmCallback: $scope.initLookup
                });
            }
            //Grid Actions
        $scope.addNew = function() {
            $state.go('app.organismtab.orgisolted-form', { id: 0 });
            // $scope.openModal(0);
        }


        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'lis/OrgIsolation/DeleteOrgIsolation',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.organismtab.orgisolted-form', { id: entity.Id });
                // $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ProviderName);
            } else if (actionType == 'view') {
                $state.go('app.organismtab.orgisolted-form', { id: entity.Id });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('lis.analyzer.code.lbl') },
                { field: "OrgIsolationName", displayName: $translate.instant('lis.analyzer.name.lbl') },
                { field: "Mnemonic", displayName: $translate.instant('lis.testmaster.Mnemonics.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('lis.analyzer.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ActiveStatus" },
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

    OrganismIsolatedListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();