(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AnalyserNormalTemplateformController', AnalyserNormalTemplateformController);

    function AnalyserNormalTemplateformController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
			 FacilityId:  utl.Session.getCurrentFacilityId(),


        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.analyteid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
                        if (data.ActiveStatusId == 2)
                $scope.item.isRequested = true;
        };

             $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/AnalyserTemplate/GetAnalyserTemplateById',
                    data: { Id: $scope.currentcontext.id },
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
            $state.go('app.assettab.assetwarranty', { id: 0 });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

       $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'lis/AnalyserTemplate/AddAnalyserTemplate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/AnalyserTemplate/UpdateAnalyserTemplate';
            }
            $scope.item.AnalyteId = $scope.currentcontext.analyteid;

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
            var inputData = [
                 { "Key": "AnalyserTemplateType" },
                { "Key": "ActiveStatus" },
                { "Key": "Gender" }
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

    AnalyserNormalTemplateformController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();