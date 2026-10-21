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

        $scope.isLoading = false;
        $scope.selectedPlan = null;
        $scope.selectedPatient = null;

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.isLoading = false;
            $scope.TreatmentPlan = [];
            if (res && res.Data && res.Data.length > 0) {
                for (var idx in res.Data) {
                    var planData = res.Data[idx];
                    if (planData.TreatmentPlanDetails && planData.TreatmentPlanDetails.length > 0) {
                        planData.TreatmentName = planData.TreatmentPlanDetails[0].ServiceName;
                    }
                    $scope.TreatmentPlan.push(planData);
                }
            }
            $scope.refreshReactProps();
        };

        $scope.getList = function() {
            $scope.isLoading = true;
            $scope.refreshReactProps();

            var patId = $scope.currentfilter.PatientId && $scope.currentfilter.PatientId > 0 ? $scope.currentfilter.PatientId : -1;
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');

            var params = [{
                    Key: 1,
                    Value: patId
                },
                {
                    Key: 7,
                    Value: FrmDate
                },
                {
                    Key: 8,
                    Value: ToDate
                }
            ];

            if ($scope.currentfilter.PlanStatusId && $scope.currentfilter.PlanStatusId > 0) {
                params.push({
                    Key: 3,
                    Value: $scope.currentfilter.PlanStatusId
                });
            }

            var inputData = {
                Params: params,
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
            $scope.TreatmentPlanDetails = (data && data.Data) ? data.Data : [];
            $scope.refreshReactProps();
        };

        $scope.viewDetails = function(plan) {
            if (plan.Id) {
                $scope.selectedPlan = plan;
                $scope.refreshReactProps();
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
            $scope.getList();
        };

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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                treatmentPlans: $scope.TreatmentPlan,
                treatmentPlanDetails: $scope.TreatmentPlanDetails,
                selectedPlan: $scope.selectedPlan,
                selectedPatient: $scope.selectedPatient,
                isLoading: $scope.isLoading || false
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'fromDateChange':
                    $scope.currentfilter.FromBillDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'toDateChange':
                    $scope.currentfilter.ToBillDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'statusChange':
                    $scope.currentfilter.PlanStatusId = (payload.value !== undefined && payload.value !== null) ? Number(payload.value) : -1;
                    $scope.refreshReactProps();
                    break;
                case 'patientChange':
                    $scope.currentfilter.PatientId = payload.patientId ? Number(payload.patientId) : -1;
                    $scope.selectedPatient = payload.patient || null;
                    $scope.refreshReactProps();
                    break;
                case 'fetch':
                    $scope.getList();
                    break;
                case 'reset':
                    $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                    $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                    $scope.currentfilter.PlanStatusId = -1;
                    $scope.currentfilter.PatientId = -1;
                    $scope.selectedPatient = null;
                    $scope.selectedPlan = null;
                    $scope.TreatmentPlanDetails = [];
                    $scope.getList();
                    break;
                case 'viewDetails':
                    $scope.viewDetails(payload);
                    break;
                case 'updateBills':
                    $scope.updateBills(payload);
                    break;
                case 'detailbills':
                    $scope.detailbills(payload);
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.initLookup();
    }
    TreatmentPlanBillingController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();