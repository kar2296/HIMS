(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('alertsController', alertsController);

function alertsController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    $scope.items = [];
    $scope.currentcontext =  {};
    $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
   
    $scope.toggleCanShowDetails = function(clickedItem) {
        for(var idx in $scope.items) {
            var item = $scope.items[idx];
            if(item.Id == clickedItem.Id) {
                item.CanShowDetails = !item.CanShowDetails;
            } else {
                item.CanShowDetails = false;
            }
        }
    }

    $scope.getListCallback = function (scope, res, options, hasError) {
        $scope.items = res.Data;
        
        for(var idx in $scope.items) {
            var item = $scope.items[idx];
            if(idx == 0) {
                item.CanShowDetails = true;
            } else {
                item.CanShowDetails = false;
            }
        }

    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 2, Value: $scope.currentcontext.pid }
            ],
            PageContext:{
                PageSize: 100,
                PageNumber: 1
            }
        };

        var options = {
            action: 'emr/prescription/GetPrescriptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

     $scope.handleEvents = function(actionType, row) {
    }
    
    $scope.getList();
}

alertsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();