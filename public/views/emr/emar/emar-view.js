(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('emarviewController', emarviewController);

    function emarviewController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.EmarData = [];
        $scope.currentfilter = {
            encounter: utl.Session.getPatientEncounter(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.presid)
            $scope.currentcontext.presid = $stateParams.presid;

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.EmarData = res.Data;
        };
        $scope.getList = function() {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 1,
                        Value: $scope.currentcontext.presid
                    },
                    // {
                    //     Key: 9,
                    //     Value: ToDate
                    // },

                ],
            };

            var options = {
                action: 'emr/Emar/GetEmars',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [{ "Key": "AdministerStatus" }, ];

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

    emarviewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();