(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('allergySectionController', allergySectionController);

function allergySectionController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.currentfilter= {        
        showFilterTab: false,
        PatientAllergyStatusId : 1
    };

    $scope.currentcontext =  {
        paneltype : utl.Session.get('dashboard-panel-type')
    };
        
    $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };
    $scope.openFilterTab = function() {
        if ($scope.currentfilter.showFilterTab === true) {
            $scope.currentfilter.showFilterTab = false;
        } else {
            $scope.currentfilter.showFilterTab = true;
        }
    }
    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'emr/patientallergy/DeletePatientAllergy',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, item) {
        
        if(actionType == 'edit') {
            utl.Modal.open('patientemr.patientallergy', {
                    params: { id:item.Id , pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
            );
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);                   
        } 
        else if(actionType == 'list') {
            $state.go('patientemr.patientallergies');
        }
        else if(actionType == 'settings') {
            //TODO
        }
        else if(actionType == "add"){
            utl.Modal.open('patientemr.patientallergy', {
                    params: { id:0 , pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
            );            
        }
    }

    //get list
    $scope.getListCallback = function (scope, res, options, hasError) {
        $scope.items = res.Data;
    };
    $scope.getList = function () {

        var inputData = { 
            Params :[ { Key: 2, Value: $scope.currentcontext.pid }, 
                      { Key : 3, Value : -1},
                      { Key: 4, Value: $scope.currentfilter.PatientAllergyStatusId } ],
            PageContext:{ PageSize: 25, PageNumber: 1 }
        };

        var options = {
            action: 'emr/patientallergy/GetPatientAllergys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    $scope.getList();
}

allergySectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();