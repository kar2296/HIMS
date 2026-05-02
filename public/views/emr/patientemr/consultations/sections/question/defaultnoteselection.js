(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('defaultnoteselectionController', defaultnoteselectionController);

    function defaultnoteselectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.modelkey = modalConfig.params.modelkey;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                FacilityId: utl.Session.getCurrentFacilityId(),
                DefaultNoteTypeId: -1,
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [{
                    type: 'select',
                    translate: 'Type',
                    options: $scope.lookup.DefaultNoteType,
                    model: 'DefaultNoteTypeId',
                    position: {
                        r: 1,
                        c: 0
                    }
                }],
                actions: [{
                    type: 'apply',
                    translate: 'Fetch',
                    cls: 'btn-search'
                }]
            };
        }

        $scope.actionClick = function(actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));;
            }
            $scope.getList();
        }

        //Dynamic form  ends

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.modeldata.DefaultNoteType
                    },
                    {
                        Key: 2,
                        Value: 2
                    }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/DefaultNotes/GetDefaultNotess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'select') {
                $scope.confirmCallback({
                    modelkey: $scope.currentcontext.modelkey,
                    TypeId: entity.DefaultNoteTypeId,
                    Notes: entity.Notes,
                });

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
                    field: "DefaultNoteType.Description",
                    displayName: $translate.instant('Type')
                },
                {
                    field: "Notes",
                    displayName: $translate.instant('Notes')
                }
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
        vm.gridConfig.onRegisterApi = function(gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(row) {

                if (row.entity.BedStatusId != 1) {
                    utl.Alert.showErrorMsg($translate.instant('admissions.bed.lbl'));
                    return false;
                }
                var returnobj = {};
                returnobj.LocationId = row.entity.LocationId;
                returnobj.WardId = row.entity.WardId;
                returnobj.RoomId = row.entity.RoomId;
                returnobj.PhotoPath = row.entity.WardRoomMaster.PhotoPath;
                returnobj.BedId = row.entity.Id;
                returnobj.ServiceRateCategoryId = row.entity.ServiceRateCategoryId;
                //returnobj.LocationId = row.entity.LocationMaster ? row.entity.LocationMaster.Id : -1;
                $scope.confirmCallback(returnobj);
            });
        };
        //Grid selection related code ends


        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "DefaultNoteType"
            }, ];

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

    defaultnoteselectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();