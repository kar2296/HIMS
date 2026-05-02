function landingStateController($scope, $stateParams, $state, $timeout) {
    this.$init($scope);

    $timeout(function() {
        $state.go('app.users');
    }, 500);
}

landingStateController.$inject = ['$scope', '$stateParams', '$state', '$timeout'];