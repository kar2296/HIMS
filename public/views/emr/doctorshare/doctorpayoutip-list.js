(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorPayoutIPListController', doctorPayoutIPListController);

    function doctorPayoutIPListController($rootScope,$scope, $stateParams, $state, $translate, utl, $filter,$timeout) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            PaymentIdentifier: '',
            GeneratedBy: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            DoctorShareStatusIPId: 1,
            DoctorName: ''
        };

        $scope.item = {};


        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.DrShareDetails = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.IsApproved == 1) {
                    //item.DoctorShareStatusId = 3;
                    if(item.DoctorShareStatusIPId != 4) {
                        item.Disabled = true;
                    }
                }
                $scope.DrShareDetails.push(item);
            }
            // vm.gridConfig.data = res.Data;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.selectAllItems = function () {
            for (var idx in $scope.DrShareDetails) {
                var item = $scope.DrShareDetails[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSelected = $scope.currentcontext.selectall;
                }
            }
        }

        $scope.drShaSelectionChange = function (item) {

                if (item.IsSelected) {
                    item.IsSelected = false;
                } else if (!item.IsSelected) {
                    item.IsSelected = true;
                }

        }

        // $scope.drInvSelectionChange = function (list, item) {
        //     for (var idx1 in list) {
        //         var detail = list[idx1];
        //         if (detail.IsAllSelected && !detail.IsReadOnly) {
        //             detail.IsSelected = true;
        //         } else if (!detail.IsAllSelected && !detail.IsReadOnly) {
        //             detail.IsSelected = false;
        //         }
        //     }
        // }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 15, Value: $scope.currentfilter.FacilityId },
                    // { Key: 1, Value: FrmDate },
                    // { Key: 2, Value: ToDate },
                    { Key: 19, Value: FrmDate },
                    { Key: 20, Value: ToDate },
                    //{ Key: 3, Value: $scope.currentfilter.DoctorPaymentNo },
                    { Key: 4, Value: $scope.currentfilter.DoctorId },
                    { Key: 5, Value: 2 },//IP
                    { Key: 12, Value: $scope.currentfilter.DoctorShareStatusId },
                    { Key: 17, Value: $scope.currentfilter.DoctorShareStatusIPId },
                    { Key: 18, Value: true },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if ($scope.currentfilter.PatientBillNo) {
                inputData.Params.push({
                    Key: 16,
                    Value: $scope.currentfilter.PatientBillNo
                });
            }

            var options = {
                action: 'billing/PatientDoctorShareDetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
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
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.currentfilter.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{ Key: 3, Value: 2 }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.item.DoctorName = result;
            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.NavigateForm = function (Id) {
            $state.go('app.doctorpayment', { id: Id });
        }

        $scope.addNew = function () {
            $scope.NavigateForm(0);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $state.go('app.doctorstatement', {
                    id: $scope.currentcontext.id
                });
            } else {
                $scope.getList();
            }
        };

       function getSelectionRows() {

           var SelectedRows = [];
            for (var idx in $scope.DrShareDetails) {
                var item = $scope.DrShareDetails[idx];
                if (item.IsSelected == true && item.IsApproved == 0) {
                    //item.DoctorShareStatusId = 3;
                    SelectedRows.push(item);
                }
            }
            //console.log($scope.SelectedRows);return;
            return SelectedRows;
        }

        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            //$scope.item.Details = [];
            $scope.item = getSelectionRows();
            console.log($scope.item);
            // return;
            if ($scope.item.length > 0) {
                var Details = $scope.item;
            } else {
                utl.Alert.showErrorMsg('Please Select Any Bill');
                return;
            }
            // var Details = $scope.item;

            // Details.forEach((v, i) => {



            //     $scope.item.push(item);
            // });

            // console.log($scope.item);
           // return;
            var actionName = 'billing/PatientDoctorShareDetails/ManagePatientDoctorShareDetailsUpdate';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     var actionName = 'doctorinvoice/DoctorInvoice/UpdateDoctorInvoice';
            //     $scope.item.Id = $scope.currentcontext.id;
            // }
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

        $scope.openattachments = function(item) {
            if (item.EncounterId > 0) {
                utl.Modal.open('app.payoutattachments', {
                    params: {
                        eid: item.EncounterId,
                        //itemid: $scope.item.Id
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        };

        $scope.openreceipt = function(item) {
            console.log(item);
            if (item.EncounterId > 0) {
                utl.Modal.open('app.claimreceiptmodel', {
                    params: {
                        id: item.ParentBillId,
                        //itemid: $scope.item.Id
                    },

                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        };

        $scope.onSaveandApprove = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Approve This Share?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'cancel') {

            }
            if (actionType == 'edit') {
                $scope.NavigateForm(row.entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "BillDateTime",
                displayName: $translate.instant('Bill Date'),
                cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
            },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('Bill No')
            },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('Bill No')
            },
            {
                field: "PatientBill.Patient",
                displayName: $translate.instant('Patient Name'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span >{{row.entity.PatientBill.Patient.Title.Description}}&nbsp;</span>" +
                "<span >{{row.entity.PatientBill.Patient.FirstName}}&nbsp;</span>" +
                "<span >{{row.entity.PatientBill.Patient.LastName}}&nbsp;</span>" +
                "</span></div>"
            },
            {
                field: "DoctorName",
                displayName: $translate.instant('Doctor Name')
            },
            {
                field: "PAN",
                displayName: $translate.instant('PAN No')
            },
            {
                field: "Insurance",
                displayName: $translate.instant('Insurance')
            },
            {
                field: "ServiceName",
                displayName: $translate.instant('Billing Service')
            },
            {
                field: "ServiceAmount",
                displayName: $translate.instant('Service Amount')
            },
            {
                field: "DoctorShareAmount",
                displayName: $translate.instant('Dr. Share')
            },
            {
                field: "DoctorShareAmount",
                displayName: $translate.instant('Dr. Share')
            },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                //{ "Key": "PaymentDate" },
                { "Key": "DoctorShareStatusIP" }
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
    doctorPayoutIPListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter','$timeout'];
})();