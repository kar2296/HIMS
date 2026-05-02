(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnConditionSectionController', cnConditionSectionController);

    function cnConditionSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getCNSectionBaseCtrl({$scope: $scope}));

        $scope.Items = [];
        $scope.currentfilter = {
            Name: '',
            ConditionTypeId: -1,
            ConditionStatusId: 1,
            IsPatientCondition: true,
        };

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.currentcontext.sectionid = $scope.getCurrentSectionId();

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
            $scope.currentcontext.sectionid = $scope.getCurrentSectionId();
        }

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
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.favconfig.selecteddetail.ItemId, cid: $scope.currentcontext.cid },
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

                var item = {
                    PatientId: $scope.currentcontext.pid, DiagnosisId: favitem.ItemId,
                    DiagnosisName: favitem.DisplayName, Description: favitem.DisplayName, ConditionDate: utl.Formatter.getCurrentDate(),
                    ConditionStatusId: 1, EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid, IsPatientCondition: 1
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
                    { Key: 6, Value: $scope.currentcontext.cid },
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

        //Grid Actions
        $scope.backToList = function () {
            $state.go('patientemr.consultationtab.consultationcurrentlist', {
                pid: $scope.currentcontext.pid,
                eid: $scope.currentcontext.eid,
                context: $scope.context
            });
        };
        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientcondition', {
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
                { field: "ConditionType.Description", displayName: $translate.instant('patientemr.patientcondition-list.conditiontype.lbl') },
                { field: "DiagnosisName", displayName: $translate.instant('patientemr.patientcondition-list.diagnosisname.lbl') },
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
        //viewConsultation
        $scope.viewConsultation = function (item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: { cid: item.Id, pid: $scope.currentcontext.pid }
            });
        }
        //previousnotes
        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.consultlist = res.Data;
            // consultlist = res.Data;
        };
        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [
                    // { Key: 2, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.pid },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.cid > 0) {
                inputData.Params.push( {
                    Key: 14,
                    Value: $scope.currentcontext.cid
                },)
            }
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };
        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
            //loadSectionData();
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {

                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: $scope.currentcontext.cid },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ConditionType" },
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
        $scope.getCurrentConsultation();
    }

    cnConditionSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();