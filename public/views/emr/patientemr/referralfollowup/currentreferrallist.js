(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReferralFollowupcurrentreferrallistController', ReferralFollowupcurrentreferrallistController);

    function ReferralFollowupcurrentreferrallistController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            // ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.PatientId = $stateParams.pid;
        else
            $scope.currentcontext.PatientId = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.EncounterId = $stateParams.eid;
        else
            $scope.currentcontext.EncounterId = parseInt(utl.Session.getEncounterId());

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.items = res.Data;
            // for (var idx in $scope.items) {
            //     var item = $scope.items[idx];
            //     if (idx === 0) {
            //         item.CanShowDetails = true;
            //     } else {
            //         item.CanShowDetails = false;
            //     }
            // }
        };

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.PatientId
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentcontext.EncounterId
                    // },
                    {
                        Key: 7,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    ReferralFollowupcurrentreferrallistController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();