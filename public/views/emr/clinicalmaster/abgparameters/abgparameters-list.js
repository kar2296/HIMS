(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ABGParameterListController', ABGParameterListController);

    function ABGParameterListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ABGParameters: "",
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.ABGParameters },
                    { Key: 2, Value: $scope.currentfilter.ParameterTypeId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/ABGParameters/GetABGParameterss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.abgparametersform', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions
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
                action: 'clinicalmaster/ABGParameters/DeleteABGParameters',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('admission.facilityId.lbl') },
                { field: "ABGParameters", displayName: $translate.instant('clinicalmaster.abgparameters.abgparams.lbl') },
                { field: "ParameterType.Description", displayName: $translate.instant('clinicalmaster.abgparameters.type.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.abgparameters.descrption.lbl') },
                {
                    field: "NormalFrom", displayName: $translate.instant('clinicalmaster.abgparameters.reference.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.NormalFrom}} - {{row.entity.NormalTo}} </div>'
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.allergy-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // {actiontype: 'delete', display : 'common.deleteaction.lbl'}
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
                { "Key": "ParameterType" },
                { "Key": "Facility" },
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

    ABGParameterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();