(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientRegisterListReportController', PatientRegisterListReportController);

    function PatientRegisterListReportController($scope, $stateParams, $state, $translate, $filter, utl, $http) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            MRNTypeId: 2
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.CanShowPrint = false;


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Patient Name", "Age and Sex", "MRN", "Visit Date", "Referral", "City", "Reason"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var name = '';
                var age = '';
                var mrn = '';
                var visit = '';
                var ref = '';
                var city = '';
                var reason = '';

                if (rowArray.Title) {
                    if (rowArray.Title.Description) {
                        name = rowArray.Title.Description;
                    }
                    if (rowArray.FirstName) {
                        name += ' ' + rowArray.FirstName;
                    }
                    if (rowArray.LastName) {
                        name += ' ' + rowArray.LastName;
                    }
                }
                if (rowArray.Age) {
                    age = rowArray.Age;
                }
                if (rowArray.Gender.Description) {
                    age += ' ' + rowArray.Gender.Description;
                }
                if (rowArray.MRN) {
                    mrn = rowArray.MRN;
                }
                if (rowArray.RegisteredDate) {
                    visit = rowArray.RegisteredDate;
                }
                if (rowArray.Referral) {
                    if (rowArray.Referral.ReferralName) {
                        ref = rowArray.Referral.ReferralName;
                    }
                }
                if (rowArray.CityMaster) {
                    if (rowArray.CityMaster.CityName) {
                        city = rowArray.CityMaster.CityName;
                    }
                }
                if (rowArray.Remark) {
                    if (rowArray.Remark.Remarks) {
                        reason = rowArray.Remark.Remarks;
                    }
                }
                csvContent += name + ',' + age + ',' + mrn + ',' + visit + ',' + ref + ',' + city + ',' + reason + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'patientlist-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                    {
                        Key: 29,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.ReferrerId
                    },
                    {
                        Key: 0,
                        Value: $scope.currentfilter.PatientId
                    },
                ],

            };
            var options = {
                action: "registration/patient/GetPatients",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.EncounterData = item.Encounters[0];
                vm.gridConfig.data.push(item);
            }

            if ($scope.currentfilter.ReferrerId > 0) {
                $scope.ReferralName = res.Data[0].Referral.ReferralName;
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {

            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                    {
                        Key: 29,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.ReferrerId
                    },
                    {
                        Key: 0,
                        Value: $scope.currentfilter.PatientId
                    },
                    {
                        Key: 37,
                        Value: $scope.currentfilter.MRNTypeId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };

        $scope.backtoReport = function () {
            if ($scope.Context == 'outpatientreport') {
                $state.go('app.ipopreportstab.outpatientreport');
            }
            if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            }
        };


        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    ReferrerName: $scope.ReferralName
                },
                Params: [{
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                    {
                        Key: 29,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.ReferrerId
                    },
                ],
            };
            var options = {
                action: 'registration/patient/PrintPatientList',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
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
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ReferralId
                });
            } else if (query && query.length > 2) {
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

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.patientregistration-form', {
                    id: entity.Id,
                    patientid: entity.PatientId
                });
            } else if (actionType == 'view') {
                $state.go('app.patientregistration-form', {
                    id: entity.Id,
                    patientid: entity.PatientId
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.UserName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('reports.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Title && entity.Title.Description'>{{entity.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.FirstName}}</span>&nbsp;<span>{{entity.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "Age",
                    displayName: $translate.instant('reports.age.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                           <span>{{entity.Age}}</span>&nbsp;/<span>{{entity.Gender.Description}}</span>\
                                     </div>"
                },
                {
                    field: "MRN",
                    displayName: $translate.instant('reports.mrn.lbl')
                },

                {
                    field: "RegisteredDate",
                    displayName: $translate.instant('reports.visit.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RegisteredDate | date : 'dd-MM-yyyy'}} </span></div>"
                },
                {
                    field: "Referral.ReferralName",
                    displayName: $translate.instant('reports.referraldoctor.lbl')
                },
                {
                    field: "CityMaster.CityName",
                    displayName: $translate.instant('reports.city.lbl')
                },
                {
                    field: "PatientStatus.Description",
                    displayName: $translate.instant('appmanager.users.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                             <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
            if ($scope.refreshReactProps) {
                $scope.refreshReactProps();
            }
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "MRNType"
                },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
            $scope.getList();
        }

        $scope.initLookup();

        // --- React Bridge ---
        // Hollowed per REACT_MIGRATION_GUIDE.md: the template now mounts
        // <react-component name="PatientRegistrationSelfScreen">. All business logic above
        // (getList's real 'registration/patient/GetPatients' call, excelDownload, print,
        // backtoReport, handleEvents/edit-navigation, referralcontrolconfig, gridConfig,
        // initLookup) is completely untouched -- React only renders the filters/grid/
        // pagination/toolbar from reactProps and forwards interactions back here.
        //
        // The patient-search and referral-search boxes are typeahead widgets backed by
        // real search APIs. Rather than guess new search logic, their real behavior is
        // reused verbatim from the existing, already-working Angular widgets that back
        // the <patientsearch> and <autosearch> directives elsewhere in this app
        // (public/vendor/components/patientsearchcontrol.js and autosearch.js), adapted
        // only to this screen's actual bindings (no controlid/displayoption/IsMRN are
        // used here, matching the plain patientsearch usage this screen already had).

        // Faithful copy of patientSearchCtrl.searchPatient()/searchPatientCallback(),
        // scoped to this screen's real usage (no controlid/displayoption/IsMRN/facility
        // restriction toggle were used by the original <patientsearch ... filterconfig=
        // "patientfilterconfig"> binding here -- patientfilterconfig was never defined
        // in this controller, so filterconfig-driven branches were always inert).
        function searchPatientCallback(res) {
            var result = res.data.Data;
            for (var idx in result) {
                var item = result[idx];
                item.PatientName = "";
                if (item.Title && item.Title.Description) {
                    item.TitleDesc = item.Title.Description;
                }
                if (item.FirstName) {
                    item.PatientName = item.PatientName + item.FirstName;
                }
                if (item.LastName) {
                    item.PatientName = item.PatientName + ' ' + item.LastName;
                }
                if (item.GenderId == 1) {
                    item.GenderCode = 'M';
                } else if (item.GenderId == 2) {
                    item.GenderCode = 'F';
                } else if (item.GenderId == 3) {
                    item.GenderCode = 'U';
                }
                if (item.Encounters && item.Encounters.length > 0) {
                    var encounter = item.Encounters[0];
                    if (encounter.EncounterStatusId != 2) {
                        item.VisitIdentifier = encounter.VisitIdentifier;
                        item.EncounterId = encounter.EncounterId;
                    }
                }
            }
            return result;
        }

        $scope.searchPatientForRegList = function (query) {
            if (!(query && query.length > 2)) {
                return Promise.resolve([]);
            }
            var inputData = {
                Params: [
                    { Key: 7, Value: 2 },
                    { Key: 37, Value: 2 },
                    { Key: 29, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 1, Value: query }
                ],
                PageContext: { PageSize: 20, PageNumber: 1 }
            };
            return $http.post(window.appPath.apiroot + 'registration/Patient/GetMinPatientSearch', inputData)
                .then(searchPatientCallback);
        };

        $scope.selectPatientForRegList = function (patient) {
            $scope.selectedPatient = patient;
            $scope.currentfilter.PatientId = patient ? patient.Id : null;
            $scope.getList();
        };

        // Faithful copy of autoSearchCtrl.searchItem()/searchItemCallback(), wired to
        // vm.referralcontrolconfig (presearch/postsearch/api) already defined above --
        // identical to how the real <autosearch> widget calls its config.
        function searchReferralCallback(res) {
            vm.referralcontrolconfig.result = res.data.Data;
            vm.referralcontrolconfig.postsearch();
            return vm.referralcontrolconfig.result;
        }

        $scope.searchReferralForRegList = function (query) {
            vm.referralcontrolconfig.field = 'ReferralId';
            vm.referralcontrolconfig.query = query;
            vm.referralcontrolconfig.searchbyid = false;
            vm.referralcontrolconfig.presearch();

            if (!(query && query.length > 2)) {
                return Promise.resolve([]);
            }
            return $http.post(window.appPath.apiroot + vm.referralcontrolconfig.api, vm.referralcontrolconfig.searchparams)
                .then(searchReferralCallback);
        };

        $scope.selectReferralForRegList = function (referral) {
            vm.referralcontrolconfig.selected = referral;
            $scope.currentfilter.ReferrerId = referral ? referral.Id : null;
            $scope.ReferralDisplay = referral ? formatselectedreferral() : '';
            $scope.getList();
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: {
                    FromDate: $scope.currentfilter.FromDate,
                    ToDate: $scope.currentfilter.ToDate,
                    MRNTypeId: $scope.currentfilter.MRNTypeId
                },
                patientDisplay: $scope.selectedPatient ? $scope.selectedPatient.PatientName : '',
                referralDisplay: $scope.ReferralDisplay || '',
                mrnTypeOptions: ($scope.lookup && $scope.lookup.MRNType) || [],
                columnDefs: vm.gridConfig.columnDefs.map(function (c) {
                    return { field: c.field, displayName: c.displayName };
                }),
                gridData: vm.gridConfig.data || [],
                pagerObj: vm.gridConfig.pagerObj,
                canShowPrint: $scope.CanShowPrint,
                context: $scope.Context || ''
            };
        };
        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'dateChange') {
                var field = payload && payload.field;
                var value = payload && payload.value ? new Date(payload.value) : '';
                if (field === 'FromDate' || field === 'ToDate') {
                    $scope.currentfilter[field] = value;
                    $scope.getList();
                }
            } else if (actionName === 'mrnTypeChange') {
                $scope.currentfilter.MRNTypeId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = (payload && payload.page) || 1;
                $scope.getList();
            } else if (actionName === 'editRow') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'excelDownload') {
                $scope.excelDownload();
            } else if (actionName === 'print') {
                $scope.print();
            } else if (actionName === 'backtoReport') {
                $scope.backtoReport();
            } else if (actionName === 'sort') {
                // Presentational only: sorting order/state is owned by React (matches
                // customTable's own reOrder(), which only ever re-sorts vm.gridConfig.data
                // client-side -- no server round trip either in the original).
                return;
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };
    }

    PatientRegisterListReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$http'];

})();
