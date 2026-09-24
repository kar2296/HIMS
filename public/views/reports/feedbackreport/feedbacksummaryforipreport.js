(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('feedbacksummaryforipreportController', feedbacksummaryforipreportController);

    function feedbacksummaryforipreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        // Excel icon: export the report table(s) shown on screen.
        $scope.excelDownload = function () {
            if (!utl.Common.exportTableToExcel(null, 'Feedback Summary IP')) {
                utl.Alert.showErrorMsg('Run the report first, then export it to Excel.');
            }
        };
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            RatingId: -1,
        };
        $scope.currentcontext = {
            RatingId: [],
            FeedbackId: [],
        };

        $scope.Items = {
            AllFeedbackName: {},
            AllRating: {}
        };

        $scope.openFilterTab = function () {
            if ($scope.currentfilter.showFilterTab === true) {
                $scope.currentfilter.showFilterTab = false;
            } else {
                $scope.currentfilter.showFilterTab = true;
            }
        }

        var fillEmptyCols = function (colIndexes, cols) {
            for (var cIndex = cols.length; cIndex < colIndexes.length; cIndex++) {
                cols.push({
                    text: ''
                });
            }
        };


        var getRatinglabel = function (key) {
            var vtype = $scope.Items.AllRating[key] || key;
            return vtype;
        };

        var getFeedbackLabel = function (key) {
            var empname = $scope.Items.AllFeedbackName[key] || "";
            return empname;
        };


        var constructTable = function (gItems) {
            var colIndexes = ['Feedbacks'];
            $scope.rows = [];
            for (var sdKey in gItems) {
                $scope.row = {
                    cols: []
                };
                fillEmptyCols(colIndexes, $scope.row.cols);
                $scope.row.cols[0] = {
                    text: getFeedbackLabel(sdKey)
                };

                var total = 0;
                for (var osKey in gItems[sdKey]) {
                    var osIndex = colIndexes.indexOf(osKey);
                    var osTotal = gItems[sdKey][osKey].length;
                    if (osIndex === -1) {
                        colIndexes.push(osKey);
                        osIndex = colIndexes.indexOf(osKey);
                        fillEmptyCols(colIndexes, $scope.row.cols);
                    }
                    $scope.row.cols[osIndex] = {
                        text: osTotal
                    };
                    total += osTotal;
                }

                $scope.rows.push($scope.row);
            }
            var grandtotal = 0;
            for (var idx in $scope.rows) {
                var total = $scope.rows[idx];
                for (var iddx in total.cols)
                    var gtTotal = total.cols[1];
                grandtotal += gtTotal.text;
            }
            $scope.headerRow = {
                cols: []
            };
            for (var cIndex = 0; cIndex < colIndexes.length; cIndex++) {
                $scope.headerRow.cols.push({
                    text: getRatinglabel(colIndexes[cIndex])
                });
            }
            //$scope.rows.splice(0,0, $scope.headerRow);

            for (var rIndex = 0; rIndex < $scope.rows.length; rIndex++) {
                fillEmptyCols(colIndexes, $scope.rows[rIndex].cols);
            }
            return $scope.rows;
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            var sourceData = res.Data;
            $scope.FeedbackData = [];
            for (var jdx in res.Data) {
                var feedback = res.Data[jdx];
                if (feedback.RatingId > 0) {
                    $scope.FeedbackData.push(feedback);
                }
            }
            // $scope.FeedbackData = res.Data;            
            var groupedItems = groupByMulti($scope.FeedbackData, ['FeedbackMasterId', 'RatingId']);
            var table = constructTable(groupedItems);
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.FacilityId
                    // },
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: 1
                    },

                ],
            };

            var options = {
                action: 'emr/PatientFeedbackDetails/GetPatientFeedbackDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.RaisedBy = -1
                $scope.getList();
            }
        };

        var groupByMulti = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.getfeedbackListCallBack = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                $scope.currentcontext.FeedbackId.push(res.Data[idx].Id);
                var id = res.Data[idx].Id;
                var FeedbackName = '';
                if (res.Data[idx].Feedbacks) {
                    FeedbackName = res.Data[idx].Feedbacks;
                }
                var name = FeedbackName;
                $scope.Items.AllFeedbackName[id] = name;
            }
            $scope.getRating();
        }

        $scope.getfeedbackList = function () {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 3,
                        Value: 1
                    },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/FeedbacksMaster/GetFeedbacksMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getfeedbackListCallBack
            };
            utl.Http.doAction(options);
        };


        $scope.getRatingCallback = function (scope, res, options, hasError) {
            for (var idx in res.Rating) {
                $scope.currentcontext.RatingId.push(res.Rating[idx].Id);
                var id = res.Rating[idx].Id;
                var name = res.Rating[idx].Text;
                $scope.Items.AllRating[id] = name;
            }
            $scope.getList();
        }

        $scope.getRating = function (pageNo) {
            var inputData = [{
                    "Key": "Rating",
                    Default: false
                },

            ]

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRatingCallback
            };

            utl.Http.doAction(options);
        };

        $scope.LoadData = function () {
            $scope.getfeedbackList();
        }

        $scope.backtoReport = function () {
            $state.go('app.feedbackreports');
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    FacilityId: $scope.currentfilter.FacilityId,
                },
                Params: [{
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: 1
                    },

                ],
            };
            var options = {
                action: 'emr/PatientFeedbackDetails/PrintPatientFeedbacksummaryforip',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.LoadData();
        }


        $scope.initLookup = function () {
            var inputData = [
                // {
                //     "Key": "Rating", Request: {
                //         Params: [{ Key: 2, Value: 2 },
                //         { Key: 4, Value: [-1, utl.Session.getCurrentFacilityId()] }]
                //     }
                // },
                {
                    "Key": "Rating"
                },

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

    feedbacksummaryforipreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();