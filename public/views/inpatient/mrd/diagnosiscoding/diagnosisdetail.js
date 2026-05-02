(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('diagnosisdetailsController', diagnosisdetailsController);

    function diagnosisdetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }))

        $scope.Items = [];
        $scope.currentfilter = {
            DiagnosisName: '',
            ConditionTypeId: -1,
            ConditionStatusId: 1,
        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.Id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.PatientId);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.item.PatientId = $scope.currentcontext.pid;
        // $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        //Favorite area starts
        $scope.favconfig = {
            favoritetypeid: 4,
            selectedlist: [],
            selecteddetail: {}
        };
        $scope.addFavorite = function() {
            utl.Modal.open('app.diagnosisdetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.favconfig.selecteddetail.ItemId },
                confirmCallback: $scope.getList
            });
        }
        $scope.saveFavoritesCallback = function(scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.saveFavorites = function() {
                var list = [];
                for (var idx in $scope.favconfig.selectedlist) {
                    var favitem = $scope.favconfig.selectedlist[idx];
                    var condition = utl.Lookup.getObject($scope.lookup.Diagnosis, favitem.ItemId);
                    var item = {
                        PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    DiagnosisId: favitem.ItemId,
                    DiagnosisName: condition.DiagnosisName,
                    Code: condition.Code,
                    ConditionTypeId:1,
                    Description: condition.Description,
                    Date: utl.Formatter.getCurrentDate(),
                        ConditionStatusId: 1
                    };
                    list.push(item);
                }
                var options = {
                    action: 'emr/PatientDiagnosis/ManagePatientDiagnosiss',
                    data: { Data: list },
                    type: 'post',
                    onComplete: $scope.saveFavoritesCallback
                };
                utl.Http.doAction(options);
            }
            //Favorite area ends
        $scope.getList = function() {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.eid },
                    { Key: 2, Value: $scope.currentfilter.ConditionTypeId },
                    { Key: 3, Value: $scope.currentfilter.DiagnosisName },
                    { Key: 4, Value: $scope.currentfilter.ConditionStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'emr/PatientDiagnosis/GetPatientDiagnosiss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        //Grid Actions
        $scope.addNew = function() {
            utl.Modal.open('app.diagnosisdetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid },
                confirmCallback: $scope.getList
            });
        }
        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/PatientDiagnosis/DeletePatientDiagnosis',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function(actionType, row) {
            if (actionType == 'edit') {
                utl.Modal.open('app.diagnosisdetail', {
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: false,
            columnDefs: [{
                    field: "ConditionType.Description",
                    displayName: $translate.instant('patientemr.patientcondition-list.conditiontype.lbl')
                },
                {
                    field: "DiagnosisName",
                    displayName: $translate.instant('patientemr.patientcondition-list.diagnosisname.lbl')
                },
                {
                    field: "ConditionStatus.Description",
                    displayName: $translate.instant('patientemr.patientcondition-list.conditionstatus.lbl')
                },
                {
                    field: "Date",
                    displayName: $translate.instant('mrd.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.Date'></ngformatdate>"
                },
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ConditionType" },
                { "Key": "Diagnosis" },
                { "Key": "ConditionStatus" },
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
    diagnosisdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();