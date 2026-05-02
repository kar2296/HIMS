
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('clinicalorderSectionController', clinicalorderSectionController);

    function clinicalorderSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
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
                action: 'emr/patientorder/DeletePatientOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientorder', {
                    params: { id: item.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'list') {
                $state.go('patientemr.patientorders');
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == "add") {
                utl.Modal.open('patientemr.patientorder', {
                    params: {
                        id: 0
                    },
                    confirmCallback: $scope.getList
                });
            }
            // else if (actionType == 'add') {
            //     utl.Modal.open('patientemr.patientorder', {
            //         params: { id: 0, pid: $scope.currentcontext.pid },
            //         confirmCallback: $scope.getList
            //     }
            //     );
            // }
        }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            var orderdetails = [];
            $scope.items = res.Data || [];
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                    // { Key: 18, Value: $scope.currentcontext.eid }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    clinicalorderSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();