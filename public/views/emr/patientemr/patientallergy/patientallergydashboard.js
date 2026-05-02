(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAllergyDashboardController', patientAllergyDashboardController);

    function patientAllergyDashboardController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 1 }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "AllergyType.Description", displayName: $translate.instant('patientemr.patientallergy-list.type.lbl') },
                { field: "AllergyName", displayName: $translate.instant('patientemr.patientallergy-list.name.lbl') },
                {
                    field: "StartDate", displayName: $translate.instant('patientemr.patientallergy-list.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.StartDate'></ngformatdate>"
                },
                { field: "PatientAllergyStatus.Description", displayName: $translate.instant('patientemr.patientallergy-list.status.lbl') },
                /* {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                } */
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.getList();
    }

    patientAllergyDashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();