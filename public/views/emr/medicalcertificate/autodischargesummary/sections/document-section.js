(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('disdocumentSectionController', disdocumentSectionController);

    function disdocumentSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        var SRef = 'emr.cn.document';

        $scope.currentfilter = {

        };

        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount(),
            sectionList: utl.Session.getObject('dischargesummary-panel-heading')
        };

        for (var idx in $scope.currentcontext.sectionList) {
            if ($scope.currentcontext.sectionList[idx].SRef == SRef) {
                $scope.currentcontext.sectionList[idx].printed = 1;
                utl.Session.setObject('dischargesummary-panel-heading', $scope.currentcontext.sectionList);
                $scope.panelId = $scope.currentcontext.sectionList[idx].id;
                $scope.panelheading = $scope.currentcontext.sectionList[idx].text;
                break;
            }
        }

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt($stateParams.eid);

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientdocument/DeletePatientDocument',
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

        $scope.downloadFile = function (item) {
            var inputData = { FilePath: item.FilePath };
            var options = {
                action: 'emr/ClinicalDocument/GetDocumentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'download') {
                $scope.downloadFile(item);
            }
            else if (actionType == 'list') {
                $state.go('patientemr.patientdocuments');
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == "add") {
                utl.Modal.open('patientemr.patientdocument', {
                    params: { id: 0 },
                    confirmCallback: $scope.getList
                }
                );
            }
        }

           //Grid Actions
           $scope.open_documents = function () {
            $state.go('patientemr.patientdocuments');
        }
        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };
        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentcontext.eid },
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/ClinicalDocument/GetClinicalDocuments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    disdocumentSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();