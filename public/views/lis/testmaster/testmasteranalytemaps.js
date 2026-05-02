(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testmasterAnalyteMapsListController', testmasterAnalyteMapsListController);

    function testmasterAnalyteMapsListController($scope, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;

        uibButtonConfig.activeClass = "btn-primary";

        $scope.Items = []; // saved for bulk items

        $scope.item = {}; // saved for individual item

        var testmasterid = parseInt($stateParams.id);
        var IsProfile = $scope.$parent.IsProfile;
        var TestType = $scope.$parent.TestType;
        var TestCode = $state.params.TestCode;
        $scope.currentcontext = {
            mapType : 'test'
        };

        $scope.currentcontext.maptypes = [
            { Id : 'profile', Text : 'Profile'},
            { Id : 'test', Text : 'Test'}
        ];

        $scope.canShowTestControl = function() {
            return $scope.currentcontext.mapType == 'test';
        }

        $scope.canShowProfileControl = function() {
            return $scope.currentcontext.mapType == 'profile';
        }

        $scope.mapTypeClick = function(maptype) {
        }

        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            console.log(res.Data);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: testmasterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/testmaster/GetTestmasteranalytemaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item = {};
			    document.getElementById("item_form").reset();
            $scope.getList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if($scope.currentcontext.mapType == 'test' && !$scope.item.AnalyteId && !$scope.item.TestmasterMapId) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Test'));
                return;
            } else if($scope.currentcontext.mapType == 'profile' && !$scope.item.TestmasterMapId) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Profile'));
                return;
            }

            $scope.item.TestmasterId = testmasterid;
            var actionName = 'lis/testmaster/AddTestmasteranalytemap';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'lis/testmaster/UpdateTestmasteranalytemap';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/testmaster/DeleteTestmasteranalytemap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.analyteprofiledetails = function (AnalyteId) {
            utl.Modal.open('app.analyteprofile', {
                params: { aid: AnalyteId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                if (entity.Analytemaster) {
                     //$state.go('app.analytetab.analytemaster', { id:entity.AnalyteId });
                     // Problem not going back in Dialog format

                    utl.Modal.open('app.analytetab.analytemaster',
                    {
                        params: {  id: entity.AnalyteId  },
                        confirmCallback: $scope.getList
                    });
                }
                else
                {
                    // $state.go('app.testmastertab.testmaster', { id:entity.TestmasterMapId, IsProfile: entity.IsProfile, TestName: entity.Code +' - '+  entity.Name, TestCode: entity.Code });
                    // Problem not going back in Dialog format

                    utl.Modal.open('app.testmastertab.testmaster',
                    {
                        params: {  id: entity.TestmasterMapId  },
                        confirmCallback: $scope.getList
                    });

                }
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
            else if (actionType == 'analyteinfo') {
                $scope.analyteprofiledetails(entity.AnalyteId);
            } else if (actionType == 'view') {
                $scope.openModal(entity.Id);
                //$state.go('app.remark', { id:entity.Id });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "DisplayID", displayName: $translate.instant('lis.testmasteranalytemaps.displayid.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Analytemaster ? entity.Analytemaster.Code : entity.TestAnalyteName.Code }} </div>'
                },
                {
                    field: "Mnemonics", displayName: $translate.instant('lis.testmasteranalytemaps.mnemonics.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Analytemaster ? entity.Analytemaster.Mnemonics : entity.TestAnalyteName.Mnemonics }} </div>'
                },
                {
                    field: "Name", displayName: $translate.instant('lis.testmasteranalytemaps.testanalytename.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<a ng-click="grid.appScope.handleEvents(\'analyteinfo\',entity)">'
                    + "<span >{{entity.Analytemaster ? entity.Analytemaster.Name : entity.TestAnalyteName.Name }}</span>"
                    + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Analytemaster ? entity.Analytemaster.Name : entity.TestAnalyteName.Name }} </div>'
                },
                // {
                //     field: "IsManditory", displayName: $translate.instant('lis.testmasteranalytemaps.ismanditory.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.IsManditory ? "Yes" : "No" }} </div>'
                // },
                // {
                //     field: "Excludefromprint", displayName: $translate.instant('lis.testmasteranalytemaps.excludefromprint.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Excludefromprint ? "Yes" : "No" }} </div>'
                // },
                // {
                //     field: "Loincname", displayName: $translate.instant('lis.testmasteranalytemaps.loincname.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Analytemaster ? entity.Analytemaster.Loincname : "" }} </div>'
                // },
                // {
                //     field: "Methodology", displayName: $translate.instant('lis.testmasteranalytemaps.methodology.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Analytemaster ? entity.Analytemaster.Methodology : entity.TestAnalyteName.Methodology }} </div>'
                // },
                {
                    field: "DisplayOrder", displayName: $translate.instant('lis.testmasteranalytemap.display.lbl'),
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
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

        $scope.onAnalyteSelected = function (selectedItem) {
            //do selectedItem.PropertyName like selectedItem.Name or selectedItem.Key
            //whatever property your list has.
            console.log(selectedItem);
            if (IsProfile) {
                $scope.item.TestAnalyteName = selectedItem.Name;
                $scope.item.TestmasterMapId = $scope.item.TestAnalyteId;
                $scope.item.AnalyteId = null;
                $scope.item.DisplayID = selectedItem.Code;
                $scope.item.Mnemonics = selectedItem.Mnemonics;
                $scope.item.Methodology = selectedItem.Methodology;
                $scope.item.DisplayOrder = selectedItem.DisplayOrder;
            }
            else {
                $scope.item.TestAnalyteName = selectedItem.Text;
                $scope.item.AnalyteId = $scope.item.TestAnalyteId;
                $scope.item.TestmasterMapId = null;
                $scope.item.DisplayID = selectedItem.Code;
                $scope.item.Mnemonics = selectedItem.Mnemonics;
                $scope.item.Loinccode = selectedItem.Loinccode;
                $scope.item.Loincname = selectedItem.Loincname;
                $scope.item.Methodology = selectedItem.Methodology;
                $scope.item.Excludefromprint = selectedItem.Excludefromprint;
                $scope.item.DisplayOrder = selectedItem.Displayorder;
            }

        }

        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Test Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Test Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api:IsProfile? 'lis/testmaster/GetTestmasters':'lis/analytemaster/GetAnalytemasters',
            formatdisplay: formatselectedtestanalyte,
            presearch: presearchtestanalyte,
            postsearch: postsearchtestanalyte
        };

        function formatselectedtestanalyte() {
            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name, '(' + selectedItem.Code + ')'].join(' ');
            } else if (vm.testcontrolconfig.entitydata) {
                result = [vm.testcontrolconfig.entitydata.Name, vm.testcontrolconfig.entitydata.Code].join(' ') || '';
            }
            return result;
        }

        function presearchtestanalyte() {
            var query = vm.testcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [
                    // { Key: 6, Value: 2 },
                    IsProfile ? { Key: 6, Value: 2 } : { Key: 4, Value: 2 },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }

            };
            if (IsProfile == false) {
                inputData.Params.push({ Key: 2, Value: TestType });
            }
            if (IsProfile == true) {
                inputData.Params.push({ Key: 3, Value: TestType });
            }
            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtestanalyte() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                item.Name = item.Name;
                item.Code = item.Code;

            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // if (IsProfile) {
            //     $scope.lookup.ExceptSelectedTestMaster = [];
            //     var len = $scope.lookup.TestMaster.length;
            //     for (var i = 0; i < len; i++) {
            //         if ($scope.lookup.TestMaster[i].Id > 0) {
            //             if (TestCode != $scope.lookup.TestMaster[i].Code) {
            //                 $scope.lookup.TestMaster[i].Id = $scope.lookup.TestMaster[i].Id;
            //                 $scope.lookup.TestMaster[i].Text = $scope.lookup.TestMaster[i].Name + "(" + $scope.lookup.TestMaster[i].Code + ")";
            //                 $scope.lookup.ExceptSelectedTestMaster.push($scope.lookup.TestMaster[i]);
            //             }
            //         }
            //         else {
            //             $scope.lookup.TestMaster[i].Id = $scope.lookup.TestMaster[i].Id;
            //             $scope.lookup.TestMaster[i].Text = $scope.lookup.TestMaster[i].Text ? $scope.lookup.TestMaster[i].Text : $scope.lookup.TestMaster[i].Name;
            //             $scope.lookup.ExceptSelectedTestMaster.push($scope.lookup.TestMaster[i]);
            //         }
            //     }
            // }
            // else {
            //     for (var i = 0, len = $scope.lookup.AnalyteMaster.length; i < len; i++) {
            //         if ($scope.lookup.AnalyteMaster[i].Id > 0) {
            //             $scope.lookup.AnalyteMaster[i].Id = $scope.lookup.AnalyteMaster[i].Id;
            //             $scope.lookup.AnalyteMaster[i].Text = $scope.lookup.AnalyteMaster[i].Name + "(" + $scope.lookup.AnalyteMaster[i].Code + ")";
            //         }
            //         else {
            //             $scope.lookup.AnalyteMaster[i].Id = $scope.lookup.AnalyteMaster[i].Id;
            //             $scope.lookup.AnalyteMaster[i].Text = $scope.lookup.AnalyteMaster[i].Text ? $scope.lookup.AnalyteMaster[i].Text : $scope.lookup.AnalyteMaster[i].Name;
            //         }
            //     }
            // }
            // $scope.lookup.TestOrAnalyteMaster = IsProfile ? $scope.lookup.ExceptSelectedTestMaster : $scope.lookup.AnalyteMaster;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { Key: "TestProfile", Request: { Params: [{ Key: 9, Value: testmasterid }] } }
                // {
                //     "Key": "TestMaster", "Request": {
                //         "Params": [{ 'Key': 2, 'Value': 0 }],
                //         "Attributes": ['Id', ['Name', 'Text'], 'Code',
                //             'Name',
                //             'Mnemonics',
                //             'DisplayOrder',
                //             'Methodology']
                //     }
                // },
                // {
                //     "Key": "AnalyteMaster", "Request": {
                //         "Params": [],
                //         "Attributes": ['Id', ['Name', 'Text'], 'Code',
                //             'Description',
                //             'Name',
                //             'Mnemonics',
                //             'Displayorder',
                //             'Excludefromprint',
                //             'Loinccode',
                //             'Loincname',
                //             'Methodology']
                //     }
                // }

            ]
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

    testmasterAnalyteMapsListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();