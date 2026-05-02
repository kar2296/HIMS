(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientorderformtabController', patientorderformtabController);

function patientorderformtabController($scope, $stateParams, $state, utl, $translate) {
    
    var tabvm = this; 
    var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
    angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));

    $scope.tabs = [
        {title : $translate.instant('patientemr.patientordertabcontrols.patientordernew.lbl'), state : 'patientemr.patientorderformtab.new', canDisable : true },
        {title : $translate.instant('patientemr.patientordertabcontrols.ticksheet.lbl'), state : 'patientemr.patientorderformtab.ticksheet', canDisable : canDisableTab},
        {title : $translate.instant('patientemr.patientordertabcontrols.aoe.lbl'), state : 'patientemr.patientorderformtab.aoe', canDisable : canDisableTab}
    ];
    
    tabvm.currentcontext = {
        patientid : 0
    };

     $scope.openattachments = function() {
        if($scope.item.PatientId > 0) {
            utl.Modal.open('app.patientattachments', {
                    params: { pid:$scope.item.PatientId, itemid : $scope.item.Id },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
            });
        } else {
            utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
        }
    }

    $scope.switchTab = function(tab) {
        $state.go(tab.state);    
    }

      $scope.addNew = function()
    {
        utl.Modal.open('patientemr.patientorderdetail', {
                    params: { id:0 , pid: $scope.currentcontext.pid },
                   confirmCallback: $scope.onDetailSave
                }
            );
    }

   $scope.previousorders = function() {
    $state.go('patientemr.patientorders', {pid : $scope.currentcontext.pid});
       
    }
    

    $scope.patientallergy = function() {
        utl.Modal.open('patientemr.patientallergies', {
                    params: { pid : $scope.currentcontext.pid }
                }
            );
    }

    $scope.vital = function() {
        utl.Modal.open('patientemr.patientvitals', {
                    params: { pid : $scope.currentcontext.pid }
                }
            );
    }
    $scope.addNewOrder = function () {
        if ($scope.currentcontext.encounter.IsBillLock == false) {
            $state.go('patientemr.patientorder', {
                id: 0, pid: $scope.currentcontext.pid, testtype: $scope.currentfilter.TestTypeId,
                context: $scope.currentcontext.context
            });
        } else
            utl.Alert.showErrorMsg(" Bill is Locked");
    }

}

patientorderformtabController.$inject = ['$scope', '$stateParams', '$state', 'utl', '$translate'];
})();