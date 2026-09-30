(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('groupFormController', groupFormController);

    function groupFormController($scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id) || 0;

        $scope.item = {
            IsActive: true,
            IsAllFacility: false
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                groupId: $scope.currentcontext.id,
                item: $scope.item
            };
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (!hasError && data) {
                $scope.item = data;
            }
            $scope.refreshReactProps();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'SystemSettings/group/GetGroupById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.refreshReactProps();
            }
        };

        $scope.backToList = function () {
            $state.go('app.groups');
        };

        $scope.handleReactAction = function (actionName, payload) {
            $timeout(function () {
                if (actionName === 'backToList') {
                    $scope.backToList();
                } else if (actionName === 'saveComplete') {
                    if (payload && payload.id) {
                        $state.go('app.grouptab.general', { id: payload.id });
                    } else {
                        $scope.backToList();
                    }
                }
            });
        };

        $scope.getItem();
    }

    groupFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();