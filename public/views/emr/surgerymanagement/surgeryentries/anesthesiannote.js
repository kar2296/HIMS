(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AnesthesianNoteController', AnesthesianNoteController);

    function AnesthesianNoteController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "item.DataTemplate".split('.');
                var current = parts[0] === 'vm' ? (typeof vm !== 'undefined' ? vm : $scope.vm) : (parts[0] === 'cvm' ? (typeof cvm !== 'undefined' ? cvm : $scope.cvm) : $scope);
                var startIndex = (parts[0] === 'vm' || parts[0] === 'cvm') ? 1 : 0;
                for (var i = startIndex; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({ $scope: $scope }));
        $scope.currentcontext = {
            otregisterid: parseInt($stateParams.id),
            ismodal: modalConfig && modalConfig.params ? true : false,
        };
        $scope.item = {
            Id: 0,
            OtNoteTypeId: 2
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.otregisterid = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.NoteTypeId = 10;
        $scope.getOtregisterCallback = function (scope, data, options, hasError) {
            $scope.item.PatientId = data.PatientId;
            $scope.item.EncounterId = data.EncounterId;
            $scope.item.OTRegisterId = data.Id;
        };

        $scope.getOtregisterById = function () {
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntryById',
                data: { Id: $scope.currentcontext.otregisterid },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getNoteTemplateByIdCallback = function (scope, data, options, hasError) {
            $scope.item.DataTemplate = data.DataTemplate;
        };
        $scope.onNoteTemplateChange = function () {
            if ($scope.item.TemplateTypeId > 0) {
                var options = {
                    action: 'clinicalmaster/NoteTemplate/GetNoteTemplateById',
                    data: { Id: $scope.item.TemplateTypeId },
                    type: 'post',
                    onComplete: $scope.getNoteTemplateByIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                $scope.item = data.Data[0];
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.otregisterid },
                    { Key: 2, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'OtManagement/OtNotes/GetOtNotess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.clear = function () {
            $scope.item = {
                Id: 0,
                OtNoteTypeId: 2
            };
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (!$scope.currentcontext.ismodal) {
                $scope.getList();
            }
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
        };

        $scope.backToList = function () {
            $state.go('app.otregisters');
        }

        $scope.backToDetail = function () {
            $state.go('app.otregistertab.otregister', { id: $scope.currentcontext.otregisterid });
        }

        $scope.saveItem = function () {
            if ($scope.item.DataTemplate) {
                var action = 'OtManagement/OtNotes/AddOtNotes'
                if ($scope.item.Id > 0)
                    action = 'OtManagement/OtNotes/UpdateOtNotes'
                var options = {
                    action: action,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadData() {
            $scope.getOtregisterById();
            $scope.getList();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "NoteTemplate", Request: { Params: [{ Key: 1, Value: $scope.NoteTypeId }] } },
                { "Key": "NoteType" },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    AnesthesianNoteController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();