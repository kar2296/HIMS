declare const toastr: any;

export const alert = {
  showSuccessMsg: (msg: string) => {
    if (typeof toastr !== 'undefined') {
      toastr.success(msg, { timeOut: 600 });
    } else {
      console.log('SUCCESS:', msg);
    }
  },
  
  showErrorMsg: (msg: string) => {
    if (typeof toastr !== 'undefined') {
      toastr.error(msg, { timeOut: 800 });
    } else {
      console.error('ERROR:', msg);
    }
  },
  
  showInfoMsg: (msg: string) => {
    if (typeof toastr !== 'undefined') {
      toastr.info(msg, { timeOut: 700 });
    } else {
      console.info('INFO:', msg);
    }
  }
};
