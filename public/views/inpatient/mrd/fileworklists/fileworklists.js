(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('fileworklistsController', fileworklistsController);

    function fileworklistsController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        // $scope.CanShowListGrid = true;
        // $scope.CanShowSaveListGrid = false;
        $scope.item = [];
        $scope.Issue = true;
        $scope.currentfilter = {
            Id: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            LocationId: parseInt(utl.Session.getCurrentDepartmentId()),
            MRDMovementStatusId: 1,
            TransactionDate: utl.Formatter.getCurrentDate(),
            DepartmentId: -1
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            // vm.gridConfig.data = data.Data;
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if (item.IsManual == 0) {
                    item.Manual = 'Auto';
                } else if (item.IsManual == 1) {
                    item.Manual = 'Manual';
                }
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            for (var idx in vm.gridConfig.data) {
                var encounter = vm.gridConfig.data[idx];
                $scope.fnencounter(encounter);
            }
            // $scope.CanShowListGrid = false;
            // $scope.CanShowSaveListGrid = true;
        };
        $scope.getList = function (pageNo) {
            if ($scope.currentfilter.MRDMovementStatusId == 1) {
                var From = $filter('date')($scope.currentfilter.TransactionDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.TransactionDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.PatientNameMRN
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.LocationId
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.MRDMovementStatusId
                    },
                    {
                        Key: 12,
                        Value: From
                    },
                    {
                        Key: 13,
                        Value: To
                    },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'IPManagement/MRDLocation/GetMRDLocations',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentfilter.MRDMovementStatusId != 1) {
                var From = $filter('date')($scope.currentfilter.TransactionDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.TransactionDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [
                        // { Key: 4, Value: $scope.currentfilter.DepartmentId },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.PatientNameMRN
                        },
                        {
                            Key: 8,
                            Value: $scope.currentfilter.DoctorId
                        },
                        // { Key: 10, Value: $scope.currentfilter.LocationId },
                        {
                            Key: 14,
                            Value: $scope.currentfilter.MRDMovementStatusId
                        },
                        {
                            Key: 12,
                            Value: From
                        },
                        {
                            Key: 13,
                            Value: To
                        },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'IPManagement/MRDLocation/GetMRDLocations',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            };

        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.mrdmovement', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }
        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.currentcontext.deptid = $scope.encounter.DepartmentId
                for (var idx in vm.gridConfig.data) {
                    var dept = vm.gridConfig.data[idx];
                }
            }
        };

        $scope.fnencounter = function (encounter) {
            var inputData = {
                Params: [
                    // { Key: 14, Value: 1 },
                    {
                        Key: 4,
                        Value: encounter.PatientId
                    },
                    // { Key: 40, Value: 1 }

                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVisitIndentifier
            };

            utl.Http.doAction(options);
        };
        //DoctorAutosearchStarts
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
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
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
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

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }
        //DoctorAutosearch Ends

        //File Issue
        $scope.issueCallback = function (scope, data, options, hasError) {
            if ($scope.item.length > 0) {
                $scope.item.forEach((FileRequest, index) => {
                    $scope.getFileRequest(FileRequest);
                });
            }
            $scope.Issue = true;
            $scope.item = [];
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        function updateFileRequest(data) {
            var actionName = 'IPManagement/FileRequest/UpdateFileRequest';

            var inputData = {
                Id: data,
                MRDMovementStatusId: 2
            }
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                //onComplete: $scope.FileIssue
            };

            utl.Http.doAction(options);
        }
        $scope.getFileRequestCallback = function (scope, data, options, hasError) {
            $scope.FileRequests = data.Data;
            if (data.Data.length > 0) {
                $scope.FileRequests.forEach((FileRequest, index) => {
                    updateFileRequest(FileRequest.Id);
                });
            }
        };
        $scope.getFileRequest = function (data) {
            var inputData = {
                Params: [{
                    Key: 9,
                    Value: data.PatientId
                },
                {
                    Key: 13,
                    Value: data.EncounterId
                },
                {
                    Key: 12,
                    Value: 1
                },
                {
                    Key: 2,
                    Value: data.LocationId
                },
                ]
            };
            var options = {
                action: 'IPManagement/FileRequest/GetFileRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFileRequestCallback
            };

            utl.Http.doAction(options);
        };
        $scope.issue = function () {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'worklists.issuemsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.FileIssue,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        $scope.FileIssue = function () {
            $scope.Issue = true;
            if ($scope.currentfilter.MRDMovementStatusId == 2) {
                utl.Alert.showErrorMsg($translate.instant('fileissues.cantchange.lbl'));
                return;
            }

            var inputArr = getDetailsForIssue();
            var options = {
                action: 'IPManagement/MRDLocation/UpdateMRDLocation',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.issueCallback
            };
            utl.Http.doAction(options);

        };

        function getDetailsForIssue() {
            var inputArr = [];
            var selectedRows = getSelectionRows();
            for (var idx in selectedRows) {
                if ($scope.item.length != selectedRows.length) {
                    if (selectedRows[idx].MRDTypeId == 1) {
                        if (selectedRows[idx].Encounter == null) {
                            if (selectedRows.length == 0) {
                                utl.Alert.showErrorMsg($translate.instant('fileissues.test-notselection-msg.lbl'));
                                return;
                            } else if (selectedRows.length > 0) {
                                for (var idx in selectedRows) {
                                    var issuedata = {
                                        Id: selectedRows[idx].Id,
                                        BarcodeId: selectedRows[idx].PatientMrn,
                                        TransactionDate: utl.Formatter.getCurrentDate(),
                                        FacilityId: utl.Session.getCurrentFacilityId(),
                                        DepartmentId: selectedRows[idx].LocationId,
                                        PatientId: selectedRows[idx].PatientId,
                                        PatientMrn: selectedRows[idx].PatientMrn,
                                        EncounterId: selectedRows[idx].EncounterId,
                                        DoctorId: selectedRows[idx].DoctorId,
                                        MRDMovementStatusId: 2,
                                        MRDFileStatusId: 1,
                                        LocationId: selectedRows[idx].DepartmentId,
                                        RequestIdentifier: selectedRows[idx].RequestIdentifier,
                                    }
                                    $scope.item.push(issuedata);
                                }
                            }
                        } else if (selectedRows[idx].Encounter != null) {
                            if (selectedRows[idx].Encounter.IsLatest == true) {
                                if (selectedRows.length == 0) {
                                    utl.Alert.showErrorMsg($translate.instant('fileissues.test-notselection-msg.lbl'));
                                    return;
                                } else if (selectedRows.length > 0) {
                                    for (var idx in selectedRows) {
                                        var issuedata = {
                                            Id: selectedRows[idx].Id,
                                            BarcodeId: selectedRows[idx].PatientMrn,
                                            TransactionDate: utl.Formatter.getCurrentDate(),
                                            FacilityId: utl.Session.getCurrentFacilityId(),
                                            DepartmentId: selectedRows[idx].LocationId,
                                            PatientId: selectedRows[idx].PatientId,
                                            PatientMrn: selectedRows[idx].PatientMrn,
                                            EncounterId: selectedRows[idx].EncounterId,
                                            DoctorId: selectedRows[idx].DoctorId,
                                            MRDMovementStatusId: 2,
                                            MRDFileStatusId: 1,
                                            LocationId: selectedRows[idx].DepartmentId,
                                            RequestIdentifier: selectedRows[idx].RequestIdentifier,
                                        }
                                        $scope.item.push(issuedata);
                                    }
                                }
                            } else if (selectedRows[idx].Encounter.IsLatest == false) {
                                if (selectedRows.length == 0) {
                                    utl.Alert.showErrorMsg($translate.instant('fileissues.test-notselection-msg.lbl'));
                                    return;
                                } else if (selectedRows.length > 0) {
                                    for (var idx in selectedRows) {
                                        var issuedata = {
                                            Id: selectedRows[idx].Id,
                                            BarcodeId: selectedRows[idx].PatientMrn,
                                            TransactionDate: utl.Formatter.getCurrentDate(),
                                            FacilityId: utl.Session.getCurrentFacilityId(),
                                            DepartmentId: selectedRows[idx].LocationId,
                                            PatientId: selectedRows[idx].PatientId,
                                            PatientMrn: selectedRows[idx].PatientMrn,
                                            EncounterId: selectedRows[idx].EncounterId,
                                            DoctorId: selectedRows[idx].DoctorId,
                                            MRDMovementStatusId: 2,
                                            MRDFileStatusId: 1,
                                            LocationId: selectedRows[idx].DepartmentId,
                                            RequestIdentifier: selectedRows[idx].RequestIdentifier,
                                        }
                                        $scope.item.push(issuedata);
                                    }
                                }
                            }
                        }
                    }
                    if (selectedRows[idx].MRDTypeId == 2) {
                        if (selectedRows.length == 0) {
                            utl.Alert.showErrorMsg($translate.instant('fileissues.test-notselection-msg.lbl'));
                            return;
                        } else if (selectedRows.length > 0) {
                            for (var idx in selectedRows) {
                                var issuedata = {
                                    Id: selectedRows[idx].Id,
                                    BarcodeId: selectedRows[idx].PatientMrn,
                                    TransactionDate: utl.Formatter.getCurrentDate(),
                                    FacilityId: utl.Session.getCurrentFacilityId(),
                                    DepartmentId: selectedRows[idx].LocationId,
                                    PatientId: selectedRows[idx].PatientId,
                                    PatientMrn: selectedRows[idx].PatientMrn,
                                    EncounterId: selectedRows[idx].EncounterId,
                                    DoctorId: selectedRows[idx].DoctorId,
                                    MRDMovementStatusId: 2,
                                    MRDFileStatusId: 1,
                                    LocationId: selectedRows[idx].DepartmentId,
                                    RequestIdentifier: selectedRows[idx].RequestIdentifier,
                                }
                                $scope.item.push(issuedata);
                            }
                        }
                    }
                }
            }
            return inputArr;
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'movement') {
                utl.Modal.open('app.mrdmovement', {
                    params: {
                        id: row.entity.Id,
                        pid: row.entity.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }
        $scope.getPatientInfo = function (row) {
            console.log(row);
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "TransactionDate",
                    displayName: $translate.instant('frequest.requesteon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.TransactionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.TransactionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "BarcodeId",
                    displayName: $translate.instant('inventory.stockrequests.requestnumber.lbl')
                },
                {
                    field: "PatientId",
                    displayName: $translate.instant('frequest.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" + "<span>&nbsp;&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}</span>" + "<span ng-if='row.entity.Patient.LastName>&nbsp;&nbsp;</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "FileLocation.DepartmentName",
                    displayName: $translate.instant('frequest.filelocation.lbl')
                },
                {
                    field: "PatientDepartment.DepartmentName",
                    displayName: $translate.instant('frequest.mrdlocation.lbl')
                },
                {
                    field: "IsLatest",
                    displayName: $translate.instant('frequest.visittype.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <div style='background-color: #e465b1;font-size: medium;font-weight: 700;class='col-sm-2'ng-if='row.entity.Encounter.VisitTypeId==1'>\
                    <span ng-if='row.entity.Encounter.VisitTypeId==1'>{{row.entity.Encounter.VisitType.Description}}</span>\
                    <div style='background-color: darkcyan;font-size: medium;font-weight: 700;class='col-sm-2'ng-if='row.entity.Encounter.VisitTypeId==2'>\
                    <span ng-if='row.entity.Encounter.VisitTypeId==2'>{{row.entity.Encounter.VisitType.Description}}</span></div>"
                },
                {
                    field: "PRIORITY",
                    displayName: $translate.instant('frequest.priority.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;background:{{row.entity.PRIORITY.ColorCode}}' class='col-sm-2'></div>\
                             &nbsp;<span>{{row.entity.PRIORITY.Description}}</span>\
                              </div>"
                },
                {
                    field: "EncounterType.Description",
                    displayName: $translate.instant('frequest.type.lbl')
                },
                {
                    field: "Manual",
                    displayName: $translate.instant('frequest.reqtype.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <div style='background-color: #ff7508;font-size: medium;font-weight: 700;class='col-sm-2'ng-if='row.entity.IsManual==0'>\
                    <span ng-if='row.entity.IsManual==0'>{{row.entity.Manual}}</span></div>\
                    <div style='background-color: #3bf7b1;font-size: medium;font-weight: 700;class='col-sm-2'ng-if='row.entity.IsManual==1'><span ng-if='row.entity.IsManual==1'>{{row.entity.Manual}}</span></div>\ &nbsp;\ </div>"
                },
                {
                    field: "DoctorId",
                    displayName: $translate.instant('frequest.requesttedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{row.entity.CreatedUser.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.CreatedUser.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.CreatedUser.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                {
                    field: "MRDRequestType.Description",
                    displayName: $translate.instant('frequest.requesttype.lbl')
                },
                {
                    field: "MRDMovementStatus.Description",
                    displayName: $translate.instant('frequest.status.lbl')
                },
                // {
                //     field: "MRDRequestType.Description",
                //     displayName: $translate.instant('frequest.requesttype.lbl')
                // },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'movement\',row)"><i class="btn btn-info btn-rounded fa fa-map-signs" aria-hidden="true"></i></span>\
                    </div>',
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.multiSelect = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.currentfilter.Id = row.entity.Id;
                $scope.Issue = false;
            });
        };
        //Grid selection related code ends

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        };
        // $scope.getdeptCallback = function (scope, data, options, hasError) {
        //     $scope.department = data.Data[0];
        //     $scope.ToDepartmentId = $scope.department.Id;
        //     $scope.currentfilter.FromDepartmentId = $scope.ToDepartmentId;
        //     // $scope.getList();
        // };
        // $scope.getdepartments = function (pageNo) {
        //     var inputData = {
        //         Params: [
        //             { Key: 7, Value: true }
        //         ]
        //     };
        //     var options = {
        //         action: 'SystemSettings/department/GetDepartments',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getdeptCallback
        //     };
        //     utl.Http.doAction(options);
        // };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department"
            },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "EncounterType"
            },
            {
                "Key": "Priority"
            },
            {
                "Key": "MRDFileStatus"
            },
            {
                "Key": "MRDMovementStatus"
            },
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

    fileworklistsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();