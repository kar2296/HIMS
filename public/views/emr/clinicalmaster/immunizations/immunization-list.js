(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('immunizationListController', immunizationListController);

function immunizationListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
        $scope.currentfilter = {
            ImmunizationName: "",
            ImmunizationFrequencyId: -1,
            ActiveStatusId: 2,
            ConditionId: -1
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

    $scope.getList = function () {

        var inputData = { 
                Params: [
                    { Key: 1, Value: $scope.currentfilter.ImmunizationName },
                    { Key: 4, Value: $scope.currentfilter.ConditionId },
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 3, Value: $scope.currentfilter.ImmunizationFrequencyId }
                ],
                PageContext: {
            PageSize: vm.gridConfig.pagerObj.pageSize,
            PageNumber: vm.gridConfig.pagerObj.currentPage
        }
        };

        var options = {
            action: 'clinicalmaster/Immunization/GetImmunizations',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
 $scope.openModal = function (Id) {
            utl.Modal.open('app.immunizations', {
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
    //     $state.go('app.immunization', { id:0 });
    // }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/Immunization/DeleteImmunization',
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
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ImmunizationName);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "ImmunizationName", displayName: $translate.instant('clinicalmaster.immunization-list.immunizationname.lbl') },
                        // { field: "Description", displayName: $translate.instant('clinicalmaster.immunization-list.description.lbl') },
                        { field: "Frequency.Description", displayName: $translate.instant('clinicalmaster.immunization-list.frequency.lbl') },
                        // { field: "ReferrenceLink", displayName: $translate.instant('clinicalmaster.immunization-list.referrencelink.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.immunization-list.status.lbl') },
                        {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
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
                { "Key": "ActiveStatus" },
                 { "Key": "Condition" },
                 { "Key": "Frequency" }
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

immunizationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();