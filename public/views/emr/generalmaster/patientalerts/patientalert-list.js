(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAlertListController', patientAlertListController);

    function patientAlertListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AlertTypeId: -1,
            SeverityId: -1,
            PriorityId: -1,
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    /* { Key: 1, Value: $scope.currentfilter.name ? $scope.currentfilter.name : "" } */
                    { Key: 1, Value: $scope.currentfilter.AlertTypeId },
                    { Key: 2, Value: $scope.currentfilter.SeverityId },
                    { Key: 3, Value: $scope.currentfilter.PriorityId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.patientalert', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/PatientAlert/DeletePatientAlert',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
                //$state.go('app.remark', { id:row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AlertType.Description);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "AlertType.Description", displayName: $translate.instant('generalmaster.patientalert-list.alerttype.lbl') },
                { field: "Severity.Description", displayName: $translate.instant('generalmaster.patientalert-list.severity.lbl') },
                { field: "Priority.Description", displayName: $translate.instant('generalmaster.patientalert-list.priority.lbl') },
                {
                    field: "OnsetDate", displayName: $translate.instant('generalmaster.patientalert-list.onsetdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.OnsetDate'></ngformatdate>"
                },
                {
                    field: "ClosureDate", displayName: $translate.instant('generalmaster.patientalert-list.closuredate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.ClosureDate'></ngformatdate>"
                },
                {
                    field: "CreatedAt", displayName: $translate.instant('generalmaster.patientalert-list.recordeddate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.CreatedAt'></ngformatdate>"
                },
                { field: "User.UserName", displayName: $translate.instant('generalmaster.patientalert-list.recordedby.lbl') },
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
                { "Key": "AlertType" },
                { "Key": "Severity" },
                { "Key": "Priority" },
                { "Key": "ActiveStatus" }
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

    patientAlertListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();