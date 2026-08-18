(function () {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngConfirmDialogHelper', ['ngDialog', '$translate', function (ngDialog, $translate) {

            var confirmDelete = function (onSuccessMethod, deleteId, itemDisplayName) {
                var message = $translate.instant('common.deletemsg.lbl', { displayname: itemDisplayName });

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: 'Delete Confirmation',
                        message: message,
                        yesLabel: 'Yes, Delete',
                        noLabel: 'No, Keep',
                        variant: 'danger',
                        icon: 'fa fa-trash-alt',
                        onConfirm: function () {
                            if (onSuccessMethod) {
                                onSuccessMethod(deleteId);
                            }
                        }
                    });
                    return;
                }

                ngDialog.openConfirm({
                    template:
                        '<div class="modal-header" style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                        '<i class="fa fa-trash-alt" style="margin-right: 8px;"></i> Delete' +
                        '</div>' +
                        '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + message + '</div>' +
                        '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: center; gap: 12px;">' +
                        '<button type="button" class="btn btn-secondary" style="min-width: 90px;" ng-click="closeThisDialog(0)">No</button>' +
                        '<button type="button" class="btn btn-danger" style="min-width: 90px;" ng-click="confirm(1)">Yes</button>' +
                        '</div>',
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (onSuccessMethod) {
                        onSuccessMethod(deleteId);
                    }
                });
            };

            // Cancel Requests from List Screen Function - Start
            var confirmCancel = function (onSuccessMethod, cancelId, itemDisplayName) {
                var message = $translate.instant('common.cancelmsg.lbl', { displayname: itemDisplayName });

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: 'Cancel Confirmation',
                        message: message,
                        yesLabel: 'Yes, Cancel',
                        noLabel: 'No',
                        variant: 'warning',
                        icon: 'fa fa-times-circle',
                        onConfirm: function () {
                            if (onSuccessMethod) {
                                onSuccessMethod(cancelId);
                            }
                        }
                    });
                    return;
                }

                ngDialog.openConfirm({
                    template:
                        '<div class="modal-header" style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                        '<i class="fa fa-times-circle" style="margin-right: 8px;"></i> Cancel' +
                        '</div>' +
                        '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + message + '</div>' +
                        '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: center; gap: 12px;">' +
                        '<button type="button" class="btn btn-secondary" style="min-width: 90px;" ng-click="closeThisDialog(0)">No</button>' +
                        '<button type="button" class="btn btn-warning" style="min-width: 90px;" ng-click="confirm(1)">Yes</button>' +
                        '</div>',
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (onSuccessMethod) {
                        onSuccessMethod(cancelId);
                    }
                });
            };
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

                var headingStr = options.headingKey ? $translate.instant(options.headingKey) : 'Confirm';

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: headingStr,
                        message: message,
                        yesLabel: yesStr,
                        noLabel: noStr,
                        variant: options.variant || 'primary',
                        onConfirm: function () {
                            if (options.onSuccessMethod) {
                                options.onSuccessMethod(options.itemId);
                            }
                        }
                    });
                    return;
                }

                var confirmTemplate =
                    '<div class="modal-header" style="background: linear-gradient(135deg, #00005c 0%, #1a0070 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                    headingStr +
                    '</div>' +
                    '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + message + '</div>' +
                    '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: center; gap: 12px;">' +
                    '<button type="button" class="btn btn-secondary" style="min-width: 90px;" ng-click="closeThisDialog(0)">' + noStr + '</button>' +
                    '<button type="button" class="btn btn-primary" style="min-width: 90px;" autofocus ng-click="confirm(1)">' + yesStr + '</button>' +
                    '</div>';

                ngDialog.openConfirm({
                    template: confirmTemplate,
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (options.onSuccessMethod) {
                        options.onSuccessMethod(options.itemId);
                    }
                });
            };

            var confirmDeactivate = function (onSuccessMethod, itemDisplayName) {
                var message = $translate.instant('common.deactivatemsg.lbl', { displayname: itemDisplayName });

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: 'Deactivate Confirmation',
                        message: message,
                        yesLabel: 'Yes, Deactivate',
                        noLabel: 'No',
                        variant: 'danger',
                        icon: 'fa fa-user-slash',
                        onConfirm: function () {
                            if (onSuccessMethod) {
                                onSuccessMethod();
                            }
                        }
                    });
                    return;
                }

                ngDialog.openConfirm({
                    template:
                        '<div class="modal-header" style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                        '<i class="fa fa-user-slash" style="margin-right: 8px;"></i> Deactivate' +
                        '</div>' +
                        '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + message + '</div>' +
                        '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: center; gap: 12px;">' +
                        '<button type="button" class="btn btn-secondary" style="min-width: 90px;" ng-click="closeThisDialog(0)">No</button>' +
                        '<button type="button" class="btn btn-danger" style="min-width: 90px;" ng-click="confirm(1)">Yes</button>' +
                        '</div>',
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    if (onSuccessMethod) {
                        onSuccessMethod();
                    }
                });
            };

            var patientConfirmMessage = function (options) {
                var okkey = options.okkey || 'common.okkey.lbl';
                var okStr = $translate.instant(okkey);

                var message = $translate.instant(options.messageKey);
                var patientInfo = options.patientInfo ? $translate.instant(options.patientInfo) : '';
                var fullMessage = message + (patientInfo ? ' (' + patientInfo + ')' : '');

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: 'Success',
                        message: fullMessage,
                        yesLabel: okStr,
                        variant: 'success',
                        icon: 'fa fa-check-circle',
                        onConfirm: function () {
                            if (options.onSuccessMethod) {
                                options.onSuccessMethod(options.pid);
                            }
                        }
                    });
                    return;
                }

                var alertConfirmTemplate =
                    '<div class="modal-header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                    '<i class="fa fa-check-circle" style="margin-right: 8px;"></i> Success' +
                    '</div>' +
                    '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + fullMessage + '</div>' +
                    '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9;">' +
                    '<button type="button" class="btn btn-success" style="min-width: 100px;" ng-click="confirm(1)">' + okStr + '</button>' +
                    '</div>';

                ngDialog.openConfirm({
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
            };

            var OKConfirmMessage = function (options) {
                var okkey = options.okkey || 'common.okkey.lbl';
                var okStr = $translate.instant(okkey);

                var message = $translate.instant(options.messageKey);

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: 'Success',
                        message: message,
                        yesLabel: okStr,
                        variant: 'success',
                        icon: 'fa fa-check-circle',
                        onConfirm: function () {
                            if (options.onSuccessMethod) {
                                options.onSuccessMethod(options.pid);
                            }
                        }
                    });
                    return;
                }

                var alertConfirmTemplate =
                    '<div class="modal-header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                    '<i class="fa fa-check-circle" style="margin-right: 8px;"></i> Success' +
                    '</div>' +
                    '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + message + '</div>' +
                    '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9;">' +
                    '<button type="button" class="btn btn-success" style="min-width: 100px;" ng-click="confirm(1)">' + okStr + '</button>' +
                    '</div>';

                ngDialog.openConfirm({
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
            };

            var SuccessMessage = function (options) {
                var okkey = options.okkey || 'common.okkey.lbl';
                var okStr = $translate.instant(okkey);

                var message = $translate.instant(options.messageKey);

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: 'Success',
                        message: message,
                        yesLabel: okStr,
                        variant: 'success',
                        icon: 'fa fa-check-circle',
                        onConfirm: function () {
                            if (options.onSuccessMethod) {
                                options.onSuccessMethod(options.pid);
                            }
                        }
                    });
                    return;
                }

                var alertConfirmTemplate =
                    '<div class="modal-header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                    '<i class="fa fa-check-circle" style="margin-right: 8px;"></i> Success' +
                    '</div>' +
                    '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + message + '</div>' +
                    '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9;">' +
                    '<button type="button" class="btn btn-success" style="min-width: 100px;" ng-click="confirm(1)">' + okStr + '</button>' +
                    '</div>';

                ngDialog.openConfirm({
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
            };

            var visitConfirmMessage = function (options) {
                var yesKey = options.yesKey || 'common.yeskey.lbl';
                var noKey = options.noKey || 'common.nokey.lbl';
                var yesStr = $translate.instant(yesKey);
                var noStr = $translate.instant(noKey);

                var message = $translate.instant(options.messageKey);
                if (options.placeholder) {
                    message = $translate.instant(options.messageKey, options.placeholder);
                }

                var headingStr = options.headingKey ? $translate.instant(options.headingKey) : 'Confirm';

                if (window.renderReactConfirmModal) {
                    window.renderReactConfirmModal({
                        title: headingStr,
                        message: message,
                        yesLabel: yesStr,
                        noLabel: noStr,
                        variant: 'primary',
                        icon: 'fa fa-calendar-check',
                        onConfirm: function () {
                            if (options.onSuccessMethod) {
                                options.onSuccessMethod(options.pid);
                            }
                        }
                    });
                    return;
                }

                var confirmTemplate =
                    '<div class="modal-header" style="background: linear-gradient(135deg, #00005c 0%, #1a0070 100%); color: #fff; padding: 12px 18px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">' +
                    headingStr +
                    '</div>' +
                    '<div style="text-align:center; padding: 24px 20px; font-size: 14px; color: #1e293b; font-weight: 500;">' + message + '</div>' +
                    '<div style="text-align:center; padding: 12px 20px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: center; gap: 12px;">' +
                    '<button type="button" class="btn btn-secondary" style="min-width: 90px;" ng-click="closeThisDialog(0)">' + noStr + '</button>' +
                    '<button type="button" class="btn btn-primary" style="min-width: 90px;" autofocus ng-click="confirm(1)">' + yesStr + '</button>' +
                    '</div>';

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
            };

            return {
                confirmDelete: confirmDelete,
                confirmMessage: confirmMessage,
                visitConfirmMessage: visitConfirmMessage,
                confirmDeactivate: confirmDeactivate,
                patientConfirmMessage: patientConfirmMessage,
                OKConfirmMessage: OKConfirmMessage,
                SuccessMessage: SuccessMessage,
                confirmCancel: confirmCancel
            };
        }]);
})();