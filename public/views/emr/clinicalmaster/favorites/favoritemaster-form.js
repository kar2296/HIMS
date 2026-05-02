(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('favoriteMasterFormController', favoriteMasterFormController);

    function favoriteMasterFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            favoritedetailid: -1,
            UserId: utl.Session.getCurrentUserId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.gridData = [];
        $scope.selectediteminfo = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            candisabletype: false,
            fromtxn: false
        };

        if (modalConfig && modalConfig.params) {

            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.item.FavoriteTypeId = parseInt(modalConfig.params.favoritetypeid);
            $scope.currentcontext.candisabletype = (modalConfig.params.parent == 'txn' ? true : false);
            $scope.currentcontext.fromtxn = (modalConfig.params.parent == 'txn' ? true : false);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }

        $scope.addfavoritedetail = function () {
            var DispName = $scope.selectediteminfo.Text;
            if ($scope.ItemAlreadyExist(DispName)) {
                var item = {
                    FavoriteMasterId: $scope.item.Id,
                    FavoriteTypeId: $scope.item.FavoriteTypeId,
                    ItemId: $scope.selectediteminfo.Id,
                    DisplayName: $scope.selectediteminfo.Text + '(' + $scope.selectediteminfo.Code + ')',
                    Comments: '',
                    Status: 1
                };
                $scope.gridData.push(item);
            } else {
                utl.Alert.showSuccessMsg($translate.instant('clinicalmaster.drug-form.exitem.lbl'));
            }
            $scope.applyFilter();
        }

        $scope.ItemAlreadyExist = function (DispName) {
            for (var idx in $scope.gridData) {
                if (DispName == $scope.gridData[idx].DisplayName && $scope.gridData[idx].Status == 1)
                    return false;
            }
            return true;
        }


        $scope.applyFilter = function () {
            vm.gridConfig.data = $filter('filterArrayItems')($scope.gridData, [{
                search: 1,
                fields: ['Status']
            }]);
        }

        //getDetails
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            //$scope.applyFilter();
        };

        $scope.getDetails = function () {
            if ($scope.item.Id && $scope.item.Id > 0) {

                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.Id
                    }, ]
                };

                var options = {
                    action: 'clinicalmaster/FavoriteMasterDetail/GetFavoriteMasterDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };


        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetails();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/FavoriteMaster/GetFavoriteMasterById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.cancelCallback();
            } else {
                $state.go('app.favoritemasters');
            }
        }

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
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                }],
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
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        //save item callback
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.currentcontext.id == 0) {
                $scope.currentcontext.id = data;
            }
            $scope.getItem();
            $scope.backToList(); // 13-02-17
        };
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.AccessibleTypeId == 1) {
                if (!$scope.item.DepartmentId || !$scope.item.UserId) {
                    utl.Alert.showErrorMsg($translate.instant('clinicalmaster.favoritemaster-form.requiredmsg.lbl'));
                    return;
                }
            }
            var actionName = 'clinicalmaster/FavoriteMaster/AddFavoriteMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/FavoriteMaster/UpdateFavoriteMaster';
            }

            var inputData = {
                Header: $scope.item,
                Details: $scope.gridData
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.onDeleteConfirmed = function (deleteId) {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Id == deleteId) {
                    item.Status = 2;
                }
            }
            $scope.applyFilter();
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DisplayName);
            }
        }


        vm.gridConfig = {
            columnDefs: [{
                    field: "DisplayName",
                    displayName: $translate.instant('clinicalmaster.favoritemaster-form.displayname.lbl')
                },
                {
                    field: "GroupName",
                    displayName: $translate.instant('clinicalmaster.favoritemaster-form.groupname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <input type='text' ng-model='entity.GroupName' class='form-control' />\
                                                </div>"
                },
                {
                    field: "Comments",
                    displayName: $translate.instant('clinicalmaster.favoritemaster-form.standardcommants.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='entity.Comments' class='form-control' />\
                                          </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                       <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                   </div>',
                    handleEvent: $scope.handleEvents,

                    actions: [{
                        actiontype: 'delete',
                        display: 'common.deleteaction.lbl'
                    }]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            data: $scope.gridData
        };


        //getFavoriteByUser
        $scope.getFavoriteByUserCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                $scope.currentcontext.id = res.Data[0].Id;
                $scope.getItem();
            }
        }
        $scope.getFavoriteByUser = function () {

            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.item.FavoriteTypeId
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getCurrentUserId()
                    }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/FavoriteMaster/GetFavoriteMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFavoriteByUserCallback
            };
            utl.Http.doAction(options);
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.currentcontext.fromtxn) {
                $scope.getFavoriteByUser();
            } else {
                $scope.getItem();
            }
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "AccessibleType"
                },
                {
                    "Key": "FavoriteType"
                },
                {
                    Key: 'Department',
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
                        }]

                    }
                },
                {
                    Key: 'User',
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
                        }]
                    }
                }
            ];

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

    favoriteMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();