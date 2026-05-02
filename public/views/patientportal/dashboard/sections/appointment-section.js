(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentSectionController', appointmentSectionController);

function appointmentSectionController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    vm.appointment = {
        ShowCalendar : false
    };
    $scope.toggleView = function() {
        vm.appointment.ShowCalendar = !vm.appointment.ShowCalendar;
    }
    
    $scope.currentfilter= {
        FacilityId : utl.Session.getCurrentFacilityId(),
        DepartmentId : -1,
        AppointmentTypeId : -1,
        DoctorId : '',
        ResourceId : -1, 
        showFilterTab: false,
        AppointmentStatusId : -1
    };

    $scope.openFilterTab = function() {
        if ($scope.currentfilter.showFilterTab === true) {
            $scope.currentfilter.showFilterTab = false;
        } else {
            $scope.currentfilter.showFilterTab = true;
        }
    }
   $scope.currentcontext =  {
        paneltype : utl.Session.get('dashboard-panel-type')
    };
        
    $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

 //Defaulting
    function setDefaults() {
        $scope.currentfilter.AppointmentTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');

        //Setting default status filters starts
        var scheduledStautsId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Scheduled');
        var checkedInStatusId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Checked In');
        $scope.currentfilter.AppointmentStatusId = scheduledStautsId + ","+checkedInStatusId;
        //Setting default status filters ends
    }
    

    $scope.canShowPhysicianArea = function() {
        var result = false;
        if($scope.lookup && $scope.lookup.AppointmentType) {
            var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
            result = ($scope.currentfilter.AppointmentTypeId == apptTypeId);
        }
        return result;
    }

    $scope.canShowResourceArea = function() {
        var result = false;
        if($scope.lookup && $scope.lookup.AppointmentType) {
            var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Resource');
            result = ($scope.currentfilter.AppointmentTypeId == apptTypeId);
        }
        return result;
    }

     //schedular config starts
     $scope.getSchedulerSource = function(appointments) {
         if(!appointments) {
           appointments = [];
       }
       
        // prepare the data
        var source =
        {
            dataType: "array",
            dataFields: [
                { name: 'id', type: 'string' },
                { name: 'description', type: 'string' },
                { name: 'location', type: 'string' },
                { name: 'subject', type: 'string' },
                { name: 'calendar', type: 'string' },
                { name: 'start', type: 'date' },
                { name: 'end', type: 'date' },
                { name: 'background', type: 'string' },
                { name: 'readonly', type: 'bool' },
                { name: 'draggable', type: 'bool' },
                { name: 'resizable', type: 'bool' },
                { name: 'tooltip', type: 'string' },
                { name: 'patientname', type: 'string' },
                { name: 'mrn', type: 'string' },
                { name: 'age', type: 'string' },
                { name: 'gender', type: 'string' },
                { name: 'appointmenttime', type: 'string' },
                { name: 'remarks', type: 'string' },
            ],
            id: 'id',
            localData: appointments
        };
        return source;
     }

     $scope.refreshScheler = function(appts) {
       
       var source = $scope.getSchedulerSource(appts);

       var calendarDate = new Date();
       var month = parseInt(new moment(calendarDate).format('M'));
       var day   = parseInt(new moment(calendarDate).format('D'));
       var year  = parseInt(new moment(calendarDate).format('YYYY'));
       

        $scope.settings = {
            date: new $.jqx.date(year, month, day),
            width: '98%',
            height: 370,
            source: source,
            view: 'weekView',
            showLegend: false,
            editDialog : false,
            toolbarHeight: 35,
            enableHover : true,
            columnsHeight: 30,
            rowsHeight : 27,
            touchRowsHeight : 27,
            /*created: function (args) {
                args.instance.ensureAppointmentVisible('id1');
            },*/
            resources:
            {
                colorScheme: "scheme05",
                dataField: "calendar",
                orientation: "horizontal",
                source:  new $.jqx.dataAdapter(source)
            },
            appointmentDataFields:
            {
                from: "start",
                to: "end",
                id: "id",
                description: "description",
                location: "place",
                subject: "subject",
                resourceId: "calendar",
                readOnly : "readonly",
                background : "background",
                draggable : "draggable",
                resizable : "resizable",
                tooltip : "tooltip",
                patientname : "patientname",
                mrn : 'mrn',
                age : 'age',
                gender : 'gender',
                appointmenttime : 'appointmenttime',
                remarks : 'remarks'
            },
            views:
            [
                { type: 'dayView', timeRuler: { scale: 'hour', formatString: 'HH:mm' }},
                { type: 'weekView', timeRuler: { scale: 'hour', formatString: 'HH:mm' }},
                { type: 'monthView', timeRuler: { scale: 'hour', formatString: 'HH:mm' }}
            ],
             renderAppointment: function(data)
             {
                   if (data.view == "weekView" || data.view == "dayView") {
                        var displayStr = data.appointment.patientname + " / " + data.appointment.age + " / "+ data.appointment.gender;
                        data.html =  displayStr;
                   } else if (data.view == "monthView") {
                        var displayStr = data.appointment.appointmenttime + " / " + data.appointment.remarks;
                        data.html =  displayStr;
                   }
                    return data;
            },

        };
     }    

     //Create dummy appointment to init the schedular
     $scope.createDummyAppt = function () {
        var appointments = new Array();
                var appointment1 = {
                    id: "id-dummy",
                    description: "Dummy appointment",
                    location: "",
                    subject: "Dummy appointment",
                    calendar: "Room 2",
                    start: new Date(2016, 10, 23, 9, 0, 0),
                    end: new Date(2016, 10, 23, 16, 0, 0)
                }
        appointments.push(appointment1);      
        $scope.refreshScheler(appointments); 
     }
     $scope.createDummyAppt();
     //schedular config ends


    $scope.getListCallback = function (scope, res, options, hasError) {
        $scope.items = res.Data;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
               { Key: 15, Value: $scope.currentcontext.pid }
            ],
            PageContext:{
                PageSize: 25,
                PageNumber: 1
            }
        };

        var options = {
            action: 'appointment/Appointment/GetAppointments',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    $scope.getList();

    $scope.handleEvents = function(actionType, item) {
        
        if(actionType == 'edit') {
            utl.Modal.open('app.appointment', {
                    params: { id : item.Id },
                    confirmCallback: $scope.getList
                }
            );
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);                   
        } 
        else if(actionType == 'list') {
            $state.go('patientemr.patientallergies');
        }
        else if(actionType == 'settings') {
            //TODO
        }
        else if(actionType == "add"){
            utl.Modal.open('app.appointment', {
                    params: { id:0 },
                    confirmCallback: $scope.getList
                }
            );            
        }
    }

    //Grid Actions
    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'appointment/Appointment/DeleteAppointment',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

   }

appointmentSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();