(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralchargelistController', referralchargelistController);

    function referralchargelistController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
        };
        //  $scope.currentfilter.DocumentDate = new Date();
        $scope.currentcontext = {};
        $scope.currentcontext.referralid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentcontext.referralid > 0) {


                var inputData = {

                    Params: [


                        { Key: 1, Value: $scope.currentcontext.referralid }

                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'generalmaster/ReferralCharge/GetReferralCharges',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }

        };

        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.wardtab.formroomdetail', { roomdetailid: 0 });
            $scope.openModal('app.referraltab.referralcharge', { id: 0 });
        }
        $scope.item = {};
        $scope.backToForm = function () {
            $state.go('app.referrals');
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/ReferralCharge/DeleteReferralCharge',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.initLookup
            });
        }
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                //  $state.go('app.wardtab.formroomdetail', { roomdetailid: entity.Id });
                $scope.openModal('app.referraltab.referralcharge', { id: entity.Id });
            }

            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ReferralCharge);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions); 
                */
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.referralcharge.facility.lbl') },
                { field: "ServiceCategory.ServiceCategoryName", displayName: $translate.instant('generalmaster.referralcharge.category.lbl') },
                {
                    field: "ReferralCharge", displayName: $translate.instant('generalmaster.referralcharge.referralcharge.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReferralCharge }} </span>" + "<span >{{entity.DiscountMode.Description}}</span>" + "</div>"
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
               </div>',
   handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        //  $scope.dashboard = function () {
        //    $state.go('patientemr.patientdashboard');
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ServiceCategory" },

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

    referralchargelistController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();