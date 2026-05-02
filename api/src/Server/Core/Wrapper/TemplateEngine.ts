import * as Handlebars from 'handlebars';
import { _ } from '../Vendor';
import * as bwipjs from 'bwip-js';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import * as moment from 'moment';

export class Template {
    public static Compile(template: any, data: any, compileOptions?: CompileOptions): string {
        return Handlebars.compile(template, compileOptions)(data, {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
        });
    }
    public static Register(key: string, fn: Function, ): void {
        return Handlebars.registerHelper(key, fn as Handlebars.HelperDelegate);
    }
    public static UnRegister(key: string): void {
        Handlebars.unregisterHelper(key);
    }
}
Template.Register('strtodate', (date: string) => {
    let retdate = '';
    if (date !== null) {
        try {
            let dobdt = moment(date).toDate();
            retdate = moment(dobdt).format('DD/MM/YYYY');
        } catch (e) {
            console.log(e);
        }
    }
    return retdate;
});
Template.Register('dateformat', (date: Date) => {
    let retdate = '';
    if (date !== null && date !== undefined) {
        retdate = moment(date).format('DD/MM/YYYY');
    }
    return retdate;
});
Template.Register('dateformating', (date: Date) => {
    let retdate = moment(date).format('DD/MM/YYYY');
    return retdate;
});
Template.Register('expdateformat', (date: Date) => {
    let retdate = '';
    if (date !== null && date !== undefined) {
        retdate = moment(date).format('MM/YYYY');
    }
    return retdate;
});
Template.Register('expyearformat', (date: Date) => {
    let retdate = '';
    if (date !== null && date !== undefined) {
        retdate = moment(date).format('MM/YY');
    }
    return retdate;
});

Template.Register('datetimeformat', (date: Date) => {
    let retdatetime = '';
    if (date !== null && date !== undefined) {
        retdatetime = moment(date).format('DD/MM/YYYY HH:mm');
    }
    return retdatetime;
});

Template.Register('normaldatetimeformat', (date: Date) => {
    var DateTime = '';
    if (date !== null && date !== undefined) {
        DateTime = moment(date).format('DD/MM/YYYY hh:mm A');
    }
    return DateTime;
});

Template.Register('age', (date: Date) => {
    let diffDuration = moment.duration(moment().diff(date));
    let result = '';
    let years = diffDuration.years();
    let months = diffDuration.months();
    let days = diffDuration.days();
    if (years > 0) {
        result = diffDuration.years() + 'Y ';
    }
    if (months > 0) {
        result += diffDuration.months() + 'M ';
    }
    if (days > 0) {
        result += diffDuration.days() + 'D ';
    }
    return result;
});

Template.Register('ageonlyyear', (date: Date) => {
    let diffDuration = moment.duration(moment().diff(date));
    let result = '';
    let years = diffDuration.years();
    if (years > 0) {
        result = moment().diff(date, 'years') + 'y ';
    }
    return result;
});

Template.Register('specifiedage', (date: Date) => {
    let diffDuration = moment.duration(moment().diff(date));
    let result = '';
    let years = diffDuration.years();
    let months = diffDuration.months();
    let days = diffDuration.days();
    if (years > 0) {
        result = diffDuration.years() + 'Y ';
    } else if (years === 0) {
        if (months > 0) {
            result += diffDuration.months() + 'M ';
        }
        if (days > 0) {
            result += diffDuration.days() + 'D ';
        }
    }
    return result;
});


Template.Register('currencyformat', (amount: number) => {
    var symbol = '₹';
    if(process.env.CLIENT_CODE ==='swostha')
    symbol ='रू ';
    return symbol + (amount === null ? parseFloat('0').toFixed(2) : parseFloat('' + amount).toFixed(2));
});

Template.Register('currencyformatwithoutdecimal', (amount: number) => {
    var symbol = '₹';
    if(process.env.CLIENT_CODE ==='swostha')
    symbol ='रू ';
    return symbol + (amount === null ? parseFloat('0').toFixed(0) : parseFloat('' + amount).toFixed(0));
});

Template.Register('Percentage', (amount: number) => {
    return (amount === null ? parseFloat('0').toFixed(2) : parseFloat('' + amount).toFixed(2));
});
Template.Register('currencyformatwosymbol', (amount: number) => {
    return (amount === null ? parseFloat('0').toFixed(2) : parseFloat('' + amount).toFixed(2));
});
Template.Register('currencyformatwithoutdecimalsymbol', (amount: number) => {
    return (amount === null ? parseFloat('0').toFixed(0) : parseFloat('' + amount).toFixed(0));
});

Template.Register('now', () => {
    let retdatetime = '';
    let date = new Date();
    retdatetime = moment(date).format('DD/MM/YYYY HH:mm:ss');
    return retdatetime;
});

Template.Register('_', (...param: string[]): any => {
    let method: string = param[0];
    let last = param.length - 2;
    let input = _.chain(param).drop(1).take(last > 0 ? last : 0).value();
    return (<any>_)[method](input);
});

Template.Register('barcode', (...param: any[]): any => {
    let api = require('deasync')(bwipjs.toBuffer);
    let data = param[0];
    let bcid = param[1];
    bcid = bcid.name ? 'code39' : bcid;
    try {
        let img = api({
            bcid: bcid,         // Barcode type
            text: data,              // Text to encode
            scale: 3,                // 3x scaling factor
            height: 10,              // Bar height, in millimeters
            includetext: true,       // Show human-readable text
            textxalign: 'center',    // Always good to set this
            textfont: 'Inconsolata', // Use your custom font
            textsize: 13             // Font size, in points
        });
        let buffer = (<Buffer>img).toString('base64');
        return 'data:image/png;base64,' + buffer;
    } catch (e) {
        console.log(e);
    }
});

Template.Register('include', (...param: any[]): any => {
    let path: string = param[0];
    let fullPath = resolve(__dirname, '../..' + path);
    if (existsSync(fullPath) || existsSync(path)) {
        let response;
        let type = param[1];
        switch (type) {
            case 'fullpath-img':
                response = 'data:image/png;base64,' + readFileSync(path, 'base64');
                break;
            case 'img':
                response = 'data:image/png;base64,' + readFileSync(fullPath, 'base64');
                break;
            case 'tpl':
                let tpl = readFileSync(fullPath, 'utf-8');
                let opt = param[param.length - 1];
                response = Template.Compile(tpl, opt.data.root);
                break;
            default:
                response = readFileSync(fullPath, 'utf-8');
                break;
        }
        return response;
    }
});

Template.Register('includestring', (...param: any[]): any => {
    let tmplString: string = param[0];
    let opt = param[param.length - 1];
    let response = Template.Compile(tmplString, opt.data.root);
    return response;
});
/*
date <Date> <method Name> <comman separated parameters>
 */
Template.Register('date', (...params: any[]): any => {
    let date: Date = params[0];
    let method: string = params[1];
    let last = params.length - 3;
    let input = _.chain(params).drop(2).take(last > 0 ? last : 0).value();
    let result = (<any>moment(date))[method](input);
    return result;
});

/**
 * amountInLetter <Amount:Number>
 * amountInLetter <Amount:Number.Number> 'en'  -- default lang is en
 */

Template.Register('numberInWords', (...params: any[]): any => {
    let amount: number = params[0];
    let lang = typeof params[1] === 'string' ? params[1] : 'enIndian';
    let writtenNumber = require('written-number');
    return writtenNumber(amount, { lang: lang });

    // let amount: any = params[0];
    // amount = amount ? amount.toString() : '';
    // amount = amount.split('.');
    // let lang = typeof params[1] === 'string' ? params[1] : 'en';
    // let writtenNumber = require('written-number');
    // let result = writtenNumber(amount[0], { lang: lang });
    // if (amount[1]) {
    //     result = result + ' and ' + writtenNumber(amount[1], { lang: lang });
    // }
    // return result;
});

Template.Register('decimalnrInWords', (...params: any[]): any => {
    let amount: number = params[0];
    let lang = typeof params[1] === 'string' ? params[1] : 'enIndian';
    let writtenNumber = require('written-number');
    let stramt = parseFloat('' + amount).toFixed(2);
    let ActualAmts = stramt.split('.');
    if (ActualAmts.length > 0) {
        let damt1: number = +ActualAmts[0];
        var writtenNumber1 = writtenNumber(damt1, { lang: lang });
    }
    if (ActualAmts.length > 1) {
        var damt2 = +ActualAmts[1];

        var writtenNumber2 = writtenNumber(damt2, { lang: lang });

    }
    return writtenNumber1 + ' and ' + writtenNumber2 + ' Paise';

    //return writtenNumber(amount, { lang: lang });

    // let amount: any = params[0];
    // amount = amount ? amount.toString() : '';
    // amount = amount.split('.');
    // let lang = typeof params[1] === 'string' ? params[1] : 'en';
    // let writtenNumber = require('written-number');
    // let result = writtenNumber(amount[0], { lang: lang });
    // if (amount[1]) {
    //     result = result + ' and ' + writtenNumber(amount[1], { lang: lang });
    // }
    // return result;
});




Template.Register('variableDecimalnrInWords1', (...params: any[]): any => {
    var writtenNumber1 = '';
    try {
        let varName = params[0];
        let options = params[1];
        if (varName && typeof varName === 'string') {
            varName = varName.toLowerCase();
        }
        if (varName.indexOf('g.') > -1) {
            varName = varName.substring(2);
        }
        let amount: number = options.data.root[varName];
        let lang = 'enIndian';
        let writtenNumber = require('written-number');
        let stramt = parseFloat('' + amount).toFixed(2);
        let ActualAmts = stramt.split('.');
        if (ActualAmts.length > 0) {
            let damt1: number = +ActualAmts[0];
            writtenNumber1 = writtenNumber(damt1, { lang: lang });
        }
    } catch (e) { console.log(e); }
    return writtenNumber1;
});

Template.Register('decimalnrInWords1', (...params: any[]): any => {
    let amount: number = params[0];
    let lang = typeof params[1] === 'string' ? params[1] : 'enIndian';
    let writtenNumber = require('written-number');
    let stramt = parseFloat('' + amount).toFixed(2);
    let ActualAmts = stramt.split('.');
    if (ActualAmts.length > 0) {
        let damt1: number = +ActualAmts[0];
        var writtenNumber1 = writtenNumber(damt1, { lang: lang });
    }

    return writtenNumber1;


});

Template.Register('inc', (...param: any[]): any => {
    return parseInt(param[0]) + 1;
});

Template.Register('ifCond', (...param: any[]): any => {
    let v1: any = param[0];
    let operator: any = param[1];
    let v2: any = param[2];
    let options: any = param[3];
    if (v1 && typeof v1 === 'string') {
        v1 = v1.toLowerCase();
    }
    if (v2 && typeof v2 === 'string') {
        v2 = v2.toLowerCase();
    }
    if (v1 && typeof v1 === 'string' && v1.indexOf('g.') > -1) {
        let varName = v1.substring(2);
        v1 = options.data.root[varName];
    }
    if (v2 && typeof v2 === 'string' && v2.indexOf('g.') > -1) {
        let varName = v2.substring(2);
        v2 = options.data.root[varName];
    }
    switch (operator) {
        case '==':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

Template.Register('setVariable', (...param: any[]): any => {
    let varName = param[0];
    let varValue = param[1];
    let options = param[2];
    if (varName && typeof varName === 'string') {
        varName = varName.toLowerCase();
    }
    if (varName && typeof varValue === 'string' && varValue.startsWith('g.')) {
        let gk = varValue.substring(2).toLowerCase();
        varValue = options.data.root[gk];
    }
    options.data.root[varName] = varValue;
});

Template.Register('getVariable', (...param: any[]): any => {
    let varName = param[0];
    let options = param[1];
    if (varName && typeof varName === 'string') {
        varName = varName.toLowerCase();
    }
    if (varName.indexOf('g.') > -1) {
        varName = varName.substring(2);
    }
    return options.data.root[varName] || '';
});

Template.Register('getVariableDate', (...param: any[]): any => {
    let varName = param[0];
    let options = param[1];
    if (varName && typeof varName === 'string') {
        varName = varName.toLowerCase();
    }
    if (varName.indexOf('g.') > -1) {
        varName = varName.substring(2);
    }
    let val = options.data.root[varName];
    let retdate = val ? moment(val).format('DD/MM/YYYY') : '';
    return retdate;
});

Template.Register('splitToLines', (...param: any[]): any => {
    let response = '';
    let singleText = param[0];
    if (singleText && typeof singleText === 'string') {
        let lines = singleText.split(',');
        response = lines.join('<br>');
    }
    return response;
});
