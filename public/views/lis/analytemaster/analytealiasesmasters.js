(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analytealiasesmastersListController', analytealiasesmastersListController);

    function analytealiasesmastersListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: '',
            codemnemonicsnamedesc: '',
            code: '',
            ActiveStatusId: 2,
            type: -1,
            vtype: -1,
            mnemonics: ''
        };

        var analyteid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.codemnemonicsnamedesc },
                    { Key: 2, Value: analyteid },
                    { Key: 3, Value: $scope.currentfilter.type },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/analytemaster/GetAliasesmasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.analytetab.analytealiasesmaster', { aliasid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/analytemaster/DeleteAliasesmaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.analytetab.analytealiasesmaster', { aliasid: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Name);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "Code", displayName: $translate.instant('lis.analytealiasesmasters.code.lbl') },
                { field: "Name", displayName: $translate.instant('lis.analytealiasesmasters.name.lbl') },
                { field: "AliasesType.Description", displayName: $translate.instant('lis.analytealiasesmaster.type.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('lis.analytealiasesmasters.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ANALYTETYPE" },
                { "Key": "ALIASESTYPE" },
                { "Key": "ANALYTEREFTYPE" },
                { "Key": "ANALYTEUOM" },
                {
                    "Key": "SampleMaster",
                    Request: {
                        Params: [{ Key: 3, Value: 2 }]
                    }
                },
                { "Key": "AnalyteMaster" },
                { "Key": "ActiveStatus" }
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

    analytealiasesmastersListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();