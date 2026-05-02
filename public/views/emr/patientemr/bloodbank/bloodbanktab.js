(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BloodBankTabController', BloodBankTabController);

    function BloodBankTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        $scope.currentcontext = {
            id: parseInt($stateParams.id)
        };
        $scope.item = {};
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
        }
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.SelectedItem = {};
        $scope.tabs = [
            { title: $translate.instant('patientemr.bloodbank.requirementdetail.lbl'), state: 'patientemr.bloodbanktab.bloodrequest', canDisable: false },
            { title: $translate.instant('patientemr.bloodbank.receipientdetail.lbl'), state: 'patientemr.bloodbanktab.blooddonor', canDisable: canDisableTab },
            { title: $translate.instant('patientemr.bloodbank.donordetail.lbl'), state: 'patientemr.bloodbanktab.blooddonor', canDisable: canDisableTab },
            { title: $translate.instant('patientemr.bloodbank.transfusiontest.lbl'), state: 'patientemr.bloodbanktab.bloodtransfusion', canDisable: canDisableTab },
        ];

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }
        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "BloodPriority", Default: false },
                { "Key": "Feedbacks", Default: false }
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
        }
        $scope.initLookup();
    }

    BloodBankTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();