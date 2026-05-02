(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDfilesAttachmentlistController', MRDfilesAttachmentlistController);

    function MRDfilesAttachmentlistController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentfilter = {};

        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/MRDFileAttachments/DeleteMRDFileAttachment',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File download completed...');
        };

        $scope.downloadFile = function (row) {
            var inputData = { FilePath: row.entity.FilePath };
            var options = {
                action: 'IPManagement/MRDFileAttachments/GetAttachmentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AttachmentName);
            } else if (actionType == 'download') {
                $scope.downloadFile(row);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "MRN",  displayName: $translate.instant('patientemr.mrdfilesdownloadupload.mrn.lbl') },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('patientemr.mrdfilesdownloadupload.admissiondate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AdmissionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "VisitIdentifier",  displayName: $translate.instant('patientemr.mrdfilesdownloadupload.visitidentifier.lbl') },
                { field: "EncounterType.Description",  displayName: $translate.instant('patientemr.mrdfilesdownloadupload.encountertype.lbl') },
                { field: "MRDFileType.Description",  displayName: $translate.instant('patientemr.mrdfilesdownloadupload.mrdfiletype.lbl') },
                { field: "AttachmentName", displayName: $translate.instant('patientemr.mrdfilesdownloadupload.attachmentname.lbl') },
                { field: "Comments",  displayName: $translate.instant('patientemr.mrdfilesdownloadupload.comments.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'download', display: 'download' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            data: []
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 2, Value: $scope.currentfilter.MRN },
                    { Key: 3, Value: $scope.currentfilter.EncounterId },
                    { Key: 4, Value: $scope.currentfilter.EncounterTypeId },
                    { Key: 5, Value: $scope.currentfilter.AdmissionDate },
                    { Key: 6, Value: $scope.currentfilter.MRDFileTypeId },
                    { Key: 7, Value: $scope.currentfilter.VisitIdentifier }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/MRDFileAttachments/GetMRDFileAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            utl.Modal.open('app.mrdfilesattachment', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "MRDFileType" },
                { "Key": "EncounterType" },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();

    }

    MRDfilesAttachmentlistController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload'];

})();