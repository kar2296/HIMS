(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inboundErrorListController', inboundErrorListController);

    function inboundErrorListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = []; 
        $scope.currentcontext = {};
        $scope.currentfilter = { 
            EventDirectionId: 1,// EventDirectionId - Inbound 
            EventStatusId: 3 // EventStatusId - Pending 
        };

        $scope.getListCallback = function (scope, res, options, hasError) {  
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;           
        }; 
 

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.EventDirectionId },  
                    { Key: 2, Value: $scope.currentfilter.EventStatusId },  
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/EventDashboard/GetEventDashboards',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
         

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                //  $state.go('app.wardtab.formroomdetail', { roomdetailid: row.entity.Id });
                $scope.openModal('app.eventdashboardtab.inboundsall', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);
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
                {
                    field: "CreatedAt", displayName: $translate.instant('appmanager.inbound-list.datetime.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "EventType.Description", displayName: $translate.instant('appmanager.inbound-list.type.lbl') },
                {
                    field: "EventSource.Description", displayName: $translate.instant('appmanager.inbound-list.source.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'><a >{{row.entity.EventSource.Description}} </a>" + "</div>"
                },
                { field: "EventDestination.Description", displayName: $translate.instant('appmanager.inbound-list.designation.lbl') },
                { field: "EventStatus.Description", displayName: $translate.instant('appmanager.inbound-list.status.lbl') },

                { field: "EventDataType.Description", displayName: $translate.instant('appmanager.inbound-list.datatype.lbl') },

                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                   \
                                                   \
                                                    \
                                                </div>',
                    actions: [

                    ]
                },
                { field: "EventData", displayName: $translate.instant('appmanager.inbound-list.hint.lbl') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "EventType" },
                { "Key": "EventStatus" },
                { "Key": "EventSource" },
                { "Key": "EventDataType" },
                { "Key": "EventDestination" }
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

    inboundErrorListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();