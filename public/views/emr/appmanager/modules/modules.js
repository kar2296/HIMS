(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('moduleListController', moduleListController);

function moduleListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.Items = [];
     $scope.currentfilter= {
        modulename : '',
        modulecode : '',
        ActiveStatusId : 2
    };
    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
              Params :[
             { Key: 1, Value: $scope.currentfilter.modulename },
             { Key: 2, Value: $scope.currentfilter.modulecode },
             { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'SystemSettings/module/GetModules',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.module', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'SystemSettings/module/DeleteModule',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }    

    $scope.handleEvents = function(actionType, row) {
        
            if(actionType == 'edit') {
                $state.go('app.module', { id:row.entity.Id });
            }
            else if(actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.ModuleName);         
            }
            else if(actionType == "viewscreenaction"){
                $state.go('app.screens', { moduleId:row.entity.Id });
            }
    }
    
    vm.gridConfig = {
            enableColumnResizing: true,
    columnDefs: [
                    { field: "ModuleCode", displayName: $translate.instant('appmanager.modules.code.lbl') },
                    { field: "ModuleName", displayName: $translate.instant('appmanager.modules.modulename.lbl') },
                    { field: "DisplayOrder", displayName: $translate.instant('appmanager.modules.displayorder.lbl') },
                    { field: "ActiveStatus.Description", displayName: $translate.instant('appmanager.modules.status.lbl') },
                    { field: "URL", displayName: $translate.instant('appmanager.modules.url.lbl') },                    
                    { field: "ViewName", displayName: $translate.instant('appmanager.modules.viewname.lbl') },
                    { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'},
                                            {actiontype: 'viewscreenaction', display : 'appmanager.modules.viewscreensaction.lbl'},
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

moduleListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();