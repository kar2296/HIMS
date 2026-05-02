(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('diagnosisFormController', diagnosisFormController);

    function diagnosisFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/diagnosis/GetDiagnosisById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            if ($scope.item.IsActive == true) { $scope.item.ActiveStatusId = 2; }
            else { $scope.item.ActiveStatusId = 3 }
            $scope.saveItem();
        }

        $scope.backToList = function () {

            $state.go('app.diagnosis');

        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
            // $scope.backToList();

        };
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.diagnosisform', { id: 0 });
        }
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/diagnosis/AddDiagnosis';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/diagnosis/UpdateDiagnosis';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }, {
                        Key: 5,
                        Value: 2
                    }, {
                        Key: 9,
                        Value: true
                    }]
                }
            },
            { "Key": "DiagnosisCodeScheme" },
            { "Key": "DiagnosisVersion" },
            { "Key": "CodeRegion" },
            { "Key": "Speciality" },
            { "Key": "BodySite" },
            { "Key": "DiagnosisCategory" },
            { "Key": "DiagnosisType" },
            { "Key": "Grade" },
            { "Key": "Side", Default: false },
            { "Key": "TestMasterPosition", Default: false },
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

    diagnosisFormController.$inject =  ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();