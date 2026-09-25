(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('diagnosisListController', diagnosisListController);

    function diagnosisListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DiagnosisName: '',
            DiagnosisCodeSchemeId: -1,
            Code: '',
            DiagnosisVersionId: -1,
            ActiveStatusId: 2
        };
        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DiagnosisName },
                    { Key: 2, Value: $scope.currentfilter.DiagnosisCodeSchemeId },
                    { Key: 3, Value: $scope.currentfilter.Code },
                    { Key: 4, Value: $scope.currentfilter.DiagnosisVersionId },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'clinicalmaster/diagnosis/GetDiagnosiss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.diagnosisform', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/diagnosis/DeleteDiagnosis',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit') {
                $state.go('app.diagnosisform', { id: entity.Id });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DiagnosisName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('clinicalmaster.diagnosis-list.code.lbl') },
                { field: "DiagnosisName", displayName: $translate.instant('clinicalmaster.diagnosis-list.name.lbl') },
                { field: "LengthOfStay", displayName: $translate.instant('clinicalmaster.diagnosis-list.lengthofstay.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.diagnosis-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DiagnosisCodeScheme" },
                { "Key": "DiagnosisVersion" },
                { "Key": "ActiveStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.totalItems) || 0,
                currentPage: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.currentPage) || 1,
                pageSize: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.pageSize) || 25,
                filters: {
                    DiagnosisName: $scope.currentfilter.DiagnosisName,
                    DiagnosisCodeSchemeId: $scope.currentfilter.DiagnosisCodeSchemeId,
                    Code: $scope.currentfilter.Code,
                    DiagnosisVersionId: $scope.currentfilter.DiagnosisVersionId,
                    ActiveStatusId: $scope.currentfilter.ActiveStatusId
                },
                lookup: {
                    DiagnosisCodeScheme: ($scope.lookup && $scope.lookup.DiagnosisCodeScheme) || [],
                    DiagnosisVersion: ($scope.lookup && $scope.lookup.DiagnosisVersion) || [],
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || []
                }
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.Code = payload && payload.code !== undefined ? payload.code : (payload && payload.value);
                $scope.currentfilter.DiagnosisName = payload && payload.name !== undefined ? payload.name : '';
                $scope.getList();
            } else if (actionName === 'codeSchemeChange') {
                $scope.currentfilter.DiagnosisCodeSchemeId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'statusFilterChange') {
                $scope.currentfilter.ActiveStatusId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    diagnosisListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();