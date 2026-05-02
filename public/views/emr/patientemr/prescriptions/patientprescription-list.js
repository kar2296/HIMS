(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientPrescriptionListController', patientPrescriptionListController);

    function patientPrescriptionListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Item = {};
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        $scope.Items = [];
        // $scope.currentfilter.PharmacyId = utl.Session.getCurrentUserId();
        $scope.currentfilter = {
            DoctorId: -1,
            DepartmentId: -1,
            PharmacyId: -1,
            PrecriptionStatusId: 3
        };
        $scope.advancedfilter = {
            From: '',
            To: '',
        };
        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
            // $scope.currentfilter.DepartmentId = utl.Session.getCurrentDepartmentId();
        }
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                DoctorId: -1,
                DiagnosisId: -1,
                To: utl.Formatter.getCurrentDate(),

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'patientemr.patientorder-list.from.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'patientemr.patientorder-list.to.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    // { type: 'text', translate: 'patientemr.patientorder-list.number.lbl', model: 'OrderNumber', position: { r: 0, c: 2 } },
                    // { type: 'select', translate: 'patientemr.patientorder-list.ordert.lbl', options: $scope.lookup.TESTMASTERTYP, model: 'TESTMASTERTYPId', position: { r: 1, c: 0 } },
                    // { type: 'select', translate: 'patientemr.patientorder-list.visit.lbl', options: $scope.lookup.EncounterType, model: 'EncounterTypeId', position: { r: 1, c: 1 } },
                    // { type: 'select', translate: 'patientemr.patientorder-list.orderfrom.lbl', model: 'OrderFromId', options: $scope.lookup.Department, position: { r: 1, c: 2 } },
                    // { type: 'select', translate: 'patientemr.patientorder-list.orderto.lbl', model: 'OrderToId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    // { type: 'select', translate: 'patientemr.patientorder-list.filter_priority.lbl', model: 'orderpriorityid', options: $scope.lookup.OrderPriority, position: { r: 2, c: 1 } },
                    // { type: 'select', translate: 'patientemr.patientorder-list.status.lbl', model: 'orderstatusid', options: $scope.lookup.OrderStatus, position: { r: 2, c: 2 } },
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
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
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
                $scope.currentfilter.PrescriptionDate = '';
            }
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.PharmacyId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.PrecriptionStatusId
                    },
                    {
                        Key: 8,
                        Value: $scope.advancedfilter.From
                    },
                    {
                        Key: 9,
                        Value: $scope.advancedfilter.To
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
        }
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions
        $scope.addNew = function () {
            if ($scope.currentcontext.encounter.IsBillLock == false) {
                $state.go('patientemr.prescription', {
                    id: 0,
                    pid: $scope.currentcontext.pid
                });
            } else
                utl.Alert.showErrorMsg(" Bill is Locked");
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
                action: 'emr/prescription/DeletePrescription',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.cancelItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.onCancelConfirmed = function () {
            $scope.Item.PrecriptionStatusId = 2;
            var actionName = 'emr/prescription/UpdatePrescription';
            var inputData = {
                Header: $scope.Item,
                Details: $scope.Item.PrescriptionDetails
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.cancelItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('patientemr.prescription', {
                    id: row.entity.Id,
                    pid: $scope.currentcontext.pid
                });
            } else if (actionType == 'copy') {
                $state.go('patientemr.prescription', {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    copyid: row.entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            } else if (actionType == 'cancel') {
                $scope.Item = row.entity;
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'patientemr.prescription-form.cancelmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onCancelConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        //Visibility rules starts
        $scope.canShowEdit = function () {
            return false;
        }

        //Visibility rules starts
        var rowtpl = '<div ng-class="{\'priority\':row.entity.PrescriptionPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            rowTemplate: rowtpl,
            columnDefs: [{
                    field: "Identifier",
                    displayName: $translate.instant('patientemr.patientprescription-list.identifier.lbl')
                },
                {
                    field: "User.FirstName",
                    displayName: $translate.instant('patientemr.patientprescription-list.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                        "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "PrescriptionDate",
                    displayName: $translate.instant('patientemr.patientprescription-list.prescriptiondate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.PrescriptionDate'></ngformatdate>"
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('patientemr.patientprescription-list.department.lbl')
                },
                {
                    field: "PrescriptionPriority.Description",
                    displayName: $translate.instant('patientemr.patientprescription-list.prescriptionpriority.lbl')
                },
                {
                    field: "StoreMaster.StoreName",
                    displayName: $translate.instant('patientemr.patientprescription-list.pharmacy.lbl')
                },
                {
                    field: "PrecriptionStatus.Description",
                    displayName: $translate.instant('patientemr.patientprescription-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.PrecriptionStatusId == 1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"ng-show="row.entity.PrecriptionStatusId == 2 || row.entity.PrecriptionStatusId == 3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.PrecriptionStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'copy\',row)"ng-show="row.entity.PrecriptionStatusId != 1" uib-tooltip="Copy"\
                     tooltip-placement="bottom"><i class="btn btn-default btn-rounded fa fa-clone" aria-hidden="true"></i></span>\
          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-show="row.entity.PrecriptionStatusId == 3"><i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"></i></span>\
          </div>',
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Pharmacy"
                },
                {
                    "Key": "PrecriptionStatus"
                },
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        }]
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

    patientPrescriptionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();