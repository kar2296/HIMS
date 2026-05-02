(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('myprofileController', myprofileController);

    function myprofileController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        // $scope.item = {}
        $scope.myprofile = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.uid = utl.Session.getCurrentUserId();
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.myprofile = res.Data;
            $scope.getUserProfilePic();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.uid },
                ],
            };

            var options = {
                action: 'SystemSettings/User/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getUserProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data;
        };

        $scope.getUserProfilePic = function () {
            if ($scope.myprofile[0].PhotoPath) {
                var inputData = { PhotoPath: $scope.myprofile[0].PhotoPath };
                var options = {
                    action: 'SystemSettings/User/GetUserProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getUserProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        function loadData() {
            $scope.getList();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "OrderStatus" }
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
        loadData();
    }

    myprofileController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();