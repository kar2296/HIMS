(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorPaymentListController', doctorPaymentListController);

    function doctorPaymentListController($rootScope,$scope, $stateParams, $state, $translate, utl, $filter,$timeout) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            PaymentIdentifier: '',
            GeneratedBy: -1,
            PaymentDate: utl.Formatter.getCurrentDate(),
            PaymentStatusId: 3,
            DoctorName: ''
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.PaymentDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.PaymentDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 3, Value: $scope.currentfilter.DoctorPaymentNo },
                    { Key: 4, Value: $scope.currentfilter.GeneratedBy },
                    { Key: 5, Value: [FrmDate, ToDate] },
                    { Key: 6, Value: $scope.currentfilter.PaymentStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'doctorInvoice/DoctorPayment/GetDoctorPayments',
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
                field: "PaymentDateTime",
                displayName: $translate.instant('doctorpayment-list.paymentdate.lbl'),
                cellTemplate: "<ngformatdate datetime-val='row.entity.PaymentDateTime'></ngformatdate>"
            },
            {
                field: "DoctorPaymentIdentifier",
                displayName: $translate.instant('doctorpayment-list.paymentno.lbl')
            },
            {
                field: "Doctor",
                displayName: $translate.instant('doctorpayment-list.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                "<span >{{row.entity.Doctor.LastName}}</span>" +
                "</span></div>"
            },
            {
                field: "BasicSalary",
                displayName: $translate.instant('doctorpayment-list.basicsalary.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.BasicSalary|displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "RoomRent",
                displayName: $translate.instant('doctorpayment-list.roomrent.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.RoomRent|displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "EquipmentUsage",
                displayName: $translate.instant('doctorpayment-list.euipmentusage.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.EquipmentUsage|displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "DoctorPaymentAmount",
                displayName: $translate.instant('doctorpayment-list.paymentamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.DoctorPaymentAmount|displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "DoctorPaymentStatus.Description",
                displayName: $translate.instant('doctorpayment-list.status.lbl')
            },
            {
                field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.PaymentStatusId==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.PaymentStatusId==1||row.entity.PaymentStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    </div>',
                // cellTemplate: 'actionTemplate.html',
                // actions: [
                //     // { actiontype: 'cancel', display: 'common.cancelaction.lbl' },
                //     { actiontype: 'edit', display: 'common.editaction.lbl' }
                // ]
            }],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "PaymentDate" },
                { "Key": "DoctorPaymentStatus" }
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
    doctorPaymentListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter','$timeout'];
})();