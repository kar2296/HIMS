(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('mytaskformController', mytaskformController);

    function mytaskformController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.Id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            TaskStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.Canshowassignbtn = true;
        $scope.Canshowcancelbtn = false;
        $scope.Canshowcompletebtn = false;
        $scope.Canshowcompletecmnt = false;
        $scope.backToList = function() {
            $state.go('app.mytaskform');
        };
        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        }
        $scope.getMaxId = function() {
            if (!$scope.currentcontext.id) {
                var options = {
                    action: 'TaskManagement/TaskManagement/GetMaxId',
                    data: {
                        Data: {}
                    },
                    type: 'post',
                    onComplete: $scope.getMaxIdCallback
                };
                utl.Http.doAction(options);
            }
        }

        function ZeroPadding(num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }
        $scope.getMaxIdCallback = function(scope, data, options, hasError) {
            var StartingNr = '001';
            if (data)
                StartingNr = ZeroPadding(data, 3);
            $scope.prefix = '';
            StartingNr = 'TASK' + '' + StartingNr;
            if (StartingNr)
                $scope.item.TaskNo = StartingNr;
        }
        $scope.getItemCallback = function(scope, res, options, hasError) {
            $scope.item = res.Data[0];
            if ($scope.item.TaskStatusId == 1) {
                $scope.Canshowassignbtn = true;
                $scope.Canshowcancelbtn = true;
                $scope.Canshowcompletebtn = true;
                $scope.Canshowcompletecmnt = true;
            }
            if ($scope.item.TaskStatusId == 2) {
                $scope.Canshowassignbtn = false;
                $scope.Canshowcancelbtn = false;
                $scope.Canshowcompletebtn = false;
                $scope.Canshowcompletecmnt = true;
            }
            if ($scope.item.TaskStatusId == 3) {
                $scope.Canshowassignbtn = false;
                $scope.Canshowcancelbtn = false;
                $scope.Canshowcompletebtn = false;
                $scope.Canshowcompletecmnt = false;
            }
            $scope.getMaxId();
        };

        $scope.getItem = function() {
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.Id
                    }]
                };

                var options = {
                    action: 'TaskManagement/TaskManagement/GetTaskManagements',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.saveandApprove = function() {
            $scope.item.TaskStatusId = 1;
            $scope.item.AssignedFrom = utl.Session.getCurrentUserId();
            $scope.item.AssignedFromDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };
        $scope.saveandcomplete = function() {
            $scope.item.TaskStatusId = 2;
            $scope.saveItem();
        };

        $scope.saveandcancel = function() {
            $scope.item.TaskStatusId = 3;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'TaskManagement/TaskManagement/AddTaskManagement';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'TaskManagement/TaskManagement/UpdateTaskManagement';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getMaxId();
            $scope.getItem();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "TaskType"
                },
                {
                    "Key": "Priority"
                },
                {
                    Key: 'User',
                    Request: {
                        Params: [{ Key: 5, Value: 2 },
                            { Key: 3, Value: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12] }
                        ]

                    }
                },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    mytaskformController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();