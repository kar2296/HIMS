(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('allergyReactionListController', allergyReactionListController);

function allergyReactionListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        AllergyReactionName : "",
        AllergyReactionTypeId : -1,
        ActiveStatusId : 2
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentfilter.AllergyReactionName },
                { Key: 2, Value: $scope.currentfilter.AllergyReactionTypeId },
                { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
            PageSize: vm.gridConfig.pagerObj.pageSize,
            PageNumber: vm.gridConfig.pagerObj.currentPage
        }
        };

        var options = {
            action: 'clinicalmaster/AllergyReaction/GetAllergyReactions',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
$scope.openModal = function (Id) {
            utl.Modal.open('app.allergyreaction', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
    //Grid Actions
$scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/AllergyReaction/DeleteAllergyReaction',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, entity) {
        
        if(actionType == 'edit') {
           $scope.openModal(entity.Id);
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AllergyReactionName);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "DisplayId", displayName: $translate.instant('clinicalmaster.allergyreaction-list.displayid.lbl') },
                        { field: "AllergyReactionName", displayName: $translate.instant('clinicalmaster.allergyreaction-list.allergyreaction.lbl') },
                        { field: "AllergyReactionType.Description", displayName: $translate.instant('clinicalmaster.allergyreaction-list.type.lbl') },
                        { field: "Description", displayName: $translate.instant('clinicalmaster.allergyreaction-list.description.lbl') },
                        { field: "ReferrenceLink", displayName: $translate.instant('clinicalmaster.allergyreaction-list.referrencelink.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.allergyreaction-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                        cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        </div>',
                   
                   actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
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
            { "Key": "AllergyReactionType" },
            { "Key": "ActiveStatus" }
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

allergyReactionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();