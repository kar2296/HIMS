(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorgstFormController', guarantorgstFormController);

    function guarantorgstFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.item = {};
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();


        $scope.currentcontext = {};
        $scope.currentcontext.guarantorid = parseInt($stateParams.gid);
        $scope.currentcontext.id = 0;
        $scope.fillDefaultValues = function() {

        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            if (data.length > 0) {
                $sope.item = data[0];
            } else if ($scope.item) {
                $scope.currentcontext.id = $scope.item.Id;
            }
        };

        $scope.gstRegister = function() {
            if (!$scope.item.IsGSTRegistered) {
                $scope.clear();
            }

        }
        $scope.getItem = function(pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.guarantorid }
                ]

            };

            var options = {
                action: 'generalmaster/guarantorgst/GetGuarantorGSTs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function() {
            $state.go('app.guarantors');
        }
        $scope.back = function() {
            $state.go('app.guarantortab.general');
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));

        };

        $scope.saveItem = function() {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'generalmaster/guarantorgst/AddGuarantorGST';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/guarantorgst/UpdateGuarantorGST';
            }

            $scope.item.GuarantorId = $scope.currentcontext.guarantorid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.clear = function() {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        /*$scope.initLookup = function () {
            var inputData = [ 
                    ];
    
            var options = {
                action: '',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);        
        }    
        $scope.initLookup();*/
        $scope.getItem();
    }

    guarantorgstFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();