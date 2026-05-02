(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientGuarantorGLFormController', patientGuarantorGLFormController);

function patientGuarantorGLFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));
    
    $scope.item = {
        ActiveFrom:utl.Formatter.getCurrentDate()
    };

    $scope.currentcontext =  {};

    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = 0;
        $scope.currentcontext.patientguarantorid = parseInt(modalConfig.params.id);
        $scope.currentcontext.patientid = parseInt(modalConfig.params.pid);
        $scope.currentcontext.gname = modalConfig.params.gname;
        $scope.currentcontext.gtype = modalConfig.params.gtype;
        $scope.currentcontext.gtypeid = parseInt(modalConfig.params.gtypeid);
        $scope.currentcontext.gtypedes = modalConfig.params.gtypedes;
        $scope.currentcontext.gltrno = modalConfig.params.gltrno;
        $scope.currentcontext.gltrdate = modalConfig.params.gltrdate;
        $scope.SelectedPatient=modalConfig.params.patient;

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }    
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'registration/patientguarantorgl/GetPatientGuarantorGLById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $scope.confirmCallback();
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.item = {};
        $scope.getList();
    };

    $scope.item.PatientId = $scope.currentcontext.patientid;
    $scope.item.PatientGuarantorId = $scope.currentcontext.patientguarantorid;
    $scope.item.GuarantorName = $scope.currentcontext.gname;
    $scope.item.GuarantorTypeId = $scope.currentcontext.gtypeid;
    $scope.item.GuarantorLetterNo = $scope.currentcontext.gltrno;
    $scope.item.GuarantorLetterDate = $scope.currentcontext.gltrdate;
    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'registration/patientguarantorgl/AddPatientGuarantorGL';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'registration/patientguarantorgl/UpdatePatientGuarantorGL';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;        
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
              { Key: 1, Value: $scope.currentcontext.patientguarantorid },
              { Key: 2, Value: $scope.currentcontext.patientid }
            ],
        };

        var options = {
            action: 'registration/patientguarantorgl/GetPatientGuarantorGLs',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'registration/patientguarantorgl/DeletePatientGuarantorGL',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {        
        if(actionType == 'edit') {
            $scope.currentcontext.id = parseInt(row.entity.Id);
            $scope.getItem();
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.GLReferenceNumber);                   
        }
    }    

    vm.gridConfig = {
        columnDefs: [
                        { field: "GuarantorLetterNo", displayName: $translate.instant('registration.patientguarantorgl-list.glrefno.lbl') },
                        { field: "PatientGuarantor.GuarantorLetterDate", displayName: $translate.instant('registration.patientguarantorgl-list.gldate.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.PatientGuarantor.GuarantorLetterDate'></ngformatdate>" 
                        },
                        { field: "GLLimit", displayName: $translate.instant('registration.patientguarantorgl-list.limit.lbl') },
                        { field: "ConsumedLimit", displayName: $translate.instant('registration.patientguarantorgl-list.consumed.lbl') },
                        { field: "BalanceLimit", displayName: $translate.instant('registration.patientguarantorgl-list.balance.lbl') },
                        { field: "ActiveFrom", displayName: $translate.instant('registration.patientguarantorgl-list.activefrom.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.ActiveFrom'></ngformatdate>"
                        },
                        { field: "ActiveTo", displayName: $translate.instant('registration.patientguarantorgl-list.activeto.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.ActiveTo'></ngformatdate>" 
                        },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                         ]
                        }
                    ]
    };   
 $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getList
            });
        } 	

    /*$scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
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
    }*/
    
    //$scope.initLookup();
    $scope.getList();
}

patientGuarantorGLFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();