(function() {
    'use strict';

    angular
        .module('common.utils')
        .factory('utl', ['ngAlertHelper', 'ngAPIHelper', 'ngConfirmDialogHelper', 
                            'ngLookupHelper', 'ngCommonUtils', 'ngFormatHelper',
                            'ngValidatorHelper', 'ngSessionHelper', 'ngModalHelper',
                            'ngCtrlHelper', 'ngChartHelper', 'ngWebCamHelper', 'ngPrivilegeHelper',
                            'ngFacilitySettings',
                    function (ngAlertHelper, ngAPIHelper, ngConfirmDialogHelper, 
                                ngLookupHelper, ngCommonUtils, ngFormatHelper,
                                ngValidatorHelper, ngSessionHelper, ngModalHelper,
                                ngCtrlHelper, ngChartHelper, ngWebCamHelper, ngPrivilegeHelper,
                                ngFacilitySettings) {

        return {
            Alert : ngAlertHelper,
            Http: ngAPIHelper,
            Dialog : ngConfirmDialogHelper,
            Lookup: ngLookupHelper,
            Common : ngCommonUtils,
            Formatter: ngFormatHelper,
            Validator : ngValidatorHelper,
            Session : ngSessionHelper,
            Modal : ngModalHelper,
            Ctrl : ngCtrlHelper,
            Chart: ngChartHelper,
            WebCamHelper : ngWebCamHelper,
            Privilege : ngPrivilegeHelper,
            FacilitySetting : ngFacilitySettings
        };
    }]);
})();