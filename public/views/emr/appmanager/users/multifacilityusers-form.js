(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MultiFaciltyyuserFormController', MultiFaciltyyuserFormController);

    function MultiFaciltyyuserFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        var vm = this;
        $scope.item = {
            IsActive: true,
            FacilityId: -1,
            OrgId: utl.Session.getCurrentFacilityId(),
            NationalityId: 238,
            IsIncludeTax: false,
            staff: false,
            CountryId: 1
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            facilityid: utl.Session.getCurrentFacilityId(),
            file: null
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActionFrom = utl.Formatter.getCurrentDate();

        $scope.requiredsecuritypin =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');
        if (!$scope.requiredsecuritypin) $scope.requiredsecuritypin = false;
        else $scope.requiredsecuritypin = true;

        $scope.openSignModal = function () {
            utl.Modal.open('sign-modal', {
                params: {},
                confirmCallback: refreshSign
            });
        };
        $scope.UploadSignPhoto = function () {
            var actionName = 'SystemSettings/User/UpdateSelfUser';
            if ($scope.currentcontext.SignatureFile) {
                $scope.data = {};
                $scope.data.Id = $scope.item.Id;
                $scope.data.UploadedFile = 'Signature';
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.SignatureFile,
                        Data: $scope.data,
                    }
                }).then(function (resp) { //upload function returns a promise
                    $scope.backToList();
                    console.log('Uploaded...');
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            }
        };
        $scope.signFileChanged = function () {
            if ($scope.currentcontext.SignatureFile && $scope.currentcontext.SignatureFile.name) {
                $scope.item.SignatureName = $scope.currentcontext.SignatureFile.name;
            }
        }
        $scope.clear = function () {
            $scope.item = {};
        };

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
        }
        $scope.openWebCam = function () {
            utl.Modal.openFixedDialog('webcam-modal', {
                params: {
                    pid: $scope.item.PatientId || 0
                },
                confirmCallback: webcamSuccess
            });
        };
        function refreshSign(signatureData) {
            $scope.item.signimagedata = signatureData;
            if (signatureData) {
                $scope.item.signdata = signatureData.split(',')[1];
            }
        }
        $scope.getfacdept = function (selected) {
            $scope.item.DepartmentId = -1;
            if ($scope.item.FacilityId > 0) {
                var inputData = [{
                    "Key": "Department", Request: {
                        Params: [{ Key: 5, Value: 2 },
                        { Key: 14, Value: [-1, $scope.item.FacilityId] }
                        ]
                    }
                }
                ];
                $scope.getLookUp(inputData);
            }
        };
        $scope.canShowPatientArea = function () {
            return ($scope.item.UserTypeId == 8);
        };

        $scope.getUserProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getUserProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = { PhotoPath: $scope.item.PhotoPath };
                var options = {
                    action: 'SystemSettings/User/GetUserProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getUserProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.getUserSignPicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.SignPhoto = data;
        };

        $scope.getUserSignPic = function () {
            if ($scope.item.SignPath) {
                var inputData = { SignPath: $scope.item.SignPath };
                var options = {
                    action: 'SystemSettings/User/GetUserSignPic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getUserSignPicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        };

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     $scope.item = data;
        //     if ($scope.item.Password) {
        //         $scope.item.ConfirmPassword = $scope.item.Password;
        //     }
        //     $scope.getUserProfilePic();
        //     $scope.getUserSignPic();
        // };

        // $scope.getItem = function (pageNo) {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         var options = {
        //             action: 'SystemSettings/User/GetUserById',
        //             data: { Id: $scope.currentcontext.id },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };
        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.item.map = res.Data;
            $scope.items = $scope.item.map[0];
            $scope.item.TitleId=$scope.items.User.TitleId;
            $scope.item.FirstName=$scope.items.User.FirstName;
            $scope.item.MiddleName=$scope.items.User.MiddleName;
            $scope.item.LastName=$scope.items.User.LastName;
            $scope.item.Age=$scope.items.User.Age;
            $scope.item.DOB=$scope.items.User.DOB;
            $scope.item.GenderId=$scope.items.User.GenderId;
            $scope.item.Qualification=$scope.items.User.Qualification;
            $scope.item.Designation=$scope.items.User.Designation;
            $scope.item.AddressLine1=$scope.items.User.AddressLine1;
            $scope.item.AddressLine2=$scope.items.User.AddressLine2;
            $scope.item.Mobile=$scope.items.User.Mobile;
            $scope.item.Email=$scope.items.User.Email;
            $scope.item.OPDRoomId=$scope.items.User.OPDRoomId;
            $scope.item.PANNo=$scope.items.User.PANNo;
            $scope.item.AccountNo=$scope.items.User.AccountNo;
            $scope.item.IFSCCode=$scope.items.User.IFSCCode;
            $scope.item.BankName=$scope.items.User.BankName;
            $scope.item.LicenseNo=$scope.items.User.LicenseNo;
            $scope.item.AdditionalPhoneNo=$scope.items.User.AdditionalPhoneNo;
            $scope.item.TeamId=$scope.items.User.TeamId;
            $scope.item.IsActive=$scope.items.User.IsActive;
            $scope.item.IsSurgeon=$scope.items.User.IsSurgeon;
            $scope.item.IsAnaesthisist=$scope.items.User.IsAnaesthisist;
            $scope.item.IsPrivate=$scope.items.User.IsPrivate;
            $scope.item.PrivateDueLimit=$scope.items.User.PrivateDueLimit;
            $scope.item.IsDiscount=$scope.items.User.IsDiscount;
            $scope.item.DiscountModeId=$scope.items.User.DiscountModeId;
            $scope.item.DiscountLimit=$scope.items.User.DiscountLimit;
            $scope.item.IsDueCheck=$scope.items.User.IsDueCheck;
            $scope.item.IsTDS=$scope.items.User.IsTDS;
            $scope.item.TDSId=$scope.items.User.TDSId;
            $scope.item.IsVirtualUsers=$scope.items.User.IsVirtualUsers;
            $scope.item.VirtualSubCategoryId=$scope.items.User.VirtualSubCategoryId;
            $scope.item.OrgId=$scope.items.User.OrgId;
            $scope.item.FacilityId=$scope.items.User.FacilityId;
            $scope.item.DepartmentId=$scope.items.User.DepartmentId;
            $scope.item.SubDepartmentId=$scope.items.User.SubDepartmentId;
            $scope.item.UserGroupId=$scope.items.User.UserGroupId;
            $scope.item.BillingCounterId=$scope.items.User.BillingCounterId;
            $scope.item.UserTypeId=$scope.items.User.UserTypeId;
            $scope.item.Password=$scope.items.User.Password;
            $scope.item.ConfirmPassword=$scope.items.User.ConfirmPassword;
            $scope.item.LoginPermission=$scope.items.User.LoginPermission;
            $scope.item.PhotoPath=$scope.items.User.PhotoPath;
        };

        $scope.getItem = function () {
            var inputData = {
                Params: [
                    {
                        Key: 0,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 1,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                ],
            };

            var options = {
                action: 'SystemSettings/UserFacilityMap/GetUserFacilityMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.users');
        };

        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to Save User?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            // $scope.currentcontext.SignPath = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        };
        $scope.clearsignfile = function () {
            $scope.currentcontext.SignatureFile = null;
            $scope.currentcontext.SignPhoto = null;
            $scope.item.SignPhoto = null;
            $scope.item.SignatureName = '';
            $scope.item.SignPath = '';
        };
        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you Approve User?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $state.go('app.usertab.general', { id: data });
            } else {
                $scope.backToList();
            }
            if ($scope.currentcontext.SignatureFile) {
                $scope.UploadSignPhoto();
            }
        };
        $scope.SaveDataCallback = function (data) {
            if ($scope.currentcontext.SignatureFile) {
                $scope.item.Id = data.data;
                $scope.UploadSignPhoto();
            } else {
                $scope.backToList();
            }
        }


        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('Data Already Exists With Same UserName'));
            }
        }


        $scope.saveItem = function () {
            if ($scope.ValidateLoginDetails()) {
                if (!utl.Validator.validate($scope)) {
                    return;
                }
                if (!$scope.item.LandLine && !$scope.item.Mobile) {
                    utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.atleast-one-contactno-msg.lbl'));
                    return;
                }

                var actionName = 'SystemSettings/User/AddUser';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'SystemSettings/User/UpdateUser';
                }

                if ($scope.currentcontext.file) {
                    var actionUrl = utl.Http.getRootPath() + actionName;
                    Upload.upload({
                        url: actionUrl,
                        data: {
                            file: $scope.currentcontext.file,
                            Data: $scope.item
                        }
                    }).then(function (resp) {
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.backToList();
                    },
                        function (resp) {
                            console.log('Error status: ' + resp.status);
                            utl.Alert.showErrorMsg('Error status: ' + resp.status);
                        },
                        function (evt) {
                            console.log(evt);
                        });
                    return false;
                } else {
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.item,
                            file: $scope.currentcontext.file
                        },
                        type: 'post',
                        onComplete: $scope.saveItemCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.amount = function () {
            if ($scope.item.PrivateDueLimit > 500000) {
                utl.Alert.showErrorMsg($translate.instant('Amount Should Not Exceed 500000'));
                return false;
            }
        };

        $scope.fillGenderInfo = function () {
            if ($scope.item.TitleId == 10) {
                $scope.item.GenderId = 1;
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12) {
                $scope.item.GenderId = 2;
            }
        };

        $scope.calculateAge = function () {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
            $scope.item.IsBirthDateApproximate = false;
        };

        $scope.calculateDOB = function () {
            $scope.item.DOB = utl.Formatter.getDOBFromAge($scope.item.Age);
            $scope.item.IsBirthDateApproximate = true;
        };

        $scope.ValidateLoginDetails = function () {
            if ($scope.currentcontext.loginsetting) {
                var condition = $scope.currentcontext.loginsetting;
                if (($scope.item.UserName.length < condition.MinLoginNameLength) || ($scope.item.UserName.length > condition.MaxLoginNameLength)) {
                    utl.Alert.showErrorMsg($translate.instant('appmanager.user.invalidloginname.lbl'));
                    return false;
                }
                if ($scope.item.UserName.replace(/[^0-9]/g, "").length < condition.ReqNoOfLoginDigit) {
                    utl.Alert.showErrorMsg('Username should contain minimum of ' + condition.ReqNoOfLoginDigit + ' digit.');
                    return false;
                }
                if (($scope.item.Password.length < condition.MinPwdLength) || ($scope.item.Password.length > condition.MaxPwdLength)) {
                    utl.Alert.showErrorMsg($translate.instant('appmanager.user.invalidpwd.lbl'));
                    return false;
                }
                if (!condition.IsSpecialCharacterAllowedinPwd) {
                    if (/^[a-zA-Z0-9- ]*$/.test($scope.item.Password) == false) {
                        utl.Alert.showErrorMsg($translate.instant('appmanager.user.pwdspecialcharacter.lbl'));
                        return false;
                    }
                }
            }

            return true;
        };

        $scope.getLoginDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.currentcontext.loginsetting = data.Data[0];
                $scope.currentcontext.usernamecriteriamsg = 'Username should contain minimum of ' + $scope.currentcontext.loginsetting.MinLoginNameLength + ' character and should not exceed ' + $scope.currentcontext.loginsetting.MaxLoginNameLength + ' character. It should contain minimum ' + $scope.currentcontext.loginsetting.ReqNoOfLoginDigit + ' digit(s)';
                $scope.currentcontext.pwdcriteriamsg = 'Password should contain minimum of ' + $scope.currentcontext.loginsetting.MinPwdLength + ' character and should not exceed ' + $scope.currentcontext.loginsetting.MaxPwdLength + ' character.';
            }
        };

        $scope.getLoginDetails = function (pageNo) {
            if ($scope.currentcontext.facilityid && $scope.currentcontext.facilityid > 0) {
                var inputData = {
                    Params: [{ Key: 2, Value: $scope.currentcontext.facilityid }]
                };

                var options = {
                    action: 'SystemSettings/facilitysetting/GetFacilitySettings',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getLoginDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        vm.Employeecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Employee Id', field: 'EmployeeId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Id CardNo', field: 'EmployeeIdNo', datatype: 'string', headercls: 'td-id', fieldcls: 'td-id' },
                { header: 'Employee Name', field: 'EmployeeName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Designation', field: 'Designation', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'HRM/Employee/GetEmployees',
            formatdisplay: formatselectedemployee,
            presearch: presearchemployee,
            postsearch: postsearchemployee
        };

        function formatselectedemployee() {
            var selectedItem = vm.Employeecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.EmployeeName].join('  ');
            } else if (vm.Employeecontrolconfig.rowdata) {
                result = [vm.Employeecontrolconfig.rowdata.EmployeeId, vm.Employeecontrolconfig.rowdata.EmployeeIdNo, vm.Employeecontrolconfig.rowdata.EmployeeName,
                vm.Employeecontrolconfig.rowdata.Qualification, vm.Employeecontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            return result;
        }

        function presearchemployee() {
            var query = vm.Employeecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.Employeecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 2, Value: query });
            }

            vm.Employeecontrolconfig.searchparams = inputData;
        }

        function postsearchemployee() {
            for (var idx in vm.Employeecontrolconfig.result) {
                var item = vm.Employeecontrolconfig.result[idx];
                item.EmployeeId = item.Id;
                item.EmployeeIdNo = item.EmployeeIdNo
                item.EmployeeName = item.Title.Description + ' ' + item.FirstName + ' ' + item.LastName;
                item.Qualification = item.Qualification;
                item.Designation = item.DesignationId;
            }
        }

        $scope.getEmployeeCallback = function (scope, data, options, hasError) {
            $scope.item.EmployeeId = data.Id;
            $scope.item.TitleId = data.TitleId;
            $scope.item.FirstName = data.FirstName;
            $scope.item.MiddleName = data.MiddleName;
            $scope.item.LastName = data.LastName;
            $scope.item.Age = data.Age;
            $scope.item.DOB = data.DOB;
            $scope.item.GenderId = data.GenderId;
            $scope.item.NationalityId = data.NationalityId;
            $scope.item.LandLine = data.LandLine;
            $scope.item.Mobile = data.Mobile;
            $scope.item.Email = data.Email;
            $scope.item.LicenseNo = data.LicenseNo;
            $scope.item.LicenseIssueDate = data.LicenseIssueDate;
            $scope.item.LicenseExpiryDate = data.LicenseExpiryDate;
            $scope.item.FacilityId = data.FacilityId;
            $scope.item.DepartmentId = data.DepartmentId;
            $scope.item.MobileAccess = data.MobileAccess;
            $scope.item.LoginPermission = data.LoginPermission;
            $scope.item.TabletAccess = data.TabletAccess;
        };

        $scope.getEmployeeById = function () {
            var options = {
                action: 'HRM/Employee/GetEmployeeById',
                data: { Id: $scope.item.EmployeeId },
                type: 'post',
                onComplete: $scope.getEmployeeCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onDeptSelected = function (selectedItem) {
            $scope.item.SubDepartmentId = selectedItem.Id;
        };

        $scope.deptChange = function () {
            var deptObj = utl.Lookup.getObject($scope.lookup.Department, $scope.item.SubDepartmentId);
            $scope.item.DepartmentId = deptObj.DepartmentId;
            setAssignToDetails();
            $scope.getList();
        };
        $scope.getVirtualsubcategoryCallback = function (scope, res, options, hasError) {
            $scope.VirtualSubCategory = res.Data;
            $scope.item.VirtualCategoryId = $scope.VirtualSubCategory[0].CategoryId;
        };

        $scope.getVirtualsubcategory = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.VirtualSubCategoryId
                },
                ],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualSubCategory/GetVirtualSubCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVirtualsubcategoryCallback
            };

            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

            var facilitydata = $scope.lookup.Facility;
            for (var idx in facilitydata) {
                if (facilitydata[idx].Id > 0) {
                    $scope.item.DistrictId = facilitydata[idx].DistrictId;
                    $scope.item.CityId = facilitydata[idx].CityId;
                    $scope.item.StateId = facilitydata[idx].StateId;
                    $scope.item.CountryId = facilitydata[idx].CountryId;
                }
            }
            $scope.getLoginDetails();
        };

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Department" },
                {
                    "Key": "Department", Request: {
                        Params: [{ Key: 5, Value: 2 },
                        { Key: 14, Value: [-1, $scope.item.FacilityId] }
                        ]
                    }
                },
                { "Key": "DoctorClass" },
                { "Key": "Title" },
                { "Key": "Language" },
                { "Key": "Nationality" },
                { "Key": "UserCategory" },
                { "Key": "Organization" },
                { "Key": "Facility" },
                { "Key": "SubDepartment" },
                { "Key": "Group" },
                { "Key": "ClinicalRole" },
                { "Key": "UserType" },
                { "Key": "Speciality" },
                { "Key": "Gender" },
                {
                    "Key": "ItemCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "ItemSubCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                // { "Key": "ItemCategory" },
                // { "Key": "ItemSubCategory" },
                { "Key": "DoctorShareClass" },
                { "Key": "OPDRoom" },
                { "Key": "DiscountMode" },
                { "Key": "QmsLocation" },
                {
                    "Key": "GstMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                { "Key": "Pincode" },
                { "Key": "VirtualSubCategory" },
                { "Key": "Country" },
                { "Key": "State" },
                { "Key": "city" },
                { "Key": "Team" },
                { "Key": "BillingCounter" },

            ];
            $scope.getLookUp(inputData);
        };


        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
        $scope.getItem();

        $scope.getsubdeptUsers = function () {
            var inputData = [{
                "Key": "SubDepartment",
                Request: {
                    Params: [
                        { Key: 6, Value: $scope.item.DepartmentId },
                        { Key: 5, Value: 2 }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        };
    }

    MultiFaciltyyuserFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();