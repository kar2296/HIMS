(function () {
    'use strict';
    angular
        .module('common.utils')
        .factory('ngAPIHelper', ['$http', 'ngAlertHelper', '$translate',
            function ($http, ngAlertHelper, $translate) {

                var doAction = function (options) {
                    $("#divgifLoading").show();
                    options.action = window.appPath.apiroot + options.action;
                    switch (options.type) {
                        case "post":
                            $http.post(options.action,
                                options.data,
                                {
                                    params: options.params ? options.params : {}
                                    //headers: options.headers
                                })
                                .success(function (data) {
                                    $("#divgifLoading").hide();
                                    if (typeof options['onComplete'] === 'function') {
                                        options['onComplete'](null, data, options, false); 
                                    }
                                })
                                .error(function (data) {
                                    $("#divgifLoading").hide();
                                    console.log('post api - error');
                                    console.log(data);
                                    if (data && data.Error && data.Error.Code) {
                                        if(options['onError']) {
                                            options['onError'](data, options);
                                        } else {
                                            var translateKey = "common.errors." + data.Error.Code + ".lbl";
                                            ngAlertHelper.showErrorMsg($translate.instant(translateKey));
                                        }
                                    }
                                    else if (data && data.Error && data.Error.Message) {

                                        ngAlertHelper.showErrorMsg(data.Error.Message);
                                        if(options['onError']) {
                                            options['onError'](data, options);
                                        }
                                    }  else if (data) {
                                        if(options['onError']) {
                                            options['onError'](data, options);
                                        }
                                    }
                                });
                            break;

                        default:
                            $http({
                                url: options.action,
                                method: (options.type || "GET"),
                                params: options.params ? options.params : {}
                                //headers: options.headers
                            })
                                .success(function (data) { 
                                    if (typeof options['onComplete'] === 'function') {
                                        options['onComplete'](null, data, options, false); 
                                    }
                                })
                                .error(function (data) {
                                    console.log('get api - error');
                                    console.log(data);
                                    if (data && data.Error && data.Error.Message) {
                                        ngAlertHelper.showErrorMsg(data.Error.Message);
                                    }
                                });
                            break;
                    }
                }

                var getRootPath = function () {
                    return window.appPath.apiroot;
                }
                function doDownload(options) {
                    // $("#divgifLoading").show();
                    options.action = window.appPath.apiroot + options.action;
                    $http.post(options.action, options.data, { responseType: 'arraybuffer' })
                        .then(function (response) {
                            //console.log(response);
                            var blob = new Blob([response.data], { type: response.headers('Content-Type') || 'application/pdf' });
                            var fileURL = URL.createObjectURL(blob);
                            var opened = null;
                            try {
                                opened = window.open(fileURL);
                            } catch (e) {
                                opened = null;
                            }
                            if (!opened || opened.closed || typeof opened.closed === 'undefined') {
                                var link = document.createElement('a');
                                link.href = fileURL;
                                var disposition = response.headers('Content-Disposition') || '';
                                var match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                                var filename = (match && match[1]) ? match[1].replace(/['"]/g, '') : 'Consultation_Report.pdf';
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                setTimeout(function () {
                                    if (link.parentNode) {
                                        link.parentNode.removeChild(link);
                                    }
                                    URL.revokeObjectURL(fileURL);
                                }, 1000);
                            }

                            if (typeof options['onComplete'] === 'function') {
                                options['onComplete'](null, response.data, options, false);
                            }
                        })
                        .catch(function (data) { });
                }
                function doDownloadJsonFile(options) {
                    // $("#divgifLoading").show();
                    options.action = window.appPath.apiroot + options.action;
                    $http.post(options.action, options.data, { responseType: 'arraybuffer' })
                        .then(function (response) {
                            //console.log(response);
        //                     const a = document.createElement("a");
		//   const file = new Blob([content], { type: contentType });
		//   a.href = URL.createObjectURL(file);
		//   a.download = fileName;
		//   a.click();
                            var blob = new Blob([response.data], { type: 'text/plain' });

                            var link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = options.data.Data.fileName;
                            link.click();
                            // window.URL.revokeObjectURL(link.href);

                            // var fileURL = URL.createObjectURL(blob);
                            // window.open(fileURL);

                            if (typeof options['onComplete'] === 'function') {
                                options['onComplete'](null, response.data, options, false);
                            }
                        })
                        .catch(function (data) { });
                }
                function doDownloadXslFile(options) {
                    // $("#divgifLoading").show();
                    options.action = window.appPath.apiroot + options.action;
                    $http.post(options.action, options.data, { responseType: 'arraybuffer' })
                        .then(function (response) {
                            //console.log(response);
        //                     const a = document.createElement("a");
		//   const file = new Blob([content], { type: contentType });
		//   a.href = URL.createObjectURL(file);
		//   a.download = fileName;
		//   a.click();
                            var blob = new Blob([response.data], { type: 'data:application/vnd.ms-excel' });

                            var link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = options.data.Data.fileName;
                            link.click();
                            // window.URL.revokeObjectURL(link.href);

                            // var fileURL = URL.createObjectURL(blob);
                            // window.open(fileURL);

                            if (typeof options['onComplete'] === 'function') {
                                options['onComplete'](null, response.data, options, false);
                            }
                        })
                        .catch(function (data) { });
                }
                function doPrint(options) {
                    // $("#divgifLoading").show();
                    options.action = window.appPath.apiroot + options.action;
                    $http.post(options.action, options.data, { responseType: 'arraybuffer' })
                        .then(function (response) {
                            var blob = new Blob([response.data], { type: response.headers('Content-Type') });
                            var fileURL = URL.createObjectURL(blob);
                            var printwWindow = window.open(fileURL);
                            printwWindow.print();

                            if (typeof options['onComplete'] === 'function') {
                                options['onComplete'](null, response.data, options, false);
                            }
                        })
                        .catch(function (data) { });
                }

                function getDownloadedURL(options) {
                    // $("#divgifLoading").show();
                    options.action = window.appPath.apiroot + options.action;
                    $http.post(options.action, options.data, { responseType: 'arraybuffer' })
                        .then(function (response) {
                            //console.log(response);
                            var blob = new Blob([response.data], { type: response.headers('Content-Type') });
                            var fileurl = URL.createObjectURL(blob);
                            options.data.Data.fileurl  = fileurl;
                            if (typeof options['onComplete'] === 'function') {
                                options['onComplete'](null, response.data, options, false);
                            }
                        })
                        .catch(function (data) { });
                }


                return {
                    doAction: doAction,
                    getRootPath: getRootPath,
                    doDownload: doDownload,
                    getDownloadedURL: getDownloadedURL,
                    doPrint : doPrint,
                    doDownloadJsonFile: doDownloadJsonFile,
                    doDownloadXslFile: doDownloadXslFile
                };
            }]);

})();