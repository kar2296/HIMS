(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('samplecollectlistController', samplecollectlistController);

    function samplecollectlistController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));


        $scope.Items = [];

        $scope.currentfilter = {
            OrdDeptId: -1,
            ordernrbillnr: '',
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            // FrmOrderReqDate: '',
            // ToOrderReqDate: '',
            orderstatusid: -1,
            patienttypeid: -1,
            samplestatusid: '',
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.SubdeptDisable = true;
        $scope.showsubdept = 0;
        $scope.showsubdept =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'showsubdept');

        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        }
        $scope.currentcontext = {};
        if ($scope.currentfilter.TestTypeId == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentfilter.TestTypeId == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentfilter.TestTypeId == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }



        $scope.currentcontext = {};

        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1,
                // From: utl.Formatter.getCurrentDate(),
                // To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'ordermanagement.orderacknowledgement-form.from.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'ordermanagement.orderacknowledgement-form.to.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'ordermanagement.orderacknowledgement-form.workorder.lbl',
                        model: 'ordernrbillnr',
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderedby.lbl',
                        model: 'DoctorId',
                        options: $scope.lookup.Doctor,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderfrom.lbl',
                        model: 'OrderFromId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_ward.lbl',
                        model: 'WardId',
                        options: $scope.lookup.Ward,
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_guarantor.lbl',
                        model: 'GuarantorId',
                        options: $scope.lookup.Guarantor,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'ordermanagement.orderacknowledgement-form.gtype.lbl',
                        model: 'GuarantorTypeId',
                        options: $scope.lookup.GuarantorType,
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'ordermanagement.orderacknowledgement-list.orderstatus.lbl',
                        model: 'orderstatusid',
                        options: $scope.lookup.OrderStatus,
                        position: {
                            r: 2,
                            c: 2
                        }
                    },
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
        $scope.dashboard = function () {
            $state.go('app.lisdashboard');
        };

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
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
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };

        $scope.getList = function (pageNo) {
            if (!$scope.currentfilter.FromDate || !$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg($translate.instant('Please select any Date'));
                return;
            } else {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                // if ($scope.currentfilter.PatOrdNo) {
                //     var From = null;
                //     var To = null;
                //     $scope.currentfilter.samplestatusid = null;
                // }
                var inputData = {
                    Params: [
                        // {
                        //     Key: 2,
                        //     Value: $scope.currentfilter.ordernrbillnr
                        // },
                        {
                            Key: 4,
                            Value: $scope.currentfilter.Patient
                        },
                        {
                            Key: 3,
                            Value: $scope.currentfilter.patienttypeid
                        },
                        {
                            Key: 20,
                            Value: $scope.currentfilter.PatOrdNo
                        },
                        {
                            Key: 21,
                            Value: $scope.currentfilter.samplestatusid
                        },
                        {
                            Key: 7,
                            Value: ['1', '6', '8', '9', '10', '11', '16', '17'] //Cancel and Rejected status should not load
                        },
                        // {
                        //     Key: 7,
                        //     Value: $scope.advancedfilter.orderstatusid
                        // },
                        // {
                        //     Key: 8,
                        //     Value: $scope.advancedfilter.DoctorId
                        // },
                        // {
                        //     Key: 10,
                        //     Value: From
                        // },
                        // {
                        //     Key: 11,
                        //     Value: To
                        // },
                        {
                            Key: 24,
                            Value: From
                        },
                        {
                            Key: 25,
                            Value: To
                        },
                        {
                            Key: 25,
                            Value: To
                        },
                        {
                            Key: 16,
                            Value: $scope.currentfilter.WorkOrderdid
                        },
                        {
                            Key: 17,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        {
                            Key: 18,
                            Value: $scope.currentfilter.VisitIdentifier
                        }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'lis/workordersample/GetWorkOrderSamples',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: '',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.samplecollect', {
                    id: entity.Id
                });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    }
                });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.Id
                    },
                    confirmCallback: $scope.onDetailSave
                });
            }
        }


        var sno = {
            field: "S.No",
            displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
        };

        var ordNumber = {
            field: "OrderNumber",
            displayName: $translate.instant('Order No/Bill No'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.PatientOrder.BillNumber}}&nbsp;</span>" + "</div>"
        };
        var orderDate = {
            field: "CreatedAt",
            displayName: $translate.instant('Date'),
            cellTemplate: "<ngformatdate datetime-val='entity.CreatedAt'></ngformatdate>"
        };
        var mrn = {
            field: "MRN",
            displayName: $translate.instant('Patient ID'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
        };

        var patName = {
            field: "PatientMRN",
            displayName: $translate.instant('ordermanagement.samplecollection.patientinfo.lbl'),
            width: '15%',
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                "<span >/<span>" +
                "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                "<span >{{entity.Patient.Age}}</span>" +
                "<span >/</span>" +
                "<span >{{entity.Patient.Gender.Description}}</span>" +
                "</a></div>"
        };

        var OrdPriority = {
            field: "OrderPriority",
            displayName: $translate.instant('ordermanagement.samplecollection.priority.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.OrderPriority.Description}} </div>'
        };

        var woNum = {
            field: "PatientWorkorder.WorkOrderdid",
            displayName: $translate.instant('ordermanagement.orderacknowledgement-form.workorder.lbl')
        };

        var subDept = {
            field: "PatientOrder.SubDeparement.DepartmentName",
            displayName: $translate.instant('Sub Department')
        }

        var samStatus = {
            field: "SampleStatus",
            displayName: $translate.instant('ordermanagement.samplecollection.samplestatuse.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents " >{{entity.SampleStatus.Description}}</div>'
        };

        var actions = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
</div>',
            handleEvent: $scope.handleEvents,
            actions: []
        };


        if ($scope.showsubdept == 1) {
            var ColDefs = [sno, ordNumber, mrn, orderDate, patName, subDept, OrdPriority, woNum, samStatus, actions];
        } else {
            var ColDefs = [sno, ordNumber, mrn, orderDate, patName, OrdPriority, woNum, samStatus, actions];
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: ColDefs,
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function setDefaults() {
            //Setting default status filters starts
            var pendingStatusId = utl.Lookup.getDefault($scope.lookup.SampleStatus, 'Pending');
            var rejectedStautsId = utl.Lookup.getDefault($scope.lookup.SampleStatus, 'Rejected');
            $scope.currentfilter.samplestatusid = pendingStatusId + "," + rejectedStautsId;
            //Setting default status filters ends
        }

        $scope.getDateDiff = function () {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromDate,
                $scope.currentfilter.ToDate
            );
            if (!(resultInHours >= 0 && resultInHours <= 72)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
                $scope.currentfilter.FromDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                $scope.currentfilter.ToDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                return false;
            } else {
                $scope.getList();
            }
        }
        $scope.getDateDiffInHours = function (Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            setDefaults();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "OrderStatus"
                },
                {
                    "Key": "SampleStatus"
                },
                {
                    "Key": "EncounterType"
                },
                // {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Ward"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "GuarantorType"
                },
                // {
                //     "Key": "SubDepartment",
                //     Request: {
                //         Params: [{
                //             Key: 6,
                //             Value: $scope.currentcontext.deptcode
                //         }]
                //     }
                // },
            ]
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

    samplecollectlistController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();