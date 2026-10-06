import moment from 'moment';

export const formatter = {
  Trim: (inputData: string) => {
    return inputData ? inputData.replace(/\s+/g, '') : inputData;
  },

  getDateString: (inputDate: Date | string) => {
    return moment(inputDate).format("DD/MM/YYYY");
  },

  getExpDateString: (inputDate: Date | string) => {
    return moment(inputDate).format("MM/YYYY");
  },

  getDateTimeString: (inputDate: Date | string) => {
    return moment(inputDate).format("DD-MMM-YYYY HH:mm");
  },

  getDateStringForAppointment: (inputDate: Date | string) => {
    return moment(inputDate).format("MM/DD/YYYY");
  },

  getDateTimeStringForAppointment: (inputDate: Date | string) => {
    return moment(inputDate).format("MM/DD/YYYY hh:mm");
  },

  getTimeString24Hour: (inputDate: Date | string) => {
    return moment(inputDate).format("HH:mm");
  },

  getDate: (inputDateString: string) => {
    return moment(inputDateString).toDate();
  },

  getCurrentDate: () => {
    return new Date();
  },

  getThirtyDaysBackDate: () => {
    const curdate = new Date();
    curdate.setDate(curdate.getDate() - 30);
    return curdate;
  },

  getCurrentDateWithoutTime: () => {
    const datePart = moment(new Date()).format("MM/DD/YYYY");
    return moment(datePart).toDate();
  },

  isPastDate: (inputDate: Date | string) => {
    const formattedInput = moment(inputDate).format("YYYY-MM-DD");
    const currentDate = moment().format("YYYY-MM-DD");
    return moment(formattedInput).isBefore(currentDate);
  },

  isPastDateTime: (inputDate: Date | string, inputTime: string) => {
    const formattedInputDate = moment(inputDate).format("YYYY-MM-DD");
    const combinedInput = moment(`${formattedInputDate} ${inputTime}`).format("YYYY-MM-DD H:mm");
    const currentDate = moment().format("YYYY-MM-DD H:mm");
    return moment(combinedInput).isBefore(currentDate);
  },

  isFutureDate: (inputDate: Date | string) => {
    const formattedInput = moment(inputDate).format("YYYY-MM-DD");
    const currentDate = moment().format("YYYY-MM-DD");
    return moment(formattedInput).isAfter(currentDate);
  },

  getFilterDate: (inputDate: Date | string) => {
    return inputDate ? moment(inputDate).format("YYYY-MM-DD") : "";
  },

  getAgeFromDOB: (inputDate: Date | string) => {
    return moment().diff(inputDate, 'years', false);
  },

  getAgeInDaysFromDOB: (inputDate: Date | string) => {
    return moment().diff(inputDate, 'days', false);
  },

  getDateStringForRegistration: (inputDate: Date | string) => {
    return moment(inputDate).format("DD-MM-YYYY");
  },

  getDOBFromAge: (inputAge: number, substractPart: moment.unitOfTime.DurationConstructor = 'years') => {
    let result: string | Date = moment().format('LL');
    if (inputAge > 0) {
      result = moment(result).subtract(inputAge, substractPart).toDate();
    }
    return result;
  },

  getDOBFromAgeConfig: (options: { y?: number, m?: number, d?: number }) => {
    let result: string | Date = moment().format('LL');
    if (options.y) result = moment(result).subtract(options.y, 'years').toDate();
    if (options.m) result = moment(result).subtract(options.m, 'months').toDate();
    if (options.d) result = moment(result).subtract(options.d, 'days').toDate();
    return result;
  },

  getDateStringForVitalChart: (inputDate: Date | string) => {
    return moment(inputDate).format("DD-MMM");
  },

  computeDateBasedOnPeriod: (inputNumber: number, durationperiod: string) => {
    const duration = durationperiod.toLowerCase();
    if (duration === "days") return moment().add(inputNumber, 'days');
    if (duration === "weeks") return moment().add(inputNumber, 'weeks');
    if (duration === "months") return moment().add(inputNumber, 'months');
    return null;
  },

  isGreaterDate: (inputDate1: Date | string, inputDate2: Date | string) => {
    const d1 = moment(inputDate1).format("YYYY-MM-DD");
    const d2 = moment(inputDate2).format("YYYY-MM-DD");
    return moment(d1).isAfter(d2);
  },

  isDateCrossed24hours: (inputDate: Date | string) => {
    const d = moment(inputDate).format('MM/DD/YYYY hh:mm');
    const cutOffTime = moment(d).add(24, 'h');
    const currentTime = moment().format('MM/DD/YYYY hh:mm');
    return moment(currentTime).isAfter(cutOffTime, 'minute');
  },

  isDateEquals: (inputDate1: Date | string, inputDate2: Date | string) => {
    const d1 = moment(inputDate1).format("YYYY-MM-DD");
    const d2 = moment(inputDate2).format("YYYY-MM-DD");
    return moment(d1).diff(moment(d2)) === 0;
  },

  formatDate: (inputDate: Date | string, formatStr: string) => {
    return moment(inputDate).format(formatStr);
  },

  addMonths: (inputDate: Date | string, noOfMonths: number) => {
    return moment(inputDate).add(noOfMonths, 'months');
  },

  addDays: (inputDate: Date | string, noOfDays: number) => {
    return moment(inputDate).add(noOfDays, 'days');
  },

  addWeeks: (inputDate: Date | string, noOfWeeks: number) => {
    return moment(inputDate).add(noOfWeeks, 'weeks');
  },

  getDetailedAgeFromDOB: (inputDate: Date | string) => {
    const diffDuration = moment.duration(moment().diff(inputDate));
    const result: { y?: number, m?: number, d?: number } = {};
    if (diffDuration.years()) result.y = moment().diff(inputDate, 'years');
    if (diffDuration.months()) result.m = diffDuration.months();
    if (diffDuration.days()) result.d = diffDuration.days();
    return result;
  },

  getNumbertoWord: (inputData: number | string) => {
    let str = inputData.toString();
    str = str.replace(/[,\s]/g, "");
    if (!str || parseInt(str, 10) === 0) return "zero";

    const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const scales = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion", "undecillion", "duodecillion", "tredecillion", "quattuordecillion", "quindecillion", "sexdecillion", "septendecillion", "octodecillion", "novemdecillion", "vigintillion", "centillion"];

    // Split number into groups of three digits from the right
    const chunks = [];
    let start = str.length;
    while (start > 0) {
      const end = start;
      chunks.push(str.slice(Math.max(0, start - 3), end));
      start = Math.max(0, start - 3);
    }

    const words = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = parseInt(chunks[i], 10);
      if (!chunk) continue;

      const hundreds = Math.floor(chunk / 100);
      const remainder = chunk % 100;
      const chunkWords = [];

      if (hundreds) {
        chunkWords.push(units[hundreds] + " hundred");
        if (remainder) chunkWords.push("and");
      }

      if (remainder) {
        if (remainder < 20) {
          chunkWords.push(units[remainder]);
        } else {
          const ten = Math.floor(remainder / 10);
          const unit = remainder % 10;
          chunkWords.push(tens[ten]);
          if (unit) chunkWords.push(units[unit]);
        }
      }

      const scale = scales[i];
      if (scale) chunkWords.push(scale);

      words.unshift(chunkWords.join(" "));
    }
    return words.join(" ");
  }
};

