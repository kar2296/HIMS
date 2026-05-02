(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientOrderFormaoeController', patientOrderFormaoeController);

function patientOrderFormaoeController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
    $scope.currentfilter= {
        name : ''
    };
    $scope.addNewFull = function() {
        $state.go('app.fullregistrationtab.basic', { id:0 });
    }
    
    $scope.currentcontext =  {};
    $scope.currentcontext.patientid = parseInt($stateParams.id);

    $scope.getListCallback = function (scope, data, options, hasError) {
        vm.gridConfig.data = data;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 2, Value: $scope.currentcontext.patientid} 
            ],
            PageContext:{
                PageSize: 25,
                PageNumber: 1
            }
        };

        var options = {
            action: 'registration/PatientIdentity/GetPatientIdentitys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.fullregistrationtab.patientidentity', { patientidentityid:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'registration/PatientIdentity/DeletePatientIdentity',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.fullregistrationtab.patientidentity', { patientidentityid:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "PatientIdentityType.Description", displayName: $translate.instant('registration.patientidentity-list.type.lbl') },
                        { field: "IDNumber", displayName: $translate.instant('registration.patientidentity-list.idnumber.lbl') },
                        { field: "Comments", displayName: $translate.instant('registration.patientidentity-list.comments.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                         ]
                        }
                    ]
    };
    
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }
    
     $scope.print = function() {
        utl.Modal.open('app.appointmentprint', {
                params: { id:0 },
                confirmCallback: $scope.getList
        });
    }

    $scope.initLookup = function () {
        var inputData = [ 
                            { "Key": "PatientIdentityType" }
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

patientOrderFormaoeController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();