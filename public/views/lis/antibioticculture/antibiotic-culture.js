(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('AntibioticCultureController', AntibioticCultureController);

    function AntibioticCultureController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        
        $scope.onGramStainChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.GramStain = html;
            });
        };
        $scope.onRemarksChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.Remarks = html;
            });
        };
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

        var vm = this;

        $scope.SpecimenName = '';
        $scope.OrganismIsolated = '';
        $scope.ReturnResult = '';
        $scope.antibiotics1 = [];
        $scope.antibiotics2 = [];
        $scope.antibiotics = [];
        $scope.antibioticsresult = [];
        $scope.Item = [];
        $scope.currentcontext = {};
        $scope.item = {
            OrderedDate: utl.Formatter.getCurrentDate(),
            GramStain: '',
            ColonyCount: '',
            Blood: '',
            Remarks: '',
        };
        if (modalConfig && modalConfig.params) {
            // $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.orderid = parseInt(modalConfig.params.orderid);
            $scope.currentcontext.woid = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.OrderId = $scope.currentcontext.orderid;
        $scope.item.WorkOrderId = $scope.currentcontext.woid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getItemCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item = data.Data[0];

                if ($scope.item.SpecimenId)
                    $scope.SpecimenName = utl.Lookup.getDesc($scope.lookup.SampleMaster,
                        $scope.item.SpecimenId);
                if ($scope.item.OrganismIsolatedId)
                    $scope.OrganismIsolated = utl.Lookup.getDesc($scope.lookup.OrgIsolation,
                        $scope.item.OrganismIsolatedId);

                for (var idx in data.Data) {
                    var bioticdata = data.Data[idx];
                    var biotics1 = {
                        Id: bioticdata.Id,
                        Antibiotics: bioticdata.Antibiotics,
                        ResultId: bioticdata.ResultId,
                        MCH: bioticdata.MCH
                    }
                    $scope.antibiotics1.push(biotics1);
                }
            }
        };

        $scope.getItem = function(pageNo) {
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.woid },
                    // { Key: 4, Value: 2 },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'lis/PatientWorkOrderAntibiotics/GetPatientWorkOrderAntibioticss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
            // }
        };

        $scope.addorganismmap = function() {
            utl.Modal.open('app.antibiotictab.organismmap', {
                params: {},
                confirmCallback: $scope.initLookup
            });
        }

        $scope.backToList = function() {
            $scope.confirmCallback({ data: $scope.ReturnResult });
        }
        $scope.save = function() {
            $scope.saveItem();
        }
        $scope.clear = function() {
            $scope.item = {};
        }

        function afterGet(res) {
            $scope.antibiotics = res.Data;
            for (var idx in res.Data) {
                if (res.Data.length >= 1) {
                    var listLength = res.Data.length;
                    var pageCount = Math.ceil(listLength);
                }
                for (var i = 0; i < pageCount; i++) {
                    var parameter = res.Data[i];
                    var params = {
                        Id: parameter.Id,
                        Text: parameter.AntibioticMaster.AntibioticName,
                        OrganismId: parameter.OrganismMapId
                    };
                    $scope.addantibiotic(params);
                }
                // for (var i = pageCount; i >= pageCount; i++) {
                //     var parameter = res.Data[i];
                //     var params = {
                //         Id: parameter.Id,
                //         Text: parameter.AntibioticMaster.AntibioticName,
                //         OrganismId: parameter.OrganismMapId
                //     };
                //     $scope.addbiotic(params);
                // }
                return $scope.addantibiotic;
            }
        }
        $scope.addantibiotic = function(params) {
                var item = {
                    Antibiotics: params.Text,
                    OrganismId: params.OrganismId,
                    Status: 1,
                };
                if (item.OrganismId == $scope.item.OrganismIsolatedId)
                    $scope.antibiotics1.push(item);
            }
            // $scope.addbiotic = function(params) {
            //     var item = {
            //         Antibiotics: params.Text,
            //         OrganismId: params.OrganismId,
            //         Status: 1,
            //     };
            //     if (item.OrganismId == $scope.item.OrganismIsolatedId)
            //         $scope.antibiotics2.push(item);
            // }
        $scope.getantibioticsCallback = function(scope, res, options, hasError) {
            if (res.Data) {
                $scope.antibiotics1 = [];
                $scope.antibiotics2 = [];
                afterGet(res);
            }
        };

        $scope.getantibiotics = function() {
            // if ($scope.item.TypeId) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.OrganismIsolatedId },
                    // { Key: 4, Value: 2 },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            // }

            var options = {
                action: 'lis/AntibioticMaster/GetAntibioticOrganismMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getantibioticsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.getSpecimenName = function(SpecimenName) {
            $scope.SpecimenName = '' + SpecimenName;
        };

        $scope.getOrganismIsolated = function(OrganismIsolated) {
            $scope.OrganismIsolated = '' + OrganismIsolated;
            $scope.getantibiotics();
        };


        $scope.loadReturnResult = function() {
            $scope.ReturnResult = '';
            $scope.rightresult = '';
            $scope.leftresult = '';
            var isResult = 0;
            if ($scope.antibiotics1.length > 0) {
                for (var idx in $scope.antibiotics1) {
                    var rightitem = $scope.antibiotics1[idx];
                    if (rightitem.ResultId > 0 || rightitem.MCH) {
                        isResult++;
                    }
                }
            }
            if (isResult > 0) {
                $scope.rightresult += '<table border="0" cellpadding="1" cellspacing="1" style="width:100vw;">';
                $scope.rightresult += '<tbody>';
                $scope.rightresult += '<tr>';
                $scope.rightresult += '<td><b>Antiboitic</b></td>';
                $scope.rightresult += '<td>&nbsp;</td>';
                $scope.rightresult += '<td><b>Result</b></td>';
                $scope.rightresult += '<td>&nbsp;</td>';
                $scope.rightresult += '<td><b>MIC</b></td>';
                $scope.rightresult += '</tr>';
            }
            if ($scope.antibiotics1.length > 0) {
                for (var idx in $scope.antibiotics1) {
                    var rightitem = $scope.antibiotics1[idx];
                    if (rightitem.ResultId > 0 || rightitem.MCH) {
                        isResult++;
                        $scope.rightresult += '<tr>';
                        $scope.rightresult += '<td>' + rightitem.Antibiotics + '</td>';
                        $scope.rightresult += '<td>:</td>';
                        $scope.rightresult += '<td>' + $scope.getResultText(rightitem.ResultId) + '</td>';
                        $scope.rightresult += '<td>:</td>';
                        if(rightitem.MCH) {
                            $scope.rightresult += '<td>' + rightitem.MCH + '</td>';
                        } else {
                            // rightitem.MCH = 'null';
                            $scope.rightresult += '<td></td>';
                        }

                        $scope.rightresult += '</tr>';
                    }
                }
                if (isResult > 0) {
                    $scope.rightresult += '</tbody></table>';
                }
            }
            // $scope.leftresult += '<table border="0" cellpadding="1" cellspacing="1" style="width:100%;">';
            // $scope.leftresult += '<tbody>';
            // $scope.leftresult += '<tr>';
            // $scope.leftresult += '<td>Antiboitic</td>';
            // $scope.rightresult += '<td>&nbsp;</td>';
            // $scope.leftresult += '<td>Result</td>';
            // $scope.leftresult += '</tr>';
            // for (var idx in $scope.antibiotics2) {
            //     var leftitem = $scope.antibiotics2[idx];
            //     if (leftitem.ResultId) {
            //         $scope.leftresult += '<tr>';
            //         $scope.leftresult += '<td>' + leftitem.Antibiotics + '</td>';
            //         $scope.leftresult += '<td>:</td>';
            //         $scope.leftresult += '<td>' + $scope.getResultText(leftitem.ResultId) + '</td>';
            //         $scope.leftresult += '</tr>';
            //     }
            // }
            // $scope.leftresult += '</tbody></table>';


            $scope.ReturnResult += '<table border="0" cellpadding="1" cellspacing="1" style="width:100vw;">';
            $scope.ReturnResult += '<tbody>';
            if ($scope.SpecimenName) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Specimen Name</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.SpecimenName + '</td>';
                $scope.ReturnResult += '</tr>';
            }
            if ($scope.item.ColonyCount) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Growth</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.item.ColonyCount + '</td>';
                $scope.ReturnResult += '</tr>';
            }
            if ($scope.item.MicroNo) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Micro No.</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.item.MicroNo + '</td>';
                $scope.ReturnResult += '</tr>';
            }
            if ($scope.item.Blood) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Site</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.item.Blood + '</td>';
                $scope.ReturnResult += '</tr>';
            }
            if ($scope.item.CultureReport) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Culture Report</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.item.CultureReport + '</td>';
                $scope.ReturnResult += '</tr>';
            }
            if ($scope.OrganismIsolated) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Organism Isolated</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.OrganismIsolated + '</td>';
                $scope.ReturnResult += '</tr>';
            }

            if ($scope.item.GramStain) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Gram Stain</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.item.GramStain + '</td>';
                $scope.ReturnResult += '</tr>';
            }
            if ($scope.item.Remarks) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td colspan="4">' + '<br>' + '</td>';
                $scope.ReturnResult += '</tr>';
            }
            if ($scope.item.Remarks) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td><b>Remarks</b></td>';
                $scope.ReturnResult += '<td>:</td>';
                $scope.ReturnResult += '<td colspan= 3>' + $scope.item.Remarks + '</td>';
                $scope.ReturnResult += '</tr>';
            }

            // $scope.ReturnResult += '<tr>';
            // $scope.ReturnResult += '<td colspan= 6>' + $scope.OrganismIsolated + '</td>';
            // $scope.ReturnResult += '</tr>';\
            if ($scope.rightresult) {
                $scope.ReturnResult += '<tr>';
                $scope.ReturnResult += '<td vlign=top>' + $scope.rightresult + '</td>';
                $scope.ReturnResult += '<td>&nbsp;</td>';
                $scope.ReturnResult += '<td vlign=top>' + $scope.leftresult + '</td>';
                $scope.ReturnResult += '</tr>';
            }

            $scope.ReturnResult += '</tbody></table>';

        };

        $scope.getResultText = function(ResultId) {
            return utl.Lookup.getDesc($scope.lookup.CultureResult, ResultId);
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.loadReturnResult();
            for (var i = 0; i < $scope.antibiotics1.length; i++) {
                var parameter = $scope.antibiotics1[i];
                var data = {
                        Id: parameter.Id || 0,
                        OrderedDate: $scope.item.OrderedDate,
                        PatientId: $scope.item.PatientId,
                        EncounterId: $scope.item.EncounterId,
                        OrderId: $scope.item.OrderId,
                        WorkOrderId: $scope.item.WorkOrderId,
                        SpecimenId: $scope.item.SpecimenId,
                        OrganismIsolatedId: $scope.item.OrganismIsolatedId,
                        GramStain: $scope.item.GramStain,
                        Blood: $scope.item.Blood,
                        MicroNo: $scope.item.MicroNo,
                        CultutreReport: $scope.item.CultutreReport,
                        Remarks: $scope.item.Remarks,
                        ColonyCount: $scope.item.ColonyCount,
                        // TypeId: $scope.item.TypeId,
                        Antibiotics: parameter.Antibiotics,
                        ResultId: parameter.ResultId,
                        MCH: parameter.MCH
                    }
                    // $scope.getqualifier();
                $scope.Item.push(data)
            }
            for (var i = 0; i < $scope.antibiotics2.length; i++) {
                var parameter = $scope.antibiotics2[i];
                var data = {
                    Id: parameter.Id,
                    OrderedDate: $scope.item.OrderedDate,
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    OrderId: $scope.item.OrderId,
                    WorkOrderId: $scope.item.WorkOrderId,
                    SpecimenId: $scope.item.SpecimenId,
                    OrganismIsolatedId: $scope.item.OrganismIsolatedId,
                    GramStain: $scope.item.GramStain,
                    Blood: $scope.item.Blood,
                    MicroNo: $scope.item.MicroNo,
                    CultutreReport: $scope.item.CultutreReport,
                    Remarks: $scope.item.Remarks,
                    ColonyCount: $scope.item.ColonyCount,
                    // TypeId: $scope.item.TypeId,
                    Antibiotics: parameter.Antibiotics,
                    ResultId: parameter.ResultId,
                }
                $scope.Item.push(data)

            }

            // var actionName = 'lis/PatientWorkOrderAntibiotics/AddPatientWorkOrderAntibiotics';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     actionName = 'lis/PatientWorkOrderAntibiotics/ManagePatientWorkOrderAntibiotics';
            // }

            var lines = getLinesForSave();
            console.log(lines);
            // return;
            var options = {
                action: 'lis/PatientWorkOrderAntibiotics/ManagePatientWorkOrderAntibiotics',
                data: { Data: lines },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.Item) {
                var item = $scope.Item[idx];
                if (item.OrganismIsolatedId > 0) {
                    item.OrderedDate = $scope.item.OrderedDate;
                    item.PatientId = $scope.item.PatientId;
                    item.EncounterId = $scope.item.EncounterId;
                    item.OrderId = $scope.item.OrderId;
                    item.WorkOrderId = $scope.item.WorkOrderId;
                    item.SpecimenId = $scope.item.SpecimenId;
                    item.OrganismIsolatedId = $scope.item.OrganismIsolatedId;
                    item.GramStain = $scope.item.GramStain;
                    item.Blood = $scope.item.Blood;
                    item.Remarks = $scope.item.Remarks;
                    item.MicroNo = $scope.item.MicroNo;
                    item.CultutreReport = $scope.item.CultutreReport;
                    item.ColonyCount = $scope.item.ColonyCount;
                    // item.OrganismId = $scope.item.OrganismId;
                    item.Antibiotics = item.Antibiotics;
                    item.MCH = item.MCH;
                    item.ResultId = item.ResultId;
                    result.push(item);
                }
            }
            return result;
        }
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            // $scope.getantibiotics();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "CultureResult" },
                { "Key": "AntibioticType" },
                {
                    "Key": "SampleMaster",
                },
                { "Key": "OrgIsolation" },
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

    AntibioticCultureController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();