(function() {
    'use strict';

    angular
        .module('common.utils')
.directive('ngDateObject', ['moment', function(moment) {
    const directive = {
        restrict: "A",
        require: "ngModel",
        priority: 9999,
        link(scope, element, attributes, ngModel) {
            ngModel.$formatters.push(value => {
                let output = null;
                if(value) { output = moment(value).toDate(); }
                return output;
            });

            ngModel.$parsers.push(value => {
                let output = null;
                if(value) { output = moment(value).format(); }
                return output;
            });
        },
    }
    return directive;
}])
.directive('ngTimeObject', ['moment', function(moment) {
    const directive = {
        restrict: "A",
        require: "ngModel",
        priority: 9999,
        link(scope, element, attributes, ngModel) {
            ngModel.$formatters.push(value => {
                let output = null;
                if(value) { output = moment(value, "HH:mm").toDate(); }
                return output;
            });

            ngModel.$parsers.push(value => {
                let output = null;
                if(value) { output = moment(value).format("HH:mm"); }
                return output;
            });
        },
    }
    return directive;
}])
.directive('ngformatdate', function() {
   return {
    restrict: 'AE', //attribute or element
    scope: {
      dateVal: '=',
      timeVal : '=',
      datetimeVal : '='
    },
    template:"<div class='ui-grid-cell-contents'>"+
                "<div ng-if='dateVal'><span>{{dateVal | date : 'dd-MMM-yyyy'}}</span>&nbsp;<span>{{timeVal}}</span></div>"+
                "<div ng-if='datetimeVal' >{{datetimeVal | date : 'dd-MMM-yyyy HH:mm'}}</div>"+
            "</div>",
    replace: true
  }
})
.directive('displaydate', function() {
   return {
    restrict: 'AE', //attribute or element
    scope: {
      dateVal: '=',
      datetimeVal : '='
    },
    template:"<span><span ng-if='dateVal'>{{dateVal | date : 'dd-MMM-yyyy'}}</span>"+
            "<span ng-if='datetimeVal'>{{datetimeVal | date : 'dd-MMM-yyyy HH:mm'}}</span></span>",
    replace: true
  }
})
.directive('displayyesno', function() {
   return {
    restrict: 'AE', //attribute or element
    scope: {
      inputVal: '=',
    },
    template:'<div class="ui-grid-cell-contents"><span ng-if="inputVal==true">Yes</span><span ng-if="!inputVal">No</span></div>',
    replace: true
  }
})
.directive('setFormHeight', function($window){
  return{
    link: function(scope, element, attrs){
        var attributes = attrs;
        var navbar = 55;
        var bredcrumb = 21;
        var formActionBar = 29;
        var footer = 60;
        var others = 35;
        var extraHeight = 0;
        if(attributes.reduceHeight) {
            extraHeight = parseInt(attributes.reduceHeight);
        }
        var heightToReduce = navbar + bredcrumb + formActionBar + footer + others + extraHeight;

        var finalHeight = $window.innerHeight - heightToReduce;
        element.css('height',  finalHeight + 'px');
        //element.height($window.innerHeight/3);
    }
  }
})
.directive('setTabFormHeight', function($window){
  return{
    link: function(scope, element, attrs){
        var attributes = attrs;
        var navbar = 55;
        var bredcrumb = 21;
        var tab = 44;
        var formActionBar = 29;
        var footer = 60;
        var others = 34;
        var extraHeight = 0;
        if(attributes.reduceHeight) {
            extraHeight = parseInt(attributes.reduceHeight);
        }
        var heightToReduce = navbar + bredcrumb + tab + formActionBar + footer + others + extraHeight;

        var finalHeight = $window.innerHeight - heightToReduce;
        element.css('height',  finalHeight + 'px');
        //element.height($window.innerHeight/3);
    }
  }
})
.directive('setTabGridHeight', function($window){
  return{
    link: function(scope, element, attrs){
        var navbar = 55;
        var bredcrumb = 21;
        var tab = 44;
        var filterBar = 43;
        var footer = 60;
        var others = 34;
        var heightToReduce = navbar + bredcrumb + tab + filterBar + footer + others;

        var finalHeight = $window.innerHeight - heightToReduce;
        element.css('height',  finalHeight + 'px');
        //element.height($window.innerHeight/3);
    }
  }
})
.directive('setGridHeight', function($window){
  return{
    link: function(scope, element, attrs){
        var attributes = attrs;
        var navbar = 55;
        var pageheader = 37;
        var filterBar = 43;
        var footer = 60;
        var others = 13;
        var pager = 55;
        var extraHeight = 0;
        if(attributes.reduceHeight) {
            extraHeight = parseInt(attributes.reduceHeight);
        }
        var heightToReduce = navbar + pageheader + filterBar + footer + others + pager + extraHeight;

        var finalHeight = $window.innerHeight - heightToReduce;
        element.css('height',  finalHeight + 'px');
        element.css('max-height',  finalHeight + 'px');
    }
  }
})
.directive('ngMapControl', function() {
    const directive = {
        restrict: "A",
        require: "ngModel",
        priority: 9999,
        scope : true,
        link(scope, element, attributes, ngModel) {
            var attrs = attributes;
            ngModel.$formatters.push(value => {
                let output = [];
                if(value) {
                    for(var idx in value) {
                        var item = value[idx];
                        output.push(item[attrs.mapProp]);
                    }
                }
                return output;
            });

            ngModel.$parsers.push(value => {
                //console.log(attrs);
                let output = [];
                var pivotProp = attrs.pivotProp;
                var mapProp = attrs.mapProp;
                var pivotPropVal = parseInt(attrs.pivotPropVal);
                //var mapPropVal = attrs.mapPropVal;

                for(var idx in value) {
                    var item = value[idx];
                    var a = {};
                    a[pivotProp] = pivotPropVal;
                    a[mapProp] = item;
                    //a[mapProp] = item.Id;
                    //a['FacilityName'] = item.Text;
                    output.push(a);
                }
                return output;
            });
        },
    }
    return directive;
})
.directive('ngMultiTag', function() {
    const directive = {
        restrict: "A",
        require: "ngModel",
        priority: 9999,
        scope : true,
        link(scope, element, attributes, ngModel) {
            var attrs = attributes;
            ngModel.$formatters.push(value => {
                let output = [];
                if(value && value != -1) {
                    let valueArr = value.split(",");
                    for(var idx in valueArr) {
                        var item = parseInt(valueArr[idx]);
                        output.push(item);
                    }
                }
                return output;
            });

            ngModel.$parsers.push(value => {
                let output = "";
                if(value) {
                    output = value.join();
                }
                return output;
            });
        },
    }
    return directive;
})
.directive('comboRequired', function($timeout) {
    return {
		restrict: "A",
		compile: function(tElement, tAttrs) {
			return function(scope, element, attrs) {
				$timeout(function() {
                    var labels = document.querySelectorAll('label[for="' + attrs.name + '"]');

                    var asteriskStr = '<span style="color:red">*</span>'
                    // set asterisk for match(es)
                    if (labels && labels.length > 0 && attrs.type !== 'radio' && attrs.type !== 'checkbox') {
                        for (var i = 0; i < labels.length; i++) {
                            var label = labels[i];
                            label.innerHTML = label.textContent + asteriskStr;
                        }
                    }
                }, 100);
			};
		}
	};
  })
.directive('allowPattern', function() {
    return {
		restrict: "A",
		compile: function(tElement, tAttrs) {
			return function(scope, element, attrs) {
				element.bind("keypress", function(event) {
					var keyCode = event.which || event.keyCode; // I safely get the keyCode pressed from the event.
					var keyCodeChar = String.fromCharCode(keyCode); // I determine the char from the keyCode.

                        // If the keyCode char does not match the allowed Regex Pattern, then don't allow the input into the field.
					if (!keyCodeChar.match(new RegExp(attrs.allowPattern, "i"))) {
                        event.preventDefault();
						return false;
					}

				});
			};
		}
	};
  })
  .directive('alphaNumeric', function() {
    return {
		restrict: "A",
		compile: function(tElement, tAttrs) {
			return function(scope, element, attrs) {
				element.bind("keypress", function(event) {
					var keyCode = event.which || event.keyCode; // I safely get the keyCode pressed from the event.
					var keyCodeChar = String.fromCharCode(keyCode); // I determine the char from the keyCode.

                        // If the keyCode char does not match the allowed Regex Pattern, then don't allow the input into the field.
					if (!keyCodeChar.match(new RegExp("(\\d|[a-z])", "i"))) {
                        event.preventDefault();
						return false;
					}

				});
			};
		}
	};
  })
  .directive('alpha', function() {
    return {
		restrict: "A",
		compile: function(tElement, tAttrs) {
			return function(scope, element, attrs) {
				element.bind("keypress", function(event) {
					var keyCode = event.which || event.keyCode; // I safely get the keyCode pressed from the event.
					var keyCodeChar = String.fromCharCode(keyCode); // I determine the char from the keyCode.

                        // If the keyCode char does not match the allowed Regex Pattern, then don't allow the input into the field.
					if (!keyCodeChar.match(new RegExp("([a-z])", "i"))) {
                        event.preventDefault();
						return false;
					}

				});
			};
		}
	};
  })
  .directive('onEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.onEnter);
                });

                event.preventDefault();
            }
        });
    };
   })
    .filter('filterArrayItems', function () {
        return function (data, queryOptions) {
            //USAGE:
            //    data: [],
            //    queryOptions: [{ search:'',
            //                     field:'' || fields: ['','']
            //                   }]

            var matches = [];

            //no filter defined so bail
            if (!queryOptions) {
                return data;
            }

            //loop through data items and searching for match in given field(s)
            for (var i = 0; i < data.length; i++) {
                var dataItem = data[i];
                var itemFound = false;

                for (var j = 0; j < queryOptions.length; j++) {
                    var query = queryOptions[j]['search'];

                    if (query) {
                        if(angular.isString(query)) {
                            query = query.toLowerCase();
                        }

                        var found = false;
                        //check for single or multiple fields
                        var fields = queryOptions[j]['fields'] || [queryOptions[j]['field']];
                        for (var k = 0; k < fields.length; k++) {
                            var fieldName = fields[k];
                            if (fieldName) {
                                //any one field value matches
                                if (dataItem[fieldName].toString().toLowerCase().indexOf(query) > -1) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        itemFound = found;
                    }
                    else {
                        //if query empty or null, dataItem consider as match
                        itemFound = true;
                    }

                    //any one query item fails, skip to next item
                    if (!itemFound) { break; }
                }
                if (itemFound) {
                    matches.push(dataItem);
                }
            }
            return matches;
        }
    })
    .filter('sortArrayItems', function () {
        return function (data, sortOptions) {

             var sort_by = function(field, reverse, primer){
                var key = primer ?
                    function(x) {return primer(x[field])} :
                    function(x) {return x[field]};

                reverse = !reverse ? 1 : -1;

                return function (a, b) {
                    return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
                }
            }

             // { name: 'Id', direction: 'desc', priority: 1, type : 'int' }
             var sortOption = sortOptions[0];
             var isReverse = sortOption.direction == 'desc' ? true : false;
             var result = data.sort(sort_by(sortOption.name, isReverse, parseInt));

            return result;
        }
    })
  .directive('searchinput', function($compile) {
    return {
        scope: {
            inputval: '=',
            onenterFunc : '=',
      },
      template : '<div class="input-group">\
                    <input type="text" class="form-control" ng-model="inputval">\
                    <span class="input-group-addon">@</span>\
                </div>',
      replace: true,
    }
  })
  .directive('updatepattern', function() {
    return {
       require: "^ngModel",
       link: function(scope,element,attrs,ctrl) {
               scope.$watch(function() {
                  // Evaluate the ngPattern attribute against the current scope
                  return  scope.$eval(attrs.ngPattern);
               },
               function(newval, oldval) {
                  //Get the value from `ngModel`
                  value = ctrl.$viewValue;

                  // And set validity on the model to true if the element
                  // is empty  or passes the regex test
                  if (ctrl.$isEmpty(value) || newval.test(value))   {
                     ctrl.$setValidity('pattern', true);
                     return value;
                  } else {
                     ctrl.$setValidity('pattern', false);
                     return undefined;
                 }
              });
            }
        }
    })
    .directive('displayuser', function() {
    return {
        restrict: 'AE', //attribute or element
        scope: {
            user: '=',
        },
        template:"<div class='ui-grid-cell-contents'> <span ng-if='user.Title && user.Title.Description'>{{user.Title.Description}}&nbsp;</span> <span>{{user.FirstName}}</span>&nbsp;<span>{{user.LastName}}</span></div>",
        replace: true
    }
    })
    .directive('displayuserlbl', function() {
    return {
        restrict: 'AE', //attribute or element
        scope: {
            user: '=',
        },
        template:"<span><span ng-if='user.Title && user.Title.Description'>{{user.Title.Description}}&nbsp;</span> <span>{{user.FirstName}}</span>&nbsp;<span>{{user.LastName}}</span></span>",
        replace: true
    }
    })
    .directive('mandatory', function($timeout) {
    return {
		restrict: "A",
		compile: function(tElement, tAttrs) {
			return function(scope, element, attrs) {
				$timeout(function() {
                    var asteriskStr = '<span style="color:red">*</span>'
                    var labels = document.querySelectorAll('label[for="' + attrs.for + '"]');
                    if(labels && labels.length > 0) {
                        labels[0].innerHTML = labels[0].textContent + asteriskStr;
                    }
                }, 100);
			};
		}
	};
  })
  .directive('uppercase', function() {
    return {
        restrict: "A",
        require: "?ngModel",
        link: function(scope, element, attrs, ngModel) {

            //This part of the code manipulates the model
            ngModel.$parsers.push(function(input) {
                return input ? input.toUpperCase() : "";
            });

            //This part of the code manipulates the viewvalue of the element
            element.css("text-transform","uppercase");
            }
        };
    })
    .filter('propsFilter', function() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function(item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                var prop = keys[i];
                var text = props[prop].toLowerCase();
                if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                    itemMatches = true;
                    break;
                }
                }

                if (itemMatches) {
                out.push(item);
                }
            });
            } else {
            // Let the output be the input untouched
            out = items;
            }

            return out;
        };
        })
        .filter('displaycurrency', function () {
            return function (input) {
                    var currencySymbol = '₹';
                    if (window.clientcode.toLowerCase() == 'swostha')
                    currencySymbol = 'रू ';
                if (!isNaN(parseFloat(input))) {
                    //var output = Number(input).toLocaleString('en-IN');   <-- This method is not working fine in all browsers!
                    input = parseFloat(input).toFixed(2);
                    var result = input.toString().split('.');

                    var lastThree = result[0].substring(result[0].length - 3);
                    var otherNumbers = result[0].substring(0, result[0].length - 3);
                    if (otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

                    if (result.length > 1) {
                        output += "." + result[1];
                    }

                    return currencySymbol + output;
                } else {
                    return currencySymbol + '0.00';
                }
            }
        })
        .directive('stringtonumber', function() {
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    return parseFloat(value);
                });
                }
            };
        })
        .directive('tab', function ($controller) {
            return {
              restrict: 'E',
              scope: {
                currentsection: '=',
              },
              template: '<ng-include src="currentsection.tmpl"></ng-include>',
              link : function(scope, elem, attrs, ctrl, transclude) {
                var locals = { $scope: scope,
                    $element: elem,
                    $attrs: attrs,
                    $uibModalInstance : null
                };

                scope.$watch('currentsection', function(newVal, oldVal) {
                    if(scope.currentsection) {
                        scope.vm = $controller(scope.currentsection.controller, locals);
                    }
                });

                if(scope.currentsection) {
                    scope.vm = $controller(scope.currentsection.controller, locals);
                }
            }
            // controller: function ($scope, $element, $attrs) {
            //     $scope.$watch('currentsection', function(newVal, oldVal) {
            //             console.log($scope.currentsection);
            //         });

            //     if($scope.currentsection) {
            //         var strCtrl = $scope.currentsection.controller +" as vm";
            //         return $controller(strCtrl , {
            //             $scope:   $scope,
            //             $element: $element,
            //             $attrs:   $attrs,
            //             $uibModalInstance : null
            //         });
            //     }
            //   }
            };
          });
})();