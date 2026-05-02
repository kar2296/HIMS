(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ABGChartFormController', ABGChartFormController);

    function ABGChartFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.abgparameters1 = [];
        $scope.abgparameters2 = [];
        $scope.chartparams = [];
        $scope.abgchartparams = [];
        $scope.Item = [];
        $scope.currentcontext = {};
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        $scope.item = {
            ABGChartDate: utl.Formatter.getCurrentDate(),
            ABGChartTime: time,
            EncounterId: utl.Session.getEncounterId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            abgparam1: [],
            abgparam2: [],
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
                    action: 'emr/PatientABGChart/GetPatientABGChartById',
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
        function afterGet(res) {
            $scope.abgchartparams = res.Data;
            for (var idx in res.Data) {
                if (res.Data.length > 2) {
                    var listLength = res.Data.length;
                    var pageCount = Math.ceil(listLength / 2);
                }
                for (var i = 0; i < pageCount; i++) {
                    var parameter = res.Data[i];
                    var params = {
                        Id: parameter.Id, Text: parameter.ABGParameters, Rangefrom: parameter.NormalFrom,
                        Rangeto: parameter.NormalTo
                    };
                    $scope.chartparams.push(params);
                    $scope.addParams(params);
                }
                for (var i = pageCount; i >= pageCount; i++) {
                    var parameter = res.Data[i];
                    var params = {
                        Id: parameter.Id, Text: parameter.ABGParameters, Rangefrom: parameter.NormalFrom,
                        Rangeto: parameter.NormalTo
                    };
                    $scope.chartparams.push(params);
                    $scope.abgparams(params);
                }
                return $scope.addParams;
            }
        }
        $scope.addParams = function (params) {
            var item = {
                PatientId: $scope.currentcontext.pid,
                ABGParameters: params.Text,
                Rangefrom: params.Rangefrom,
                Rangeto: params.Rangeto,
                ABGChartDate: utl.Formatter.getCurrentDate(),
                EncounterTypeId: $scope.currentcontext.encounter.EncounterTypeId,
                Status: 1,
            };
            $scope.abgparameters1.push(item);
            // $scope.getqualifier1(item);
        }
        $scope.abgparams = function (params) {
            var item = {
                PatientId: $scope.currentcontext.pid,
                ABGParameters: params.Text,
                Rangefrom: params.Rangefrom,
                Rangeto: params.Rangeto,
                ABGChartDate: utl.Formatter.getCurrentDate(),
                EncounterTypeId: $scope.currentcontext.encounter.EncounterTypeId,
                Status: 1,
                ABGChartDate: utl.Formatter.getCurrentDate(),
                EncounterTypeId: $scope.currentcontext.encounter.EncounterTypeId
            };
            $scope.abgparameters2.push(item);
        }
        $scope.getabgparametersCallback = function (scope, res, options, hasError) {
            if (res.Data) {
                afterGet(res);
            }
        };

        $scope.getabgparameters = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/ABGParameters/GetABGParameterss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getabgparametersCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            for (var i = 0; i < $scope.abgparameters1.length; i++) {
                var parameter = $scope.abgparameters1[i];
                var data = {
                    ABGChartDate: $scope.item.ABGChartDate,
                    ABGChartTime: $scope.item.ABGChartTime,
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    FacilityId: $scope.item.FacilityId,
                    EncounterTypeId: $scope.item.EncounterTypeId,
                    ABGParameters: parameter.ABGParameters,
                    ParameterValues: parameter.ParameterValues || 0,
                    Comments: $scope.item.Comments,
                    NormalFrom: parameter.Rangefrom,
                    NormalTo: parameter.Rangeto,
                    QualifierId: $scope.item.QualifierId
                }
                // $scope.getqualifier();
                $scope.Item.push(data)
            }
            for (var i = 0; i < $scope.abgparameters2.length; i++) {
                var parameter = $scope.abgparameters2[i];
                var data = {
                    ABGChartDate: $scope.item.ABGChartDate,
                    ABGChartTime: $scope.item.ABGChartTime,
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    FacilityId: $scope.item.FacilityId,
                    EncounterTypeId: $scope.item.EncounterTypeId,
                    ABGParameters: parameter.ABGParameters,
                    ParameterValues: parameter.ParameterValues || 0,
                    Comments: $scope.item.Comments,
                    NormalFrom: parameter.Rangefrom,
                    NormalTo: parameter.Rangeto,
                }
                $scope.Item.push(data)

            }
            var Qualifier = [];
            Qualifier = $scope.Item;
            function getqualifier(Qualifier) {
                var result = [];
                for (var qid in Qualifier) {
                    var refrange = Qualifier[qid];
                    // if (refrange.ParameterValues) {


                        if (refrange.ridht >= 80 && refrange.ParameterValues <= 120) {
                            refrange.QualifierId = 1; //Normal
                            refrange.Qualifier = 'Normal';
                        }   

                        if (refrange.ParameterValues < 80 || refrange.ParameterValues == 0) {
                            refrange.QualifierId = 2; //Below Normal
                            refrange.Qualifier = 'Below Normal';
                        }


                        if (refrange.ParameterValues >= refrange.NormalFrom && refrange.ParameterValues <= refrange.NormalTo) {
                            refrange.QualifierId = 1; //Normal
                            refrange.Qualifier = 'Normal';
                        }
                        if (refrange.ParameterValues < refrange.NormalFrom || refrange.ParameterValues == 0) {
                            refrange.QualifierId = 2; //Below Normal
                            refrange.Qualifier = 'Below Normal';
                        }
                        if (refrange.ParameterValues > refrange.NormalTo) {
                            refrange.QualifierId = 3; //Above Normal
                            refrange.Qualifier = 'Above Normal';
                        }
                        result.push(refrange);
                    // }
                    }
                return result;
                }
            var lines = getqualifier(Qualifier);
            var actionName = 'emr/PatientABGChart/AddPatientABGChart';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PatientABGChart/UpdatePatientABGChart';
            }

            var options = {
                action: actionName,
                data: { Data: lines },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getabgparameters();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DiscountMode" },
                { "Key": "Qualifier" }
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

    ABGChartFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();