(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorinvoiceInfoController', doctorinvoiceInfoController);

    function doctorinvoiceInfoController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.closeModal = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.id = modalConfig.params.id;

        $scope.item = {};

        $scope.getItemCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var data = res.Data[0];
                $scope.item.DoctorId = data.DoctorId;
                $scope.item.InvoiceAmount = data.InvoiceAmount;
                $scope.item.DoctorInvoiceIdentifier = data.DoctorInvoiceIdentifier;
                $scope.item.IsFullyPaid = data.IsFullyPaid;
                $scope.item.AmountPaid = data.AmountPaid;
                $scope.item.DueAmount = data.DueAmount;
                $scope.item.InvoiceDateTime = data.InvoiceDateTime;
                $scope.item.CreatedUser = data.CreatedUser.Title ? data.CreatedUser.Title.Description + ' ' + data.CreatedUser.FirstName + '' + data.CreatedUser.LastName : data.CreatedUser.FirstName + '' + data.CreatedUser.LastName;
                $scope.item.DoctorInvoiceStatusId = data.DoctorInvoiceStatusId;
                var doctor = data.Doctor;
                if (doctor)
                    $scope.item.DoctorName = doctor.Title ? doctor.Title.Description + ' '
                        + doctor.FirstName + ' ' + doctor.LastName : doctor.FirstName + ' ' + doctor.LastName;
                var detail = [];
                data.DoctorInvoiceDetails.forEach((v, i) => {
                    var item = {
                        Id: v.Id,
                        EncounterId: v.EncounterId,
                        PatientBillId: v.PatientBillId,
                        PatientBillDetailId: v.PatientBillDetail.Id,
                        DoctorId: v.DoctorId,
                        ServiceId: v.PatientBillDetail.ServiceId,
                        BillDateTime: v.PatientBillDetail.PatientBill.BillDateTime,
                        Patient: v.PatientBillDetail.PatientBill.Patient,
                        BillNumber: v.PatientBillDetail.PatientBill.BillNumber,
                        ServiceName: v.PatientBillDetail.ServiceName,
                        ServiceAmount: v.PatientBillDetail.GrossAmount,
                        GrossGSTAmount: v.GrossGSTAmount,
                        DoctorShare: v.DoctorShare,
                        Doctor: v.PatientBillDetail.User,
                        InvoiceStatusId: v.InvoiceStatusId,
                        VisitIdentifier: v.Encounter.VisitIdentifier
                    }
                    if (item.InvoiceStatusId == 2)
                        detail.push(item);
                });
                vm.gridConfig.data = detail;
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputParams = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'doctorinvoice/DoctorInvoice/GetDoctorInvoices',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "BillDateTime", displayName: $translate.instant('doctorinvoice-form.billdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
                },
                { field: "VisitIdentifier", displayName: $translate.instant('doctorinvoice-form.visitidentifier.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('doctorinvoice-form.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} '
                        + '{{row.entity.Patient.FirstName }} ' + '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | '
                        + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span > </span>" +
                        "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" + "<span > </span>" +
                        "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                { field: "BillNumber", displayName: $translate.instant('doctorinvoice-form.billno.lbl') },
                { field: "ServiceName", displayName: $translate.instant('doctorinvoice-form.servicename.lbl') },
                {
                    field: "Amount", displayName: $translate.instant('doctorinvoice-form.serviceamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.ServiceAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "GrossGSTAmount", displayName: $translate.instant('doctorinvoice-form.tax.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.TaxAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "DoctorShare", displayName: $translate.instant('doctorinvoice-form.doctorshare.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.DoctorShare | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Doctor",
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span ng-if='row.entity.Doctor.Title && row.entity.Doctor.Title.Description' >" +
                        "{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span > </span>" +
                        "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" + "<span > </span>" +
                        "<span >{{row.entity.Doctor.LastName}}</span>" +
                        "</div>",
                    displayName: $translate.instant('doctorinvoice-form.doctorname.lbl')
                }
            ]
        };

        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        // };

        // $scope.initLookup = function () {
        //     var inputData = [
        //     ];

        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     utl.Http.doAction(options);
        // };
        // $scope.initLookup();
        $scope.getItem();
    }

    doctorinvoiceInfoController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();