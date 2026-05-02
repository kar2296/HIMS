(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorInvoiceListController', doctorInvoiceListController);

    function doctorInvoiceListController($rootScope,$scope, $stateParams, $state, $translate, utl, $filter,$timeout) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            DoctorInvoiceNo: '',
            GeneratedBy: -1,
            InvoiceDate: utl.Formatter.getCurrentDate(),
            FrmDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            InvoiceStatusId: 2,
            DoctorName: ''
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality, vm.doctorcontrolconfig.rowdata.TDSId
                ].join(' ');
            }
            $scope.currentfilter.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
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
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
            $scope.currentfilter.DoctorName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
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
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department.DepartmentName)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var totalinvamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.TotalInvoiceAmount = isNaN(parseFloat(item.InvoiceAmount)) ? (0) : parseFloat(item.InvoiceAmount);

                totalinvamount = totalinvamount + (item.TotalInvoiceAmount)

                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetamount = totalinvamount;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FrmDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 3, Value: $scope.currentfilter.DoctorInvoiceNo },
                    // { Key: 4, Value: $scope.currentfilter.GeneratedBy },
                    // { Key: 5, Value: [FrmDate, ToDate] },
                    { Key: 6, Value: $scope.currentfilter.InvoiceStatusId },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                    // {
                    //     Key: 9,
                    //     Value: utl.Formatter.getFilterDate(From)
                    // },
                    // {
                    //     Key: 10,
                    //     Value: utl.Formatter.getFilterDate(To)
                    // }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if (FrmDate != null)
            //     inputData.Params.push({ Key: 5, Value: [FrmDate, ToDate] });
            var options = {
                action: 'doctorinvoice/DoctorInvoice/GetDoctorInvoices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.NavigateForm = function (Id) {
            $state.go('app.doctorinvoice', { id: Id });
        }

        $scope.addNew = function () {
            $scope.NavigateForm(0);
        };

        $scope.handleEvents = function (actionType, entity) {
            // if (actionType == 'cancel') {

            // }
            if (actionType == 'view') {
                $scope.NavigateForm(entity.Id);
            }
            if (actionType == 'edit') {
                // $scope.NavigateForm(entity.Id);
                utl.Modal.openFixedDialog('app.doctorinvoicepayment', {
                    params: { id:  entity.Id  },
                    confirmCallback: $scope.getItem
                });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "InvoiceDateTime",
                    displayName: $translate.instant('doctorinvoice-list.filter_invoicedate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.InvoiceDateTime'></ngformatdate>"
                },
                {
                    field: "DoctorInvoiceIdentifier",
                    displayName: $translate.instant('doctorinvoice-list.filter_invoiceno.lbl')
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('doctorinvoice-list.filter_doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                // {
                //     field: "EncounterType.Description",
                //     displayName: $translate.instant('doctorinvoice-list.visittype.lbl')
                // },
                {
                    field: "InvoiceAmount",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.InvoiceAmount | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('doctorinvoice-list.invoiceamount.lbl')
                },

                {
                    field: "TaxAmount",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TaxAmount | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('doctorinvoice-list.taxamount.lbl')
                },
                {
                    field: "CreatedUser",
                    displayName: $translate.instant('doctorinvoice-list.requestedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.CreatedUser.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.CreatedUser.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "DoctorInvoiceStatus.Description",
                    displayName: $translate.instant('doctorinvoice-list.filter_status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <span class="grid-action" uib-tooltip="View" tooltip-placement="bottom" ng-click="handleEvents(\'view\',entity)"  ng-show="entity.DoctorInvoiceStatusId==1||entity.DoctorInvoiceStatusId==2||entity.DoctorInvoiceStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                <span class="grid-action" uib-tooltip="Payment Voucher" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)"  ng-show="entity.DoctorInvoiceStatusId==1||entity.DoctorInvoiceStatusId==2||entity.DoctorInvoiceStatusId==3"><i class="fas fa-money-bill-wave" aria-hidden="true"></i></span>\
                                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        //     {
        //         field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
        //         cellTemplate: '<div class="ui-grid-cell-contents">\
        //                                              <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="entity.DoctorInvoiceStatusId==2"><i class="fas fa-eye" aria-hidden="true"></i></span>\
        //                                             <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="entity.DoctorInvoiceStatusId==1||entity.DoctorInvoiceStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
        //                                             </div>',
        //         // cellTemplate: 'actionTemplate.html',
        //         // actions: [
        //         //     // { actiontype: 'cancel', display: 'common.cancelaction.lbl' },
        //         //     { actiontype: 'edit', display: 'common.editaction.lbl' }
        //         // ]
        //     }],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "InvoiceDate" },
                { "Key": "DoctorInvoiceStatus" }
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

    doctorInvoiceListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter','$timeout'];

})();