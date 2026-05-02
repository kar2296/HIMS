(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('disprocedureSectionController', disprocedureSectionController);

    function disprocedureSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        var SRef = 'emr.cn.procedure';

        $scope.currentfilter = {
            PatientProcedureStatusId: 1
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
                action: 'emr/patientprocedure/DeletePatientProcedure',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientprocedure', {
                    params: { id: item.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'list') {
                $state.go('patientemr.patientprocedures');
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == 'add') {
                utl.Modal.open('patientemr.patientprocedure', {
                    params: { id: 0, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
        }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 6, Value: $scope.currentcontext.eid },
                { Key: 5, Value: $scope.currentfilter.PatientProcedureStatusId }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientprocedure/GetPatientProcedures',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    disprocedureSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();