(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientOrderListController', patientOrderListController);

    function patientOrderListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Items = [];
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
        $scope.currentfilter = {
            orderpriorityid: -1,
            orderstatusid: 1,
            patient: '',
            WardId: -1,
            TestTypeId: -1,
            OrderDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.advancedfilter = {
            From: '',
            To: '',
        };
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DiagnosisId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'patientemr.patientorder-list.from.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'patientemr.patientorder-list.to.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'patientemr.patientorder-list.number.lbl', model: 'OrderNumber', position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderfrom.lbl', model: 'OrderFromId', options: $scope.lookup.Department, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderto.lbl', model: 'OrderToId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.filter_priority.lbl', model: 'orderpriorityid', options: $scope.lookup.OrderPriority, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderedby.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 3, c: 0 } },
                    { position: { r: 3, c: 1 } },
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
        }
        //Dynamic form  ends

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.currentcontext = {};
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.pid = isMainContext() ? 0 : parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($stateParams.tp) {
            $scope.currentfilter.TestTypeId = $stateParams.tp;
        }
        var formState = isMainContext() ? 'app.patientorder' : 'patientemr.patientorder';

        //Visibility rules starts

        function isMainContext() {
            return $scope.currentcontext.context == 'main';
        }

        $scope.canShowPatientFilter = function () {
            return isMainContext();
        }

        //Visibility rules ends

        //get list
        $scope.custom_sort = function (a, b) {
            return new Date(b.OrderRequestDate).getTime() - new Date(a.OrderRequestDate).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.OrderDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.OrderDate, 'yyyy-MM-dd 23:59:59');
            if ($scope.advancedfilter.From || $scope.advancedfilter.To || $scope.currentfilter.patient ||
                $scope.currentfilter.OrderNumber || $scope.currentfilter.VisitIdentifier) {
                $scope.currentfilter.OrderDate = '';
            }
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.orderpriorityid },
                    { Key: 4, Value: $scope.currentfilter.orderstatusid },
                    { Key: 6, Value: $scope.currentfilter.OrderNumber },
                    { Key: 7, Value: [FrmDate, ToDate] },
                    { Key: 11, Value: $scope.currentfilter.OrderFromId },
                    { Key: 10, Value: $scope.advancedfilter.DoctorId },
                    { Key: 3, Value: $scope.advancedfilter.orderpriorityid },
                    { Key: 4, Value: $scope.advancedfilter.orderstatusid },
                    { Key: 6, Value: $scope.advancedfilter.OrderNumber },
                    { Key: 11, Value: $scope.advancedfilter.OrderFromId },
                    { Key: 12, Value: $scope.advancedfilter.From },
                    { Key: 13, Value: $scope.advancedfilter.To },
                    { Key: 14, Value: $scope.advancedfilter.OrderToId },
                    { Key: 15, Value: $scope.currentfilter.TestTypeId },
                    { Key: 20, Value: $scope.currentfilter.VisitTypeId },
                    { Key: 27, Value: $scope.currentfilter.FacilityId },
                    { Key: 30, Value: $scope.currentfilter.VisitIdentifier }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if (!isMainContext()) {
                inputData.Params.push({ Key: 2, Value: $scope.currentcontext.pid });
            }

            if (isMainContext()) {
                inputData.Params.push({ Key: 8, Value: $scope.currentfilter.patient });
                inputData.Params.push({ Key: 17, Value: $scope.currentfilter.WardId });
                // inputData.Params.push({ Key: 16, Value: 2 });
            }

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
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
        $scope.addNewOrder = function () {
            if (!isMainContext())
                if ($scope.currentcontext.encounter.IsBillLock == false) {
                    $state.go(formState, { id: 0, pid: $scope.currentcontext.pid, testtype: $scope.currentfilter.TestTypeId });
                } else
                    utl.Alert.showErrorMsg(" Bill is Locked");
            else {
             $state.go(formState, { id: 0, pid: $scope.currentcontext.pid, testtype: $scope.currentfilter.TestTypeId }); $state.go(formState, { id: 0, pid: $scope.currentcontext.pid, testtype: $scope.currentfilter.TestTypeId });
        }
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientorder/DeletePatientOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go(formState, { id: row.entity.Id, pid: row.entity.PatientId, testtype: $scope.currentfilter.TestTypeId });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            } else if (actionType == 'view') {
                $state.go(formState, { id: row.entity.Id, pid: row.entity.PatientId, testtype: $scope.currentfilter.TestTypeId });
            } else if (actionType == 'copy') {
                $state.go(formState, { id: 0, pid: row.entity.PatientId, testtype: $scope.currentfilter.TestTypeId, copyid: row.entity.Id });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
            else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: { pid: row.entity.PatientId, oid: row.entity.Id },
                    confirmCallback: $scope.onDetailSave
                });
            }
            else if (actionType == 'print') {
                var inputData = {
                    Id: row.entity.Id
                };
                var options = {
                    action: 'emr/patientorder/PrintPatientOrder',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }

        }
        var patientCol = {
            field: "Patient.FirstName",
            displayName: $translate.instant('patientemr.patientorder-list.patient.lbl'),
            width: '20%',
            cellTemplate: '<div class="ui-grid-cell-contents">\
                                            <a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.MRN}} / {{row.entity.Patient.Title.Description}} / {{row.entity.Patient.FirstName}} / {{row.entity.Patient.LastName}}  {{row.entity.Patient.Age}}" tooltip-placement="right"><span ng-if="row.entity.Patient.MRN">{{row.entity.Patient.MRN}}&nbsp;/</span>\
                                            <span ng-if="row.entity.Patient.Title && row.entity.Patient.Title.Description">{{row.entity.Patient.Title.Description}}&nbsp;</span>\
                                            <span>{{row.entity.Patient.FirstName}}</span>&nbsp;<span>{{row.entity.Patient.LastName}}</span>\
                                            <span ng-if="row.entity.Patient.Age">/&nbsp;{{row.entity.Patient.Age}}</span></a>\
                                    </div>'
        };
        var OrderNumber = {
            field: "OrderNumber",
            displayName: $translate.instant('patientemr.patientorder-list.number.lbl')
        };
        var OrderedBy = {
            field: "OrderedBy",
            displayName: $translate.instant('patientemr.patientorder-list.orderedby.lbl'),
            cellTemplate: "<displayuser user='row.entity.User'></displayuser>"
        };
        var OrderPriority = {
            field: "OrderPriority.Description",
            displayName: $translate.instant('patientemr.patientorder-list.priority.lbl')
        };
        var OrderRequestDate = {
            field: "OrderRequestDate",
            displayName: $translate.instant('patientemr.patientorder-list.ordereddateandtime.lbl'),
            cellTemplate: "<ngformatdate datetime-val='row.entity.OrderRequestDate'></ngformatdate>"
        };
        var OrderType = {
            field: "TESTMASTERTYP.Description",
            displayName: $translate.instant('patientemr.patientorder-list.ordertype.lbl')
        };
        var OrderScheduleDate = {
            field: "OrderScheduleDate",
            displayName: $translate.instant('patientemr.patientorder-list.scheduledateandtime.lbl'),
            cellTemplate: "<ngformatdate date-val='row.entity.OrderScheduleDate'></ngformatdate>"
        };
        var OrderFrom = {
            field: "OrderFrom.DepartmentName",
            displayName: $translate.instant('patientemr.patientorder-list.orderfrom.lbl')
        };
        var OrderTo = {
            field: "OrderTo.DepartmentName",
            displayName: $translate.instant('patientemr.patientorder-list.orderto.lbl')
        };
        var VisitType = {
            field: "Encounter.EncounterType.Description",
            displayName: $translate.instant('patientemr.patientorder-list.visit.lbl')
        };
        var Visitno = {
            field: "Encounter.VisitIdentifier",
            displayName: $translate.instant('patientemr.patientorder-list.opipno.lbl')
        };
        var OrderStatus = {
            field: "OrderStatus.DisplayName",
            displayName: $translate.instant('patientemr.patientorder-list.status.lbl')
        };
        var actions = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.OrderStatusId==3||row.entity.OrderStatusId==9||row.entity.OrderStatusId==10"><i class="btn btn-success btn-rounded fa fa-pencil" aria-hidden="true" uib-tooltip="Edit" tooltip-placement="bottom"\></i></span>\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"ng-show="row.entity.OrderStatusId==1 ||row.entity.OrderStatusId==2"><i class="btn btn-default btn-rounded fa fa-eye" aria-hidden="true" uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'copy\',row)"ng-show="row.entity.OrderStatusId==1 ||row.entity.OrderStatusId==2" uib-tooltip="Copy"\
                     tooltip-placement="bottom"><i class="btn btn-default btn-rounded fa fa-clone" aria-hidden="true"></i></span>\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.OrderStatusId==3||row.entity.OrderStatusId==9||row.entity.OrderStatusId==10"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'ordertat\',row)" ><i class="btn btn-info btn-rounded fa fa-list" aria-hidden="true"uib-tooltip="Order TAT"\
                     tooltip-placement="bottom"></i></span>\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'print\',row)" ><i class="btn btn-info btn-rounded fa fa-print" aria-hidden="true"uib-tooltip="Print"\
                     tooltip-placement="bottom"></i></span>\
                    </div>',
        };
        var colDefs = [OrderNumber, OrderedBy, OrderPriority, OrderRequestDate, OrderScheduleDate, OrderType, OrderFrom, OrderTo, OrderStatus, actions];
        if (isMainContext()) {
            var colDefs = [OrderRequestDate, OrderNumber, patientCol, OrderPriority, OrderType, OrderedBy, VisitType, Visitno, OrderFrom, OrderStatus, actions];
        }
        var rowtpl = '<div ng-class="{\'priority\':row.entity.OrderPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: colDefs,
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderPriority" },
                { "Key": "OrderStatus" },
                //{ "Key": "Doctor" },
                { "Key": "TESTMASTERTYP" },
                { "Key": "EncounterType" },
                { "Key": "Department" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "OrderType" },
                { "Key": "Ward" },
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

    patientOrderListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();