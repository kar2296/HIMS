(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyBillModificationListController', PharmacyBillModificationListController);

    function PharmacyBillModificationListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
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

        if ($stateParams.filterbillnr)
            $scope.currentfilter.BillNumber = $stateParams.filterbillnr;

        if ($stateParams.filterbilldt)
            $scope.currentfilter.BillDateTime = $stateParams.filterbilldt;

        if ($stateParams.filterbilldt)
            $scope.currentfilter.NameMrn = $stateParams.filtermrn;



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
                            Key: 42,
                            Value: true
                        },
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
                    action: 'billing/Patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.pharmacybillmodifyform', {
                    id: entity.Id,
                    // tp: contexttp,
                    mode: 1,
                    pid: entity.PatientId,
                    eid: entity.EncounterId,
                    filterbillnr: $scope.currentfilter.BillNumber,
                    filterbilldt: $scope.currentfilter.BillDateTime,
                    filtermrn: $scope.currentfilter.NameMrn,
                })
            } else if (actionType == 'view') {
                $state.go('app.pharmacybillmodifyview', {
                    id: entity.Id,
                    // tp: contexttp,
                    mode: 0,
                    pid: entity.PatientId,
                    eid: entity.EncounterId,
                    filterbillnr: $scope.currentfilter.BillNumber,
                    filterbilldt: $scope.currentfilter.BillDateTime,
                    filtermrn: $scope.currentfilter.NameMrn,
                });
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
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action"  ng-click="handleEvents(\'view\',entity)"><i class="icofont-ebook"  uib-tooltip="Orginal Bill"></i></span>\
                    <span class="grid-action"  ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pencil-square-o" uib-tooltip="Edit"></i></span>\
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

        $scope.getList();

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

    }

    PharmacyBillModificationListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();