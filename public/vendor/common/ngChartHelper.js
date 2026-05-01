(function() {
    'use strict';

    angular
        .module('common.utils')
        .service('ngChartHelper', ['Colors', function (Colors) {

            this.drawPieChart = function (chartContainer, result, options) {
                var colorsArr = ['#4B91CF', '#F27927', '#A5A5A5', '#FCC401'];
                var metaData = result.MetaData;
                var chartData = [];
                var yaxisLabelFormat;

                //Getting data
                var xaxisProp = metaData.xaxis;
                var yaxisProp = metaData.yaxis;

                var result1 = result.Items;
                for (var idx in result1) {
                    var xValue = result1[idx][xaxisProp];
                    var yValue = result1[idx][yaxisProp];

                    chartData.push({ name: xValue, y: yValue });
                }

                //Getting options
                if (options) {
                    if (options.colordata) {
                        colorsArr = options.colordata;
                    }
                    if (options.yaxislabelformat) {
                        yaxisLabelFormat = options.yaxislabelformat;
                    }
                }

                Highcharts.chart(chartContainer, {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: 0,
                        plotShadow: false
                    },
                    title: {
                        text: metaData.charttitle
                    },
                    colors: colorsArr,
                    tooltip: {
                        /*pointFormat: '<b>{point.y}, {point.percentage}%</b>',*/
                        pointFormatter: options.tooltipFormatter || function () {
                            var result = this.y + ', ' + this.percentage + '%';
                            if (yaxisLabelFormat == '$') {
                                result = yaxisLabelFormat + Highcharts.numberFormat(this.y, 0, '.', ',') + ' , '
                                    + Highcharts.numberFormat(this.percentage, 1) + '%';
                            }
                            return result;
                        }
                    },
                    legend: { align: 'center' },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: true,
                                formatter: options.labelFormatter || function () {
                                    var result = this.percentage + '%';

                                    return result;
                                }
                            },
                            showInLegend: true
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: '',
                        data: chartData,
                        innerSize: options && options.innerSize ? options.innerSize : '0%'
                    }]
                });
            }

            //Common chart methods starts
            this.drawColumn2Chart = function (chartContainer, result, options) {
                var yaxisLabelFormat = "";
                var yaxisBarWidth = 30;
                var colorData = ['#4B91CF', '#F27927'];

                var xAxisData = [];
                var bar1Data = [];
                var bar2Data = [];

                var showLegend = true;
                var decimalPrec = 0;

                //Preparing Data
                var metaData = result.MetaData;
                if (metaData) {
                    var xaxisProp = metaData.xaxis;
                    var yaxisArr = metaData.yaxis.split(",");
                    var legendArr = metaData.legend.split(",");

                    var bar1Prop = yaxisArr[0];
                    var bar2Prop = yaxisArr[1];

                    var result1 = result.Items;
                    for (var idx in result1) {
                        var xValue = result1[idx][xaxisProp];
                        var bar1Value = result1[idx][bar1Prop];
                        var bar2Value = result1[idx][bar2Prop];

                        xAxisData.push(xValue);
                        bar1Data.push(bar1Value);
                        bar2Data.push(bar2Value);
                    }

                    //Getting chart options
                    if (options) {
                        if (options.yaxislabelformat) {
                            yaxisLabelFormat = options.yaxislabelformat;
                        }
                        if (options.yaxisbarwidth) {
                            yaxisBarWidth = options.yaxisbarwidth;
                        }
                        if (options.showlegend != undefined) {
                            showLegend = options.showlegend;
                        }
                        if (options.decimalprec) {
                            decimalPrec = options.decimalprec;
                        }
                    }

                    Highcharts.chart(chartContainer, {
                        credits: {
                            enabled: false
                        },
                        chart: {
                            type: 'column',
                            backgroundColor: '#f5f7fa'
                        },
                        title: {
                            text: metaData.charttitle
                        },
                        colors: colorData,
                        tooltip: {
                            pointFormatter: function () {
                                var result = this.y;
                                if (yaxisLabelFormat == '$') {
                                    result = yaxisLabelFormat + Highcharts.numberFormat(this.y, decimalPrec, '.', ',');
                                } else if (yaxisLabelFormat == '%') {
                                    result = Highcharts.numberFormat(this.y, decimalPrec, '.', ',') + yaxisLabelFormat;
                                }
                                return result;
                            }
                        },
                        xAxis: {
                            categories: xAxisData,
                            title: {
                                text: metaData.xaxistitle
                            }
                        },
                        yAxis: {
                            min: metaData.yaxismin,
                            max: metaData.yaxismax,
                            tickInterval: metaData.yaxisinterval,
                            title: {
                                text: metaData.yaxistitle
                            },
                            labels: {
                                formatter: function () {
                                    var result = this.value;
                                    if (yaxisLabelFormat == '$') {
                                        result = yaxisLabelFormat + Highcharts.numberFormat(this.value, decimalPrec, '.', ',');
                                    } else if (yaxisLabelFormat == '%') {
                                        result = Highcharts.numberFormat(this.value, decimalPrec, '.', ',') + yaxisLabelFormat;
                                    }
                                    return result;
                                }
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: yaxisBarWidth,
                                dataLabels: {
                                    enabled: true,
                                    formatter: function () {
                                        var result = this.y;
                                        if (yaxisLabelFormat == '$') {
                                            result = yaxisLabelFormat + Highcharts.numberFormat(this.y, decimalPrec, '.', ',');
                                        } else if (yaxisLabelFormat == '%') {
                                            result = Highcharts.numberFormat(this.y, decimalPrec, '.', ',') + yaxisLabelFormat;
                                        }
                                        return result;
                                    }
                                }
                            }
                        },
                        legend: {
                            enabled: showLegend
                        },
                        series: [{
                            name: legendArr[0],
                            data: bar1Data
                        },
                        {
                            name: legendArr[1],
                            data: bar2Data
                        }]
                    });
                }
            }

            this.getKnobChartOptions = function (result, options) {

                var knobLoaderOptions = {
                    width : '80%',
                    displayInput: true,
                    fgColor: Colors.byName('info'),
                    bgColor: Colors.byName('gray'),
                    angleOffset: -125,
                    angleArc: 250,
                    readOnly: true
                };

                return knobLoaderOptions;
            }

            this.getKnobChartData = function (result, options) {

                var knobLoaderOptions = {
                    width: '80%',
                    displayInput: true,
                    fgColor: Colors.byName('info'),
                    bgColor: Colors.byName('gray'),
                    angleOffset: -125,
                    angleArc: 250,
                    readOnly: true,
                    draw: function () {
                        this.i.val(this.cv + '%');
                    }
               };


                /*

                ,
                    format : function (value) {
                        return value + '%';
                    } */

                var respVal = 0;
                var metaData = result.MetaData;
                var yaxisProp = metaData.yaxis;
                var result1 = result.Items;
                for (var idx in result1) {
                    respVal = result1[idx][yaxisProp];
                }

                if (options && options.reverse) {
                    var fVal = parseFloat(respVal);
                    if (fVal <= 40) {
                        knobLoaderOptions.fgColor = Colors.byName('danger');
                    } else if (fVal > 40 && fVal <= 70) {
                        knobLoaderOptions.fgColor = Colors.byName('warning');
                    } else if (fVal > 70 && fVal <= 100) {
                        knobLoaderOptions.fgColor = Colors.byName('success');
                    }
                }
                else {
                    var fVal = parseFloat(respVal);
                    if (fVal <= 40) {
                        knobLoaderOptions.fgColor = Colors.byName('success');
                    } else if (fVal > 40 && fVal <= 70) {
                        knobLoaderOptions.fgColor = Colors.byName('warning');
                    } else if (fVal > 70 && fVal <= 100) {
                        knobLoaderOptions.fgColor = Colors.byName('danger');
                    }
                }

                var response = {
                    val: respVal,
                    options : knobLoaderOptions
                };

                return response;
            }

            this.drawGaugeChart = function (chartContainer, result, options) {
                var metaData = result.MetaData;
                var chartData = [];
                var yaxisProp = metaData.yaxis;
                var plotBnds = [];
                var yaxisLabelFormat;
                var chartBackground = '#f5f7fa';

                var result1 = result.Items;
                for (var idx in result1) {
                    var yValue = result1[idx][yaxisProp];

                    chartData.push(yValue);
                }

                if (options) {
                    plotBnds = options.plotbands || plotBnds;
                    yaxisLabelFormat = options.yaxislabelformat || yaxisLabelFormat;
                    chartBackground = options.background || chartBackground;
                }

                Highcharts.chart(chartContainer, {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: 'gauge',
                        plotBackgroundColor: null,
                        plotBackgroundImage: null,
                        plotBorderWidth: 0,
                        plotShadow: false,
                        backgroundColor: chartBackground                        
                    },
                    title: {
                        text: metaData.charttitle,
                    },
                    pane: {
                        startAngle: -150,
                        endAngle: 150,
                        background: [{
                            backgroundColor: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0, '#FFF'],
                                    [1, '#333']
                                ]
                            },
                            borderWidth: 0,
                            outerRadius: '109%'
                        }, {
                            backgroundColor: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0, '#333'],
                                    [1, '#FFF']
                                ]
                            },
                            borderWidth: 1,
                            outerRadius: '107%'
                        }, {
                            // default background
                        }, {
                            backgroundColor: '#DDD',
                            borderWidth: 0,
                            outerRadius: '105%',
                            innerRadius: '103%'
                        }]
                    },

                    yAxis: [{
                        min: metaData.yaxismin,
                        max: metaData.yaxismax,
                        minorTickInterval: 'auto',
                        minorTickWidth: 1,
                        minorTickLength: 10,
                        minorTickPosition: 'inside',
                        minorTickColor: '#666',

                        tickPixelInterval: 30,
                        tickWidth: 2,
                        tickPosition: 'inside',
                        tickLength: 10,
                        tickColor: '#666',
                        labels: {
                            step: 2,
                            rotation: 'auto'
                        },
                        plotBands: plotBnds
                    }],

                    series: [{
                        name: metaData.legend,
                        data: chartData,
                        dataLabels: {
                            formatter: function () {
                                var yValue = this.y;
                                var result = '<span style="color:#339">' + yValue + '</span>';
                                if (yaxisLabelFormat == '$') {
                                    result = '<span style="color:#339">$' + yValue + 'k</span>';
                                } else if (yaxisLabelFormat == '%') {
                                    result = '<span style="color:#339">' + yValue + '%</span>';
                                }
                                return result;
                            },
                            backgroundColor: {
                                linearGradient: {
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 1
                                },
                                stops: [
                                    [0, '#DDD'],
                                    [1, '#FFF']
                                ]
                            }
                        },
                        tooltip: {
                            valueSuffix: ''
                        }
                    }]
                }
                );
            }

            this.drawLineChart = function (chartContainer, result, options) {
                var yaxisLabelFormat = "";
                var yaxisBarWidth = 40;
                var colorData = ['#4B91CF', '#F27927', '#A5A5A5', '#FCC401'];

                var xAxisData = [];
                var seriesDict = {};

                var showLegend = true;
                var decimalPrec = 0;

                //Preparing Data
                var metaData = result.MetaData;
                if (metaData) {
                    var xaxisProp = metaData.xaxis;
                    var yaxisArr = metaData.yaxis.split(",");
                    var legendArr = metaData.legend.split(",");

                    var result1 = result.Items;
                    for (var idx in result1) {
                        var xValue = result1[idx][xaxisProp];
                        xAxisData.push(xValue);

                        for (var yidx in yaxisArr) {
                            var yprop = yaxisArr[yidx];
                            if (!seriesDict[yprop]) {
                                seriesDict[yprop] = { name: legendArr[yidx], data: [] };
                            }
                            seriesDict[yprop].data.push(result1[idx][yprop]);
                        }

                    }
                    var seriesData = [];
                    for (var key in seriesDict) {
                        seriesData.push(seriesDict[key]);
                    }

                    //Getting chart options
                    if (options) {
                        if (options.yaxislabelformat) {
                            yaxisLabelFormat = options.yaxislabelformat;
                        }
                        if (options.yaxisbarwidth) {
                            yaxisBarWidth = options.yaxisbarwidth;
                        }
                        if (options.showlegend != undefined) {
                            showLegend = options.showlegend;
                        }
                        if (options.decimalprec) {
                            decimalPrec = options.decimalprec;
                        }
                    }

                    var chartOptions = {
                        credits: {
                            enabled: false
                        },
                        chart: {
                            type: 'line'
                        },
                        title: {
                            text: metaData.charttitle
                        },
                        colors: colorData,
                        tooltip: {
                            pointFormatter: function () {
                                var result = this.y;
                                if (yaxisLabelFormat == '$') {
                                    result = yaxisLabelFormat + Highcharts.numberFormat(this.y, decimalPrec, '.', ',');
                                } else if (yaxisLabelFormat == '%') {
                                    result = Highcharts.numberFormat(this.y, decimalPrec, '.', ',') + yaxisLabelFormat;
                                }
                                return result;
                            }
                        },
                        xAxis: {
                            categories: xAxisData,
                            title: {
                                text: metaData.xaxistitle
                            }
                        },
                        yAxis: {
                            min: metaData.yaxismin,
                            max: metaData.yaxismax,
                            tickInterval: metaData.yaxisinterval,
                            title: {
                                text: metaData.yaxistitle
                            },
                            labels: {
                                formatter: function () {
                                    var result = this.value;
                                    if (yaxisLabelFormat == '$') {
                                        result = yaxisLabelFormat + Highcharts.numberFormat(this.value, decimalPrec, '.', ',');
                                    } else if (yaxisLabelFormat == '%') {
                                        result = Highcharts.numberFormat(this.value, decimalPrec, '.', ',') + yaxisLabelFormat;
                                    }
                                    return result;
                                }
                            }
                        },
                        legend: {
                            enabled: showLegend
                        },
                        series: seriesData
                    };
                    
                    if(options.legend) {
                        chartOptions.legend = options.legend;
                    }

                    Highcharts.chart(chartContainer, chartOptions);
                }
            }

            this.drawColumnChart = function (chartContainer, result, options) {
                     var yaxisLabelFormat = "";
                var yaxisBarWidth = 40;

                var xAxisData = [];
                var seriesDict = {};

                var showLegend = true;
                var decimalPrec = 0;

                //Preparing Data
                var metaData = result.MetaData;
                if (metaData) {
                    var xaxisProp = metaData.xaxis;
                    var yaxisArr = metaData.yaxis.split(",");
                    var legendArr = metaData.legend.split(",");

                    var result1 = result.Items;
                    for (var idx in result1) {
                        var xValue = result1[idx][xaxisProp];
                        xAxisData.push(xValue);

                        for (var yidx in yaxisArr) {
                            var yprop = yaxisArr[yidx];
                            if (!seriesDict[yprop]) {
                                seriesDict[yprop] = { name: legendArr[yidx], data: [] };
                            }
                            seriesDict[yprop].data.push(result1[idx][yprop]);
                        }

                    }
                    var seriesData = [];
                    for (var key in seriesDict) {
                        seriesData.push(seriesDict[key]);
                    }

                    //Getting chart options
                    if (options) {
                        if (options.yaxislabelformat) {
                            yaxisLabelFormat = options.yaxislabelformat;
                        }
                        if (options.yaxisbarwidth) {
                            yaxisBarWidth = options.yaxisbarwidth;
                        }
                        if (options.showlegend) {
                            showLegend = options.showlegend;
                        }
                        if (options.decimalprec) {
                            decimalPrec = options.decimalprec;
                        }
                    }

                    Highcharts.chart(chartContainer, {
                        credits: {
                            enabled: false
                        },
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: metaData.charttitle
                        },
                        xAxis: {
                            categories: xAxisData,
                            title: {
                                text: metaData.xaxistitle
                            }
                        },
                        yAxis: {
                            min: metaData.yaxismin,
                            max: metaData.yaxismax,
                            tickInterval: metaData.yaxisinterval,
                            title: {
                                text: metaData.yaxistitle
                            },
                            labels: {
                                formatter: function () {
                                    var result = this.value;
                                    if (yaxisLabelFormat == '$') {
                                        result = yaxisLabelFormat + Highcharts.numberFormat(this.value, decimalPrec, '.', ',');
                                    } else if (yaxisLabelFormat == '%') {
                                        result = Highcharts.numberFormat(this.value, decimalPrec, '.', ',') + yaxisLabelFormat;
                                    }
                                    return result;
                                }
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: yaxisBarWidth,
                                dataLabels: {
                                    enabled: true,
                                    formatter: function () {
                                        var result = this.y;
                                        if (yaxisLabelFormat == '$') {
                                            result = yaxisLabelFormat + Highcharts.numberFormat(this.y, decimalPrec, '.', ',');
                                        } else if (yaxisLabelFormat == '%') {
                                            result = Highcharts.numberFormat(this.y, decimalPrec, '.', ',') + yaxisLabelFormat;
                                        }
                                        return result;
                                    }
                                }
                            }
                        },
                        legend: {
                            enabled: showLegend
                        },
                        series: seriesData
                    });
                }
            }

            this.drawColumn4Chart = function (chartContainer, result, options) {
                var yaxisLabelFormat = "";
                var yaxisBarWidth = 15;
                var colorData = ['#4B91CF', '#F27927', '#A5A5A5', '#FCC401'];

                var xAxisData = [];
                var bar1Data = [];
                var bar2Data = [];
                var bar3Data = [];
                var bar4Data = [];

                var showLegend = true;
                var decimalPrec = 0;

                //Preparing Data
                var metaData = result.MetaData;
                if (metaData) {
                    var xaxisProp = metaData.xaxis;
                    var yaxisArr = metaData.yaxis.split(",");
                    var legendArr = metaData.legend.split(",");

                    var bar1Prop = yaxisArr[0];
                    var bar2Prop = yaxisArr[1];
                    var bar3Prop = yaxisArr[2];
                    var bar4Prop = yaxisArr[3];

                    var result1 = result.Items;
                    for (var idx in result1) {
                        var xValue = result1[idx][xaxisProp];
                        var bar1Value = result1[idx][bar1Prop];
                        var bar2Value = result1[idx][bar2Prop];
                        var bar3Value = result1[idx][bar3Prop];
                        var bar4Value = result1[idx][bar4Prop];

                        xAxisData.push(xValue);
                        bar1Data.push(bar1Value);
                        bar2Data.push(bar2Value);
                        bar3Data.push(bar3Value);
                        bar4Data.push(bar4Value);
                    }

                    //Getting chart options
                    if (options) {
                        if (options.yaxislabelformat) {
                            yaxisLabelFormat = options.yaxislabelformat;
                        }
                        if (options.yaxisbarwidth) {
                            yaxisBarWidth = options.yaxisbarwidth;
                        }
                        if (options.showlegend != undefined) {
                            showLegend = options.showlegend;
                        }
                        if (options.decimalprec) {
                            decimalPrec = options.decimalprec;
                        }
                    }

                    Highcharts.chart(chartContainer, {
                        credits: {
                            enabled: false
                        },
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: metaData.charttitle
                        },
                        colors: colorData,
                        tooltip: {
                            pointFormatter: function () {
                                var result = this.y;
                                if (yaxisLabelFormat == '$') {
                                    result = yaxisLabelFormat + Highcharts.numberFormat(this.y, decimalPrec, '.', ',');
                                } else if (yaxisLabelFormat == '%') {
                                    result = Highcharts.numberFormat(this.y, decimalPrec, '.', ',') + yaxisLabelFormat;
                                }
                                return result;
                            }
                        },
                        xAxis: {
                            categories: xAxisData,
                            title: {
                                text: metaData.xaxistitle
                            }
                        },
                        yAxis: {
                            min: metaData.yaxismin,
                            max: metaData.yaxismax,
                            tickInterval: metaData.yaxisinterval,
                            title: {
                                text: metaData.yaxistitle
                            },
                            labels: {
                                formatter: function () {
                                    var result = this.value;
                                    if (yaxisLabelFormat == '$') {
                                        result = yaxisLabelFormat + Highcharts.numberFormat(this.value, decimalPrec, '.', ',');
                                    } else if (yaxisLabelFormat == '%') {
                                        result = Highcharts.numberFormat(this.value, decimalPrec, '.', ',') + yaxisLabelFormat;
                                    }
                                    return result;
                                }
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: yaxisBarWidth,
                                dataLabels: {
                                    enabled: true,
                                    formatter: function () {
                                        var result = this.y;
                                        if (yaxisLabelFormat == '$') {
                                            result = yaxisLabelFormat + Highcharts.numberFormat(this.y, decimalPrec, '.', ',');
                                        } else if (yaxisLabelFormat == '%') {
                                            result = Highcharts.numberFormat(this.y, decimalPrec, '.', ',') + yaxisLabelFormat;
                                        }
                                        return result;
                                    }
                                }
                            }
                        },
                        legend: {
                            enabled: showLegend
                        },
                        series: [{
                            name: legendArr[0],
                            data: bar1Data
                        },
                        {
                            name: legendArr[1],
                            data: bar2Data
                        },
                        {
                            name: legendArr[2],
                            data: bar3Data
                        },
                        {
                            name: legendArr[3],
                            data: bar4Data
                        }]
                    });
                }
            }

            this.drawBarChart = function (chartContainer, result, options) {
                var xAxisData = [];
                var yAxisData = [];

                //Preparing Data
                var metaData = result.MetaData;
                var xaxisProp = metaData.xaxis;
                var yaxisProp = metaData.yaxis;

                var result1 = result.Items;
                for (var idx in result1) {
                    var xValue = result1[idx][xaxisProp];
                    var yValue = result1[idx][yaxisProp];

                    xAxisData.push(xValue);
                    yAxisData.push(yValue);
                }


                Highcharts.chart(chartContainer, {
                    chart: {
                        type: 'bar',
                        events: {
                            click: options && options.clickfn
                        },
                        backgroundColor: '#f5f7fa'
                    },
                    title: {
                        text: metaData.charttitle
                    },
                    xAxis: {
                        categories: xAxisData,
                        title: {
                            text: metaData.xaxistitle
                        }
                    },
                    yAxis: {
                        min: metaData.yaxismin,
                        max: metaData.yaxismax,
                        title: {
                            text: metaData.yaxistitle
                        }
                    },
                    tooltip: {
                        pointFormatter: function () {
                            var result = Highcharts.numberFormat(this.y, 0, '.', ',');
                            return result;
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: false
                            }
                        },
                        series: {
                            cursor: 'pointer',
                            point: {
                                events: {
                                    click: options && options.clickfn
                                }
                            }
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        name: metaData.legend,
                        data: yAxisData
                    }]
                });
            }

            this.drawTreeChart = function (chartContainer, result, options) {
                var chartData = [];

                //Preparing Data
                var headerResult = result.Header;
                for (var idx in headerResult) {
                    var idVal = headerResult[idx]['id'];
                    var nameVal = headerResult[idx]['name'];
                    var colorVal = headerResult[idx]['color'];

                    chartData.push({ id: idVal, name: nameVal, color: colorVal });
                }

                var metaData = result.MetaData;
                var nameProp = metaData.namecol;
                var parentProp = metaData.parentcol;
                var valueProp = metaData.valuecol;

                var result1 = result.Items;
                for (var idx in result1) {
                    var nameVal = result1[idx][nameProp];
                    var parentVal = result1[idx][parentProp];
                    var strValue = parseInt(result1[idx][valueProp]);
                    //if (strValue == 0) {
                    //    strValue = 1;
                    //  }

                    chartData.push({ name: nameVal, parent: parentVal, value: strValue });
                }

                Highcharts.chart(chartContainer, {
                    chart: {
                        backgroundColor: '#f5f7fa'
                    },
                    series: [{
                        type: "treemap",
                        layoutAlgorithm: 'stripes',
                        alternateStartingDirection: true,
                        levels: [{
                            level: 1,
                            layoutAlgorithm: 'sliceAndDice',
                            dataLabels: {
                                enabled: true,
                                align: 'left',
                                verticalAlign: 'top',
                                style: {
                                    fontSize: '15px',
                                    fontWeight: 'bold'
                                }
                            }
                        }],
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: options && options.clickfn
                            }
                        },
                        data: chartData
                    }],
                    title: {
                        text: metaData.charttitle
                    },
                    credits: {
                        enabled: false
                    }
                });
            }
            
            this.drawColumnLineChart = function(chartContainer, result, options) {
                var xAxisData = [];
                var barData = [];
                var lineData = [];
                var colorData = ['#5197D7', '#A5A5A5'];
                var yaxisBarWidth = 40;
                var barDecimalPrec;
                var lineDecimalPrec;

                //Preparing Data
                var metaData = result.MetaData;
                var xaxisProp = metaData.xaxis;
                var barProp = metaData.baraxis;
                var lineProp = metaData.lineaxis;

                var result1 = result.Items;
                for (var idx in result1) {
                    var xValue = result1[idx][xaxisProp];
                    var barValue = result1[idx][barProp];
                    var lineValue = result1[idx][lineProp];

                    xAxisData.push(xValue);
                    barData.push(barValue);
                    lineData.push(lineValue);
                }

                //Getting from options
                if (options) {
                    if (options.colordata) {
                        colorData = options.colordata;
                    }
                    if (options.yaxisbarwidth) {
                        yaxisBarWidth = options.yaxisbarwidth;
                    }
                    if (options.bardecimalprec) {
                        barDecimalPrec = options.bardecimalprec;
                    }
                    if (options.linedecimalprec) {
                        lineDecimalPrec = options.linedecimalprec;
                    }
                }

                //Rendering chart
                Highcharts.chart(chartContainer, {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        zoomType: 'xy',
                        alignTicks: false,
                        backgroundColor: '#f5f7fa'
                    },
                    title: {
                        text: metaData.charttitle
                    },
                    colors: colorData,
                    xAxis: {
                        categories: xAxisData,
                        title: {
                            text: metaData.xaxistitle
                        },
                        crosshair: true
                    },
                    yAxis: [{
                        min: metaData.barmin,
                        max: metaData.barmax,
                        tickInterval: metaData.barinterval,
                        labels: {
                            formatter: function () {
                                if (barDecimalPrec) {
                                    return Highcharts.numberFormat(this.value, barDecimalPrec);
                                }
                                return this.value;
                            }
                        },
                        title: { text: metaData.bartitle }
                    },
                        {
                            min: metaData.linemin,
                            max: metaData.linemax,
                            tickInterval: metaData.lineinterval,
                            gridLineWidth: 0,
                            labels: {
                                formatter: function () {
                                    if (lineDecimalPrec) {
                                        return Highcharts.numberFormat(this.value, lineDecimalPrec);
                                    }
                                    return this.value;
                                }
                            },
                            title: { text: metaData.linetitle },
                            opposite: true
                        }],
                    tooltip: {
                        shared: true,
                        formatter: function () {
                            var s = '';
                            $.each(this.points, function (i, point) {
                                s += '<span style="color:' + this.series.color + '">' +
                                     point.series.name + '</span>: ' + point.y + "<br />";
                            });
                            return s;
                        }
                    },
                    plotOptions: {
                        line: {
                            marker: {
                                enabled: false
                            },
                            lineWidth: '5px',
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    if (lineDecimalPrec) {
                                        return Highcharts.numberFormat(this.y, lineDecimalPrec);
                                    }
                                    return this.value;
                                }
                            }
                        },
                        column: {
                            pointWidth: yaxisBarWidth,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    if (barDecimalPrec) {
                                        return Highcharts.numberFormat(this.y, barDecimalPrec);
                                    }
                                    return this.value;
                                }
                            }
                        }
                    },

                    series: [{ name: metaData.barlegend, type: 'column', yAxis: 0, data: barData },
                             { name: metaData.linelegend, type: 'line', yAxis: 1, data: lineData }
                    ]
                });
            }

            this.drawStackedColumn3Chart = function(chartContainer, result, options) {
                var xAxisData = [];
                var bar1Data = [];
                var bar2Data = [];
                var bar3Data = [];

                var metaData = result.MetaData;
                var xaxisProp = metaData.xaxis;
                var yaxisArr = metaData.yaxis.split(",");
                var legendArr = metaData.legend.split(",");

                var bar1Prop = yaxisArr[0];
                var bar2Prop = yaxisArr[1];
                var bar3Prop = yaxisArr[2];

                var result1 = result.Items;
                for (var idx in result1) {
                    var xValue = result1[idx][xaxisProp];
                    var bar1Value = result1[idx][bar1Prop];
                    var bar2Value = result1[idx][bar2Prop];
                    var bar3Value = result1[idx][bar3Prop];

                    xAxisData.push(xValue);
                    bar1Data.push(bar1Value);
                    bar2Data.push(bar2Value);
                    bar3Data.push(bar3Value);
                }


                Highcharts.chart(chartContainer, {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: 'column',
                        backgroundColor: '#f5f7fa'
                    },
                    title: {
                        text: metaData.charttitle
                    },
                    xAxis: {
                        categories: xAxisData,
                    },
                    yAxis: {
                        min: metaData.yaxismin,
                        max: metaData.yaxismax,
                        title: {
                            text: metaData.yaxistitle
                        },
                        labels: {
                            formatter: function () {
                                return '$' + this.value;
                            }
                        },
                        stackLabels: {
                            enabled: true,
                            formatter: function () {
                                return '$' + this.total;
                            }
                        }
                    },
                    legend: {
                        reversed: true
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal'
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                return '$' + this.y;
                            }
                        }
                    },
                    colors: ['#A5A5A5', '#F58035', '#5197D7'],
                    series: [{
                        name: legendArr[0],
                        data: bar1Data
                    },
                    {
                        name: legendArr[1],
                        data: bar2Data
                    },
                    {
                        name: legendArr[2],
                        data: bar3Data
                    }]
                });
            }

            this.drawStackedColumn2Chart = function (chartContainer, result, options) {
                var colorsArr = ['#F58035', '#5197D7'];
                var xAxisData = [];
                var bar1Data = [];
                var bar2Data = [];

                var metaData = result.MetaData;
                var xaxisProp = metaData.xaxis;
                var yaxisArr = metaData.yaxis.split(",");
                var legendArr = metaData.legend.split(",");

                var bar1Prop = yaxisArr[0];
                var bar2Prop = yaxisArr[1];

                var result1 = result.Items;
                for (var idx in result1) {
                    var xValue = result1[idx][xaxisProp];
                    var bar1Value = result1[idx][bar1Prop];
                    var bar2Value = result1[idx][bar2Prop];

                    xAxisData.push(xValue);
                    bar1Data.push(bar1Value);
                    bar2Data.push(bar2Value);
                }


                Highcharts.chart(chartContainer, {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: 'column',
                        backgroundColor: '#f5f7fa',
                        events: {
                            click: options && options.clickfn
                        }
                    },
                    title: {
                        text: metaData.charttitle
                    },
                    xAxis: {
                        categories: xAxisData,
                    },
                    yAxis: {
                        min: metaData.yaxismin,
                        max: metaData.yaxismax,
                        title: {
                            text: metaData.yaxistitle
                        },
                        labels: {
                            formatter: function () {
                                return this.value;
                            }
                        },
                        stackLabels: {
                            enabled: true,
                            formatter: function () {
                                return this.total;
                            }
                        }
                    },
                    legend: {
                        reversed: true
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal'
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                return this.y;
                            }
                        }
                    },
                    colors: colorsArr,
                    series: [{
                        name: legendArr[0],
                        data: bar1Data
                    },
                    {
                        name: legendArr[1],
                        data: bar2Data
                    }]
                });
            }

            this.drawGanttChart = function (chartContainer, result, options) {
           
                AmCharts.makeChart(chartContainer, {
                        "type": "gantt",
                        "period": "DD",

                        "valueAxis": {
                            "type": "date"
                        },
                        "brightnessStep": 60,
                        "graph": {
                            "fillAlphas": 1,
                            "balloonText": "[[open]] - [[value]]"
                        },
                        "rotate": true,
                        "categoryField": "category",
                        "segmentsField": "segments",
                        "dataDateFormat": "YYYY-MM-DD",
                        "startDateField": "start",
                        "endDateField": "end",
                        "dataProvider": [{
                            "category": "Diptheria,TetanusTox",
                            "segments": [{
                                "start": "2015-3-02",
                                "end": "2015-04-03"
                            }, {
                                "start": "2015-05-04",
                                "end": "2015-07-05"
                            }, {
                                "start": "2015-09-07",
                                "end": "2015-11-10"
                            }]
                        },{
                            "category": "PneumococoalConjugate",
                            "segments": [{
                                "start": "2015-01-02",
                                "end": "2015-02-03"
                            }, {
                                "start": "2015-03-04",
                                "end": "2015-06-05"
                            }, {
                                "start": "2015-07-07",
                                "end": "2015-08-10"
                            }]
                        } ,{
                            "category": "Pollovirus Vaccine,inac",
                            "segments": [{
                                "start": "2015-02-02",
                                "end": "2015-04-03"
                            }, {
                                "start": "2015-05-04",
                                "end": "2015-07-05"
                            }, {
                                "start": "2015-08-07",
                                "end": "2015-10-10"
                            }]
                        } ,{
                            "category": "Measeles,Mumpsandr,inac",
                            "segments": [{
                                "start": "2015-01-02",
                                "end": "2015-02-03"
                            }, {
                                "start": "2015-05-04",
                                "end": "2015-06-05"
                            }, {
                                "start": "2015-07-07",
                                "end": "2015-09-10"
                            }]
                        } ,{
                            "category": "Vancilla-Zoster immun",
                            "segments": [{
                                "start": "2015-01-05",
                                "end": "2015-03-15"
                            }, {
                                "start": "2015-04-05",
                                "end": "2015-06-20"
                            }, {
                                "start": "2015-08-05",
                                "end": "2015-09-05"
                            }]
                        } ,{
                            "category": "Hepatities A Vaccine,ad",
                            "segments": [{
                                "start": "2015-02-05",
                                "end": "2015-03-15"
                            }, {
                                "start": "2015-04-05",
                                "end": "2015-05-20"
                            }, {
                                "start": "2015-06-05",
                                "end": "2015-07-05"
                            }]
                        } ,{
                            "category": "Meningoccoal,Polysac",
                            "segments": [{
                                "start": "2015-01-02",
                                "end": "2015-03-03"
                            }, {
                                "start": "2015-05-04",
                                "end": "2015-06-05"
                            }, {
                                "start": "2015-08-07",
                                "end": "2015-09-10"
                            }]
                        }  ],
                        "chartCursor": {
                            "valueBalloonsEnabled": false,
                            "cursorAlpha": 0,
                            "valueLineBalloonEnabled": true,
                            "valueLineEnabled": true,
                            "valueZoomable":true,
                            "zoomable":false
                        },

                        "valueScrollbar": {
                            "position":"top",
                            "autoGridCount":true,
                            "color":"#000000"
                        }
                    });
            }
    }]);
})();