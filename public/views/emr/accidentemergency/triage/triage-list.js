(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('triageListController', triageListController);

    function triageListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsEnabled: true
        };
        $scope.Vitals = [];

        $scope.currentcontext = {};
        if ($stateParams.aeid)
            $scope.currentcontext.aeid = parseInt($stateParams.aeid);
        if ($stateParams.eid)
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid= parseInt(utl.Session.getEMRPatientId());

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: '',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.handleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientvital', {
                    params: { id: item.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'list') {
                utl.Modal.open('patientemr.patientvitals', {
                    params: { id: 0, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                });
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == 'add') {
                utl.Modal.open('patientemr.patientvital', {
                    params: { id: 0, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            } else if (actionType == 'chart') {
                utl.Modal.open('patientemr.patientvitals', {
                    params: { id: 0, pid: $scope.currentcontext.pid, context: 'chart' },
                    confirmCallback: $scope.getList
                }
                );
            }
        }

        $scope.service = function (formtype) {
            utl.Modal.open('app.triage', {
                params: { id: 0, eid: $scope.currentcontext.eid, aeid: $scope.currentcontext.aeid, pid: $scope.currentcontext.pid, formtype: formtype },
                confirmCallback: $scope.getList
            });
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            $scope.getItem();
        }

        $scope.initLookup();
    }

    triageListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();