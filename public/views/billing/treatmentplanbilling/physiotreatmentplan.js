(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PhysioTreatmentPlanController', PhysioTreatmentPlanController);

    function PhysioTreatmentPlanController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.TreatmentPlanDetails = [];
        $scope.TreatmentPlan = [];
        $scope.currentfilter.PlanStatusId = 1;
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.PatientId = -1;

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.TreatmentPlan = [];
            if (res && res.Data && res.Data.length > 0) {
                for (var idx in res.Data) {
                    var planData = res.Data[idx];
                    if (planData.TreatmentPlanDetails.length > 0) {
                        planData.TreatmentName = planData.TreatmentPlanDetails[0].ServiceName;
                    }
                    $scope.TreatmentPlan.push(planData);
                }
            }
        };

        $scope.getList = function() {
            if ($scope.currentfilter.PatientId > 0) {
                var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
                var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
                var inputData = {
                    Params: [{
                            Key: 1,
                            Value: $scope.currentfilter.PatientId
                        },
                        {
                            Key: 3,
                            Value: $scope.currentfilter.PlanStatusId
                        },
                        {
                            Key: 7,
                            Value: FrmDate
                        },
                        {
                            Key: 8,
                            Value: ToDate
                        },
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'emr/TreatmentPlan/GetTreatmentPlans',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.executeplan = function(plandtl) {
            if (plandtl.Id) {
               utl.Modal.open('app.treatmentplanexecution', {
                params: {
                    id: plandtl.Id,
                },
                confirmCallback: $scope.viewDetails
            });
            }
        };

        $scope.viewDetailsCallback = function(scope, data, options, hasError) {
            $scope.TreatmentPlanDetails = [];
            $scope.TreatmentPlanDetails = data.Data;
        };

        $scope.viewDetails = function(plan) {
            if (plan.Id) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: plan.Id
                    }],
                };
                var options = {
                    action: 'emr/TreatmentPlanDetail/GetTreatmentPlanDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.viewDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = data;
            // $scope.getDetails();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "PlanStatus"
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }
    PhysioTreatmentPlanController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();