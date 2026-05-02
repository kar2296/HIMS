(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inpatienttListController', inpatienttListController);

    function inpatienttListController($scope, $stateParams, $state, $translate, utl, $filter) {
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
        //  Start
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1,
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'admissions.filter_admissiondate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'admissions.filter_dischargedate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_admissiontype.lbl', model: 'AdmissionRequestTypeId', options: $scope.lookup.AdmissionRequestType, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_doctor.lbl', model: 'UpdatedBy', options: $scope.lookup.Doctor, position: { r: 1, c: 2 } },
                    // { type: 'select', translate: 'admissions.filter_department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_refferal.lbl', model: 'ReferralId', options: $scope.lookup.Referral, position: { r: 3, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 3, c: 1 } },
                    // { type: 'select', translate: 'admissions.filter_serviceratecategory.lbl', model: 'ServiceRateCategoryId', options: $scope.lookup.ServiceRateCategory, position: { r: 4, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 4, c: 1 } },
                    // { type: 'text', translate: 'admissions.filter_attender.lbl', model: 'AttenderName', position: { r: 5, c: 0 } },
                    // { type: 'checkbox', translate: 'admissions.filter_isreadmission.lbl', model: 'IsReadmission', position: { r: 5, c: 1 } },
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
        }
        //Dynamic form  ends
        //  End
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if (item.AdmissionStatusId != 6 && item.AdmissionStatusId != 1) {
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            if(!$scope.currentfilter.patientnamemrn &&
                (!$scope.currentfilter.WardId || $scope.currentfilter.WardId <= 0))
               return;

            if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
                $scope.currentfilter.AdmissionDate = '';
            }

            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentfilter.facilityid },
                    { Key: 2, Value: $scope.currentfilter.WardId },
                    { Key: 31, Value: $scope.currentfilter.admissionstatusid },
                    // { Key: 4, Value: $scope.advancedfilter.PatientId },
                    { Key: 5, Value: $scope.advancedfilter.DoctorId },
                    { Key: 6, Value: $scope.advancedfilter.DepartmentId },
                    { Key: 7, Value: $scope.advancedfilter.ServiceRateCategoryId },
                    { Key: 8, Value: $scope.currentfilter.AdmissionRequestTypeId },
                    { Key: 9, Value: $scope.advancedfilter.DiagnosisId },
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    { Key: 32, Value: $scope.currentfilter.RoomId },
                    { Key: 10, Value: $scope.advancedfilter.AttenderName },
                    { Key: 11, Value: $scope.currentfilter.patientnamemrn },
                    { Key: 12, Value: $scope.currentfilter.RequestNo },
                    { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 16, Value: utl.Formatter.getFilterDate($scope.currentfilter.AdmissionDate) },
                    { Key: 17, Value: $scope.advancedfilter.From },
                    { Key: 18, Value: $scope.advancedfilter.To },
                    { Key: 20, Value: $scope.currentfilter.AttenderPhone },
                    { Key: 15, Value: vm.EncounterType == 'ae' ? 3 : vm.EncounterType == 'ip' ? 2 : vm.EncounterType == 'ot' ? 2 : 5 }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.DOA) {
                $scope.advancedfilter.From = '';
                $scope.advancedfilter.To = '';
                var from = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 00:00:00');
                var to = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push({ Key: 17, Value: from }, { Key: 18, Value: to });
            }
            if (vm.EncounterType == 'ot')
                inputData.Params.push({ Key: 2, Value: 18 });
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
        $scope.bedGrid = function () {
            $state.go('app.bedmanagement', { id: 0, tp: vm.EncounterType });
        }
        $scope.filter = function () {
            $state.go('app.admissions.advancefilter', { advancefilterid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Visit/Visit/DeleteEncounter',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        // Cancel Requests from List Screen Function - Start 
        $scope.cancelItem = function () {
            $scope.item.AdmissionRequestStatusId = 3;
            $scope.item.AdmissionRequestType = 2;
            var options = {
                action: 'Visit/Visit/UpdateEncounter',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }


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

        //   $scope.getPatientCertificate = function (scope, data, options, hasError) {
        //     // console.log(data);

        //     $scope.openModal('app.dischargeadvicer', { id: data, EncounterId: options.data.Id ,Encounter:options.data.Encounter});
        // }

        // $scope.getPatientCertificate = function (Encounter) {
        //     var options = {
        //         action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
        //         data: { Id: Encounter.Id, Encounter: Encounter },
        //         type: 'post',
        //         onComplete: $scope.getPatientCertificateCallback
        //     };
        //     utl.Http.doAction(options);
        // }

        /*  for bedtransfer*/
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.populateGrid
            });
        }


        // Cancel Requests from List Screen Function - End 
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'detail') {
                $scope.openEMRPatientOrder(row.entity);
            } else if (actionType == 'previousorders') {
                utl.Modal.open('app.previousorders', {
                    params: {
                        eid: row.entity.Id,
                        pid: row.entity.PatientId
                    }
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            } else if (actionType == 'discharge') {
                utl.Modal.open('app.freecheckout', {
                    params: { id: 0, Encounter: row.entity, EncounterId: row.entity.Id  },
                    confirmCallback: $scope.getList
                });
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

                { field: "VisitIdentifier", displayName: $translate.instant('admissions.admissionno.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
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
                    displayName: $translate.instant('admissions.admittedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                        "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                { field: "Department.DepartmentName", displayName: $translate.instant('admissions.department.lbl') },
                {
                    field: "PatientGuarantor.GuarantorName", displayName: $translate.instant('currentinpatient.guarantor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;background:{{row.entity.PatientGuarantor.GuarantorType.ColorCode}}' class='col-sm-2'></div>\
                                                &nbsp;<span>{{row.entity.PatientGuarantor.GuarantorName}}</span>\
                                            </div>"
                },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('bedmanagement-grid.filter_doa.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.AdmissionDate'></ngformatdate>"
                },
                { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('admissions.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='row.entity.WardRoomMaster'>{{row.entity.WardRoomMaster.RoomNo }}&nbsp;</span>" +
                        "<span  ng-if='row.entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='row.entity.WardRoomBedMaster'>{{row.entity.WardRoomBedMaster.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "AdmissionStatus.Description", displayName: $translate.instant('admissions.status.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;background:{{row.entity.AdmissionStatus.ColorCode}}' class='col-sm-2'></div>\
                                                &nbsp;<span>{{row.entity.AdmissionStatus.Description}}</span>\
                                            </div>"
                },
                // { field: "AttenderPhone", displayName: $translate.instant('admissions.filter_mobileno.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span ng-hide="(row.entity.IsBillFinalized || row.entity.IsBillLock)" class="grid-action" ng-click="grid.appScope.handleEvents(\'detail\',row)">\
                    <i class="btn text-white dem-color4 btn-xs" aria-hidden="true">\
                    <strong>Orders</strong></i></span>\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'previousorders\',row)">\
                    <i class="btn text-white dem-color4  btn-xs" aria-hidden="true"><strong>Previous Orders</strong></i></span>\
                                                </div>',
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        $scope.openEMRPatientOrder = function (encounter) {
            utl.Modal.open('patientemr.patientorder', {
                params: { id: 0, pid: encounter.PatientId, context: 'main', eid: encounter.Id,
                          returnurl: 'app.inpatientlist' },
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
            var fitforid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Fit For Discharge');
            var clinicalid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Clinical Discharge');
            var financialid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Financial Discharge');
            $scope.currentfilter.admissionstatusid = admitid + ',' + fitforid + ',' + clinicalid + ',' + financialid;
            initDynamicForm();
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
    inpatienttListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();