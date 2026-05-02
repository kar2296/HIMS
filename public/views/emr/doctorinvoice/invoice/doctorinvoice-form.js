(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorInvoiceFormController', doctorInvoiceFormController);

    function doctorInvoiceFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {
            id: !isNaN(parseInt($stateParams.id)) ? parseInt($stateParams.id) : 0
        };
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            DoctorName: '',
            InvoiceAmount: 0,
            IsFullyPaid: false,
            AmountPaid: 0,
            DueAmount: 0,
            VisitTypeId: 1,
            InvoiceDateTime: utl.Formatter.getCurrentDate(),
            IsSelect: false,

        };

        $scope.currentfilter = {
            billingfromdate: utl.Formatter.getCurrentDate(),
            billingtodate: utl.Formatter.getCurrentDate(),
            VisitTypeId: 1,
            billno: '',
            patientname: '',
            visitidentifier: '',
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.DoctorId = selectedItem.Id;
                $scope.item.TDSId = selectedItem.TDSId;
                if (selectedItem.GstMaster) {
                    $scope.item.TDSPercentage = selectedItem.GstMaster.GstName;
                    $scope.item.TDSPercAmount = selectedItem.GstMaster.GstPercentage;
                }
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality, vm.doctorcontrolconfig.rowdata.TDSId
                ].join(' ');
            }
            $scope.item.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        function isMainContext() {
            return $scope.currentcontext.id > 0;
        }
        $scope.backToList = function () {
            $state.go('app.doctorinvoices');
        };

        $scope.addNew = function () {
            $state.go('app.doctorinvoice', { id: 0 });
            // $state.reload();
        };
        $scope.payment = function () {
            // $state.go('app.doctorinvoicepayment', { id: 0 });
            utl.Modal.openFixedDialog('app.doctorinvoicepayment', {
                params: {
                    id: $scope.currentcontext.id
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.selectAllItems = function () {
            for (var idx in $scope.DrInvDetails) {
                var item = $scope.DrInvDetails[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSelected = $scope.currentcontext.selectall;
                }
            }
        }

        $scope.drInvSelectionChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllSelected && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                }
            }
        }

        $scope.loadBillsCallBack = function (scope, res, options, hasError) {
            $scope.DrInvDetails = [];
            var custom_sort = function (a, b) {
                return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
            }
            if (res.Data.length > 0) {
                res.Data.sort(custom_sort);
                var detail = [];
                res.Data.forEach((v, i) => {
                    var item = {
                        Id: 0,
                        EncounterId: v.EncounterId,
                        PatientBillId: v.PatientBillId,
                        PatientBillDetailId: v.Id,
                        DoctorId: v.DoctorId,
                        ServiceId: v.ServiceId,
                        BillDateTime: v.PatientBill.BillDateTime,
                        Patient: v.PatientBill.Patient,
                        BillNumber: v.PatientBill.BillNumber,
                        ServiceName: v.ServiceName,
                        ServiceAmount: v.GrossAmount,
                        GrossGSTAmount: v.GrossGSTAmount,
                        DoctorShare: (isNaN(parseFloat(v.DoctorShare)) ? 0 : parseFloat(v.DoctorShare)) -
                            (v.IsDoctorDiscount ?
                                (isNaN(parseFloat(v.DiscountAmount)) ? 0 : parseFloat(v.DiscountAmount)) : 0),

                        Doctor: v.User,
                        VisitIdentifier: v.Encounter != null ? v.Encounter.VisitIdentifier : '',
                        select: false,
                        patientid: v.PatientBill.PatientId,
                        IsReadOnly: false
                    }
                    detail.push(item);

                });
                $scope.DrInvDetails = detail;
                var totalshareamount = 0;
                for (var idx in detail) {
                    var item = detail[idx];
                    item.TotalDoctorShare = isNaN(parseFloat(item.DoctorShare)) ? (0) : parseFloat(item.DoctorShare);
                    totalshareamount = totalshareamount + (item.TotalDoctorShare);
                }
                $scope.TotalNetamount = totalshareamount;
                //
            } else {
                $scope.DrInvDetails = [];
            }

            //  vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.loadBills = function () {
            if ($scope.item.DoctorId != -1) {
                var FromDate = $filter('date')($scope.currentfilter.billingfromdate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.billingtodate, 'yyyy-MM-dd 23:59:59') || null;

                var inputParams = {
                    Params: [{
                        Key: 6,
                        Value: FromDate
                    },
                    {
                        Key: 7,
                        Value: ToDate
                    },
                    {
                        Key: 16,
                        Value: $scope.item.DoctorId
                    },
                    {
                        Key: 17,
                        Value: $scope.item.VisitTypeId
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 13,
                        Value: '0'
                    },
                    {
                        Key: 18,
                        Value: '0'
                    },
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                // var Data = { Data: { DoctorId: $scope.item.DoctorId, apiRequest: inputParams } };
                if ($scope.currentcontext.id || $scope.currentcontext.id <= 0) {
                    var options = {
                        action: 'billing/PatientBillDetails/GetPatientBillDetails',
                        data: inputParams,
                        type: 'post',
                        onComplete: $scope.loadBillsCallBack
                    };
                    utl.Http.doAction(options);
                } else
                    $scope.getItem();
            } else {
                utl.Alert.showErrorMsg('Please select Doctor');
            }
        };

        $scope.calculateamt = function (item) {
            for (var idx in $scope.DoctorInvoiceDetails) {
                var activeitem = $scope.DoctorInvoiceDetails[idx]; {
                    $scope.TotalShareAmount = (isNaN(parseFloat(item.DoctorShare)) ? 0 : parseFloat(item.DoctorShare))
                    $scope.item.TotalAmount = $scope.TotalShareAmount;
                }

            }
        }

        $scope.getItemCallBack = function (scope, res, options, hasError) {
            $scope.docInvDetails = [];
            if (res.Data.length > 0) {
                var custom_sort = function (a, b) {
                    return new Date(b.InvoiceDateTime).getTime() - new Date(a.InvoiceDateTime).getTime();
                }
                res.Data.sort(custom_sort);
                var data = res.Data[0];
                $scope.item.DoctorId = data.DoctorId;
                $scope.item.InvoiceAmount = data.InvoiceAmount;
                $scope.item.DoctorInvoiceIdentifier = data.DoctorInvoiceIdentifier;
                $scope.item.IsFullyPaid = data.IsFullyPaid;
                $scope.item.AmountPaid = data.AmountPaid;
                $scope.item.DueAmount = data.DueAmount;
                $scope.item.InvoiceDateTime = data.InvoiceDateTime;
                $scope.item.VisitTypeId = data.VisitTypeId;
                $scope.item.CreatedUser = data.CreatedUser.Title ? data.CreatedUser.Title.Description + ' ' + data.CreatedUser.FirstName + '' + data.CreatedUser.LastName : data.CreatedUser.FirstName + '' + data.CreatedUser.LastName;
                $scope.item.DoctorInvoiceStatusId = data.DoctorInvoiceStatusId;
                var doctor = data.Doctor;
                if (doctor)
                    $scope.item.DoctorName = doctor.Title ? doctor.Title.Description + ' ' +
                        doctor.FirstName + ' ' + doctor.LastName : doctor.FirstName + ' ' + doctor.LastName;
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
                        Doctor: v.DoctorName,
                        InvoiceStatusId: v.InvoiceStatusId,
                        VisitIdentifier: v.Encounter != null ? v.Encounter.VisitIdentifier : ''
                    }
                    detail.push(item);
                    var totalshareamount = 0;
                    for (var idx in detail) {
                        var item = detail[idx];
                        item.TotalDoctorShare = isNaN(parseFloat(item.DoctorShare)) ? (0) : parseFloat(item.DoctorShare);
                        totalshareamount = totalshareamount + (item.TotalDoctorShare);
                    }
                    $scope.TotalNetamount = totalshareamount;

                });
                $scope.docInvDetails = detail;
                if (data.DoctorInvoiceStatusId == 1) {
                    $scope.item.DisplayInvoiceStatus = 'Draft';
                }
                if (data.DoctorInvoiceStatusId == 2) {
                    $scope.item.DisplayInvoiceStatus = 'Pending Payment';
                }
                if (data.DoctorInvoiceStatusId == 3) {
                    $scope.item.DisplayInvoiceStatus = 'Completed';
                }
                if (data.DoctorInvoiceStatusId == 4) {
                    $scope.item.DisplayInvoiceStatus = 'Cancelled';
                }

                //  vm.gridConfig.data = data.DoctorInvoiceDetails;
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputParams = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'doctorinvoice/DoctorInvoice/GetDoctorInvoices',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getItemCallBack
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $state.go('app.doctorinvoice', {
                    id: $scope.currentcontext.id
                });
            } else {
                $scope.backToList();
            }
        };

        $scope.saveItem = function (DoctorInvoiceStatusId) {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.Details = $scope.getSelectionRows();
            if ($scope.SelectedRows.length > 0) {
                var Details = $scope.SelectedRows;
            } else {
                utl.Alert.showErrorMsg('Please Select Any Bill');
            }
            var Details = $scope.SelectedRows;
            $scope.item.Details = [];
            Details.forEach((v, i) => {

                var vdoctorname = '';
                if (v.Doctor.Title && v.Doctor.Title.Description)
                    vdoctorname += '' + v.Doctor.Title.Description;
                if (v.Doctor.FirstName)
                    vdoctorname += ' ' + v.Doctor.FirstName;
                if (v.Doctor.LastName)
                    vdoctorname += ' ' + v.Doctor.LastName;
                if (!vdoctorname)
                    vdoctorname = v.Doctor;

                var item = {
                    EncounterId: v.EncounterId,
                    PatientBillId: v.PatientBillId,
                    PatientBillDetailId: v.PatientBillDetailId,
                    DoctorId: v.DoctorId,
                    InvoiceDateTime: utl.Formatter.getCurrentDate(),
                    ServiceId: v.ServiceId,
                    ServiceName: v.ServiceName,
                    DoctorName: vdoctorname,
                    DoctorShare: v.DoctorShare,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    InvoiceStatusId: DoctorInvoiceStatusId,
                    Id: v.Id ? v.Id : 0
                };
                $scope.item.Details.push(item);
            });
            var InvoiceAmount = 0;
            $scope.item.Details.forEach((v, i) => {
                InvoiceAmount = parseFloat(InvoiceAmount) +
                    (isNaN(parseFloat(v.DoctorShare)) ? 0 : parseFloat(v.DoctorShare));
            });
            if ($scope.item.Details.length == 0) {
                utl.Alert.showErrorMsg('Please select Bills');
                return false;
            }
            $scope.item.InvoiceAmount = InvoiceAmount;
            $scope.item.TDSPercentage = $scope.item.TDSPercentage;
            $scope.item.TDSAmount = ($scope.item.InvoiceAmount / 100) * ($scope.item.TDSPercAmount)
            $scope.item.DueAmount = parseFloat($scope.item.InvoiceAmount) - parseFloat($scope.item.AmountPaid);
            if (DoctorInvoiceStatusId == 3) {
                if ($scope.item.Details.length == vm.gridConfig.data.length) {
                    $scope.item.DoctorInvoiceStatusId = DoctorInvoiceStatusId;
                } else if ($scope.item.Details.length != vm.gridConfig.data.length) {
                    $scope.item.DoctorInvoiceStatusId = 2;
                }
            } else {
                $scope.item.DoctorInvoiceStatusId = DoctorInvoiceStatusId;
            }
            var actionName = 'doctorinvoice/DoctorInvoice/AddDoctorInvoice';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var actionName = 'doctorinvoice/DoctorInvoice/UpdateDoctorInvoice';
                $scope.item.Id = $scope.currentcontext.id;
            }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.onSave = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.saveItem(1);
        }
        $scope.save = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Save This Invoice?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSave,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.onSaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.saveItem(2);
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Approve This Invoice?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.oncancel = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.saveItem(4);
        }
        $scope.cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Cancel This Invoice?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.oncancel,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'DoctorInvoice/DoctorInvoice/PrintDoctorInvoice',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'getSelectionRows') {
                if (entity.select == false) {
                    entity.select = true;
                } else {
                    entity.select = false;
                }
                $scope.getSelectionRows(entity);
            } else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.patientid
                    },
                    confirmCallback: $scope.getitem
                });
            }
        };

        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     // rowTemplate: rowtpl,
        //     columnDefs: [{
        //             field: "Id",
        //             displayName: $translate.instant('Select'),
        //             cellTemplate: '<div class="ui-grid-cell-contents">\
        //                                 <input type="checkbox" ng-click="handleEvents(\'getSelectionRows\',entity)" style="width: 50px;height: 23px;">\
        //                                 </div>',
        //             handleEvent: $scope.handleEvents,
        //         },
        //         {
        //             field: "BillDateTime",
        //             displayName: $translate.instant('doctorinvoice-form.billdate.lbl'),
        //             cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
        //         },
        //         {
        //             field: "BillNumber",
        //             displayName: $translate.instant('doctorinvoice-form.billno.lbl')
        //         },
        //         {
        //             field: "Patient",
        //             displayName: $translate.instant('doctorinvoice-form.patientname.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'>" +
        //                 // '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}} '
        //                 // + '{{entity.Patient.FirstName }} ' + '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | '
        //                 '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)"' +
        //                 +'{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
        //                 "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' class='pl-3'>" +
        //                 "{{entity.Patient.Title.Description}}</span>" +
        //                 "<span class='pl-3'> </span>" +
        //                 "<span class='pl-3'>{{entity.Patient.FirstName}}</span>" + "<span class='pl-3'> </span>" +
        //                 "<span class='pl-3'>{{entity.Patient.LastName}}</span>" +
        //                 "<span class='pl-3'>/</span>" +
        //                 "<span class='pl-3'>{{entity.Patient.MRN}}</span>" +
        //                 "<span class='pl-3'>/<span>" +
        //                 "<span class='pl-3'>{{entity.Patient.Age}}</span>" +
        //                 "<span class='pl-3'>/</span>" +
        //                 "<span class='pl-3'>{{entity.Patient.Gender.Description}}</span>" +
        //                 "</a></div>",
        //             handleEvent: $scope.handleEvents
        //         },
        //         {
        //             field: "DoctorName",
        //             displayName: $translate.instant('doctorinvoice-form.doctorname.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'>" +
        //                 "<span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description' class='pl-3'>" +
        //                 "{{entity.Doctor.Title.Description}}</span>" +
        //                 "<span class='pl-3'> </span>" +
        //                 "<span class='pl-3'>{{entity.Doctor.FirstName}}</span>" + "<span class='pl-3'> </span>" +
        //                 "<span class='pl-3'>{{entity.Doctor.LastName}}</span>" +
        //                 "</div>",
        //         },
        //         {
        //             field: "ServiceName",
        //             displayName: $translate.instant('doctorinvoice-form.servicename.lbl'),
        //             // cellTemplate: "<div class='ui-grid-cell-contents'>\
        //             //         <div style='background-color: #e465b1;class='col-sm-2'ng-if='entity.InvoiceStatusId==3'>\
        //             //         <span ng-if='entity.InvoiceStatusId==3'>{{entity.ServiceName}}</span>\
        //             //         <div class='col-sm-2'ng-if='entity.InvoiceStatusId==2'>\
        //             //         <span ng-if='entity.InvoiceStatusId==2'>{{entity.ServiceName}}</span></div>"
        //         },
        //         {
        //             field: "Amount",
        //             displayName: $translate.instant('doctorinvoice-form.serviceamount.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ServiceAmount | displaycurrency}}</span>" + "</div>"
        //         },
        //         {
        //             field: "DoctorShare",
        //             displayName: $translate.instant('doctorinvoice-form.doctorshare.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DoctorShare | displaycurrency}}</span>" + "</div>"
        //         },
        //     ]
        // };

        $scope.getSelectionRows = function () {
            $scope.SelectedRows = [];
            for (var idx in $scope.DrInvDetails) {
                var item = $scope.DrInvDetails[idx];
                if (item.IsSelected == true) {
                    $scope.SelectedRows.push(item);
                }
            }
        }

        // vm.getgridConfig = {
        //     enableColumnResizing: true,
        //     // rowTemplate: rowtpl,
        //     columnDefs: [{
        //             field: "BillDateTime",
        //             displayName: $translate.instant('doctorinvoice-form.billdate.lbl'),
        //             cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
        //         },
        //         {
        //             field: "VisitIdentifier",
        //             displayName: $translate.instant('doctorinvoice-form.visitidentifier.lbl')
        //         },
        //         {
        //             field: "Patient",
        //             displayName: $translate.instant('doctorinvoice-form.patientname.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'>" +
        //                 // '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}} '
        //                 // + '{{entity.Patient.FirstName }} ' + '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | '
        //                 // + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
        //                 '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)"' +
        //                 "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' class='pl-3'>" +
        //                 "{{entity.Patient.Title.Description}}</span>" +
        //                 "<span class='pl-3'> </span>" +
        //                 "<span class='pl-3'>{{entity.Patient.FirstName}}</span>" + "<span class='pl-3'> </span>" +
        //                 "<span class='pl-3'>{{entity.Patient.LastName}}</span>" +
        //                 "<span class='pl-3'>/</span>" +
        //                 "<span class='pl-3'>{{entity.Patient.MRN}}</span>" +
        //                 "<span class='pl-3'>/<span>" +
        //                 "<span class='pl-3'>{{entity.Patient.Age}}</span>" +
        //                 "<span class='pl-3'>/</span>" +
        //                 "<span class='pl-3'>{{entity.Patient.Gender.Description}}</span>" +
        //                 "</a></div>",
        //             handleEvent: $scope.handleEvents
        //         },
        //         {
        //             field: "BillNumber",
        //             displayName: $translate.instant('doctorinvoice-form.billno.lbl')
        //         },
        //         {
        //             field: "ServiceName",
        //             displayName: $translate.instant('doctorinvoice-form.servicename.lbl'),
        //             // cellTemplate: "<div class='ui-grid-cell-contents'>\
        //             //         <div style='background-color: #e465b1;class='col-sm-2'ng-if='entity.InvoiceStatusId==3'>\
        //             //         <span ng-if='entity.InvoiceStatusId==3'>{{entity.ServiceName}}</span>\
        //             //         <div class='col-sm-2'ng-if='entity.InvoiceStatusId==2'>\
        //             //         <span ng-if='entity.InvoiceStatusId==2'>{{entity.ServiceName}}</span></div>"
        //         },
        //         {
        //             field: "Amount",
        //             displayName: $translate.instant('doctorinvoice-form.serviceamount.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ServiceAmount | displaycurrency}}</span>" + "</div>"
        //         },
        //         {
        //             field: "GrossGSTAmount",
        //             displayName: $translate.instant('doctorinvoice-form.tax.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TaxAmount | displaycurrency}}</span>" + "</div>"
        //         },
        //         {
        //             field: "DoctorShare",
        //             displayName: $translate.instant('doctorinvoice-form.doctorshare.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DoctorShare | displaycurrency}}</span>" + "</div>"
        //         },
        //         {
        //             field: "Doctor",
        //             displayName: $translate.instant('doctorinvoice-form.doctorname.lbl')
        //         },
        //         // {
        //         //     field: "DoctorName",
        //         //     displayName: $translate.instant('doctorinvoice-form.doctorname.lbl'),
        //         //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
        //         //         "<span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description' class='pl-3'>" +
        //         //         "{{entity.Doctor.Title.Description}}</span>" +
        //         //         "<span class='pl-3'> </span>" +
        //         //         "<span class='pl-3'>{{entity.Doctor.FirstName}}</span>" + "<span class='pl-3'> </span>" +
        //         //         "<span class='pl-3'>{{entity.Doctor.LastName}}</span>" +
        //         //         "</div>",
        //         // },

        //     ]
        // };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };
        $scope.initLookup = function () {
            var inputData = [{
                "Key": "EncounterType"
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

    doctorInvoiceFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();