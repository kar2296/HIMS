(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('tickSheetFormController', tickSheetFormController);

function tickSheetFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

    $scope.item = {
        IsActive : true
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);
    $scope.selectediteminfo = {
        Id : 0, Text : ''
    };
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/TickSheet/GetTickSheetById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.ticksheets');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };
    $scope.clear = function (){
    $scope.item = {};
    }
    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'clinicalmaster/TickSheet/AddTickSheet';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/TickSheet/UpdateTickSheet';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.itemselected = function() {        
        $scope.item.ItemId = $scope.selectediteminfo.Id;
        $scope.item.ItemName = $scope.selectediteminfo.Text;        
    }

    $scope.mastertypechanged = function(selected) {
        $scope.item.TickSheetMasterTypeName = selected.Text;
    }

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "TickSheetType" },
                   { Key: 'Department' , 
                        Request:{
                            Params:[{ Key:5,Value:2}]
                            
                        }},
                   { Key: 'SubDepartment' , 
                        Request:{
                            Params:[{ Key:5,Value:2}]
                            
                        }},
                    { "Key": "TickSheetMasterType" },
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

tickSheetFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();