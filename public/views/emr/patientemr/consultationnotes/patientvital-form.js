(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientVitalsFormController', patientVitalsFormController);

function patientVitalsFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, uibButtonConfig) {
    var vm = this;
    
    uibButtonConfig.activeClass="opt-selected";
    
    $scope.item = {
        PatientVitalStatusId : 1,
        PerformedDate : utl.Formatter.getCurrentDate(),
        PerformedBy : -1,
        VitalValue : ''
    };

    
    if(utl.Session.getUserTypeId() == 2) // 2=> Physician
    {
        $scope.item.PerformedBy = utl.Session.getCurrentUserId();
    }    

    $scope.vitals = [];
    $scope.panelvitals = [];
    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false,
        vitalid : -1,
        panelmasterid : -1,
        selectedPanel : {},
        selectedVital : {},
        selectedMenu : 'form'
    };
    
    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        if(modalConfig.params.context) {
            $scope.currentcontext.selectedMenu = modalConfig.params.context;
        }

        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    } else {
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
    }

    $scope.item.PatientId = $scope.currentcontext.pid;
    
    $scope.topmenus = [
            { key : 'form', name : $translate.instant('patientemr.patientvital-form.form-menu.lbl')},
            { key : 'chart', name : $translate.instant('patientemr.patientvital-form.chart-menu.lbl')}
    ];

    //Visibility Rules starts

    $scope.canShowFormArea = function() {
        return $scope.currentcontext.selectedMenu =='form';
    }

    $scope.canShowChartArea = function() {
        return $scope.currentcontext.selectedMenu=='chart';
    }

    //Visibility Rules ends

    $scope.changeperformeddate = function() {
        for(var idx in $scope.vitals)
            $scope.vitals[idx].PerformedDate = $scope.item.PerformedDate;
    };

    $scope.changeperformedby = function() {
        for(var idx in $scope.vitals)
            $scope.vitals[idx].PerformedBy = $scope.item.PerformedBy;
    } ;

    $scope.panelChange = function(item) {
        $scope.currentcontext.selectedPanel = item;
    };

    $scope.vitalChange = function(item) {
        $scope.currentcontext.selectedVital = item;
    };

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.addvital = function(vital){
        if($scope.checkExisting(vital)) {
            var item = { PatientId : $scope.currentcontext.pid, VitalId : vital.Id, Description : vital.Description,
                                VitalName : vital.VitalName, VitalValue : $scope.item.VitalValue, VitalValue1 :'',VitalValue2 :'', VitalValueTypeId : vital.VitalValueTypeId, 
                                UOM : vital.UOM, LoincCode : vital.LoincCode, Mnemonic : vital.Mnemonic, GraphTypeId : vital.GraphTypeId,
                                ValueFormat : vital.ValueFormat, ReferenceRangeFrom : vital.ReferenceRangeFrom, ReferenceRangeTo : vital.ReferenceRangeTo,
                                PerformedDate : $scope.item.PerformedDate, PerformedBy : $scope.item.PerformedBy,PatientVitalStatusId :1, Status : 1
                            };
                $scope.vitals.push(item);
        }
    }
    $scope.addvitalClick = function() {
        var vital = $scope.currentcontext.selectedVital;
        $scope.addvital(vital);
    }

    $scope.addpanelClick = function() {
        var panelMasterDetails = $scope.currentcontext.selectedPanel.PanelMasterDetails;
        for(var idx in panelMasterDetails) {
            var vital = utl.Lookup.getObject($scope.lookup.Vital, panelMasterDetails[idx].ItemId);
            $scope.addvital(vital);
        }
    }

    $scope.checkExisting = function(vital) {
        for(var idx in $scope.vitals) {
            if(vital.Id == $scope.vitals[idx].VitalId)
                return false;
        }
        return true
    }

    $scope.IsBMI = function(item) {
        if(item.Description.toLowerCase()=='bmi')
            return true;
        return false;
    }
    $scope.IsHeight = function(item) {
        if(item.Description.toLowerCase()=='height')
            return true;
        return false;
    }
    $scope.IsBP = function(item) {
        if(item.Description.toLowerCase()=='blood pressure')
            return true;
        return false;
    }

    $scope.CalculateBMI = function() {
        var height = {};
        var weight = {};
        var bmi = {};
        for(var idx in $scope.vitals) {
            var vital = $scope.vitals[idx];
            switch(vital.VitalId) {
                case 1:
                    height = vital;
                    height.VitalValue = vital.VitalValue1 + "." + vital.VitalValue2;
                    break;
                case 2:
                    weight = vital;
                    break;
                case 5:
                    bmi = vital;
                    break;
                default:
                    break;
            }
        }
        if(height.VitalValue &&  weight.VitalValue) {
            bmi.VitalValue = ((weight.VitalValue/(height.VitalValue * height.VitalValue * 144)) * 703).toFixed(2);
        }

    }

    $scope.getPanelsCallback = function (scope, res, options, hasError) {
        if(!res || !res.Data || res.Data.length == 0) {
            getPanelsByAdmin();
        } else {
            afterGet(res);
        }
    };

    $scope.getPanels = function () {
        var inputData = { 
            Params :[
                { Key: 3, Value: 3 },
                { Key: 5, Value: utl.Session.getCurrentUserId() }
            ],
            PageContext:{
                PageSize: 100,
                PageNumber: 1
            }
        };

        var options = {
            action: 'clinicalmaster/PanelMaster/GetPanelMasters',
            data: inputData,
            type: 'post',
            onComplete: $scope.getPanelsCallback
        };
            utl.Http.doAction(options);
    };

    $scope.getPanelsByAdminCallback = function (scope, res, options, hasError) {
        afterGet(res);
    };

    function getPanelsByAdmin() {
        var inputData = { 
            Params :[
                { Key: 3, Value: 3 },
                { Key: 6, Value: true } //AdminFav - true
            ],
            PageContext:{
                PageSize: 100,
                PageNumber: 1
            }
        };

        var options = {
            action: 'clinicalmaster/PanelMaster/GetPanelMasters',
            data: inputData,
            type: 'post',
            onComplete: $scope.getPanelsByAdminCallback
        };
            utl.Http.doAction(options);
    };

    function afterGet(res) {
        for(var idx in res.Data) {
             var panel = res.Data[idx]; 
             var item = {Id : panel.Id, Text : panel.Name, PanelMasterDetails : panel.PanelMasterDetails};
             $scope.panelvitals.push(item);
        }
        $scope.lookup.PanelMaster = $scope.panelvitals; 
        //Set first value as default
        if($scope.panelvitals.length > 0)
        {
            $scope.currentcontext.panelmasterid = $scope.panelvitals[0].Id;
            $scope.currentcontext.selectedPanel = $scope.panelvitals[0];
            $scope.addpanelClick();
        }
    }

    $scope.deleteVital = function(indx) {
        $scope.vitals.splice(indx,1);
    }

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'emr/patientvital/GetPatientVitalById',
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
            $state.go('patientemr.patientvitals', {pid : $scope.currentcontext.pid});
        }
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        
        var options = {
            action: 'emr/patientvital/ManagePatientVitals',
            data: {Data : $scope.vitals },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);

        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }
            
        // var actionName = 'emr/patientvital/AddPatientVital';
        // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //     actionName = 'emr/patientvital/UpdatePatientVital';
        // }
      
        // var options = {
        //     action: actionName,
        //     data: {Data : $scope.item },
        //     type: 'post',
        //     onComplete: $scope.saveItemCallback
        // };
        // utl.Http.doAction(options);
    };

    $scope.saveVitals = function() {
        for(var idx in $scope.vitals) {
            var vital = $scope.vitals[idx];
            switch(vital.VitalId) {
                case 1:
                    $scope.vitals[idx].VitalValue = vital.VitalValue1 + "~" + vital.VitalValue2;
                    break;
                case 8:
                    $scope.vitals[idx].VitalValue = vital.VitalValue1 + "~" + vital.VitalValue2;
                    break;
                default:
                    break;
            }
        }
        $scope.saveItem();
    }

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getPanels();
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [
                            { "Key" : "Vital" },
                            { "Key" : "User" },
                            { "Key" : "PatientVitalStatus" },
                ];

        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    }
    
    $scope.fillMasterInfo = function(selectedItem) {        
        $scope.item.VitalName = selectedItem.VitalName;
        $scope.item.UOM = selectedItem.UOM;
        $scope.item.GraphTypeId = selectedItem.GraphTypeId;
        $scope.item.VitalValueTypeId = selectedItem.VitalValueTypeId;
        $scope.item.LoincCode = selectedItem.LoincCode;
        $scope.item.Description = selectedItem.Description; 
        $scope.item.ReferrenceLink = selectedItem.ReferrenceLink; 
        $scope.item.ValueFormat = selectedItem.ValueFormat; 
        $scope.item.ReferenceRangeFrom = selectedItem.ReferenceRangeFrom; 
        $scope.item.ReferenceRangeTo = selectedItem.ReferenceRangeTo; 
        $scope.item.Mnemonic = selectedItem.Mnemonic;               
    }

    $scope.initLookup();
}

patientVitalsFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'uibButtonConfig'];

})();