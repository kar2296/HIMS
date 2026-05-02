(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('UserMasterReportController', UserMasterReportController);

    function UserMasterReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),

        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Name", "DOB", "Qualification", "Department", "User Name", "Group Name", "Phone Number", "Mobile", "Designation"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var name = '';
                var dob = '';
                var qualification = '';
                var dept = '';
                var userName = '';
                var groupName = '';
                var phoneNum = '';
                var mobile = '';
                var design = '';

                if (rowArray.Title) {
                    if (rowArray.Title.Description) {
                        name = rowArray.Title.Description;
                    }
                }
                if (rowArray.FirstName) {
                    name += ' ' + rowArray.FirstName;
                }
                if (rowArray.LastName) {
                    name += ' ' + rowArray.LastName;
                }

                if (rowArray.DOB) {
                    dob = rowArray.DOB;
                }
                if (rowArray.Qualification) {
                    qualification = rowArray.Qualification;
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        dept = rowArray.Department.DepartmentName;
                    }
                }
                if (rowArray.UserName) {
                    userName = rowArray.UserName;
                }
                if (rowArray.Group) {
                    if (rowArray.Group.GroupName) {
                        groupName = rowArray.Group.GroupName;
                    }
                }
                if (rowArray.LandLine) {
                    phoneNum = rowArray.LandLine;
                }
                if (rowArray.Mobile) {
                    mobile = rowArray.Mobile;
                }
                if (rowArray.Designation) {
                    design = rowArray.Designation;
                }

                csvContent += name + ',' + dob + ',' + qualification + ',' + dept + ',' + userName + ',' + groupName + ',' + phoneNum + ',' + mobile + ',' + design + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'usermaster-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.UserTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.UserGroupId
                    },
                    { Key: 6, Value: $scope.currentfilter.DepartmentId },
                    {
                        Key: 5,
                        Value: 2
                    }
                ],

            };
            var options = {
                action: "SystemSettingsuser/GetUsers",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.UserTypeId > 0) {
                $scope.Type = res.Data[0].UserType.Description;
            } else {
                $scope.Type = '';
            }
            if ($scope.currentfilter.UserGroupId > 0) {
                $scope.GroupName = res.Data[0].Group.GroupName;
            } else {
                $scope.GroupName = '';
            }
            if ($scope.currentfilter.DepartmentId > 0) {
                $scope.DepartmentName = res.Data[0].Department.DepartmentName;
            } else {
                $scope.DepartmentName = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.UserTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.UserGroupId
                    },
                    { Key: 6, Value: $scope.currentfilter.DepartmentId },
                    {
                        Key: 5,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    FacilityName: $scope.currentfilter.FacilityName,
                    Type: $scope.Type,
                    GroupName: $scope.GroupName,
                    DepartmentName: $scope.DepartmentName
                },
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.UserTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.UserGroupId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                ],
            };
            var options = {
                action: 'SystemSettings/user/PrintUserMasterReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.name.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Title && entity.Title.Description'>{{entity.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.FirstName}}</span>&nbsp;<span>{{entity.LastName}}</span>\
                                        </div>"
            },
            {
                field: "DOB",
                displayName: $translate.instant('reports.dob.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DOB | date : 'dd-MMM-yyyy'}} </span>" + "</div>"
            },
            {
                field: "Qualification",
                displayName: $translate.instant('reports.qualification.lbl')

            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },

            {
                field: "UserName",
                displayName: $translate.instant('reports.username.lbl')
            },
            {
                field: "Group.GroupName",
                displayName: $translate.instant('reports.groupname.lbl')
            },
            {
                field: "LandLine",
                displayName: $translate.instant('reports.phonenum.lbl')
            },
            {
                field: "Mobile",
                displayName: $translate.instant('reports.mobnum.lbl')
            },
            {
                field: "Designation",
                displayName: $translate.instant('reports.designation.lbl')
            },

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
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "UserType"
            },
            {
                "Key": "Group"
            },
            { "Key": "Department" },
            ]
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

    UserMasterReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();