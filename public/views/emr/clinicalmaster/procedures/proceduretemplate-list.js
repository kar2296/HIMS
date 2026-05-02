(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureTemplateListController', procedureTemplateListController);

function procedureTemplateListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        name : ''
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.procedureid = parseInt($stateParams.id);
    $scope.backToForm = function () {
            $state.go('app.proceduretab.details');
        }
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
            action: 'clinicalmaster/ProcedureTemplate/GetProcedureTemplates',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.proceduretab.proceduretemplate', { proceduretemplateid:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/ProcedureTemplate/DeleteProcedureTemplate',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.proceduretab.proceduretemplate', { proceduretemplateid:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "ProcedureTemplateType.Description", displayName: $translate.instant('clinicalmaster.proceduretemplate-list.type.lbl') },
                        { field: "ProcedureTemplateGroup.Description", displayName: $translate.instant('clinicalmaster.proceduretemplate-list.groupname.lbl') },
                        { field: "ProcedureTemplateCategory.Description", displayName: $translate.instant('clinicalmaster.proceduretemplate-list.category.lbl') },
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

procedureTemplateListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();