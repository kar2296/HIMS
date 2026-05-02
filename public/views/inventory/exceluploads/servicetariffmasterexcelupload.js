(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceTariffMasterExceluploadController', ServiceTariffMasterExceluploadController);

    function ServiceTariffMasterExceluploadController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: [-1, utl.Session.getCurrentFacilityId()],
            SourceTypeId: -1,
            Name: '',
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        $scope.backtoDashboard = function () {
            $state.go('app.exceluploads');
        }
        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 8, Value: true }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/ServiceRateCategory/GetServiceRateCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.openModal = function (Id) {
            utl.Modal.open('app.importservicetariffmasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.itemUpload = function() {
            $scope.openModal(0,false);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/ServiceRateCategory/DeleteServiceRateCategory',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.open('app.serviceratecategory', {
                    params: { id: entity.Id },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ServiceRateCategory);
            } else if (actionType == 'view') {
                $scope.openModal(entity.Id);
                //$state.go('app.remark', { id:entity.Id });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('clinicalmaster.serviceratecategory-list.facility.lbl') },
                { field: "ServiceRateCategory", displayName: $translate.instant('clinicalmaster.serviceratecategory-list.serviceratecategory.lbl') },
                // { field: "Percentage", displayName: $translate.instant('clinicalmaster.serviceratecategory-list.percentage.lbl') },
                {
                    field: "IsBasic", displayName: $translate.instant('clinicalmaster.serviceratecategory-list.isbasic.lbl'),
                    cellTemplate: "<displayyesno input-val='entity.IsBasic'></displayyesno>"
                },
                // { field: "IsDefault", displayName: $translate.instant('clinicalmaster.serviceratecategory-list.isdefault.lbl'),
                //     cellTemplate : "<displayyesno input-val='entity.IsDefault'></displayyesno>" },
                // { field: "EncounterType.Description", displayName: $translate.instant('clinicalmaster.serviceratecategory-list.encountertype.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.serviceratecategory-list.status.lbl') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "SourceType" },
                { "Key": "ActiveStatus" },
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

    ServiceTariffMasterExceluploadController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();