(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analytealiasesMasterFormController', analytealiasesMasterFormController);

    function analytealiasesMasterFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true
        };

        $scope.currentcontext = {};
        $scope.currentcontext.analyteid = parseInt($stateParams.id);
        $scope.currentcontext.id = parseInt($stateParams.aliasid);
        //console.log($scope.currentcontext.analyteid+"-"+ $scope.currentcontext.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/analytemaster/GetAliasesmasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.analytetab.analytealiasesmasters');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.AnalyteId = $scope.currentcontext.analyteid;
            //console.log("item analyteidd "+ $scope.item.AnalyteId+" stateParams.id "+ $stateParams.id);
            var actionName = 'lis/analytemaster/AddAliasesmaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/analytemaster/UpdateAliasesmaster';
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
            if ($scope.item.Activefrom == null)
                $scope.item.Activefrom = new Date();
        }

        $scope.initLookup = function () {
            var inputData =
                [
                    { "Key": "ANALYTETYPE" },
                    { "Key": "ALIASESTYPE" },
                    { "Key": "ANALYTEREFTYPE" },
                    { "Key": "ANALYTEUOM" },
                    {
                        "Key": "SampleMaster",
                        Request: {
                            Params: [{ Key: 3, Value: 2 }]
                        }
                    },
                    { "Key": "AnalyteMaster" },
                    { "Key": "GRAPHTYPE" }
                ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        }

        $scope.initLookup();
    }

    analytealiasesMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();