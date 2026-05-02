(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousadmissionController', previousadmissionController);

    function previousadmissionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
					     { Key: 15, Value: 2 },
                ],
                PageContext: {
                    PageSize: 500,
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

        vm.gridConfig = {
			enableColumnResizing: true,
            columnDefs: [
                // {
                //     field: "AdmissionDate", displayName: $translate.instant('admissions.admissionon.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AdmissionDate | date : 'dd-MMM-yyyy'}},</span>" + "<span >{{row.entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                // },
                {
                    field: "CreatedAt", displayName: $translate.instant('admissions.admissionon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}},</span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "VisitIdentifier", displayName: $translate.instant('admissions.admissionno.lbl') },

                {
                    field: "Patient", displayName: $translate.instant('admissions.admittedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                    + "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>"
                    + "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>"
                    + "<span >{{row.entity.Doctor.LastName}}</span>"
                    + "</span></div>"
                },
                {
                    field: "AdmittingReason.Description", displayName: $translate.instant('admission.admittingreason.lbl')
                },

                {
                    field: "AdmissionStatus.Description", displayName: $translate.instant('admissions.status.lbl')
                },
                {
                    field: "Created", displayName: $translate.instant('admissions.createdby.lbl'),
                    cellTemplate: "<displayuser user='row.entity.Created'></displayuser>"
                },

            ]
        };

        previousadmissionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

    }
})();