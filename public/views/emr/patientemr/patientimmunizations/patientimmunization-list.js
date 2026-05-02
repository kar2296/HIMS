(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientImmunizationListController', patientImmunizationListController);

    function patientImmunizationListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
        $scope.currentfilter = {
            ImmunizationId: -1,
            ImmunizationTypeId: -1,
            ImmunizationStatusId: 2
        };
        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.hasImmunizationSchedule = false;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        //Favorite area starts
        $scope.favconfig = {
            favoritetypeid: 2,
            selectedlist: [],
            selecteddetail: {}
        };

        $scope.addFavorite = function () {
            utl.Modal.open('patientemr.patientimmunization', {
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.favconfig.selecteddetail.ItemId },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.saveFavoritesCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.saveFavorites = function () {
            var list = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                var immunization = utl.Lookup.getObject($scope.lookup.Immunization, favitem.ItemId);

                var item = {
                    PatientId: $scope.currentcontext.pid, ImmunizationId: favitem.ItemId,
                    ImmunizationName: immunization.ImmunizationName, Description: immunization.Description, PerformedDate: utl.Formatter.getCurrentDate(),
                    ImmunizationStatusId: 1, EncounterId: utl.Session.getEncounterId(),
                };
                list.push(item);
            }

            var options = {
                action: 'emr/patientimmunization/ManagePatientImmunizations',
                data: { Data: list },
                type: 'post',
                onComplete: $scope.saveFavoritesCallback
            };
            utl.Http.doAction(options);
        }

        //Favorite area ends
        $scope.schedulebtnclick = function () {
            if ($scope.currentcontext.hasImmunizationSchedule) {
                utl.Modal.open('patientemr.patientimmunizationschedule', {
                    params: { id: 0 },
                    confirmCallback: $scope.getList,
                    cancelCallback : $scope.getList
                });
            } else {
                $scope.scheduleDiag = utl.Modal.openTmpl({
                    templateUrl: 'newimmuschedule.html',
                    relativeto: '#btnschedule',
                    scope : $scope
                });
            }
        }

        $scope.closeScheduledModal = function() {
            $scope.scheduleDiag.dismiss();
        }

        //Schedule section starts

        $scope.saveScheduleCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.closeScheduledModal();
            $scope.currentcontext.hasImmunizationSchedule = true;
            $scope.schedulebtnclick();
        }

        $scope.saveSchedule = function () {

            var actionName = 'emr/PatientImmunizationSchedule/AddPatientImmunizationSchedule';

            var scheduledetails = {
                ScheduleName: $scope.currentcontext.ScheduleName,
                PatientId: $scope.currentcontext.pid,
                EncounterId: utl.Session.getEncounterId(),
                PatientDOB : utl.Session.getPatientDOB()
            }

            var options = {
                action: actionName,
                data: { Data: scheduledetails },
                type: 'post',
                onComplete: $scope.saveScheduleCallback
            };
            utl.Http.doAction(options);
        };

        //Schedule section ends

        function getPatientImmunizationScheduleByPIdCallback(scope, res, options, hasError) {
            var response = res.Data;
            console.log(response);
            if (res.Data.length > 0) {
                $scope.currentcontext.hasImmunizationSchedule = true;
            }
        }

        $scope.getPatientImmunizationScheduleByPatientId = function () {
            if ($scope.currentcontext.pid > 0) {

                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.pid },
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/PatientImmunizationSchedule/GetPatientImmunizationSchedules',
                    data: inputData,
                    type: 'post',
                    onComplete: getPatientImmunizationScheduleByPIdCallback
                };

                utl.Http.doAction(options);
            }
        }

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.ImmunizationTypeId },
                    { Key: 4, Value: $scope.currentfilter.ImmunizationStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientimmunization/GetPatientImmunizations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
            //back
            $scope.doctor_dashboard = function () {
                $state.go('app.doctordashboard');
            }
            $scope.patient_dashboard = function () {
                $state.go('patientemr.emrdashboard');
            }
        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientimmunization', {
                params: { id: 0, pid: $scope.currentcontext.pid },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientimmunization/DeletePatientImmunization',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientimmunization', {
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ImmunizationName", displayName: $translate.instant('patientemr.patientimmunization-list.immunizationname.lbl') },
                { field: "ImmunizationType.Description", displayName: $translate.instant('patientemr.patientimmunization-list.immunizationtype.lbl') },
                { field: "Route.Description", displayName: $translate.instant('patientemr.patientimmunization-list.siteorroute.lbl') },
                {
                    field: "PerformedDate", displayName: $translate.instant('patientemr.patientimmunization-list.performeddate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.PerformedDate'></ngformatdate>"
                },
                { field: "ImmunizationStatus.Description", displayName: $translate.instant('patientemr.patientimmunization-list.status.lbl') },
                //{ field: "StatusTODO", displayName: $translate.instant('patientemr.patientimmunization-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.getPatientImmunizationScheduleByPatientId();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Immunization" },
                { "Key": "ImmunizationType" },
                { "Key": "ImmunizationStatus" },
                { "Key": "ScheduleName" }
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

    patientImmunizationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();