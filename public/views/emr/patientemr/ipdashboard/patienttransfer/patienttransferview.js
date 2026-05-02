(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientTransferViewController', patientTransferViewController);

    function patientTransferViewController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {};
        $scope.item = {};
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.TransRefDischargeTypeId = -1;
        $scope.item.TransferDate = new Date();
        $scope.item.StartTime = new Date();

        $scope.patienttrasnferinfo = [];


        if (modalConfig && modalConfig.params) {
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.item = modalConfig.params.item;
            $scope.item.encountertypeid = modalConfig.params.encountertypeid;
            $scope.item.StartTime = utl.Formatter.getTimeString24Hour($scope.item.TransferDate);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "TransRefDischargeType", Default: false },
                { "Key": "Department" },
                {
                    "Key": "Ward",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId() || null
                        },
                        {
                            Key: 3,
                            Value: 2
                        },
                        {
                            Key: 7,
                            Value: 1
                        },
                        ]
                    }
                },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
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

    patientTransferViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();