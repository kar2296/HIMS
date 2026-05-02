(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingPresListController', pendingPresListController);

    function pendingPresListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.Items = [];

        $scope.currentfilter = {
            namemrn: '',
            PrescriptionStatusId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0,
            DispenseStatusId: 1//Pending

        };

        $scope.item = {
            //receiptdate: utl.Formatter.getCurrentDate(),

        };

        $scope.currentcontext = {

        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            forEach(data.Data, function (value, index) {
                value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
            });
            vm.gridConfig.data = data.Data;

            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.PatientId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 11,//DispenseStatus
                    Value: $scope.currentfilter.DispenseStatusId
                },
                {
                    Key: 6,//PrecriptionStatusId
                    Value: 3
                },
                {
                    Key: 8,
                    Value: FrmDate
                },
                {
                    Key: 9,
                    Value: ToDate
                },
                {
                    Key: 20,
                    Value: true
                },
                { Key: 17, Value: utl.Session.getCurrentFacilityId()}
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

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.onDeleteConfirmed($scope.vDeletedId);
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function () {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.open('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* Security IsValid */

        // $scope.editPrescriptionDetail = function(item) {
        //     $scope.confirmCallback({ Id: item.Id, PatientId: item.PatientId });
        // };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'view') {
                utl.Modal.open('app.prescriptionview', {
                    params: {
                        item: entity,
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'bill') {
                $state.go('app.pharmacy-sales', {

                        id: 0,
                        pres_id: entity.Id,
                        pat_id: entity.PatientId,
                        doc_id: entity.DoctorId,
                    // confirmCallback: $scope.getList
                });
                // $state.go('app.refund-form', { id: entity.Id });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "PrescriptionDate", displayName: $translate.instant('Date'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PrescriptionDate '></ngformatdate>"
                },
                { field: "Identifier", displayName: $translate.instant('Prescription No') },
                { field: "Patient.MRN", displayName: $translate.instant('Patient UHID') },
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.receipt-list.patientinfor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>{{entity.Patient.LastName}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.MRN}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('Store Name') },
                {
                    field: "Doctor",
                    displayName: $translate.instant('Doctor Name'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                { field: "PrescriptionPriority.Description", displayName: $translate.instant('Priority') },
                { field: "AdviceInstructions", displayName: $translate.instant('Advice') },
                // { field: "PrecriptionStatus.Description", displayName: $translate.instant('Status') },
                { field: "DispenseStatus.Description", displayName: $translate.instant('Status') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <a class="grid-action" ng-click="handleEvents(\'view\',entity)"  translate="View"></a>\
                           <a class="grid-action" ng-click="handleEvents(\'bill\',entity)" ng-show="entity.DispenseStatusId==1" translate="Load"></a>\
                          </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.currentfilter.StoreTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreTypeId;
                            $scope.currentfilter.StoreSubTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreSubTypeId;
                            $scope.currentfilter.SequenceOptionId = $scope.lookup.UserStores[usidx].StoreMaster.SequenceOptionId;
                            $scope.currentfilter.ExpiryWarningDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryWarningDays;
                            $scope.currentfilter.ExpiryPriorStopDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryPriorStopDays;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === 0) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                        $scope.currentfilter.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = value[0].StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = value[0].StoreMaster.SequenceOptionId;
                        $scope.currentfilter.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                        $scope.currentfilter.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                    }
                    //$scope.getStorePrintPreference();
                    /* $scope.getStoreStaffDiscounts(); */
                }


            });
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                // { "Key": "ReceiptType" },
                { "Key": "PrecriptionStatus" },
                { "Key": "DispenseStatus" },
                // { "Key": "CardType" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },

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

    pendingPresListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();