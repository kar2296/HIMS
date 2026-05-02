(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('RevenueSummaryByServiceItemController', RevenueSummaryByServiceItemController);

    function RevenueSummaryByServiceItemController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
            ServiceCategoryId: -1
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.GetListCallBack = function(scope, res, options, hasError) {
            $scope.ServiceInfo = res;
            $scope.NetServiceInfo = [];
            $scope.totdoctor = [];
            $scope.opdoctor = [];
            $scope.totopdoctor = [];
            $scope.ipdoctor = [];
            $scope.totipdoctor = [];
            if ($scope.ServiceInfo) {
                var opservicecollection = [];
                var ipservicecollection = [];
                var totalservicecollection = [];
                if ($scope.ServiceInfo.length > 0)
                    opservicecollection = $scope.ServiceInfo[0].Value;

                if ($scope.ServiceInfo.length > 1)
                    ipservicecollection = $scope.ServiceInfo[1].Value;

                if ($scope.ServiceInfo.length > 2)
                    totalservicecollection = $scope.ServiceInfo[2].Value;

                for (var idx in opservicecollection) {
                    var coll = opservicecollection[idx];
                    var OPRevenue = 0;
                    var ServiceName = '';
                    var ServiceCategoryName = '';
                    var Key = '';
                    var OPCount = 0;
                    for (var idx in coll) {
                        ServiceName = coll[idx].ServiceName;
                        ServiceCategoryName = coll[idx].ServiceCategoryName;
                        OPCount = coll[idx].ServiceCount;
                        OPRevenue = coll[idx].NetAmount;
                    }
                    $scope.NetServiceInfo.push({
                        'Key': ServiceName,
                        'ServiceCategoryName': ServiceCategoryName,
                        'OPCount': OPCount,
                        'OPRevenue': OPRevenue,
                    });
                }
                for (var idx in ipservicecollection) {
                    var coll = ipservicecollection[idx];
                    var IPRevenue = 0;
                    var ServiceName = '';
                    var ServiceCategoryName = '';
                    var Key = '';
                    var IPCount = 0;
                    for (var idx in coll) {
                        ServiceName = coll[idx].ServiceName;
                        ServiceCategoryName = coll[idx].ServiceCategoryName;
                        IPCount = coll[idx].ServiceCount;
                        IPRevenue = coll[idx].NetAmount;
                    }
                    Key = ServiceName;

                    var valappended = 0;
                    $scope.NetServiceInfo.forEach(function(item) {
                        if (Key === item.Key) {
                            item.ServiceCategoryName = ServiceCategoryName;
                            item.IPCount = IPCount;
                            item.IPRevenue = IPRevenue;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.NetServiceInfo.push({
                            'Key': ServiceName,
                            'ServiceCategoryName': ServiceCategoryName,
                            'IPCount': IPCount,
                            'IPRevenue': IPRevenue,
                        });
                }
                for (var idx in totalservicecollection) {
                    var coll = totalservicecollection[idx];
                    var TotalRevenue = 0;
                    var ServiceName = '';
                    var ServiceCategoryName = '';
                    var Key = '';
                    var TotalCount = 0;
                    for (var idx in coll) {
                        ServiceName = coll[idx].ServiceName;
                        ServiceCategoryName = coll[idx].ServiceCategoryName;
                        TotalCount = coll[idx].ServiceCount;
                        TotalRevenue = coll[idx].NetAmount;
                    }
                    Key = ServiceName;

                    var valappended = 0;
                    $scope.NetServiceInfo.forEach(function(item) {
                        if (Key === item.Key) {
                            item.ServiceCategoryName = ServiceCategoryName;
                            item.TotalCount = TotalCount;
                            item.TotalRevenue = TotalRevenue;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.NetServiceInfo.push({
                            'Key': ServiceName,
                            'ServiceCategoryName': ServiceCategoryName,
                            'TotalCount': TotalCount,
                            'TotalRevenue': TotalRevenue,
                        });
                }
            }
            $scope.TotOPCount = 0;
            $scope.TotOPRevenue = 0;
            $scope.TotIPCount = 0;
            $scope.TotIPRevenue = 0;
            $scope.NetTotCount = 0;
            $scope.NetTotalRevenue = 0;
            var totOPCount = 0;
            var totOPRevenue = 0;
            var totIPCount = 0;
            var totIPRevenue = 0;
            var netTotCount = 0;
            var netTotalRevenue = 0;
            for (let ix in $scope.NetServiceInfo) {
                let netsummary = $scope.NetServiceInfo[ix];
                if (netsummary.OPCount) {
                    totOPCount += netsummary.OPCount;
                }
                if (netsummary.OPRevenue) {
                    totOPRevenue += netsummary.OPRevenue;
                }
                if (netsummary.IPCount) {
                    totIPCount += netsummary.IPCount;
                }
                if (netsummary.IPRevenue) {
                    totIPRevenue += netsummary.IPRevenue;
                }
                if (netsummary.TotalCount) {
                    netTotCount += netsummary.TotalCount;
                }
                if (netsummary.TotalRevenue) {
                    netTotalRevenue += netsummary.TotalRevenue;
                }
            }
            $scope.TotOPCount = totOPCount;
            $scope.TotOPRevenue = totOPRevenue;
            $scope.TotIPCount = totIPCount;
            $scope.TotIPRevenue = totIPRevenue;
            $scope.NetTotCount = netTotCount;
            $scope.NetTotalRevenue = netTotalRevenue;
        };

        $scope.GetList = function() {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }

            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd HH:mm:ss') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd HH:mm:ss') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    ServiceId: $scope.currentfilter.ServiceId || 0,
                    ServiceCategoryId: $scope.currentfilter.ServiceCategoryId || -1
                },
            };

            var options = {
                action: 'billing/patientbilldetails/GetRevenueServiceItemSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetListCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.SelectedCategory = function(selectedItem) {
            $scope.currentfilter.Category = selectedItem.ServiceCategoryName;
        };
        $scope.print = function() {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd HH:mm:ss') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd HH:mm:ss') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    ServiceId: $scope.currentfilter.ServiceId || 0,
                    ServiceCategoryId: $scope.currentfilter.ServiceCategoryId || -1,
                    ServiceName: $scope.ServiceName,
                    ServiceCategoryName: $scope.currentfilter.Category
                }
            };
            var options = {
                action: 'billing/patientbilldetails/PrintRevenueSummaryByServiceItem',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            $scope.ServiceName = result;
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
            }
        }


        $scope.onenter = function(data) {
            if (data == undefined) {
                $scope.currentfilter.ServiceId = 0;
                // $scope.GetList();
            }
        };
        $scope.backtoReport = function() {
            $state.go('app.billingreportstab.revenuereport')
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.GetList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ServiceCategory" }
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
    RevenueSummaryByServiceItemController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();