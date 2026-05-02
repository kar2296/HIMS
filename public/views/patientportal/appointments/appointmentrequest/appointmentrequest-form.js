(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentRequestFormController', appointmentRequestFormController);

    function appointmentRequestFormController($scope, $interval, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.item = {
        PatientId: parseInt(utl.Session.getPatientPortalPatientId())
    };

    $scope.currentcontext =  {
        id : $stateParams.id
    };
        
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'appointment/AppointmentRequest/GetAppointmentRequestById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };
        
    $scope.backToList = function () {
        
    };

    //autosearch related code starts for Doctors
    vm.doctorcontrolconfig = {
        query: '',
        searchbyid: false,
        options: [
            { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
            { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
        ],
        searchparams: {},
        result: {},
        iteminfo: {},
        api: 'SystemSettings/User/GetUsers',
        formatdisplay: formatselecteddoctor,
        presearch: presearchdoctor,
        postsearch: postsearchdoctor
    };

    function formatselecteddoctor() {
        var selectedItem = vm.doctorcontrolconfig.selected;
        var result = '';
        if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
            result = [selectedItem.DoctorName].join('  ');
        } else if (vm.doctorcontrolconfig.rowdata) {
            result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
            vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
            ].join(' ');
        }
        return result;
    }

    function presearchdoctor() {
        var query = vm.doctorcontrolconfig.query;

        //Search only DoctorGroup
        var inputData = {
            Params: [
                { Key: 3, Value: 2 },
                { Key: 5, Value: 2 }
            ],
            PageContext: {
                PageSize: 25,
                PageNumber: 1
            }
        };


        if (vm.doctorcontrolconfig.searchbyid == true) {
            inputData.Params.push({ Key: 0, Value: query });
        } else if (query && query.length > 2) {
            inputData.Params.push({ Key: 1, Value: query });
        }

        vm.doctorcontrolconfig.searchparams = inputData;
    }

    function postsearchdoctor() {
        for (var idx in vm.doctorcontrolconfig.result) {
            var item = vm.doctorcontrolconfig.result[idx];
            item.DoctorId = item.Id;
            item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            item.Qualification = item.Qualification;
            item.Speciality = item.Department ? item.Department.DepartmentName : '';
        }
    }
    //autosearch related code ends for Doctors

    $scope.onDoctorSelected = function (data) {
        $scope.currentcontext.selecteddept = [];
        $scope.getdepartment();
        console.log(data);
    }
    $scope.getdeptCallback = function (scope, data, options, hasError) {
        $scope.item.map = data;
        var dept = [];
        for (var idx in data) {
            dept.push(data[idx])
            for (var iddx in $scope.lookup.Department) {
                if ($scope.lookup.Department[iddx].Id == dept[idx].DepartmentId)
                    $scope.currentcontext.selecteddept.push($scope.lookup.Department[iddx]);
            }
            $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
        }
        $scope.doctorChange();
    };
    $scope.getdepartment = function (pageNo) {
        var inputData = {
            Params: [
                { Key: 0, Value: $scope.item.DoctorId }
            ]
        };
        var options = {
            action: 'SystemSettings/User/GetDepartments',
            data: inputData,
            type: 'post',
            onComplete: $scope.getdeptCallback
        };
        utl.Http.doAction(options);
    };

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {        
            
        var actionName = 'appointment/AppointmentRequest/AddAppointmentRequest';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'appointment/AppointmentRequest/UpdateAppointmentRequest';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    //lookup
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                { "Key": "Facility" },
                { "Key": "Department" }
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

    appointmentRequestFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl'];

})();