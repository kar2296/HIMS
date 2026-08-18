(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('barcodeSettingController', barcodeSettingController);

    function barcodeSettingController($scope, $state, utl) {
        var vm = this;
        vm.title = 'Barcode Master Configuration';
        vm.reactProps = {};
    }

    barcodeSettingController.$inject = ['$scope', '$state', 'utl'];
})();
