(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PositionBpChartFormController', PositionBpChartFormController);

    function PositionBpChartFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {};
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        $scope.item = {
            PositionBPChartDate: utl.Formatter.getCurrentDate(),
            PositionBPCharTime: time,
            EncounterId: utl.Session.getEncounterId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            CreatedById: utl.Session.getCurrentUserId(),
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/PositionBpChart/GetPositionBpChartById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.save = function () {
            $scope.saveItem();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveAndApprove = function () {
            $scope.saveItem();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/PositionBpChart/AddPositionBpChart';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PositionBpChart/UpdatePositionBpChart';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
   /* autosearch starts */
   vm.usercontrolconfig = {
    query: '',
    searchbyid: false,
    options: [{
        header: 'Employee Name',
        field: 'UserName',
        datatype: 'string',
        headercls: 'td-name',
        fieldcls: 'td-name'
    },
    {
        header: 'Qualification',
        field: 'Qualification',
        datatype: 'string',
        headercls: 'td-Qualification',
        fieldcls: 'td-Qualification'
    },
    {
        header: 'Department',
        field: 'Speciality',
        datatype: 'string',
        headercls: 'td-dept',
        fieldcls: 'td-dept'
    },
    ],
    searchparams: {},
    result: {},
    api: 'SystemSettings/User/GetUsers',
    formatdisplay: formatselecteduser,
    presearch: presearchuser,
    postsearch: postsearchuser
};

function formatselecteduser() {
    var selectedItem = vm.usercontrolconfig.selected;
    var result = '';
    if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        result = [selectedItem.UserName].join('  ');
    } else if (vm.usercontrolconfig.rowdata) {
        result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
        vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
        ].join(' ');
    }

    return result;
}

function presearchuser() {
    var query = vm.usercontrolconfig.query;
    var inputData = {
        Params: [{
            Key: 5,
            Value: 2
        }],
        PageContext: {
            PageSize: 25,
            PageNumber: 1
        }
    };

    if (vm.usercontrolconfig.searchbyid == true) {
        inputData.Params.push({
            Key: 0,
            Value: query
        });
    } else if (query && query.length > 2) {
        inputData.Params.push({
            Key: 1,
            Value: query
        });
    }

    vm.usercontrolconfig.searchparams = inputData;
}

function postsearchuser() {
    for (var idx in vm.usercontrolconfig.result) {
        var item = vm.usercontrolconfig.result[idx];
        item.UserId = item.Id;
        item.UserName = item.FirstName;
        item.Qualification = item.Qualification;
        item.Speciality = item.Department.DepartmentName;
    }
}
/* autosearch End */

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DiscountMode" },
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

    PositionBpChartFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();