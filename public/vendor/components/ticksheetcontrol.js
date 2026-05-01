(function() {
    'use strict';

    angular
        .module('common.utils')
        .controller('ticksheetcontrolCtrl', ['utl', '$scope', '$timeout', 'uibButtonConfig', function(utl, $scope, $timeout, uibButtonConfig) {
            var cvm = this;

            uibButtonConfig.activeClass = "";

            cvm.list = [];
            cvm.listItemMap = {};
            cvm.listmodel = {};
            cvm.ticksheets = [];
            cvm.currentcontext = {};
            cvm.selectedticksheet;

            $scope.$watch('cvm.config.ticksheetmastertypeid',
                function(newValue) {
                    if (newValue) {
                        cvm.getItems();
                    }
                });

            $scope.$watch('cvm.storeid',
                function(newValue) {
                    if (newValue) {
                        cvm.getTickSheets();
                        cvm.getItems();
                    }
                });


            //ticksheet click
            cvm.ticksheetClick = function(ticksheet) {

            }

            cvm.openTicksheet = function(ticksheetId) {
                ticksheetId = ticksheetId || 0;
                utl.Modal.openFixedDialog('app.orderfavorite', {
                    params: {
                        id: ticksheetId,
                        parent: "txn",
                        ticksheettypeid: cvm.config.ticksheetmastertypeid
                    },
                    confirmCallback: cvm.getTickSheets
                });
            }

            //cvm.saveTickSheets
            cvm.saveTickSheets = function() {
                //console.log(cvm.listmodel);
                cvm.config.selectedlist = [];
                for (var itemId in cvm.listmodel) {
                    var isselected = cvm.listmodel[itemId];
                    if (isselected == true) {
                        var ticksheet = cvm.listItemMap[itemId];
                        cvm.config.selectedlist.push(ticksheet);
                        cvm.listmodel[itemId] = false; //resetting the tick sheet
                    }
                }
                if (cvm.config.selectedlist && cvm.config.selectedlist.length > 0) {
                    cvm.saveclick();
                }
            }


            cvm.caretClicked = function(tsdetail) {
                cvm.config.selecteddetail = tsdetail;
                cvm.addclick();
            }

            cvm.afterget = function(res) {
                cvm.ticksheets = [];
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    if (item.AccessibleTypeId == 1 && (item.UserId == utl.Session.getCurrentUserId() || item.UserId == -1) &&
                        (item.DepartmentId == parseInt(utl.Session.getCurrentDepartmentId()) || item.DepartmentId == -1)) {
                        cvm.ticksheets.push(item);
                    } else if (item.AccessibleTypeId == 2) {
                        cvm.ticksheets.push(item);
                    }
                }
                // cvm.ticksheets = res.Data;

                for (var idx in cvm.ticksheets) {
                    var ticksheet = cvm.ticksheets[idx];
                    ticksheet.groups = [];
                    for (var detailIdx in ticksheet.TickSheetMasterDetails) {
                        var detail = ticksheet.TickSheetMasterDetails[detailIdx];
                        if (ticksheet.groups.indexOf(detail.GroupName) == -1) {
                            ticksheet.groups.push(detail.GroupName);
                        }

                        cvm.listmodel[detail.Id] = false;
                        cvm.listItemMap[detail.Id] = detail;
                    }
                }
                if (!cvm.selectedticksheet && cvm.ticksheets && cvm.ticksheets.length > 0) {
                    cvm.selectedticksheet = cvm.ticksheets[0].Id;
                }
            }

            //get tick sheet list
            cvm.getTickSheetsCallback = function(scope, res, options, hasError) {
                if (!res || !res.Data || res.Data.length == 0) {
                    cvm.getTickSheetMastersByAdmin();
                } else {
                    cvm.afterget(res);
                }
            }
            cvm.getTickSheets = function() {
                var inputData = {
                    Params: [{
                            Key: 5,
                            Value: cvm.config.ticksheetmastertypeid
                        },
                        {
                            Key: 11,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        {
                            Key: 4,
                            Value: 2
                        }

                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                if (cvm.storeid > 0)
                    inputData.Params.push({
                        Key: 9,
                        Value: cvm.storeid
                    });

                if (cvm.config.additionalinfo) {
                    inputData.Params.push({
                        Key: 8,
                        Value: cvm.config.additionalinfo.ServiceRateCategoryId
                    });
                }
                var options = {
                    action: 'clinicalmaster/TickSheetMaster/GetTickSheetMasters',
                    data: inputData,
                    type: 'post',
                    onComplete: cvm.getTickSheetsCallback
                };
                utl.Http.doAction(options);
            }

            //get ticksheet list for admin
            cvm.getTickSheetMastersByAdminCallBack = function(scope, res, options, hasError) {
                cvm.afterget(res);
            }
            cvm.getTickSheetMastersByAdmin = function() {
                var inputData = {
                    Params: [{
                            Key: 5,
                            Value: cvm.config.ticksheetmastertypeid
                        },
                        {
                            Key: 11,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        {
                            Key: 4,
                            Value: 2
                        }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                if (cvm.storeid > 0)
                    inputData.Params.push({
                        Key: 9,
                        Value: cvm.storeid
                    });

                if (cvm.config.additionalinfo) {
                    inputData.Params.push({
                        Key: 8,
                        Value: cvm.config.additionalinfo
                    });
                }

                var options = {
                    action: 'clinicalmaster/TickSheetMaster/GetTickSheetMasters',
                    data: inputData,
                    type: 'post',
                    onComplete: cvm.getTickSheetMastersByAdminCallBack
                };
                utl.Http.doAction(options);
            }

            // $scope.getUserDepartmentCallback = function (scope, data, options, hasError) {
            // 	var userdepts = utl.Session.getCurrentDepartmentId();
            // 	for (var idx in data) {
            // 		var item = data[idx].DepartmentId;
            // 		if (idx == 0) {
            // 			userdepts = item;
            // 		} else {
            // 			userdepts = userdepts + ',' + item;
            // 		}
            // 	}
            // 	cvm.currentcontext.userdepartments = userdepts;
            // 	cvm.getTickSheets();
            // };

            // cvm.getUserDepartments = function () {
            // 	var inputData = {
            // 		Params: [{
            // 			Key: 0,
            // 			Value: utl.Session.getCurrentUserId()
            // 		}]
            // 	};

            // 	var options = {
            // 		action: 'appmanager/User/GetDepartments',
            // 		data: inputData,
            // 		type: 'post',
            // 		onComplete: $scope.getUserDepartmentCallback
            // 	};
            // 	utl.Http.doAction(options);
            // }

            cvm.getItems = function() {
                //Load departments associated to the login user then request ticksheet in dept call back
                cvm.getTickSheets();
            }

            cvm.init = function() {}

            //caution : base method, please don't modifiy
            cvm.$onInit = function() {
                $timeout(cvm.init, 100);
            }
        }])
        .component('ticksheetcontrol', {
            bindings: {
                config: "=",
                storeid: "=",
                addclick: "&",
                saveclick: "&"
            },
            controller: 'ticksheetcontrolCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/ticksheetcontrol.html'
        })

})();