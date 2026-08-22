(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAttachmentListController', patientAttachmentListController);

function patientAttachmentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $timeout, Upload) {
    var vm = this;

    $scope.attachmentconfig = {
        objecttypeid : 1 //Patient
    };

     $scope.cancelCallback = $uibModalInstance.dismiss;

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.attachmentconfig.patientid = parseInt(modalConfig.params.pid);
        $scope.attachmentconfig.itemid = modalConfig.params.itemid ? parseInt(modalConfig.params.itemid) : 0;

        if(modalConfig.params.objecttypeid) {
            $scope.attachmentconfig.objecttypeid = parseInt(modalConfig.params.objecttypeid);
        }

        if(modalConfig.params.encounterid) {
            $scope.attachmentconfig.encounterid = parseInt(modalConfig.params.encounterid);
        }


        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        }
    }

    // ---------------------------------------------------------------------
    // PORTED FROM public/vendor/components/attachmentcontrol.js (the shared
    // <attachmentcontrol> component this screen's real template rendered).
    // That file lives outside this migration's allowed scope (only
    // public/views/**, src/react-components/**, src/main.tsx) and is left
    // completely untouched -- it is now orphaned/unused since this was its
    // only real caller (see the full write-up in
    // src/react-components/PatientAttachmentsScreen.tsx). Every function
    // below is a verbatim, faithful copy of that controller's real logic:
    // same action endpoints, same Params Key/Value pairs, same payload
    // shapes, same success/error messages, same pre-existing quirks/bugs
    // (duplicate Params Key 3 when encounterid is set; initial list load
    // gated on truthy patientid; ngf-max-size's silent oversized-file drop
    // now reproduced client-side in the React component) -- see the
    // PatientAttachmentsScreen.tsx top-of-file comment for the complete,
    // itemized disclosure. Nothing here is new business logic; only the
    // React-bridge wiring at the bottom is new.
    // ---------------------------------------------------------------------

    $scope.item = {
        AttachmentTypeId: -1,
        AttachmentType: '',
        Comments: ''
    };

    $scope.attachmentfile = { file: null };

    $scope.fileSelected = function () {
        if ($scope.attachmentfile.file && $scope.attachmentfile.file.name) {
            $scope.item.AttachmentName = $scope.attachmentfile.file.name;
        }
    }

    $scope.attachmentTypeChange = function (selectedAttachmentType) {
        if (selectedAttachmentType.Id != -1) {
            $scope.item.AttachmentType = selectedAttachmentType.Text;
        } else {
            $scope.item.AttachmentType = '';
        }
        $scope.getList();
    }

    //save item
    $scope.saveItem = function () {
        if (!$scope.attachmentfile.file) {
            utl.Alert.showErrorMsg($translate.instant('registration.attachmentcontrol.nofilemsg.lbl'));
            return;
        }

        var actionName = "registration/PatientAttachment/AddPatientAttachment";
        var actionUrl = utl.Http.getRootPath() + actionName;

        $scope.item.PatientId = $scope.attachmentconfig.patientid;
        $scope.item.ObjectTypeId = $scope.attachmentconfig.objecttypeid;
        $scope.item.ItemId = $scope.attachmentconfig.itemid;

        Upload.upload({
            url: actionUrl,
            data: {
                file: $scope.attachmentfile.file,
                Data: $scope.item
            }
        }).then(function (resp) { //upload function returns a promise
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.attachmentfile.file = null;

            //reset form and reload list
            $scope.item = {
                AttachmentTypeId: -1,
                AttachmentType: '',
                Comments: ''
            };
            updateReactProps();
            $scope.getList();
        },
            function (resp) { //catch error
                console.log('Error status: ' + resp.status);
                utl.Alert.showErrorMsg('Error status: ' + resp.status);
            },
            function (evt) {
                console.log(evt);
            });
    }

    //get list
    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
    }
    $scope.getList = function () {

        var inputData = {
            Params: [{ Key: 2, Value: $scope.attachmentconfig.patientid },
            { Key: 3, Value: $scope.attachmentconfig.objecttypeid },
            { Key: 4, Value: $scope.item.AttachmentTypeId },

            ],
            PageContext: {
                PageSize: 1000,
                PageNumber: 1
            }
        };

        if ($scope.attachmentconfig.encounterid) {
            inputData.Params.push({ Key: 3, Value: $scope.attachmentconfig.encounterid });
        }

        var options = {
            action: 'registration/PatientAttachment/GetPatientAttachments',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };
        utl.Http.doAction(options);
    }

    //Delete
    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function (deleteId) {
        var options = {
            action: 'registration/PatientAttachment/DeletePatientAttachment',
            data: { Id: deleteId },
            type: 'post',
            onComplete: $scope.deleteItemCallback
        };
        utl.Http.doAction(options);
    }

    //Download File
    $scope.downloadFileCallback = function (scope, data, options, hasError) {
        console.log('File downloaded successfully...');
    };

    $scope.downloadFile = function (entity) {
        var inputData = { FilePath: entity.FilePath };
        var options = {
            action: 'registration/PatientAttachment/GetAttachmentFile',
            data: { Data: inputData },
            onComplete: $scope.downloadFileCallback
        };
        utl.Http.doDownload(options);
    }

    $scope.handleEvents = function (actionType, entity) {

        if (actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AttachmentName);
        } else if (actionType == 'view') {
            $scope.downloadFile(entity);
        }
    }

    vm.gridConfig = {
        data: []
    };

    //lookup
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
    }

    $scope.initLookup = function () {
        var inputData = [
            { "Key": "AttachmentType", Request: { Params: [{ Key: 3, Value: 2 }] } }
        ];

        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    }

    $scope.init = function () {
        $scope.initLookup();
    }

    //caution : base method, mirrors cvm.$onInit's own comment in the ported original
    $timeout($scope.init, 100);

    // Mirrors the ported $watch('cvm.config.patientid', ...): only auto-loads
    // the list when patientid is truthy -- see disclosure block above for the
    // real callers that open this modal with pid:0.
    if ($scope.attachmentconfig.patientid) {
        $scope.getList();
    }

    // ---------------------------------------------------------------------
    // React bridge (hollow-controller pattern). All ported logic above is
    // UNCHANGED from attachmentcontrol.js's real behavior -- this block only
    // wraps the existing callbacks (save original ref, call it, then
    // refresh reactProps) and dispatches React's clicks back into those SAME
    // functions. See PatientAttachmentsScreen.tsx for the full disclosure of
    // preserved bugs/quirks.
    // ---------------------------------------------------------------------

    function updateReactProps() {
        $scope.reactProps = {
            attachmentTypeOptions: ($scope.lookup && $scope.lookup.AttachmentType) || [],
            item: $scope.item,
            items: vm.gridConfig.data || []
        };
    }

    var _origLookupCallback = $scope.lookupCallback;
    $scope.lookupCallback = function (scope, data, options, hasError) {
        _origLookupCallback(scope, data, options, hasError);
        updateReactProps();
    };

    var _origGetListCallback = $scope.getListCallback;
    $scope.getListCallback = function (scope, res, options, hasError) {
        _origGetListCallback(scope, res, options, hasError);
        updateReactProps();
    };

    $scope.handleReactAction = function (actionName, payload) {
        payload = payload || {};
        switch (actionName) {
            case 'attachmentTypeChange':
                $scope.item.AttachmentTypeId = payload.id;
                $scope.attachmentTypeChange({ Id: payload.id, Text: payload.text });
                break;
            case 'save':
                $scope.item.AttachmentTypeId = payload.attachmentTypeId;
                $scope.item.AttachmentType = payload.attachmentType;
                $scope.item.AttachmentName = payload.attachmentName;
                $scope.item.Comments = payload.comments;
                $scope.attachmentfile.file = payload.file;
                $scope.saveItem();
                break;
            case 'view':
                $scope.handleEvents('view', payload.entity);
                break;
            case 'delete':
                $scope.handleEvents('delete', payload.entity);
                break;
            case 'cancel':
                $scope.cancelCallback();
                break;
        }
        $scope.$applyAsync();
    };

    updateReactProps();
}

patientAttachmentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', 'Upload'];

})();
