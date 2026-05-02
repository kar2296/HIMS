(function () {
    'use strict';

    angular
        .module('app.pages', ['ui.select', 'ngSanitize'])
        .controller('userfacilityListController', userfacilityListController);

    function userfacilityListController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;

        $scope.item = {};
        $scope.lookup = {};
        $scope.UserFacilityList = [];
        $scope.UserDept = [];
        $scope.Facility = {
            Id: -1,
            Text: "Please Select",
            ReferenceValueCode: -1
        };
        $scope.currentfilter = {
            id: 0,
            facilityname: '',
            facilitycode: ''
        };

        $scope.SelectedFacilityId = utl.Session.getCurrentFacilityId();

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        vm.facilityitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Hospital Code',
                field: 'FacilityCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Hospital Name',
                field: 'FacilityName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/Facility/GetFacilitys',
            formatdisplay: formatselectedfacilityitem,
            presearch: presearchfacilityitem,
            postsearch: postsearchfacilityitem
        };

        function formatselectedfacilityitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.facilityitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.FacilityName;
            } else if (vm.facilityitemcontrolconfig.rowdata) {
                result = vm.facilityitemcontrolconfig.rowdata.FacilityName;
            }
            $scope.item.FacilityCode = selectedItem.FacilityCode;
            $scope.item.FacilityName = selectedItem.FacilityName;
            // $scope.getUserFacilityRoleList($scope.item.FacilityId);
            // $scope.getUserFacilityGroupList($scope.item.FacilityId);
            return result;
        }

        function presearchfacilityitem() {
            var query = vm.facilityitemcontrolconfig.query;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.UserFacilityList
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 5,
                    Value: query
                });
            }

            vm.facilityitemcontrolconfig.searchparams = inputData;
        }

        function postsearchfacilityitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.facilityitemcontrolconfig.result) {
                var item = vm.facilityitemcontrolconfig.result[idx];
                $scope.item.FacilityCode = item.FacilityCode;
                $scope.item.FacilityName = item.FacilityName;
            }
        }

        $scope.UserFacilityDept = [];


        // $scope.getUserFacilityRoleList = function (FacilityId) {
        //     if (FacilityId) {
        //         var inputData = {
        //             Params: [{
        //                 Key: 0,
        //                 Value: FacilityId
        //             }],
        //             PageContext: {
        //                 PageSize: 1000,
        //                 PageNumber: 1
        //             }
        //         }
        //         var options = {
        //             action: 'SystemSettings/role/GetRoleByFacilityId',
        //             data: inputData,
        //             type: 'post',
        //             onComplete: $scope.getUserFacilityRoleListCallback
        //         }
        //         utl.Http.doAction(options);
        //     }
        // };

        // $scope.getUserFacilityRoleListCallback = function (scope, res, options, hasError) {
        //     var CurrRoleIds = '';
        //     utl.Session.setUserFacilityRoles('0');
        //     for (var idx in res) {
        //         var dept = res[idx];
        //         if (!CurrRoleIds) CurrRoleIds = dept.RoleId;
        //         else CurrRoleIds += ',' + dept.RoleId;
        //     }
        //     if (CurrRoleIds) {
        //         utl.Session.setUserFacilityRoles(CurrRoleIds);
        //     }
        // };

        // $scope.getUserFacilityGroupList = function (FacilityId) {
        //     if (FacilityId) {
        //         var inputData = {
        //             Params: [{
        //                 Key: 0,
        //                 Value: FacilityId
        //             }],
        //             PageContext: {
        //                 PageSize: 1000,
        //                 PageNumber: 1
        //             }
        //         }
        //         var options = {
        //             action: 'SystemSettings/group/GetGroupByFacilityId',
        //             data: inputData,
        //             type: 'post',
        //             onComplete: $scope.getUserFacilityGroupListCallback
        //         }
        //         utl.Http.doAction(options);
        //     }
        // };

        // $scope.getUserFacilityGroupListCallback = function (scope, res, options, hasError) {
        //     var CurrGroupIds = '';
        //     utl.Session.setUserFacilityGroups('0');
        //     for (var idx in res) {
        //         var dept = res[idx];
        //         if (!CurrGroupIds) CurrGroupIds = dept.GroupId;
        //         else CurrGroupIds += ',' + dept.GroupId;
        //     }
        //     if (CurrGroupIds) {
        //         utl.Session.setUserFacilityGroups(CurrGroupIds);
        //     }
        // };

        $scope.setCurFacilityIdCallback = function (scope, res, options, hasError) {
            $scope.confirmCallback();
        };

        $scope.setCurFacilityId = function () {
            var options = {
                action: 'SystemSettings/User/setUserCurrentFacility',
                data: {
                    Data: {
                        UserId: utl.Session.getCurrentUserId(),
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        // DepartmentId: utl.Session.getCurrentDepartmentId(),
                    }
                },
                type: 'post',
                onComplete: $scope.setCurFacilityIdCallback
            };
            utl.Http.doAction(options);

        };


        $scope.getFacilityDynSettingCallback = function (scope, res, options, hasError) {
            console.log('Load Facility Settings');
            var item = {};
            utl.Session.setCurrentFacilitySettings('');
            for (var idxft in res.Data) {
                var dataft = res.Data[idxft];
                if (dataft.Category.trim().toLowerCase() != "sms") {
                    var key = dataft.Category + "~" + dataft.PreferenceKey;
                    if (!dataft[key]) {
                        dataft[key] = {
                            Category: dataft.Category,
                            PreferenceKey: dataft.PreferenceKey,
                            PreferenceType: dataft.PreferenceType,
                            PreferenceValue: dataft.PreferenceValue,
                        };
                    }
                    if (!item[key]) {
                        item[key] = dataft[key];
                    }
                }
            }
            utl.Session.setCurrentFacilitySettings(JSON.stringify(item));
        };

        $scope.getFacilityDynSetting = function () {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: utl.Session.getCurrentFacilityId()
                }],
                PageContext: {
                    PageSize: 5000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'SystemSettings/FacilityPreference/GetFacilityPreferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacilityDynSettingCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onDeptSelected = function (SelectedDept) {
            if (SelectedDept && SelectedDept.Text) {
                utl.Session.setCurrentDepartmentName(SelectedDept.Text);
            }
        };

        $scope.saveAndApprove = function () {
            if ($scope.item.FacilityId) {
                utl.Session.setCurrentFacilityName($scope.item.FacilityName);
                utl.Session.setCurrentFacilityCode($scope.item.FacilityCode);
                utl.Session.setCurrentFacilityId($scope.item.FacilityId);
                // utl.Session.setCurrentDepartmentId($scope.item.UserDeptId);
                $scope.setCurFacilityId();
            } else {
                var msg = 'Please Select Any Hospital...';
                utl.Alert.showErrorMsg(msg);
            }
        };

        $scope.setFacility = function (facility) {
            console.log(facility);
            //console.log($scope.Facility);
            if (facility) {
                $scope.item.FacilityId = facility.Id;
                $scope.item.FacilityName = facility.Text;
                $scope.item.FacilityCode = facility.FacilityCode;
            }
            else {
                $scope.item.FacilityId = '';
            }

            // console.log($scope.item);
            // if ($scope.item.FacilityId) {
            //     utl.Session.setCurrentFacilityName($scope.item.FacilityName);
            //     utl.Session.setCurrentFacilityCode($scope.item.FacilityCode);
            //     utl.Session.setCurrentFacilityId($scope.item.FacilityId);
            //     // utl.Session.setCurrentDepartmentId($scope.item.UserDeptId);
            //     $scope.setCurFacilityId();
            // } else {
            //     var msg = 'Please Select Any Hospital...';
            //     utl.Alert.showErrorMsg(msg);
            // }
        };

        $scope.getUserFacilityListCallback = function (scope, data, options, hasError) {
            if (data) {
                if (data.length < 2) {
                    $scope.item.FacilityId = data[0].FacilityId;
                }
            }
            for (var idx in data) {
                $scope.UserFacilityList.push(data[idx].FacilityId);
            }
            if ($scope.UserFacilityList &&
                $scope.UserFacilityList.length == 1) {
                $scope.item.FacilityId = $scope.UserFacilityList[0];
            }

            var facilityname = utl.Session.getCurrentFacilityName();
            var selected_userid = utl.Session.getCurrentUserId();
            var selected_ftlyid = utl.Session.getCurrentFacilityId();
            var selected_deptid = utl.Session.getCurrentDepartmentId();

            if ($scope.UserFacilityList &&
                $scope.UserFacilityList.length == 1) {
                if (facilityname && selected_userid && selected_ftlyid) $scope.item.FacilityId = selected_ftlyid;
            }
            if (facilityname && selected_userid && selected_deptid) $scope.item.UserDeptId = parseInt(selected_deptid);
            $scope.initLookup();
        };

        $scope.getUserFacilityList = function () {
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
                onComplete: $scope.getUserFacilityListCallback
            }
            utl.Http.doAction(options);
        };

        // $scope.getDepartmentListCallback = function (scope, res, options, hasError) {
        //     var UserDept = [];
        //     for (var idx in res.Data) {
        //         var dept = res.Data[idx];
        //         let DeptObj = {
        //             Id: dept.Id,
        //             ReferenceValueCodeId: dept.Id,
        //             InstitutionFilterId: dept.InstitutionFilterId,
        //             FacilityId: dept.FacilityId,
        //             Text: dept.DepartmentName,
        //         };
        //         UserDept.push(DeptObj);
        //     }
        //     $scope.UserFacilityDept = UserDept;


        // };

        // $scope.getDepartmentList = function () {
        //     var curdeptids = utl.Session.getUserDepartments();
        //     var userdeptlist = curdeptids.split(",");
        //     var inputData = {
        //         Params: [{
        //                 Key: 0,
        //                 Value: userdeptlist
        //             },
        //             {
        //                 Key: 5,
        //                 Value: 2
        //             },
        //         ],
        //         PageContext: {
        //             PageSize: 1000,
        //             PageNumber: 1
        //         }
        //     }
        //     var options = {
        //         action: 'SystemSettings/department/GetDepartments',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getDepartmentListCallback
        //     }
        //     utl.Http.doAction(options);
        // };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility", Request: {
                        Params: [{ Key: 0, Value: $scope.UserFacilityList },
                            //  { Key: 7, Value: [$scope.currentfilter.FacilityIdFilter] }
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
        }

        $scope.getUserFacilityList();
    }

    userfacilityListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig', '$timeout']

})();