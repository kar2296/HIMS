(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cssdsetupController', cssdsetupController);

    function cssdsetupController($scope, $stateParams, $state, $translate, utl, ) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id)



        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/CssdItemSetUp/GetCssdItemSetUpById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $state.go('app.cssditems', { id: 0 });
        }
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            }
            else if (typeof (data) == "number") {
                $state.go('app.cssditemtab.details', { id: data, IsProfile: null, TestName: options.data.Data.Code + ' - ' + options.data.Data.Name, TestCode: options.data.Data.Name, });
            }
            else {
                $scope.backToList(); // Safer side added
            }
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/CssdItemSetUp/AddCssdItemSetUp';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/CssdItemSetUp/UpdateCssdItemSetUp';
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
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "Facility" },
                { "Key": "Speciality" },
                { "Key": "AssessmentType" },
                { "Key": "StoreMaster" },
                { "Key": "CSSDType" },
                { "Key": "UsageType" },
                { "Key": "WashingType" },
                { "Key": "packingType" }
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

    cssdsetupController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();