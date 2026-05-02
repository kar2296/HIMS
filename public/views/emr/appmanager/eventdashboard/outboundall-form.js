(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('outboundAllFormController', outboundAllFormController);

    function outboundAllFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            EventStatusId: 1, // Status -> Pending 
            EventSourceId: 1, // Source -> sender 
            EventDataTypeId: 1, // EventDataTypeId -  Transform Message type -> XML, HL7 
            EventDestinationId: 1, // EventDestinationId - Provider eg. SMS , HL7 , ASTM, Email etc.... 
            EventTypeId: 3,  // EventType - Message , Order , Demographics
            EventDirectionId: 2, //  Created for outbound  
            onlyview: true 
        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);

            if(!$scope.currentcontext.id)
                $scope.item.onlyview = false; 

            if($scope.currentcontext.id && $scope.currentcontext.id == 0)
                $scope.item.onlyview = false; 

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
             if (data.EventStatusId == 2)
                $scope.item.isRequested = true;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'SystemSettings/EventDashboard/GetEventDashboardById',
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
         $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
 

            $scope.item.Title = $scope.selectedPatient.Title.Description
            $scope.item.MRN = $scope.selectedPatient.MRN;
            $scope.item.FirstName = $scope.selectedPatient.FirstName;
            $scope.item.LastName = $scope.selectedPatient.LastName;
            $scope.item.MiddleName = $scope.selectedPatient.MiddleName; 
            $scope.item.Mobile = $scope.selectedPatient.Mobile;
            $scope.item.Age = $scope.selectedPatient.Age;
            $scope.item.DOB = $scope.selectedPatient.DOB;
            $scope.item.Gender = $scope.selectedPatient.Gender.Description;
            $scope.item.AddressLine1 = $scope.selectedPatient.AddressLine1;
            $scope.item.AddressLine2 = $scope.selectedPatient.AddressLine2;
            $scope.item.City = $scope.selectedPatient.City;
            $scope.item.Country = $scope.selectedPatient.Country;
            $scope.item.City = $scope.selectedPatient.City;
            $scope.item.State = $scope.selectedPatient.State;
            $scope.item.Pincode = $scope.selectedPatient.Pincode;
            $scope.item.Email = $scope.selectedPatient.Email;
            $scope.item.Phonenr = $scope.selectedPatient.Mobile ? $scope.selectedPatient.Mobile : $scope.selectedPatient.LandLine;
           
              

            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.fnencounter();
            if ($scope.currentfilter.PatientId > 0 && !$scope.item.BillNumber) {
                $scope.isSaving = false;
                $scope.outstanding = false;
                $scope.EnableDisableDropdown($scope.isSaving);

                if ($scope.currentcontext.id <= 0)
                    $scope.getBillInfoByPatientID();
            }

        }
        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }
        $scope.clear = function () {
            $scope.item = {};
        }

        // $scope.saveItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        //     $scope.backToList();
        // };
         $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
               if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            }
            else if (typeof (data) == "number") {
               //  $state.go('app.usertab.general');      
            //    $state.go('app.eventdashboardtab.outboundall', { id: data });   
             $scope.backToList();   
            }
          
        };

        $scope.HL7Format = function(){
            console.log($scope.item);
            var enventsourceobj  = $scope.lookup.EventSource[$scope.item.EventSourceId]; 
            var currentdate = new Date();
            var currentdatesendingformat = moment(currentdate).format("YYYYMMDDHHmmss"); 
            var dataformation ="";
            dataformation += "MSH|^~\&|"+enventsourceobj.Text+"|"+enventsourceobj.Text+"|REC_APPLICATION|REC_FACILITY|"+currentdatesendingformat+"||ADT^A04||P|2.3||||";
            dataformation +="EVN|A04|"+currentdatesendingformat+"|||";            
            dataformation +="PID|1||"+$scope.item.MRN+"||"+$scope.item.LastName+"^"+$scope.item.FirstName+"^"+$scope.item.MiddleName;
            dataformation += "||"+$scope.item.DOB+"|"+$scope.item.Gender+"|||"+$scope.item.AddressLine1+"^"+$scope.item.AddressLine2;
            dataformation += "^"+$scope.item.City+"^"+$scope.item.State+"^";
            dataformation +=  ""+$scope.item.Pincode+"||"+$scope.item.Phonenr+"^^^"+$scope.item.Email+"|||||1719|99999999||||||||||||||||||||";          
            dataformation += "PV1|1|O||||||||||||||||||||||||||||||||||||||||||||||||||"; 
            return dataformation;
            
        }

        

        $scope.saveItem = function () {
            

            if(!$scope.item.EventData)
                $scope.item.EventData = $scope.HL7Format(); 

            if(!$scope.item.EventMessag)
                $scope.item.EventMessage = $scope.HL7Format(); 

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'SystemSettingsEventDashboard/AddEventDashboard';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'SystemSettingsEventDashboard/UpdateEventDashboard';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        //autosearch related code start
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Patient Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Ward Name', field: 'WardName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Room No.', field: 'RoomNo', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Bed No.', field: 'BedNo', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'Encounter/Visit/GetEncounters',
            presearch: presearchencounter,
            formatdisplay: formatselectedencounter,
            postsearch: postsearchencounter
        };

        function formatselectedencounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            $scope.item.PatientId = result.PatientId;
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            } else if (vm.patientcontrolconfig.rowdata) {
                result = [vm.patientcontrolconfig.rowdata.Patient.Title.Description, vm.patientcontrolconfig.rowdata.Patient.FirstName].join(' ');
            }
            $scope.getEncounterInfo();
            return result;
        }

        function presearchencounter() {
            var query = vm.patientcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [
                    { Key: 15, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 11, Value: query });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchencounter() {
            debugger;
            for (var idx in vm.patientcontrolconfig.result) { 
                var item = vm.patientcontrolconfig.result[idx];
                item.PatientName = item.Patient.FirstName;
                item.WardName = item.WardMaster.WardName;
                item.RoomNo = item.WardRoomMaster.RoomNo;
                item.BedNo = item.WardRoomBedMaster.BedNo;
                
                // $scope.item.FirstName  = item.Patient.FirstName;
                // $scope.item.LastName  = item.Patient.LastName;
                // $scope.item.PMiddleName  = '';
                // $scope.item.MRN  = item.Patient.MRN;
                // $scope.item.MRN  = item.Patient.do; DOB


            }
        }
        //autosearch related code ends


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { Key: "EventSource" },
                { Key: "EventStatus" },
                { Key: "EventType", Default: false },
                { Key: "EventDataType" },
                { Key: "EventDestination" },
                { Key: "EventDirection" },
                { Key: "EntityType" },
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

    outboundAllFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();