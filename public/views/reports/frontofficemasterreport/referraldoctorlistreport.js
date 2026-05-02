(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referraldoctorlistreportController', referraldoctorlistreportController);

    function referraldoctorlistreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),

        };

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = [" Referral Code", "Referral Type", "Referral Name", "Qualification", "Phone No", "Email", "PAN No", "Address", "City Name", "State Name"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var refCode = '';
                var refType = '';
                var refName = '';
                var qualifi = '';
                var phNo = '';
                var email = '';
                var panNo = '';
                var address = '';
                var city = '';
                var state = '';

                if (rowArray.ReferralCode) {
                    refCode = rowArray.ReferralCode;
                }
                if (rowArray.ReferralType.Description) {
                    refType = rowArray.ReferralType.Description;
                }
                if (rowArray.ReferralName) {
                    refName = rowArray.ReferralName;
                }
                if (rowArray.Qualification) {
                    qualifi = rowArray.Qualification;
                }
                if (rowArray.PhoneNo) {
                    phNo = rowArray.PhoneNo;
                }

                if (rowArray.Email) {
                    email = rowArray.Email;
                }
                if (rowArray.PANNo) {
                    panNo = rowArray.PANNo;
                }
                if (rowArray.AddressLine1) {
                    address = rowArray.AddressLine1;
                }
                if (rowArray.AddressLine2) {
                    address += ' ' + rowArray.AddressLine2;
                }
                if (rowArray.CityMaster) {
                    if (rowArray.CityMaster.CityName) {
                        city = rowArray.CityMaster.CityName;
                    }
                }
                if (rowArray.StateMaster) {
                    if (rowArray.StateMaster.StateName) {
                        state = rowArray.StateMaster.StateName;
                    }
                }

                csvContent += refCode + ',' + refType + ',' + refName + ',' + qualifi + ',' + phNo + ',' + email + ',' + panNo + ',' + address + ',' + city + ',' + state + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'referraldoctorlist-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.ReferralTypeId },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                ],

            };
            var options = {
                action: "generalmaster/referral/GetReferrals",
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
                    vm.gridConfig.data.push(items);
                }
            }
            if ($scope.currentfilter.ReferralTypeId > 0) {
                $scope.ReferralType = res.Data[0].ReferralType.Description;
            } else {
                $scope.ReferralType = '';
            }
            if ($scope.currentfilter.ActiveStatusId > 0) {
                $scope.Status = res.Data[0].ActiveStatus.Description;
            } else {
                $scope.Status = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.ReferralTypeId },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/referral/GetReferrals',
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
            $state.go('app.ipopreportstab.masterreport')
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    FacilityName: $scope.currentfilter.FacilityName,
                    ReferralType: $scope.ReferralType,
                    Status: $scope.Status
                },
                Params: [
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.ReferralTypeId },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                ],
            };
            var options = {
                action: 'generalmaster/referral/PrintReferraloctorListReport',
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
                field: "ReferralCode",
                displayName: $translate.instant('Referral Code')
            },
            {
                field: "ReferralType.Description",
                displayName: $translate.instant('Referral Type')

            },
            {
                field: "ReferralName",
                displayName: $translate.instant('Referral Name')
            },

            {
                field: "Qualification",
                displayName: $translate.instant('Qualification')
            },
            {
                field: "PhoneNo",
                displayName: $translate.instant('Phone No')
            },
            {
                field: "Email",
                displayName: $translate.instant('Email')
            },
            {
                field: "PANNo",
                displayName: $translate.instant('PAN No')
            },
            {
                field: "FirstName",
                displayName: $translate.instant('Address'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span>{{entity.AddressLine1}}</span>&nbsp;<span>{{entity.AddressLine2}}</span>\
                                        </div>"
            },
            {
                field: "CityMaster.CityName",
                displayName: $translate.instant('City Name')
            },
            {
                field: "StateMaster.StateName",
                displayName: $translate.instant('State Name')
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
            var inputData = [
                { "Key": "ReferralType" },
                { "Key": "ActiveStatus" }
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

    referraldoctorlistreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();