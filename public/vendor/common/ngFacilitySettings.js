(function () {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngFacilitySettings', ['$rootScope', function ($rootScope) {

            var getFacilitySettingValue = function (Category, PreferenceKey) {
                if ($rootScope.FacilitySettings) {
                    if ($rootScope.FacilitySettings[Category]) {
                        if ($rootScope.FacilitySettings[Category][PreferenceKey]) {
                            var value = $rootScope.FacilitySettings[Category][PreferenceKey];
                            var type = $rootScope.FacilitySettings[Category]['Type_'+PreferenceKey];
                            if (type && value && type.toUpperCase() == 'CHECKBOX') {
                                try {
                                    return parseInt(value);
                                } catch (e) { return 0; }
                            }
                            else if (value) {
                                return value;
                            }
                            else {
                                return '';
                            }
                        }
                    }
                }
            }

            return {
                getFacilitySettingValue: getFacilitySettingValue
            };
        }]);

})();