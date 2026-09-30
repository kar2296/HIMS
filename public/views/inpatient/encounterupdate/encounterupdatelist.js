(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('encounterupdateListController', encounterupdateListController);

    function encounterupdateListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            DoctorId: -1,
            ReferralTypeId: -1
        };


        $scope.refreshReactProps = function() {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: vm.gridConfig.pagerObj.totalItems || 0,
                pageSize: vm.gridConfig.pagerObj.pageSize || 25,
                currentPage: vm.gridConfig.pagerObj.currentPage || 1,
                lookup: $scope.lookup || {},
                currentfilter: $scope.currentfilter
            };
        };

        $scope.handleReactAction = function(action, payload) {
            $scope.$evalAsync(function() {
                if (action === 'fetchData' && payload) {
                    if (payload.currentPage) vm.gridConfig.pagerObj.currentPage = payload.currentPage;
                    if (payload.pageSize) vm.gridConfig.pagerObj.pageSize = payload.pageSize;
                    if (payload.currentfilter) {
                        angular.extend($scope.currentfilter, payload.currentfilter);
                    }
                    $scope.getList();
                } else if (action === 'edit' && payload) {
                    $scope.handleEvents('edit', payload);
                }
            });
        };

        $scope.getListCallback = function(scope, data, options, hasError) {

            vm.gridConfig.data = [];
            if (!hasError && data && data.Data) {
                for (var idx in data.Data) {
                    var list = {};
                    if (data.Data[idx].AdmissionStatusId != 6) {
                        list = data.Data[idx];
                        list.NoOfDays = '';
                        var admDate = new Date(list.AdmissionDate);
                        var crntDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                        var date2 = new Date(crntDate);
                        var difference_ms = date2.getTime() - admDate.getTime();
                        difference_ms = difference_ms / 1000;
                        var seconds = Math.floor(difference_ms % 60);
                        difference_ms = difference_ms / 60;
                        var minutes = Math.floor(difference_ms % 60);
                        difference_ms = difference_ms / 60;
                        var hours = Math.floor(difference_ms % 24);
                        var days = Math.floor(difference_ms / 24);
                        list.NoOfDays = days + 1;
                        vm.gridConfig.data.push(list);
                    }
                }
                vm.gridConfig.pagerObj.totalItems = (data.PageContext && data.PageContext.TotalRecords !== undefined) ? data.PageContext.TotalRecords : vm.gridConfig.data.length;
            } else {
                vm.gridConfig.pagerObj.totalItems = 0;
            }
            $scope.refreshReactProps();
        };

        $scope.getList = function() {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            if ($scope.currentfilter.PatientNameMRN) {
                var From = null;
                var To = null;
            }
            var inputData = {
                Params: [{
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    { Key: 11, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 15, Value: $scope.currentfilter.EncounterTypeId },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 56,
                        Value: $scope.currentfilter.ReferralTypeId
                    },
                    {
                        Key: 41,
                        Value: $scope.currentfilter.ReferralId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }


        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.encounterupdateform', {
                    params: {
                        eid: entity.Id,
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                { field: "VisitIdentifier", displayName: $translate.instant('Visit #') },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('currentinpatient.doa2.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}}  </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DischargeDate",
                    displayName: $translate.instant('DOD'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}}  </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "EncounterType.Description", displayName: $translate.instant('EncounterType') },
                {
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        // '<a ng-click="handleEvents(\'patientinfo\',entity   )" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        // '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom" >'
                        +
                        '<a ng-click="handleEvents(\'patientinfo\',entity  )">' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",

                    handleEvent: $scope.handleEvents

                },
                {
                    field: "Patient",
                    displayName: $translate.instant('currentinpatient.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity    )">' +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                { field: "Guarantor.GuarantorName", displayName: $translate.instant('currentinpatient.guarantor.lbl') },
                { field: "ReferralType.Description", displayName: $translate.instant('Source Type') },
                {
                    field: "Referral.ReferralName",
                    displayName: $translate.instant('Referral Name'),
                    width: '7%',
                },
                {
                    field: "CreatedBy",
                    displayName: $translate.instant('Created By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.Created.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Created.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Created.LastName}}</span>" +
                        "</span></div>"
                },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                             <span class="grid-action" title="Update" ng-click="handleEvents(\'edit\',entity   )" ><i class="fas fa-prescription-bottle-alt"></i></span>\
                             </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };


        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Referral Code',
                    field: 'ReferralCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Referral Name',
                    field: 'ReferralName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Referral Type',
                    field: 'ReferralType',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                },
                {
                    header: 'PhoneNo',
                    field: 'PhoneNo',
                    datatype: 'string',
                    headercls: 'td-phone',
                    fieldcls: 'td-phone'
                },
                {
                    header: 'Area',
                    field: 'Area',
                    datatype: 'string',
                    headercls: 'td-area',
                    fieldcls: 'td-area'
                }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };

        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            $scope.ReferralName = result;
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 8,
                    Value: 1
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ReferralType" },
                { "Key": "EncounterType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },


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
    encounterupdateListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();