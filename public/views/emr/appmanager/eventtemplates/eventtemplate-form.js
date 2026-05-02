(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('eventTemplateFormController', eventTemplateFormController);

function eventTemplateFormController($scope, $stateParams, $state, $translate, utl, $rootScope) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);
    $scope.templateButtonGroup = [
        {"displaytext": "Facility Name", "placeholder": "{{facilityName}}"},
        {"displaytext": "Patient Name", "placeholder": "{{patientName}}"},
        {"displaytext": "Patient MRN", "placeholder": "{{mrn}}"},
        {"displaytext": "First Name", "placeholder": "{{firstName}}"},
        {"displaytext": "Gender", "placeholder": "{{gender}}"},
        {"displaytext": "Age", "placeholder": "{{age}}"},
        {"displaytext": "Doctor Name", "placeholder": "{{doctorName}}"},
        {"displaytext": "Ref Doctor Name", "placeholder": "{{refDoctorName}}"},
        {"displaytext": "No Of Appointments", "placeholder": "{{noofappointments}}"},
        {"displaytext": "Display Date", "placeholder": "{{displaydate}}"},
        {"displaytext": "Display Time", "placeholder": "{{displaytime}}"},
        {"displaytext": "Display Ward", "placeholder": "{{displayward}}"},
        {"displaytext": "Display Bed", "placeholder": "{{displaybed}}"},
        {"displaytext": "Web Address", "placeholder": "{{webAddress}}"},
        {"displaytext": "Test Names", "placeholder": "{{testNames}}"}        
    ];
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'SystemSettings/EventTemplate/GetEventTemplateById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.eventtemplates');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        
        if (!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'SystemSettingsEventTemplate/AddEventTemplate';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'SystemSettingsEventTemplate/UpdateEventTemplate';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.save = function () {
        $scope.item.ActiveStatus = 'Draft'
        $scope.saveItem();
    };

    $scope.saveAndApprove = function () {
        $scope.item.ActiveStatus = 'Active'
        $scope.saveItem();
    };

    $scope.setPerName = function(selectedItem)
    {
        $scope.item.SentToPerson = selectedItem.Text;
    };

    $scope.setGrpName = function(selectedItem)
    {
        $scope.item.SentToGroup = selectedItem.GroupName;
    };

    $scope.bindPlaceHolder = function(selectedPlaceHolder) {
        var tmplContent = angular.element(document.getElementById('tmplcontent'));
        var domElement = tmplContent[0];
        var val = selectedPlaceHolder;
        if (document.selection) {
          domElement.focus();
          var sel = document.selection.createRange();
          sel.text = val;
          domElement.focus();
        } else if (domElement.selectionStart || domElement.selectionStart === 0) {
          var startPos = domElement.selectionStart;
          var endPos = domElement.selectionEnd;
          var scrollTop = domElement.scrollTop;
          domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
          domElement.focus();
          domElement.selectionStart = startPos + val.length;
          domElement.selectionEnd = startPos + val.length;
          domElement.scrollTop = scrollTop;
        } else {
          domElement.value += val;
          domElement.focus();
        }
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "Facility" },
                    { "Key": "EventType" },
                    { "Key": "User" },
                    { "Key": "Group" },
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

eventTemplateFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$rootScope'];

})();