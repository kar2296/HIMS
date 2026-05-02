(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('carepathprescriptionListController', carepathprescriptionListController);

    function carepathprescriptionListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };

        $scope.currentcontext = {};
        $scope.currentcontext.carepathid = parseInt($stateParams.id);
        // 13-02-17
        $scope.backToForm = function () {
            $state.go('app.carepathtab.details');
        }
        // 13-02-17
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.carepathid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/CarePathPrescription/GetCarePathPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function () {
        //     $state.go('app.carepathtab.carepathprescription', { carepathprescriptionid: 0 });
        // }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.carepathtab.carepathprescription', {
                params: { id: Id }, confirmCallback: $scope.getList
            }
            );
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }
        $scope.backToList = function () {
            $state.go('app.carepaths', { id: 0 });
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/CarePathPrescription/DeleteCarePathPrescription',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                // $state.go('app.carepathtab.carepathprescription', { carepathprescriptionid: row.entity.Id });
                $scope.openModal(row.entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,

            columnDefs: [
                { field: "DrugMaster.DrugName", displayName: $translate.instant('clinicalmaster.carepathprescriptions.drugname.lbl') },
                { field: "GenericMaster.GenericName", displayName: $translate.instant('clinicalmaster.carepathprescriptions.genericname.lbl') },
                { field: "DrugRoute.Description", displayName: $translate.instant('clinicalmaster.carepathprescriptions.drugroute.lbl') },
                { field: "DrugFrequency.Name", displayName: $translate.instant('clinicalmaster.carepathprescriptions.drugfrequency.lbl') },
                { field: "Dosage", displayName: $translate.instant('clinicalmaster.carepathprescriptions.dosage.lbl') },
                { field: "Quantity", displayName: $translate.instant('clinicalmaster.carepathprescriptions.quantity.lbl') },
                { field: "Duration", displayName: $translate.instant('clinicalmaster.carepathprescriptions.Duration.lbl') },
                { field: "IsManditory", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.ismanditory.lbl') },
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

    carepathprescriptionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();