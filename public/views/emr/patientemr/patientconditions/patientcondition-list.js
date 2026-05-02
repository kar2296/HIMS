(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientConditionListController', patientConditionListController);

    function patientConditionListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
        $scope.currentfilter = {
            Name: '',
            ConditionTypeId: -1,
            ConditionStatusId: 1,
            IsPatientCondition: true,
        };

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        //Favorite area starts
        $scope.favconfig = {
            favoritetypeid: 4,
            selectedlist: [],
            selecteddetail: {}
        };

        $scope.addFavorite = function () {
            utl.Modal.open('patientemr.patientcondition', {
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.favconfig.selecteddetail.ItemId },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.saveFavoritesCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.saveFavorites = function () {
            var list = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                var condition = utl.Lookup.getObject($scope.lookup.Diagnosis, favitem.ItemId);

                var item = {
                    PatientId: $scope.currentcontext.pid, DiagnosisId: favitem.ItemId,
                    DiagnosisName: condition.DiagnosisName, Code: condition.Code, Description: condition.Description, ConditionDate: utl.Formatter.getCurrentDate(), EncounterId: utl.Session.getEncounterId(),
                    ConditionStatusId: 1,
                    IsPatientCondition: 1
                };
                list.push(item);
            }

            var options = {
                action: 'emr/patientcondition/ManagePatientConditions',
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
                    { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.ConditionTypeId },
                    { Key: 7, Value: $scope.currentfilter.IsPatientCondition }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
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
            $state.go('patientemr.emrdashboard');
        }

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientcondition', {
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
                action: 'emr/patientcondition/DeletePatientCondition',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientcondition', {
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
                { field: "ConditionType.Description", displayName: $translate.instant('patientemr.patientcondition-list.conditiontype.lbl') },
                { field: "DiagnosisName", displayName: $translate.instant('patientemr.patientcondition-list.diagnosisname.lbl') },
			    // { field: "Code", displayName: $translate.instant('patientemr.patientcondition-list.code.lbl') },
                { field: "ConditionStatus.Description", displayName: $translate.instant('patientemr.patientcondition-list.conditionstatus.lbl') },
                {
                    field: "ConditionDate", displayName: $translate.instant('patientemr.patientcondition-list.conditiondate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.ConditionDate'></ngformatdate>"
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
                { "Key": "ConditionType" },
                { "Key": "Diagnosis" ,  Request: {
                    Params: [ { Key: 5, Value: 2 }, ],
                    PageContext: { PageSize: -1,  PageNumber: 1 }
                } },
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

    patientConditionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();