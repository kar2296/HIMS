(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('barcodeprintcontroller', barcodeprintcontroller);

    function barcodeprintcontroller($scope, $stateParams, $state, $translate, utl) {

        //var dmConfig = qz.configs.create("TVS MSP 240 Star");
        var dmConfig = null;
        var retrycount = 0;
        var samplePrinterName = "ZDesigner GC420t (EPL) (Copy 1)";

        $scope.printHtml = function (options) {
            var printData = [{
                type: 'html',
                format: 'plain',
                data: options.data
            }];

            qz.print(dmConfig, printData).catch(displayError);
        }

        $scope.printRaw = function (printData) {
            retrycount = parseInt(printData.retries);
            startConnection();
            qz.print(dmConfig, printData).catch(function (e) {
                console.error(e);
            });
        }


        function initPrinter() {
            if (!dmConfig) {
                qz.printers.getDefault().then(function (data) {
                    var printerName = data ? data : samplePrinterName;
                    dmConfig = qz.configs.create(printerName);
                    console.log(dmConfig);
                }).catch(handleGetDefaultException);
            }
        }


        function handleGetDefaultException(data) {
            console.log('No default printer found!');
            console.log(data);

            dmConfig = qz.configs.create(samplePrinterName);
            console.log(dmConfig);
        }


        function startConnection() {
            if (!qz.websocket.isActive()) {
                qz.websocket.connect({
                    retries: retrycount,
                    delay: 1
                }).then(function () {
                    console.log('connection success');
                    initPrinter();
                }).catch(handleConnectionError);
            } else {
                initPrinter();
            }
        }

        function endConnection() {
            if (qz.websocket.isActive()) {
                qz.websocket.disconnect().then(function () {
                    //
                }).catch(handleConnectionError);
            }
        }

        function handleConnectionError(exp) {
            //Handle exception
            console.log(exp);
        }

        function displayError(data) {
            console.log(data);
        }

        startConnection();
    }

    barcodeprintcontroller.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();