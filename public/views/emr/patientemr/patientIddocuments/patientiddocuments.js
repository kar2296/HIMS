(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientIddocumentsController', PatientIddocumentsController);

    function PatientIddocumentsController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.items = data;
            for (var idx in vm.items)
                if (vm.items[idx].ImagePath) {
                    var image = vm.items[idx];
                    $scope.getPatientId(image);
                }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/PatientIdentity/GetPatientIdentitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientIdCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientId = function (image) {
            if (image.ImagePath) {
                var inputData = { Id: image.Id, ImagePath: image.ImagePath };
                var options = {
                    action: 'registration/PatientIdentity/GetPatientIdDocs',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.clear = function () {
            $scope.item = {};
        }

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

    PatientIddocumentsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();