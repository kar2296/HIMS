(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('controlFormController', controlFormController);

function controlFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.item = {
        
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'SystemSettings/Control/GetControlById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.controls');
    }
$scope.addNew = function () {
            $state.go('app.control', { id: 0 });
        }
    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };
    $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveAndApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }
var check=[];
      $scope.getcheckbox=function( ischecked,value){
          if(ischecked) {
              check.push(value)

          }
          else{
              check.pop(value)
          }
          $scope.item.Context=check.join(',');
      }

    $scope.saveItem = function () {
        
        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }
            
        var actionName = 'SystemSettings/Control/AddControl';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'SystemSettings/Control/UpdateControl';
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
        var inputData = [ { Key: "Control"},
        { Key: "ActiveStatus"}
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

controlFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();