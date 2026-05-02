/**=========================================================
 * Module: access-login.js
 * Demo for login api
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LoginFormController', LoginFormController);

    LoginFormController.$inject = ['$http', '$state', '$scope', '$location', 'utl', '$cookies', '$translate'];

    function LoginFormController($http, $state, $scope, $location, utl, $cookies, $translate) {
        var vm = this;
        vm.landingState = 'app.userinfo';
        utl.Session.setLandingState(vm.landingState);
        var cookies = $cookies.getAll();
        angular.forEach(cookies, function (v, k) {
            $cookies.remove(k, {
                path: '/'
            });
        });

        $("#divgifLoading").hide();

        //if(vm.loginForm.$valid) {
        activate();
        ////////////////

        function activate() {

            var userTypeId = -1;
            var EmployeeId = -1;

            // bind here all data from the form
            vm.account = {};
            vm.currentcontext = {
                currentlang: ''
            };
            // place the message if something goes wrong
            vm.authMsg = '';

            $scope.login.account.username = '';
            $scope.login.account.password = '';
            vm.currentcontext.currentlang = $translate.use();


            vm.checkUserExistCallback = function (scope, res, options, hasError) {
                if (hasError == true) {
                    vm.authMsg = 'Incorrect credentials.';
                    utl.Alert.showErrorMsg(vm.authMsg);
                    return;
                }
                if (res.Data.LoginPermission == false || res.Data.IsActive == false || (res.Data.ActiveStatusId == 1 || res.Data.ActiveStatusId == 3)) {
                    vm.authMsg = 'No Permission to Login.';
                    utl.Alert.showErrorMsg(vm.authMsg);
                    return;
                }
                vm.checkSessionAndLogin();
            }

            vm.getEncrypedPassword = function () {
                var strIV = CryptoJS.enc.Base64.parse("3ad77bb40d7a3660a89ecaf32466ef97");
                var base64Key = CryptoJS.enc.Base64.parse("3ad77bb40d7a3660a89ecaf32466ef97");
                var encrypted = CryptoJS.AES.encrypt(vm.account.password, base64Key, {
                    iv: strIV
                });
                var ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

                return ciphertext;
            }

            vm.checkUserExist = function () {
                $("#divgifLoading").show();
                var pwd = vm.getEncrypedPassword();
                vm.authMsg = '';
                var options = {
                    action: 'auth/login',
                    data: {
                        UserName: vm.account.username,
                        Password: pwd,
                        ForceLogin: false,
                        CHKUserExist: true,
                        notificationtoken: ''
                    },
                    type: 'post',
                    onComplete: vm.checkUserExistCallback,
                    onError: vm.incorrectData
                };
                utl.Http.doAction(options);
            }

            vm.incorrectData = function (scope, res, options, hasError) {
                $("#divgifLoading").hide();
                vm.authMsg = 'Incorrect credentials.';
                utl.Alert.showErrorMsg(vm.authMsg);
                return;
            }

            vm.checkSessionAndLoginCallback = function (scope, data, options, hasError) {
                if (data < 0) {
                    var confirmOptions = {
                        headingKey: 'common.confirm-modal-header.lbl',
                        messageKey: 'User was already login, Do you want to override the login?',
                        yesKey: 'common.yeskey.lbl',
                        noKey: 'common.nokey.lbl',
                        onSuccessMethod: function () {
                            vm.login(true);
                        }
                    };

                    utl.Dialog.confirmMessage(confirmOptions);
                } else {
                    vm.login(false);
                }
            }

            vm.checkSessionAndLogin = function () {
                var inputData = {
                    UserName: vm.account.username
                }
                var options = {
                    action: 'auth/checkExistingLoginSession',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: vm.checkSessionAndLoginCallback,
                    onError: vm.incorrectData
                };
                utl.Http.doAction(options);
            }

            vm.login = function (forceLogin) {
                vm.authMsg = '';

                var options = {
                    action: 'auth/login',
                    data: {
                        UserName: vm.account.username,
                        Password: vm.getEncrypedPassword(),
                        ForceLogin: forceLogin,
                        notificationtoken: ''
                    },
                    type: 'post',
                    onComplete: vm.loginCallback,
                    onError: vm.incorrectData
                };

                utl.Http.doAction(options);
                /*} else {
                  // set as dirty if the user click directly to login so we show the validation messages
                  vm.loginForm.account_user.$dirty = true;
                  vm.loginForm.account_password.$dirty = true;
                }*/
            }
            if ($location.search() && $location.search().user) {
                vm.authMsg = '';
                const body = {
                    UserName: $location.search().user,
                    Secret: $location.search().secret
                };

                const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(body), 'D(G+KbPeShVmYq3s').toString();
                var options = {
                    action: 'auth/login-with-secret',
                    data: {
                        enc: ciphertext
                    },
                    type: 'post',
                    onComplete: function (scope, res, options, hasError) {
                        if (hasError == true) {
                            vm.authMsg = 'Incorrect credentials.';
                            utl.Alert.showErrorMsg(vm.authMsg);
                            return;
                        }
                        if (res.Data.LoginPermission == false || res.Data.IsActive == false || (res.Data.ActiveStatusId == 1 || res.Data.ActiveStatusId == 3)) {
                            vm.authMsg = 'No Permission to Login.';
                            utl.Alert.showErrorMsg(vm.authMsg);
                            return;
                        }
                        // set values in session
                        if (res && res.Data) {
                            vm.currentcontext.loginresponse = res.Data;
                            vm.IsLABDept = res.Data.IsLABDept;
                            vm.IsRISDept = res.Data.IsRISDept;
                            vm.IsEndoscopy = res.Data.IsEndoscopy;

                            utl.Session.setCurrentFacilityId(res.Data.FacilityId);
                            utl.Session.setMedblazePost(res.Data.IsMedBlazePost);
                            // utl.Session.setCurrentTicketTypeId(res.Data.TicketTypeId);
                            utl.Session.setCurrentFacilityCode(res.Data.FacilityCode);
                            utl.Session.setCurrentOrgId(res.Data.OrganizationId);
                            utl.Session.setCurrentOrgCode(res.Data.OrgCode);
                            utl.Session.setCurrentUserId(res.Data.UserId);
                            utl.Session.setCurrentUserName(res.Data.UserName);
                            utl.Session.setdeptPrint(res.Data.IsDeptWiseLabPrint);
                            // utl.Session.setLogoPath(res.Data.LogoPath);

                            EmployeeId = res.Data.EmployeeId ? parseInt(res.Data.EmployeeId) : -1;
                            utl.Session.setEmployeeId(EmployeeId);
                            utl.Session.setCurrentDepartmentId(res.Data.DepartmentId);

                            utl.Session.set('Session-UserFullName', res.Data.UserFullName);

                            utl.Session.set('Session-DepartmentName', res.Data.DepartmentName);


                            var userGroupId = res.Data.UserGroupId || -1;
                            utl.Session.setUserGroupId(userGroupId);

                            var userDepts = res.Data.DepartmentId;
                            if (res.Data.UserDepartments && res.Data.UserDepartments.length > 0) {
                                for (var idx in res.Data.UserDepartments) {
                                    var item = res.Data.UserDepartments[idx];
                                    userDepts = userDepts + ',' + item.UserDepartmentMap.DepartmentId;
                                }
                                if (res.Data.UserDepartments.length > 1) {
                                    UserSingleDepartment = false;
                                }
                            }
                            utl.Session.setUserDepartments(userDepts);
                        }
                        vm.getTokenForAutoLogin(body.UserName, body.Secret, res.Data);
                        // vm.getToken();
                        $scope.userData = [];
                        $scope.userData = res.Data;
                        computeRoles($scope.userData);

                    }
                    // onComplete: vm.loginCallback,
                    // onError: vm.incorrectData
                };
                utl.Http.doAction(options);
            }
            vm.otpverify = function (isnew) {
                var isnewentry = isnew;
                vm.getselfToken(isnewentry);
            };

            vm.getselfToken = function (isnewentry) {
                var options = {
                    action: 'auth/getClientToken',
                    data: {
                        userName: 'selfuser',
                        password: 'pwd',
                        userList: $scope.userData,
                        isnewEntry: isnewentry
                    },
                    type: 'post',
                    onComplete: vm.getselfTokenData
                };
                utl.Http.doAction(options);
            }

            vm.getselfTokenData = function (scope, data, options, hasError) {
                var IsnewEntry = options.data.isnewEntry;
                if (data.token) {
                    var clientToken = data.token;
                    localStorage.setItem('token', clientToken)
                    $http.defaults.headers.post.Authorization = `bearer ${localStorage.getItem('token')}`;
                    // console.log('token_get', localStorage.getItem('token'))
                    if (IsnewEntry == true) {
                        $state.go('self.otpverify', {
                            isnew: IsnewEntry
                        });
                    } else if (IsnewEntry == false) {
                        $state.go('self.forgotverification', {
                            isnew: IsnewEntry
                        });
                    }
                }
            }

            vm.switchLang = function (lang) {
                $translate.use(lang);
                vm.currentcontext.currentlang = lang;
            };

            vm.getUserFacilityList = function () {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: utl.Session.getCurrentUserId()
                    }],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                }
                var options = {
                    action: 'SystemSettings/User/GetFacilities',
                    data: inputData,
                    type: 'post',
                    onComplete: vm.getUserFacilityListCallback
                };
                utl.Http.doAction(options);
            }

            vm.sendLandingState = function () {
                $("#divgifLoading").show();
                if (userTypeId == 8) { //If usertype is patient, go to patient landing pag
                    if (vm.currentcontext.loginresponse.PatientId)
                        var patientId = vm.currentcontext.loginresponse.PatientId ? parseInt(vm.currentcontext.loginresponse.PatientId) : -1;
                    utl.Session.setPatientPortalPatientId(patientId);
                    $state.go('patientportal.virtualhealthcare');
                } else {
                    $state.go(vm.landingState);
                    // $state.go('app.patientsearch');
                }

            }

            $scope.getUserFacilityNameCallback = function (scope, res, options, hasError) {
                for (var idx in res.Data)
                    utl.Session.setCurrentFacilityName(res.Data[idx].FacilityName);
                if (res.Data[0].LicenseExpiryDate) {
                    if (utl.Formatter.isPastDate(res.Data[0].LicenseExpiryDate)) {
                        vm.authMsg = 'License Expired. Please Contact Support';
                        utl.Alert.showErrorMsg(vm.authMsg);
                        return;
                    }
                }
                vm.sendLandingState();
            };

            vm.getUserFacilityName = function () {
                $("#divgifLoading").show();
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: utl.Session.getCurrentFacilityId()
                    }],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                }
                var options = {
                    action: 'SystemSettings/Facility/GetFacilitys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getUserFacilityNameCallback
                }
                utl.Http.doAction(options);
            };

            vm.getUserFacilityListCallback = function (scope, data, options, hasError) {
                if (data.length > 1) {
                    utl.Modal.open('app.userfacilityselection', {
                        params: {
                            data: null
                        },
                        // confirmCallback: vm.sendLandingState
                        confirmCallback: vm.getUserFacilityName
                    });
                } else {
                    vm.getUserFacilityName();
                }
            };

            vm.loginCallback = function (scope, res, options, hasError) {
                $("#divgifLoading").hide();
                if (hasError == true) {
                    vm.authMsg = 'Incorrect credentials.';
                    utl.Alert.showErrorMsg(vm.authMsg);
                    return;
                }
                if (res.Data.LoginPermission == false || res.Data.IsActive == false || (res.Data.ActiveStatusId == 1 || res.Data.ActiveStatusId == 3)) {
                    vm.authMsg = 'No Permission to Login.';
                    utl.Alert.showErrorMsg(vm.authMsg);
                    return;
                }

                //set values in session
                if (res && res.Data) {
                    // console.log(res.Data);
                    vm.currentcontext.loginresponse = res.Data;
                    // if (res.Data.Facility) {
                    //     if (utl.Formatter.isPastDate(res.Data.Facility.LicenseExpiryDate)) {
                    //         vm.authMsg = 'License Expired. Please Contact Support';
                    //         utl.Alert.showErrorMsg(vm.authMsg);
                    //         return;
                    //     }
                    // }
                    utl.Session.setCurrentFacilityId(res.Data.FacilityId);
                    utl.Session.setMedblazePost(res.Data.IsMedBlazePost);
                    utl.Session.setCurrentItemCategoryId(res.Data.ItemCategoryId);
                    utl.Session.setCurrentItemSubCategoryId(res.Data.ItemSubCategoryId);
                    utl.Session.setCurrentOrgId(res.Data.OrganizationId);
                    utl.Session.setCurrentUserId(res.Data.UserId);
                    utl.Session.setCurrentUserName(res.Data.UserName);
                    userTypeId = res.Data.UserTypeId ? parseInt(res.Data.UserTypeId) : -1;
                    utl.Session.setUserTypeId(userTypeId);
                    EmployeeId = res.Data.EmployeeId ? parseInt(res.Data.EmployeeId) : -1;
                    utl.Session.setEmployeeId(EmployeeId);
                    utl.Session.setCurrentDepartmentId(res.Data.DepartmentId);
                    utl.Session.setCurrentSubDepartmentId(res.Data.SubDepartmentId);
                    utl.Session.set('Session-UserFullName', res.Data.UserFullName);
                    utl.Session.set('Session-DepartmentName', res.Data.DepartmentName);
                    utl.Session.setIsPharmacyDueAllowed(res.Data.IsPharmacyDueAllowed);
                    utl.Session.setIsDueCheck(res.Data.IsDueCheck);
                    utl.Session.setObject('LicenseInfo', res.Data.LicenseInfo);
                    utl.Session.setdeptPrint(res.Data.IsDeptWiseLabPrint);

                    var userGroupId = res.Data.UserGroupId || -1;
                    utl.Session.setUserGroupId(userGroupId);

                    var clinicalRoleId = res.Data.ClinicalRoleId || -1;
                    utl.Session.setClinicalRoleId(userGroupId);

                    var userDepts = res.Data.DepartmentId;
                    if (res.Data.UserDepartments && res.Data.UserDepartments.length > 0) {
                        for (var idx in res.Data.UserDepartments) {
                            var item = res.Data.UserDepartments[idx];
                            userDepts = userDepts + ',' + item.DepartmentId;
                        }
                    }
                    utl.Session.setUserDepartments(userDepts);

                    computeRoles(res.Data);
                }
                vm.getToken();


            }
            vm.getTokenForAutoLogin = function (username, secret, userData) {
                var options = {
                    action: 'auth/getTokenForAutoLogin',
                    data: {
                        userName: username,
                        secret: secret,
                        userList: userData
                    },
                    type: 'post',
                    onComplete: vm.getTokenData
                };
                // console.log(username, secret);
                utl.Http.doAction(options);
            }

            vm.getToken = function () {
                var options = {
                    action: 'auth/getClientToken',
                    data: {
                        userName: vm.account.username,
                        password: vm.account.password,
                        userList: $scope.userData
                    },
                    type: 'post',
                    onComplete: vm.getTokenData
                };
                utl.Http.doAction(options);
            }

            vm.getTokenData = function (scope, data, options, hasError) {
                if (data.token) {
                    var clientToken = data.token;
                    localStorage.setItem('token', clientToken)
                    $http.defaults.headers.post.Authorization = `bearer ${localStorage.getItem('token')}`;
                    // console.log('token_get', localStorage.getItem('token'))
                    $scope.userdata = options.data.userList;
                    vm.getUserFacilityList();
                }
            }

            function computeRoles(res) {

                if (res.Group && res.Group.Roles && res.Group.Roles.length > 0) {
                    var roles = res.Group.Roles;
                    if (roles[0].LandingControl) {
                        vm.landingState = roles[0].LandingControl.SRef;
                        utl.Session.setLandingState(vm.landingState);
                    }

                    var roleCodeList = [];
                    for (var idx in roles) {
                        var role = roles[idx];
                        roleCodeList.push(role.RoleCode);
                    }
                    var roleCodes = roleCodeList.join();
                    utl.Session.setUserRoles(roleCodes);

                    computePrivData(roles);
                }
            }

            function computePrivData(roles) {
                var roleMap = {};
                for (var idx in roles) {
                    var roleObj = roles[idx];
                    for (var jdx in roleObj.RolePrivileges) {
                        var row = roleObj.RolePrivileges[jdx];
                        var role = roleMap[row.RoleCode] = roleMap[row.RoleCode] || {};
                        var objMap = role[row.AccessObjectType] = role[row.AccessObjectType] || {};
                        var actMap = objMap[row.AccessAction] = row.Access === 'allow';
                    }
                }

                // console.log('roleMap');
                // console.log(roleMap);
                utl.Session.setObject('session-roleprivmap', roleMap);
            }
        }
    }
})();