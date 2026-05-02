(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnDietPlanSectionController', cnDietPlanSectionController);

    function cnDietPlanSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getCNSectionBaseCtrl({$scope: $scope}));

        $scope.item = {
            // Id:0,
            CreatedBy: utl.Session.getCurrentUserId(),
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };
        //  $scope.currentcontext.id = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.item.pid = modalConfig.params.pid;
            $scope.currentcontext.cid  = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.item.pid = parseInt(utl.Session.getEMRPatientId());
            $scope.item.EncounterId = utl.Session.getEncounterId();
        }

        $scope.item.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.item.EncounterId = utl.Session.getEncounterId();

        if ($stateParams.pid)
            $scope.item.pid = parseInt($stateParams.pid);

        $scope.item.PatientId = $scope.item.pid;
        $scope.item.EncounterId = utl.Session.getEncounterId();

        $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        $scope.item.ConsultationId = $scope.currentcontext.cid;

        $scope.currentcontext.sectionid = $scope.getCurrentSectionId();

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item = data.Data[0];
                $scope.item.TherapeuticDietId = $scope.item.TherapeuticDietId ? parseInt( $scope.item.TherapeuticDietId) : $scope.item.TherapeuticDietId;
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.item.pid && $scope.item.pid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.item.pid },
                        { Key: 3, Value: $scope.item.ConsultationId }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/patientdietplan/GetPatientDietPlans',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else
               $state.go('patientemr.dietplantab.dietplan');
        }
        $scope.backToConsultList = function () {
            $state.go('patientemr.consultationtab.consultationcurrentlist', { pid: $scope.currentcontext.pid });
        }
        $scope.save = function () {
            $scope.item.PatientDietPlanStatusId = 1; // Draft
            $scope.saveItem();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        $scope.saveItem = function () {

            var actionName = 'emr/patientdietplan/AddPatientDietPlan';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'emr/patientdietplan/UpdatePatientDietPlan';
            }
            // $scope.item.PatientId = $scope.currentcontext.pid;

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            $scope.item = {
                CreatedBy: utl.Session.getCurrentUserId(),
            };
        };


        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DietType" },
                { "Key": "DietPreferrence" },
                { "Key": "FoodPreference" },
                { "Key": "TherapeuticDiet" },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    },
                    Default: false
                },
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

    cnDietPlanSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();