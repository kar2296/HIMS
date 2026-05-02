(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureFormController', procedureFormController);

    function procedureFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.savehitCompleted = false;

        $scope.tabs = [
            { title: $translate.instant('clinicalmaster.proceduretab.tabdetails.lbl'), state: 'app.proceduretab.details', canDisable: false },
            { title: $translate.instant('clinicalmaster.proceduretab.tabprocedurealiases.lbl'), state: 'app.proceduretab.procedurealiases', canDisable: canDisableTab },
            { title: $translate.instant('clinicalmaster.proceduretab.proceduretemplates.lbl'), state: 'app.proceduretab.proceduretemplates', canDisable: canDisableTab }
        ];

        $scope.switchTab = function(tab) {
            //$state.go(tab.state);
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/procedure/GetProcedureById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal == true) {
                $state.go('app.surgeryentry-form');
            } else {
                $state.go('app.procedures');
            }
        }


        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.confirmCallback();
            $scope.backToList();
        };

        $scope.clear = function() {
            $scope.item = {};
        }

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.savehitCompleted = true;
            var actionName = 'clinicalmaster/procedure/AddProcedure';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/procedure/UpdateProcedure';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ProcedureCodeScheme" },
                { "Key": "ProcedureVersion" },
                { "Key": "CodeRegion" },
                { "Key": "Speciality" },
                { "Key": "Equipment" },
                { "Key": "BodySite" },
                { "Key": "ProcedureType" },
                { "Key": "ProcedureOperationType" },
                { "Key": "ProcedureCategory" },
                { "Key": "ProcedureTechnique" },
                { "Key": "ProcedureSubCategory" },
                { "Key": "AnaesthesiaType" },
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

    procedureFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();