(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('encounterGuarantorListController', encounterGuarantorListController);

function encounterGuarantorListController($scope, $translate, utl,$uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.Items = [];
        $scope.currentfilter = {
            status: 2,
            guarantortype: -1
        };
    
    $scope.currentcontext = {
            canselectrow: false
        };

    if (modalConfig && modalConfig.params) {            
            $scope.currentcontext.encounterid = parseInt(modalConfig.params.encounterid);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        $scope.refreshReactProps();
        $scope.$applyAsync();
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                    { Key: 1, Value: $scope.currentfilter.status },
                    { Key: 2, Value: $scope.currentcontext.encounterid },
                    { Key: 4, Value: $scope.currentfilter.guarantortype }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'registration/encounterguarantor/GetEncounterGuarantors',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function () {
            utl.Modal.open('app.patientguarantorform', {
                params: {
                    id: 0, pid: $scope.currentcontext.pid,
                    encounterid: $scope.currentcontext.encounterid,
                    isrankexst: $scope.IsRankExist
                },
                    confirmCallback: $scope.initLookup 
                }
            );
        }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'registration/encounterguarantor/DeleteEncounterGuarantor',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
            if (actionType == 'edit') {
                utl.Modal.open('app.patientguarantorform', {
                    params: { id: row.entity.Id,pid: $scope.currentcontext.pid,
                        isrankexst: $scope.IsRankExist,encounterid: $scope.currentcontext.encounterid },
                    confirmCallback: $scope.initLookup
                }
                );
            }
            else if (actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
        else if(actionType == 'gl') {
            utl.Modal.open('app.encounterguarantorgl', {
                params: { 
                    id: row.entity.Id,
                    pid: row.entity.PatientId,
                    gname: row.entity.GuarantorName,
                    gtypeid: row.entity.GuarantorTypeId,
                    gltrno: row.entity.GuarantorLetterNo,
                    gltrdate: row.entity.GuarantorLetterDate,
                    encounterid: $scope.currentcontext.encounterid },
                    confirmCallback: $scope.initLookup 
                }
            );
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "GuarantorType.Description", displayName: $translate.instant('registration.encounterguarantor-list.type.lbl') },
                        { field: "GuarantorName", displayName: $translate.instant('registration.encounterguarantor-list.guarantor.lbl') },
                        { field: "Tpa.Description", displayName: $translate.instant('registration.encounterguarantor-list.tpaname.lbl') },
                        { field: "Rank", displayName: $translate.instant('registration.encounterguarantor-list.rank.lbl') },
                        { field: "PolicyNo", displayName: $translate.instant('registration.encounterguarantor-list.policyno.lbl') },
                        { field: "GuarantorLetterNo", displayName: $translate.instant('registration.encounterguarantor-list.GL No.lbl')},
                        { field: "GuarantorLetterDate", displayName: $translate.instant('registration.encounterguarantor-list.gldate.lbl'),
                            cellTemplate: "<ngformatdate date-val='row.entity.GuarantorLetterDate'></ngformatdate>"  },
                        { field: "EffectiveFrom", displayName: $translate.instant('registration.encounterguarantor-list.effectivedate.lbl'),
                            cellTemplate: "<ngformatdate date-val='row.entity.EffectiveFrom'></ngformatdate>" },
                        { field: "EffectiveTo", displayName: $translate.instant('registration.encounterguarantor-list.expirydate.lbl'),
                            cellTemplate: "<ngformatdate date-val='row.entity.EffectiveTo'></ngformatdate>" },
                        { field: "CreditLimit", displayName: $translate.instant('registration.encounterguarantor-list.creditlimit.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('registration.encounterguarantor-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'},
                                            { actiontype: 'gl', display: 'registration.encounterguarantor-list.glaction.lbl' }
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
    // NOTE: this controller is ONLY ever instantiated as a $uibModalInstance modal
    // (opened via utl.Modal.open('app.encounterguarantors', ...) -- the one real
    // caller is patientsearch.js) -- there is no non-modal / $stateParams branch to
    // account for, unlike patientguarantor-list.js's dual modal/full-page controller.
    // The modal header in the real template has no close/X button at all (just a
    // title) -- not fabricated here either; the real dismissal path is whatever
    // utl.Modal.open's own chrome provides outside this template.
    //
    // Real, disclosed pre-existing quirks preserved as-is (NOT fixed):
    // - Both "Add" (addNew(), live/clickable button here -- unlike patientguarantor-
    //   list.js where the equivalent button is commented out of the template) AND
    //   "Edit" (handleEvents('edit', ...)) call utl.Modal.open('app.patientguarantorform', ...).
    //   That modal state is NOT registered anywhere in hims-states.js (verified) --
    //   so clicking either one is a real, live no-op/broken-target bug today. Only
    //   "GL" (app.encounterguarantorgl, registered) and "Delete" genuinely work.
    // - addNew() also passes isrankexst: $scope.IsRankExist, but this controller
    //   never sets $scope.IsRankExist anywhere -- it's passed through as undefined.
    //   Preserved verbatim (not invented/fixed).
    // - The template's "btn-filter" funnel-icon button has no ng-click at all --
    //   a dead decorative button. Rendered as inert (no dispatch) to match.
    // - The grid's action column references cellTemplate 'actionTemplate.html',
    //   which does not exist as a file anywhere in the repo (verified via search);
    //   the shared $$gridService factory's built-in 'actions' cellTemplate expects
    //   {iconCls/text/hideFn} on each action entry, but this columnDef's actions
    //   array only has {actiontype, display} -- so what (if anything) actually
    //   renders per-row in production is uncertain. The three declared actions
    //   (edit/delete/gl) are reproduced unconditionally per row (no ActiveStatusId
    //   gating exists anywhere in this controller, unlike patientguarantor-list's
    //   custom-table cellTemplate which did have such conditions) -- dispatching
    //   into the same unchanged handleEvents().
    $scope.reactProps = {};

    $scope.refreshReactProps = function () {
        $scope.reactProps = {
            items: vm.gridConfig.data || [],
            lookup: $scope.lookup || {},
            currentfilter: $scope.currentfilter,
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
                $scope.handleEvents('edit', { entity: payload.entity });
                return;
            case 'gl':
                $scope.handleEvents('gl', { entity: payload.entity });
                return;
            case 'delete':
                $scope.handleEvents('delete', { entity: payload.entity });
                return;
            case 'filterChange':
                $scope.currentfilter[payload.field] = payload.value;
                $scope.getList();
                return;
            case 'pageChange':
                vm.gridConfig.pagerObj.currentPage = payload.page;
                $scope.getList();
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

encounterGuarantorListController.$inject = ['$scope', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();