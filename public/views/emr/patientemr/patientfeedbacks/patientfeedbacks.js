(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientfeedbacksListController', patientfeedbacksListController);

    function patientfeedbacksListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Item = {};
        $scope.Items = [];
        // $scope.currentfilter.PharmacyId = utl.Session.getCurrentUserId();
        $scope.currentfilter = {

        };
        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
            // $scope.currentfilter.DepartmentId = utl.Session.getCurrentDepartmentId();
        }

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        $scope.custom_sort = function (a, b) {
            return new Date(b.FeedbackOn).getTime() - new Date(a.FeedbackOn).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
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
                action: 'emr/patientfeedback/GetPatientFeedbacks',
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
            $state.go('patientemr.patientfeedback', { id: 0, pid: $scope.currentcontext.pid });
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
                action: 'emr/PatientFeedback/DeletePatientFeedback',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('patientemr.patientfeedback', { id: row.entity.Id, pid: $scope.currentcontext.pid });
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
                    field: "FeedbackOn", displayName: $translate.instant('patientemr.patientfeedbacks-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.FeedbackOn'></ngformatdate>"
                },
                { field: "FeedbackType.Description", displayName: $translate.instant('patientemr.patientfeedbacks-list.type.lbl') },
                {
                    field: "CapturedBy", displayName: $translate.instant('patientemr.patientfeedbacks-list.capturedby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">'
                    + '<span>{{row.entity.User.Title.Description}}</span>'
                    + '<span>{{row.entity.User.FirstName}}</span>'
                    + '<span>{{row.entity.User.LastName}}</span>'
                    + '</div>'
                },
                {
                    field: "PatientLocation", displayName: $translate.instant('patientemr.patientfeedbacks-list.patientlocation.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">'
                    + '<span>{{row.entity.WardMaster.WardName}}</span>'+ '<span> / </span>'
                    + '<span>{{row.entity.WardRoomMaster.RoomNo}}</span>'+ '<span> / </span>'
                    + '<span>{{row.entity.WardRoomBedMaster.BedNo}}</span>'
                    + '</div>'
                },
                { field: "PatientFeedbackStatus.Description", displayName: $translate.instant('patientemr.patientfeedbacks-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-if="row.entity.PatientFeedbackStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-if="row.entity.PatientFeedbackStatusId==2||row.entity.PatientFeedbackStatusId==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-if="row.entity.PatientFeedbackStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [{ Key: 1, Value: utl.Session.getCurrentUserId() }]
                    },
                    Default: false
                }
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

    patientfeedbacksListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();