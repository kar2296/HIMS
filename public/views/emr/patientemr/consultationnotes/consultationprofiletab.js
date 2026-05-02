(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('consultationtabController', consultationtabController);

function consultationtabController($scope, $stateParams, $state, utl, $translate) {
    
    var tabvm = this; 
    var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

    $scope.tabs = [
        {title : $translate.instant('patientemr.profileconsultationssummary.reviewnote.lbl'), state : 'patientemr.consuldationnotestab.consultationnotes', canDisable : false },
        {title : $translate.instant('patientemr.profileconsultationssummary.symptoms.lbl'), state : '', canDisable : canDisableTab},
        {title : $translate.instant('patientemr.profileconsultationssummary.hsi.lbl'), state : '', canDisable : canDisableTab},
        {title : $translate.instant('patientemr.profileconsultationssummary.vitals.lbl'), state : 'patientemr.consuldationnotestab.vitals', canDisable : canDisableTab},
        {title : $translate.instant('patientemr.profileconsultationssummary.ros.lbl'), state : '', canDisable : canDisableTab},
        {title : $translate.instant('patientemr.profileconsultationssummary.referrals.lbl'), state : '', canDisable : canDisableTab},
		{title : $translate.instant('patientemr.patientprescription-list.pagetitle.lbl'), state : 'patientemr.consuldationnotestab.prescription', canDisable : canDisableTab},
        {title : $translate.instant('patientemr.profileconsultationssummary.orders.lbl'), state : 'patientemr.consuldationnotestab.patientorder', canDisable : canDisableTab},
        
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
    

     $scope.patientprescriptions = function() {
        utl.Modal.open('patientemr.prescription', {
                    params: { id:0  },
                    confirmCallback: $scope.getList
                }
            );
    }
	
	
	 $scope.patientallergy = function() {
        utl.Modal.open('patientemr.patientallergies', {
                    params: { id:0 }
                }
            );
    }
	
	
	 $scope.patientconditions = function() {
        utl.Modal.open('patientemr.patientconditions', {
                    params: { id:0 }
                }
            );
    }
	
	 $scope.patientprocedure = function() {
        utl.Modal.open('patientemr.patientprocedure', {
                    params: { id:0 }
                }
            );
    }
	
	 $scope.patientmedications = function() {
        utl.Modal.open('patientemr.patientmedication', {
                    params: { id:0 }
                }
            );
    }
	
	$scope.patientsocialhistories = function() {
        utl.Modal.open('patientemr.patientsocialhistory', {
                    params: { id:0 }
                }
            );
    }
	
	$scope.patientfamilyconditions = function() {
        utl.Modal.open('patientemr.familyconditions', {
                    params: { id:0 }
                }
            );
    }
	
	$scope.patientfamilysocialhistory = function() {
        utl.Modal.open('patientemr.familysocialhistory', {
                    params: { id:0 }
                }
            );
    }
	
	$scope.patientimmunization = function() {
        utl.Modal.open('patientemr.patientimmunizations', {
                    params: { id:0 }
                }
            );
    }
	
	$scope.patientprocedure = function() {
        utl.Modal.open('patientemr.patientprocedures', {
                    params: { id:0 }
                }
            );
    }
	
	$scope.patientdocuments = function() {
        utl.Modal.open('patientemr.patientdocuments', {
                    params: { id:0 }
                }
            );
    }
	
	
	

    

}

consultationtabController.$inject = ['$scope', '$stateParams', '$state', 'utl', '$translate'];
})();