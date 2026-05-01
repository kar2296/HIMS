(function() {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngCtrlHelper', ['$controller', function ($controller) {

         var getBaseController = function(params) {
             return $controller('baseController', params);
         }

         var getCNSectionBaseController = function(params) {
            return $controller('cnSectionBaseController', params);
         }

         var getEMRBaseController = function(params) {
             return $controller('emrBaseController', params);
         }

         var getValidationCtrl = function(params) {
             return $controller('validationController', params);
         }

         var getPrivilegeController = function(params) {
             return $controller('privilegeController', params);
         }

         var getUserPreferenceController = function(params) {
             return $controller('userPreferenceController', params);
         }

         var getDotmatrixController = function(params) {
            return $controller('dotmatrixController', params);
        }

        var getDotmatrixPrintDataController = function(params) {
            return $controller('dotmatrixprintcontroller', params);
        }

        var getBarcodeController = function(params) {
            return $controller('barcodeprintcontroller', params);
        }


        return {
            getBaseCtrl : getBaseController,
            getCNSectionBaseCtrl: getCNSectionBaseController,
            getEMRBaseCtrl : getEMRBaseController,
            getValidationCtrl : getValidationCtrl,
            getPrivilegeCtrl : getPrivilegeController,
            getUPCtrl : getUserPreferenceController,
            getDMPrintCtrl: getDotmatrixController,
            getDMPrintDataController: getDotmatrixPrintDataController,
            getBarcodePrintCtrl : getBarcodeController
        };
    }]);

})();