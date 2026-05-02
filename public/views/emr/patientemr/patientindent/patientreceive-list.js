(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientReceiveListController', patientReceiveListController);

    function patientReceiveListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.currentcontext = {};

        $scope.lookup = {};
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }
        $scope.item = {
            Id: -1,
            PatientStockRequestId: -1,
            PrescriptionId: -1,
            PatientRequestTypeId: 1
        };
        // $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew')
        $scope.doctor_dashboard = function () {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.stockstatus = function () {
            // $state.go('patientemr.genericwicestockstatus');
            utl.Modal.open('patientemr.genericwicestockstatus', {
                params: {
                    id: 0
                },
                confirmCallback: initAllLookup
            });
        }

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientRequestPriorityId: 1,
            ToStoreId: -1,
            PatientRequestTypeId: 1,
            RequestNumber: '',
            WardId: -1,
            RoomId: -1,
            PatientRequestStatusId: -1,
            PatientRequestDateTime: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.advancedfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                RemarkId: -1,
                LocationId: -1,
                AdmittingReasonId: -1,
                StockPriorityId: -1,
                PatientRequestTypeId: 1,
                DiagnosisId: -1,
                DoctorId: -1,
                PatientId: -1,
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'patientrequests.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'patientrequests.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'patientrequests.requestby.lbl', model: 'RequestedBy', options: $scope.lookup.RequestedUser, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientrequests.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 1, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 8, Value: $scope.currentfilter.FacilityId },
                    { Key: 9, Value: $scope.currentfilter.ToStoreId },
                    { Key: 1, Value: $scope.currentfilter.PatientRequestId },
                    { Key: 2, Value: $scope.currentfilter.PatientRequestNumber },
                    { Key: 4, Value: $scope.currentfilter.PatientRequestStatusId },
                    { Key: 5, Value: $scope.currentfilter.PatientId },
                    { Key: 11, Value: $scope.currentfilter.Patientname },
                    { Key: 6, Value: $scope.currentfilter.WardId },
                    { Key: 7, Value: $scope.currentfilter.RoomId },
                    { Key: 10, Value: $scope.currentfilter.PatientRequestPriorityId },
                    { Key: 12, Value: $scope.advancedfilter.RequestedBy },
                    { Key: 13, Value: $scope.advancedfilter.ApprovedBy },
                    { Key: 14, Value: FromReq },
                    { Key: 15, Value: ToReq },
                    { Key: 18, Value: $scope.currentfilter.PatientRequestTypeId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr' || $scope.context == 'surgery') {
                var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
                inputData.Params.push({ Key: 5, Value: $scope.currentcontext.pid }, { Key: 4, Value: $scope.currentfilter.PatientRequestStatusId }, { Key: 14, Value: utl.Formatter.getFilterDate(From) }, { Key: 15, Value: utl.Formatter.getFilterDate(To) }, );
            }
            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            // $state.go('patientemr.patientreceiveform', { id: 0 });
            if ($scope.context == 'ipemr') {
                $state.go('patientemr.patientreceiveform', { id: 0 });
            }
            if ($scope.context == 'emr') {
                $state.go('patientemr.patientreceiveform', { id: 0 });
            }
            if ($scope.context == 'surgery') {
                $state.go('surgeryentry.patientindentform', { id: 0 });
            }
        };

        $scope.doctor_dashboard = function () {
            if ($scope.Context == 'ipemr' || !$scope.Context) {
                if ($scope.From == 'nursing') {
                    $state.go('app.nursingdashboard');
                } else {
                    $state.go('app.doctordashboard');
                }
            }
            if ($scope.Context == 'surgery') {
                $state.go('app.surgerydashboard');
            }
        }
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

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'view') {
                // if ($scope.context == 'main')
                $state.go('patientemr.patientreceiveform', { id: entity.Id, eid: entity.EncounterId, pid: entity.PatientId, PatientRequestStatusId: entity.PatientRequestStatusId });
                // if ($scope.context == 'emr')
                //     $state.go('patientemr.medicinerequestform', { id: entity.Id, pid: entity.PatientId });
            }
            if (actionType == 'edit') {
                // if ($scope.context == 'main')
                $state.go('patientemr.patientreceiveform', { id: entity.Id, eid: entity.Id, pid: entity.PatientId, PatientRequestStatusId: entity.PatientRequestStatusId });
                // if ($scope.context == 'emr')
                //     $state.go('patientemr.medicinerequestform', { id: entity.Id, pid: entity.PatientId });
            } else if (actionType == 'delete') {
                $scope.item.Id = entity.Id;
                $scope.item.PatientStockRequestId = entity.Id;
                $scope.item.PrescriptionId = entity.PrescriptionId;
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.PatientRequestNumber);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        };

        // var rowtpl = '<div ng-class="{\'priority\':entity.PatientRequestPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        // var RequestDate = {
        //     field: "RequestDate",
        //     displayName: $translate.instant('Date'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span class='pl-3'>{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
        // }
        // var PatientRequestNumber = {
        //     field: "PatientRequestNumber", displayName: $translate.instant('Transaction #')

        // }
        // var ToStore = {
        //     field: "ToStore.StoreName", displayName: $translate.instant('Indent To')

        // }
        // var PatientRequestPriority = {
        //     field: "PatientRequestPriority.Description", displayName: $translate.instant('Priority')

        // }
        // var Patient = {
        //     field: "Patient",
        //     displayName: $translate.instant('patientrequests.patient.lbl'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'>"
        //         + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >'
        //         + "{{entity.Patient.Title.Description}}&nbsp;</span>"
        //         + "<span class='pl-3'>{{entity.Patient.FirstName}}&nbsp;</span>"
        //         + "<span class='pl-3'>{{entity.Patient.LastName}}</span>"
        //         + "<span class='pl-3'>/</span>"
        //         + "<span class='pl-3'>{{entity.Patient.MRN}}</span>"
        //         + "<span class='pl-3'>/<span>"
        //         + "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' class='pl-3'>"
        //         + "<span class='pl-3'>{{entity.Patient.Age}}</span>"
        //         + "<span class='pl-3'>/</span>"
        //         + "<span class='pl-3'>{{entity.Patient.Gender.Description}}</span>"
        //         + "</a></div>"
        // }
        // var WardName = {
        //     field: "WardMaster.WardName", displayName: $translate.instant('Location')
        // }
        // var StoreName = { field: "ToStore.StoreName", displayName: $translate.instant('patientrequests.tostore.lbl') }
        // var RequestedBy = {
        //     field: "RequestedUser",
        //     displayName: $translate.instant('Indent By'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'>"
        //         + "{{entity.RequestedUser.Title.Description}}&nbsp;</span>"
        //         + "<span class='pl-3'>{{entity.RequestedUser.FirstName}}&nbsp;</span>"
        //         + "<span class='pl-3'>{{entity.RequestedUser.LastName}}</span>"
        //         + "</a></div>"
        // }
        // var PatientRequestStatus = { field: "PatientRequestStatus.Description", displayName: $translate.instant('patientrequests.status.lbl') }
        // var Id = {
        //     field: "Id",
        //     displayName: $translate.instant('common.actions_col.lbl'),
        //     cellTemplate: '<div class="ui-grid-cell-contents">\
        //                             <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',entity)" ng-show="entity.PatientRequestStatusId == 2 || entity.PatientRequestStatusId == 3 || entity.PatientRequestStatusId == 4 || entity.PatientRequestStatusId == 5 || entity.PatientRequestStatusId == 6 || entity.PatientRequestStatusId == 7"><i class="fas fa-eye" aria-hidden="true"></i></span>\
        //                             <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',entity)"ng-show="entity.PatientRequestStatusId == 1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
        //                                                                            </div>',
        //     handleEvent: $scope.handleEvents,
        //     actions: []
        // }
        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     rowTemplate: rowtpl,
        //     columnDefs: [RequestDate, PatientRequestNumber, ToStore, PatientRequestPriority, Patient, WardName, StoreName, PatientRequestStatus, Id],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };
        // if ($scope.context == 'emr') {
        //     vm.gridConfig.columnDefs = [];
        //     vm.gridConfig.columnDefs.push(RequestDate, PatientRequestNumber, ToStore, PatientRequestPriority, Patient, WardName, RequestedBy, PatientRequestStatus, Id);
        // }
        var rowtpl = '<div ng-class="{\'priority\':entity.PatientRequestPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "RequestDate",
                displayName: $translate.instant('Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientRequestNumber",
                displayName: $translate.instant('Transaction #')

            },
            {
                field: "ToStore.StoreName",
                displayName: $translate.instant('Indent To')

            },
            {
                field: "PatientRequestPriority.Description",
                displayName: $translate.instant('Priority')

            },
            {
                field: "Patient",
                displayName: $translate.instant('patientrequests.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}</span>" +
                    "<span >/<span>" +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "<span >{{entity.Patient.Age}}</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            },
            {
                field: "WardMaster.WardName",
                displayName: $translate.instant('Location')
            },
            { field: "ToStore.StoreName", displayName: $translate.instant('patientrequests.tostore.lbl') },
            {
                field: "RequestedUser",
                displayName: $translate.instant('Indent By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "{{entity.RequestedUser.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.RequestedUser.FirstName}}&nbsp;</span>" +
                    "<span >{{entity.RequestedUser.LastName}}</span>" +
                    "</a></div>"
            },
            { field: "PatientRequestStatus.Description", displayName: $translate.instant('patientrequests.status.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.PatientRequestStatusId == 2 || entity.PatientRequestStatusId == 3 || entity.PatientRequestStatusId == 4 || entity.PatientRequestStatusId == 5 || entity.PatientRequestStatusId == 6 || entity.PatientRequestStatusId == 7|| entity.PatientRequestStatusId == 8"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.PatientRequestStatusId == 1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                                                               </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        { /* <i class="fas fa-eye" aria-hidden="true"></i> */ }
        function setDefaults() {
            var RequestedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Requested');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Authorized');
            var DespensedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Dispensed');
            var PartiallydespensedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Partially Dispensed');
            var ReceivedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Receive');
            $scope.currentfilter.PatientRequestStatusId = DespensedId + "," + PartiallydespensedId + "," + ReceivedId;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "PatientRequestStatus" },
                { "Key": "ToStore" },
                { "Key": "PatientRequestPriority" },
                { "Key": "Ward" },
                { "Key": "Room" },
                // { "Key": "RequestedUser" },
                // { "Key": "ApprovedUser" }
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

    patientReceiveListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();