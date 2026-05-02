(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ticksheetmastersListController', ticksheetmastersListController);

function ticksheetmastersListController($scope, $stateParams, $state, $translate, utl) {
     var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        name : '',
        codemnemonicsnamedesc: '',
        code : '',
        ActiveStatusId : -1,
        mnemonics : ''        
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
           vm.gridConfig.data = res.Data;
           vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

     $scope.getList = function () {

        var inputData = { 
            Params :[
               /* { Key: 1, Value: $scope.currentfilter.codemnemonicsnamedesc },*/
                { Key: 2, Value: $scope.currentfilter.ActiveStatusId} 
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'lis/ticksheetmaster/GetTicksheetmasters',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.ticksheetmaster', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'lis/ticksheetmaster/DeleteTicksheetmaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.ticksheetmaster', { id:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "TicksheetType.Description", displayName: $translate.instant('lis.ticksheetmasters.type.lbl') },
                        { field: "Ticksheetname", displayName: $translate.instant('lis.ticksheetmasters.ticksheetname.lbl') },
                        { field: "Department.DepartmentName", displayName: $translate.instant('lis.ticksheetmasters.deptname.lbl') },
                        { field: "SubDepartment.DepartmentName", displayName: $translate.instant('lis.ticksheetmasters.subdeptname.lbl') },
                        { field: "TestmasterId", displayName: $translate.instant('lis.ticksheetmasters.testdid.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('lis.ticksheetmasters.status.lbl') },
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

ticksheetmastersListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();