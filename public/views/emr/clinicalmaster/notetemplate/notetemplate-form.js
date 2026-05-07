(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('notetemplateFormController', notetemplateFormController);

    function notetemplateFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            NoteTypeId: 1,
        };
        $scope.lookup = {};
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.TempType = modalConfig.params.temptype;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        if ($scope.TempType == 'medical') {
            $scope.item.NoteTypeId = 1;
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/NoteTemplate/GetNoteTemplateById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.notetemplates', {
                id: 0
            });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/NoteTemplate/AddNoteTemplate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/NoteTemplate/UpdateNoteTemplate';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.onDeptSelected = function (selectedItem) {
            $scope.item.SubDepartmentId = selectedItem.Id;
        };

        // React RichTextEditor callback — keeps item.DataTemplate in sync
        $scope.onRteChange = function (html) {
            $scope.$evalAsync(function () {
                $scope.item.DataTemplate = html;
            });
        };

        // Save & Approve shortcut (used by footer button)
        $scope.saveAndApprove = function () {
            $scope.saveItem();
        };

        $scope.deptChange = function () {
            var deptObj = utl.Lookup.getObject($scope.lookup.Department, $scope.item.SubDepartmentId);
            $scope.item.DepartmentId = deptObj.DepartmentId;
            setAssignToDetails();
            $scope.getList();
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            // $scope.lookup = hasError ? {} : data;
            // $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "NoteType"
            },
            {
                Key: 'Department',
                Request: {
                    Params: [{
                        Key: 5,
                        Value: 2
                    }]

                }
            },
            {
                Key: 'SubDepartment'
            },
            ];
            $scope.getLookUp(inputData);
        }
        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.initLookup();
        $scope.getItem();

        $scope.getsubdeptUsers = function () {
            var inputData = [{
                "Key": "SubDepartment",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: $scope.item.DepartmentId || -1
                    }]
                }
            }];
            $scope.getLookUp(inputData);
        };
    }

    notetemplateFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();