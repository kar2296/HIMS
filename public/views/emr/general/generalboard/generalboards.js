(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('generalboardsController', generalboardsController);
    function generalboardsController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.addNew = function (Id) {
            utl.Modal.open('app.generalboardfilter', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }
    }
    generalboardsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();