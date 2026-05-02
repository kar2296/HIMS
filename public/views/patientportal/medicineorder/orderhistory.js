(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderHistoryListController', OrderHistoryListController);

    function OrderHistoryListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.currentfilter = {
            MedicineOrderStatusId: 1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.PatientId = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.prescriptionInfo = $stateParams.prescriptionData;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.MedicineOrderStatusId },
                    { Key: 2, Value: $scope.currentcontext.PatientId },
                    { Key: 5, Value: $scope.currentfilter.MedicineOrderNo },
                    {
                        Key: 7,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 8,
                        Value: utl.Formatter.getFilterDate(To)
                    },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'VirtualHealthcare/VirtualMedicineOrder/GetVirtualMedicineOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'VirtualHealthcare/VirtualMedicineOrder/DeleteVirtualMedicineOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('patientportal.medicineordertab.orderhistoryview', {
                    id: entity.Id,
                    pharmacydata: $scope.item,
                    contextdata: $scope.currentcontext,
                    // facilityinfo: item
                });
            } else if (actionType == 'view') {
                $state.go('f', {
                    id: entity.Id,
                    pharmacydata: $scope.item,
                    contextdata: $scope.currentcontext,
                    // facilityinfo: item
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GstName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('patientportal.medicineorder.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                { field: "MedicineOrderNo", displayName: $translate.instant('patientportal.medicineorder.orderrefno.lbl') },
                // {
                //     field: "Patient",
                //     displayName: $translate.instant('patientportal.medicineorder.patientname.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
                //         //     '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                //         //     '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                //         '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" >' +
                //         "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                //         "{{entity.Patient.Title.Description}}</span>" +
                //         "<span >{{entity.Patient.FirstName}}</span>" +
                //         "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                //         "<span >/</span>" +
                //         "<span >{{entity.Patient.MRN}}</span>" +
                //         "<span >/<span>" +
                //         "<span >{{entity.Patient.Age}}</span>" +
                //         "<span >/</span>" +
                //         "<span >{{entity.Patient.Gender.Description}}</span>" +
                //         "</a></div>",
                //     handleEvent: $scope.handleEvents

                // },
                { field: "PharmacyFacility.FacilityName", displayName: $translate.instant('Pharmacy Name') },
                { field: "DeliveryAddress", displayName: $translate.instant('patientportal.medicineorder.location.lbl') },
                {
                    field: "DeliveryDate",
                    displayName: $translate.instant('patientportal.medicineorder.scheduledate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DeliveryDate | date : 'dd-MMM-yyyy'}} </span>" + "</div>"
                },
                {
                    field: "MedicineOrderDate",
                    displayName: $translate.instant('patientportal.medicineorder.orderdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.MedicineOrderDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.MedicineOrderDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "MedicineOrderStatus.Description", displayName: $translate.instant('patientportal.medicineorder.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.MedicineOrderStatusId==2||entity.MedicineOrderStatusId==3||entity.MedicineOrderStatusId==4||entity.MedicineOrderStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.MedicineOrderStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                    \</div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "MedicineOrderStatus" },

            ]
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

    OrderHistoryListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();