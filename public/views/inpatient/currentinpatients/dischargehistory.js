(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discharpatienthistoryController', discharpatienthistoryController);

    function discharpatienthistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item={};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.billdId = parseInt(modalConfig.params.billdId);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.item = {
        //     EncounterId: $scope.currentcontext.eid
        // }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.dischargeEvent = data;
            console.log($scope.item.dischargeEvent,'here is the item');
        };
        $scope.getItem = function (pageNo) {
                var options = {
                    action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
        };
        $scope.getencountersCallback = function (scope, data, options, hasError) {
            $scope.item.encounter = data;
            console.log($scope.item.encounter, 'encounter');
        };
        $scope.getEncounter = function () {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data:{ Id: $scope.currentcontext.eid }, 
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getPatientbillCallback = function (scope, data, options, hasError) {
            $scope.item.billdetails = data;
            console.log($scope.item.bill, 'billdeatilsforpatient');
        };
        $scope.getPatientbill = function () {
            var options = {
                action: 'billing/PatientBills/GetPatientBillsById',
                data:{ Id: $scope.currentcontext.billdId }, 
                type: 'post',
                onComplete: $scope.getPatientbillCallback
            };

            utl.Http.doAction(options);
        };
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        }
        //autosearch related code ends for Doctors
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getEncounter();
            $scope.getPatientbill();
        }
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal)
                $scope.confirmCallback();
        }
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "DischargeType"
                }
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

    discharpatienthistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();