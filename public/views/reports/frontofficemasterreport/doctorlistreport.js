(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorListReportController', DoctorListReportController);

    function DoctorListReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),

        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Name", "DOB", "Qualification", "Department", "User Name", "Group Name", "Mobile", "Designation", "License No", "Surgeon", "Aneasthisist"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var name = '';
                var dob = '';
                var qualify = '';
                var dept = '';
                var user = '';
                var grp = '';
                var mobile = '';
                var design = '';
                var license = '';
                var surgeon = '';
                var aneasthisist = '';

                if (rowArray.Title.Description) {
                    name = rowArray.Title.Description;
                }
                if (rowArray.FirstName) {
                    name += ' ' + rowArray.FirstName;
                }
                if (rowArray.LastName) {
                    name += ' ' + rowArray.LastName;
                }
                if (rowArray.DOB) {
                    dob = (rowArray.DOB);
                }
                if (rowArray.Qualification) {
                    qualify = rowArray.Qualification;
                }
                if (rowArray.Department.DepartmentName) {
                    dept = rowArray.Department.DepartmentName;
                }
                if (rowArray.UserName) {
                    user = rowArray.UserName;
                }
                if (rowArray.Group.GroupName) {
                    grp = rowArray.Group.GroupName;
                }
                if (rowArray.Mobile) {
                    mobile = rowArray.Mobile;
                }
                if (rowArray.Designation) {
                    design = rowArray.Designation;
                }
                if (rowArray.LicenseNo) {
                    license = rowArray.LicenseNo;
                }
                if (rowArray.Aneasthisist) {
                    surgeon = rowArray.Aneasthisist;
                }
                if (rowArray.Surgeon) {
                    aneasthisist = rowArray.Surgeon;
                }
                qualify = qualify.replace(/,/g, " ");
                qualify = qualify.replace(/ /g, " ");

                dept = dept.replace(/,/g, " ");
                dept = dept.replace(/ /g, " ");

                user = user.replace(/,/g, " ");
                user = user.replace(/ /g, " ");

                grp = grp.replace(/,/g, " ");
                grp = grp.replace(/ /g, " ");

                design = design.replace(/,/g, " ");
                design = design.replace(/ /g, " ");


                csvContent += name + ',' + dob + ',' + qualify + ',' + dept + ',' + user + ',' + grp + ',' + mobile + ',' + design + ',' + license + ',' + surgeon + ',' + aneasthisist + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'doctorlist-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.UserGroupId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.DepartmentId
                    }
                ],

            };
            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            $scope.Aneasthisist = '';
            $scope.Surgeon = '';
            var item = res.Data;
            if (item.length > 0) {
                for (var idx in item) {
                    var items = item[idx];
                    if (items.IsAnaesthisist == true) {
                        items.Aneasthisist = 'Yes';
                    }
                    if (items.IsAnaesthisist == false) {
                        items.Aneasthisist = 'No';
                    }
                    if (items.IsSurgeon == true) {
                        items.Surgeon = 'Yes';
                    }
                    if (items.IsSurgeon == false) {
                        items.Surgeon = 'No';
                    }
                    vm.gridConfig.data.push(items);
                }
            }
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
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.UserGroupId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.DepartmentId
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
            // $state.go('app.ipopreportstab.masterreport')
            if ($scope.Context == 'doctorreport') {
                $state.go('app.doctorreport');
            }
            else{
                $state.go('app.nursingreport');
            }
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    FacilityName: $scope.currentfilter.FacilityName,
                    Type: $scope.Type,
                    GroupName: $scope.GroupName
                },
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: 2
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
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],
            };
            var options = {
                action: 'SystemSettings/user/PrintDoctorListReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
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
                    field: "Mobile",
                    displayName: $translate.instant('reports.mobnum.lbl')
                },
                {
                    field: "Designation",
                    displayName: $translate.instant('reports.designation.lbl')
                },
                {
                    field: "LicenseNo",
                    displayName: $translate.instant('reports.licenseno.lbl')
                },
                {
                    field: "Aneasthisist",
                    displayName: $translate.instant('reports.surgeon.lbl')
                },
                {
                    field: "Surgeon",
                    displayName: $translate.instant('reports.aneasthisist.lbl')
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
                    "Key": "Group"
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "ActiveStatus"
                }
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

    DoctorListReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();