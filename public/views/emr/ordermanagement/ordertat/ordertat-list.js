(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderTATListController', orderTATListController);

    function orderTATListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            TestName: '',
            PatientMRN: '',
            orderedon: utl.Formatter.getCurrentDate(),
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

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
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
                { field: "TestName", displayName: $translate.instant('ordermanagement.ordertat-list.testname.lbl') },
                { field: "PatientOrder.OrderNumber", displayName: $translate.instant('patientemr.patientorder-list.number.lbl') },
                { field: "PatientWorkorder.WorkOrderdid", displayName: $translate.instant('ordermanagement.myresultapproval-list.workordernumber.lbl') },
                {
                    field: "OrderedOn", displayName: $translate.instant('ordermanagement.ordertat-list.orderedon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.OrderedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.OrderedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "AcceptedOn", displayName: $translate.instant('ordermanagement.ordertat-list.acceptedon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AcceptedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.AcceptedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "SampleCollectedOn", displayName: $translate.instant('ordermanagement.ordertat-list.samplecollectedon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.SampleCollectedOn'></ngformatdate>"
                },
                {
                    field: "SampleReceivedOn", displayName: $translate.instant('ordermanagement.ordertat-list.samplereceivedon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.SampleReceivedOn'></ngformatdate>"
                },
                {
                    field: "AssignedOn", displayName: $translate.instant('ordermanagement.ordertat-list.assignedon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.AssignedOn'></ngformatdate>"
                },
                {
                    field: "TechValidationOn", displayName: $translate.instant('ordermanagement.ordertat-list.techvalidationon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.TechValidationOn'></ngformatdate>"
                },
                {
                    field: "MedValidationOn", displayName: $translate.instant('ordermanagement.ordertat-list.medvalidationon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.MedValidationOn'></ngformatdate>"
                },
                {
                    field: "ReleasedOn", displayName: $translate.instant('ordermanagement.ordertat-list.releasedon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.ReleasedOn'></ngformatdate>"
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
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
            api: 'Encounter/Visit/GetEncounters',
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
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.TotalOrderCount = res.PageContext.TotalRecords
            $scope.disabledept();
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.orderedon, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.orderedon, 'yyyy-MM-dd 23:59:59') || null;
            var AcceptFrom = $filter('date')($scope.currentfilter.acceptedon, 'yyyy-MM-dd 00:00:00') || null;
            var AcceptTo = $filter('date')($scope.currentfilter.acceptedon, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.PatientMRN },
                    { Key: 3, Value: $scope.currentfilter.TestName },
                    { Key: 4, Value: $scope.currentfilter.PatientId },
                    { Key: 7, Value: $scope.currentfilter.TestId },
                    { Key: 5, Value: $scope.currentfilter.PatientOrderId },
                    { Key: 10, Value: From },
                    { Key: 11, Value: To },
                    { Key: 12, Value: AcceptFrom },
                    { Key: 13, Value: AcceptTo },
                    { Key: 14, Value: $scope.currentfilter.TestTypeId },
                    { Key: 15, Value: $scope.currentfilter.SubDepartmentId },
                    { Key: 16, Value: $scope.currentfilter.Approvedbyid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/ordertat/GetOrderTATs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
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

    orderTATListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();