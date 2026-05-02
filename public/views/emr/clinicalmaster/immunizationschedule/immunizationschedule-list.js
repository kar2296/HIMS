(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('immunizationScheduleListController', immunizationScheduleListController);

    function immunizationScheduleListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2,
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.ImmunizationName },
                    { Key: 2, Value: $scope.currentfilter.ScheduleId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/ImmunizationSchedule/GetImmunizationSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.immunizationscheduleform', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/ImmunizationSchedule/DeleteImmunizationSchedule',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.ImmunizationName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ScheduleName.Description", displayName: $translate.instant('clinicalmaster.immunizationSchedule.name.lbl') },
                { field: "ImmunizationName", displayName: $translate.instant('clinicalmaster.immunization-form.immunizationname.lbl') },
                { field: "ScheduleFlag.Description", displayName: $translate.instant('clinicalmaster.immunization-form.scheduleflag.lbl') },
                { field: "Route.Description", displayName: $translate.instant('clinicalmaster.immunization-form.route.lbl') },
                { field: "Dosage.Description", displayName: $translate.instant('clinicalmaster.immunizationSchedule.dose.lbl') },
                {
                    field: "Duration", displayName: $translate.instant('clinicalmaster.immunization-form.duration.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +                    
                    "<span >{{row.entity.Duration}}&nbsp;</span>" +
                    "<span >&nbsp;</span>" +
                    "<span >{{row.entity.Period.Description}}&nbsp;</span>" +
                    "</span></div>"
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.immunization-list.status.lbl') },
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "ScheduleName" },
                { "Key": "Period" },
                { "Key": "Dosage", Default: false },
                { "Key": "Route" },
                { "Key": "ScheduleFlag" },
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

    immunizationScheduleListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();