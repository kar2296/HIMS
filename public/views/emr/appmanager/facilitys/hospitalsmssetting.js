(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('smssettingsFormController', smssettingsFormController);

    function smssettingsFormController($scope, $stateParams, $state, $translate, utl, jsonPath) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.currentcontext = {
            Category: ''
        };

        $scope.CategoryDisplayMap = {
            general: 'General Setting',
            billing: 'Billing Setting',
            demographic: 'Demographic Setting',
            patientemr: 'Patient EMR',
            print: 'Print',
            dmprint: 'DM Print',
            erpintegration: 'ERP Integration',
            hl7integration: 'HL7 Integration',
            idcardprint: 'ID Card',
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

        $scope.currentcontext.FacilityId = parseInt($stateParams.id);

        $scope.backToList = function () {
            $state.go('app.facilitys');
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
                    var control = {
                        category: item.Category,
                        key: item.PreferenceKey,
                        type: item.PreferenceType,
                        text: item.PreferenceDisplay,
                        model: item.PreferenceKey,
                        position: {
                            r: item.Row,
                            c: item.Col
                        }
                    };
                    var prefValue = item.PreferenceValue;
                    if (item.PreferenceType == 'select') {
                        var lookupKey = $scope.PreferenceLookupMap[item.PreferenceKey];
                        control.options = $scope.lookup[lookupKey];
                    } else if (item.PreferenceType == 'checkbox') {
                        prefValue = prefValue == "1" ? true : false;
                    }
                    prefData[item.PreferenceKey] = prefValue;

                    if (categoryArr.indexOf(item.Category) == -1) {
                        categoryArr.push(item.Category);
                    }
                    if (item.Section) {
                        var controlsArr = {
                            "Controls": controls
                        };
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

            $scope.currentcontext.Category = $scope.currentcontext.Category ? $scope.currentcontext.Category : "SMS";
            var controlsArr1 = {
                "Controls": controls
            };
            schema.controls = jsonPath(controlsArr1, '$..Controls[?(@.category=="' + $scope.currentcontext.Category + '")]');
            $scope.schema = schema;
            $scope.modeldata = prefData;

            if ($scope.categories && $scope.categories.length == 0) {
                var catFinalArr = [];
                for (var idx in categoryArr) {
                    var catCode = categoryArr[idx];
                    var category = {
                        Id: catCode,
                        Text: getCategoryDisplay(catCode)
                    }
                    catFinalArr.push(category);
                }
                $scope.categories = catFinalArr;
            }
        }

        function getCategoryDisplay(catCode) {
            return ($scope.CategoryDisplayMap && $scope.CategoryDisplayMap[catCode]) ? $scope.CategoryDisplayMap[catCode] : catCode;
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

            var actionName = 'SystemSettings/Facilitypreference/ManageFacilityPreferences';
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
                Params: [{
                        Key: 1,
                        Value: 'SMS'
                    },
                    {
                        Key: 3,
                        Value: [-1, $scope.currentcontext.FacilityId]
                    },
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/FacilityPreference/GetFacilityPreferences',
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
            var inputData = [{
                    "Key": "CurrencyCode"
                },
                {
                    "Key": "DateFormat"
                },
                {
                    "Key": "TimeFormat"
                },
                {
                    "Key": "Profile"
                }
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

    smssettingsFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'jsonPath'];

})();