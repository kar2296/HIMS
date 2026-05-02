(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugFrequencyListController', drugFrequencyListController);

    function drugFrequencyListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Name: "",
            FacilityId: utl.Session.getCurrentFacilityId(),
            DrugFrequencyTypeId: -1,
            ActiveStatusId: 2
        };
        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.DrugFrequencyTypeId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/DrugFrequency/GetDrugFrequencys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.drugfrequencytab.details', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/DrugFrequency/DeleteDrugFrequency',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.drugfrequencytab.details', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('clinicalmaster.drugfrequency-list.facility.lbl') },
                { field: "Code", displayName: $translate.instant('clinicalmaster.drugfrequency-list.code.lbl') },
                { field: "Name", displayName: $translate.instant('clinicalmaster.drugfrequency-list.name.lbl') },
                { field: "DrugFrequencyType.Description", displayName: $translate.instant('clinicalmaster.drugfrequency-list.type.lbl') },
                { field: "DrugFrequencySIGCode.Description", displayName: $translate.instant('clinicalmaster.drugfrequency-list.sigcode.lbl') },
                { field: "NoOfTimes", displayName: $translate.instant('clinicalmaster.drugfrequency-list.nooftimes.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.drugfrequency-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
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
                { "Key": "Facility" },
                { "Key": "DrugFrequencyType" },
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

    drugFrequencyListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();