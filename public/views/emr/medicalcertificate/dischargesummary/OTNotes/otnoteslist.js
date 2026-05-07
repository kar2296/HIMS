(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('disOTNotesListController', disOTNotesListController);

    function disOTNotesListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "item.DataTemplate".split('.');
                var current = parts[0] === 'vm' ? (typeof vm !== 'undefined' ? vm : $scope.vm) : (parts[0] === 'cvm' ? (typeof cvm !== 'undefined' ? cvm : $scope.cvm) : $scope);
                var startIndex = (parts[0] === 'vm' || parts[0] === 'cvm') ? 1 : 0;
                for (var i = startIndex; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

        var vm = this;

        $scope.item = {};
        $scope.item.DataTemplate = '';

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getOTIds = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 13, Value: $scope.currentcontext.eid },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOTIdsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getOTIdsCallback = function (scope, res, options, hasError) {

            var patientName = '';
            var age = '';
            var SurgenName = '';
            var index = 0;
            for (var idx in res.Data) {
                var OTNotesData = res.Data[idx];

                if (OTNotesData.Patient && OTNotesData.Patient.Title
                    && OTNotesData.Patient.Title.Description)
                    patientName = OTNotesData.Patient.Title.Description;

                if (OTNotesData.Patient && OTNotesData.Patient.FirstName)
                    patientName += ' ' + OTNotesData.Patient.FirstName;

                if (OTNotesData.Patient && OTNotesData.Patient.LastName)
                    patientName += ' ' + Patient.LastName;

                if (OTNotesData.Patient && OTNotesData.Patient.Age)
                    age = ' ' + OTNotesData.Patient.Age + ' Y';

                if (OTNotesData.Patient && OTNotesData.Patient.Gender
                    && OTNotesData.Patient.Gender.Description)
                    age += ' ' + OTNotesData.Patient.Gender.Description;


                if (OTNotesData.ChiefSurgeon && OTNotesData.ChiefSurgeon.Title
                    && OTNotesData.ChiefSurgeon.Title.Description)
                    SurgenName = OTNotesData.ChiefSurgeon.Title.Description;

                if (OTNotesData.ChiefSurgeon && OTNotesData.ChiefSurgeon.FirstName)
                    SurgenName += ' ' + OTNotesData.ChiefSurgeon.FirstName;

                if (OTNotesData.ChiefSurgeon && OTNotesData.ChiefSurgeon.LastName)
                    SurgenName += ' ' + OTNotesData.ChiefSurgeon.LastName;

                if (index == 0) {
                    $scope.item.DataTemplate = '';
                    var PatientInfo = "";
                    PatientInfo += " <table style='height: 73px;' width='100%'> <tbody> ";
                    PatientInfo += " <tr> <td style='width: 50%;'>Patient Name</td> ";
                    PatientInfo += " <td style='width: 50%;'> " + patientName + " </td> </tr> ";
                    PatientInfo += " <tr> <td>Age / Sex</td> <td> " + age + " </td> </tr> ";
                    PatientInfo += " <tr>  <td>Surgen Name</td>  <td> " + SurgenName + " </td>  </tr> ";
                    PatientInfo += " </tbody> </table> <br/>";
                    $scope.item.DataTemplate += PatientInfo;
                    index++;
                }


                for (var idxi in OTNotesData.OtNotes) {
                    var OtNotes = OTNotesData.OtNotes[idxi];
                    $scope.item.DataTemplate += OtNotes.DataTemplate;
                }
            }

        };

        $scope.backToList = function () {
            $scope.cancelCallback();
        };

        $scope.saveItem = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback({ data: $scope.item.DataTemplate });
            }
        };

        $scope.getOTIds();

    }
    disOTNotesListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();