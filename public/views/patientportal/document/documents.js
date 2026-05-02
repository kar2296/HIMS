(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('documentController', documentController);

    function documentController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Document = [];
        $scope.currentcontext = {
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Document = res.Data;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 6,
                    Value: FromDate
                },
                {
                    Key: 7,
                    Value: ToDate
                },],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/ClinicalDocument/GetClinicalDocuments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('patientportal.documents', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientdocument/DeletePatientDocument',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.records = function () {
            $state.go('patientportal.portalmyhealthrecord');
        }
        //Download File
        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function (entity) {
            var inputData = {
                FilePath: entity.FilePath
            };
            var options = {
                action: 'emr/ClinicalDocument/GetDocumentFile',
                data: {
                    Data: inputData
                },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'download') {
                $scope.downloadFile(entity);
            }
        }

        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     columnDefs: [{
        //             field: "CreatedDate",
        //             displayName: $translate.instant('patientemr.patientdocument-list.createddate.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.CreatedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{entity.CreatedDate| date: 'HH:mm'}}</span>" + "</div>"
        //         },
        //         {
        //             field: "DocumentType.Description",
        //             displayName: $translate.instant('patientemr.patientdocument-list.type.lbl')
        //         },
        //         {
        //             field: "Name",
        //             displayName: $translate.instant('patientemr.patientdocument-list.name.lbl')
        //         },
        //         {
        //             field: "YesNo.Description",
        //             displayName: $translate.instant('patientemr.patientdocument-list.releasetopatient.lbl')
        //         },
        //         {
        //             field: "Id",
        //             displayName: $translate.instant('common.actions_col.lbl'),
        //             cellTemplate: '<div class="ui-grid-cell-contents">\
        //                                              <span class="grid-action" ng-click="grid.appScope.handleEvents(\'download\',row)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
        //                                         </div>',
        //             // actions: [
        //             //     { actiontype: 'download', display: 'common.viewaction.lbl' },
        //             //     {actiontype: 'delete', display : 'common.deleteaction.lbl'}
        //             // ]
        //         }
        //     ],
        //     pagerObj: {
        //         totalItems: 0,
        //         currentPage: 1,
        //         startIndex: 0,
        //         pageSize: 25
        //     }
        // };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.back = function () {
            $state.go('patientportal.portalmyhealthrecord');
        }
        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }
        $scope.initLookup = function () {
            var inputData = [];

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

    documentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();