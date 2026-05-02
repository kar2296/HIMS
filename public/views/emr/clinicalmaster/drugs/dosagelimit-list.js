(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('dosageLimitListController', dosageLimitListController);

function dosageLimitListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        name : ''
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.drugid = parseInt($stateParams.id);

    $scope.getListCallback = function (scope, data, options, hasError) {
        vm.gridConfig.data = data;
    };

    $scope.getList = function (pageNo) {

        var inputData = { 
            Params :[
                { Key: 2, Value: $scope.currentcontext.drugid } 
            ],
            PageContext:{
                PageSize: 25,
                PageNumber: 1
            }
        };

        var options = {
            action: 'clinicalmaster/DosageLimit/GetDosageLimits',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
//  13-02-17
        $scope.item = {};
        $scope.backToForm = function () {
            $state.go('app.drugtab.details');
        }
//  13-02-17
    //Grid Actions
    $scope.addNew = function() {
        utl.Modal.open('app.drugtab.dosagelimit', {
                    params: { dosagelimitid:0, id: $scope.currentcontext.drugid },
                    confirmCallback: $scope.getList
                }
            );
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/DosageLimit/DeleteDosageLimit',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            utl.Modal.open('app.drugtab.dosagelimit', {
                    params: { dosagelimitid:row.entity.Id, id: $scope.currentcontext.drugid },
                    confirmCallback: $scope.getList
                }
            );
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Gender.Description", displayName: $translate.instant('clinicalmaster.dosagelimit-list.gender.lbl') },
                        { field: "DrugAgeGroup.Description", displayName: $translate.instant('clinicalmaster.dosagelimit-list.agegroup.lbl') },
                        { field: "UpperLimit", displayName: $translate.instant('clinicalmaster.dosagelimit-list.upperlimit.lbl') },
                        { field: "LowerLimit", displayName: $translate.instant('clinicalmaster.dosagelimit-list.lowerlimit.lbl') },
                        { field: "MaximumDosagePerDay", displayName: $translate.instant('clinicalmaster.dosagelimit-list.maxdosageperday.lbl') },
                        { field: "BodyWeight", displayName: $translate.instant('clinicalmaster.dosagelimit-list.weight.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                         ]
                        }
                    ]
    };
    
    $scope.initLookup = function () {
        $scope.lookup = {};
        $scope.getList();
    }
    
    $scope.initLookup();
}

dosageLimitListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();