(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('frequencyMasterListController', frequencyMasterListController);

function frequencyMasterListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        Name : "",
        FacilityId : utl.Session.getCurrentFacilityId(),
        FrequencyTypeId : -1,
        ActiveStatusId : 2
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentfilter.Name },
                { Key: 2, Value: $scope.currentfilter.FacilityId },
                { Key: 3, Value: $scope.currentfilter.FrequencyTypeId },
                { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'clinicalmaster/FrequencyMaster/GetFrequencyMasters',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.frequencytab.details', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/FrequencyMaster/DeleteFrequencyMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.frequencytab.details', { id:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id,row.entity.Name);
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Facility.FacilityName", displayName: $translate.instant('clinicalmaster.frequency-list.facility.lbl') },
                        { field: "Code", displayName: $translate.instant('clinicalmaster.frequency-list.code.lbl') },
                        { field: "Name", displayName: $translate.instant('clinicalmaster.frequency-list.name.lbl') },
                        { field: "FrequencyType.Description", displayName: $translate.instant('clinicalmaster.frequency-list.type.lbl') },
                        { field: "FrequencySIGCode.Description", displayName: $translate.instant('clinicalmaster.frequency-list.sigcode.lbl') },
                        { field: "NoOfTimes", displayName: $translate.instant('clinicalmaster.frequency-list.nooftimes.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.frequency-list.status.lbl') },
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

frequencyMasterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();