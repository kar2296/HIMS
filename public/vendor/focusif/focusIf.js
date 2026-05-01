(function() {
    'use strict';
    angular
        .module('focus-if', [])
        .directive('focusIf', focusIf);

    focusIf.$inject = ['$timeout'];

    function focusIf($timeout) {
        function link($scope, $element, $attrs) {
            var dom = $element[0];
            if ($attrs.focusIf) {
                $scope.$watch($attrs.focusIf, focus);
            } else {
                focus(true);
            }
            function focus(condition) {
                if (condition) {
                    $timeout(function() {
                        if(dom.nodeName=="AUTOSEARCH") {
                            //console.log('autosearch');
                            dom.children[2].children[0].focus()
                        }
                        if(dom.className && dom.className.indexOf("ui-select-container") > -1) {
                            console.log(dom);
                        // get the ui select controller
                        var strId = '#'+dom.id;
                        var uiSelect = angular.element(strId).controller('uiSelect');

                        // focus the focusser, putting focus onto select but without opening the dropdown
                        uiSelect.focusser[0].focus();

                        // Open the select without focusing the search box.  I use this on mobile to
                        // prevent keyboard from popping up automatically when clicking into the box
                        //uiSelect.open = true;

                        // Open the select and focus:
                            uiSelect.activate();
                        }else {
                            dom.focus();
                        }
                    }, $scope.$eval($attrs.focusDelay) || 1000);
                }
            }
        }
        return {
            restrict: 'A',
            link: link
        };
    }
})();
