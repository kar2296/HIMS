(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityHolidayListController', facilityHolidayListController);

    function facilityHolidayListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2
        };

        $scope.currentfilter.FacilityId = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.HolidayName },
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 3, Value: $scope.currentfilter.FacilityId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'HRM/Holiday/GetHolidays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $scope.openModal(0);
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.holidayform', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            });
        }
        $scope.backToList = function () {
            $state.go('app.leavesettingtab.leavetype');
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'HRM/Holiday/DeleteHoliday',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.HolidayName);
            }
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('admission.facilityId.lbl') },
                { field: "HolidayCode", displayName: $translate.instant('hrmaster.holiday.holidaycode.lbl') },
                { field: "HolidayName", displayName: $translate.instant('hrmaster.holiday.holidayname.lbl') },
                {
                    field: "HolidayDate",
                    displayName: $translate.instant('hrmaster.holiday.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.HolidayDate'></ngformatdate>"
                },
                { field: "WorkStatus.Description", displayName: $translate.instant('hrmaster.workweek.status.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('patientemr.patientfeedbacks-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
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
                { "Key": "WorkStatus" },
                { "Key": "Facility" },
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
    facilityHolidayListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();