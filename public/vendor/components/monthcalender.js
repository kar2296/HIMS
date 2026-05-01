(function () {
    'use strict';

    angular
        .module('common.utils')
        .controller('monthCalenderCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
            var cvm = this;


            var MonthText = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November",
                "December"];
            var Month = cvm.Month = [];
            var Year = cvm.Year = [];
            var item = cvm.item = [];

            cvm.init = function () {
                //Init logic
                var d = new Date();
                var currentyear = d.getFullYear();
                var currentmonth = d.getMonth();
                for (var i = 0; i < 12; i++) {
                    var _month = {
                        Id: i,
                        Text: MonthText[i]
                    };
                    cvm.Month.push(_month);
                }
                for (var i = (currentyear - 100); i < (currentyear); i++) {
                    var _year = {
                        Id: i,
                        Text: '' + i
                    };
                    cvm.Year.push(_year);
                }
                for (var i = currentyear; i < (currentyear + 100); i++) {
                    var _year = {
                        Id: i,
                        Text: '' + i
                    };
                    cvm.Year.push(_year);
                }
                cvm.Year.sort(function (a, b) { return a.Id - b.Id });
            }

            $scope.$watch('cvm.selectedmonth',
            function (newValue, oldValue) {
                if ( newValue > -1 && newValue < 11) {
                    cvm.selectedmonth =  newValue;
                } else { cvm.selectedmonth =  oldValue; }
            });

            $scope.$watch('cvm.selectedyear',
            function (newValue, oldValue) {
                if ( newValue > 1900 && newValue < 2199) {
                    cvm.selectedyear =  newValue;
                } else { cvm.selectedyear =  oldValue; }
            });

            cvm.monthchange = function (monthchange) {
                cvm.selectedmonth = monthchange.Id;
                $timeout(function () {
					if (cvm.itemchange) {
						cvm.itemchange();
					}
				}, 100);
            }

            cvm.yearchange = function (yearchange) {
                cvm.selectedyear = yearchange.Id;
                $timeout(function () {
					if (cvm.itemchange) {
						cvm.itemchange();
					}
				}, 100);
            }


            //caution : base method, please don't modifiy
            cvm.$onInit = function () {
                $timeout(cvm.init, 100);
            }
        }])
        .component('monthcalender', {
            bindings: {
                selectedmonth: "=",
                selectedyear: "=",
                itemchange: "&"
            },
            controller: 'monthCalenderCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/monthcalender.html'
        })

})();