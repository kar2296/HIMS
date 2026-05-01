(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('agedisplayCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;

			cvm.init = function () {
				//Init logic
			}

			$scope.$watch('cvm.dob',
				function (newValue) {
					if (newValue) {
						var dateStr = new moment(newValue).format('MM/DD/YYYY')
						cvm.computeAge(dateStr);
					}
				});

			cvm.computeAge = function (dateString) {
				var now = new Date();
				var today = new Date(now.getYear(), now.getMonth(), now.getDate());

				var yearNow = now.getYear();
				var monthNow = now.getMonth();
				var dateNow = now.getDate();

				var dob = new Date(dateString.substring(6, 10),
					dateString.substring(0, 2) - 1,
					dateString.substring(3, 5)
				);

				var yearDob = dob.getYear();
				var monthDob = dob.getMonth();
				var dateDob = dob.getDate();
				var age = {};
				var ageString = "";
				var yearString = "";
				var monthString = "";
				var dayString = "";


				var yearAge = yearNow - yearDob;

				if (monthNow >= monthDob)
					var monthAge = monthNow - monthDob;
				else {
					yearAge--;
					var monthAge = 12 + monthNow - monthDob;
				}

				if (dateNow >= dateDob)
					var dateAge = dateNow - dateDob;
				else {
					monthAge--;
					var dateAge = 31 + dateNow - dateDob;

					if (monthAge < 0) {
						monthAge = 11;
						yearAge--;
					}
				}

				age = {
					years: yearAge,
					months: monthAge,
					days: dateAge
				};

				if (age.years > 1) yearString = "Y";
				else yearString = "Y";
				if (age.months > 1) monthString = "M";
				else monthString = "M";
				if (age.days > 1) dayString = "D";
				else dayString = "D";


				if ((age.years > 0) && (age.months > 0) && (age.days > 0))
					ageString = age.years + yearString ;/* + " " + age.months + monthString + " " + age.days + dayString;*/
				else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
					ageString = age.days + dayString;
				else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
					ageString = age.years + yearString;
				else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
					ageString = age.years + yearString + " " + age.months + monthString;
				else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
					ageString = age.months + monthString + " " + age.days + dayString;
				else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
					ageString = age.years + yearString + " " + age.days + dayString;
				else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
					ageString = age.months + monthString;
				else ageString = "";

				cvm.agestring = ageString;
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('agedisplay', {
			bindings: {
				dob: "="
			},
			controller: 'agedisplayCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/agedisplay.html'
		})

})();