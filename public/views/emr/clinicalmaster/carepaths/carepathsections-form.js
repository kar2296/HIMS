(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('carepathsectionFormController', carepathsectionFormController);

    function carepathsectionFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            IsManditory: true,

        };

        $scope.currentcontext = {};
        // $scope.currentcontext.id = parseInt($stateParams.carepathsectionid);
        // $scope.currentcontext.carepathid = parseInt($stateParams.id);

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id)
            $scope.currentcontext.carepathid = parseInt($stateParams.id)
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/CarePathSection/GetCarePathSectionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.backToList = function () {
        //     $state.go('app.carepathtab.sections');
        // }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.getsectionsCallBack = function (scope, data, options, hasError) {
            $scope.Section = data;
            $scope.item.SectionTypeId = $scope.Section.SectionTypeId;
        }
        $scope.getsections = function () {
            var options = {
                action: 'clinicalmaster/SectionMaster/GetSectionMasterById',
                data: { Id: $scope.item.SectionId },
                type: 'post',
                onComplete: $scope.getsectionsCallBack
            };
            utl.Http.doAction(options);
        }
        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'clinicalmaster/CarePathSection/AddCarePathSection';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/CarePathSection/UpdateCarePathSection';
            }

            $scope.item.CarePathId = $scope.currentcontext.carepathid;
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

                { "Key": "SectionMaster" },
                { "Key": "SectionType" },
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

    carepathsectionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();