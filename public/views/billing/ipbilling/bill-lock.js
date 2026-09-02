(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('billlockingController', billlockingController);

    function billlockingController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };
        $scope.item = {
            IsLocked: modalConfig.params.islocked
        };
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.lockuser = parseInt(modalConfig.params.lockuser);
        $scope.IsLocked = modalConfig.params.islocked;

        $scope.getListCallback = function(scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            $scope.refreshLockGridProps();
        };

        $scope.getList = function() {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.eid
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Billing/PatientBillLock/GetPatientBillLocks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions


        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.opbilling', {
                    pid: $scope.currentcontext.pid
                });
            }
        }
        $scope.checkmandatory = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var data = {
                IsLocked: $scope.IsLocked,
                LockTypeId: $scope.item.LockTypeId,
                Comments: $scope.item.Comments,
                UnLockComments: $scope.item.UnLockComments
            }
            $scope.lockConfirmation(data);
        }

        $scope.doLock = function() {
            $scope.item.UnLockedBy = utl.Session.getCurrentUserId();
            $scope.lockConfirmation($scope.item);
        }
        $scope.lockConfirmation = function(data) {
            var msg = '';
            if ($scope.item.IsLocked)
                msg = 'Are you sure do you want to Release the Lock';
            if (!$scope.item.IsLocked)
                msg = 'Are you sure do you want to Lock The Bill';

            var confirmOptions = {
                itemId: data,
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.confirmCallback,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                $state.go('', {
                    opbillingid: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "LockedOn",
                    displayName: $translate.instant('billing.billlock.lockedon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.LockedOn '></ngformatdate>"
                },
                {
                    field: "LockedUser",
                    displayName: $translate.instant('billing.billlock.lockedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)">' +
                        "<span >{{entity.LockedUser.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.LockedUser.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.LockedUser.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "UnLockedUser",
                    displayName: $translate.instant('Unlocked By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.UnLockedUser.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.UnLockedUser.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.UnLockedUser.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "ReleasedOn",
                    displayName: $translate.instant('billing.billlock.releasedon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReleasedOn '></ngformatdate>"
                },
                {
                    field: "Comments",
                    displayName: $translate.instant('Comments')
                },
                {
                    field: "UnLockComments",
                    displayName: $translate.instant('UnLockComments')
                },
                {
                    field: "LockType.Description",
                    displayName: $translate.instant('billing.billlock.locktype.lbl')
                },
                {
                    field: "LockStatus.Description",
                    displayName: $translate.instant('billing.billlock.lockstatus.lbl')
                },
                // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                //         cellTemplate : 'actionTemplate.html',
                //         actions : [
                //                     {actiontype: 'edit', display : 'common.editaction.lbl'},
                //                     {actiontype: 'delete', display : 'common.deleteaction.lbl'}
                //                  ]
                // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.item.LockTypeId = 3;
            $scope.refreshLockTypeProps();
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "LockType"
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // ------------------------------------------------------------------
        // React bridge. Two controls: the Lock Type <ui-select> and the
        // <custom-table>. Nothing else on this modal changes -- the lock /
        // unlock buttons, checkmandatory(), doLock(), lockConfirmation(),
        // the confirm dialog, GetPatientBillLocks and the modal
        // confirm/cancel callbacks are untouched.
        //
        // Lock Type select parity:
        //   model            item.LockTypeId (unchanged field)
        //   lookup           lookup.LockType (unreshaped)
        //   id type          numeric Id -- the original repeat was
        //                    "lookupitem.Id as lookupitem in lookup.LockType",
        //                    so the model has only ever held the Id
        //   full object      not applicable: no on-select/ng-change existed,
        //                    so no handler ever received the object
        //   required         LIVE -- checkmandatory() calls
        //                    utl.Validator.validate($scope), which returns
        //                    item_form.$valid. The invisible mirror shim
        //                    <span name="locktype" ng-model="item.LockTypeId"
        //                    required> keeps the same control name, the same
        //                    $error.required and the same form validity.
        //   field name       "locktype", unchanged
        //   disabled         ng-disabled="IsLocked", carried to the mount.
        //                    Not added to the shim: ng-disabled does nothing
        //                    on a non-input element, and Angular runs the
        //                    required validator on disabled controls anyway,
        //                    so validity is identical either way.
        //   allow-clear      not present in the original; not added
        //   on-select        none in the original
        //   default          item.LockTypeId = 3, still set by lookupCallback
        //                    before the props are built
        //   facility setting none applies to this control
        //   keyboard/focus   the original had no id, ng-keyup or focus target
        //
        // Grid parity: all 8 columns in columnDefs order, no actions column
        // (the original actions entry is commented out in this file, so this
        // grid has never had one), the two <ngformatdate datetime-val> columns
        // formatted with the same dd-MMM-yyyy HH:mm the directive applies.
        //
        // PRE-EXISTING BUG documented, NOT fixed: the LockedUser cellTemplate
        // wraps its text in <span ng-click="grid.appScope.handleEvents(
        // 'patientinfo', entity)">. This is a <custom-table>, whose
        // cell-template isolate scope exposes only entity/index/template/event
        // -- there is no `grid`, and this column defines no handleEvent -- so
        // that click has never fired. Rendered as plain text, and
        // $scope.handleEvents is left in the file exactly as it is.
        // Column-header sorting is enabled only on the four plain string
        // columns, matching custom-table's reOrder string compare; the two
        // user-object columns throw in reOrder today and the two date columns
        // would sort by their formatted text rather than their raw value.
        $scope.refreshLockTypeProps = function() {
            $scope.reactPropsLockTypeContainer = {
                reactProps: {
                    options: ($scope.lookup && $scope.lookup.LockType) || [],
                    value: $scope.item.LockTypeId,
                    disabled: !!$scope.IsLocked,
                    name: 'locktype'
                },
                onAction: function(actionType, payload) {
                    if (actionType == 'change') {
                        $scope.item.LockTypeId = payload.id;
                        $scope.refreshLockTypeProps();
                    }
                }
            };
        };

        function lockUserName(u) {
            u = u || {};
            var t = (u.Title && u.Title.Description) ? u.Title.Description + ' ' : '';
            return t + (u.FirstName || '') + ' ' + (u.LastName || '');
        }

        $scope.refreshLockGridProps = function() {
            var defs = (vm.gridConfig && vm.gridConfig.columnDefs) || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            var items = (vm.gridConfig && vm.gridConfig.data) || [];
            $scope.reactPropsLockGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'lockedon', header: hdr(0) },
                        { key: 'lockeduser', header: hdr(1) },
                        { key: 'unlockeduser', header: hdr(2) },
                        { key: 'releasedon', header: hdr(3) },
                        { key: 'comments', header: hdr(4), sortable: true },
                        { key: 'unlockcomments', header: hdr(5), sortable: true },
                        { key: 'locktype', header: hdr(6), sortable: true },
                        { key: 'lockstatus', header: hdr(7), sortable: true }
                    ],
                    hasActions: false,
                    rows: items.map(function(entity, i) {
                        return {
                            id: (entity && entity.Id != null) ? entity.Id : i,
                            cells: {
                                lockedon: entity.LockedOn ? $filter('date')(entity.LockedOn, 'dd-MMM-yyyy HH:mm') : '',
                                lockeduser: lockUserName(entity.LockedUser),
                                unlockeduser: lockUserName(entity.UnLockedUser),
                                releasedon: entity.ReleasedOn ? $filter('date')(entity.ReleasedOn, 'dd-MMM-yyyy HH:mm') : '',
                                comments: entity.Comments,
                                unlockcomments: entity.UnLockComments,
                                locktype: entity.LockType && entity.LockType.Description,
                                lockstatus: entity.LockStatus && entity.LockStatus.Description
                            }
                        };
                    })
                },
                onAction: function() {}
            };
        };

        $scope.refreshLockTypeProps();
        $scope.refreshLockGridProps();

        $scope.initLookup();
    }

    billlockingController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();