(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('tickSheetListController', tickSheetListController);

function tickSheetListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        Name : "",
        DepartmentId : -1,
        TickSheetTypeId : -1,
        ActiveStatusId :2
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentfilter.Name },
                { Key: 2, Value: $scope.currentfilter.DepartmentId },
                { Key: 3, Value: $scope.currentfilter.TickSheetTypeId },
                { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'clinicalmaster/TickSheet/GetTickSheets',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.ticksheet', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/TickSheet/DeleteTickSheet',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.ticksheet', { id:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id,row.entity.TickSheetType.Description);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "TickSheetType.Description", displayName: $translate.instant('clinicalmaster.ticksheet-list.type.lbl') },
                        { field: "TickSheetName", displayName: $translate.instant('clinicalmaster.ticksheet-list.name.lbl') },
                        { field: "ParentDepartment.DepartmentName", displayName: $translate.instant('clinicalmaster.ticksheet-list.department.lbl') },
                        // { field: "SubDepartment.DepartmentName", displayName: $translate.instant('clinicalmaster.ticksheet-list.subdepartment.lbl') },
                        { field: "ItemName", displayName: $translate.instant('clinicalmaster.ticksheet-list.itemid.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.ticksheet-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                        cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                      </div>',
           handleEvent: $scope.handleEvents,
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
                            { "Key": "Department" },
                            { "Key": "TickSheetType" },
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

tickSheetListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();