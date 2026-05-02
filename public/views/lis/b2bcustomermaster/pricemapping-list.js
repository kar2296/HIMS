(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('priceMappingListController', priceMappingListController);

    function priceMappingListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            TestName: "",
            TESTMASTERTYPId: -1,
            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        $scope.currentcontext.externalproviderid = parseInt($stateParams.id);

        var externalproviderid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var ProviderName = $state.params.ProviderName;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };

        $scope.getList = function () {
            if ($scope.currentcontext.externalproviderid > 0) {

                var inputData = {
                    Params: [
                        { Key: 6, Value: $scope.currentfilter.TestName },
                        { Key: 2, Value: $scope.currentfilter.TESTMASTERTYPId },
                        { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                        { Key: 5, Value: $scope.currentcontext.externalproviderid },
                        { Key: 7, Value: $scope.currentfilter.Price }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'lis/PriceMapping/GetPriceMappings',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.externalprovidertab.pricemappings', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        // $scope.addNew = function () {
        //     $state.go('app.externalprovidertab.pricemappings', { externalproviderpriceid: 0 });
        // };
        $scope.backToForm = function () {
            $state.go('app.externalprovidertab.externalproviders');
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/PriceMapping/DeletePriceMapping',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
                // $state.go('app.externalprovidertab.pricemappings', { externalproviderpriceid: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.ProviderName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : row.entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions); 
                */
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "TESTMASTERTYP.Description", displayName: $translate.instant('lis.externalprovidermaster.testtype.lbl') },
                // { field: "Testmaster.Name", displayName: $translate.instant('lis.externalprovidermaster.testname.lbl') },
                {
                    field: "Testmaster",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-form.testname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'\',row)" uib-tooltip="&nbsp;{{row.entity.Testmaster.Name}}  / {{row.entity.Testmaster.Code}} " tooltip-placement="right" >' +
                    "<span >{{row.entity.Testmaster.Name }}</span>"

                    +
                    "<span >{{row.entity.Testmaster.Code}}</span>" +
                    +"</div>"
                },
                {
                    field: "OtherCost", displayName: $translate.instant('lis.externalprovidermaster.othercost.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.OtherCost | displaycurrency}}</span>" + "</div>"
                },
                { field: "AliasName", displayName: $translate.instant('lis.externalprovidermaster.aliasname.lbl') },
                {
                    field: "Price", displayName: $translate.instant('lis.externalprovidermaster.price.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.Price | displaycurrency}}</span>" + "</div>"
                },

                { field: "ActiveStatus.Description", displayName: $translate.instant('lis.externalprovidermaster.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "TESTMASTERTYP" },
                { "Key": "ActiveStatus" }
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

    priceMappingListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();