(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimsubmissionFormController', claimsubmissionFormController);

    function claimsubmissionFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {
            id: parseInt($stateParams.id)
        };
        var savehitcompleted = 0;
        $scope.item = {
            GuarantorTypeId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromBillDate: utl.Formatter.getCurrentDate(),
            ToBillDate: utl.Formatter.getCurrentDate()
        };
        $scope.GuarantorBills = [];
        $scope.Details = [];
        $scope.CanshowViewbtn = false;

        $scope.selectAllItems = function () {
            for (var idx in $scope.GuarantorBills) {
                var item = $scope.GuarantorBills[idx];
                item.IsSelected = $scope.currentcontext.selectall;
                item.IsAllOrderSelected = $scope.currentcontext.selectall;
            }
            $scope.refreshReactProps();
        }
        $scope.IsAllOrderSelectedChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllOrderSelected) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllOrderSelected) {
                    detail.IsSelected = false;
                }
            }
            $scope.refreshReactProps();
        }
        //Guarantor List
        vm.guarantorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Guarantor Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                }, {
                    header: 'Guarantor Name',
                    field: 'GuarantorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/Guarantor/GetGuarantors',
            formatdisplay: formatselectedguarantor,
            presearch: presearchguarantor,
            postsearch: postsearchguarantor
        };

        function formatselectedguarantor() {
            var selectedItem = vm.guarantorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.GuarantorId = selectedItem.Id;
                $scope.item.GuarantorName = selectedItem.GuarantorName;
                result = [selectedItem.GuarantorName].join(' ');
            } else if (vm.guarantorcontrolconfig.rowdata) {
                result = [vm.guarantorcontrolconfig.rowdata.GuarantorName].join(' ');
            }
            return result;
        }

        function presearchguarantor() {
            var query = vm.guarantorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };


            if (vm.guarantorcontrolconfig.searchbyid === true) {
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

            vm.guarantorcontrolconfig.searchparams = inputData;
        }

        function postsearchguarantor() {
            for (var idx in vm.guarantorcontrolconfig.result) {
                var item = vm.guarantorcontrolconfig.result[idx];
                item.GuarantorName = item.GuarantorName;
                item.GuarantorCode = item.GuarantorCode;
                $scope.item.GuarantorTypeId = item.GuarantorTypeId;
                $scope.item.TpaId = item.TPAId;
                // if (item.RemarkType) {
                //     item.RemarkType = item.RemarkType.Description;
                // }
            }
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                $scope.item = data.Data[0];
            if ($scope.item.ClaimSubmissionStatusId == 3) {
                $scope.CanshowViewbtn = true;
                // $scope.print($scope.currentcontext.id);
            }
            if ($scope.item.ClaimSubmissionStatusId == 2) {
                $scope.CanshowViewbtn = false;
            }
            if ($scope.item.ClaimSubmissionStatusId == 4) {
                $scope.CanshowViewbtn = true;
            }
            $scope.getList();
            $scope.actionVisiblity();
            $scope.refreshReactProps();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    }]
                };
                var options = {
                    action: 'billing/ClaimSubmission/GetClaimSubmissions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            } else
                $scope.actionVisiblity();
        };
        $scope.getGuarantorBillsCallback = function (scope, data, options, hasError) {
            $scope.GuarantorBills = [];
            for (var gdx in data.Data) {
                var gData = data.Data[gdx];
                gData.IsReadOnly = false,
                    gData.IsSelected = false,
                    // gData.IsAllOrderSelected = false;
                    // gData.IsSelected = false;
                    $scope.GuarantorBills.push(gData);
            }
            $scope.refreshReactProps();
        };
        $scope.getGuarantorBills = function () {
            // var guarantorId_ = 1000;
            // var facilityId_ = utl.Session.getCurrentFacilityId();
            // if (!facilityId_) facilityId_ = 1;
            // guarantorId_ *= facilityId_;

            if ($scope.item.GuarantorId != -1) {

                var FrmDate = $filter('date')($scope.item.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.item.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 8,
                            Value: $scope.item.FacilityId
                        },
                        {
                            Key: 61,
                            Value: $scope.item.GuarantorId
                        },
                        {
                            Key: 19,
                            Value: $scope.item.EncounterTypeId
                        },
                        {
                            Key: 13,
                            Value: $scope.item.PatientMRN
                        },
                        {
                            Key: 2,
                            Value: $scope.item.BillNo
                        },
                        {
                            Key: 17,
                            Value: FrmDate
                        },
                        {
                            Key: 18,
                            Value: ToDate
                        },
                        // {
                        //     Key: 17,
                        //     Value: utl.Formatter.getFilterDate(FrmDate)
                        // },
                        // {
                        //     Key: 18,
                        //     Value: utl.Formatter.getFilterDate(ToDate)
                        // },
                        {
                            Key: 50,//IsPaidFully
                            Value: '0'
                        },
                        {
                            Key: 26,//IsClaimed
                            Value: '0'
                        },
                        // { Key: 6, Value: [1, 2, 3] },
                        {
                            Key: 9,
                            Value: $scope.item.GuarantorTypeId
                        },
                        {
                            Key: 4,//PatientBillStatus
                            Value: 3
                        },
                        {
                            Key: 11,//IsOutStanding
                            Value: '0'
                        },
                        {
                            Key: 33,//BillingType
                            Value: [1, 2, 4, 5]
                            // Value: [1, 2, 3, 5]
                        },
                        // {
                        //     Key: 26,
                        //     Value: false
                        // },
                        {
                            Key: 70,
                            Value: $scope.item.PatientId
                        }
                    ]
                };

                var options = {
                    action: 'billing/PatientBills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getGuarantorBillsCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.GuarantorBills = [];
            for (var gdx in data.Data) {
                var gData = data.Data[gdx];
                $scope.GuarantorBills.push(gData);
            }
            // $scope.GuarantorBills  = data.Data || [];
            $scope.refreshReactProps();
        };
        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.id
                }]
            };

            var options = {
                action: 'billing/ClaimSubmissionDetails/GetClaimSubmissionDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPatientFormById = function (ClaimSubmissionDetailId) {
            if (ClaimSubmissionDetailId && ClaimSubmissionDetailId > 0) {
                var options = {
                    action: 'billing/ClaimSubmissionDetails/GetClaimSubmissionDetails',
                    data: {
                        Id: ClaimSubmissionDetailId
                    },
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.printclaim = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    ids: 0,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                },
            };
            var options = {
                action: 'billing/ClaimSubmission/PrintClaimSubmission',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print = function (ClaimSubmissionDetailId) {
            var inputData = {
                Id: ClaimSubmissionDetailId,
                Data: {
                    ids: 0,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                },
            };
            var options = {
                action: 'billing/ClaimSubmissionDetails/PrintGetClaimSubmission',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.corporatecoverprint = function (ClaimSubmissionDetailId) {
            var inputData = {
                Id: ClaimSubmissionDetailId,
                Data: {
                    ids: 1,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                },
            };
            var options = {
                action: 'billing/ClaimSubmissionDetails/PrintGetClaimSubmission',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.opcoverprint = function (ClaimSubmissionDetailId) {
            var inputData = {
                Id: ClaimSubmissionDetailId,
                Data: {
                    ids: 2,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                },
            };
            var options = {
                action: 'billing/ClaimSubmissionDetails/PrintGetClaimSubmission',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.tpacoverprint = function (ClaimSubmissionDetailId) {
            var inputData = {
                Id: ClaimSubmissionDetailId,
                Data: {
                    ids: 3,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                },
            };
            var options = {
                action: 'billing/ClaimSubmissionDetails/PrintGetClaimSubmission',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.selectGridList = function () {
            if ($scope.currentcontext.id === 0)
                $scope.getGuarantorBills();
            else if ($scope.currentcontext.id > 0)
                $scope.getList();
        };

        $scope.backToList = function () {
            $state.go('app.claimsubmission-list');
        };

        $scope.addNew = function () {
            $state.go('app.claimsubmission-list', {
                id: 0
            });
        };

        $scope.dispatchCallback = function (data) {
            $scope.item.TrackingNumber = data.TrackingNumber;
            $scope.item.DispatchedById = data.DispatchedById;
            $scope.item.DispatchedOn = data.DispatchedOn;
            $scope.item.Comments = data.Comments;
            $scope.saveItem(4);
        };
        $scope.dispatch = function () {
            utl.Modal.open('app.claimdispatchdetail', {
                params: {
                    SubmittedOn: $scope.item.SubmittedOn
                },
                // confirmCallback: $scope.getItem
                confirmCallback: $scope.dispatchCallback
            });
        };
        $scope.coveringletter = function (list, item) {
            utl.Modal.open('app.claimcoveringletter', {
                params: {
                    GuarantorBillsinfo: item,
                },
                confirmCallback: $scope.getItem
                // confirmCallback: $scope.dispatchCallback
            });
        };
        $scope.View = function () {
            utl.Modal.open('app.claimcoveringletterview', {
                params: {
                    GuarantorBillsinfo: $scope.GuarantorBills,
                },
                confirmCallback: $scope.getItem
                // confirmCallback: $scope.dispatchCallback
            });
        };

        $scope.historyLink = function () {
            utl.Modal.open('app.claimhistory', {
                params: {
                    history: $scope.item
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.actionVisiblity = function () {
            $scope.ShowCreate = false;
            $scope.ShowSubmission = false;
            $scope.ShowCoverLetter = false;
            $scope.ShowDispatch = false;
            $scope.IsDisabled = false;
            if ($scope.currentcontext.id > 0) {
                $scope.IsDisabled = true;
                $scope.ShowCoverLetter = true;
                if ($scope.item.ClaimSubmissionStatusId == 2) {
                    $scope.ShowSubmission = true;
                } else if ($scope.item.ClaimSubmissionStatusId == 3) {
                    $scope.ShowDispatch = true;
                }
            } else {
                $scope.ShowCreate = true;
            }
            $scope.refreshReactProps();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $state.go('app.claimsubmission-form', {
                    id: $scope.currentcontext.id
                });
            }
            if (typeof (data) == "boolean") {
                $scope.currentcontext.id = options.data.Data.Id;

                $scope.getItem();
            } else {
                $scope.getItem();
            }
        };

        $scope.saveAlert = function (status) {

            // var Details = $scope.GuarantorBills;
            // for (var idx in Details) {
            //     var bill = Details[idx];
            //     if (bill.IsSelected) {
            //         Details.push(bill);
            //     }
            // }
            getSelectionRows();
            $scope.item.Details = [];
            if ($scope.currentcontext.id === 0) {
                $scope.item.ClaimAmount = 0;
                $scope.Details.forEach((v, i) => {
                    // $scope.item.ClaimAmount += v.BillAmount;
                    $scope.item.ClaimAmount += v.OutStandingAmount;
                    var item = {
                        GuarantorId: $scope.item.GuarantorId,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        PatientId: v.PatientId,
                        PatientBillId: v.Id,
                        FacilityId: utl.Session.getCurrentFacilityId()
                    };
                    $scope.item.Details.push(item);
                });
            } else if ($scope.currentcontext.id > 0) {
                $scope.item.Details = $scope.GuarantorBills;
            }
            if ($scope.item.Details.length === 0) {
                utl.Alert.showErrorMsg('Please Select any Bill');
                return false;
            }

            var msg = status == 2 ? 'billing.claimsubmission-form.createmsg.lbl' :
                status == 3 ? 'billing.claimsubmission-form.submitmsg.lbl' :
                'billing.claimsubmission-form.dispatchmsg.lbl';
            var confirmOptions = {
                itemId: status,
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function (status) {
            if (savehitcompleted == 1) return;
            if (status == 3) {
                $scope.item.SubmittedOn = utl.Formatter.getCurrentDate();
                $scope.item.SubmittedById = utl.Session.getCurrentUserId();
            }
            if (status == 2) {
                $scope.item.SubmittedOn = utl.Formatter.getCurrentDate();
                $scope.item.SubmittedById = utl.Session.getCurrentUserId();
            }
            // else if (status == 4) {
            //     $scope.item.Details = vm.gridConfig.data;
            // }
            $scope.item.ClaimSubmissionStatusId = status;
            savehitcompleted = 1;
            var actionName = 'billing/ClaimSubmission/AddClaimSubmission';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0)
                actionName = 'billing/ClaimSubmission/UpdateClaimSubmission';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: []
        };
        if ($scope.currentcontext.id === 0) {
            vm.gridConfig.columnDefs.push({
                field: "BillDateTime",
                displayName: $translate.instant('billing.claimsubmission-form.billdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            }, {
                field: "Patient",
                displayName: $translate.instant('billing.claimsubmission-form.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                    "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            }, {
                field: "BillNumber",
                displayName: $translate.instant('billing.claimsubmission-form.billno.lbl')
            }, {
                field: "BillAmount",
                displayName: $translate.instant('billing.claimsubmission-form.billamt.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.BillAmount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "BillDiscount",
                displayName: $translate.instant('billing.claimsubmission-form.discount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.BillDiscount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "OutStandingAmount",
                displayName: $translate.instant('billing.claimsubmission-form.outstanding.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.OutStandingAmount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "UserName",
                displayName: $translate.instant('billing.claimsubmission-form.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span >{{row.entity.User.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.User.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.User.LastName}}&nbsp;</span>" +
                    "</span></div>"
            });
        } else if ($scope.currentcontext.id > 0) {
            vm.gridConfig.columnDefs.push({
                field: "BillDateTime",
                displayName: $translate.instant('billing.claimsubmission-form.billdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.PatientBill.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.PatientBill.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            }, {
                field: "Patient",
                displayName: $translate.instant('billing.claimsubmission-form.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.LastName}}</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.MRN}}</span>" +
                    "<span >/<span>" +
                    "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                    "<span >{{row.entity.Patient.Age}}</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            }, {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('billing.claimsubmission-form.billno.lbl')
            }, {
                field: "BillAmount",
                displayName: $translate.instant('billing.claimsubmission-form.billamt.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.PatientBill.BillAmount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "BillDiscount",
                displayName: $translate.instant('billing.claimsubmission-form.discount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.PatientBill.BillDiscount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "OutStandingAmount",
                displayName: $translate.instant('billing.claimsubmission-form.outstanding.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.PatientBill.OutStandingAmount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "UserName",
                displayName: $translate.instant('billing.claimsubmission-form.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span >{{row.entity.PatientBill.User.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.PatientBill.User.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.PatientBill.User.LastName}}&nbsp;</span>" +
                    "</span></div>"
            });
        }
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true;
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        function getSelectionRows() {
            // $scope.IsAllOrderSelectedChange();
            // var currentSelection = $scope.GuarantorBills.selection.getSelectedRows();
            // return currentSelection;
            $scope.currentSelection = [];
            $scope.currentSelection = $scope.GuarantorBills;
            for (var idx in $scope.currentSelection) {
                var bill = $scope.currentSelection[idx];
                if (bill.IsSelected) {
                    $scope.Details.push(bill);
                }
            }

        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "EncounterType"
                }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentcontext: $scope.currentcontext,
                item: $scope.item,
                selectedPatient: $scope.selectedPatient,
                GuarantorBills: $scope.GuarantorBills,
                CanshowViewbtn: $scope.CanshowViewbtn,
                ShowCreate: $scope.ShowCreate,
                ShowSubmission: $scope.ShowSubmission,
                ShowDispatch: $scope.ShowDispatch,
                lookup: $scope.lookup
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'fromBillDateChange') {
                $scope.item.FromBillDate = payload.value;
            } else if (actionName === 'toBillDateChange') {
                $scope.item.ToBillDate = payload.value;
            } else if (actionName === 'selectGridList') {
                $scope.selectGridList();
            } else if (actionName === 'backToList') {
                $scope.backToList();
            } else if (actionName === 'historyLink') {
                $scope.historyLink();
            } else if (actionName === 'printclaim') {
                $scope.printclaim();
            } else if (actionName === 'saveAlert') {
                $scope.saveAlert(payload.status);
            } else if (actionName === 'dispatchClaim') {
                $scope.dispatch();
            } else if (actionName === 'selectAllItems') {
                $scope.currentcontext.selectall = payload.value;
                $scope.selectAllItems();
            } else if (actionName === 'rowSelectChange') {
                var row = $scope.GuarantorBills[payload.index];
                row.IsAllOrderSelected = payload.value;
                $scope.IsAllOrderSelectedChange($scope.GuarantorBills, row);
            } else if (actionName === 'coveringletter') {
                $scope.coveringletter($scope.GuarantorBills, $scope.GuarantorBills[payload.index]);
            } else if (actionName === 'corporatecoverprint') {
                $scope.corporatecoverprint(payload.Id);
            } else if (actionName === 'opcoverprint') {
                $scope.opcoverprint(payload.Id);
            } else if (actionName === 'tpacoverprint') {
                $scope.tpacoverprint(payload.Id);
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    claimsubmissionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();