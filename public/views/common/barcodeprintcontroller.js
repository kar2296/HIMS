(function () {
    'use strict';

    /**
     * Shared print base controller, mixed into screens through
     * utl.Ctrl.getBarcodePrintCtrl() / utl.Ctrl.getDMPrintCtrl().
     *
     * QZ Tray (local print agent) has been removed from the project, so:
     *  - printHtml(options) prints server-generated HTML with the browser's print dialog
     *    (hidden, sandboxed iframe: the HTML's own scripts never run).
     *  - printRaw(printData) cannot work in a browser (raw EPL/ESC-P printer commands need a
     *    local agent). It is kept so existing callers do not break, and tells the user once.
     */
    angular
        .module('app.pages')
        .controller('barcodeprintcontroller', browserPrintController)
        .controller('dotmatrixController', browserPrintController);

    var rawPrintNoticeShown = false;

    function browserPrintController($scope, utl) {

        $scope.printHtml = function (options) {
            var html = options && options.data;
            if (typeof html !== 'string' || !html.trim()) {
                utl.Alert.showErrorMsg('Nothing to print.');
                return;
            }
            printInHiddenFrame(html);
        };

        $scope.printRaw = function () {
            if (!rawPrintNoticeShown) {
                rawPrintNoticeShown = true;
                utl.Alert.showInfoMsg('Direct label / dot-matrix printing is not available. Please use the Print or PDF option on this screen.');
            }
        };
    }

    function printInHiddenFrame(html) {
        var frame = document.createElement('iframe');
        frame.setAttribute('aria-hidden', 'true');
        frame.setAttribute('tabindex', '-1');
        // allow-same-origin: lets this page call print() on the frame; allow-modals: the print dialog.
        // No allow-scripts, so any script inside the printed HTML is not executed.
        frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
        frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

        frame.onload = function () {
            // Give images/fonts a moment to render before opening the dialog.
            setTimeout(function () {
                try {
                    frame.contentWindow.focus();
                    frame.contentWindow.print();
                } finally {
                    setTimeout(function () {
                        if (frame.parentNode) {
                            frame.parentNode.removeChild(frame);
                        }
                    }, 1000);
                }
            }, 250);
        };

        frame.srcdoc = html;
        document.body.appendChild(frame);
    }

    browserPrintController.$inject = ['$scope', 'utl'];

})();
