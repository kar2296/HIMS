(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ComplaintSectionController', ComplaintSectionController);

    function ComplaintSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;


        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount()
        };

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter)
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
        if ($stateParams.eid)
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/PatientComplaints/DeletePatientComplaints',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.chiefcomplaintform', {
                    params: { id: item.Id, pid: $scope.currentcontext.pid,eid: $scope.currentcontext.eid,option:'detail' },
                    confirmCallback: $scope.getList
                });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'add') {
                utl.Modal.open('patientemr.chiefcomplaintform', {
                    params: { id: 0, pid: $scope.currentcontext.pid,eid: $scope.currentcontext.eid },
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
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 2, Value: $scope.currentcontext.eid }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/PatientComplaints/GetPatientComplaintss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    ComplaintSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();