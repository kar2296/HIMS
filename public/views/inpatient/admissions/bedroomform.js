(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bedroomFormController', bedroomFormController);

    function bedroomFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                FacilityId: utl.Session.getCurrentFacilityId(),
                LocationId: -1,
                WardId: -1,
                RoomTypeId: -1,
                BedStatusId: 1,
                WardMasterTypeId: 1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    // { type: 'select', translate: 'admission.facility.lbl', options: $scope.lookup.Facility, model: 'FacilityId', position: { r: 0, c: 0 } },
                    // { type: 'select', translate: 'admission.location.lbl', options: $scope.lookup.Location, model: 'LocationId', position: { r: 0, c: 1 } },

                    {
                        type: 'select',
                        translate: 'admission.ward.lbl',
                        options: $scope.lookup.Ward,
                        model: 'WardId',
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    // { type: 'select', translate: 'admission.type.lbl', options: $scope.lookup.RoomTypeMaster, model: 'RoomTypeId', position: { r: 1, c: 1 } },
                    {
                        type: 'select',
                        translate: 'admission.status.lbl',
                        options: $scope.lookup.BedStatus,
                        model: 'BedStatusId',
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                    {
                        type: 'checkbox',
                        translate: 'admission.istemp.lbl',
                        model: 'IsTemp',
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                ],
                actions: [
                    // {
                    //     type: 'reset',
                    //     translate: 'common.resetaction.lbl',
                    //     cls: 'btn-danger'
                    // },
                    {
                        type: 'apply',
                        translate: 'Fetch',
                        cls: 'btn-search'
                    }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));;
            }
            $scope.getList();
        }

        //Dynamic form  ends

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            // for (var idx in res.Data) {
            //     var list = {};
            //     if (res.Data[idx].WardId != 16 && res.Data[idx].WardId != 18) {
            //         list = res.Data[idx];
            //         vm.gridConfig.data.push(list);
            //     }
            // }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.modeldata.FacilityId
                    },
                    {
                        Key: 6,
                        Value: $scope.modeldata.LocationId
                    },
                    {
                        Key: 1,
                        Value: $scope.modeldata.WardId
                    },
                    {
                        Key: 2,
                        Value: $scope.modeldata.RoomTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.modeldata.BedStatusId
                    },
                    {
                        Key: 7,
                        Value: $scope.modeldata.IsTemp
                    },
                    {
                        Key: 8,
                        Value: $scope.modeldata.WardMasterTypeId
                    },
                    {
                        Key: 9,
                        Value: 2
                    }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'GeneralMaster/WardRoomBedMaster/GetWardRoomBedMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            console.log(entity);
            if (actionType == 'select') {
                if (entity.BedStatusId != 1) {
                    utl.Alert.showErrorMsg($translate.instant('admissions.bed.lbl'));
                    return false;
                } else {
                    $scope.confirmCallback({
                        LocationId: entity.LocationId,
                        LocationName: entity.LocationMaster.LocationName,
                        WardId: entity.WardId,
                        WardName: entity.WardMaster.WardName,
                        RoomId: entity.RoomId,
                        RoomName: entity.WardRoomMaster.RoomNo,
                        PhotoPath: entity.WardRoomMaster.PhotoPath,
                        BedId: entity.Id,
                        BedName: entity.BedNo,
                        ServiceRateCategoryId: entity.ServiceRateCategoryId
                    });
                }
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "Id",
                    displayName: $translate.instant('Select'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="btn btn-check btn-rounded fa fa-check" aria-hidden="true"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                },
                {
                    field: "LocationMaster.LocationName",
                    displayName: $translate.instant('admission.location.lbl')
                },
                {
                    field: "WardMaster.WardName",
                    displayName: $translate.instant('admission.ward.lbl')
                },
                {
                    field: "WardRoomMaster.RoomNo",
                    displayName: $translate.instant('admission.room.lbl')
                },
                {
                    field: "Description",
                    displayName: $translate.instant('admission.bed.lbl')
                },
                {
                    field: "BedStatus.Description",
                    displayName: $translate.instant('admission.bedstatus.lbl')
                },
                {
                    field: "ServiceRateCategory.ServiceRateCategory",
                    displayName: $translate.instant('Tariff')
                },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true
        };
        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                if (entity.BedStatusId != 1) {
                    utl.Alert.showErrorMsg($translate.instant('admissions.bed.lbl'));
                    return false;
                }
                var returnobj = {};
                returnobj.LocationId = entity.LocationId;
                returnobj.WardId = entity.WardId;
                returnobj.RoomId = entity.RoomId;
                returnobj.PhotoPath = entity.WardRoomMaster.PhotoPath;
                returnobj.BedId = entity.Id;
                returnobj.ServiceRateCategoryId = entity.ServiceRateCategoryId;
                //returnobj.LocationId = entity.LocationMaster ? entity.LocationMaster.Id : -1;
                $scope.confirmCallback(returnobj);
            });
        };
        //Grid selection related code ends


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "Location"
                },
                {
                    "Key": "Ward",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: 1
                        }, {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId()
                        }]
                    },
                },
                {
                    "Key": "RoomTypeMaster"
                },
                {
                    "Key": "BedStatus"
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

    bedroomFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();