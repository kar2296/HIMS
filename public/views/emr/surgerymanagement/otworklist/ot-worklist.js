(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otworkListController', otworkListController);

    function otworkListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        vm.EncounterType = $stateParams.tp;

        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            wardid: -1,
            admissionstatusid: '',
            patientnamemrn: '',
            AdmissionRequestTypeId: -1,
            WardId: -1,
            RoomId: -1
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if (item.AdmissionStatusId != 6 && item.AdmissionStatusId != 1) {
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 31, Value: $scope.currentfilter.admissionstatusid },
                    { Key: 8, Value: $scope.currentfilter.AdmissionRequestTypeId },
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    { Key: 32, Value: $scope.currentfilter.RoomId },
                    { Key: 33, Value: 3 },
                    { Key: 11, Value: $scope.currentfilter.patientnamemrn },
                    { Key: 12, Value: $scope.currentfilter.RequestNo },
                    { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 16, Value: utl.Formatter.getFilterDate($scope.currentfilter.AdmissionDate) },
                    { Key: 15, Value: 2 }

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentfilter.DOA) {
                var from = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 00:00:00');
                var to = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push({ Key: 17, Value: from }, { Key: 18, Value: to });
            }
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Patient Info popup  Start  

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        // Patient Info popup  End   
        //Grid Actions

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function (pageNo) {

            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function (cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }

        /*  for bedtransfer*/
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.populateGrid
            });
        }


        // Cancel Requests from List Screen Function - End 
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'otregister') {
                $state.go('app.otregistertab.otregister', { id: 0, eid: row.entity.Id })
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }

        $scope.print = function () {
            utl.Modal.open('app.admissionrequestprint', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                { field: "VisitIdentifier", displayName: $translate.instant('otworklist.ipno.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('otworklist.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                    '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                    // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                    +
                    "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                    "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('otworklist.admittedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                    "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Doctor.LastName}}</span>" +
                    "</span></div>"
                },
                { field: "PatientGuarantor.GuarantorName", displayName: $translate.instant('otworklist.guarantor.lbl') },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('otworklist.doa.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.AdmissionDate'></ngformatdate>"
                },
                { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('otworklist.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='row.entity.WardRoomMaster'>{{row.entity.WardRoomMaster.RoomNo }}&nbsp;</span>" +
                    "<span  ng-if='row.entity.WardRoomMaster'>/</span>" +
                    "<span  ng-if='row.entity.WardRoomBedMaster'>{{row.entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
                },
                { field: "surgeon", displayName: $translate.instant('otworklist.surgeon.lbl') },
                { field: "procedure", displayName: $translate.instant('otworklist.procedure.lbl') },
                // { field: "AttenderPhone", displayName: $translate.instant('admissions.filter_mobileno.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'otregister\',row)"><i class="btn text-white dem-color4  btn-xs" aria-hidden="true"><strong>OT</strong></i></span>\
                                                </div>',
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        $scope.patientdetails = function (encounter) {
            utl.Modal.open('app.patientdetails', {
                params: { pid: encounter.PatientId, asid: encounter.AdmissionStatusId, IsAttender: encounter.IsAttender },
                confirmCallback: $scope.getList
            });
        }

        $scope.custom_sort = function (a, b) {
            return new Date(a.Id).getTime() - new Date(b.Id).getTime();
        }

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.Wards) {
                var item = $scope.Wards[idx];
                if (idx === 1)
                    item.CanShowDetails = true;
                for (var bedidx in item.BedData) {
                    var bedItem = item.BedData[bedidx];
                    if (bedItem.Patient.Id == patientId) {
                        bedItem.isPhotoAvailable = true;
                        bedItem.PatientPhoto = photo;
                    }
                }
            }
        };

        $scope.getPatientProfilePic = function (item) {
            if (item.PhotoPath) {
                var inputData = { Id: item.Id, PhotoPath: item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadPhotos(Patient) {
            for (var idx in $scope.Wards) {
                var item = $scope.Wards[idx];
                item.BedData.sort($scope.custom_sort);
                for (var bedidx in item.BedData) {
                    var bedItem = item.BedData[bedidx];
                    bedItem.isPatientAvailble = false;
                    bedItem.isPhotoAvailable = false;
                    if (bedItem.Patient.Id && bedItem.Patient.Id > 0) {
                        var Patient = bedItem.Patient;
                        bedItem.isPatientAvailble = true;
                        $scope.getPatientProfilePic(Patient);
                        bedItem.GenderId = Patient.GenderId;
                        bedItem.icons = [];
                        if (Patient.IsVip)
                            bedItem.icons.push("fa fa-star");
                        if (Patient.IsAllergy)
                            bedItem.icons.push("fa fa-check");
                        if (Patient.IsNBM)
                            bedItem.icons.push("fa fa-star");
                        if (Patient.IsBillProcess)
                            bedItem.icons.push("fa fa-star");
                        if (Patient.IsDoubleOccupancy)
                            bedItem.icons.push("fa fa-star");
                        if (Patient.IsPatientAlert)
                            bedItem.icons.push("fa fa-star");
                    } else
                        bedItem.PatientPhoto = "app/ico/32-32/b1r.png";
                }
            }
        }

        $scope.onEnter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.DoctorId = -1;
                $scope.getList();
            }
        }
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup 
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors  
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var admitid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Admitted');
            $scope.currentfilter.admissionstatusid = admitid + ',' + '0';
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AdmissionStatus", Default: false },
                { "Key": "Ward" },
                { "Key": "Room" },
                { "Key": "AdmissionType" },

            ]
            /*   2/12/2016 */
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
    otworkListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();