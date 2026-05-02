(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AnalyserNormalTemplateListController', AnalyserNormalTemplateListController);

    function AnalyserNormalTemplateListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {

            WarrantyTypeId: -1,
            ActiveStatusId: 2
        };
        //  $scope.currentfilter.DocumentDate = new Date();
        $scope.currentcontext = {};
        $scope.currentcontext.analyteid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
              if ($scope.currentcontext.analyteid > 0) {


            var inputData = {

                Params: [

                    { Key: 1, Value: $scope.currentfilter.GenderId },
                    { Key: 2, Value: $scope.currentfilter.AnalyserTemplateTypeId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },

                    { Key: 4, Value: $scope.currentcontext.analyteid },


                    //   { Key: 1, Value: $scope.currentfilter.assetid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/AnalyserTemplate/GetAnalyserTemplates',
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
            $scope.openModal('app.analytetab.analysertemplates', { id: 0 });
        }
          $scope.item = {};
        $scope.backToForm = function () {
            $state.go('app.analytetab.analysertemplate');
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/AnalyserTemplate/DeleteAnalyserTemplate',
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
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                //  $state.go('app.wardtab.formroomdetail', { roomdetailid: row.entity.Id });
                $scope.openModal('app.analytetab.analysertemplates', { id: row.entity.Id } );
            }
            else if (actionType == 'Active') {
                $scope.Update(row.entity.Id, 2);
            }
            else if (actionType == 'Inactive') {
                $scope.Update(row.entity.Id, 3);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Comments);
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
            columnDefs: [
                { field: "Gender.Description", displayName: $translate.instant('lis.analyzertemplate.gender.lbl'), },

                { field: "AnalyserTemplateType.Description", displayName: $translate.instant('lis.analyzertemplate.type.lbl'), },
                { field: "Comments", displayName: $translate.instant('lis.analyzertemplate.comments.lbl'), },
                { field: "ActiveStatus.Description", displayName: $translate.instant('lis.analyzertemplate.status.lbl'), },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
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
                { "Key": "AnalyserTemplateType" },
                { "Key": "Gender" },
                { "Key": "ActiveStatus"}
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

    AnalyserNormalTemplateListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();