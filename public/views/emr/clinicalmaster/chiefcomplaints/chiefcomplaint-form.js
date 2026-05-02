(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('chiefComplaintFormController', chiefComplaintFormController);

function chiefComplaintFormController($scope, $stateParams, $state, $translate, utl,$uibModalInstance, modalConfig) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   
    
    $scope.item = {
        IsActive : true
    };
    $scope.currentcontext =  {};
if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/chiefcomplaint/GetChiefComplaintById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };
$scope.save= function () {
    $scope.item.ActiveStatusId = 1;
    $scope.saveItem();
}
$scope.saveAndApprove= function () {
    if($scope.item.IsActive == true)
    {$scope.item.ActiveStatusId = 2;}
     else 
     {$scope.item.ActiveStatusId = 3}
     $scope.saveItem();
}
    $scope.backToList = function () {
                 $scope.confirmCallback();
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.clear = function() {
            $scope.item = {};
        }
          $scope.addNew = function() {
        $state.go('app.chiefcomplaint', { id:0 });
    }


    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'clinicalmaster/chiefcomplaint/AddChiefComplaint';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/chiefcomplaint/UpdateChiefComplaint';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "ChiefComplaintCategory" },
                    { "Key": "BodySite" }
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

chiefComplaintFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();