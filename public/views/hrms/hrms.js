(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('HrmsController', HrmsController);

    function HrmsController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            UserId: utl.Session.getCurrentUserId()

        };

        $scope.currentcontext = {};
        $scope.items = {};
        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = parseInt(modalConfig.params.id);
        //     $scope.currentcontext.assetid = parseInt($stateParams.id);
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }
        $scope.urlBind = '';
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = res.Data;
            $scope.item.UserName = $scope.items[0].UserName;
            var username = $scope.item.UserName;
            // src="http://localhost:3000/#/page/login?user={{item.UserName}}&secret=442A472D4B6150645367566B59703373367639792442264529482B4D62516554";
            // var urlBind = 'http://localhost:3000/#/page/login?user=' + username + '&secret=442A472D4B6150645367566B59703373367639792442264529482B4D62516554';
            var url = 'http://103.120.177.6:2015/#/page/login?user=' + username + '&secret=442A472D4B6150645367566B59703373367639792442264529482B4D62516554';
            $scope.urlBind = $scope.transform(url);
            console.log(url);

        };
        $scope.transform = function (url) {
            document.getElementById('hrmlink').src = url;
            return url;
        }


        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.UserId
                }
                ],
            };

            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [];
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

    HrmsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();