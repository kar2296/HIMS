(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyBillListController', PharmacyBillListController);

    function PharmacyBillListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
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


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.PatientInfo = '';
                item.AgeGender = '';
                if (item.Patient) {
                    if (item.Patient.Title)
                        item.PatientInfo = item.Patient.Title.Description;
                    if (item.Patient.FirstName)
                        item.PatientInfo += ' ' + item.Patient.FirstName;
                    if (item.Patient.LastName)
                        item.PatientInfo += ' ' + item.Patient.LastName;
                    if (item.Patient.MRN)
                        item.PatientInfo += '/' + item.Patient.MRN;
                    if (item.Patient.Age)
                        item.AgeGender = item.Patient.Age;
                    if (item.Patient.Gender)
                        item.AgeGender += '/' + item.Patient.Gender.Description;
                } else if (!item.Patient) {
                    item.PatientInfo = item.PatientName;
                    item.AgeGender = item.Age + '/' + item.Gender.Description;
                }
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            $scope.currentfilter.FromDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.ToDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 23:59:59');
            if (($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) ||
                $scope.currentfilter.BillNumber || $scope.currentfilter.NameMrn) {
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentfilter.BillNumber
                        },
                        {
                            Key: 4,
                            Value: 3
                        },
                        {
                            Key: 6,
                            Value: 4
                        },
                        {
                            Key: 13,
                            Value: $scope.currentfilter.NameMrn
                        },
                        {
                            Key: 17,
                            Value: $scope.currentfilter.FromDate
                        },
                        {
                            Key: 18,
                            Value: $scope.currentfilter.ToDate
                        },
                        {
                            Key: 41,
                            Value: 1
                        }, // CASH ONLY
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                // if ($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) {
                //     inputData.Params.push({
                //         Key: 1,
                //         Value: [$scope.currentfilter.FromDate, $scope.currentfilter.ToDate]
                //     });
                // }

                $scope.insurancebillmodified =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'insurancebillmodified');
                if (!$scope.insurancebillmodified) {
                    inputData.Params.push({
                        Key: 9,
                        Value: 1
                    });
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
            $scope.SelectedPatientBillId = entity;
            if (actionType == 'modify') {
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

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "BillNumber",
                    displayName: $translate.instant('billmodifications.ipbill.billnumber.lbl')
                },
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
                    field: "PatientInfo",
                    displayName: $translate.instant('billmodifications.ipbill.patientname.lbl'),
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                    //     '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>{{entity.Patient.LastName}}</a>' + '</div>'
                },
                {
                    field: "AgeGender",
                    displayName: $translate.instant('billmodifications.ipbill.patientagegender.lbl'),
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
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
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //  <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //  <span class="grid-action"  ng-click="handleEvents(\'edit\',entity)" ng-show="entity.OTScheduleStatusId ==1||entity.OTScheduleStatusId ==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                //  <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-show="entity.OTScheduleStatusId==1" > <i class=" fa fa-times icon" aria-hidden="true"> </i> </span>\
                // </div>',
                //     handleEvent: $scope.handleEvents,
                //     actions: []
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'modify\',entity)" ng-show="entity.IsModified == 0"><i class="fa fa-pencil-square-o"></i></span>\
                                    </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
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
                var actionName = 'BillModification/ModifiedPatientBills/ManageModifiedPharmacyPatientBills';
                var inputData = {
                    Header: headerlines,
                    Details: detaillines,
                    Payments: paymentlines
                };
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.getList();

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

    }

    PharmacyBillListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();