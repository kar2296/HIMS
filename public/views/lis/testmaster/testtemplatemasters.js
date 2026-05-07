(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testTemplateMastersFormController', testTemplateMastersFormController);

    function testTemplateMastersFormController($scope, $stateParams, $state, $translate, utl) {
        
        $scope.onMaleDataChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.MaleDataTemplate = html;
            });
        };
        $scope.onFemaleDataChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.FemaleDataTemplate = html;
            });
        };
        $scope.onChildDataChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.ChildDataTemplate = html;
            });
        };
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true
        };

        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.id }
                ],
                PageContext: {
                    PageSize: 0,
                    PageNumber: 100
                }
            };

            var options = {
                action: 'lis/testmaster/GetTestmasterTemplates',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.testmastertab.testmaster');
        }
        $scope.back = function () {
            $state.go('app.testmasters');
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //$scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.TestmasterId = $scope.currentcontext.id;
            var actionName = 'lis/testmaster/AddTestmasterTemplate';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'lis/testmaster/UpdateTestmasterTemplate';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getList();
    }

    testTemplateMastersFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();