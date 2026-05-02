(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionsListController', admissionsListController);

    function admissionsListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.Items = [];
        $scope.currentcontext = {
            GuarantorTypeId: 1,
        };
        $scope.currentfilter = {
            GuarantorTypeId: -1,
            facilityid: utl.Session.getCurrentFacilityId(),
            wardid: -1,
            admissionstatusid: 2,
            patientnamemrn: '',
            AdmissionRequestTypeId: -1,
            WardId: -1,
            DoctorId: -1,
            admissiondate: utl.Formatter.getCurrentDate()
        };
        //  Start
        $('#myModal').hide();
        $scope.showprocessflow = function () {
            $('#myModal').show();
        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.backtoList = function () {
            if ($scope.Context == 'frontoffice') {
                $state.go('app.frontdashboard');
            } else if ($scope.Context == 'billing') {
                $state.go('app.billingsdashboard');
            }
        };
        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        }
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {
                // From: '',
                // To: ''
            };
            $scope.advancedfilterDefault = {
                PatientId: -1,

                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1,
                //   From: utl.Formatter.getCurrentDate(),
                //To: utl.Formatter.getCurrentDate(),


            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'admissions.filter_admissiondate.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'admissions.filter_dischargedate.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    //{ type: 'select', translate: 'admissions.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    {
                        type: 'select',
                        translate: 'admissions.filter_department.lbl',
                        model: 'DepartmentId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_guarantortype.lbl',
                        model: 'GuarantorTypeId',
                        options: $scope.lookup.GuarantorType,
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_refferal.lbl',
                        model: 'ReferralId',
                        options: $scope.lookup.Referral,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_guarantor.lbl',
                        model: 'GuarantorId',
                        options: $scope.lookup.Guarantor,
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_serviceratecategory.lbl',
                        model: 'ServiceRateCategoryId',
                        options: $scope.lookup.ServiceRateCategory,
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_diagnosis.lbl',
                        model: 'DiagnosisId',
                        options: $scope.lookup.Diagnosis,
                        position: {
                            r: 3,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'admissions.filter_attender.lbl',
                        model: 'AttenderName',
                        position: {
                            r: 4,
                            c: 0
                        }
                    },
                    {
                        type: 'checkbox',
                        translate: 'admissions.filter_isreadmission.lbl',
                        model: 'IsReadmission',
                        position: {
                            r: 4,
                            c: 1
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
        //  End
        $scope.getListCallback = function (scope, data, options, hasError) {

            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentfilter.patientnamemrn ||
                $scope.currentfilter.VisitIdentifier || $scope.currentfilter.AttenderPhone) {
                $scope.currentfilter.admissiondate = '';
            }

            var FromAdm = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDOD = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;

            // if (!$scope.currentfilter.admissiondate) {
            //     utl.Alert.showErrorMsg($translate.instant('Please select any date'));
            //     return false;
            // }

            //    if ($scope.advancedfilter.From != '' || $scope.advancedfilter.To != '') {
            //         $scope.currentfilter.AdmissionDate = '';
            //         //Thu Apr 27 2017 00:00:00 GMT+0530 (India Standard Time)
            //         //"2017-04-01T00:00:00+05:30"
            //         var fromDate = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00'); //"2017-04-01 00:00:00"
            //         var toDate = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59'); //"2017-04-26 23:59:59"
            //     } else {
            //         var fromDate = $filter('date')($scope.currentfilter.AdmissionDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
            //         var toDate = $filter('date')($scope.currentfilter.AdmissionDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"
            //     }
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.facilityid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.admissionstatusid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.AdmissionRequestTypeId
                    },
                    {
                        Key: 9,
                        Value: $scope.advancedfilter.DiagnosisId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.RequestNo
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.VisitIdentifier
                    },
                    {
                        Key: 23,
                        Value: $scope.currentfilter.GuarantorTypeId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 15,
                        Value: 2
                    },
                    //  { Key: 16, Value: utl.Formatter.getFilterDate($scope.currentfilter.AdmissionDate) },
                    //     { Key: 16, Value: [fromDate, toDate] },
                    //    { Key: 17, Value: $scope.advancedfilter.From },
                    // { Key: 18, Value: $scope.advancedfilter.To },
                    {
                        Key: 17,
                        Value: FromAdm
                    },
                    {
                        Key: 29,
                        Value: ToDOD
                    },
                    {
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 20,
                        Value: $scope.currentfilter.AttenderPhone
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Patient Info popup  Start  

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }
        // Patient Info popup  End  
        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.admissiontab.admission', {
                id: 0,
                pid: -1
            });
        }

        $scope.filter = function () {
            $state.go('app.admissions.advancefilter', {
                advancefilterid: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Visit/Visit/DeleteEncounter',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        // Cancel Requests from List Screen Function - Start 
        $scope.cancelItem = function () {
            $scope.item.AdmissionRequestStatusId = 3;
            var options = {
                action: 'Visit/Visit/UpdateEncounter',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function (pageNo) {

            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.CancelId
                },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function (cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }
        /*  for bedtransfer*/
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.populateGrid
            });
        }

        $scope.getOccupancyCallBack = function (scope, data, options, hasError) {
            $scope.openModal('app.bedcomplete', {
                historyid: data.Data[0].Id
            });
        }

        $scope.getOccupancy = function (EncounterId) {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: EncounterId
                    },
                    {
                        Key: 2,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOccupancyCallBack
            };
            utl.Http.doAction(options);
        }

        $scope.getOccupancyHistoryCallBack = function (scope, data, options, hasError) {
            $scope.openModal('app.bedtransferform', {
                historyid: data.Data[0].Id,
                pid: data.Data[0].PatientId,
                encounterid: options.data.EncounterId
            });
        }

        $scope.getOccupancyHistory = function (EncounterId) {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: EncounterId
                    },
                    {
                        Key: 2,
                        Value: 1
                    },
                    {
                        Key: 5,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                },
                EncounterId: EncounterId
            };
            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOccupancyHistoryCallBack
            };
            utl.Http.doAction(options);
        }


        // Cancel Requests from List Screen Function - End 
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.admissiontab.admission', {
                    id: entity.Id,
                    pid: entity.PatientId,
                });
            }
            if (actionType == 'profile') {
                utl.Modal.open('app.newpatientregister', {
                    params: {
                        eid: entity.Id,
                        pid: entity.PatientId,
                    },
                    confirmCallback: $scope.getitem
                });
            }
            /*  for bedtransfer*/

            if (actionType == 'request') {
                if (entity.IsBillLock) {
                    utl.Alert.showErrorMsg($translate.instant('admissions.billlock.lbl'));
                    return false;
                } else
                    $scope.getOccupancyHistory(entity.Id)
            }
            if (actionType == 'complete') {
                $scope.getOccupancy(entity.Id)

            }
            /*  for bedtransfer*/
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.VisitIdentifier);
            } else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            } else if (actionType == 'cancel') { //Cancel Event 
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity.Id, entity.RequestIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.admissiontab.admission', {
                    id: entity.Id,
                    pid: entity.PatientId,
                });
            }
        }

        $scope.print = function () {
            utl.Modal.open('app.admissionrequestprint', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }

        var rowtpl = '<div ng-class="{\'billlock\':entity.IsBillLock==1 && entity.AdmissionStatusId!==6&&entity.AdmissionStatusId!==5} "><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('admissions.filter_admissiondate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "VisitIdentifier",
                    displayName: $translate.instant('IP No')
                },
                {
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        //     '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        //     '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" >' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents

                },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('admissions.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}} </span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('currentinpatient.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity    )">' +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "Guarantor.GuarantorName",
                    displayName: $translate.instant('currentinpatient.guarantor.lbl')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('admissions.department.lbl')
                },
                {
                    field: "AdmissionStatus.Description",
                    displayName: $translate.instant('admissions.status.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;class='col-sm-2'></div>\
                                                &nbsp;<span>{{entity.AdmissionStatus.Description}}</span>\
                                            </div>"
                },
                // { field: "AttenderPhone", displayName: $translate.instant('admissions.filter_mobileno.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents list">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.AdmissionStatusId==2||entity.AdmissionStatusId==3 || entity.AdmissionStatusId==4 || entity.AdmissionStatusId==5 || entity.AdmissionStatusId==6|| entity.AdmissionStatusId==7"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.AdmissionStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'request\',entity)"ng-show="entity.AdmissionStatusId==2 || entity.AdmissionStatusId==3 ||entity.AdmissionStatusId==4"><img class="imgsrc" src="app/img/main/disabled.png"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'profile\',entity)"><img uib-tooltip="Profile" tooltip-placement="bottom" class="drhms-edit-button" src="assets/svg/profileicon.svg" alt="">\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.AdmissionStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "AdmissionStatus"
                },
                {
                    "Key": "PatientName"
                },
                {
                    "Key": "Ward",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId()
                        }]
                    }
                },
                {
                    "Key": "AdmissionRequestType"
                },
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
                    "Key": "Department"
                },
                {
                    "Key": "Diagnosis"
                },
                {
                    "Key": "AdmissionType"
                },
                // {
                //     "Key": "Guarantor",
                //     Request: {
                //         Params: [{
                //             Key: 7,
                //             Value: utl.Session.getCurrentFacilityId()
                //         }]
                //     }
                // },
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
                    "Key": "Referral"
                },
                {
                    "Key": "ServiceRateCategory"
                },
                {
                    "Key": "GuarantorType"
                },

            ]
            /*   2/12/2016 */
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
    admissionsListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();