(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPBillListController', OPBillListController);

    function OPBillListController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.SelectedPatientBillId = 0;
        $scope.currentfilter = {
            BillNumber: null,
            BillDateTime: utl.Formatter.getCurrentDate(),
            NameMrn: null,
            VisitNumber: null,
            FromDate: null,
            ToDate: null
        };

        $scope.getList = function (pageNo) {
            $scope.currentfilter.FromDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.ToDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 23:59:59');
            if (($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) ||
                $scope.currentfilter.BillNumber || $scope.currentfilter.NameMrn) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentfilter.BillNumber },
                        { Key: 4, Value: 3 },
                        { Key: 20, Value: [1, 5] },
                        { Key: 13, Value: $scope.currentfilter.NameMrn },
                        { Key: 41, Value: 1 }, // CASH ONLY
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                if ($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) {
                    inputData.Params.push({ Key: 1, Value: [$scope.currentfilter.FromDate, $scope.currentfilter.ToDate] });
                }

                $scope.insurancebillmodified =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'insurancebillmodified');
                if (!$scope.insurancebillmodified) {
                    inputData.Params.push({ Key: 9, Value: 1 });
                }

                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'modify') {
                $scope.SelectedPatientBillId = entity;
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billmodifications.ipbill.modifymsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.Modify,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };
        $scope.Modify = function () {
            var detaillines = $scope.SelectedPatientBillId.PatientBillDetails;
            var paymentlines = $scope.SelectedPatientBillId.PatientPaymentDetails;
            var headerlines = $scope.SelectedPatientBillId;

            if (headerlines.PatientBillDetails)
                headerlines.PatientBillDetails = [];

            if (headerlines.PatientPaymentDetails)
                headerlines.PatientPaymentDetails = [];

            headerlines.IsModified = 1;

            if ($scope.SelectedPatientBillId) {
                var actionName = 'BillModification/ModifiedPatientBills/ManageModifiedOPPatientBills';
                var inputData = { Header: headerlines, Details: detaillines, Payments: paymentlines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "BillNumber", displayName: $translate.instant('billmodifications.ipbill.billnumber.lbl') },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('billmodifications.ipbill.billdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime '></ngformatdate>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientmrn.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{entity.Patient.MRN}}</a>' + '</div>'
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>{{entity.Patient.LastName}}</a>' + '</div>'
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientagegender.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billmodifications.ipbill.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billmodifications.ipbill.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billmodifications.ipbill.dueamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <a class="grid-action" ng-click="handleEvents(\'modify\',entity)" \
                                        translate="common.modifyaction.lbl" ng-show="entity.IsModified == 0"></a>\
                                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        //         $scope.handleEvents = function (actionType, entity) {
        //             $scope.SelectedPatientBillId = entity;
        //             if (actionType == 'modify') {
        //                 var confirmOptions = {
        //                     headingKey: 'common.confirm-modal-header.lbl',
        //                     messageKey: 'billmodifications.ipbill.modifymsg.lbl',
        //                     yesKey: 'common.yeskey.lbl',
        //                     noKey: 'common.nokey.lbl',
        //                     onSuccessMethod: $scope.Modify,
        //                 };
        //                 utl.Dialog.confirmMessage(confirmOptions);
        //             }
        //         };


        //         $scope.Modify = function () {
        //             var detaillines = $scope.SelectedPatientBillId.PatientBillDetails;
        //             var paymentlines = $scope.SelectedPatientBillId.PatientPaymentDetails;
        //             var headerlines = $scope.SelectedPatientBillId;

        //             if (headerlines.PatientBillDetails)
        //                 headerlines.PatientBillDetails = [];

        //             if (headerlines.PatientPaymentDetails)
        //                 headerlines.PatientPaymentDetails = [];

        //                 headerlines.IsModified = 1;

        //             if ($scope.SelectedPatientBillId) {
        //                 var actionName = 'BillModification/ModifiedPatientBills/ManageModifiedOPPatientBills';
        //                 var inputData = { Header: headerlines, Details: detaillines, Payments: paymentlines };
        //                 var options = {
        //                     action: actionName,
        //                     data: { Data: inputData },
        //                     type: 'post',
        //                     onComplete: $scope.saveItemCallback,
        //                     onError: $scope.errorItemCallback
        //                 };
        //                 utl.Http.doAction(options);
        //             }
        //         };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getList();


    }

    OPBillListController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();