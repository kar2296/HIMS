
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('prescriptionSectionController', prescriptionSectionController);

    function prescriptionSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
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
                action: 'emr/prescription/DeletePrescription',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.prescription', {
                    params: { id: item.Id, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'list') {
                $state.go('patientemr.prescriptions');
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == 'add') {
                utl.Modal.open('patientemr.prescription', {
                    params: { id: 0, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid },
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
            // var presdetails = [];
            // $scope.items = res.Data || [];
            // for (var idx in $scope.items) {
            //     var detail = $scope.items[idx];
            //     for (var iddx in detail.PrescriptionDetails)
            //         presdetails.push(detail.PrescriptionDetails[iddx]);
            // }
            // $scope.PrescriptionDetails = presdetails;
        };


        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    // { Key: 12, Value: $scope.currentcontext.eid },
                    { Key: 6, Value: 3 }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    prescriptionSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();