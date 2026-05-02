(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('familyConditionFormController', familyConditionFormController);

function familyConditionFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {
         ConditionDate : utl.Formatter.getCurrentDate(),
         EncounterId : utl.Session.getEncounterId(),
         ConditionStatusId : 1
    };
    angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

     if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
		$scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
		
        if(modalConfig.params.itemid) {
            $scope.item.DiagnosisId = parseInt(modalConfig.params.itemid);
        }
        
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    } else {
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
    }

    $scope.item.PatientId = $scope.currentcontext.pid;

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'emr/familycondition/GetFamilyConditionById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        } else {
            $state.go('patientemr.familyconditions', {pid : $scope.currentcontext.pid} );
        }
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
            
        var actionName = 'emr/familycondition/AddFamilyCondition';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'emr/familycondition/UpdateFamilyCondition';
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
        if($scope.item.DiagnosisId > 0) {
            var condition = utl.Lookup.getObject($scope.lookup.Diagnosis, $scope.item.DiagnosisId);
            $scope.fillMasterInfo(condition);
        }
    }
        //autosearch related code starts for Diagnosis 
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DiagnosisName', field: 'DiagnosisName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Version', field: 'Version', datatype: 'string', headercls: 'td-Version', fieldcls: 'td-Version' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-Speciality', fieldcls: 'td-Speciality' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };
        function formatselecteddiagnosis() {
            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }
        function presearchdiagnosis() {

            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {

            for (var idx in vm.diagnosiscontrolconfig.result) {

                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                item.Version = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        // autosearch related code ends for Diagnosis  
        $scope.getDiagnosis = function () {
            $scope.Diagnosis = $scope.item.selectedItem;
            $scope.item.Description = $scope.Diagnosis.Description;
            $scope.item.Code = $scope.Diagnosis.Code;
            $scope.item.DiagnosisName = $scope.Diagnosis.DiagnosisName;
        };
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        setDefaults();
        $scope.getItem();
    }

    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "Diagnosis" },
                    { "Key": "ConditionType" },
                    { "Key": "ConditionStatus" },
                    { "Key": "Relationship" }
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
        $scope.item.Code = selectedItem.Code;
        $scope.item.DiagnosisName = selectedItem.DiagnosisName;
        $scope.item.Description = selectedItem.Description;
    }
    
    $scope.initLookup();
}

familyConditionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();