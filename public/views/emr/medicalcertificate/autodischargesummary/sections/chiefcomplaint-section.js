(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischiefcomplaintSectionController', dischiefcomplaintSectionController);

    function dischiefcomplaintSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.sectionData = {};

        var SRef = 'emr.cn.chiefcomplaint';

        $scope.currentfilter = {
            PatientAllergyStatusId: 1
        };

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
            if (actionType == "add") {
                utl.Modal.open('patientemr.chiefcomplaintForm', {
                    params: { id: 0, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
        }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.sectionData.ChiefComplaints  = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };
        $scope.getList = function () {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                     { Key: 3, Value: $scope.currentcontext.eid } ],
                PageContext: { PageSize: 500, PageNumber: 1 }
            };

            var options = {
                action: 'emr/PatientChiefComplaint/GetPatientChiefComplaints',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    dischiefcomplaintSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();