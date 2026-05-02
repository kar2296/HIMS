(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('userwisecollectionsummaryController', userwisecollectionsummaryController);

    function userwisecollectionsummaryController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.getListCallBack = function (scope, res, options, hasError) {
            $scope.AllCollection = res;
            $scope.UserCollection = [];
            $scope.NetUserCollection = [];
            if ($scope.AllCollection) {
                var opusercollection = [];
                var opduecollection = [];
                var opuserrefund = [];
                var ipusercollection = [];
                var ipduecollection = [];
                var ipuserrefund = [];
                if ($scope.AllCollection.length > 0) {
                    opusercollection = $scope.AllCollection[0].Value;
                }
                if ($scope.AllCollection.length > 1) {
                    ipusercollection = $scope.AllCollection[1].Value;
                }
                if ($scope.AllCollection.length > 2) {
                    opduecollection = $scope.AllCollection[2].Value;
                }
                if ($scope.AllCollection.length > 3) {
                    ipduecollection = $scope.AllCollection[3].Value;
                }
                if ($scope.AllCollection.length > 4) {
                    opuserrefund = $scope.AllCollection[4].Value;
                }
                if ($scope.AllCollection.length > 5) {
                    ipuserrefund = $scope.AllCollection[5].Value;
                }

                for (var idx in opusercollection) {
                    var usercol = opusercollection[idx];
                    var Key = '';
                    var OPCashAmt = 0;
                    var OPCardAmt = 0;
                    var OPOtherAmt = 0;
                    var OPUpiAmt = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].OPCashAmount) {
                            OPCashAmt = usercol[ix].OPCashAmount;
                        }
                        if (usercol[ix].OPCardAmount) {
                            OPCardAmt = usercol[ix].OPCardAmount;
                        }
                        if (usercol[ix].OPOtherAmount) {
                            OPOtherAmt = usercol[ix].OPOtherAmount;
                        }
                        if (usercol[ix].OPUpiAmount) {
                            OPUpiAmt = usercol[ix].OPUpiAmount;
                        }
                        Key = $scope.UserName;
                        OPCashAmt = OPCashAmt;
                        OPCardAmt = OPCardAmt;
                        OPOtherAmt = OPOtherAmt;
                        OPUpiAmt = OPUpiAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCashAmt': OPCashAmt,
                            'OPCardAmt': OPCardAmt,
                            'OPOtherAmt': OPOtherAmt,
                            'OPUpiAmt': OPUpiAmt,
                        }
                    })

                }
                for (var idx in opduecollection) {
                    var usercol = opduecollection[idx];
                    var Key = '';
                    var OPDueAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].OPDueAmount) {
                            OPDueAmt = usercol[ix].OPDueAmount;
                        }
                        Key = $scope.UserName;
                        OPDueAmt = OPDueAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.OPDueAmt = OPDueAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'OPDueAmt': OPDueAmt
                            }
                        });

                }
                for (var idx in opuserrefund) {
                    var usercol = opuserrefund[idx];
                    var Key = '';
                    var OPCashRefundAmt = 0;
                    var OPOtherRefundAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].OPCashRefundAmount) {
                            OPCashRefundAmt = usercol[ix].OPCashRefundAmount;
                        }
                        if (usercol[ix].OPOtherRefundAmount) {
                            OPOtherRefundAmt = usercol[ix].OPOtherRefundAmount;
                        }
                        Key = $scope.UserName;
                        OPCashRefundAmt = OPCashRefundAmt;
                        OPOtherRefundAmt = OPOtherRefundAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.OPCashRefundAmt = OPCashRefundAmt;
                            item.Value.OPOtherRefundAmt = OPOtherRefundAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'OPCashRefundAmt': OPCashRefundAmt,
                                'OPOtherRefundAmt': OPOtherRefundAmt
                            }
                        });

                }

                for (var idx in ipusercollection) {
                    var usercol = ipusercollection[idx];
                    var Key = '';
                    var IPCashAmt = 0;
                    var IPCardAmt = 0;
                    var IPOtherAmt = 0;
                    var IPUpiAmt = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].IPCashAmount) {
                            IPCashAmt = usercol[ix].IPCashAmount;
                        }
                        if (usercol[ix].IPCardAmount) {
                            IPCardAmt = usercol[ix].IPCardAmount;
                        }
                        if (usercol[ix].IPOtherAmount) {
                            IPOtherAmt = usercol[ix].IPOtherAmount;
                        }
                        if (usercol[ix].IPUpiAmount) {
                            IPUpiAmt = usercol[ix].IPUpiAmount;
                        }
                        Key = $scope.UserName;
                        IPCashAmt = IPCashAmt;
                        IPCardAmt = IPCardAmt;
                        IPOtherAmt = IPOtherAmt;
                        IPUpiAmt = IPUpiAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }

                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.IPCashAmt = IPCashAmt;
                            item.Value.IPCardAmt = IPCardAmt;
                            item.Value.IPOtherAmt = IPOtherAmt;
                            item.Value.IPUpiAmt = IPUpiAmt;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'IPCashAmt': IPCashAmt,
                                'IPCardAmt': IPCardAmt,
                                'IPOtherAmt': IPOtherAmt,
                                'IPUpiAmt': IPUpiAmt,
                            }
                        })

                }
                for (var idx in ipduecollection) {
                    var usercol = ipduecollection[idx];
                    var Key = '';
                    var IPDueAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].IPDueAmount) {
                            IPDueAmt = usercol[ix].IPDueAmount;
                        }
                        Key = $scope.UserName;
                        IPDueAmt = IPDueAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.IPDueAmt = IPDueAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'IPDueAmt': IPDueAmt
                            }
                        });

                }
                for (var idx in ipuserrefund) {
                    var usercol = ipuserrefund[idx];
                    var Key = '';
                    var IPCashRefundAmt = 0;
                    var IPOtherRefundAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].IPCashRefundAmount) {
                            IPCashRefundAmt = usercol[ix].IPCashRefundAmount;
                        }
                        if (usercol[ix].IPOtherRefundAmount) {
                            IPOtherRefundAmt = usercol[ix].IPOtherRefundAmount;
                        }
                        Key = $scope.UserName;
                        IPCashRefundAmt = IPCashRefundAmt;
                        IPOtherRefundAmt = IPOtherRefundAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.IPCashRefundAmt = IPCashRefundAmt;
                            item.Value.IPOtherRefundAmt = IPOtherRefundAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'IPCashRefundAmt': IPCashRefundAmt,
                                'IPOtherRefundAmt': IPOtherRefundAmt
                            }
                        });

                }

                for (var idx in $scope.UserCollection) {
                    var collectiondetails = $scope.UserCollection[idx];
                    var usercollect = {
                        Key: collectiondetails.Key,
                        OPCashAmt: collectiondetails.Value.OPCashAmt,
                        OPCardAmt: collectiondetails.Value.OPCardAmt,
                        OPOtherAmt: collectiondetails.Value.OPOtherAmt,
                        OPUpiAmt: collectiondetails.Value.OPUpiAmt,
                        OPDueAmt: collectiondetails.Value.OPDueAmt,
                        OPCashRefundAmt: collectiondetails.Value.OPCashRefundAmt,
                        OPOtherRefundAmt: collectiondetails.Value.OPOtherRefundAmt,
                        NetOPCollection: ((collectiondetails.Value.OPCashAmt || 0) + (collectiondetails.Value.OPCardAmt || 0) +
                            (collectiondetails.Value.OPOtherAmt || 0) + (collectiondetails.Value.OPUpiAmt || 0) +
                            (collectiondetails.Value.OPDueAmt || 0)) - ((collectiondetails.Value.OPCashRefundAmt || 0) +
                                (collectiondetails.Value.OPOtherRefundAmt || 0)),
                        IPCashAmt: collectiondetails.Value.IPCashAmt,
                        IPCardAmt: collectiondetails.Value.IPCardAmt,
                        IPOtherAmt: collectiondetails.Value.IPOtherAmt,
                        IPUpiAmt: collectiondetails.Value.IPUpiAmt,
                        IPDueAmt: collectiondetails.Value.IPDueAmt,
                        IPCashRefundAmt: collectiondetails.Value.IPCashRefundAmt,
                        IPOtherRefundAmt: collectiondetails.Value.IPOtherRefundAmt,
                        NetIPCollection: ((collectiondetails.Value.IPCashAmt || 0) + (collectiondetails.Value.IPCardAmt || 0) +
                            (collectiondetails.Value.IPOtherAmt || 0) + (collectiondetails.Value.IPUpiAmt || 0) +
                            (collectiondetails.Value.IPDueAmt || 0)) - ((collectiondetails.Value.IPCashRefundAmt || 0) +
                                (collectiondetails.Value.IPOtherRefundAmt || 0)),
                        OverallCollection: ((collectiondetails.Value.OPCashAmt || 0) + (collectiondetails.Value.OPCardAmt || 0) +
                            (collectiondetails.Value.OPOtherAmt || 0) + (collectiondetails.Value.OPUpiAmt || 0) +
                            (collectiondetails.Value.OPDueAmt || 0) + (collectiondetails.Value.IPCashAmt || 0) +
                            (collectiondetails.Value.IPCardAmt || 0) + (collectiondetails.Value.IPOtherAmt || 0) +
                            (collectiondetails.Value.IPUpiAmt || 0) + (collectiondetails.Value.IPDueAmt || 0)) -
                            ((collectiondetails.Value.OPCashRefundAmt || 0) + (collectiondetails.Value.OPOtherRefundAmt || 0) +
                                (collectiondetails.Value.IPCashRefundAmt || 0) + (collectiondetails.Value.IPOtherRefundAmt || 0))
                    };
                    $scope.NetUserCollection.push(usercollect);
                }
            }

            var TotOPCashAmt = 0;
            var TotOPCardAmt = 0;
            var TotOPOtherAmt = 0;
            var TotOPUpiAmt = 0;
            var TotOPDueAmt = 0; 
            var TotOPCashRefundAmt = 0;
            var TotOPOtherRefundAmt = 0;
            var TotNetOPCollection = 0;
            var TotIPCashAmt = 0;
            var TotIPCardAmt = 0;
            var TotIPOtherAmt = 0;
            var TotIPUpiAmt = 0;
            var TotIPDueAmt = 0; 
            var TotIPCashRefundAmt = 0;
            var TotIPOtherRefundAmt = 0;
            var TotNetIPCollection = 0;
            var TotalNetCollection = 0;

            for (var jdx in $scope.NetUserCollection) {
                var netcollection = $scope.NetUserCollection[jdx];
                TotOPCashAmt = TotOPCashAmt + (netcollection.OPCashAmt || 0);
                TotOPCardAmt = TotOPCardAmt + (netcollection.OPCardAmt || 0);
                TotOPOtherAmt = TotOPOtherAmt + (netcollection.OPOtherAmt || 0);
                TotOPUpiAmt = TotOPUpiAmt + (netcollection.OPUpiAmt || 0);
                TotOPDueAmt = TotOPDueAmt + (netcollection.OPDueAmt || 0);
                TotOPCashRefundAmt = TotOPCashRefundAmt + (netcollection.OPCashRefundAmt || 0);
                TotOPOtherRefundAmt = TotOPOtherRefundAmt + (netcollection.OPOtherRefundAmt || 0);
                TotNetOPCollection = TotNetOPCollection + (netcollection.NetOPCollection || 0);
                TotIPCashAmt = TotIPCashAmt + (netcollection.IPCashAmt || 0);
                TotIPCardAmt = TotIPCardAmt + (netcollection.IPCardAmt || 0);
                TotIPOtherAmt = TotIPOtherAmt + (netcollection.IPOtherAmt || 0);
                TotIPUpiAmt = TotIPUpiAmt + (netcollection.IPUpiAmt || 0);
                TotIPDueAmt = TotIPDueAmt + (netcollection.IPDueAmt || 0);
                TotIPCashRefundAmt = TotIPCashRefundAmt + (netcollection.IPCashRefundAmt || 0);
                TotIPOtherRefundAmt = TotIPOtherRefundAmt + (netcollection.IPOtherRefundAmt || 0);
                TotNetIPCollection = TotNetIPCollection + (netcollection.NetIPCollection || 0);
                TotalNetCollection = TotalNetCollection + (netcollection.OverallCollection || 0);
            }
            $scope.TotOPCashAmt = TotOPCashAmt;
            $scope.TotOPCardAmt = TotOPCardAmt;
            $scope.TotOPOtherAmt = TotOPOtherAmt;
            $scope.TotOPUpiAmt = TotOPUpiAmt;
            $scope.TotOPDueAmt = TotOPDueAmt; 
            $scope.TotOPCashRefundAmt = TotOPCashRefundAmt;
            $scope.TotOPOtherRefundAmt = TotOPOtherRefundAmt;
            $scope.TotNetOPCollection = TotNetOPCollection;
            $scope.TotIPCashAmt = TotIPCashAmt;
            $scope.TotIPCardAmt = TotIPCardAmt;
            $scope.TotIPOtherAmt = TotIPOtherAmt;
            $scope.TotIPUpiAmt = TotIPUpiAmt;
            $scope.TotIPDueAmt = TotIPDueAmt; 
            $scope.TotIPCashRefundAmt = TotIPCashRefundAmt;
            $scope.TotIPOtherRefundAmt = TotIPOtherRefundAmt;
            $scope.TotNetIPCollection = TotNetIPCollection;
            $scope.TotalNetCollection = TotalNetCollection;
        }

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }

            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    UserId: $scope.currentfilter.UserId || 0,
                },
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetUserWiseCollectionCashier',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    UserId: $scope.currentfilter.UserId || 0,
                }
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintUserWiseCollectionSummaryCashier',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.currentfilter.UserId = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.opinvoicebillingreport')
        };

    }
    userwisecollectionsummaryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();