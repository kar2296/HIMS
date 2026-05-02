(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetCondemnationController', AssetCondemnationController);

    function AssetCondemnationController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DisposeStatusId: 3,
            EmployeeId: utl.Session.getCurrentUserId(),
        };
        $scope.currentcontext = {};

        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var grpData = _.groupBy(res.Data, 'DisposeGroupId');
            for (var grpKey in grpData) {
                var td = _.find(grpData[grpKey]);
                vm.gridConfig.data.push(td);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.DisposeStatusId
                }, ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/AssetDispose/GetAssetDisposes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/AssetDispose/DeleteAssetDispose',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'view') {
                $state.go('app.assetdisposetab.condamnationform', {
                    gid: entity.DisposeGroupId
                });
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('assetmanagement.assets.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{rowRenderIndex+ 1}} </span> </div>"
                },
                {
                    field: "DisposeDate",
                    displayName: $translate.instant('assetmanagement.assets.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.RequestedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Asset.AssetName",
                    displayName: $translate.instant('assetmanagement.assets.assetname.lbl')
                },
                {
                    field: "Asset.Serial",
                    displayName: $translate.instant('assetmanagement.assets.assetuniqueno.lbl')
                },
                {
                    field: "Asset.AssetCategory.Description",
                    displayName: $translate.instant('assetmanagement.assets.assetcategory.lbl')
                },
                {
                    field: "ReasonForNotification",
                    displayName: $translate.instant('assetmanagement.assets.reason.lbl')
                },
                {
                    field: "RequestedUser",
                    displayName: $translate.instant('assetmanagement.assets.requestedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.RequestedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "DisposeStatus.Description",
                    displayName: $translate.instant('assetmanagement.assets.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                      <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><i class=" fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "DisposeStatus"
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

    AssetCondemnationController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();