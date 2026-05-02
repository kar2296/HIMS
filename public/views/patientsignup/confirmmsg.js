(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ConfirmRegController', ConfirmRegController);

    function ConfirmRegController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $cookies) {
        var vm = this;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.PatInfo = modalConfig.params.patData;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //logout
        $scope.logoutCallback = function (scope, res, options, hasError) {
            $scope.confirmCallback();
            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k, {
                    path: '/'
                });
            });
            $state.go('page.login');
        };
        $scope.logout = function () {
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };
            utl.Http.doAction(options);
        };

    }

    ConfirmRegController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$cookies'];

})();