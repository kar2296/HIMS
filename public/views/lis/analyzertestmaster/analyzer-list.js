(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyzertestmasterListController', analyzertestmasterListController);

    function analyzertestmasterListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {

            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };

        $scope.getList = function () {


                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentfilter.Code },
                        { Key: 2, Value: $scope.currentfilter.Name },
                        { Key: 3, Value: $scope.currentfilter.AssetName },
                        { Key: 4, Value: $scope.currentfilter.AssetId },
                        { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'lis/AnalyzerTest/GetAnalyzerTests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);

        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.analyzertestmasters', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        // $scope.addNew = function () {
        //     $state.go('app.externalprovidertab.pricemappings', { externalproviderpriceid: 0 });
        // };
        $scope.backToForm = function () {
            $state.go('app.analyzertestmaster');
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/AnalyzerTest/DeleteAnalyzerTest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
                // $state.go('app.externalprovidertab.pricemappings', { externalproviderpriceid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ProviderName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "DisplayNo", displayName: $translate.instant('lis.analyzer.displayno.lbl') },
                {
                    field: "AssetName",
                    displayName: $translate.instant('lis.analyzer.equipmentname.lbl')

                },
                { field: "AssetType.Description", displayName: $translate.instant('lis.analyzer.equipmenttype.lbl') },
                {
                    field: "Code",
                    displayName: $translate.instant('lis.analyzer.code.lbl')

                },
                { field: "Name", displayName: $translate.instant('lis.analyzer.name.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('lis.analyzer.status.lbl') },                
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                    </div>',
                handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
               // { "Key": "AssetName" },
                { "Key": "ActiveStatus" },
                { "Key": "AssetType" }
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

    analyzertestmasterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();