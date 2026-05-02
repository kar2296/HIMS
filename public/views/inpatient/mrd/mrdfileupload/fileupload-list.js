(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDFileUploadListController', MRDFileUploadListController);

    function MRDFileUploadListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentfilter = {
            CapturedDate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.CapturedDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.CapturedDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.MRN },
                    { Key: 4, Value: $scope.currentfilter.EncounterTypeId },
                    // { Key: 5, Value: [From, To] },
                    { Key: 6, Value: $scope.currentfilter.MRDFileTypeId },
                    { Key: 7, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To }
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
            utl.Modal.open('app.mrdfileuploadform', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }

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

        $scope.downloadFile = function (entity) {
            var inputData = { FilePath: entity.FilePath };
            var options = {
                action: 'IPManagement/MRDFileAttachments/GetAttachmentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AttachmentName);
            } else if (actionType == 'download') {
                $scope.downloadFile(entity);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "MRN", displayName: $translate.instant('patientemr.mrdfilesdownloadupload.mrn.lbl') },
                {
                    field: "PatientId", displayName: $translate.instant('frequest.patientname.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "{{entity.Patient.Title.Description}}</span>" + "<span>&nbsp;</span>" +
                        "<span >{{entity.Patient.FirstName}}</span>" + "<span ng-if='entity.Patient.LastName>&nbsp;&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "CapturedDate",
                    displayName: $translate.instant('patientemr.mrdfilesdownloadupload.capturedate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CapturedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.CapturedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "VisitIdentifier", displayName: $translate.instant('patientemr.mrdfilesdownloadupload.visitidentifier.lbl') },
                { field: "EncounterType.Description", displayName: $translate.instant('patientemr.mrdfilesdownloadupload.encountertype.lbl') },
                { field: "MRDFileType.Description", displayName: $translate.instant('patientemr.mrdfilesdownloadupload.mrdfiletype.lbl') },
                { field: "AttachmentName", displayName: $translate.instant('patientemr.mrdfilesdownloadupload.attachmentname.lbl') },
                // { field: "Comments", displayName: $translate.instant('patientemr.mrdfilesdownloadupload.comments.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'download\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'download', display: 'download' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            data: []
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
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

    MRDFileUploadListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();