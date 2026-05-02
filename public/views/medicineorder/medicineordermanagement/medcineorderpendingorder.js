(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualMedicineOrderManagementPendingOrderController', VirtualMedicineOrderManagementPendingOrderController);

    function VirtualMedicineOrderManagementPendingOrderController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.currentfilter = {
            MedicineOrderStatusId: 1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.PatientId = $stateParams.patientid;
        $scope.currentcontext.isdirectdelivery = $stateParams.isdirectdelivery;
        $scope.prescriptionInfo = $stateParams.prescriptionData;

        $scope.delivarycode = function () {
            utl.Modal.open('app.deliverycode', {
                params: {
                    id: $scope.currentcontext.id,
                    // context: 'isdirectdelivery'
                },
                confirmCallback: $scope.getItem
            });
        };
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
                    { Key: 4, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 5, Value: $scope.currentfilter.MedicineOrderNo },
                    {
                        Key: 7,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 8,
                        Value: utl.Formatter.getFilterDate(To)
                    },
                    {
                        Key: 9,
                        Value: 2
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
                $state.go('app.medicineordermanagementtab.medicineorderform', {
                    id: entity.Id,
                    pharmacydata: $scope.item,
                    contextdata: $scope.currentcontext,
                    // facilityinfo: item
                });
            }
            else if (actionType == 'view') {
                $state.go('app.medicineordermanagementtab.medicineorderform', {
                    id: entity.Id,
                    pharmacydata: $scope.item,
                    contextdata: $scope.currentcontext,
                    // facilityinfo: item
                });
            }
            else if (actionType == 'sales') {
                console.log(entity.PaymentTypeId);
                utl.Modal.open('app.deliverycode', {
                    params: {
                        id: entity.Id,
                        pharmacydata: $scope.item,
                        contextdata: $scope.currentcontext,
                    },
                    confirmCallback: $scope.getItem
                });
                // $state.go('app.pharmacy-sales', {
                //     medicineorderid: entity.Id,
                //     prescriptionid: entity.PrescriptionId,
                //     facilityinfo: entity.PharmacyFacility,
                //     patientinfo: entity.Patient,
                //     patientid: entity.PatientId,
                //     paymenttypeid: entity.PaymentTypeId,
                //     detailinfo: entity.VirtualMedicineOrderDetails,
                //     // facilityinfo: item
                // });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GstName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('patientportal.medicineorder.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{index+1}}</span> </div>"
                },
                { field: "MedicineOrderNo", displayName: $translate.instant('patientportal.medicineorder.orderrefno.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('patientportal.medicineorder.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        //     '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        //     '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" >' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' class='pl-3'>" +
                        "{{entity.Patient.Title.Description}}</span>" +
                        "<span class='pl-3'>{{entity.Patient.FirstName}}</span>" +
                        "<span class='pl-3'>{{entity.Patient.LastName}}</span>" +
                        "<span class='pl-3'>/</span>" +
                        "<span class='pl-3'>{{entity.Patient.MRN}}</span>" +
                        "<span class='pl-3'>/<span>" +
                        "<span class='pl-3'>{{entity.Patient.Age}}</span>" +
                        "<span class='pl-3'>/</span>" +
                        "<span class='pl-3'>{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents

                },
                { field: "Patient.MRN", displayName: $translate.instant('Swostha Id') },
                // { field: "DeliveryAddress", displayName: $translate.instant('patientportal.medicineorder.location.lbl') },
                { field: "DeliveryType.Description", displayName: $translate.instant('Order Type') },
                {
                    field: "DeliveryDate",
                    displayName: $translate.instant('patientportal.medicineorder.scheduledate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DeliveryDate | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{entity.DeliveryDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "MedicineOrderDate",
                    displayName: $translate.instant('patientportal.medicineorder.orderdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.MedicineOrderDate | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{entity.MedicineOrderDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "MedicineOrderStatus.Description", displayName: $translate.instant('patientportal.medicineorder.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'sales\',entity)" uib-tooltip="Pharmacy sales" ng-show="entity.MedicineOrderStatusId==1"><i class="fa fa-medkit" aria-hidden="true"></i></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" uib-tooltip="Medicine Dispense" ng-show="entity.MedicineOrderStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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

    VirtualMedicineOrderManagementPendingOrderController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();