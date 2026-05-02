(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dotmatrixController', dotmatrixController);

    function dotmatrixController($scope, $stateParams, $state, $translate, utl) {

        //var dmConfig = qz.configs.create("TVS MSP 240 Star");
        var dmConfig = null;
        var samplePrinterName = "TVS MSP 240 Star";

        function initCertificate() {
            qz.security.setCertificatePromise(function(resolve, reject) {
                $.ajax({ url: "vendor/qz/digital-certificate.txt", cache: false, dataType: "text" }).then(resolve, reject);
            });
        }

        $scope.printHtml = function (options) {
            var printData = [
                {
                    type: 'html',
                    format: 'plain',
                    data: options.data
                }
            ];

            qz.print(dmConfig, printData).catch(displayError);
        }

        $scope.printRaw = function (printData) {
            startConnection();
            qz.print(dmConfig, printData).catch(function (e) { console.error(e); });
        }


        function initPrinter() {
            if(!dmConfig) {
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
                qz.websocket.connect({ retries: 5, delay: 1 }).then(function () {
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

        initCertificate();
        startConnection();
    }

    dotmatrixController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();