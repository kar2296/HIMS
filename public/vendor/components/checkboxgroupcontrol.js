(function() {
    'use strict';

    angular
        .module('common.utils')
        .controller('checkboxgroupcontrolCtrl', ['utl', '$scope', '$timeout', function(utl, $scope, $timeout) {
            var cvm = this;
            cvm.rstitems  = [];
            cvm.currentcontext = {
                items: []
            };

            $scope.$watch('cvm.items',
                function(newValue) {
                    if (cvm.items) {
                        var list = [];
                        for (var idx in cvm.items) {
                            var item = cvm.items[idx];
                            var newItem = { Id: item.Id, Text: item.Text };
                            list.push(newItem);
                        }
                        cvm.currentcontext.items = list;
                        cvm.setButtonClass();
                    }
                });

            $scope.$watch('cvm.itemid',
                function(newValue) {
                    cvm.setButtonClass();
                    //var item = utl.Lookup.getObject(cvm.currentcontext.items, cvm.itemid);
                    //item.btnclass = "btn-success";
                });

            cvm.setButtonClass = function() {
                for (var idx in cvm.currentcontext.items) {
                    var item = cvm.currentcontext.items[idx];
                    if (cvm.itemid != "" && item.Id == cvm.itemid) {
                        item.btnclass = "btn-success";
                    } else {
                        item.btnclass = "btn-default";
                    }
                }
            };

            cvm.init = function() {
                //Init logic
            };

            //caution : base method, please don't modifiy
            cvm.$onInit = function() {
                $timeout(cvm.init, 100);
            };
        }])
        .component('checkboxgroupcontrol', {
            bindings: {
                itemid: "=",
                items: "=",
                rstitems:  "=",
                isdisabled: "="
            },
            controller: 'checkboxgroupcontrolCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/checkboxgroupcontrol.html'
        });

})();