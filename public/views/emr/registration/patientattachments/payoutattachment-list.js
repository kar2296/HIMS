(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('payoutAttachmentListController', payoutAttachmentListController);

function payoutAttachmentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.attachmentconfig = {
        objecttypeid : 1 //Patient
    };

     $scope.cancelCallback = $uibModalInstance.dismiss;

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        console.log(modalConfig.params);
        // $scope.attachmentconfig.patientid = parseInt(modalConfig.params.pid);
        // $scope.attachmentconfig.itemid = modalConfig.params.itemid ? parseInt(modalConfig.params.itemid) : 0;

        // if(modalConfig.params.objecttypeid) {
        //     $scope.attachmentconfig.objecttypeid = parseInt(modalConfig.params.objecttypeid);
        // }

        if(modalConfig.params.eid) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        }


        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }

    $scope.getDocumentListCallback = function (scope, res, options, hasError) {
        // $scope.items = $filter('sortArrayItems')(res.Data, [
        //     { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
        // ]);

        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };
    $scope.getDocumentList = function () {

        var inputData = {
            Params: [
                { Key: 3, Value: $scope.currentcontext.eid },
                //{ Key: 3, Value: $scope.currentcontext.eid },
            ],
            PageContext: { PageSize: 25, PageNumber: 1 }
        };

        var options = {
            action: 'emr/ClinicalDocument/GetClinicalDocuments',
            data: inputData,
            type: 'post',
            onComplete: $scope.getDocumentListCallback
        };

        utl.Http.doAction(options);
    };
     //Download File
     $scope.downloadFileCallback = function (scope, data, options, hasError) {
        console.log('File downloaded successfully...');
    };

    $scope.downloadFile = function (entity) {
        var inputData = { FilePath: entity.FilePath };
        var options = {
            action: 'emr/ClinicalDocument/GetDocumentFile',
            data: { Data: inputData },
            onComplete: $scope.downloadFileCallback
        };
        utl.Http.doDownload(options);
    }


    $scope.handleEvents = function (actionType, entity) {

        if (actionType == 'edit') {
            // $state.go('app.patientform', {
            //     id: entity.Id,
            //     patientid: entity.PatientId
            // });
            $scope.downloadFile(entity);
        } else if (actionType == 'view') {
            $state.go('app.patientform', {
                id: entity.Id,
                    patientid: entity.PatientId
            });
        } else if (actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.UserName);
        }
    }

    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
        //     {
        //     field: "idx", displayName: $translate.instant('S.No'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
        // },
        {
            field: "CreatedAt",
            displayName: $translate.instant('Date'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MM-yyyy'}} </span></div>"
        },
        {
            field: "DocumentType.Description",
            displayName: $translate.instant('Document Type'),
        },
        // {
        //     field: "MRN",
        //     displayName: $translate.instant('Description')
        // },

        {
            field: "CreatedUser.FirstName",
            displayName: $translate.instant('Created By'),
            cellTemplate: "<div class='ui-grid-cell-contents'>\
                                   <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                   <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
                                    </div>"
        },
        // {
        //     field: "Referral.ReferralName",
        //     displayName: $translate.instant('Uploaded By')
        // },
        // {
        //     field: "CityMaster.CityName",
        //     displayName: $translate.instant('reports.city.lbl')
        // },
        // {
        //     field: "PatientStatus.Description",
        //     displayName: $translate.instant('appmanager.users.status.lbl')
        // },
        {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                         <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    </div>',
            handleEvent: $scope.handleEvents,
            actions: []
        }
        ],
        pagerObj: {
            totalItems: 0,
            currentPage: 1,
            startIndex: 0,
            pageSize: 25
        }
    };
    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        }
    }
    $scope.getDocumentList();

    // ---------------------------------------------------------------------
    // React bridge (hollow-controller pattern). All real logic above is
    // UNCHANGED -- getDocumentList/getDocumentListCallback/downloadFile/
    // downloadFileCallback/handleEvents/backToList still own every API call
    // and business rule. This block only wraps the existing callback (save
    // original ref, call it, then refresh reactProps) and dispatches
    // React's clicks back into those SAME unchanged functions. Nothing here
    // alters what the real functions do.
    //
    // Real, disclosed pre-existing bugs/dead-code preserved as-is, NOT
    // fixed here -- see the top-of-file comment block in
    // PayoutAttachmentListScreen.tsx for the full writeup:
    // - handleEvents('view', ...) and handleEvents('delete', ...) are dead:
    //   no element in the real template ever dispatches 'view' or 'delete'
    //   (the grid's only action icon dispatches 'edit', which actually
    //   triggers a file download, not an edit). Not rendered/dispatched
    //   here either, matching the real page exactly.
    // - handleEvents('delete', ...) calls utl.Dialog.confirmDelete with
    //   $scope.onDeleteConfirmed, a function this controller never defines
    //   anywhere -- dead code that would throw a ReferenceError if it were
    //   ever actually reached.
    // - $scope.backToList is defined but has zero call sites anywhere in
    //   the real template (the close "X" icon calls cancelCallback()
    //   directly) -- dead code, not wired to anything here either.
    // - The real pager's ng-change="getList()" calls a function this
    //   controller never defines (only getDocumentList() exists), so
    //   AngularJS silently no-ops every page click today. And even if
    //   getList() existed, getDocumentList() hardcodes
    //   PageContext.PageNumber: 1 on every call, so a second page could
    //   never actually be fetched anyway. Reproduced faithfully below:
    //   'pageChange' only updates the displayed page number and does NOT
    //   re-fetch, matching the real, broken, do-nothing pagination.
    // ---------------------------------------------------------------------

    var _origGetDocumentListCallback = $scope.getDocumentListCallback;
    $scope.getDocumentListCallback = function (scope, res, options, hasError) {
        _origGetDocumentListCallback(scope, res, options, hasError);
        updateReactProps();
    };

    function updateReactProps() {
        $scope.reactProps = {
            items: vm.gridConfig.data || [],
            pager: {
                totalItems: vm.gridConfig.pagerObj.totalItems,
                currentPage: vm.gridConfig.pagerObj.currentPage,
                pageSize: vm.gridConfig.pagerObj.pageSize
            }
        };
    }

    $scope.handleReactAction = function (actionName, payload) {
        payload = payload || {};
        switch (actionName) {
            case 'edit':
                $scope.handleEvents('edit', payload.entity);
                break;
            case 'pageChange':
                vm.gridConfig.pagerObj.currentPage = payload.page;
                updateReactProps();
                break;
            case 'cancel':
                $scope.cancelCallback();
                break;
        }
    };

    updateReactProps();
}

payoutAttachmentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();