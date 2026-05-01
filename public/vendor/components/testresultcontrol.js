(function() {
    'use strict';

    angular
        .module('common.utils')
        .controller('testresultcontrolCtrl', ['utl', '$scope', '$timeout', function(utl, $scope, $timeout) {
            var cvm = this;
            cvm.multilineList = [];

            cvm.keyPress = function(eInner) {
                if (eInner.keyCode == 13) //if its a enter key
                {
                    var tabindex = this.tabindex;
                    tabindex++; //increment tabindex
                    $('[tabindex=' + tabindex + ']').focus();
                    return false;
                }
            }

            $scope.$watch('cvm.testvalue',
                function(newValue) {
                    if (newValue) {
                        cvm.editortext = "Refer Text";
                    } else {
                        cvm.editortext = "Enter Text";
                    }
                });

            $scope.$watch('cvm.multilinedata',
                function(newValue) {
                    $timeout(function() {
                        if (newValue) {
                            var multilineArr = newValue.split(',');
                            var resultArr = [];
                            if (multilineArr && multilineArr.length > 0) {
                                resultArr.push({ Id: null, Text: 'Reset Value' });
                                for (var idx in multilineArr) {
                                    var strText = multilineArr[idx];
                                    var item = { Id: strText, Text: strText };
                                    resultArr.push(item);
                                }
                            }
                            cvm.multilineList = resultArr;
                        }
                    }, 100);
                });

            console.log(cvm);
            cvm.valueChanged = function() {
                $timeout(function() {
                    if (cvm.changeev) {
                        cvm.changeev();
                        cvm.computeQualifier(cvm.currentitem);
                        cvm.computeAllTestValus();
                    }
                }, 100);
            }

            if (!String.prototype.trim) {
                String.prototype.trim = function() {
                    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                };
            }

            cvm.computeQualifier = function(item) {
                if (item.TestValueType == 5 || item.TestValueType == 7) { //Quantitat, Computed value
                    var sresultValue = item.Resultvalue;
                    sresultValue = sresultValue.trim().replace(',', '');
                    var resultValue = parseFloat(sresultValue);
                    if (item.Analyte && item.Analyte.Analyterefmasters && item.Analyte.Analyterefmasters.length > 0) {
                        var refRange = item.Analyte.Analyterefmasters[0];
                        if (resultValue >= refRange.MinValue && resultValue <= refRange.MaxValue) {
                            item.QualifierId = 1; //Normal
                        } else if (resultValue < refRange.MinValue) {
                            item.QualifierId = 2; //Below low normal
                        } else if (resultValue > refRange.MaxValue) {
                            item.QualifierId = 3; //Above high normal
                        }

                        item.Qualifier = utl.Lookup.getDesc(cvm.lookup.Qualifier, item.QualifierId);
                    }
                }
            }

            cvm.computeAllTestValus = function() {
                if (cvm.getformulajson) {
                    var formulaData = cvm.getformulajson();
                    console.log(formulaData);

                    for (var idx in cvm.alldetails) {
                        var item = cvm.alldetails[idx];

                        if (item.Analyte.Formula) {
                            var computedValue = (math.eval(item.Analyte.Formula, formulaData));
                            if (computedValue) {
                                item.Resultvalue = computedValue.toFixed(2);
                                cvm.computeQualifier(item);
                            }
                        }
                    }
                }
            }

            /*
                            cvm.computeResultValue = function() {
                $timeout(function () {
                    if (cvm.getformulajson) {
                        var formulaData = cvm.getformulajson();
                        console.log(formulaData);
                        cvm.testvalue = (math.eval(cvm.analyte.Formula, formulaData)).toFixed(2) ;
                        cvm.valueChanged();
                    }
                }, 100);
            }
            */

            cvm.openRichTextEditor = function() {
                var noteTypeId;
                var subdeptid;
                if (cvm.testtypeid == 1) { //lab
                    noteTypeId = 5;
                    subdeptid = parseInt(utl.Session.getCurrentSubDepartmentId());
                } else if (cvm.testtypeid == 2) { //radiology
                    noteTypeId = 6;
                    subdeptid = parseInt(utl.Session.getCurrentSubDepartmentId());
                }
                if (cvm.iscyto) {
                    utl.Modal.openFixedDialog('app.cytologyform', {
                        params: {
                            richtext: cvm.testvalue,
                            // notetypeid: noteTypeId,
                            // subdeptid: subdeptid,
                            // impressionid: cvm.impressionid,
                            // clinicalfindingid: cvm.clinicalfindingid,
                            orderid: cvm.currentitem.Orderid,
                            woid: cvm.currentitem.Id,
                            pid: cvm.currentitem.Patientid,
                            eid: cvm.currentitem.EncounterId
                        },
                        confirmCallback: cvm.richtexteditorCallback
                    });
                } else {
                    utl.Modal.openFixedDialog('richtexteditor-modal', {
                        params: {
                            richtext: cvm.testvalue,
                            notetypeid: noteTypeId,
                            subdeptid: subdeptid,
                            impressionid: cvm.impressionid,
                            clinicalfindingid: cvm.clinicalfindingid,
                            orderid: cvm.currentitem.Orderid,
                            woid: cvm.currentitem.Id,
                            pid: cvm.currentitem.Patientid,
                            eid: cvm.currentitem.EncounterId
                        },
                        confirmCallback: cvm.richtexteditorCallback
                    });
                }
            }

            cvm.richtexteditorCallback = function(richtext) {
                cvm.testvalue = richtext.editortext;
                cvm.impressionid = richtext.impressionid;
                cvm.clinicalfindingid = richtext.clinicalfindingid;
                cvm.valueChanged();
            }

            cvm.init = function() {
                //Init logic
            }

            //caution : base method, please don't modifiy
            cvm.$onInit = function() {
                $timeout(cvm.init, 100);
            }
        }])
        .component('testresultcontrol', {
            bindings: {
                testvalue: "=",
                impressionid: "=",
                clinicalfindingid: "=",
                testvaluetype: "<",
                multilinedata: "<",
                analyte: '<',
                tabindex: "<",
                changeev: '&',
                getformulajson: '&',
                alldetails: "=",
                currentitem: "=",
                lookup: "=",
                iscyto: "=",
                testtypeid: "<"
            },
            controller: 'testresultcontrolCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/testresultcontrol.html'
        })

})();