(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('bedtransferListController', bedtransferListController);

    function bedtransferListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {

            RoomTypeId: -1,
            WardId: -1,
            StatusId: -1,
            // RequestedStatusId: 2,
            FromWardId: -1,
            TransferDate: utl.Formatter.getCurrentDate(),

        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

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
                        translate: 'admissions.bedtransferfrom.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'admissions.bedtransferto.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.doctor.lbl',
                        model: 'DoctorId',
                        options: $scope.lookup.Doctor,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.department.lbl',
                        model: 'DepartmentId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admission.room.lbl',
                        model: 'FromRoomId',
                        options: $scope.lookup.Room,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admission.bed.lbl',
                        model: 'FromBedId',
                        options: $scope.lookup.Bed,
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'admissions.requestno.lbl',
                        model: 'RequestIdentifier',
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.admissionstatus.lbl',
                        model: 'AdmissionStatusId',
                        options: $scope.lookup.AdmissionStatus,
                        position: {
                            r: 3,
                            c: 1
                        }
                    },
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    // { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $scope.backtoList = function() {
            if ($scope.Context == 'frontoffice') {
                $state.go('app.frontdashboard');
            } else if ($scope.Context == 'nursing') {
                $state.go('app.nursingdashboard');
            }
        }

        $scope.openAdvancedFilter = function() {

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


        $scope.currentfilter.facilityid = utl.Session.getCurrentFacilityId();

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {

            var From = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 23:59:59') || null;

            if (!$scope.currentfilter.TransferDate) {
                utl.Alert.showErrorMsg($translate.instant('Please select any date'));
                return false;
            }
            // if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
            //     $scope.currentfilter.RequestDate = '';
            // }
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    // { Key: 3, Value: $scope.currentfilter.PatientId },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FromWardId
                    },
                    {
                        Key: 18,
                        Value: $scope.currentfilter.RequestedStatusId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.RequestDate
                    },
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    },
                    {
                        Key: 7,
                        Value: $scope.advancedfilter.DepartmentId
                    },
                    {
                        Key: 8,
                        Value: $scope.advancedfilter.DoctorId
                    },
                    {
                        Key: 9,
                        Value: $scope.advancedfilter.FromRoomId
                    },
                    {
                        Key: 10,
                        Value: $scope.advancedfilter.FromBedId
                    },
                    {
                        Key: 11,
                        Value: $scope.advancedfilter.RequestIdentifier
                    },
                    {
                        Key: 12,
                        Value: $scope.advancedfilter.AdmissionStatusId
                    },
                    {
                        Key: 16,
                        Value: utl.Session.getCurrentFacilityId()
                    },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/BedTransfer/GetBedTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.cancelItem = function() {
            $scope.item.RequestedStatusId = 4;
            var options = {
                action: 'IPManagement/BedTransfer/UpdateBedTransfer',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function(pageNo) {

            var options = {
                action: 'IPManagement/BedTransfer/GetBedTransferById',
                data: {
                    Id: $scope.CancelId
                },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function(cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }
        $scope.addNew = function() {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.openModal = function(Id) {
            utl.Modal.open('app.bedtransferform', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'IPManagement/BedTransfer/DeleteBedTransfer',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.patientprofiledetails = function(patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.getOccupancyHistoryCallBack = function(scope, data, options, hasError) {
            //$scope.openModal('app.bedtransferform', { historyid: data.Data[0].Id, encounterid: options.data.EncounterId });
            utl.Modal.open('app.bedtransferform', {
                params: {
                    historyid: data.Data[0].Id,
                    encounterid: data.Data[0].EncounterId
                },
                confirmCallback: $scope.initLookup
            });
        }
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getOccupancyHistory = function(EncounterId) {
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
        $scope.handleEvents = function(actionType, entity) {

            // if (actionType == 'edit') {
            //     // $state.go('app.bedtransferform', { id: entity.Id });
            //                     $scope.getOccupancyHistory(entity.Id)

            // }
            // if (actionType == 'complete') {
            //     $scope.openModal('app.complete', { id: entity.Id });
            // }
            if (actionType == 'view') {
                $scope.openModal(entity.Id);
                // $scope.getOccupancyHistory(entity.EncounterId)

            }
            if (actionType == 'edit') {
                $scope.getOccupancyHistory(entity.EncounterId)

            }
            if (actionType == 'request') {
                $scope.getOccupancyHistory(entity.EncounterId)

            }
            if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            } else if (actionType == 'cancel') { //Cancel Event 
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity.Id, entity.RequestIdentifier);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Code);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "CreatedAt", displayName: $translate.instant('bedtransfer-list.requestedon.lbl') },
                {
                    field: "TransferDate",
                    displayName: $translate.instant('bedtransfer-list.transferdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransferDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.TransferDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "RequestIdentifier",
                    displayName: $translate.instant('bedtransfer-list.refnum.lbl')
                },

                {
                    field: "Patient",
                    displayName: $translate.instant('medicalcertificate.dischargesummary-list.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        // + '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} '
                        // + '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom" >'
                        +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
                },
                // {
                //  field: "WardRoomMaster", displayName: $translate.instant('bedtransfer-list.requestfrom.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>"
                //     + "<span >{{entity.FromWard.WardName}}</span>"
                //     + "<span >&nbsp;/&nbsp;{{entity.FromRoom.RoomNo}}</span>"
                //     + "<span >&nbsp;/&nbsp;{{entity.FromBed.BedNo}}</span>"
                //     + "</div>"
                // },
                {
                    field: "ToWard.WardName",
                    displayName: $translate.instant('bedtransfer-list.tobed.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.ToWard.WardName}}&nbsp;</span>" +
                        "<span >&nbsp;/&nbsp;{{entity.ToRoom.RoomNo}}&nbsp;</span>" +
                        "<span >&nbsp;/&nbsp;{{entity.ToBed.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('bedtransfer-list.requestedby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ entity.Doctor.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Doctor.FirstName}}</span>' + '</div>'
                },
                // { field: "Department.DepartmentName", displayName: $translate.instant('bedtransfer-list.department.lbl') },
                {
                    field: "RequestedStatus.Description",
                    displayName: $translate.instant('bedtransfer-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                        <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.RequestedStatusId==3 || entity.RequestedStatusId==5 || entity.RequestedStatusId==6"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.RequestedStatusId==1 || entity.RequestedStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                        <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-show="entity.RequestedStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.RequestedStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            var reqstatusId = utl.Lookup.getDefault($scope.lookup.RequestedStatus, 'Requested');
            var authorizeId = utl.Lookup.getDefault($scope.lookup.RequestedStatus, 'Authorized');
            var completedId = utl.Lookup.getDefault($scope.lookup.RequestedStatus, 'Completed');
            $scope.currentfilter.RequestedStatusId = reqstatusId + ',' + authorizeId + ',' + completedId;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                {
                    "Key": "Facility"
                },
                // {
                //     "Key": "RoomType"
                // },
                // {
                //     "Key": "Doctor"
                // },
                // {
                //     "Key": "Department"
                // },
                // {
                //     "Key": "RoomType"
                // },
                {
                    "Key": "Ward"
                },
                // {
                //     "Key": "Room"
                // },
                // {
                //     "Key": "Bed"
                // },
                {
                    "Key": "RequestedStatus"
                },
                // {
                //     "Key": "AdmissionStatus"
                // },
                // {
                //     "Key": "RequestIdentifier"
                // },



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

    bedtransferListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();