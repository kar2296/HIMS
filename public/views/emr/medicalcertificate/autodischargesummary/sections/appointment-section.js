(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('disappointmentSectionController', disappointmentSectionController);

    function disappointmentSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        var SRef = 'emr.cn.appointment';

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
                action: 'emr/patientallergy/DeletePatientAllergy',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('app.appointment', {
                    params: { id: item.Id },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'list') {
                $state.go('app.appointments');
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == "add") {
                utl.Modal.open('app.appointment', {
                    params: { id: 0, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
        }

           //Grid Actions
           $scope.open_appointments = function () {
            $state.go('app.appointments');
        }
        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            //$scope.items = res.Data;

            $scope.items = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };
        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    disappointmentSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();