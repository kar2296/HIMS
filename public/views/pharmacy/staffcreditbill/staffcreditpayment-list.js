(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StaffCreditPaymentListController', StaffCreditPaymentListController);

    function StaffCreditPaymentListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            StaffCreditPaymentStatusId: 2,
            // FacilityId: utl.Session.getCurrentFacilityId(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
            MRN: '',
            // Staff: 1

        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }


        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };


        $scope.backtoList = function () {
            $state.go('app.pharmacydashboard');
        }


        $scope.addNew = function () {
            $state.go('app.staffcreditpayment');
        };
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                {
                    header: 'Title',
                    field: 'Title',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'Name',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Age/Gender',
                    field: 'Age',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'DOB',
                    field: 'DOB',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'MRN',
                    field: 'MRN',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
            ],
            searchparams: {},
            result: {},
            api: 'Registration/Patient/GetPatients',
            presearch: presearchStaffpatient,
            formatdisplay: formatselectedStaffpatient,
            postsearch: postsearchStaffpatient
        };

        function formatselectedStaffpatient() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            var strTitle = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.PatientId = selectedItem.Id;
                strTitle = selectedItem.Title ? selectedItem.Title.Description : '';
                result = [strTitle, selectedItem.FirstName, selectedItem.LastName].join(' ');
            } else if (vm.patientcontrolconfig.rowdata) {
                if (vm.patientcontrolconfig.rowdata) {
                    result = [vm.patientcontrolconfig.rowdata.Title.Description,
                    vm.patientcontrolconfig.rowdata.FirstName,
                    vm.patientcontrolconfig.rowdata.LastName
                    ].join(' ');
                } else {
                    return '';
                }
            }
            $scope.patientChange();

            return result;
        }
        function presearchStaffpatient() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 35,
                    Value: true
                },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            /*
            if ($scope.currentcontext.id === 0 && $scope.currentcontext.testtype > 0) {
                inputData.Params.push({ Key: 3, Value: 2 || 3 || 4 }, { Key: 15, Value: 2 });
            }
            */
            if (vm.patientcontrolconfig.searchbyid === true) {
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

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchStaffpatient() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Title ? item.Title.Description : '';
                item.Name = [item.FirstName, item.LastName].join(' ');
                item.Age = item.Age + ' / ' + item.Gender.Description;
                item.DOB = $filter('date')(item.DOB, 'yyyy-MMM-dd');
                item.MRN = item.MRN;
            }
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'billing/patientbills/DeletePatientBills',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.staffcreditpayment', { id: entity.Id, pid: entity.StaffId });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } 
            
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('billing.pharmacy.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "StaffName",
                    displayName: $translate.instant('billing.pharmacy.staffname.lbl')
                    // cellTemplate: "<div class='ui-grid-cell-contents'><span ><b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" + "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" + "<span ><b>{{entity.Patient.LastName}}</b></span>" + "</div>"
                },
                // { field: "PatientName", displayName: $translate.instant('billing.pharmacy.staffname.lbl') },

                { field: "StaffCreditPaymentIdentifier", displayName: $translate.instant('Payment #') },
                // { field: "StockEntryType.Description", displayName: $translate.instant('billing.pharmacy.stockentrytype.lbl') },
                {
                    field: "StaffCreditPaymentDate",
                    displayName: $translate.instant('billing.pharmacy.billdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StaffCreditPaymentDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.StaffCreditPaymentDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "TotalOutstandingAmount",
                    displayName: $translate.instant('NetAmount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalOutstandingAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalOutstandingAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "ReceiptAmount",
                    displayName: $translate.instant('billing.pharmacy.paidamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ReceiptAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.ReceiptAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                // {
                //     field: "BillDiscount",
                //     displayName: $translate.instant('billing.pharmacy.discount.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.BillDiscount | displaycurrency}}&nbsp;</span>' + '</div>'
                // },
                // {
                //     field: "NetAmount",
                //     displayName: $translate.instant('billing.pharmacy.paidamt.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                // },
               
                { field: "StaffCreditPaymentStatus.Description", displayName: $translate.instant('billing.pharmacy.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('billing.pharmacy.action.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" uib-tooltip="View" tooltip-placement="bottom" ng-click="handleEvents(\'view\',entity)" ng-show="entity.StaffCreditPaymentStatusId==3||entity.StaffCreditPaymentStatusId==4||entity.StaffCreditPaymentStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.StaffCreditPaymentStatusId==1||entity.StaffCreditPaymentStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" uib-tooltip="Delete" tooltip-placement="bottom" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.StaffCreditPaymentStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    <span class="grid-action" uib-tooltip="Staff Return" tooltip-placement="bottom" ng-click="handleEvents(\'staffreturn\',entity)" ng-show="entity.StaffCreditPaymentStatusId==3"><a><i class="fa fa-retweet" aria-hidden="true"></i></a></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var staffbill = res.Data[idx];
                staffbill.DueAmt = staffbill.BillAmount - staffbill.BillDiscount + staffbill.RoundOffValue;
                vm.gridConfig.data.push(staffbill);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            // if ($scope.currentfilter.MRN || $scope.currentfilter.BillNumber) {
            //     FromDate = null;
            //     ToDate = null;
            // }

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StaffCreditPaymentIdentifier },
                    { Key: 3, Value: FromDate },
                    { Key: 4, Value: ToDate },
                    { Key: 5, Value: $scope.currentfilter.StaffCreditPaymentStatusId },
                    { Key: 5, Value: $scope.currentfilter.MRN },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/StaffCreditPayment/GetStaffCreditPayments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        function setDefaults() {
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.StockEntryStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.StockEntryStatus, 'Authorized');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.StockEntryStatus, 'Completed');
            $scope.currentfilter.StaffCreditPaymentStatusId = ApprovedId + "," + AuthorizedId + "," + CompletedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "StaffCreditPaymentStatus" }
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

    StaffCreditPaymentListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();