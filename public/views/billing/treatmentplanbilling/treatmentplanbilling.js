(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('TreatmentPlanBillingController', TreatmentPlanBillingController);

    function TreatmentPlanBillingController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.getDetailsCallback = function(scope, data, options, hasError) {
            // var totallength = data.Data.length;
            // var paidLengthData = [];
            // for (var idx in data.Data) {
            //     var item = data.Data[idx];
            //     if (item.IsPaid) {
            //         paidLengthData.push(item);
            //     }
            // }
            var plan = options.data.Data.plan;
            if (data.Data.length == 0) {
                utl.Modal.open('app.updatetreatmentplanbilling', {
                    params: {
                        pdid: plan.Id,
                        eid: plan.EncounterId,
                        pid: plan.PatientId,
                        did: plan.DoctorId,
                        tp: 'OP',
                        from: 'header'
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('Partially Paid'));
            }
        };

        $scope.getDetails = function(plan) {
            if (plan.Id) {
                var inputData = {
                    Data: {
                        plan: plan
                    },
                    Params: [{
                            Key: 1,
                            Value: plan.Id
                        },
                        {
                            Key: 10,
                            Value: true
                        }
                    ],
                };
                var options = {
                    action: 'emr/TreatmentPlanDetail/GetTreatmentPlanDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.updateBills = function(plan) {
            if (plan.Id) {
                $scope.getDetails(plan);

            }
        };

        $scope.detailbills = function(plandtl) {
            if (plandtl.Id) {
                if (!plandtl.IsPaid) {
                    utl.Modal.open('app.updatetreatmentplanbilling', {
                        params: {
                            eid: plandtl.EncounterId,
                            pid: plandtl.PatientId,
                            did: plandtl.DoctorId,
                            pdid: plandtl.Id,
                            tp: 'OP',
                            from: 'details'
                        },
                        confirmCallback: $scope.getList
                    });
                } else {
                    utl.Alert.showErrorMsg($translate.instant('Already Paid...'));
                }
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
    TreatmentPlanBillingController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();