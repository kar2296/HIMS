(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietplanFormController', dietplanFormController);

    function dietplanFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {};

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
            if (modalConfig.pid)
                $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.item.PatientId = $scope.currentcontext.pid;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

        }

        $scope.patientInfo = {};

        // $scope.getPatientInfo = function (scope, data, options, hasError) {
        //     $scope.selectedPatient = data;
        // }

        // $scope.patientChange = function () {
        //     if ($scope.item.PatientId > 0) {
        //         var options = {
        //             action: 'registration/patient/GetPatientById',
        //             data: { Id: $scope.item.PatientId },
        //             type: 'post',
        //             onComplete: $scope.getPatientInfo
        //         };
        //         utl.Http.doAction(options);
        //     }
        // }
        $scope.getpatientsCallback = function(scope, res, options, hasError) {
            $scope.patientInfo = res.Data[0];

        };

        $scope.getpatients = function() {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.pid },
                    ],

                };

                var options = {
                    action: 'registration/patient/GetPatients',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getpatientsCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.patientprofile = function() {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.currentcontext.pid },
            });
        };
        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var inputData = {
                    Params: [
                        //  { Key: 1, Value: $scope.currentcontext.pid }

                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'emr/PatientDietPlanLog/GetPatientDietPlanLogs',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function() {
            $scope.confirmCallback();
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Diet", displayName: $translate.instant('patientemr.patientdietplan-form.fieldname.lbl') },
                { field: "DietType", displayName: $translate.instant('patientemr.patientdietplan-form.oldvalue.lbl') },
                { field: "DietType", displayName: $translate.instant('patientemr.patientdietplan-form.newvalue.lbl') },
                {
                    field: "CreatedAt",
                    displayName: $translate.instant('patientemr.patientdietplan-form.modifieddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                }, {
                    field: "CreatedUser",
                    displayName: $translate.instant('admissions.admittedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.Title.Description }}</span>" +
                        "<span  ng-if='row.entity.CreatedUser'></span>" +
                        "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.FirstName }}</span>" +
                        "<span  ng-if='row.entity.CreatedUser'></span>" +
                        "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.LastName}}</span>" +
                        "</div>"

                },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },

        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.getpatients();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "DietTypeId" },
                { "Key": "DietPreferenceId" },
                { "Key": "FoodPreference" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    dietplanFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();