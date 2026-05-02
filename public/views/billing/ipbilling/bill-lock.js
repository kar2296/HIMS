(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('billlockingController', billlockingController);

    function billlockingController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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

        $scope.initLookup();
    }

    billlockingController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();