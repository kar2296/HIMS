(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('regpatientidcardController', regpatientidcardController);

    function regpatientidcardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.item = {};
        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }

        $scope.currentcontext.pid = parseInt($stateParams.id);
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        // $scope.cancelCallback = $uibModalInstance.dismiss;
        // $scope.getLatestEncounterDetailsCallback = function (scope, data, options, hasError) {
        //     if (data.Data.length > 0) {
        //             for(let i=0;i<data.Data.length;i++){
        //         $scope.selectedEncounter = data.Data[i];
        //         $scope.item.VisitTypeId = $scope.selectedEncounter.VisitTypeId;
        //         $scope.item.EncounterType = $scope.selectedEncounter.EncounterType.Description;
        //         $scope.item.VisitIdentifier = $scope.selectedEncounter.VisitIdentifier;
        //         $scope.item.DepartmentId = $scope.selectedEncounter.DepartmentId;
        //         $scope.item.Department = $scope.selectedEncounter.Department.DepartmentName;
        //         $scope.item.DoctorId = $scope.selectedEncounter.DoctorId;
        //         $scope.item.DoctorName = $scope.selectedEncounter.DoctorName;
        //         $scope.item.TeamId = $scope.selectedEncounter.TeamId;
        //         $scope.item.Comments = $scope.selectedEncounter.Comments;
        //         $scope.item.EncounterId = $scope.selectedEncounter.EncounterId;
        //         $scope.item.AdmissionDate = $scope.selectedEncounter.AdmissionDate;
        //         $scope.AppointmentId = $scope.selectedEncounter.AppointmentId;
        //         if (!$scope.item.ApprovalNumber || $scope.item.ApprovalNumber == null || $scope.item.ApprovalNumber == '') {
        //             $scope.item.ApprovalNumber = $scope.selectedEncounter.ApprovalNumber;
        //         } else {
        //             $scope.item.ApprovalNumber = $scope.item3.ApprovalNumber;
        //         }
        //             }
        //     }
        // };

        // $scope.getLatestEncounterDetails = function () {
        //     if ($scope.currentcontext.pid > 0) {
        //         var inputData = {
        //             Params: [{
        //                     Key: 4,
        //                     Value: $scope.currentcontext.pid
        //                 }
        //                 //{ Key: 49, Value: 1 }
        //             ],
        //             PageContext: {
        //                 PageSize: 100,
        //                 PageNumber: 1
        //             }
        //         };
        //         var options = {
        //             action: 'Visit/Visit/GetEncounters',
        //             data: inputData,
        //             type: 'post',
        //             onComplete: $scope.getLatestEncounterDetailsCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        $scope.getPatientGuarantorDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item.MemberId = data.Data[0].MemberId;
            }
        };

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.PatientId,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                // {
                //     header: 'Doctor Id',
                //     field: 'DoctorId',
                //     datatype: 'string',
                //     headercls: 'td-code',
                //     fieldcls: 'td-code'
                // },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                // {
                //     header: 'Qualification',
                //     field: 'Qualification',
                //     datatype: 'string',
                //     headercls: 'td-Qualification',
                //     fieldcls: 'td-Qualification'
                // },
                {
                    header: 'Department',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-Department',
                    fieldcls: 'td-Department'
                },
                // {
                //     header: 'Speciality',
                //     field: 'Speciality',
                //     datatype: 'string',
                //     headercls: 'td-dept',
                //     fieldcls: 'td-dept'
                // },
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
                    if (selectedItem.Department.IsEmergency == true)
                        $scope.item.IsEmergencyPatient = selectedItem.Department.IsEmergency;
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

        $scope.getPatientmrnbarcodeCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.BarcodeImg = data;
        };

        $scope.getPatientmrnbarcode = function () {
            if ($scope.item.MRN) {
                var inputData = {
                    Id: $scope.item.PatientId,
                    MRN: $scope.item.MRN
                };
                var options = {
                    action: 'registration/Patient/GetPatientmrnbarcode',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientmrnbarcodeCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getPatientInfo = function (scope, data, options, hasError) {
            if (data.Data && data.Data.length > 0) {
                $scope.selectedPatient = data.Data[0];
                $scope.item = $scope.selectedPatient;
                $scope.item.PatientId = $scope.selectedPatient.Id;
                if ($scope.selectedPatient.FirstName)
                    $scope.item.PatientName = $scope.selectedPatient.FirstName;
                if ($scope.selectedPatient.LastName)
                    $scope.item.PatientName += ' ' + $scope.selectedPatient.LastName;

                $scope.item.Age = $scope.selectedPatient.Age;
                $scope.item.DOB = $scope.selectedPatient.DOB;
                $scope.item.GenderId = $scope.selectedPatient.GenderId;
                if ($scope.selectedPatient.Gender) {
                    if ($scope.selectedPatient.Gender.Description) {
                        $scope.item.Gender = $scope.selectedPatient.Gender.Description;
                    }
                }
                if ($scope.selectedPatient.BloodGroup) {
                    if ($scope.selectedPatient.BloodGroup.Description) {
                        $scope.item.BloodGroup = $scope.selectedPatient.BloodGroup.Description;
                    }
                }
                $scope.item.PatientTypeId = $scope.selectedPatient.PatientTypeId;
                if ($scope.selectedPatient.PatientType) {
                    if ($scope.selectedPatient.PatientType.Description) {
                        $scope.item.PatientType = $scope.selectedPatient.PatientType.Description;
                    }
                }
                $scope.item.NationalityId = $scope.selectedPatient.NationalityId;
                if ($scope.selectedPatient.Nationality) {
                    if ($scope.selectedPatient.Nationality.Description) {
                        $scope.item.Nationality = $scope.selectedPatient.Nationality.Description;
                    }
                }
                if ($scope.selectedPatient.Encounters) {
                    if ($scope.selectedPatient.Encounters[0].Guarantor) {
                        $scope.item.GuarantorName = $scope.selectedPatient.Encounters[0].Guarantor.GuarantorName;
                    }
                }
                if ($scope.selectedPatient.Encounters) {
                    if ($scope.selectedPatient.Encounters[0].Guarantor) {
                        if ($scope.selectedPatient.Encounters[0].Guarantor.TPA) {
                            $scope.item.TPA = $scope.selectedPatient.Encounters[0].Guarantor.TPA.Description;
                        }
                    }
                }
                if ($scope.selectedPatient.Encounters) {
                    $scope.item.DoctorId = $scope.selectedPatient.Encounters[0].DoctorId;
                }

                if ($scope.selectedPatient.Encounters) {
                    if ($scope.selectedPatient.Encounters[0].ReferralName) {
                        $scope.item.ReferralName = $scope.selectedPatient.Encounters[0].ReferralName;
                        $scope.item.ReferrerId = $scope.selectedPatient.Encounters[0].ReferrerId;
                    }
                }
                if ($scope.selectedPatient.Encounters) {
                    if ($scope.selectedPatient.Encounters[0].ReferralType) {
                        $scope.item.ReferralType = $scope.selectedPatient.Encounters[0].ReferralType.Description;
                    }
                }
                $scope.item.NationalityIdentifier = $scope.selectedPatient.NationalityIdentifier;
                $scope.item.Mobile = $scope.selectedPatient.Mobile;
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
                $scope.item.InsuranceCardPhotoPath = $scope.selectedPatient.InsuranceCardPhotoPath;
                $scope.item.IQAMAPhotoPath = $scope.selectedPatient.IQAMAPhotoPath;
                $scope.item.AddressLine1 = $scope.selectedPatient.AddressLine1;
                $scope.item.AddressLine2 = $scope.selectedPatient.AddressLine2;
                $scope.item.City = $scope.selectedPatient.City;
                $scope.item.Country = $scope.selectedPatient.Country;
                $scope.item.State = $scope.selectedPatient.State;
                $scope.item.PasspostNumber = $scope.selectedPatient.PasspostNumber;
                $scope.getPatientProfilePic();
                $scope.getPatientmrnbarcode();
            }
        };
        $scope.patientChange = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientInfo
            };
            utl.Http.doAction(options);
        };

        $scope.patientChange();

    }

    regpatientidcardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();