(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingdispenseController', pendingdispenseController);

function pendingdispenseController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {
        PatientName : ''
    };

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.encounterid = parseInt(modalConfig.params.EncounterId);
            $scope.Patient = modalConfig.params.Encounter.Patient;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;
    $scope.emergencycontact =  {
    };


     vm.gridConfig = { 
        data : []
     };
    
    // $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

    $scope.confirmCallback = $uibModalInstance.close;
    $scope.cancelCallback = $uibModalInstance.dismiss;

    // $scope.item.PatientId = $scope.currentcontext.pid;
        
    //get patient profile
    $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
        $scope.currentcontext.Photo = data.Photo;
    };

    $scope.getPatientProfilePic = function () {
        if($scope.item.PhotoPath) {
            var inputData = { Id : $scope.item.Id, PhotoPath : $scope.item.PhotoPath };
            var options = {
                action: 'registration/Patient/GetPatientProfilePic',
                data: { Data : inputData },
                type: 'post',
                onComplete: $scope.getPatientProfilePicCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
        $scope.item.PatientName = '';

        $scope.item.PatientName = $scope.item.PatientName + $scope.item.FirstName;
        if($scope.item.LastName) {
            $scope.item.PatientName = $scope.item.PatientName + ' ' + $scope.item.LastName;
        }
        $scope.getPatientProfilePic();
        $scope.getGuarantorList();
        $scope.getPatientKinList();
        vm.gridConfig.data.push(tabledata);
    };

   $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

    //Emergency contact
    $scope.getPatientKinListCallback = function (scope, data, options, hasError) {
        if(data.length > 0) {
            $scope.emergencycontact = data[0];
        }
    };

    $scope.getPatientKinList = function () {

        var inputData = { 
            Params :[
             { Key: 2, Value: $scope.currentcontext.pid }
            ]
        };

        var options = {
            action: 'registration/PatientKin/GetPatientKins',
            data: inputData,
            type: 'post',
            onComplete: $scope.getPatientKinListCallback
        };

        utl.Http.doAction(options);
    };
    $scope.getGuarantorListCallback = function (scope, res, options, hasError) {
            vm.guarantorgridConfig.data = res.Data;
        };

        $scope.getGuarantorList = function () {

            var inputData = {
                Params: [
                    //{ Key: 1, Value: $scope.currentfilter.status },
                    { Key: 2, Value: $scope.item.Id }
                    //{ Key: 4, Value: $scope.currentfilter.guarantortype }
                ]
            };

            var options = {
                action: 'registration/PatientGuarantor/GetPatientGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGuarantorListCallback
            };

            utl.Http.doAction(options);
        };

    vm.gridConfig = {
		enableColumnResizing: true,
            columnDefs: [
                { field: "DoctorName", displayName: $translate.instant('registration.patientprofile.doctorname.lbl') },
                { field: "Department", displayName: $translate.instant('registration.patientprofile.department.lbl') },
                { field: "VisitStartTime", displayName: $translate.instant('registration.patientprofile.visitstarttime.lbl') },
                { field: "AttendedTime", displayName: $translate.instant('registration.patientprofile.attendedtime.lbl') },
                { field: "VisitCompletedTime", displayName: $translate.instant('registration.patientprofile.visitcompletedtime.lbl') },
                { field: "Rank", displayName: $translate.instant('registration.patientprofile.rank.lbl') },
                { field: "Status", displayName: $translate.instant('registration.patientprofile.status.lbl') },
            ],
        };

    vm.guarantorgridConfig = {
            columnDefs: [
                { field: "GuarantorType.Description", displayName: $translate.instant('registration.patientprofile.type.lbl') },
                { field: "GuarantorName", displayName: $translate.instant('registration.patientprofile.provider.lbl') },
                { field: "PolicyNo", displayName: $translate.instant('registration.patientprofile.policyno.lbl') },
                {
                    field: "EffectiveTo", displayName: $translate.instant('registration.patientprofile.expirydate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.EffectiveTo'></ngformatdate>"
                },
                { field: "GuardianType.Description", displayName: $translate.instant('registration.patientprofile.relationship.lbl') },
                { field: "Rank", displayName: $translate.instant('registration.patientprofile.guarantorrank.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('registration.patientprofile.status.lbl') },
            ],
        };

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        }
    }
     $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        
        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }
            
        var actionName = 'emr/patientallergy/AddPatientAllergy';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'emr/patientallergy/UpdatePatientAllergy';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    //setDefaults
    function setDefaults() {
        if($scope.item.AllergyId > 0) {
            var allergy = utl.Lookup.getObject($scope.lookup.Allergy, $scope.item.AllergyId);
            $scope.fillMasterInfo(allergy);
        }
    }

    //lookup
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        setDefaults();
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "Allergy" },
                    { "Key": "AllergyType" },
                    { "Key": "AllergySeverity" },
                    { "Key": "ADRScore" },
                    { "Key": "PatientAllergyStatus" }
                ];

        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    }

    $scope.fillMasterInfo = function(selectedItem)
    {
        $scope.item.AllergyTypeId = selectedItem.AllergyTypeId;
        $scope.item.AllergyName = selectedItem.AllergyName;
        $scope.item.Description = selectedItem.Description;
    }
    
    $scope.initLookup();
}

pendingdispenseController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();