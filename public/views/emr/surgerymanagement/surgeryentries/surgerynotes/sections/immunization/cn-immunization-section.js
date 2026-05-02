(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otcnImmunizationSectionController', otcnImmunizationSectionController);

    function otcnImmunizationSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ImmunizationId: -1,
            ImmunizationTypeId: -1,
            ImmunizationStatusId: -1
        };
        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }
        $scope.currentcontext = {};

        $scope.currentcontext.otregid = $scope.$parent.currentcontext.id;
        $scope.currentcontext.pid = $scope.$parent.currentcontext.pid;
        $scope.currentcontext.eid = $scope.$parent.currentcontext.eid;


        $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;

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
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.favconfig.selecteddetail.ItemId, cid: $scope.currentcontext.cid },
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
                    ImmunizationStatusId: 1, EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
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

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.ImmunizationTypeId },
                    { Key: 4, Value: $scope.currentfilter.ImmunizationStatusId },
                    { Key: 6, Value: $scope.currentcontext.cid }
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

        //Grid Actions
        $scope.backToList = function () {
            $state.go('patientemr.consultations', { pid: $scope.currentcontext.pid });
        }
        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientimmunization', {
                params: { id: 0, pid: $scope.currentcontext.pid, cid: $scope.currentcontext.cid },
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
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid, cid: $scope.currentcontext.cid },
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Immunization" },
                { "Key": "ImmunizationType" },
                { "Key": "ImmunizationStatus" }
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

    otcnImmunizationSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();