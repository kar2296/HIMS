(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAllergyListController', patientAllergyListController);

    function patientAllergyListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.contextMenus = ['emr', 'ipemr', 'pastvisits', 'pmhx' ];
        $scope.Items = [];
        $scope.currentfilter = {
            Name: '',
            AllergyTypeId: -1,
            PatientAllergyStatusId: -1
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.confirmCallback = $uibModalInstance.close;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        //Favorite area starts
        $scope.favconfig = {
            favoritetypeid: 1,
            selectedlist: [],
            selecteddetail: {}
        };

        $scope.addFavorite = function () {
            utl.Modal.open('patientemr.patientallergy', {
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.favconfig.selecteddetail.ItemId },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.saveFavoritesCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.saveFavorites = function () {
            var list = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                var allergy = utl.Lookup.getObject($scope.lookup.Allergy, favitem.ItemId);

                var item = {
                    PatientId: $scope.currentcontext.pid, AllergyId: favitem.ItemId,
                    AllergyName: allergy.AllergyName, AllergyTypeId: allergy.AllergyTypeId,
                    Description: allergy.Description, StartDate: utl.Formatter.getCurrentDate(), EncounterId: utl.Session.getEncounterId(),
                    PatientAllergyStatusId: 1
                };
                list.push(item);
            }

            var options = {
                action: 'emr/patientallergy/ManagePatientAllergys',
                data: { Data: list },
                type: 'post',
                onComplete: $scope.saveFavoritesCallback
            };
            utl.Http.doAction(options);
        }

        //Favorite area ends

        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.AllergyTypeId },
                    { Key: 4, Value: $scope.currentfilter.PatientAllergyStatusId }
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
        //back

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard', {
                params: { context: $stateParams.context },
            });
        }

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientallergy', {
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
                action: 'emr/patientallergy/DeletePatientAllergy',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientallergy', {
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
                { field: "AllergyType.Description", displayName: $translate.instant('patientemr.patientallergy-list.type.lbl') },
                { field: "AllergyName", displayName: $translate.instant('patientemr.patientallergy-list.name.lbl') },
                {
                    field: "StartDate", displayName: $translate.instant('patientemr.patientallergy-list.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.StartDate'></ngformatdate>"
                },
                { field: "PatientAllergyStatus.Description", displayName: $translate.instant('patientemr.patientallergy-list.status.lbl') },
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
                { "Key": "Allergy" },
                { "Key": "AllergyType" },
                { "Key": "PatientAllergyStatus" }
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

    patientAllergyListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();