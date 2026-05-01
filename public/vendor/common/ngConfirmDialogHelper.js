(function () {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngConfirmDialogHelper', ['ngDialog', '$translate', function (ngDialog, $translate) {

            var confirmDelete = function (onSuccessMethod, deleteId, itemDisplayName) {
                var message = $translate.instant('common.deletemsg.lbl', { displayname: itemDisplayName });

                ngDialog.openConfirm({
                    template:
                        '<span class="col-sm-12 alert-back">' + 'Delete' + '</span>' +
                        '<div style="text-align:center;margin-bottom:15px;font-size: 12px;">' + message + '</div>' +
                        '<div style="text-align:center;padding-bottom:15px;">' +
                        '<button type="button" tabindex="1" class="draftbutton" ng-click="closeThisDialog(0)">No' +
                        '<button type="button" tabindex="2" class="draftbutton" style="margin-left:10px" ng-click="confirm(1)">Yes' +
                        '</button></div>',
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (onSuccessMethod) {
                        onSuccessMethod(deleteId);
                    }
                });
            }

            // Cancel Requests from List Screen Function - Start
            var confirmCancel = function (onSuccessMethod, cancelId, itemDisplayName) {
                var message = $translate.instant('common.cancelmsg.lbl', { displayname: itemDisplayName });

                ngDialog.openConfirm({
                    template:
                        '<span class="col-sm-12 alert-back">' + 'Cancel' + '</span>' +
                        '<div style="text-align:center;margin-bottom:15px;font-size: 12px;">' + message + '</div>' +
                        '<div style="text-align:center;padding-bottom:15px;">' +
                        '<button type="button" tabindex="1" class="draftbutton" ng-click="closeThisDialog(0)">No' +
                        '<button type="button" tabindex="2" class="draftbutton" style="margin-left:10px" ng-click="confirm(1)">Yes' +
                        '</button></div>',
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (onSuccessMethod) {
                        onSuccessMethod(cancelId);
                    }
                });
            }
            // Cancel Requests from List Screen Function - End

            var confirmMessage = function (options) {
                var yesKey = options.yesKey || 'common.yeskey.lbl';
                var noKey = options.noKey || 'common.nokey.lbl';
                var yesStr = $translate.instant(yesKey);
                var noStr = $translate.instant(noKey);

                var message = $translate.instant(options.messageKey);
                if (options.placeholder) {
                    message = $translate.instant(options.messageKey, options.placeholder);
                }

                var confirmTemplate = "";
                if (options.headingKey) {
                    var headingStr = $translate.instant(options.headingKey);
                    confirmTemplate =
                        '<span class="col-sm-12 alert-back">' + headingStr + '</span>';
                }

                confirmTemplate +=

                    '<div style="text-align:center;margin-bottom:15px;font-size: 12px;">' + message + '</div>' +
                    '<div style="text-align:center;padding-bottom:15px;">' +
                    '<button type="button" tabindex="1" class="draftbutton" ng-click="closeThisDialog(0)">' + noStr +
                    '<button type="button" tabindex="2" class="draftbutton" style="margin-left:10px" autofocus ng-click="confirm(1)">' + yesStr +
                    '</button></div>';

                ngDialog.openConfirm({
                    template: confirmTemplate,
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (options.onSuccessMethod) {
                        options.onSuccessMethod(options.itemId);
                    }
                });
            }

            var confirmDeactivate = function (onSuccessMethod, itemDisplayName) {
                var message = $translate.instant('common.deactivatemsg.lbl', { displayname: itemDisplayName });

                ngDialog.openConfirm({
                    template:
                        '<span class="col-sm-12 alert-back">' + 'Deactivate' + '</span>' +
                        '<div style="text-align:center; margin-bottom:15px;">' + message + '</div>' +
                        '<div style="text-align:center; padding-bottom:15px;">' +
                        '<button type="button" tabindex="1" class="draftbutton" ng-click="closeThisDialog(0)">No' +
                        '<button type="button" tabindex="2" class="draftbutton" style="margin-left:10px" ng-click="confirm(1)">Yes' +
                        '</button></div>',
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (onSuccessMethod) {
                        onSuccessMethod();
                    }
                });
            }

            var patientConfirmMessage = function (options) {
                var okkey = options.okkey || 'common.okkey.lbl';
                var okStr = $translate.instant(okkey);

                var message = $translate.instant(options.messageKey);
                var patientInfo = $translate.instant(options.patientInfo);

                var alertConfirmTemplate =
                    '<span class="col-sm-12 alert-back">' + 'Success' + '</span>' +
                    '<div style="text-align:center; margin-bottom:15px;">' + message + '</div>' +
                    '<div style="text-align:center; margin-bottom:15px;">' + patientInfo + '</div>' +
                    '<div style="text-align:center; padding-bottom:15px;">' +
                    '<button type="button" tabindex="1" class="draftbutton" style="margin-left:10px" ng-click="confirm(1)">' + okStr +
                    '</button></div>';

                var dialog = ngDialog.openConfirm({
                    template: alertConfirmTemplate,
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (options.onSuccessMethod) {
                        options.onSuccessMethod(options.pid);
                    }
                },
                    function (reason) {
                        if (options.onDismissMethod) {
                            options.onDismissMethod(options.pid);
                        }
                    });
            }

            var OKConfirmMessage = function (options) {
                var okkey = options.okkey || 'common.okkey.lbl';
                var okStr = $translate.instant(okkey);

                var message = $translate.instant(options.messageKey);
                // var patientInfo = $translate.instant(options.patientInfo);

                var alertConfirmTemplate =
                    '<span class="col-sm-12 alert-back">' + 'Success' + '</span>' +
                    '<div style="text-align:center; margin-bottom:15px;">' + message + '</div>' +
                    '<div style="text-align:center; padding-bottom:15px;">' +
                    '<button type="button" tabindex="1" class="draftbutton" style="margin-left:10px" ng-click="confirm(1)">' + okStr +
                    '</button></div>';

                var dialog = ngDialog.openConfirm({
                    template: alertConfirmTemplate,
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (options.onSuccessMethod) {
                        options.onSuccessMethod(options.pid);
                    }
                },
                    function (reason) {
                        if (options.onDismissMethod) {
                            options.onDismissMethod(options.pid);
                        }
                    });
            }

            var SuccessMessage = function (options) {
                var okkey = options.okkey || 'common.okkey.lbl';
                var okStr = $translate.instant(okkey);

                var message = $translate.instant(options.messageKey);
                // var patientInfo = $translate.instant(options.patientInfo);

                var alertConfirmTemplate =
                    '<div class="sucess-content">'  +
                    '<h1>' + 'Sucess !' + '</h1>' +
                    '<div class="msg">' + message + '</div>' +
                    '<div class="svg">' +
                    '<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">'+
                    '<g stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">'+
                    '<path class="circle" d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"/>'+
                    '<path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621"/>'+
                    '</g>'+
                    '</svg>' +
                    '</div>' +
                    '<div style="text-align:center; padding-bottom:15px;">' +
                    '<button type="button" tabindex="1" class="draftbutton" style="margin-left:10px" ng-click="confirm(1)">' + okStr +
                    '</button></div>'+ '</div>';

                var dialog = ngDialog.openConfirm({
                    template: alertConfirmTemplate,
                    plain: true,
                    className: 'ngdialog-theme-default success'
                }).then(function (value) {
                    if (options.onSuccessMethod) {
                        options.onSuccessMethod(options.pid);
                    }
                },
                    function (reason) {
                        if (options.onDismissMethod) {
                            options.onDismissMethod(options.pid);
                        }
                    });
            }

            var visitConfirmMessage = function (options) {
                var yesKey = options.yesKey || 'common.yeskey.lbl';
                var noKey = options.noKey || 'common.nokey.lbl';
                var yesStr = $translate.instant(yesKey);
                var noStr = $translate.instant(noKey);

                var message = $translate.instant(options.messageKey);
                if (options.placeholder) {
                    message = $translate.instant(options.messageKey, options.placeholder);
                }

                var confirmTemplate = "";
                if (options.headingKey) {
                    var headingStr = $translate.instant(options.headingKey);
                    confirmTemplate =
                        '<span class="col-sm-12 alert-back">' + headingStr + '</span>';
                }

                confirmTemplate +=

                    '<div style="text-align:center;margin-bottom:15px;font-size: 12px;">' + message + '</div>' +
                    '<div style="text-align:center;padding-bottom:15px;">' +
                    '<button type="button" tabindex="1" class="draftbutton" ng-click="closeThisDialog(0)">' + noStr +
                    '<button type="button" tabindex="2" class="draftbutton" style="margin-left:10px" autofocus ng-click="confirm(1)">' + yesStr +
                    '</button></div>';

                ngDialog.openConfirm({
                    template: confirmTemplate,
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (options.onSuccessMethod) {
                        options.onSuccessMethod(options.pid);
                    }
                },
                    function (reason) {
                        if (options.onDismissMethod) {
                            options.onDismissMethod(options.pid);
                        }
                    });
            }

            return {
                confirmDelete: confirmDelete,
                confirmMessage: confirmMessage,
                visitConfirmMessage: visitConfirmMessage,
                confirmDeactivate: confirmDeactivate,
                patientConfirmMessage: patientConfirmMessage,
                OKConfirmMessage: OKConfirmMessage,
                SuccessMessage: SuccessMessage,
                confirmCancel: confirmCancel   // When Cancel Confirmed -
            };
        }]);
})();