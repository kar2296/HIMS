//vitalSectionController
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('vitalSectionController', vitalSectionController);

    function vitalSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
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
                action: 'emr/patientvital/DeletePatientVital',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.list = function () {
            $state.go('patientemr.patientvitals');
        }
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
                $state.go('patientemr.patientvitals');
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
         //Grid Actions
         $scope.open_vital = function () {
            $state.go('patientemr.patientvitals');
        }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {

            $scope.items = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);

            var grouped = [];
            var oldSelecteddt = '';
            var _vitalName = '';
            var _vitalValue = '';
            var _uom = '';
            var _fullvalue = '';
            for (var i = 0; i < $scope.items.length; i++) {
                var Selecteddt = $filter('date')($scope.items[i].PerformedDate, 'yyyy-MM-dd HH:mm');
                if (i == 0) oldSelecteddt = Selecteddt;
                if (oldSelecteddt != Selecteddt) {
                    if (_fullvalue.length > 0) {
                        grouped.push({ 'Id': 0, 'Vitalinfo': _fullvalue, 'PerformedDate': oldSelecteddt });
                        oldSelecteddt = Selecteddt;
                        _fullvalue = '';
                    }
                    _vitalName = $scope.items[i].VitalName;
                    _vitalValue = $scope.items[i].VitalValue;
                    _fullvalue += _vitalName + ':' + _vitalValue + '; ';
                }
                else {
                    _vitalName = $scope.items[i].VitalName;
                    _vitalValue = $scope.items[i].VitalValue;
                    _uom = $scope.items[i].UOM;
                    _fullvalue += '<font color="#868585">' + _vitalName + '</font> :' + '<font color="black">' + _vitalValue + '</font>' + '<font color="black">' + _uom + ' </font>' + ' ';
                }

                if (i == ($scope.items.length - 1) && oldSelecteddt == Selecteddt) {
                    if (_fullvalue.length > 0) {
                        oldSelecteddt = Selecteddt;
                        grouped.push({ 'Id': 0, 'Vitalinfo': _fullvalue, 'PerformedDate': oldSelecteddt });
                        _fullvalue = '';
                    }
                }
            }

            $scope.items = [];
            $scope.items = grouped;

        };

        $scope.getList = function () {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 9, Value: $scope.currentcontext.eid },
                { Key: 4, Value: $scope.currentfilter.PatientVitalStatusId }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    vitalSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();