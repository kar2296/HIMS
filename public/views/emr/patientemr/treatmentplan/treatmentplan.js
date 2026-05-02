(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('treatmentplanController', treatmentplanController);

    function treatmentplanController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            PlanStatusId: 1,
            TreatmentPlanDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentfilter.DoctorId = $scope.currentcontext.encounter.DoctorId;


        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.TreatmentPlanDetails.length > 0) {
                    item.TreatmentName = item.TreatmentPlanDetails[0].ServiceName;
                }
                vm.gridConfig.data.push(item);
            }

            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function() {
            var FrmDate = $filter('date')($scope.currentfilter.TreatmentPlanDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.TreatmentPlanDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.PlanStatusId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentcontext.eid
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
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
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

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        };

        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        };

        //Grid Actions
        $scope.addNew = function() {
            if ($scope.currentcontext.encounter.IsBillLock == false) {
                utl.Modal.open('patientemr.treatmentplanform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.getList
                });
            } else
                utl.Alert.showErrorMsg(" Bill is Locked");
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.dashboard = function() {
            $state.go('patientemr.patientdashboard');
        }

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/TreatmentPlan/DeleteTreatmentPlan',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit' || actionType == 'view') {
                utl.Modal.open('patientemr.treatmentplanform', {
                    params: {
                        id: entity.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'planupdate') {
                $state.go('patientemr.treatmentplanupdate', {
                    id: entity.Id,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                });
                // utl.Modal.open('patientemr.treatmentplanupdate', {
                //     params: {
                //         id: entity.Id,
                //         pid: $scope.currentcontext.pid,
                //         eid: $scope.currentcontext.eid
                //     },
                //     confirmCallback: $scope.getList
                // });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "PlanRequestDate",
                    displayName: $translate.instant('Request Date'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PlanRequestDate'></ngformatdate>"
                },
                {
                    field: "PlanNumber",
                    displayName: $translate.instant('Plan Number'),
                },
                // {
                //     field: "TreatmentName",
                //     displayName: $translate.instant('Treatment Name'),
                // },
                {
                    field: "PlanScheduledFrom",
                    displayName: $translate.instant('Scheduled From'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PlanScheduledFrom'></ngformatdate>"
                },
                {
                    field: "PlanScheduledTo",
                    displayName: $translate.instant('Scheduled To'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PlanScheduledTo'></ngformatdate>"
                },
                {
                    field: "PlanStatus.Description",
                    displayName: $translate.instant('appmanager.users.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><i class="fas fa-file-medical-alt" tooltip-placement="bottom" uib-tooltip="Treatment Plan"></i></span>\
                                 <span class="grid-action" ng-click="handleEvents(\'planupdate\',entity)"><i class="fas fa-history" tooltip-placement="bottom" uib-tooltip="Treatment History"></i></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "PlanStatus"
            }, ];

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

    treatmentplanController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();