(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pastLabListController', pastLabListController);

    function pastLabListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
          
        };
    
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
            $scope.currentcontext.id = parseInt($stateParams.id);
    

        $scope.getListCallback = function (scope, data, options, hasError) {
            // vm.gridConfig.data = res.Data;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var list = {};

                if (data.Data[idx].TESTMASTERTYPId == 1) {
                    list = data.Data[idx];
                    vm.gridConfig.data.push(list);
                }
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                     { Key: 1, Value: $scope.currentcontext.pid },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/PastLabResult/GetPastLabResults',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            $state.go('patientemr.pastlabresult', { id: 0, pid: $scope.currentcontext.pid});
        }



        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/PastLabResult/DeletePastLabResult',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {

                $state.go('patientemr.pastlabresult', { id: row.entity.Id, pid: row.entity.PatientId  });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AssetName);
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
                { field: "Ordereddate", displayName: $translate.instant('patientemr.pastlab-list.date.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.Ordereddate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.StartDate| date: 'HH:mm'}}</span>" + "</div>" },
                { field: "Orderid", displayName: $translate.instant('patientemr.pastlab-form.orderno.lbl') },
                { field: "Orderedbyname", displayName: $translate.instant('patientemr.pastlab-list.orderedby.lbl') },
               
                { field: "YesNo.Description", displayName: $translate.instant('patientemr.pastlab-list.releasetopatient.lbl') },
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
             
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

    pastLabListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();