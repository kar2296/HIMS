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

        /**
         * Downloads the visible report table(s) as an Excel-readable file (.xls). target: a CSS selector
         * or element; when omitted, every visible top-level table in the current page is exported.
         * Returns false when there is nothing to export.
         */
        var exportTableToExcel = function (target, fileName) {
            var root = document.querySelector('.content-wrapper') || document.body;
            var found = target ? (typeof target === 'string' ? root.querySelectorAll(target) : [target]) : root.querySelectorAll('table');
            var tables = Array.prototype.filter.call(found, function (t) {
                return t.offsetParent !== null && !t.closest('.custom-popup-wrapper') &&
                    !(t.parentElement && t.parentElement.closest('table'));
            });
            if (!tables.length) {
                return false;
            }
            var html = tables.map(function (t) { return t.outerHTML; }).join('<br/>');
            var doc = '<html><head><meta charset="UTF-8"></head><body>' + html + '</body></html>';
            var blob = new Blob(['\ufeff', doc], { type: 'application/vnd.ms-excel' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = (fileName || 'report').replace(/[\\/:*?"<>|]+/g, ' ').trim() + '.xls';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
            return true;
        };

        return {
            getItemByProp : getItemByProp,
            exportTableToExcel: exportTableToExcel,
            isEmptyJSONObject: isEmptyJSONObject,
            isDuplicateRec : isDuplicateRec
        };
    }]);

})();