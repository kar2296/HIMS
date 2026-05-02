
(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('screenListController', screenListController);

function screenListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        name : ''
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {
        if($stateParams && $stateParams.moduleId){
            $scope.moduleId =  $stateParams.moduleId;
        }

        var inputData = { 
            Params :[
             /* { Key: 'Name', Value: $scope.gridConfig.search ? $scope.gridConfig.search.text : "" }*/
             {Key: 2, Value: $scope.moduleId}
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'SystemSettings/screen/GetScreens',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.screen', { id:0, moduleId: $scope.moduleId });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'SystemSettings/screen/DeleteScreen',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }    

    $scope.handleEvents = function(actionType, row) {
        
            if(actionType == 'edit') {
                $state.go('app.screen', { id:row.entity.Id, moduleId: $scope.moduleId });
            }
            else if(actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.ScreenName);         
            }
    }

    vm.gridConfig = {
            enableColumnResizing: true,
        columnDefs: [
                        { field: "ScreenCode", displayName: $translate.instant('appmanager.screens.code.lbl') },
                        { field: "ScreenName", displayName: $translate.instant('appmanager.screens.viewname.lbl') },
                        { field: "GroupName", displayName: $translate.instant('appmanager.screens.groupname.lbl') },
                        { field: "URL", displayName: $translate.instant('appmanager.screens.url.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                         ]
                        }
                    ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }                    
    };

    $scope.getList();
}

screenListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();