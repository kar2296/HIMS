(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('NewAssetRequestListController', NewAssetRequestListController);

    function NewAssetRequestListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            AssetRequestStatusId: 2
        };
        $scope.currentcontext = {};
        $scope.currentcontext.RemarkId = parseInt($stateParams.id);
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                        {
                        Key: 1,
                        Value: $scope.currentfilter.AssetName
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.AssetRequestStatusId
                    },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/NewAssetRequest/GetNewAssetRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.openFixedDialog('app.newassetrequestform', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
        //Grid Actions
        // $scope.addNew = function() {
        //    $state.go('app.remark', { id:0 });


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/NewAssetRequest/DeleteNewAssetRequest',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit' || actionType == 'view') {
                $scope.openModal(entity.Id);
                //$state.go('app.remark', { id:row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Code);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('assetmanagement.newassetrequest.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{rowRenderIndex+ 1}} </span> </div>"
                },
                {
                    field: "RequestedDate",
                    displayName: $translate.instant('assetmanagement.newassetrequest.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.RequestedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "AssetName",
                    displayName: $translate.instant('assetmanagement.newassetrequest.assetname.lbl')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('assetmanagement.newassetrequest.department.lbl')
                },
                {
                    field: "AssetRequestStatus.Description",
                    displayName: $translate.instant('assetmanagement.newassetrequest.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                      <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.AssetRequestStatusId==2||entity.AssetRequestStatusId==3"><i class=" fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                      <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.AssetRequestStatusId==1"><i class="btn btn-success btn-rounded fa fa-pencil" aria-hidden="true"uib-tooltip="Edit" tooltip-placement="bottom"></i></span>\
                      <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.AssetRequestStatusId==1"><i class="btn btn-danger btn-rounded fa fa-trash" aria-hidden="true"uib-tooltip="Delete" tooltip-placement="bottom"></i></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Company"
            },
            {
                "Key": "AssetRequestStatus"
            },
            {
                "Key": "Department"
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

    NewAssetRequestListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];

})();