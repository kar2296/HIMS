(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BloodBankListController', BloodBankListController);

    function BloodBankListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Item = {};
        $scope.Items = [];
        $scope.currentfilter = {

        };

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());


        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'emr/BloodRequest/GetBloodRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions
        $scope.addNew = function () {
            $state.go('patientemr.bloodbanktab.bloodrequest', { id: 0, pid: $scope.currentcontext.pid });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/BloodRequest/DeleteBloodRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'view') {
                $state.go('patientemr.bloodbanktab.bloodrequest', { id: row.entity.Id, pid: $scope.currentcontext.pid });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        //Visibility rules starts
        $scope.canShowEdit = function () {
            return false;
        }

        //Visibility rules starts

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "BloodRequestDate", displayName: $translate.instant('patientemr.bloodbank.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.BloodRequestDate'></ngformatdate>"
                },
                { field: "BloodRequestNo", displayName: $translate.instant('patientemr.bloodbank.reference.lbl') },
                {
                    field: "CreatedBy", displayName: $translate.instant('patientemr.bloodbank.requestedby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">'
                        + '<span>{{row.entity.CreatedUser.Title.Description}}</span>' + ''
                        + '<span>{{row.entity.CreatedUser.FirstName}}</span>' + ''
                        + '<span>{{row.entity.CreatedUser.LastName}}</span>'
                        + '</div>'
                },
                {
                    field: "PatientLocation", displayName: $translate.instant('patientemr.bloodbank.approvedby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">'
                        + '<span>{{row.entity.User.Title.Description}}</span>'
                        + '<span>{{row.entity.User.FirstName}}</span>'
                        + '<span>{{row.entity.User.LastName}}</span>'
                        + '</div>'
                },
                { field: "BloodBankStatus.Description", displayName: $translate.instant('patientemr.patientfeedbacks-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
          </div>',
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "BloodPriority" },
                { "Key": "BloodBankStatus" }
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

    BloodBankListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();