(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('smssettingFormController', smssettingFormController);

    function smssettingFormController($scope, $stateParams, $state, $translate, utl) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentcontext = {
            file: null
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActionFrom = utl.Formatter.getCurrentDate();
        //getUserProfilePic

      



        
        $scope.backToList = function () {
            $state.go('');
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
          
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { }
            ]
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

    smssettingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();