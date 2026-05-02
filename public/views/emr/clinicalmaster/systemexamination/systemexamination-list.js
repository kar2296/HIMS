(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SystemExaminationListController', SystemExaminationListController);

    function SystemExaminationListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            CountryId: -1,
            StateId: -1,
            CityId: -1,
            ActiveStatusId: 2,
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Code },
                    { Key: 3, Value: $scope.currentfilter.SysExaminationTypeId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'ClinicalMaster/SystemExamination/GetSystemExaminations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.systemexaminationform', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
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
                action: 'ClinicalMaster/systemexamination/DeleteSystemExamination',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "Code", displayName: $translate.instant('clinicalmaster.systemexamination.code.lbl'),

                },
                {
                    field: "Name", displayName: $translate.instant('clinicalmaster.systemexamination.name.lbl'),

                },
                {
                    field: "SysExaminationType.Description", displayName: $translate.instant('clinicalmaster.systemexamination.type.lbl'),

                },
                {
                    field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.systemexamination.status.lbl'),

                },

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
                { "Key": "SysExaminationType" },


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

    SystemExaminationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();