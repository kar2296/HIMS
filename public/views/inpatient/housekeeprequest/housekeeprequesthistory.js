(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('housekeephistoryController', housekeephistoryController);

    function housekeephistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.EncounterId = parseInt(modalConfig.params.EncounterId)
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 12, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/BedHousekeeping/GetBedHousekeepings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();

        vm.gridConfig = {
			enableColumnResizing: true,
            columnDefs: [
                {
                    field: "CreatedAt", displayName: $translate.instant('housekeeprequest.requestedon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}},</span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                // { field: "VisitIdentifier", displayName: $translate.instant('admissions.admissionno.lbl') },

                {
                    field: "Patient",
                    displayName: $translate.instant('housekeeprequests.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.MRN}}</span>" +
                        "<span >/</span>" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span >&nbsp;{{row.entity.Patient.FirstName}}</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
               {
                    field: "RequestIdentifier", displayName: $translate.instant('housekeeprequest.requestedno.lbl')
                },

                {
                    field: "HousekeepingStatus.Description", displayName: $translate.instant('housekeeprequest.status.lbl')
                },
                
            ]
        };

        housekeephistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

    }
})();