(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('QMSPatientDisplayController', QMSPatientDisplayController);

    function QMSPatientDisplayController($scope, $stateParams, $translate, $interval, utl, modalConfig, $filter, $cookies, $state) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        $scope.ListofTokens = [];
        $scope.TokenDisplay = [];
        $scope.CurrentPage = 1;
        $scope.PageInitialzation = 1;
        $scope.totalrecord = -1;
        $scope.MissedDisplay = '';
        $scope.FacilityName = '';
        $scope.startinterval = null;
        $scope.currentcontext.CurrentDate = utl.Formatter.getCurrentDate();
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
        }

        $scope.logoutCallback = function (scope, res, options, hasError) {
            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k, { path: '/' });
            });

            $state.go('page.login');
        };

        $scope.logout = function () {
            clearInterval(refreshIntervalId);
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.TokenDisplay = res.Data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 11, Value: 0 },
                    { Key: 12, Value: 1 }
                ],

                PageContext: {
                    PageSize: -1,
                    PageNumber: -1
                }
            };
            var StartFromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            var StartToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            if (StartFromDate && StartToDate)
                    inputData.Params.push({ Key: 8, Value: [StartFromDate, StartToDate] });
            var options = {
                action: 'Registration/QMS/GetQMS',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        var refreshIntervalId = setInterval($scope.getList, 10000);

    }
    QMSPatientDisplayController.$inject = ['$scope', '$stateParams', '$translate', '$interval', 'utl', 'modalConfig', '$filter', '$cookies', '$state'];
})();