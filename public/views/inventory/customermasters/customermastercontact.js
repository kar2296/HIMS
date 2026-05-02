(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('customermasterContactFormController', customermasterContactFormController);

    function customermasterContactFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            isDisabled: false,
            IsActive: true,
            ContactTypeId: 2,
            ActiveFrom: utl.Formatter.getCurrentDate(),
            CountryId: 1
        };

        $scope.currentcontext = {};
        $scope.currentcontext.customermasterid = parseInt($stateParams.id);
        $scope.currentcontext.id = parseInt($stateParams.customercontactid);
        $scope.item.CustomerCode = $state.params.CustomerCode;
        $scope.item.CustomerName = $state.params.CustomerName;

        var IsProfile = $state.params.IsProfile;
        var CustomerCode = $state.params.CustomerCode;
        var CustomerName = $state.params.CustomerName;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.ActiveStatusId == 2) {
                $scope.item.isDisabled = true;
            }
            if ($scope.item.ActiveStatusId == 3) {
                $scope.item.isDisabled = true;
            }
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/customermaster/GetCustomerContactById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.customermastertab.customermastercontacts');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.CustomerMasterId = $scope.currentcontext.customermasterid;
            var actionName = 'pharmacy/customermaster/AddCustomerContact';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/customermaster/UpdateCustomerContact';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.CustomerMaster = IsProfile ? $scope.lookup.CustomerMaster : $scope.lookup.CustomerMaster;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [{ "Key": "ContactType" }]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    customermasterContactFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();