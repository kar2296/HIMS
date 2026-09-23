(function () {
    'use strict';

    /**
     * Shared print base controllers, mixed into screens through
     * utl.Ctrl.getBarcodePrintCtrl() (barcode labels) and utl.Ctrl.getDMPrintCtrl() (dot-matrix).
     *
     * Printing goes through window.HimsPrint (src/printing/qzPrinter.ts, QZ Tray 2.3):
     *  - printRaw(printData)  raw EPL / ESC-P commands straight to the local printer
     *  - printHtml(options)   HTML via QZ Tray, or the browser print dialog when QZ Tray is not running
     * QZ Tray is contacted only when something is printed.
     */
    angular
        .module('app.pages')
        .controller('barcodeprintcontroller', createPrintController('barcode'))
        .controller('dotmatrixController', createPrintController('dotmatrix'));

    function createPrintController(kind) {

        function printController($scope, utl) {

            $scope.printRaw = function (printData) {
                run(function (printer) {
                    return printer.printRaw(printData, { kind: kind });
                });
            };

            $scope.printHtml = function (options) {
                run(function (printer) {
                    return printer.printHtml(options && options.data, { kind: kind });
                });
            };

            function run(job) {
                var printer = window.HimsPrint;
                if (!printer) {
                    utl.Alert.showErrorMsg('Printing is not ready yet. Please reload the page and try again.');
                    return;
                }
                job(printer).catch(function (err) {
                    console.error('Print failed', err);
                    utl.Alert.showErrorMsg((err && err.message) || 'Printing failed.');
                });
            }
        }

        printController.$inject = ['$scope', 'utl'];
        return printController;
    }

})();
