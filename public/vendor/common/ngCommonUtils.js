(function() {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngCommonUtils', ['$filter','lodash', 'ngAlertHelper', '$translate', function ($filter, lodash, ngAlertHelper, $translate) {
        
         var getItemByProp = function(list, prop, targetVal) {
                var result;
                for(var idx in list) {
                    var item = list[idx];
                    if(item[prop] == targetVal) {
                        result = item;
                    }
                }
                return result;
         }

         var isEmptyJSONObject = function (jsonObj) {
            var propCount = Object.keys(jsonObj).length;
            var result = propCount == 0 ? true : false;
            return result;
        }

        var isDuplicateRec = function (inputArr, jsonObj, skipDeletedRecords) {
            var jsonProp = jsonObj['pivotkey'];
            var displayProp = jsonObj['displaykey'];

            var activeRecords = inputArr;
            if(!skipDeletedRecords) {
                activeRecords = $filter('filterArrayItems')(inputArr, [
                    { search: 1, fields: ['Status'] }
                ]);
            }

            var groupedData = lodash.groupBy(activeRecords, jsonProp);
            var isduplicate = false;
            for(var idx in groupedData) {
                if(groupedData[idx].length > 1) {
                    var itemName = groupedData[idx][0][displayProp];
                    isduplicate = true;
                    ngAlertHelper.showErrorMsg($translate.instant('common.duplicatemsg.lbl', { itemname : itemName})); 
                    break;
                }
            }
            return isduplicate;
        }

        return {
            getItemByProp : getItemByProp,
            isEmptyJSONObject: isEmptyJSONObject,
            isDuplicateRec : isDuplicateRec
        };
    }]);

})();