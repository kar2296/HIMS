(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('displayboardsController', displayboardsController);
    function displayboardsController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.addNew = function (Id) {
            utl.Modal.open('app.displayboardfilter', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }
    }
    displayboardsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();