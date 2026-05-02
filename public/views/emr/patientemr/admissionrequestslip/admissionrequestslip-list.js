(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionrequestslipListController', admissionrequestslipListController);

    function admissionrequestslipListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            AdmissionRequestTypeId: -1,
            admissionstatusid: 2,
            DoctorId: -1,
            namemrn: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 16, Value: From },
                    { Key: 17, Value: To },
                    { Key: 13, Value: $scope.currentfilter.RequestedNo },
                    { Key: 11, Value: $scope.currentfilter.PatientId },
                    { Key: 2, Value: $scope.currentfilter.admissionstatusid },
                    { Key: 8, Value: $scope.currentfilter.AdmissionRequestTypeId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/admissionrequest/GetAdmissionRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/admissionrequest/DeleteAdmissionRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('patientemr.admissionrequest', { id: 0 });
        };

        $scope.cancelItem = function () {
            $scope.item.AdmissionRequestStatusId = 3;
            var options = {
                action: 'IPManagement/admissionrequest/UpdateAdmissionRequest',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.admissionrequestslipform', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        oid: entity.Orderid
                    },
                    confirmCallback: $scope.getList
                });
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "RequestDate",
                displayName: $translate.instant('taskmanagement.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RequestDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "</div>"
            },
            { field: "RequestIdentifier", displayName: $translate.instant('Request #') },
            { field: "AdmissionRequestType.Description", displayName: $translate.instant('taskmanagement.type.lbl') },
            {
                field: "MRN",
                displayName: $translate.instant('Patient ID'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
            },
            {
                field: "PatientMRN",
                displayName: $translate.instant('ordermanagement.resultdispatch-list.patientinfo.lbl'),
                width: '20%',
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                    "<span >/<span>" +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "<span >{{entity.Patient.Age}}</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            },
            { field: "Diagnosis.DiagnosisName", displayName: $translate.instant('Diagnosis') },
            { field: "NurseInstruction", displayName: $translate.instant('NurseInstruction') },
            { field: "AdmissionRequestStatus.Description", displayName: $translate.instant('taskmanagement.status.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AdmissionRequestStatus" },
                { "Key": "AdmissionRequestType" },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    admissionrequestslipListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();