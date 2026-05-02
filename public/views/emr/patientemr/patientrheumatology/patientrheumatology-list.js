(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientRheumatologyListController', patientRheumatologyListController);

function patientRheumatologyListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
    $scope.Items = [];
    $scope.currentfilter= {
        name : ''
    };

    //below session value is used for rheumatology
    utl.Session.set('patient-rheumatology-id',  0);
    utl.Session.set('consultation-id',  0);

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
             /* { Key: 1, Value: $scope.currentfilter.name ? $scope.currentfilter.name : "" } */
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'emr/PatientRheumatology/GetPatientRheumatologys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        utl.Session.set('patient-rheumatology-id', 0);
        $state.go('patientemr.patientrheumatology');
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'emr/PatientRheumatology/DeletePatientRheumatology',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            utl.Session.set('patient-rheumatology-id',row.entity.Id);
            $state.go('patientemr.patientrheumatology');            
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Name", displayName: $translate.instant('patientemr.patientrheumatology-list.name.lbl') },
                        { field: "PerformedDate", displayName: $translate.instant('patientemr.patientrheumatology-list.date.lbl') },
                        { field: "PerformedBy", displayName: $translate.instant('patientemr.patientrheumatology-list.capturedby.lbl') },
                        { field: "RheumatologyStatus.Description", displayName: $translate.instant('patientemr.patientrheumatology-list.status.lbl') },
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

patientRheumatologyListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();