(function () {
    'use strict';

    angular
        .module('common.utils')
        .controller('autoSearchCtrl', ['utl', '$scope', '$timeout', '$http', function (utl, $scope, $timeout, $http) {
            var cvm = this;

            cvm.autosearchdisplay = "";
            cvm.isrequired = false;

            $scope.$watch('cvm.itemid',
                function (newValue, oldValue) {
                    //console.log(newValue);
                    if (newValue && !cvm.itemchangebyuser) {
                        if (newValue >= 1) {
                            cvm.searchItem(newValue, true);
                        }
                    }
                });

            cvm.OnSelectItem = function ($item, $model, $label, $event) {
                cvm.itemchangebyuser = true;
                cvm.itemid = $item.Id;
                cvm.iteminfo = $item;

                $timeout(function () {
                    if (cvm.itemchange) {
                        cvm.itemchange();
                    }
                }, 100);
            };

            cvm.enter = function () { // Change Event For Undefined (specifically for get list filters).
                if (cvm.autosearchdisplay === undefined || cvm.autosearchdisplay.length === 0)
                    cvm.onenter(cvm.autosearchdisplay);
            };

            cvm.setItemInfo = function (item) {
                if (item) {
                    cvm.autosearchdisplay = item;
                    cvm.iteminfo = item;
                }
            };

            cvm.formatItem = function ($model) {
                cvm.config.selected = $model;
                cvm.config.rowdata = cvm.rowdata;
                return cvm.config.formatdisplay();
            };

            function searchItemCallback(res) {
                cvm.config.result = res.data.Data;
                cvm.config.postsearch();
                cvm.setItemInfo(utl.Common.getItemByProp(cvm.config.result, 'Id', cvm.itemid));
                return cvm.config.result;
            }

            cvm.searchItem = function (query, searchByItemId) {
                cvm.config.field = cvm.fieldname;
                cvm.config.query = query;
                cvm.config.searchbyid = searchByItemId;

                cvm.config.presearch();

                var canSearch = false;
                if (searchByItemId === true) {
                    canSearch = true;
                } else if (query && query.length > 2) {
                    canSearch = true;
                    cvm.itemid = null;
                }

                if (canSearch === true) {
                    return $http.post(window.appPath.apiroot + cvm.config.api, cvm.config.searchparams)
                        .then(searchItemCallback);
                }
                return null;
            };

            cvm.init = function () {
                //Init logic
            };

            //caution : base method, please don't modifiy
            cvm.$onInit = function () {
                $timeout(cvm.init, 100);
            };
        }])
        .component('autosearch', {
            bindings: {
                itemid: '=',
                iteminfo: '=',
                config: "=",
                candisable: "<",
                itemchange: '&',
                rowdata: "<",
                isrequired: "<",
                name: '<',
                tabindex: '<',
                onenter: '&',
                fieldname: '=',
                controlid: '=',
                placeholder: '<',
            },
            controller: 'autoSearchCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/autosearch.html'
        });
})();