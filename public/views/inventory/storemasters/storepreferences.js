(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StoreMasterPreferencesController', StoreMasterPreferencesController);

    function StoreMasterPreferencesController($scope, $stateParams, $state, $translate, utl, jsonPath) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {
            Category: ''
        };

        $scope.CategoryDisplayMap = {
            print: 'Print',
            dmprint: 'DM Print',
        };

        $scope.PreferenceLookupMap = {
            defaultcurrency: 'CurrencyCode',
            dateformat: 'DateFormat',
            timeformat: 'TimeFormat',
            profile: 'Profile'
        };

        $scope.preferences = {};

        $scope.modeldata = {};
        $scope.schema = {};
        $scope.categories = [];
        $scope.item = {}
        $scope.currentcontext.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.item.StoreMasterId = parseInt($stateParams.id);

        $scope.backToList = function () {
            $state.go('app.storemastertab.storemaster');
        }

        $scope.categoryClick = function (cat) {
            $scope.getList();
        }

        function computeDynamicForm(resp) {
            var schema = {
                layout: 'grid',
            };

            var controls = [];
            var categoryArr = [];
            var prefData = {};

            for (var idx in resp) {
                var item = resp[idx];
                if (item.PreferenceType) {
                    var control = { category: item.Category, key: item.PreferenceKey, type: item.PreferenceType, text: item.PreferenceDisplay, model: item.PreferenceKey, position: { r: item.Row, c: item.Col } };
                    var prefValue = item.PreferenceValue;
                    if (item.PreferenceType == 'select') {
                        var lookupKey = $scope.PreferenceLookupMap[item.PreferenceKey];
                        control.options = $scope.lookup[lookupKey];
                    }
                    else if (item.PreferenceType == 'checkbox') {
                        prefValue = prefValue == "1" ? true : false;
                    }
                    prefData[item.PreferenceKey] = prefValue;

                    if (categoryArr.indexOf(item.Category) == -1) {
                        categoryArr.push(item.Category);
                    }
                    if (item.Section) {
                        var controlsArr = { "Controls": controls };
                        var sectionControlArr = jsonPath(controlsArr, '$..Controls[?(@.key=="' + item.Section + '")]');
                        if (sectionControlArr && sectionControlArr.length > 0) {
                            var sectionControl = sectionControlArr[0];
                            if (!sectionControl.controls) {
                                sectionControl.controls = [];
                            }
                            sectionControl.controls.push(control);
                        }
                    } else {
                        controls.push(control);
                    }
                }
            }

            $scope.currentcontext.Category = $scope.currentcontext.Category ? $scope.currentcontext.Category : "print";
            var controlsArr1 = { "Controls": controls };
            schema.controls = jsonPath(controlsArr1, '$..Controls[?(@.category=="' + $scope.currentcontext.Category + '")]');
            $scope.schema = schema;
            $scope.modeldata = prefData;

            if ($scope.categories && $scope.categories.length == 0) {
                var catFinalArr = [];
                for (var idx in categoryArr) {
                    var catCode = categoryArr[idx];
                    var category = { Id: catCode, Text: getCategoryDisplay(catCode) }
                    catFinalArr.push(category);
                }
                $scope.categories = catFinalArr;
            }
        }

        function getCategoryDisplay(catCode) {
            return $scope.CategoryDisplayMap[catCode] ? $scope.CategoryDisplayMap[catCode] : catCode;
        }

        //save item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            var inputData = {
                Data: collectPreferences()
            }

            //console.log('Collected Data');
            //console.log(inputData.Data);

            var actionName = 'pharmacy/StorePreference/ManageStorePreferences';
            var options = {
                action: actionName,
                data: inputData,
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        function collectPreferences() {
            for (var idx in $scope.preferences) {
                var item = $scope.preferences[idx];
                item.PreferenceValue = $scope.modeldata[item.PreferenceKey];
                item.StoreMasterId = $scope.item.StoreMasterId;
            }
            return $scope.preferences;
        }

        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            //console.log(res);
            $scope.preferences = res.Data;
            computeDynamicForm(res.Data);
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.Category },
                    { Key: 4, Value: $scope.currentcontext.FacilityId },
                    { Key: 5, Value: $scope.item.StoreMasterId }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/StorePreference/GetStorePreferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "CurrencyCode" },
                { "Key": "DateFormat" },
                { "Key": "TimeFormat" },
                { "Key": "Profile" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    StoreMasterPreferencesController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'jsonPath'];

})();