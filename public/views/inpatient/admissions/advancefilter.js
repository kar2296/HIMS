(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('advancefilterFormController', advancefilterFormController);

    function advancefilterFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.mlcid);
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'IPManagement/advancefilter/GetAdvanceFilterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                // utl.Http.doAction(options);
            }
        };

        $scope.currentfilter = {

            registereddate: utl.Formatter.getCurrentDate()
        };
        $scope.backToList = function () {
            $state.go('app.admissions');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'IPManagement/advancefilter/AddAdvanceFilter';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/advancefilter/UpdateAdvanceFilter';
            }

            $scope.item.PatientId = $scope.currentcontext.patientid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            //utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }
        $scope.currentfilter = {

            registereddate: utl.Formatter.getCurrentDate()
        };


        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Reason" },
                { "Key": "ReferralType" },
                { "Key": "BedCategory" },
                { "Key": "MarketingPerson" },
                { "Key": "Priority" },
                { "Key": "Diagnosis" },
                { "Key": "CareProvider" },
                { "Key": "RequestType" },
                { "Key": "YesNo", Default: false }

            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            // utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    advancefilterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();