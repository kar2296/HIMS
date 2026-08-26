(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('privilegecardFormController', privilegecardFormController);

    function privilegecardFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        // $scope.currentcontext = {
        //     ismodal: modalConfig && modalConfig.params ? true : false
        // };

        // $scope.currentcontext.Id = modalConfig.params.id;

        // if (modalConfig && modalConfig.params) {
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }

        $scope.item = {
            IsActive: true,
            IsIndividual: true,
            IsHolder: true,
            SchemeTypeId: 1,
            IssueDate: utl.Formatter.getCurrentDate(),
            ExpiryDate: new Date().setFullYear(new Date().getFullYear() + 1),
            PromotionSchemeId: 1,
            OrganizationId: 1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.getPramotionalScheme = function () {
            var inputData = {
                Params: [{ Key: 0, Value: $scope.currentcontext.Id }]
            };

            var options = {
                action: 'billing/PrivilegeCard/GetPrivilegeCards',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPramotionalSchemeCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPramotionalSchemeCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.refreshReactProps();
        };

        $scope.backToList = function () {
            $state.go('app.privilegecardlist');
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            var actionName = 'billing/PrivilegeCard/AddPrivilegeCard';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'billing/PrivilegeCard/UpdatePrivilegeCard';
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
            $scope.refreshReactProps();
            if ($scope.currentcontext.Id > 0) {
                $scope.getPramotionalScheme();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PromotionScheme" },
                { "Key": "SchemeType", "Default": false }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: $scope.item,
                lookup: $scope.lookup || {}
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'cardTypeChange':
                    $scope.item.CardTypeId = payload.value;
                    break;
                case 'validToChange':
                    $scope.item.ValidTo = payload.value;
                    break;
                case 'cardNoChange':
                    $scope.item.CardNo = payload.value;
                    break;
                case 'mobileNoChange':
                    $scope.item.MobileNo = payload.value;
                    break;
            }
            $scope.refreshReactProps();
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    privilegecardFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();