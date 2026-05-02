(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FileTransferController', FileTransferController);

    function FileTransferController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.Transfer = true;
        $scope.item = [];
        $scope.currentfilter = {
            Id: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            LocationId: parseInt(utl.Session.getCurrentDepartmentId()),
            MRDMovementStatusId: 3,
            TransactionDate: utl.Formatter.getCurrentDate(),

        };
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
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
                    Key: 15,
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
                // item.Qualification = item.Qualification;
                // item.Speciality = item.Department.DepartmentName;
            }
        }
        //DoctorAutosearch Ends
        $scope.openModal = function (Id) {
            utl.Modal.open('app.filedetail', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }
        // $scope.showPatientInfo = function (item) {}
        //Cancel Order
        $scope.transferCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.Transfer = true;
            $scope.item = [];
            $scope.getList();
        };

        $scope.ConfirmDeptTransfer = function () {
            $scope.FileTransfer();
        }
        $scope.transfer = function () {
            var rows = getSelectionRows();
            for (var idx in rows) {
                var Patientid = rows[idx].PatientId;
            }
            utl.Modal.open('app.transferdept', {
                params: {
                    pid: Patientid
                },
                confirmCallback: $scope.DeptSave
            });
        };
        $scope.DeptSave = function (itemFromModal) {
            $scope.LocationId = itemFromModal.data;
            $scope.ConfirmDeptTransfer();
        }
        $scope.FileTransfer = function () {
            $scope.Transfer = true;
            var inputArr = getDetailsForTransfer();
            if (inputArr.length > 0) {
                var options = {
                    action: 'IPManagement/MRDLocation/UpdateMRDLocation',
                    data: {
                        Data: $scope.item
                    },
                    type: 'post',
                    onComplete: $scope.transferCallback
                };
                utl.Http.doAction(options);
            }
        };

        function getDetailsForTransfer() {
            var inputArr = [];
            var selectedRows = getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('fileissues.test-notselection-msg.lbl'));
                return;
            } else if (selectedRows.length > 0) {
                if ($scope.item.length != selectedRows.length) {
                    for (var idx in selectedRows) {
                        var transferdata = {
                            Id: selectedRows[idx].Id,
                            BarcodeId: selectedRows[idx].BarcodeId,
                            TransactionDate: utl.Formatter.getCurrentDate(),
                            FacilityId: utl.Session.getCurrentFacilityId(),
                            LocationId: $scope.LocationId,
                            PatientId: selectedRows[idx].PatientId,
                            PatientMrn: selectedRows[idx].PatientMrn,
                            EncounterId: selectedRows[idx].EncounterId,
                            DoctorId: selectedRows[idx].DoctorId,
                            MRDMovementStatusId: 4,
                            MRDFileStatusId: 1,
                            DepartmentId: selectedRows[idx].LocationId,
                        }
                        $scope.item.push(transferdata);
                        inputArr.push(transferdata);
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
                    field: "PatientMrn",
                    displayName: $translate.instant('fileissues.mrn.lbl'),

                },
                {
                    field: "Encounter.AdmissionDate",
                    displayName: $translate.instant('fileissues.visitdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.Encounter.AdmissionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.Encounter.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Encounter.VisitIdentifier",
                    displayName: $translate.instant('fileissues.visitno.lbl')
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
                // {
                //     field: "PatientDepartment.DepartmentName", displayName: $translate.instant('frequest.mrdlocation.lbl')
                // },
                {
                    field: "DoctorId",
                    displayName: $translate.instant('frequest.requesttedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.LastName}}</span>" +
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
        vm.gridConfig.multiSelect = true
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.currentfilter.Id = row.entity.Id;
                $scope.currentcontext.pid = row.entity.PatientId;
                $scope.Transfer = false;
            });
        };
        //Grid selection related code ends

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        };
        $scope.getdeptCallback = function (scope, data, options, hasError) {
            $scope.department = data.Data[0];
            $scope.ToDepartmentId = $scope.department.Id;
        };
        $scope.getdepartments = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: true
                }]
            };
            var options = {
                action: 'SystemSettings/department/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // var receiveid = utl.Lookup.getDefault($scope.lookup.MRDMovementStatus, 'Received');
            // var transferid = utl.Lookup.getDefault($scope.lookup.MRDMovementStatus, 'Transferred');
            // $scope.currentfilter.MRDMovementStatusId = receiveid + "," + transferid;
            $scope.getList();
            $scope.getdepartments();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department"
            },
            {
                "Key": "SubDepartment"
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

    FileTransferController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();