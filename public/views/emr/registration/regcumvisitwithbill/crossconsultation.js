(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('crossconsultationController', crossconsultationController);

    function crossconsultationController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookup = {};
        $scope.item = {
            VisitTypeId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            StartDate: utl.Formatter.getCurrentDate(),
            IsPrimary: true,
            EncounterDoctorStatus: 1
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 16,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 6,
                    Value: $scope.currentcontext.eid
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Department',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-Department',
                fieldcls: 'td-Department'
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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.DepartmentName = selectedItem.UserDept.DepartmentName;
                if (selectedItem.Department) {
                    if (selectedItem.Department.IsEmergency == true) {
                        $scope.item.IsEmergencyPatient = selectedItem.Department.IsEmergency;
                    }
                }
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.UserDept.DepartmentName, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                },
                {
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 2,
                    Value: utl.Session.getCurrentFacilityId()
                }
                ],
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
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.addReferral = function () {
            utl.Modal.openFixedDialog('app.referraltab.details', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.referralChange = function () {
            var refObj = utl.Lookup.getObject($scope.lookup.Referral, $scope.item.ReferrerId);
            $scope.item.ReferTypeId = refObj.ReferralTypeId;
            $scope.item.ReferralName = refObj.Text;
        };


        $scope.getDefaultReferralCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var refObj = res.Data[0];
                $scope.item.ReferrerId = refObj.Id;
                $scope.item.ReferTypeId = 9;
                $scope.item.ReferralName = refObj.Text;
                $scope.item.ReferrerNumber = refObj.PhoneNo;
                $scope.item.ReferrerEmail = refObj.Email;
            }
        };


        $scope.getDefaultReferral = function () {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 6,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/referral/GetReferrals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDefaultReferralCallback
            };

            utl.Http.doAction(options);
        };

        $scope.referralTypeChangeCallback = function (scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        };

        $scope.referralTypeChange = function () {
            var inputData = [{
                Key: "Referral",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: $scope.item.ReferTypeId
                    }]
                }
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.referralTypeChangeCallback
            };
            utl.Http.doAction(options);
        };

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                //     {
                //     header: 'Referral Code',
                //     field: 'ReferralCode',
                //     datatype: 'string',
                //     headercls: 'td-code',
                //     fieldcls: 'td-code'
                // },
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
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.item.ReferTypeId
                }],
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

        vm.remarkcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Remark Name',
                field: 'Remarks',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Remark Type',
                field: 'RemarkType',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/remark/GetRemarks',
            formatdisplay: formatselectedremark,
            presearch: presearchremark,
            postsearch: postsearchremark
        };

        function formatselectedremark() {
            var selectedItem = vm.remarkcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.RemarkId = selectedItem.Id;
                result = [selectedItem.Remarks].join(' ');
            } else if (vm.remarkcontrolconfig.rowdata) {
                result = [vm.remarkcontrolconfig.rowdata.Remarks].join(' ');
            }
            return result;
        }

        function presearchremark() {
            var query = vm.remarkcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.remarkcontrolconfig.searchbyid === true) {
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

            vm.remarkcontrolconfig.searchparams = inputData;
        }

        function postsearchremark() {
            for (var idx in vm.remarkcontrolconfig.result) {
                var item = vm.remarkcontrolconfig.result[idx];
                item.Remarks = item.Remarks;
                if (item.RemarkType) {
                    item.RemarkType = item.RemarkType.Description;
                }
            }
        }


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.getDiagnosisById(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'Print') {
                $scope.printVisitSlip(entity)
                // utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };
        $scope.printVisitSlip = function (Info) {
            if (Info.Id) {
                // var billnum = '';
                // if ($scope.BillIInfo.length > 0) {
                //     billnum = $scope.BillIInfo[0].BillNumber
                // }
                var inputData = {
                    Id: Info.Id,
                    // Data: {
                    //     BillNumber: billnum
                    // }
                };
                var options = {
                    action: 'Visit/EncounterDoctor/PrintCrossConsultation',
                    data: inputData,
                    type: 'post',
                    // onComplete:$scope.backToList
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.saveItemCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.OtherDiagnosis = '';
            document.getElementById("item_form").reset();
            $scope.item.DoctorId = '';
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (!$scope.item.DoctorId) return;
            var actionName = 'Visit/EncounterDoctor/AddEncounterDoctor';
            $scope.item.PatientId = $scope.currentcontext.pid;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.StartDate = utl.Formatter.getCurrentDate();
            $scope.item.IsPrimary = true;
            $scope.item.EncounterDoctorStatus = 1;
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },

                {
                    field: "Date",
                    displayName: $translate.instant('Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StartDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.StartDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('registration.checkedinpatients.drname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                        "{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</a></div>",
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('Department')
                },
                {
                    field: "ConsultationStatus.Description",
                    displayName: $translate.instant('registration.checkedinpatients.staturs.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'Print\',entity)" ><img class="drhms-edit-button" style="width: 20px;" src="assets/svg/print-black.svg" aria-hidden="true"></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                }
                // {
                //     field: "Id",
                //     width: "10%",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [{
                //         actiontype: 'delete',
                //         display: 'common.deleteaction.lbl'
                //     }]
                // }
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
            $scope.getDefaultReferral();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "VisitType"
            },
            {
                "Key": "ReferralType"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    } // Clinical Dept Only
                    ]
                }
            },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    crossconsultationController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();