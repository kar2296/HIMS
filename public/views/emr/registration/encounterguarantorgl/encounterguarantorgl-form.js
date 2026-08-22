(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('encounterGuarantorGLFormController', encounterGuarantorGLFormController);

function encounterGuarantorGLFormController($scope, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

    $scope.item = {
        ActiveFrom:utl.Formatter.getCurrentDate()
    };

    $scope.currentcontext =  {};

    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = 0;
        $scope.currentcontext.encounterid = parseInt(modalConfig.params.encounterid);
        $scope.currentcontext.encounterguarantorid = parseInt(modalConfig.params.id);
        $scope.currentcontext.patientid = parseInt(modalConfig.params.pid);
        $scope.currentcontext.gname = modalConfig.params.gname;
        $scope.currentcontext.gtypeid = parseInt(modalConfig.params.gtypeid);
        $scope.currentcontext.gltrno = modalConfig.params.gltrno;
        $scope.currentcontext.gltrdate = modalConfig.params.gltrdate;

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'registration/encounterguarantorgl/GetencounterguarantorglById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $scope.confirmCallback();
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.item = {};
        $scope.item.PatientId = $scope.currentcontext.patientid;
        $scope.item.EncounterGuarantorId = $scope.currentcontext.encounterguarantorid;
        $scope.item.EncounterId = $scope.currentcontext.encounterid;
        $scope.item.GuarantorName = $scope.currentcontext.gname;
        $scope.item.GuarantorTypeId = $scope.currentcontext.gtypeid;
        $scope.item.GuarantorLetterNo = $scope.currentcontext.gltrno;
        $scope.item.GuarantorLetterDate = $scope.currentcontext.gltrdate;
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();
        $scope.getList();
    };

    $scope.item.PatientId = $scope.currentcontext.patientid;
    $scope.item.EncounterGuarantorId = $scope.currentcontext.encounterguarantorid;
    $scope.item.EncounterId = $scope.currentcontext.encounterid;
    $scope.item.GuarantorName = $scope.currentcontext.gname;
    $scope.item.GuarantorTypeId = $scope.currentcontext.gtypeid;
    $scope.item.GuarantorLetterNo = $scope.currentcontext.gltrno;
    $scope.item.GuarantorLetterDate = $scope.currentcontext.gltrdate;
    $scope.saveItem = function () {

        if(!utl.Validator.validate($scope)) {
            return;
        }

        var actionName = 'registration/encounterguarantorgl/AddEncounterGuarantorGL';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'registration/encounterguarantorgl/UpdateEncounterGuarantorGL';
        }

        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
    };

    $scope.getList = function () {

        var inputData = {
            Params :[
              { Key: 1, Value: $scope.currentcontext.encounterguarantorid },
              { Key: 2, Value: $scope.currentcontext.patientid }
            ],
        };

        var options = {
            action: 'registration/encounterguarantorgl/GetEncounterGuarantorGLs',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'registration/encounterguarantorgl/DeleteEncounterGuarantorGL',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);
    }

     $scope.handleEvents = function(actionType, row) {
        if(actionType == 'edit') {
            $scope.currentcontext.id = parseInt(row.entity.Id);
            $scope.getItem();
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.GLReferenceNumber);
        }
    }

    vm.gridConfig = {
        columnDefs: [
                        { field: "GuarantorLetterNo", displayName: $translate.instant('registration.encounterguarantorgl-list.glrefno.lbl') },
                        { field: "GuarantorLetterDate", displayName: $translate.instant('registration.encounterguarantorgl-list.gldate.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.GuarantorLetterDate'></ngformatdate>"
                        },
                        { field: "GLLimit", displayName: $translate.instant('registration.encounterguarantorgl-list.limit.lbl') },
                        { field: "ConsumedLimit", displayName: $translate.instant('registration.encounterguarantorgl-list.consumed.lbl') },
                        { field: "BalanceLimit", displayName: $translate.instant('registration.encounterguarantorgl-list.balance.lbl') },
                        { field: "ActiveFrom", displayName: $translate.instant('registration.encounterguarantorgl-list.activefrom.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.ActiveFrom'></ngformatdate>"
                        },
                        { field: "ActiveTo", displayName: $translate.instant('registration.encounterguarantorgl-list.activeto.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.ActiveTo'></ngformatdate>"
                        },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                                cellTemplate : 'actionTemplate.html',
                                actions : [
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'}
                                         ]
                        }
                    ]
    };

    $scope.getList();

    // ---------------------------------------------------------------
    // REACT BRIDGE WIRING (migrated to EncounterGuarantorGLFormScreen.tsx).
    // All API calls/business logic above are untouched.
    // ---------------------------------------------------------------
    $scope.reactProps = {
        item: $scope.item,
        glRecords: vm.gridConfig.data || []
    };

    var origGetListCallback = $scope.getListCallback;
    $scope.getListCallback = function (scope, res, options, hasError) {
        origGetListCallback(scope, res, options, hasError);
        $scope.reactProps.glRecords = vm.gridConfig.data || [];
    };

    var origGetItemCallback = $scope.getItemCallback;
    $scope.getItemCallback = function (scope, data, options, hasError) {
        origGetItemCallback(scope, data, options, hasError);
        $scope.reactProps.item = $scope.item;
    };

    // NOTE: matching the established pattern from the already-migrated
    // patientguarantorgl-form sibling, saveItemCallback (which reassigns
    // $scope.item to a fresh object) is intentionally NOT wrapped to
    // re-sync reactProps.item -- same inherited quirk, not introduced here.

    $scope.handleReactAction = function (actionName, payload) {
        switch (actionName) {
            case 'itemFieldChange':
                $scope.item[payload.field] = payload.value;
                break;
            case 'glDateChange':
                $scope.item.GuarantorLetterDate = payload.value ? new Date(payload.value) : null;
                break;
            case 'activeFromChange':
                $scope.item.ActiveFrom = payload.value ? new Date(payload.value) : null;
                break;
            case 'activeToChange':
                $scope.item.ActiveTo = payload.value ? new Date(payload.value) : null;
                break;
            case 'saveItem':
                $scope.saveItem();
                break;
            case 'edit':
                $scope.currentcontext.id = parseInt(payload.entity.Id);
                $scope.getItem();
                break;
            case 'delete':
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, payload.entity.Id, payload.entity.GLReferenceNumber);
                break;
            case 'backToList':
                $scope.backToList();
                break;
            default:
                break;
        }
        $scope.$applyAsync();
    };
}

encounterGuarantorGLFormController.$inject = ['$scope', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();
