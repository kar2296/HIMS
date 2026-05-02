(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('outboundAllListController', outboundAllListController);

    function outboundAllListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.SelectedRow = null;
        $scope.Items = [];
        $scope.currentfilter = {
            EventDirectionId: 2,// EventDirectionId - outbound
            EventStatusId: 1 // EventStatusId - Pending
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.addNew = function () {
            utl.Modal.open('app.eventlog', {
                params: { id: 0 }, confirmCallback: $scope.getList
            });
        };

        $scope.saveItem = function (SelectedId) {
            if (SelectedId && SelectedId > 0) {
               var actionName = 'SystemSettingsEventDashboard/UpdateEventDashboard';

            var options = {
                action: actionName,
                data: { Data: $scope.SelectedRow },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
           }
        };


        $scope.onSendToDestination  = function() {
            $scope.SelectedRow.EventStatusId = 2; // Delivered
            $scope.saveItem($scope.SelectedRow.Id);
        }
        $scope.onIgnoreToDestination  = function() {
            $scope.SelectedRow.EventStatusId = 4; // Ignore
            $scope.saveItem($scope.SelectedRow.Id);
        }

        $scope.handleEvents = function (actionType, entity) {
            $scope.SelectedRow = null;
            $scope.SelectedRow = entity;
            if (actionType == 'view') {
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'send') {
                var confirmOptions = {
                    headingKey: 'Send',
                    messageKey: 'Are you Send to '+entity.EventDestination.Description,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    data:row,
                    onSuccessMethod: $scope.onSendToDestination,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
            else if (actionType == 'resend') {
                var confirmOptions = {
                    headingKey: 'Send',
                    messageKey: 'Are you Resend to '+entity.EventDestination.Description,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    data:row,
                    onSuccessMethod: $scope.onSendToDestination,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
            else if (actionType == 'ignore') {
                var confirmOptions = {
                    headingKey: 'Send',
                    messageKey: 'Do you want to ignore this '+entity.EventDestination.Description+' Data ',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    data:row,
                    onSuccessMethod: $scope.onIgnoreToDestination,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "CreatedAt", displayName: $translate.instant('appmanager.outbound-list.datetime.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "EventType.Description", displayName: $translate.instant('appmanager.outbound-list.type.lbl') },
                {
                    field: "EventSource.Description", displayName: $translate.instant('appmanager.outbound-list.source.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'><a >{{entity.EventSource.Description}} </a>" + "</div>"
                },
                { field: "EventDestination.Description", displayName: $translate.instant('appmanager.outbound-list.designation.lbl') },
                { field: "EventStatus.Description", displayName: $translate.instant('appmanager.outbound-list.status.lbl') },

                { field: "EventDataType.Description", displayName: $translate.instant('appmanager.outbound-list.datatype.lbl') },

                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'send\',entity)"><i class="fa fa-sign-in btn  bt-color3 btn-rounded" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'resend\',entity)"><i class="fa fa-history btn btn-primary btn-rounded" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'ignore\',entity)"><i class="fa fa-trash btn btn-danger btn-rounded" aria-hidden="true"></i></span>\
                                                    </div>',
                                                    handleEvent: $scope.handleEvents,
                    actions: [

                    ]
                },
                { field: "EventData", displayName: $translate.instant('appmanager.outbound-list.hint.lbl') },
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

    outboundAllListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();