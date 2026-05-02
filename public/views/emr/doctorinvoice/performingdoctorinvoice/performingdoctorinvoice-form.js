(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PerformingDoctorInvoiceFormController', PerformingDoctorInvoiceFormController);

    function PerformingDoctorInvoiceFormController($scope, $stateParams, $state, $translate, utl, $filter) {
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
            InvoiceDateTime: utl.Formatter.getCurrentDate()
        };

        $scope.currentfilter = {
            billingfromdate: utl.Formatter.getCurrentDate(),
            billingtodate: utl.Formatter.getCurrentDate(),
            EncounterTypeId: -1,
            billno: '',
            patientname: '',
            visitidentifier: '',
        };
        $scope.currentfilter.billingfromdate =
            new Date($scope.currentfilter.billingfromdate).setDate(
                new Date($scope.currentfilter.billingfromdate).getDate() - 30);
        $scope.currentfilter.billingfromdate = new Date($scope.currentfilter.billingfromdate);
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
            $state.go('app.performingdoctorvoucherform');
        };

        $scope.addNew = function () {
            $state.go('app.performingdoctorvoucherform', {
                id: 0
            });
        };
        $scope.payment = function () {
            // $state.go('app.doctorinvoicepayment', { id: 0 });
            utl.Modal.open('app.doctorinvoicepayment', {
                params: {
                    id: $scope.currentcontext.id
                },
                confirmCallback: $scope.getItem
            });
        };



        $scope.loadBillsCallBack = function (scope, res, options, hasError) {
            var custom_sort = function (a, b) {
                return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
            }
            if (res.Data.length > 0) {
                res.Data.sort(custom_sort);
                $scope.detail = [];
                res.Data.forEach((v, i) => {
                    var item = {
                        Id: 0,
                        EncounterId: v.EncounterId,
                        PatientBillId: v.PatientBillId,
                        PatientBillDetailId: v.Id,
                        // DoctorId: v.DoctorId,
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
                        IsReadOnly: false,
                        Status: 1,
                        doctors: v.ServiceItem.ServiceItemPerformingDoctors
                    }
                    $scope.detail.push(item);

                });
                // vm.gridConfig.data = detail;
                var totalshareamount = 0;
                for (var idx in $scope.detail) {
                    var item = $scope.detail[idx];
                    item.TotalDoctorShare = isNaN(parseFloat(item.DoctorShare)) ? (0) : parseFloat(item.DoctorShare);
                    totalshareamount = totalshareamount + (item.TotalDoctorShare);
                }
                $scope.TotalNetamount = totalshareamount;
            } else {
                $scope.detail = [];
            }

            //  vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.loadBills = function () {
            // if ($scope.item.DoctorId != -1) {
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
                        Value: $scope.currentfilter.DoctorId
                    },
                    // { Key: 28, Value: $scope.item.ServiceId },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.billno
                    },
                    {
                        Key: 13,
                        Value: '0'
                    },
                    // { Key: 18, Value: '0' },
                    {
                        Key: 34,
                        Value: true
                    },

                ],
                PageContext: {
                    PageSize: 250,
                    PageNumber: 1
                }
            };
            // var Data = { Data: { DoctorId: $scope.item.DoctorId, apiRequest: inputParams } };
            if ($scope.currentcontext.id || $scope.currentcontext.id <= 0) {
                var options = {
                    action: 'billing/PatientBillDetails/GetPatientBillDetailsForPerformingDoctors',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.loadBillsCallBack
                };
                utl.Http.doAction(options);
            } else
                $scope.getItem();
            // } else {
            //     utl.Alert.showErrorMsg('Please select Doctor');
            // }
        };
        var doctor = {
            id: null,
            doc: null
        };
        $scope.OnSelectDoctor = function (id, selectedItem, item) {
            console.log(selectedItem);
            // var DocObj = selectedItem;
            // if (DocObj != null) {
            //     item.DoctorName = '';
            //     item.DoctorId = DocObj.DoctorId;
            //     item.DoctorName = DocObj.DoctorName;
            // }
            if (doctor.doc == null || doctor.id == id || doctor.doc == selectedItem.DoctorId) {
                if (doctor.doc == null) {
                    doctor.doc = selectedItem.DoctorId;
                    doctor.id = id;
                    $scope.item.DoctorId = selectedItem.DoctorId;
                    $scope.item.DoctorName = selectedItem.DoctorName;
                    item.DoctorName = selectedItem.DoctorName;
                } else return;
            } else {
                utl.Alert.showErrorMsg('Please Select Same Doctor in Line item');
                item.DoctorId = null;
            }
            // for (var idx in $scope.detail) {
            //     var dritem = $scope.detail[idx];
            //     if (item.DoctorId == $scope.item.DoctorId) {
            //         return;
            //     }
            // }
        }

        $scope.calculateamt = function (item) {
            for (var idx in $scope.DoctorInvoiceDetails) {
                var activeitem = $scope.DoctorInvoiceDetails[idx]; {
                    $scope.TotalShareAmount = (isNaN(parseFloat(item.DoctorShare)) ? 0 : parseFloat(item.DoctorShare))
                    $scope.item.TotalAmount = $scope.TotalShareAmount;
                }

            }
        }

        $scope.selectAllItems = function () {
            for (var idx in $scope.detail) {
                var item = $scope.detail[idx];
                if (!item.DoctorId) {
                    utl.Alert.showErrorMsg('Please Select Line Item Doctor');
                    return;
                }
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllOrderSelected = $scope.currentcontext.selectall;
                }
            }
        }
        $scope.IsAllOrderSelectedChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (!item.DoctorId) {
                    utl.Alert.showErrorMsg('Please Select Line Item Doctor');
                    return;
                }
                if (detail.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                }
            }
            $scope.getSelectionRows();
        }

        $scope.getSelectionRows = function () {
            $scope.SelectedRows = [];
            for (var idx in $scope.detail) {
                var item = $scope.detail[idx];
                if (item.IsSelected == true) {
                    item.DoctorId = $scope.item.DoctorId;
                    $scope.SelectedRows.push(item);
                }
            }
        }


        $scope.getItemCallBack = function (scope, res, options, hasError) {
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
                });
                vm.getgridConfig.data = detail;
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

            // $scope.item.Details = $scope.getSelectionRows();

            if ($scope.SelectedRows.length > 0) {
                var Details = $scope.SelectedRows;
            } else {
                utl.Alert.showErrorMsg('Please Select Any Bill');
            }
            for (var idx in Details) {
                $scope.item.Details = [];
                var Performdr = Details[idx];
                if (!Performdr.DoctorId) {
                    utl.Alert.showErrorMsg('Please select Any Doctor');
                    return;
                } else {
                    var item = {
                        EncounterId: Performdr.EncounterId,
                        PatientBillId: Performdr.PatientBillId,
                        PatientBillDetailId: Performdr.PatientBillDetailId,
                        DoctorId: Performdr.DoctorId,
                        InvoiceDateTime: utl.Formatter.getCurrentDate(),
                        ServiceId: Performdr.ServiceId,
                        ServiceName: Performdr.ServiceName,
                        DoctorName: Performdr.DoctorName,
                        DoctorShare: Performdr.DoctorShare,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        InvoiceStatusId: DoctorInvoiceStatusId,
                        Id: Performdr.Id ? Performdr.Id : 0
                    };
                    $scope.item.Details.push(item);
                }
            }

            // Details.forEach((v, i) => {

            //     // var vdoctorname = '';
            //     // if (v.Doctor.Title && v.Doctor.Title.Description)
            //     //     vdoctorname += '' + v.Doctor.Title.Description;
            //     // if (v.Doctor.FirstName)
            //     //     vdoctorname += ' ' + v.Doctor.FirstName;
            //     // if (v.Doctor.LastName)
            //     //     vdoctorname += ' ' + v.Doctor.LastName;
            //     // if (!vdoctorname)
            //     //     vdoctorname = v.Doctor;

            //     var item = {
            //         EncounterId: v.EncounterId,
            //         PatientBillId: v.PatientBillId,
            //         PatientBillDetailId: v.PatientBillDetailId,
            //         DoctorId: v.DoctorId,
            //         InvoiceDateTime: utl.Formatter.getCurrentDate(),
            //         ServiceId: v.ServiceId,
            //         ServiceName: v.ServiceName,
            //         DoctorName: vdoctorname,
            //         DoctorShare: v.DoctorShare,
            //         FacilityId: utl.Session.getCurrentFacilityId(),
            //         InvoiceStatusId: DoctorInvoiceStatusId,
            //         Id: v.Id ? v.Id : 0
            //     };
            //     $scope.item.Details.push(item);
            // });
            var InvoiceAmount = 0;
            $scope.item.Details.forEach((v, i) => {
                InvoiceAmount = parseFloat(InvoiceAmount) +
                    (isNaN(parseFloat(v.DoctorShare)) ? 0 : parseFloat(v.DoctorShare));
            });
            if ($scope.item.Details.length == 0) {
                utl.Alert.showErrorMsg('Please select Bills');
                return false;
            }
            //             $scope.item.DoctorId = selectedItem.DoctorId;
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
        // $scope.cancel = function () {
        //     if (!utl.Validator.validate($scope)) {
        //         return;
        //     }
        //     $scope.saveItem(3);
        // };
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
        // $scope.handleEvents = function (actionType, entity) {
        //     if (actionType == 'getSelectionRows') {
        //         if (entity.select == false) {
        //             entity.select = true;
        //         } else {
        //             entity.select = false;
        //         }
        //         $scope.getSelectionRows(entity);
        //     }
        // };

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'ServiceItem Rate',
                    field: 'ServiceItemRate',
                    datatype: 'string',
                    headercls: 'td-rate',
                    fieldcls: 'td-rate'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }, ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                    ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId
                }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                }
                var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.currentfilter.GuarantorId);
                if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                    var ServiceItemAliasobj = $filter('filter')(item.ServiceItemAliases, {
                        ExternalProviderId: selectedGuarantor.GuarantorId
                    }, true);
                    if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                        item.AliasId = ServiceItemAliasobj[0].AliasId;
                        item.AliasName = ServiceItemAliasobj[0].AliasName;
                    }
                }
            }
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.loadBills();
        };
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "EncounterType"
                },
                {
                    "Key": "ServiceItem"
                },
                {
                    "Key": "ServiceCategory"
                },
                {
                    "Key": "PerformingDoctor"
                },
                // {
                //     "Key": "PerformingDoctor",
                //     Request: {
                //         Params: [
                //             { Key: 5, Value: $scope.item.ServiceItemId }
                //         ]
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
        };

        $scope.initLookup();
    }

    PerformingDoctorInvoiceFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();