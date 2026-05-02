(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findotrequestController', findotrequestController);

    function findotrequestController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
            OTRequestStatusId: 3
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.SurgeryTypeId },
                    { Key: 2, Value: $scope.currentfilter.OTRequestStatusId },
                    { Key: 3, Value: $scope.currentfilter.ProcedureId },
                    { Key: 4, Value: $scope.currentfilter.PatientNameMRN },



                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'OtManagement/OtRequest/GetOtRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        var Startdate = {
            field: "Startdate",
            displayName: $translate.instant('otrequest-list.requestedon.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
            "<span>{{row.entity.OTRequestedOn | date:'dd-MMM-yyyy'}}</span>" + " " + "<span>{{row.entity.OTRequestedOn| date:'HH:mm'}}</span>"
            + "</div>"
        };
        var OTrequestNo = { field: "OTrequestNo", displayName: $translate.instant('otrequest-list.otno.lbl') };

        var Patient = {
            field: "Patient",
            displayName: $translate.instant('admissions.patientname.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
            '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
            '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
            // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
            +
            "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
            "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
            "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
            "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
            "<span >/</span>" +
            "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
            "<span >/<span>" +
            "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
            "<span >/</span>" +
            "<span >{{row.entity.Patient.Gender.Description}}</span>" +
            "</a></div>"
        };
        var Doctor = {
            field: "Doctor",
            displayName: $translate.instant('otrequest-list.admittingdoctor.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.Doctor.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
            '<span>{{row.entity.Doctor.FirstName}}</span>' + '</div>'
        };
        var OTRoom = { field: "OTRoom.Description", displayName: $translate.instant('otrequest-list.otroom.lbl'), };

        var Procedure = { field: "SurgeryName", displayName: $translate.instant('otrequest-list.surgeryname.lbl'), };
        var SurgeryType = { field: "SurgeryType.Description", displayName: $translate.instant('otrequest-list.surgerytype.lbl'), };

        var OTRequestStatus = { field: "OTRequestStatus.Description", displayName: $translate.instant('otrequest-list.status.lbl') };


        vm.gridConfig = {
            columnDefs: [Startdate, OTrequestNo, Patient, Doctor, OTRoom, Procedure, SurgeryType, OTRequestStatus],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableColumnResizing: true,
            enableFullRowSelection: true
        };
        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (row.entity.OTRequestStatusId == 1) {
                  utl.Alert.showErrorMsg($translate.instant('otrequest-list.draft.lbl'));
                    return false;
                }
                if (row.entity.OTRequestStatusId == 2) {
                    utl.Alert.showErrorMsg($translate.instant('otrequest-list.created.lbl'));
                     return false;
                 }
                if (row.entity.OTRequestStatusId == 4) {
                   utl.Alert.showErrorMsg($translate.instant('otrequest-list.cancelled.lbl'));
                    return false;
                }
                console.log(row.entity.Id);
                $scope.confirmCallback(row.entity);
            });
        };
        //Grid selection related code ends

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "SurgeryType" },
                { "Key": "Procedure" },
                { "Key": "OTRequestStatus" }

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

    findotrequestController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();