(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReportCorrelationController', ReportCorrelationController);

    function ReportCorrelationController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            TestName: '',
            PatientMRN: '',
            // AcceptedDate: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        }
        $scope.currentcontext = {};
        if ($scope.currentfilter.TestTypeId == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentfilter.TestTypeId == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentfilter.TestTypeId == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.TotalOrderCount = res.PageContext.TotalRecords
            $scope.disabledept();
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 8, Value: $scope.currentfilter.SubDepartmentId },
                    { Key: 12, Value: $scope.currentfilter.PatientMRN },
                    // { Key: 14, Value: 11 },
                    { Key: 15, Value: $scope.currentfilter.TestTypeId },
                    { Key: 24, Value: $scope.currentfilter.TestName },
                    { Key: 26, Value: $scope.currentfilter.WorkOrderdid },
                    { Key: 27, Value: $scope.currentfilter.ImpressionId },
                    { Key: 28, Value: $scope.currentfilter.ClinicalFindingsId },
                    { Key: 29, Value: $scope.currentfilter.Testid },
                    { Key: 30, Value: $scope.currentfilter.MedValidationById },
                    { Key: 33, Value: utl.Formatter.getFilterDate(From) },
                    { Key: 34, Value: utl.Formatter.getFilterDate(To) },
                    // { Key: 33, Value: From },
                    // { Key: 34, Value: To }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/PatientWorkorderdetails/GetPatientWorkorderdetailssForCorrelation',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.advancedfilter = {
            FromDate: null,
            ToDate: null,
            FromFacility: -1,
            ToFacility: -1,
            CreatedUser: -1,
            ApprovedUser: -1
        };

        function initDynamicForm() {
            $scope.advancedfilterDefault = {

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'text', translate: 'ordermanagement.correlation.wonum.lbl', model: 'WorkOrderdid', position: { r: 0, c: 0 } },
                    //{ type: 'date', translate: 'inventory.stockrequests.todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        // TestMaster AutoSearch
        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Type', field: 'Sampletype', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                // { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
                // { header: 'Price', field: 'Price', datatype: 'string', headercls: 'td-price', fieldcls: 'td-price' },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {

            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.TestName + '(' + selectedItem.TestCode + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
            $scope.getList();
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;

            var inputData = {
                Params: [
                    // { Key: 3, Value: 1},
                    { Key: 6, Value: 2 },
                    // { Key: 8, Value: { 'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId } }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                item.TestCode = item.Code;
                item.TestName = item.Name;
                // item.DrugType = item.DrugType.Description;
                // if (item.GenericMaster)
                //     item.GenericMaster = item.GenericMaster.GenericName;
                // if (item.DrugForm)
                //     item.DrugForm = item.DrugForm.Description;
                // item.DrugFrequency = item.DrugFrequency.Name;

            }
        }

        $scope.getTest = function () {
            $scope.Test = $scope.item.selectedItem;
            $scope.item.TestCode = $scope.Test.Code;
            $scope.item.TestName = $scope.Test.Name;
        };
        // Patient AutoSearch
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Title', field: 'Title', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Age/Gender', field: 'Age', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DOB', field: 'DOB', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'MRN', field: 'MRN', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Visit#', field: 'VisitIdentifier', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Ward/Room/Bed', field: 'WardDetail', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            if (selectedItem) {
                if (selectedItem.IsBillLock) {
                    var msg = 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
                else if (selectedItem.IsBillFinalized) {
                    var msg = 'Bill has been Finalized';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem) {
                var strTitle = selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                var strTitle = selectedItem.Patient && selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
            $scope.getList();
        }

        $scope.patientChanged = function () {
            $scope.Encounter = $scope.item.SelectedItem;
            var selectedItem = $scope.item.SelectedItem;
            if (selectedItem) {
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                $scope.item.OrderFromId = selectedItem.DepartmentId;
                $scope.item.OrderToId = 8;
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientName = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = 2;
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
                $scope.item.EncounterId = selectedItem.Id;

                // $scope.refreshBanner();
                loadTickSheet();
            }
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;

            //Only ip encounter
            var inputData = {
                Params: [

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.id == 0 && $scope.currentcontext.testtype > 0) {
                inputData.Params.push({ Key: 3, Value: 2 || 3 || 4 }, { Key: 15, Value: 2 })
            }

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 11, Value: query });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        };
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                utl.Modal.open('app.orderresultview', {
                    params: { id: row.entity.Workorderid, pid: row.entity.Patientid },
                    confirmCallback: $scope.onDetailSave
                });
            }
            else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patientid);
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: { pid: row.entity.Patientid, oid: row.entity.Orderid },
                    confirmCallback: $scope.onDetailSave
                });
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{rowRenderIndex+ 1}} </span> </div>"
                },

                {
                    field: "AcceptedDate", displayName: $translate.instant('ordermanagement.correlation.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AcceptedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.AcceptedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PatientWorkorder.WorkOrderdid", displayName: $translate.instant('ordermanagement.correlation.wonum.lbl')
                },
                {
                    field: "PatientMRN", displayName: $translate.instant('ordermanagement.ordertat-list.patientinfo.lbl'),
                    width: '15%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >'
                        + "{{row.entity.Patient.Title.Description}}&nbsp;</span>"
                        + "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>"
                        + "<span >{{row.entity.Patient.LastName}}</span>"
                        + "<span >/</span>"
                        + "<span >{{row.entity.Patient.MRN}}</span>"
                        + "<span >/<span>"
                        + "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >"
                        + "<span >{{row.entity.Patient.Age}}</span>"
                        + "<span >/</span>"
                        + "<span >{{row.entity.Patient.Gender.Description}}</span>"
                        + "</a></div>"
                },
                { field: "Testname", displayName: $translate.instant('ordermanagement.ordertat-list.testname.lbl') },
                // {
                //     field: "MedValidationByName", displayName: $translate.instant('ordermanagement.correlation.approvedby.lbl')
                // },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('ordermanagement.correlation.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.PatientOrder.Doctor.Title.Description}}&nbsp;</span>" + "<span >{{row.entity.PatientOrder.Doctor.FirstName}}&nbsp;</span>" + "<span >{{row.entity.PatientOrder.Doctor.LastName}}</span>" + "</div>"
                },
                {
                    field: "MedValidationByName",
                    displayName: $translate.instant('ordermanagement.correlation.approvedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.MedUser.Title.Description}}&nbsp;</span>" + "<span >{{row.entity.MedUser.FirstName}}&nbsp;</span>" + "<span >{{row.entity.MedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "ClinicalFinding.Name", displayName: $translate.instant('ordermanagement.correlation.findings.lbl')
                },
                {
                    field: "ImpressionMaster.Name", displayName: $translate.instant('ordermanagement.correlation.impression.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                              <span class="grid-action"ng-click="grid.appScope.handleEvents(\'view\',row)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\
                             <span class="grid-action" ng-click="grid.appScope.handleEvents(\'ordertat\',row)" ><i class="btn btn-info btn-rounded fa fa-list" aria-hidden="true"uib-tooltip="Order TAT"\
                              tooltip-placement="bottom"></i></span>\
                              </div>',
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $('#patientname').focus();
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "SubDepartment",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentcontext.deptcode }
                        ]
                    }
                },
                { "Key": "LabIncharge" },
                { "Key": "RadiologyIncharge" },
                { "Key": "EndoscopyIncharge" },
                { "Key": "Impression" },
                { "Key": "ClinicalFindings" }
            ];

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

    ReportCorrelationController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();