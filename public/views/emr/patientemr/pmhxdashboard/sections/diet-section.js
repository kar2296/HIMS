//vitalSectionController
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietSectionController', dietSectionController);

    function dietSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentfilter = {
            PatientVitalStatusId: 1
        };

        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount()
        };

        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientdietplan/DeletePatientDietPlan',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {
            if (actionType == 'add') {
                utl.Modal.open('patientemr.dietplanassessment', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid
                    },
                    confirmCallback: $scope.getList
                });
            }
        };
        // if (actionType == 'edit') {
        //     utl.Modal.open('patientemr.dietplantab.dietplan', {
        //         params: { id: item.Id, pid: $scope.currentcontext.pid },
        //         confirmCallback: $scope.getList
        //     }
        //     );
        // }
        // else if (actionType == 'delete') {
        //     utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
        // }
        // else if (actionType == 'list') {
        //     // $state.go('patientemr.dietplantab.dietplan');
        //     utl.Modal.open('patientemr.dietplantab.dietplan', {
        //         params: { id: 0, pid: $scope.currentcontext.pid },
        //         confirmCallback: $scope.getList
        //     }
        //     );
        // }
        // else if (actionType == 'settings') {
        //     //TODO
        // }
        // else

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientdietplan/GetPatientDietPlans',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    dietSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();