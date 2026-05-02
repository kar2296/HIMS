(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionlogsListController', admissionlogsListController);

    function admissionlogsListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };


        $scope.backToList = function () {
            $state.go('app.admissions');
        }
        $scope.print = function () {
            utl.Modal.open('app.admissionprint', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }
        $scope.currentcontext = {};
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.patientid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/admissionlogs/GetAdmissionLogs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            // utl.Http.doAction(options);
        };

        //Grid Actions

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/admissionlogs/DeleteAdmissionLogs',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            // utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.fullregistrationtab.patientidentity', { patientidentityid: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }



        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PatientIdentityType" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            // utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    admissionlogsListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();