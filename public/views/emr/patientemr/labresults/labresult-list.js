(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('labResultViewController', labResultViewController);

    function labResultViewController($scope, $interval, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        vm.orders = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            canshowchart: false,
            selectall: false
        };

        $scope.currentfilter = {
            subdepartmentid: -1,
            fromdate: '',
            todate: utl.Formatter.getCurrentDate(),
        }


        // vm.lineColors = ['#23b7e5'];
        vm.lineColors = ['#00008b'];
        vm.lineOptions = {
            scales: {
                yAxes: [{
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                }]
            }
        };

        // vm.lineLabels = ["14-Jan-2016 20:11", "14-Jan-2016 20:11"];
        // vm.lineSeries = ['Blood Sugar'];
        // vm.lineData = [
        //     [65, 98]
        // ];


        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.currentcontext.analyteid = parseInt(modalConfig.params.analyteid);
            if (modalConfig.params.context) {
                $scope.currentcontext.context = modalConfig.params.context;
            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentcontext.testList = [];

        //getList
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            vm.orderdetails = res.Data;
            //console.log(res.Data);
            var result = res.Data;
            //prepareTestResult();
            var selectedArr = [];

            var finalData = [];
            var headerDataUnsorted = _.uniqBy(result, 'MedValidationdate');
            var headerData = _.sortBy(headerDataUnsorted, 'MedValidationdate');
            //console.log(headerData);
            var groupedData = _.groupBy(result, 'Analytename');
            //console.log(groupedData);

            for (var groupKey in groupedData) {
                var tr = [];
                selectedArr.push(groupKey);

                tr.push({
                    ColVal: groupKey
                });
                tr.push({
                    ColVal: groupedData[groupKey][0].Analyterange
                });
                tr.push({
                    ColVal: groupedData[groupKey][0].AnalyteUOM
                });
                for (var header in headerData) {
                    var td = _.find(groupedData[groupKey], {
                        MedValidationdate: headerData[header].MedValidationdate
                    });
                    var analyteValue = '';
                    if (td) {
                        analyteValue = '<font color="#198FFD">' + td.Resultvalue + '</font>';
                    }
                    if (td && td.QualifierId != 1) {
                        analyteValue = '<font color="red">' + td.Resultvalue + '</font>';
                    }
                    tr.push({
                        ColVal: analyteValue
                    });
                }
                // groupKey = '<font color="#198FFD">' + groupKey + '</font>';
                finalData.push({
                    IsSelected: false,
                    name: groupKey,
                    Record: tr
                });
            }
            for (var header in headerData) {
                headerData[header].Date = utl.Formatter.getDateTimeString(headerData[header].MedValidationdate);
            }
            $scope.currentcontext.groupedData = finalData;
            $scope.currentcontext.headerData = headerData;

            prepareChartData(selectedArr);
        };

        $scope.getList = function () {

            var fromdate = utl.Formatter.getFilterDate($scope.currentfilter.fromdate) || null;
            var todate = utl.Formatter.getFilterDate($scope.currentfilter.todate) + ' 23:59:59' || null;
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                var inputData = {
                    Params: [{
                            Key: 4,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 8,
                            Value: $scope.currentfilter.subdepartmentid
                        },
                        {
                            Key: 9,
                            Value: 5
                        }, //Numerical values
                        {
                            Key: 10,
                            Value: fromdate
                        },
                        {
                            Key: 11,
                            Value: todate
                        }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                if($scope.currentcontext.context=='analyte'){
                    inputData.Params.push({ Key: 36, Value: $scope.currentcontext.analyteid });
                }
                var options = {
                    action: 'lis/patientworkorderdetails/GetPatientWorkorderdetailss',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }

        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        //ChartView
        $scope.viewChart = function () {
            var bselected = false;
            for (var idx in $scope.currentcontext.groupedData) {
                var item = $scope.currentcontext.groupedData[idx];
                if (item.IsSelected) {
                    bselected = true;
                    break;
                }
            }
            if (!bselected) {
                utl.Alert.showErrorMsg('Select Any One Test');
                return;
            }

            var selectedArr = [];
            for (var idx in $scope.currentcontext.groupedData) {
                var item = $scope.currentcontext.groupedData[idx];
                if (item.IsSelected) {
                    selectedArr.push(item.name);
                }
            }
            console.log(selectedArr);
            prepareChartData(selectedArr)
            $scope.currentcontext.canshowchart = true;
        }

        $scope.viewList = function () {
            $scope.currentcontext.canshowchart = false;
        }
        $scope.selectAllItems = function () {
            for (var idx in $scope.currentcontext.groupedData) {
                var row = $scope.currentcontext.groupedData[idx];
                row.IsSelected = $scope.currentcontext.selectall;
            }
        }

        function prepareChartData(selectedArr) {
            var inputItems = vm.orderdetails;
            var groupedData = _.groupBy(inputItems, 'Analytename');
            //console.log(groupedData);
            var result = [];
            for (var groupKey in groupedData) {
                if (selectedArr && selectedArr.indexOf(groupKey) > -1) {
                    var items = groupedData[groupKey];
                    if (items && items.length > 0) {

                        //sort by result entry date
                        items.sort(function compare(a, b) {
                            var dateA = new Date(a.MedValidationdate);
                            var dateB = new Date(b.MedValidationdate);
                            return dateA - dateB;
                        });

                        var newItem = {
                            name: groupKey,
                            range: items[0].Analyterange,
                            uom: items[0].AnalyteUOM
                        };
                        var analyteValues = [];
                        var labelArr = [];
                        for (var idx in items) {
                            var item = items[idx];
                            var resultDate = utl.Formatter.getDateTimeString(item.MedValidationdate);

                            var resultValue = 0;
                            if (item.Resultvalue) {
                                if (isInt(item.Resultvalue)) {
                                    resultValue = parseInt(item.Resultvalue);
                                } else if (isFloat(item.Resultvalue)) {
                                    resultValue = parseFloat(item.Resultvalue);
                                }
                            }
                            analyteValues.push(resultValue);
                            labelArr.push(resultDate);
                        }
                        newItem.lineLabels = labelArr;
                        newItem.lineSeries = [groupKey];
                        newItem.lineData = [analyteValues];
                        result.push(newItem);
                    }
                }
            }
            console.log('chart list');
            console.log(result);
            vm.chartlist = result;
        }

        function isInt(n) {
            return Number(n) == n && n % 1 === 0;
        }

        function isFloat(n) {
            return Number(n) == n && n % 1 !== 0;
        }
        $scope.setFocusTitle = function () {
            if ($scope.currentcontext.pid > 0) {
                $scope.startinterval = $interval(function () {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }
        $scope.callTitleFocus = function () {
            if ($scope.currentcontext.pid > 0) {
                console.log("test print by ");
                var uiSelect = angular.element(document.getElementById('subdept'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
            $interval.cancel($scope.startinterval);
        }
        $scope.setFocusTitle();
        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department"
            }];

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

    labResultViewController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();