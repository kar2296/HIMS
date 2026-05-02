(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('billingSettingFormController', billingSettingFormController);

    function billingSettingFormController($scope, $stateParams, $state, $translate, utl) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            FacilityId: $stateParams.id
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentcontext = {

        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActionFrom = utl.Formatter.getCurrentDate();
        //getUserProfilePic

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                $scope.item = data.Data[0];
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }]
                };

                var options = {
                    action: 'SystemSettings/BillingSetting/GetBillingSettings',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'SystemSettingsBillingSetting/AddBillingSetting';
            if ($scope.item.Id && $scope.item.Id > 0)
                actionName = 'SystemSettingsBillingSetting/UpdateBillingSetting';
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.numberonly = function (e, type) {
            var keycodes = [8, 9, 27, 13, 110, 190];
            if (type === 'dec')
                keycodes = [46, 8, 9, 27, 13, 110, 190];
            if ($.inArray(e.keyCode, keycodes) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {

                e.preventDefault();
            }
        }

        $scope.backToList = function () {
            $state.go('app.facilitytab.general', { id: $scope.currentcontext.id });
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
                {}
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

    billingSettingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();