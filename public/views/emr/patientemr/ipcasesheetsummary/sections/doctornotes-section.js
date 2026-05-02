(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorNotesSectionController', DoctorNotesSectionController);

    function DoctorNotesSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentfilter = {
            ConditionStatusId: 1
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
                action: 'emr/patientcondition/DeletePatientCondition',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.doctornotestab.doctornotesform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            } else if (actionType == 'list') {
                $state.go('patientemr.patientconditions');
            } else if (actionType == 'settings') {
                //TODO
            } else if (actionType == 'add') {
                utl.Modal.open('patientemr.doctornotestab.doctornotesform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.getList
                });
            }
        }
        //Grid Actions


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
                        Key: 7,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 1,
                        Value: 1
                    },
                    // { Key: 5, Value: $scope.currentcontext.eid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/DailyNote/GetDailyNotes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    DoctorNotesSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();