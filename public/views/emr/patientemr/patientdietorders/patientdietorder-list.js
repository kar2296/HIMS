(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDietOrderListController', patientDietOrderListController);

    function patientDietOrderListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            orderpriorityid: -1,
            orderstatusid: 1,
            patient: '',
            VisitTypeId: 2,
            WardId: -1,
            DietFrequencyId: -1,
            orderdate: utl.Formatter.getCurrentDate(),

        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.eid = parseInt($stateParams.eid);

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.IsBillLocked = $scope.currentcontext.encounter.IsBillLock;
        }
        $scope.advancedfilter = {
            From: '',
            To: '',
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DiagnosisId: -1,
                To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'patientemr.patientorder-list.from.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'patientemr.patientorder-list.to.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'patientemr.patientorder-list.number.lbl', model: 'OrderNumber', position: { r: 0, c: 2 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderto.lbl', model: 'OrderToId', options: $scope.lookup.Department, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.filter_priority.lbl', model: 'orderpriorityid', options: $scope.lookup.OrderPriority, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderedby.lbl', model: 'UserId', options: $scope.lookup.User, position: { r: 1, c: 2 } },
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
        // $scope.dashboard = function () {
        //     $state.go('patientemr.patientdashboard');
        // }
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

        // $scope.currentcontext = {};
        // $scope.currentcontext.context = $stateParams.context;
        // // $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        // $scope.currentcontext.pid = isMainContext() ? 0 : parseInt(utl.Session.getEMRPatientId());
        // $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        // if ($stateParams.tp) {
        //     $scope.currentfilter.TestTypeId = $stateParams.tp;
        // }
        var formState = isMainContext() ? 'app.patientdietorder' : 'patientemr.patientdietorderform';


        function isMainContext() {
            return $scope.currentcontext.context == 'main';
        }

        $scope.canShowPatientFilter = function () {
            return isMainContext();
        }

        //get list
        $scope.custom_sort = function (a, b) {
            return new Date(b.OrderRequestDate).getTime() - new Date(a.OrderRequestDate).getTime();
        }
        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     if (res.Data.length > 0)
        //         res.Data.sort($scope.custom_sort);
        //     vm.gridConfig.data = res.Data;

        //     vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        // };

        $scope.getListCallback = function (scope, data, options, hasError) {

            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            for (var idx in data.Data) {
                data.Data[idx].isattender = 'No';

                if (data.Data[idx].PatientDietOrderDetails[0].IsAttender == true) {
                    data.Data[idx].isattender = 'Yes';
                }

            }
            vm.gridConfig.data = data.Data;

            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;

        };
        $scope.getList = function () {
            var fromdate = $filter('date')($scope.currentfilter.orderdate, 'yyyy-MM-dd 00:00:00');
            var todate = $filter('date')($scope.currentfilter.orderdate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.orderpriorityid },
                    { Key: 4, Value: $scope.currentfilter.orderstatusid },
                    { Key: 9, Value: $scope.currentfilter.OrderNumber },
                    { Key: 3, Value: $scope.advancedfilter.orderpriorityid },
                    { Key: 4, Value: $scope.advancedfilter.orderstatusid },
                    { Key: 9, Value: $scope.advancedfilter.OrderNumber },
                    ({ Key: 7, Value: $scope.advancedfilter.fromdate }),
                    ({ Key: 8, Value: $scope.advancedfilter.todate }),
                    { Key: 10, Value: $scope.advancedfilter.OrderToId },
                    { Key: 11, Value: $scope.advancedfilter.UserId },
                    { Key: 15, Value: $scope.currentfilter.DietFrequencyId },
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
                inputData.Params.push({ Key: 5, Value: $scope.currentfilter.patient });
                inputData.Params.push({ Key: 6, Value: $scope.currentfilter.WardId });
                // inputData.Params.push({ Key: 16, Value: 2 });
                inputData.Params.push({ Key: 7, Value: fromdate })

                inputData.Params.push({ Key: 8, Value: todate })
            }
            var options = {
                action: 'emr/patientdietorder/GetPatientDietOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // $scope.doctor_dashboard = function () {
        //     $state.go('app.doctordashboard');
        // }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        //Grid Actions
        $scope.addNewOrder = function () {
            // if (!isMainContext())
            //     if ($scope.currentcontext.encounter.IsBillLock == false) {
            //         $state.go(formState, { id: 0, pid: $scope.currentcontext.pid });
            //     } else
            //         utl.Alert.showErrorMsg(" Bill is Locked");
            // else {
            //     $state.go(formState, { id: 0, pid: $scope.currentcontext.pid });
            // }
            if (isMainContext) {
                $state.go('app.patientdietorder');
            }
            if ($scope.Context == 'ipemr' || !$scope.Context) {
                $state.go('patientemr.patientdietorderform');
            }
            if ($scope.Context == 'surgery') {
                $state.go('surgeryentry.patientdietorderform');
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
                action: 'emr/patientdietorder/DeletePatientDietOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go(formState, { id: entity.Id, pid: entity.PatientId });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'view') {
                $state.go(formState, { id: entity.Id, pid: entity.PatientId });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        }
        var patientCol = {
            field: "Patient.FirstName",
            displayName: $translate.instant('patientemr.patientdietorder-list.patient.lbl'),
            width: '20%',
            cellTemplate: '<div class="ui-grid-cell-contents">\
                                            <a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.MRN}} / {{entity.Patient.Title.Description}} / {{entity.Patient.FirstName}} / {{entity.Patient.LastName}}  {{entity.Patient.Age}}" tooltip-placement="right"><span ng-if="entity.Patient.MRN">{{entity.Patient.MRN}}&nbsp;/</span>\
                                            <span ng-if="entity.Patient.Title && entity.Patient.Title.Description">{{entity.Patient.Title.Description}}&nbsp;</span>\
                                            <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                            <span ng-if="entity.Patient.Age">/&nbsp;{{entity.Patient.Age}}</span></a>\
                                    </div>'
        };
        var OrderNumber = {
            field: "OrderNumber",
            displayName: $translate.instant('patientemr.patientdietorder-list.number.lbl')
        };
        var OrderedBy = {
            field: "OrderedBy",
            displayName: $translate.instant('patientemr.patientdietorder-list.orderedby.lbl'),
            cellTemplate: "<displayuser user='entity.User'></displayuser>"
        };
        var OrderPriority = {
            field: "OrderPriority.Description",
            displayName: $translate.instant('patientemr.patientdietorder-list.priority.lbl')
        };
        var DietFrequency = {
            field: "DietFrequency.Description",
            displayName: $translate.instant('patientemr.patientdietorder-form.frequency.lbl')
        };
        var OrderRequestDate = {
            field: "OrderRequestDate",
            displayName: $translate.instant('patientemr.patientdietorder-list.ordereddateandtime.lbl'),
            cellTemplate: "<ngformatdate datetime-val='entity.OrderRequestDate'></ngformatdate>"
        };
        var OrderScheduleDate = {
            field: "OrderScheduleDate",
            displayName: $translate.instant('patientemr.patientdietorder-list.scheduledateandtime.lbl'),
            cellTemplate: "<ngformatdate date-val='entity.OrderScheduleDate'></ngformatdate>"
        };
        var OrderFrom = {
            field: "OrderFrom.DepartmentName",
            displayName: $translate.instant('patientemr.patientdietorder-list.orderfrom.lbl')
        };
        var OrderTo = {
            field: "OrderTo.DepartmentName",
            displayName: $translate.instant('patientemr.patientdietorder-list.orderto.lbl')
        };
        var VisitNo = {
            field: "Encounter.VisitIdentifier",
            displayName: $translate.instant('patientemr.patientdietorder-list.visitno.lbl')
        };
        var Ward = { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') };
        var isattender = {
            field: "isattender",
            displayName: $translate.instant('patientemr.patientdietorder-list.isattender.lbl'),
            //   cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.isattender ? "Yes" : "No" }} </div>'
        }
        var RoomDetails = {
            field: "WardRoomMaster",
            displayName: $translate.instant('patientemr.patientdietorder-list.roomdetails.lbl'),
            width: '20%',
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
                "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                "</div>",
            handleEvent: $scope.handleEvents,
            actions: []
        };
        var OrderStatus = {
            field: "OrderStatus.DisplayName",
            displayName: $translate.instant('patientemr.patientdietorder-list.status.lbl')
        };
        var actions = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                     <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.OrderStatusId==3||entity.OrderStatusId==9||entity.OrderStatusId==10"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                     <span class="grid-action" ng-click="handleEvents(\'view\',entity)"ng-show="entity.OrderStatusId==1 ||entity.OrderStatusId==2 || entity.OrderStatusId==11"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                     <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.OrderStatusId==3||entity.OrderStatusId==9||entity.OrderStatusId==10"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
            handleEvent: $scope.handleEvents,
            actions: []
        };
        var colDefs = [OrderNumber, OrderedBy, OrderPriority, DietFrequency, OrderRequestDate, OrderScheduleDate, OrderTo, OrderStatus, actions];
        if (isMainContext()) {
            var colDefs = [OrderRequestDate, OrderNumber, DietFrequency, patientCol, VisitNo, Ward, RoomDetails, OrderPriority, isattender, OrderStatus, actions];
        }
        var entitytpl = '<div ng-class="{\'priority\':entity.OrderPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-entity-header-cell\': col.isentityHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            entityTemplate: entitytpl,
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
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "EncounterType" },
                { "Key": "Department" },
                { "Key": "OrderType" },
                { "Key": "Ward" },
                { "Key": "User" },
                { "Key": "DietFrequency" }

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

    patientDietOrderListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();