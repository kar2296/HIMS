(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureAliasListController', procedureAliasListController);

function procedureAliasListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        name : ''
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.procedureid = parseInt($stateParams.id);
// 13-02-17
        $scope.backToForm = function () {
            $state.go('app.proceduretab.details');
        }
// 13-02-17
    $scope.getListCallback = function (scope, data, options, hasError) {
        vm.gridConfig.data = data;
    };

    $scope.getList = function (pageNo) {

        var inputData = { 
            Params :[
              { Key: 2, Value: $scope.currentcontext.procedureid }
            ],
            PageContext:{
                PageSize: 25,
                PageNumber: 1
            }
        };

        var options = {
            action: 'clinicalmaster/ProcedureAlias/GetProcedureAliass',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.proceduretab.procedurealias', { procedurealiasid:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/ProcedureAlias/DeleteProcedureAlias',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.proceduretab.procedurealias', {procedurealiasid:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Code", displayName: $translate.instant('clinicalmaster.procedurealias-list.aliascode.lbl') },
                        { field: "AliasName", displayName: $translate.instant('clinicalmaster.procedurealias-list.aliasname.lbl') },
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

procedureAliasListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();