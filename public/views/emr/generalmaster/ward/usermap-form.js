(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('wardmasteruserFormController', wardmasteruserFormController);

    function wardmasteruserFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.selectediteminfo = {};
        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.wardname = $stateParams.wardname;

        $scope.addUsers = function() {
            var item = {
                Id: 0,
                WardId: $scope.currentcontext.id,
                UserId: $scope.item.UserId,
                UserTypeId: $scope.item.UserTypeId,
                Status: 1
            };
            $scope.saveItem();
        }

        $scope.getList = function() {
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.item.UserId },
                        { Key: 3, Value: $scope.currentcontext.id },
                        { Key: 4, Value: $scope.item.UserTypeId },
                    ]
                };

                var options = {
                    action: 'generalmaster/WardUserMap/GetWardUserMaps',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            } else {
                $state.go('app.wardtab.detail', { id: 0 });
            }
        }

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
            $scope.item.UserId = 0;
            $scope.item.UserTypeId = 0;
        };

        $scope.backToList = function() {
            $state.go('app.wardtab.detail');
        };
        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/WardUserMap/AddWardUserMap';

            var item = {
                Id: 0,
                WardId: $scope.currentcontext.id,
                WardName: $scope.currentcontext.wardname,
                UserId: $scope.item.UserId,
                FacilityId: $scope.item.FacilityId,
                UserTypeId: $scope.item.UserTypeId,
                Status: 1
            };

            var options = {
                action: actionName,
                data: { Data: item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            if (item.UserId > 0)
                utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function() {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        }

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'generalmaster/WardUserMap/DeleteWardUserMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.User.UserName);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.wardmastertab.facility.lbl') },
                { field: "UserType.Description", displayName: $translate.instant('generalmaster.wardmastertab.usertype.lbl') },
                {
                    field: "User.UserName",
                    displayName: $translate.instant('generalmaster.wardmastertab.username.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<span >{{entity.User.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.User.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.User.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                  <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            data: $scope.gridData
        };

        $scope.userChange = function(selectedItem) {
            var userObj = utl.Lookup.getObject($scope.lookup.User, $scope.item.UserId);
            $scope.item.UserTypeId = userObj.UserTypeId;
            $scope.item.UserName = selectedItem.Text;
        }

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
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
                $scope.item.UserTypeId = selectedItem.UserTypeId;
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.FacilityId },
                    { Key: 3, Value: $scope.item.UserTypeId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.item.UserTypeId) {
                inputData.Params.push({ Key: 3, Value: $scope.item.UserTypeId });
            }
            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            });
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "UserType" },
                // {
                //     "Key": "User",
                //     Request: {
                //         Params: [{
                //             Key: 5,
                //             Value: 2
                //         }]
                //     }
                // },
                { "Key": "RequestType" }
            ];
            $scope.getLookUp(inputData);

        }
        $scope.getLookUp = function(inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
        $scope.getList();
        $scope.getFacilityUsers = function() {
            // $scope.item.UserId = -1;
            // var inputData = [{
            //     "Key": "User",
            //     Request: {
            //         Params: [
            //             { Key: 2, Value: $scope.item.FacilityId || -1 },
            //             { Key: 3, Value: $scope.item.UserTypeId || -1 },
            //             { Key: 5, Value: 2 }
            //         ]
            //     }
            // }];
            // $scope.getLookUp(inputData);
        }
    }

    wardmasteruserFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();