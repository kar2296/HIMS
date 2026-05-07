(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('richTextEditorModalController', richTextEditorModalController);

    function richTextEditorModalController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "vm.editortext".split('.');
                var current = parts[0] === 'vm' ? (typeof vm !== 'undefined' ? vm : $scope.vm) : (parts[0] === 'cvm' ? (typeof cvm !== 'undefined' ? cvm : $scope.cvm) : $scope);
                var startIndex = (parts[0] === 'vm' || parts[0] === 'cvm') ? 1 : 0;
                for (var i = startIndex; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

        $scope.onInsertHtmlDone = function() {
            $scope.$evalAsync(function() {
                $scope.addondata = '';
            });
        };

        var vm = this;
        $scope.ImpressionId = -1;
        $scope.ClinicalFindingId = -1;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        vm.editortext = '';
        $scope.currentcontext = {
            NoteTemplateId: -1,
            CanShowNoteTemplate: false
        };
        // $scope.currentcontext.CanAntibiotics = utl.Privilege.hasPrivilege('CanAntibiotics')
        $scope.Template = [];
        if (modalConfig && modalConfig.params) {
            vm.editortext = modalConfig.params.richtext;
            $scope.currentcontext.NoteTypeId = modalConfig.params.notetypeid;
            $scope.currentcontext.subdeptid = modalConfig.params.subdeptid;
            $scope.currentcontext.orderid = modalConfig.params.orderid;
            $scope.currentcontext.woid = modalConfig.params.woid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.currentcontext.eid = modalConfig.params.eid;

            $scope.currentcontext.ImpressionId = modalConfig.params.impressionid;
            $scope.ImpressionId = modalConfig.params.impressionid;
            $scope.currentcontext.ClinicalFindingsId = modalConfig.params.clinicalfindingid;
            $scope.ClinicalFindingId = modalConfig.params.clinicalfindingid;

            if ($scope.currentcontext.NoteTypeId) {
                $scope.currentcontext.CanShowNoteTemplate = true;
            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        vm.applyClick = function () {
            $scope.confirmCallback({
                editortext: vm.editortext,
                impressionid: $scope.ImpressionId,
                clinicalfindingid: $scope.ClinicalFindingId
            });
        }
        $scope.addimpresion = function () {
            utl.Modal.open('app.impressionmasterform', {
                params: { id: 0 },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.addfindings = function () {
            utl.Modal.open('app.clinicalfindingform', {
                params: { id: 0 },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.antibiotics = function () {
            utl.Modal.openFixedDialog('app.antibiotic-culture', {
                params: {
                    orderid: $scope.currentcontext.orderid, id: $scope.currentcontext.woid,
                    pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid
                },
                confirmCallback: $scope.getAntibioticCallback
            });
        };
        $scope.getAntibioticCallback = function (ReturnResult) {
            vm.editortext += ReturnResult.data;
        };


        //GetNoteTemplateById
        $scope.getNoteTemplateByIdCallback = function (scope, data, options, hasError) {
            vm.editortext += data.DataTemplate;
        };
        $scope.onNoteTemplateChange = function () {
            var options = {
                action: 'clinicalmaster/NoteTemplate/GetNoteTemplateById',
                data: { Id: $scope.currentcontext.NoteTemplateId },
                type: 'post',
                onComplete: $scope.getNoteTemplateByIdCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getImpressionByIdCallback = function (scope, data, options, hasError) {
            $scope.addondata = data.Description;
            vm.editortext += data.Description;
        };

        $scope.onImpressionChange = function () {
            $scope.ImpressionId = $scope.currentcontext.ImpressionId;
            if ($scope.currentcontext.ImpressionId > 0) {
                var options = {
                    action: 'clinicalmaster/ImpressionMaster/GetImpressionMasterById',
                    data: { Id: $scope.currentcontext.ImpressionId },
                    type: 'post',
                    onComplete: $scope.getImpressionByIdCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getFindingsByIdCallback = function (scope, data, options, hasError) {
            $scope.addondata = data.Description;
            vm.editortext += data.Description;
        };
        $scope.onFindingsChange = function () {
            $scope.ClinicalFindingId = $scope.currentcontext.ClinicalFindingsId;
            if ($scope.currentcontext.ClinicalFindingsId > 0) {
                var options = {
                    action: 'clinicalmaster/ClinicalFinding/GetClinicalFindingById',
                    data: { Id: $scope.currentcontext.ClinicalFindingsId },
                    type: 'post',
                    onComplete: $scope.getFindingsByIdCallback
                };
                utl.Http.doAction(options);
            }
        };
        //lookup
        $scope.custom_sort = function (a, b) {
            if (a.TemplateName < b.TemplateName)
                return -1;
            if (a.TemplateName > b.TemplateName)
                return 1;
            return 0;
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var template = $scope.lookup.NoteTemplate;
            template.sort($scope.custom_sort);
            $scope.Template = template;
        }

        $scope.initLookup = function () {

            if ($scope.currentcontext.NoteTypeId && $scope.currentcontext.subdeptid) {
                var inputData = [
                    {
                        "Key": "NoteTemplate",
                        Request: {
                            Params:
                                [
                                    { Key: 1, Value: $scope.currentcontext.NoteTypeId },
                                    { Key: 5, Value: $scope.currentcontext.subdeptid }
                                ]
                        }
                    },
                    { "Key": "Impression" },
                    { "Key": "ClinicalFindings" }
                ]
                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.lookupCallback
                };
                utl.Http.doAction(options);
            }
            else if ($scope.currentcontext.NoteTypeId) {
                var inputData = [
                    { "Key": "NoteTemplate", Request: { Params: [{ Key: 1, Value: $scope.currentcontext.NoteTypeId }] } },
                    { "Key": "Impression" },
                    { "Key": "ClinicalFindings" }
                ]
                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.lookupCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.initLookup();
    }

    richTextEditorModalController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();