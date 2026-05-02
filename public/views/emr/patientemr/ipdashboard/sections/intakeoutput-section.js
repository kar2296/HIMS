//vitalSectionController
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inoutSectionController', inoutSectionController);

    function inoutSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentfilter = {
            PatientVitalStatusId: 1
        };

        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount()
        };

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt($stateParams.eid);

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientintakeoutput/DeletePatientIntakeOutput',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientintakeoutput', {
                    params: { id: item.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'list') {
                $state.go('patientemr.patientintakeoutputs');
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == 'add') {
                utl.Modal.open('patientemr.patientintakeoutput', {
                    params: { id: 0, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'chart') {
                utl.Modal.open('patientemr.patientintakeoutputs', {
                    params: { id: 0, pid: $scope.currentcontext.pid, context: 'chart' },
                    confirmCallback: $scope.getList
                }
                );
            }
        }
        //Grid Actions
        $scope.open_intakeop = function () {
            $state.go('patientemr.patientintakeoutputs');
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
                { Key: 11, Value: $scope.currentcontext.eid },
                { Key: 4, Value: $scope.currentfilter.PatientVitalStatusId }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientintakeoutput/GetPatientIntakeOutputs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    inoutSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();