(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('AppnttokendisplayController', AppnttokendisplayController);

    function AppnttokendisplayController($scope, $stateParams, $translate, $interval, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        $scope.ListofTokens = [];
        $scope.CurrentPage = 1;
        $scope.PageInitialzation = 1;
        $scope.totalrecord = -1;
        $scope.MissedDisplay = '';
        $scope.FacilityName = '';
        $scope.startinterval = null;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        const synth = window.speechSynthesis;
        var voices = [];
        synth.onvoiceschanged = function() {
            voices = window.speechSynthesis.getVoices();
        };
        // const voices = [];
        // function asyncgetVoices() {
        //     // perform some asynchronous operation, resolve or reject the promise when appropriate.
        //    try {
        //     return synth.getVoices();
        //    } catch(Exception) {

        //    }
        //   }

        //   const voices = asyncgetVoices();
        console.log(voices);
        //return;

        $scope.CallToken = function () {

            var CallData = $filter('filter')($scope.TokenDisplay, {
                Status: 1,
                IsAudioRaised: false,

            });
            console.log(CallData);
            if (CallData.length > 0) {
                for (var i = 0; i < CallData.length; i++) {
                    var data = CallData[i];
                    $scope.theText = '';
                    // $scope.theText += 'Room Number' + data.OPDRoom.Description + ' Token Number' + utl.Formatter.getNumbertoWord(data.TokenNo);
                    $scope.theText += 'Room Number' + data.OPDRoom.Description + ' Token Number' + data.TokenNo;
                    console.log($scope.theText);
                    var utter = new SpeechSynthesisUtterance($scope.theText);
                    console.log(voices);
                    if(voices.length > 1) {
                        utter.voice = voices[2];
                        utter.lang = voices[2].lang;
                    }

                    // window.speechSynthesis.speak(new SpeechSynthesisUtterance($scope.theText));
                    window.speechSynthesis.speak(utter);
                    var actionName = 'Appointment/AppointmentDisplay/UpdateAppointmentDisplay';
                    var item = {
                        Id: data.Id,
                        IsAudioRaised: true
                    };
                    var options = {
                        action: actionName,
                        data: { Data: item },
                        type: 'post',
                        // onComplete: $scope.saveItemCallback
                    };
                    utl.Http.doAction(options);

                }
            }


        };
        $scope.getTokenListCallback = function (scope, res, options, hasError) {
            $scope.ListofTokens = res;

            var listLength = $scope.ListofTokens.length;
            var pageCount = Math.ceil(listLength / 4);
            if ($scope.totalrecord != $scope.ListofTokens.length) {
                $scope.totalrecord = $scope.ListofTokens.length;
                $scope.CurrentPage = 1;
                $scope.PageInitialzation = 1;
                $interval.cancel($scope.startinterval);
            }

            if ($scope.PageInitialzation == 1) {
                $scope.getList($scope.CurrentPage);
                $scope.PageInitialzation++;


                $scope.startinterval = $interval(function () {
                    $scope.getTokenList();
                    if ($scope.CurrentPage <= pageCount) {
                        $scope.getList($scope.CurrentPage);
                        $scope.CurrentPage += 1;
                    } else {
                        $scope.CurrentPage = 1;
                        $scope.getList($scope.CurrentPage);
                    }
                }, 3 * 1000);
            }
        }
        $scope.getTokenList = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { Status: 1, TokenStatusId: 2 }
            };
            var options = {
                action: 'Appointment/AppointmentDisplay/GetListofTokens',
                data: inputData,
                type: 'post',
                onComplete: $scope.getTokenListCallback
            };
            utl.Http.doAction(options);

        };

        $scope.getMissedTokenListCallback = function (scope, res, options, hasError) {
            var MissedTokens = res.Data;
            var MissedTokenDisplay = '';
            for (var i = 0; i < res.Data.length; i++) {
                if (res.Data[i].TokenStatusId == 4) {
                    if (res.Data.length > 0) {
                        MissedTokenDisplay += res.Data[i].TokenNo + ',';
                    }
                }
            }
            $scope.MissedDisplay = MissedTokenDisplay;
        };
        $scope.getMissedTokenList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: 4 },
                    { Key: 4, Value: $scope.currentcontext.id },
                    { Key: 6, Value: utl.Session.getCurrentFacilityId() }
                ],

            };
            var options = {
                action: 'Appointment/AppointmentDisplay/GetAppointmentDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMissedTokenListCallback
            };
            utl.Http.doAction(options);

        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            var totaldata = res.Data;
            for (var i = res.Data.length; i < 4; i++) {
                var emptydata = {
                    "Id": i, "OrganizationId": null, "FacilityId": null, "PatientId": null, "EncounterId": null,
                    "DepartmentId": null, "TokenNo": '', "RoomNo": '', "TokenStatusId": 2, "PatientOrderId": null, "Status": 1,
                    "Rev": null, "CreatedBy": null, "CreatedAt": null, "UpdatedBy": null, "UpdatedAt": null,
                    "TokenStatus": { "Description": null }, "Department": { "DepartmentName": null },
                    "Patient": {
                        "Id": i, "TitleId": '', "FirstName": '', "MiddleName": null, "LastName": '', "MRN": '', "Age": '',
                        "GenderId": '', "DOB": null, "AddressLine1": null, "AddressLine2": null, "Pincode": null, "Area": null, "City": null,
                        "State": null, "Mobile": null, "PhotoPath": null, "MaritalStatusId": null, "Title": { "Description": '' },
                        "Gender": { "Description": '' }, "MaritalStatus": { "Description": null }
                    }
                };
                totaldata.push(emptydata);
            }
            $scope.TokenDisplay = totaldata;
            $scope.CallToken();
            if (totaldata.length > 0 && $scope.FacilityName == '') {
                var rowdisp = totaldata[0];
                if (rowdisp && rowdisp.Facility && rowdisp.Facility.FacilityName)
                    $scope.FacilityName = rowdisp.Facility.FacilityName;
            }
            $scope.getMissedTokenList();
        };
        $scope.getList = function (PageNumber) {
            if ($uibModalInstance) {
                if ($uibModalInstance.closed) {
                    var statusclsd = $uibModalInstance.closed.$$state.status;
                    if (statusclsd == 1) {
                        $interval.cancel($scope.startinterval);
                    }
                }
            }

            var inputData = {
                Params: [
                    { Key: 2, Value: [2, 4] },
                    { Key: 4, Value: $scope.currentcontext.id },
                    { Key: 6, Value: utl.Session.getCurrentFacilityId() }
                ],

                PageContext: {
                    PageSize: 4,
                    PageNumber: PageNumber
                }
            };
            var options = {
                action: 'Appointment/AppointmentDisplay/GetAppointmentDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getTokenList();

    }
    AppnttokendisplayController.$inject = ['$scope', '$stateParams', '$translate', '$interval', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];
})();