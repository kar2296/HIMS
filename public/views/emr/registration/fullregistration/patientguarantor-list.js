(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientguarantorListController', patientguarantorListController);

    function patientguarantorListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.Items = [];
        $scope.currentfilter = {
            status: 2,
            guarantortype: -1
        };

        $scope.gridbuttonaction = false;

        $scope.currentcontext = {
            canselectrow: false
        };
        $scope.currentcontext.isFinalized = false;
        $scope.currentcontext.ismodal = modalConfig && modalConfig.params ? true : false

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.isFinalized = modalConfig.params.isFinalized;
            $scope.currentcontext.patientid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.canselectrow = (modalConfig.params.parent == "txn") ? true : false;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.patientid = parseInt($stateParams.id);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.IsRankExist = false;
            for (var idx in res.Data) {
                if (!$scope.IsRankExist && res.Data[idx].Rank == 1) {
                    $scope.IsRankExist = true;
                    break;
                }
            }
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.status },
                    { Key: 2, Value: $scope.currentcontext.patientid },
                    { Key: 4, Value: $scope.currentfilter.guarantortype }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'registration/PatientGuarantor/GetPatientGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            if ($scope.IsRankExist)
                utl.Alert.showErrorMsg($translate.instant('registration.guarantor-form.alert.lbl'));

            utl.Modal.open('app.patientguarantorform', {
                params: { id: 0, pid: $scope.currentcontext.patientid, isrankexst: $scope.IsRankExist },
                confirmCallback: $scope.initLookup
            });
            //$state.go('app.patientguarantorform', { guarantorid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'registration/PatientGuarantor/DeletePatientGuarantor',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.backToForm = function () {

            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.fullregistrationtab.basic');
            }
        }
        $scope.handleEvents = function (actionType, entity) {
            if (!$scope.currentcontext.isFinalized) {
                if (actionType == 'edit') {
                    $scope.gridbuttonaction = true;
                    utl.Modal.open('app.patientguarantorform', {
                        params: { id: entity.Id, pid: $scope.currentcontext.patientid, isrankexst: $scope.IsRankExist },
                        confirmCallback: $scope.getList
                    });
                    //$state.go('app.patientguarantorform', { guarantorid: entity.Id });
                } else if (actionType == 'delete') {
                    $scope.gridbuttonaction = true;
                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GuarantorName);
                } else if (actionType == 'gl') {
                    $scope.gridbuttonaction = true;
                    utl.Modal.open('app.patientguarantorglform', {
                        params: {
                            id: entity.Id,
                            pid: $scope.currentcontext.patientid,
                            gname: entity.GuarantorName,
                            gtypeid: entity.GuarantorTypeId,
                            gtypedes: entity.GuarantorType.Description,
                            gltrno: entity.GuarantorLetterNo,
                            gltrdate: entity.GuarantorLetterDate,
                            patient: entity.Patient
                        },
                        confirmCallback: $scope.getList
                    });
                }
            } else {
                utl.Alert.showErrorMsg('registration.guarantor-form.alertbill.lbl');
            }

            // else if (actionType == 'gl') {
            //     utl.Modal.open('app.patientguarantorglform', {
            //         params:
            //         {
            //             id: entity.Id,
            //             pid: $scope.currentcontext.patientid,
            //             gname: entity.GuarantorName,
            //             gtypeid: entity.GuarantorTypeId,
            //             gltrno: entity.GuarantorLetterNo,
            //             gltrdate: entity.GuarantorLetterDate
            //         },
            //         confirmCallback: $scope.getList
            //     }
            //     );
            // }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "GuarantorType.Description", displayName: $translate.instant('registration.guarantor-list.type.lbl') },
                { field: "GuarantorName", displayName: $translate.instant('registration.guarantor-list.guarantor.lbl') },
                // { field: "Tpa.Description", displayName: $translate.instant('registration.guarantor-list.tpaname.lbl') },
                { field: "Rank", displayName: $translate.instant('registration.guarantor-list.rank.lbl') },
                { field: "PolicyNo", displayName: $translate.instant('registration.guarantor-list.policyno.lbl') },
                // { field: "GuarantorLetterNo", displayName: $translate.instant('registration.guarantor-list.glno.lbl') },
                // {
                //     field: "GuarantorLetterDate",
                //     displayName: $translate.instant('registration.guarantor-list.gldate.lbl'),
                //     cellTemplate: "<ngformatdate date-val='entity.GuarantorLetterDate'></ngformatdate>"
                // },
                {
                    field: "EffectiveFrom",
                    displayName: $translate.instant('registration.guarantor-list.effectivedate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.EffectiveFrom'></ngformatdate>"
                },
                // {
                //     field: "EffectiveTo",
                //     displayName: $translate.instant('registration.guarantor-list.expirydate.lbl'),
                //     cellTemplate: "<ngformatdate date-val='entity.EffectiveTo'></ngformatdate>"
                // },
                { field: "CreditLimit", displayName: $translate.instant('registration.guarantor-list.creditlimit.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('registration.guarantor-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'gl\',entity)"ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
               </div>',
       handleEvent: $scope.handleEvents,

                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'gl', display: 'registration.guarantor-list.glaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        if ($scope.currentcontext.canselectrow) {
            vm.gridConfig.enableRowSelection = true;
            vm.gridConfig.multiSelect = false
            vm.gridConfig.onRegisterApi = function (gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    if (!$scope.gridbuttonaction) {
                        //console.log(entity.Id);
                        if (!$scope.currentcontext.isFinalized) {
                            if (entity.ActiveStatusId == 2) {
                                $scope.confirmCallback({
                                    gid: entity.Id,
                                    GuarantorId: entity.GuarantorId,
                                    GuarantorTypeId: entity.GuarantorTypeId,
                                    NooFVisitFree: entity.NooFVisitFree,
                                });
                            } else {
                                utl.Alert.showErrorMsg($translate.instant('registration.guarantor-list.select-active-guarantor-msg.lbl'));
                            }
                        } else {
                            utl.Alert.showErrorMsg('Bill has Been Finalized');
                        }
                    }
                    else $scope.gridbuttonaction = false;
                });
            };
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "GuarantorType" },
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

        /* React bridge code starts */
        // NOTE: <patientbanner> (modal-mode only) is left native -- a shared, real
        // async-fetching directive, same REUSABLE SUB-WIDGET treatment as the Doctor
        // <autosearch> on registrationcumvisit.html. It is NOT nested inside a repeat,
        // so it stays a plain sibling tag outside the react-component mount.
        //
        // Real, disclosed pre-existing quirks preserved as-is (not fixed):
        // - "Add" is dead today: addNew() is a real function, but its trigger button is
        //   commented out of the live template, AND its target modal state
        //   'app.patientguarantorform' does not exist anywhere in hims-states.js. Not
        //   rendered in the React port either -- matches what's actually live today.
        // - The footer Back/Cancel button (backToForm()) is likewise commented out of
        //   the live template -- not rendered.
        // - Row-selection "picker" mode (enableRowSelection/onRegisterApi/gridApi,
        //   gated by currentcontext.canselectrow) targets ui-grid's selection API, but
        //   the live template renders <custom-table>, which has no such API
        //   (customTableController only implements reOrder). This code path is
        //   unreachable today -- not reproduced in React.
        // - When currentcontext.isFinalized is true, handleEvents' error branch passes
        //   the raw i18n KEY string straight to showErrorMsg (missing the
        //   $translate.instant() wrapper every other call site here uses) -- so the
        //   literal untranslated key is what actually displays. Preserved verbatim.
        $scope.reactProps = {};

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                lookup: $scope.lookup || {},
                currentfilter: $scope.currentfilter,
                currentcontext: $scope.currentcontext,
                pager: {
                    totalItems: vm.gridConfig.pagerObj.totalItems,
                    currentPage: vm.gridConfig.pagerObj.currentPage,
                    pageSize: vm.gridConfig.pagerObj.pageSize
                }
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'edit':
                    $scope.handleEvents('edit', payload.entity);
                    return;
                case 'gl':
                    $scope.handleEvents('gl', payload.entity);
                    return;
                case 'delete':
                    $scope.handleEvents('delete', payload.entity);
                    return;
                case 'filterChange':
                    $scope.currentfilter[payload.field] = payload.value;
                    $scope.getList();
                    return;
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    return;
                case 'cancelModal':
                    if ($scope.currentcontext.ismodal) {
                        $scope.cancelCallback();
                    }
                    return;
            }
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };

        $scope.refreshReactProps();
        /* React bridge code ends */

        $scope.initLookup();
    }

    patientguarantorListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();