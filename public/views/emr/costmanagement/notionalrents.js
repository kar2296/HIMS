(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('notionalrentListController', notionalrentListController);

    function notionalrentListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
			 FacilityId:  utl.Session.getCurrentFacilityId(),
    
		};
        $scope.currentcontext = {};
         $scope.currentcontext.costdetailid = parseInt($stateParams.id);
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                         { Key: 1, Value: $scope.currentcontext.costdetailid },
                    ]
                };
                var options = {
                    action: 'CostManagement/NotionalRent/GetNotionalRentById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        // $scope.backToList = function () {
        //     $scope.confirmCallback();
        // }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.backToForm = function () {
            $state.go('app.costtab.details');
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'CostManagement/NotionalRent/AddNotionalRent';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'CostManagement/NotionalRent/UpdateNotionalRent';
            }
            $scope.item.CostDetailId = $scope.currentcontext.costdetailid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.computeAmount = function (item) {
            item.TotalNotionalRent = item.SurfaceArea * item.NotionalRent;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "WarrantyType" },
                { "Key": "ActiveStatus" }
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
    notionalrentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();