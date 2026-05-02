(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templateparamsListController', templateparamsListController);

    function templateparamsListController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.currentfilter = {
            Name: '',
            CategoryTypeId: -1
        };
        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
        }
        $scope.currentcontext = {
            file: ''
        };


        $scope.uploadCategories = function () {
            if ($scope.currentcontext.file) {
                var actionName = 'clinicalmaster/Category/ImportCategories';
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: {}
                    }
                }).then(function (resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.getList();
                    },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.categories.upload_file_mandatory.lbl'));
            }
        }

        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.Name
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.CategoryTypeId
                    }
                    //{ Key: 3, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/Category/GetCategorysWithoutConcept',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function () {
        //     //code to add new cat
        // }

        $scope.addNew = function () {
            $state.go('app.templateparam', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/Category/DeleteCategory',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.templateparam', {
                    id: entity.Id
                });
            }
            // else if (actionType == 'delete') {
            //     utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            // }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "CategoryName",
                    displayName: $translate.instant('clinicalmaster.categories.name.lbl')
                },
                {
                    field: "CategoryType",
                    displayName: $translate.instant('clinicalmaster.categories.type.lbl')
                },
                // { field: "CategoryGroup.Description", displayName: $translate.instant('clinicalmaster.categories.group.lbl') },
                //{ field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.categories.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        }
                        //{ actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
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
                    "Key": "CategoryType"
                },
                {
                    "Key": "ActiveStatusId"
                }
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

    templateparamsListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();