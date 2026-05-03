import lodash from 'lodash';
import { alert } from './alert';

export const common = {
  getItemByProp: (list: any[], prop: string, targetVal: any) => {
    let result;
    for (const idx in list) {
      const item = list[idx];
      if (item[prop] == targetVal) {
        result = item;
      }
    }
    return result;
  },

  isEmptyJSONObject: (jsonObj: any) => {
    if (!jsonObj) return true;
    const propCount = Object.keys(jsonObj).length;
    return propCount === 0;
  },

  isDuplicateRec: (inputArr: any[], jsonObj: { pivotkey: string, displaykey: string }, skipDeletedRecords: boolean = false) => {
    const jsonProp = jsonObj['pivotkey'];
    const displayProp = jsonObj['displaykey'];

    let activeRecords = inputArr;
    if (!skipDeletedRecords) {
      // Simulate Angular filter: { search: 1, fields: ['Status'] }
      activeRecords = inputArr.filter(item => item.Status == 1);
    }

    const groupedData = lodash.groupBy(activeRecords, jsonProp);
    let isduplicate = false;
    for (const idx in groupedData) {
      if (groupedData[idx].length > 1) {
        const itemName = groupedData[idx][0][displayProp];
        isduplicate = true;
        
        // Use english fallback if no i18n is available globally yet in React
        // We use our pure TS alert.ts
        alert.showErrorMsg(`Duplicate records found for: ${itemName}`);
        break;
      }
    }
    return isduplicate;
  }
};
