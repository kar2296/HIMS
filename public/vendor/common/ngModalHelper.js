(function () {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngModalHelper', ['$uibModal', 'modalConfig', function ($uibModal, modalConfig) {

            var openDialog = function (key, modalCfg) {
                var options = modalConfig.get(key);
                var dialogSize = options.size ? options.size : 'lg';

                var modalInstance = $uibModal.open({
                    templateUrl: options.templateUrl,
                    controller: options.controller,
                    controllerAs: 'vm',
                    size: dialogSize,
                    resolve: {
                        loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(options.controllerUrl);
                        }],
                        modalConfig: function () {
                            return modalCfg;
                        }
                    }
                });

                modalInstance.result
                  .then(modalCfg.confirmCallback)
                  .catch(modalCfg.cancelCallback);

                modalInstance.rendered.then(function (modal) {

                    if (modalCfg.relativeto) {
                        var element = document.querySelector(modalCfg.relativeto);
                        if (element) {
                            var rect = element.getBoundingClientRect(),

                            modal = document.querySelector('.modal-dialog');
                            console.log(rect);
                            modal.style.margin = 0;
                            modal.style.top = rect.top + 30 + 'px';
                            modal.style.left = rect.left + rect.width - modal.offsetWidth + 'px';
                        }
                    }
                });

                return modalInstance;
            }

            var openFixedDialog = function (key, modalCfg) {
                var options = modalConfig.get(key);
                var dialogSize = options.size ? options.size : 'lg';

                var modalInstance = $uibModal.open({
                    templateUrl: options.templateUrl,
                    controller: options.controller,
                    controllerAs: 'vm',
                    size: dialogSize,
                    backdrop: 'static',
                    keyboard : false,
                    resolve: {
                        loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(options.controllerUrl);
                        }],
                        modalConfig: function () {
                            return modalCfg;
                        }
                    }
                });

                modalInstance.result
                  .then(modalCfg.confirmCallback)
                  .catch(modalCfg.cancelCallback);

                modalInstance.rendered.then(function (modal) {

                    if (modalCfg.relativeto) {
                        var element = document.querySelector(modalCfg.relativeto);
                        if (element) {
                            var rect = element.getBoundingClientRect(),

                            modal = document.querySelector('.modal-dialog');
                            console.log(rect);
                            modal.style.margin = 0;
                            modal.style.top = rect.top + 30 + 'px';
                            modal.style.left = rect.left + rect.width - modal.offsetWidth + 'px';
                        }
                    }
                });

                return modalInstance;
            }

            var openDyanamicFormModal = function (modalCfg) {
                var key = 'dynamicform-modal';

                var options = modalConfig.get(key);
                var dialogSize = options.size ? options.size : 'lg';

                var modalInstance = $uibModal.open({
                    templateUrl: options.templateUrl,
                    controller: options.controller,
                    controllerAs: 'vm',
                    size: dialogSize,
                    resolve: {
                        loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(options.controllerUrl);
                        }],
                        modalConfig: function () {
                            return modalCfg;
                        }
                    }
                });

                modalInstance.rendered.then(function (modal) {

                    if (modalCfg.relativeto) {
                        var element = document.querySelector(modalCfg.relativeto);
                        if (element) {
                            var rect = element.getBoundingClientRect(),

                            modal = document.querySelector('.modal-dialog');
                            console.log(rect);
                            modal.style.margin = 0;
                            modal.style.top = rect.top + 30 + 'px';
                            modal.style.left = rect.left + rect.width - modal.offsetWidth + 'px';
                        }
                    }
                });

                return modalInstance;
            }

            var openTmpl = function (options) {
                var dialogSize = options.size ? options.size : 'md';

                var modalInstance = $uibModal.open({
                    templateUrl: options.templateUrl,
                    size: dialogSize,
                    scope: options.scope
                });

                modalInstance.rendered.then(function (modal) {

                    if (options.relativeto) {
                        var element = document.querySelector(options.relativeto);
                        if (element) {
                            var rect = element.getBoundingClientRect(),

                            modal = document.querySelector('.modal-dialog');
                            console.log(rect);
                            modal.style.margin = 0;
                            modal.style.top = rect.top + 30 + 'px';
                            modal.style.left = rect.left + rect.width - modal.offsetWidth + 'px';
                        }
                    }
                });

                return modalInstance;
            }

            return {
                open: openDialog,
                openDynamicForm : openDyanamicFormModal,
                openTmpl : openTmpl,
                openFixedDialog: openFixedDialog
            };
        }]);

})();