(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimsubmissionController', claimsubmissionController);

    function claimsubmissionController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ClaimSubmissionStatusId: "3,2",
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.SubmittedOn).getTime() - new Date(a.SubmittedOn).getTime();
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            vm.gridConfig.data = data.Data || [];
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshReactProps();
        }
        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.BatchNo },
                    { Key: 2, Value: $scope.currentfilter.GuarantorId },
                    { Key: 3, Value: FrmDate },
                    { Key: 4, Value: ToDate },
                    { Key: 5, Value: $scope.currentfilter.ClaimSubmissionStatusId },
                    { Key: 10, Value: $scope.currentfilter.FacilityId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/ClaimSubmission/GetClaimSubmissions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        }

        //Guarantor List
        vm.guarantorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                {
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
                $scope.currentfilter.GuarantorId = selectedItem.Id;
                $scope.currentfilter.GuarantorName = selectedItem.GuarantorName;
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
                // $scope.currentcontext.GuarantorTypeId = item.GuarantorTypeId;
                // $scope.item.TpaId = item.TPAId;
                // if (item.RemarkType) {
                //     item.RemarkType = item.RemarkType.Description;
                // }
            }
        }
        $scope.addNew = function () {
            $state.go('app.claimsubmission-form', { id: 0 })
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'claim') {
                $state.go('app.claimsubmission-form', { id: entity.Id })
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // {
                //     field: "SubmittedOn",
                //     displayName: $translate.instant('billing.claimsubmission-list.submissiondate.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.SubmittedOn | date : 'dd-MMM-yyyy'}}&nbsp;</span>"
                //     + "<span >{{entity.SubmittedOn| date: 'HH:mm'}}</span>" + "</div>"
                // },
                {
                    field: "SubmittedOn",
                    displayName: $translate.instant('billing.claimsubmission-list.submissiondate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.SubmittedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.SubmittedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "ClaimNumber", displayName: $translate.instant('billing.claimsubmission-list.batchno.lbl')
                },
                {
                    field: "Guarantor.GuarantorName", displayName: $translate.instant('billing.claimsubmission-list.guarantorname.lbl')
                },
                {
                    field: "ClaimAmount",
                    displayName: $translate.instant('billing.claimsubmission-list.totalamt.lbl'),
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.ClaimAmount | displaycurrency}}</span>' + '</div>'
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ClaimAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Createdy",
                    displayName: $translate.instant('billing.claimsubmission-list.createdby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.CreatedUser.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.CreatedUser.LastName}}</span>" +
                        "</span></div>"
                },
                { field: "ClaimSubmissionStatus.Description", displayName: $translate.instant('billing.claimsubmission-list.status.lbl') },
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //                                 <a class="grid-action btn btn-warning btn-xs" ng-click="grid.appScope.handleEvents(\'claim\',row)"><i class="fa fa-usd" aria-hidden="true"></i></a>\
                //                                 </div>',
                //     actions: [

                //     ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'claim\',entity)"><i class="fa fa-usd" aria-hidden="true"></i></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [

                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Facility" },
                { "Key": "ClaimSubmissionStatus", Default: false }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                rows: vm.gridConfig.data
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'batchNoChange') {
                $scope.currentfilter.BatchNo = payload.value;
            } else if (actionName === 'fetch') {
                $scope.getList();
            } else if (actionName === 'fromDateChange') {
                $scope.currentfilter.FromDate = payload.value;
                $scope.getList();
            } else if (actionName === 'toDateChange') {
                $scope.currentfilter.ToDate = payload.value;
                $scope.getList();
            } else if (actionName === 'billNoChange') {
                $scope.currentfilter.BillNo = payload.value;
            } else if (actionName === 'claim') {
                $scope.handleEvents('claim', payload);
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }
    claimsubmissionController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();