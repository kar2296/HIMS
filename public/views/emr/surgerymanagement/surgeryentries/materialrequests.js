(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('materialRequestListController', materialRequestListController);

    function materialRequestListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }
        $scope.currentcontext = {};
        if ($scope.context == 'main') {
            $scope.currentcontext.id = parseInt($stateParams.id);
            $scope.currentcontext.eid = $state.params.eid;
            $scope.currentcontext.pid = $state.params.pid;
            $scope.currentcontext.otidentifier = $state.params.otidentifier;
            $scope.currentcontext.doctorid = $state.params.doctorid;
            $scope.currentcontext.doctorname = $state.params.doctorname;
            $scope.currentcontext.wardid = $state.params.wardid;
            $scope.currentcontext.roomid = $state.params.roomid;
            $scope.currentcontext.bedid = $state.params.bedid;
            $scope.currentcontext.otroomid = $state.params.otroomid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        $scope.item = {
            Id: -1,
            PatientStockRequestId: -1,
            PrescriptionId: -1
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        };

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientRequestPriorityId: 1,
            ToStoreId: -1,
            PatientRequestTypeId: 2,
            RequestNumber: '',
            PatientRequestStatusId: 2,
            PatientRequestDateTime: utl.Formatter.getCurrentDate()
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 8, Value: $scope.currentfilter.FacilityId },
                    { Key: 9, Value: $scope.currentfilter.ToStoreId },
                    { Key: 2, Value: $scope.currentfilter.PatientRequestNumber },
                    { Key: 4, Value: $scope.currentfilter.PatientRequestStatusId },
                    { Key: 5, Value: $scope.currentcontext.pid },
                    { Key: 11, Value: $scope.currentfilter.Patientname },
                    { Key: 10, Value: $scope.currentfilter.PatientRequestPriorityId },
                    { Key: 16, Value: $scope.currentcontext.eid },
                    { Key: 18, Value: $scope.currentfilter.PatientRequestTypeId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr')
                inputData.Params.push({ Key: 5, Value: $scope.currentcontext.pid });
            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            if ($scope.context == 'main')
                $state.go('app.otregistertab.materialrequest', {
                    otregisterid: $scope.currentcontext.id,
                    eid: $scope.currentcontext.eid,
                    pid: $scope.currentcontext.pid,
                    otidentifier: $scope.currentcontext.otidentifier,
                    doctorid: $scope.currentcontext.doctorid,
                    doctorname: $scope.currentcontext.doctorname,
                    wardid: $scope.currentcontext.wardid,
                    roomid: $scope.currentcontext.roomid,
                    bedid: $scope.currentcontext.bedid,
                    otroomid: $scope.currentcontext.otroomid
                });
            if ($scope.context == 'emr')
                $state.go('patientemr.medicinerequestform', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var inputData = { Header: $scope.item };
            var options = {
                action: 'IPManagement/PatientStockRequests/DeletePatientStockRequests',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                if ($scope.context == 'main')
                    $state.go('app.otregistertab.materialrequest',
                        {
                            id: row.entity.Id,
                            eid: row.entity.EncounterId,
                            pid: row.entity.PatientId
                        });
            }
            if (actionType == 'edit') {
                if ($scope.context == 'main')
                    $state.go('app.otregistertab.materialrequest', { rid: row.entity.Id, eid: row.entity.EncounterId, pid: row.entity.PatientId });
            }
            else if (actionType == 'delete') {
                $scope.item.Id = row.entity.Id;
                $scope.item.PatientStockRequestId = row.entity.Id;
                $scope.item.PrescriptionId = row.entity.PrescriptionId;
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.PatientRequestNumber);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        };

        var rowtpl = '<div ng-class="{\'priority\':row.entity.PatientRequestPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        var RequestDate = {
            field: "RequestDate",
            displayName: $translate.instant('patientrequests.requestedon.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
        }
        var PatientRequestNumber = { field: "PatientRequestNumber", displayName: $translate.instant('patientrequests.requestedno.lbl') }
        var StoreName = { field: "ToStore.StoreName", displayName: $translate.instant('patientrequests.tostore.lbl') }
        var PatientRequestPriority = { field: "PatientRequestPriority.Description", displayName: $translate.instant('patientrequests.priority.lbl') }
        var PatientRequestStatus = { field: "PatientRequestStatus.Description", displayName: $translate.instant('patientrequests.status.lbl') }
        var Id = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.PatientRequestStatusId == 2 || row.entity.PatientRequestStatusId == 3 || row.entity.PatientRequestStatusId == 4 || row.entity.PatientRequestStatusId == 5 || row.entity.PatientRequestStatusId == 6"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.PatientRequestStatusId == 1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                                                   </div>',
            actions: [
                { actiontype: 'edit', display: 'common.editaction.lbl' },
                { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                { actiontype: 'history', display: 'common.history.lbl' }
            ]
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [RequestDate, PatientRequestNumber, StoreName, PatientRequestPriority, PatientRequestStatus, Id],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        if ($scope.context == 'emr') {
            vm.gridConfig.columnDefs = [];
            vm.gridConfig.columnDefs.push(RequestDate, PatientRequestNumber, WardName, StoreName, PatientRequestPriority, PatientRequestStatus, Id);
        }

        function setDefaults() {
            var RequestedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Requested');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Authorized');
            $scope.currentfilter.PatientRequestStatusId = RequestedId + "," + AuthorizedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "PatientRequestStatus" },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentfilter.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                { "Key": "PatientRequestPriority" }
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

    materialRequestListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();