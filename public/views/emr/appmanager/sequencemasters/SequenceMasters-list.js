(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SequenceMastersListController', SequenceMastersListController);

    function SequenceMastersListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.CurrentUserId = utl.Session.getCurrentUserId();

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            SourceTypeId: -1,
            Name: '',
            StatusId: -1
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    //    { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 3, Value: $scope.currentfilter.FacilityId },
                    //    { Key: 3, Value: $scope.currentfilter.SourceTypeId },
                    //    { Key: 4, Value: $scope.currentfilter.StatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'General/SequenceMasters/GetSequenceMasterss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.redisSyncwithDBCallback = function (scope, res, options, hasError) {
            if (res) {
                $scope.getList();
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            }
        };

        $scope.redistosqlConfirm = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'appmanager.sequencemasters-list.redistosqlconfirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.redistosql,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.redistosql = function () {
            var inputData = {
                Id: null,
                Params: [],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'General/SequenceMasters/SyncRedisToSqlSequenceMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.redisSyncwithDBCallback
            };
            utl.Http.doAction(options);
        }

        $scope.sqltoredisConfirm = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'appmanager.sequencemasters-list.sqltoredisconfirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.sqltoredis,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.sqltoredis = function () {
            var inputData = {
                Id: null,
                Params: [],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'General/SequenceMasters/SyncSqlToRedisSequenceMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.redisSyncwithDBCallback
            };
            utl.Http.doAction(options);
        }

        //Grid Actions
        $scope.openModal = function (Id) {
            utl.Modal.open('app.sequencemasters', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        }
        // $scope.addNew = function () {
        //     utl.Modal.open('app.sequencemasters', {
        //         params: { id: 0 },
        //         confirmCallback: $scope.getList
        //     }
        //     );
        // }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'General/SequenceMasters/DeleteSequenceMasters',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                // utl.Modal.open('app.sequencemasters', {
                //     params: { id: entity.Id },
                //     confirmCallback: $scope.getList
                // }
                // );
                $scope.openModal(entity.Id);
            }
            if (actionType == 'view') {
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "SeqName", displayName: $translate.instant('appmanager.sequencemasters-list.sequencename.lbl') },
                { field: "Facility.FacilityName", displayName: $translate.instant('Facility') },
                { field: "SeqPrefix", displayName: $translate.instant('appmanager.sequencemasters-list.seqprefix.lbl') },
                // { field: "SeqSuffix", displayName: $translate.instant('appmanager.sequencemasters-list.seqsuffix.lbl') },
                { field: "SeqStartId", displayName: $translate.instant('appmanager.sequencemasters-list.seqstartid.lbl') },
                { field: "SeqLastId", displayName: $translate.instant('appmanager.sequencemasters-list.seqlastid.lbl') },
                // {
                //     field: "IsDailyReset", displayName: $translate.instant('appmanager.sequencemasters-list.isdailyreset.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
                //         "<span class='pl-3' ng-if='entity.IsDailyReset==true'>Yes</span>" +
                //         "<span class='pl-3' ng-if='entity.IsDailyReset==false'>No</span>" +
                //         "</div>"
                // },
                { field: "SeqIncSize", displayName: $translate.instant('appmanager.sequencemasters-list.seqinsize.lbl') },
                { field: "SeqBlockSize", displayName: $translate.instant('appmanager.sequencemasters-list.seqblocksize.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "SourceType" },
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

    SequenceMastersListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();