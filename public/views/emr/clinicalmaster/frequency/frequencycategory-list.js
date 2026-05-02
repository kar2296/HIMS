(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('frequencyCategoryListController', frequencyCategoryListController);

function frequencyCategoryListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        name : ''
    };
    $scope.currentcontext =  {};
    $scope.currentcontext.frequencyid = parseInt($stateParams.id);

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
             { Key: 2, Value: $scope.currentcontext.frequencyid} 
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'clinicalmaster/FrequencyCategory/GetFrequencyCategorys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        utl.Modal.open('app.frequencytab.frequencycategory', {
                    params: { id:0, frequencyid: $scope.currentcontext.frequencyid },
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
                action: 'clinicalmaster/FrequencyCategory/DeleteFrequencyCategory',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            utl.Modal.open('app.frequencytab.frequencycategory', {
                    params: { id:row.entity.Id, frequencyid: $scope.currentcontext.frequencyid },
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
                        { field: "ClinicalFrequencyCategory.Description", displayName: $translate.instant('clinicalmaster.frequencycategory-list.category.lbl') },
                        { field: "ActiveFrom", displayName: $translate.instant('clinicalmaster.frequencycategory-list.activefrom.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.ActiveFrom'></ngformatdate>"  }, 
                        { field: "ActiveTo", displayName: $translate.instant('clinicalmaster.frequencycategory-list.activeto.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.ActiveTo'></ngformatdate>"  },
                        //{ field: "StatusTODO", displayName: $translate.instant('clinicalmaster.frequencycategory-list.status.lbl') },
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
                            { "Key": "Facility" },
                            { "Key": "FrequencyType" },
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

frequencyCategoryListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();