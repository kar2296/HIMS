(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnSectionBaseController', cnSectionBaseController);

    function cnSectionBaseController($scope, $stateParams, $state, $translate, utl, $rootScope) {

        var saveListener = $scope.$on('cn-section-save', function (event, args) {
            if($scope.$parent.cncontext.currentsection.sref == "emr.cn.reviewnotes" ||
            $scope.$parent.cncontext.currentsection.sref == "emr.cn.order" ||
            $scope.$parent.cncontext.currentsection.sref == "emr.cn.prescription" ||
            $scope.$parent.cncontext.currentsection.sref == "emr.cn.vital") {
                $scope.emitSaveCallback();
            }
            else if ($scope.$parent.cncontext.autosave == true && $scope.currentcontext.sectionid == $scope.$parent.cncontext.currentsection.sectionid) {
                $scope.saveItem();

                $scope.$parent.cncontext.autosave = false;
                saveListener();
            }
        });

        $scope.emitSaveCallback = function() {
            $rootScope.$broadcast('cn-section-save-callback');
        }

        $scope.saveItem = function() {
            $scope.emitSaveCallback();
        }

        $scope.getCurrentSectionId = function() {
            return $scope.$parent.cncontext.currentsection.sectionid;
        }
    }

    cnSectionBaseController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$rootScope'];

})();