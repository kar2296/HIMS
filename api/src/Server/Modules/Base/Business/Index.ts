/// <reference path="../../../../global.d.ts"/>
import * as SStatic from 'sequelize';
import { models, Instance, Dal, Request, QueryOptions, Sequelize, FindOptions, UpsertOptions, CreateOptions, UpdateOptions, WhereOptions }
    from '../../../Core/Index';
import { ApiRequest, ApiResponse, ISearchEnums, Paginator } from '../../../Common/Index';
import { IAttributes } from '../Model/Index';
import * as _ from 'lodash';
import { MailProvider, MailFactory, SmsProvider, SmsFactory } from '../../../../Server/Core/Index';
import { isBoolean } from 'util';

export interface IBaseBo { }

export interface IOptionProvider {
    GetOptions(key: string, apiReq: ApiRequest<any>): Promise<any>;
}

declare global {
    export interface DeferSequenceInfo {
        id: number;
        propertyName: string;
        key: string;
        bo: BaseBo<any, any>;
        afterEvents?: Array<Function>;
    }
}

export abstract class BaseBo<TModel extends Instance<IAttributes>, TAttributes extends IAttributes> implements IBaseBo {
    protected Models: Models = models;
    protected Dal: Sequelize = Dal;
    protected Session: any;
    public get Items(): SStatic.Model<TModel, TAttributes> {
        return this.GetModel();
    }
    protected Request: Request;
    protected GetSession(): any {
        if (!this.Session && this.Request) {
            this.Session = (<any>this.Request).session.passport.user.SessionContext;
        }
        return this.Session;
    }
    private get QueryGenerator(): any {
        return Dal.getQueryInterface().QueryGenerator;
    }
    private get transaction(): SStatic.Transaction {
        return this.Request ? this.Request.transaction : null;
    }
    public constructor(req?: Request) {
        if (req) {
            this.Request = req;
            this.Session = (<any>req).session.passport.user.SessionContext;
        }
    }

    public abstract GetModel(): SStatic.Model<TModel, TAttributes>;


    public getPatSequenceIdentifier(IdentifierKey: any, facilityId: number): string {
        let identifierKey = IdentifierKey;
        if (facilityId > 1) {
            identifierKey += facilityId;
        }
        return identifierKey;
    }

    getFacilitySequenceIdentifier(IdentifierKey: any, facilityId: number) {
        let identifierKey = IdentifierKey;
        if (facilityId > 1) {
            identifierKey += facilityId;
        }
        return identifierKey;
    }

    public getSequenceIdentifier(IdentifierKey: any): string {
        let identifierKey = IdentifierKey;
        if (this.Session.FacilityId > 1)
            identifierKey += this.Session.FacilityId;
        return identifierKey;
    }

    public getUserSequenceIdentifier(IdentifierKey: any): string {
        let identifierKey = IdentifierKey;
        return identifierKey;
    }

    public getSepStoreSequenceIdentifier(IdentifierKey: any, StoreMasterId: number): string {
        let identifierKey = IdentifierKey;
        if (StoreMasterId > 0)
            identifierKey = identifierKey + '-S' + StoreMasterId;
        return identifierKey;
    }

    public getStoreSequenceIdentifier(IdentifierKey: any, StoreMasterId: number): string {
        let identifierKey = IdentifierKey;
        if (StoreMasterId > 0)
            identifierKey += StoreMasterId;
        return identifierKey;
    }

    public groupByMulti(collection: any, values: any, context: any): any { // BaseBo
        if (!values.length) {
            context.push(collection);
            return collection;
        }
        let byFirst = _.groupBy(collection, values[0]),
            rest = values.slice(1);
        for (let prop in byFirst) {
            byFirst[prop] = this.groupByMulti(byFirst[prop], rest, context);
        }
        return context;
    }

    public deferSequenceKey(id: number, propertyName: string, key: string, afterEvents?: Array<Function>, bo?: BaseBo<any, any>) {
        if (!this.Request.deferredSequences) {
            this.Request.deferredSequences = [];
        }
        if (!key) {
            throw new Error('The ' + key + ' parameter is required.');
        }
        // this.Request.deferredSequences.push({ id, propertyName, key, afterEvents, bo: bo || this });
        try {
            this.Request.deferredSequences.push({
                id,
                propertyName,
                key,
                afterEvents,
                bo: bo || this
            });
        } catch (error) {
            console.error('Failed to push to deferredSequences', {
                error: error.message,
                stack: error.stack,
                context: { id, propertyName, key }
            });
            // Handle or propagate the error as necessary
        }
    }


    public GetSelectQuery<SModel extends Instance<IAttributes>, SAttributes extends IAttributes>
        (model: SStatic.Model<SModel, SAttributes>, options: any, alias: string): any[] {
        const qry = this.QueryGenerator.selectQuery(model.getTableName(), options, model).slice(0, -1);
        return [this.Dal.literal('(' + qry + ')'), alias];
    }

    public async DeleteById(entity: TAttributes, options?: UpdateOptions): Promise<number> {
        this.CheckId(entity);
        options = options || { where: { Id: entity.Id }, limit: 1 };
        options.transaction = options.transaction || this.transaction;
        return await this.Items.destroy(options);
    }

    public async ExecuteSQLQuery(queryText: string | { query: string, values: any[] }, param?: QueryOptions): Promise<any> {
        return await Dal.query(queryText, param);
    }
    public async ExecuteStoredProcedure(procName: string, param?: QueryOptions): Promise<any> {
        // return new Promise<ProcResult>((resolver, reject) => {
        //     Dal.query('call ' + procName, param).spread((results: any, metadata: any) => {
        //         resolver({ Results: results, MetaData: metadata });
        //     }).catch(reject);
        // });
        return await Dal.query('CALL ' + procName, param);
    }
    public async GetById(id: number, options?: FindOptions<any>): Promise<TModel> {
        options = options || {};
        options.transaction = options.transaction || this.transaction;
        return await this.Items.findById(id, options); //findOne({ where: { Id: id } });
    }
    public async Find(options?: FindOptions<any> | any): Promise<TModel> {
        options = options || {};
        options.transaction = options.transaction || this.transaction;
        return await this.Items.find(options);
    }
    public async FindAll(options?: FindOptions<any> | any): Promise<Array<TModel>> {
        options = options || {};
        options.transaction = options.transaction || this.transaction;
        return await this.Items.findAll(options);
    }
    public async FindAllItems(apiReq: ApiRequest<any>, options?: FindOptions<any> | any): Promise<ApiResponse<Array<TAttributes>>> {
        let models = await this.Items.findAll(options);
        let data = this.GetAttributes(models);
        apiReq.PageContext = apiReq.PageContext || { PageNumber: null, PageSize: null };
        apiReq.PageContext.TotalRecords = data.length;
        return { PageContext: apiReq.PageContext, Data: data, Error: null };
    }
    public async FindAndCountAll(apiReq: ApiRequest<any>, options?: FindOptions<any> | any): Promise<ApiResponse<Array<TAttributes>>> {
        let pg: Paginator = new Paginator(apiReq.PageContext);
        options = options || {};
        options.transaction = options.transaction || this.transaction;
        options.limit = options.limit || pg.Limit;
        options.offset = options.offset || pg.Offset;
        if (pg.Limit === -1) {
            delete options.limit;
            delete options.offset;
        }
        let result = await this.Items.findAndCountAll(options);
        let data = this.GetAttributes(result.rows);
        apiReq.PageContext = apiReq.PageContext || { PageNumber: null, PageSize: null };
        apiReq.PageContext.TotalRecords = result.count;
        return { PageContext: apiReq.PageContext, Data: data, Error: null };
    }
    public async FindAndCount(apiReq: ApiRequest<any>, options?: FindOptions<any> | any): Promise<ApiResponse<Array<TAttributes>>> {
        let pg: Paginator = new Paginator(apiReq.PageContext);
        options = options || {};
        options.transaction = options.transaction || this.transaction;
        options.limit = options.limit || pg.Limit;
        options.offset = options.offset || pg.Offset;
        options.distinct = true;
        if (pg.Limit === -1) {
            delete options.limit;
            delete options.offset;
        }
        // let result = await this.Items.findAndCountAll(options);
        let result = await this.Items.findAndCount(options);
        let data = this.GetAttributes(result.rows);
        apiReq.PageContext = apiReq.PageContext || { PageNumber: null, PageSize: null };
        // apiReq.PageContext.TotalRecords = result.count;
        apiReq.PageContext.TotalRecords = result.count;
        return { PageContext: apiReq.PageContext, Data: data, Error: null };
    }
    public GetIDbTransaction(transaction: SStatic.Transaction): void {
        throw 'Not Implemented';
    }
    public async GetObjectForUpdate(id: number, rev: number): Promise<TModel> {
        return await this.Items.findOne({ where: { Id: id, Rev: rev } } as any);
    }
    public GetUserId(): number {
        throw 'Not Implemented';
    }
    public async MarkAsDelete(id: number): Promise<Boolean> {
        let rec: any = { Status: 2, UpdatedBy: this.Session.UserId };
        await this.Items.update(rec, { where: { Id: id } });
        return false;
    }
    public Refresh(entity: TAttributes): void {
        throw 'Not Implemented';
    }
    public async Save(entity: TAttributes, options?: CreateOptions): Promise<TModel> {
        options = options || { isNewRecord: true };
        options.transaction = options.transaction || this.transaction;
        if (!options.transaction) {
            throw new Error('Transaction must be provided for Save');
        }
        entity.UpdatedBy = this.Session.UserId;
        entity.CreatedBy = this.Session.UserId;
        entity.Status = 1;
        return await this.Items.create(entity, options);
    }
    public async SaveWithOutSession(entity: TAttributes, options?: CreateOptions): Promise<TModel> {
        options = options || { isNewRecord: true };
        options.transaction = options.transaction || this.transaction;
        // entity.UpdatedBy = this.Session.UserId;
        // entity.CreatedBy = this.Session.UserId;
        entity.Status = 1;
        return await this.Items.create(entity, options);
    }
    //
    public async SaveOrUpdate(entity: TAttributes, options?: UpsertOptions): Promise<boolean> {
    options = options || {};
    options.transaction = options.transaction || this.transaction;
    entity.UpdatedBy = this.Session.UserId;
    entity.CreatedBy = this.Session.UserId;
    // ✅ Fix line 261 with proper typing
    const upsertOptions: UpsertOptions & { returning: false } = {
        ...options,
        returning: false  // Ensures boolean return type
    };
    return await this.Items.upsert(entity, upsertOptions);
}
    public async Update(entity: TAttributes, options?: UpdateOptions): Promise<boolean> {
        this.CheckId(entity);
        options = options || { where: { Id: entity.Id }, limit: 1 };
        options.transaction = options.transaction || this.transaction;
        entity.UpdatedBy = this.Session.UserId;
        let hasRev = false;
        if (entity.Rev || entity.Rev === 0) {
            options.where['Rev'] = entity.Rev;
            entity.Rev++;
            hasRev = true;
        }
        let res = await this.Items.update(entity, options);
        const updateStatus = res && res[0] !== 1;
        if (hasRev && updateStatus) {
            // throw 'ERROR: Update failed - object not found or seems to be updated by someone else';
            throw { code: 'OBJECT_UPDATED_BY_SOMEONE' };
        }
        return res && res[0] > 0;
    }
    public async UpdatewithoutSession(entity: TAttributes, options?: UpdateOptions): Promise<boolean> {
        this.CheckId(entity);
        options = options || { where: { Id: entity.Id }, limit: 1 };
        options.transaction = options.transaction || this.transaction;
        // entity.UpdatedBy = this.Session.UserId;
        // let hasRev = false;
        // if (entity.Rev || entity.Rev === 0) {
        //     options.where['Rev'] = entity.Rev;
        //     entity.Rev++;
        //     hasRev = true;
        // }
        let res = await this.Items.update(entity, options);
        const updateStatus = res && res[0] !== 1;
        // if (hasRev && updateStatus) {
        if (updateStatus) {
            // throw 'ERROR: Update failed - object not found or seems to be updated by someone else';
            throw { code: 'OBJECT_UPDATED_BY_SOMEONE' };
        }
        return res && res[0] > 0;
    }
    protected GetSmsProvider(): SmsProvider {
        let provider = SmsConfig['PROVIDER'];
        let userName = SmsConfig['USER_NAME'];
        let password = SmsConfig['PASSWORD'];
        let apiKey: string;
        let clientId: string;
        let smsProvider: any;
        if (SmsConfig['API_KEY']) {
            apiKey = SmsConfig['API_KEY'];
            if (SmsConfig['CLIENT_ID']) {
                clientId = SmsConfig['CLIENT_ID'];
                smsProvider = SmsFactory.GetSmsProvider(provider, userName, password, apiKey, clientId);
            } else {
                smsProvider = SmsFactory.GetSmsProvider(provider, userName, password, apiKey);
            }
        } else {
            smsProvider = SmsFactory.GetSmsProvider(provider, userName, password);
        }
        return smsProvider;
    }

    // protected GetMailProvider(): MailProvider {
    //     let mailProvider = MailFactory.GetMailProvider('gmail', {
    //         userName: 'hh@gmail.com',
    //         password: 'gloomsoft@123'
    //     });
    //     return mailProvider;
    //userName: 'hh@gmail.com',
    //password: 'Vidya@123'
    // }

    // protected GetMailProvider(): MailProvider {
    //     let mailProvider = MailFactory.GetMailProvider('gmail', {
    //         userName: 'hh@gmail.com,
    //         // password: 'qcpopuxogousyvpj'
    //         password: 'hwitzqirqohivdxj'
    //     });
    //     return mailProvider;
    // }

    protected GetMailProvider(): MailProvider {
        let userName = EmailConfig['USER_NAME'];
        let password = EmailConfig['PASSWORD'];
        let from = EmailConfig['From'];
        if (!userName) {
            userName = 'hh@gmail.com';
        }
        if (!password) {
            password = 'hwitzqirqohivdxj';
        }
        if (!from) {
            EmailConfig['From'] = 'From DrHMS <report@drhms.com>';
        }
        let mailProvider = MailFactory.GetMailProvider('gmail', {
            userName: userName,
            // password: 'qcpopuxogousyvpj'
            password: password
        });
        return mailProvider;
    }

    protected GetPOMailProvider(mailCredentials: any): MailProvider {
        let mailProvider = MailFactory.GetMailProvider('gmail', {
            userName: mailCredentials.userName,
            password: mailCredentials.password
        });
        return mailProvider;
    }

    protected GetAttribute(data: TModel): TAttributes {
        if (!data) return null;
        let result = (<any>data)['dataValues'];
        return result;
    }

    protected GetAttributes(data: Array<TModel>): Array<TAttributes> {
        const result: Array<any> = [];
        if (!data) return result;
        for (const i of data) {
            const at = (<any>i)['dataValues'];
            result.push(at);
        }
        return result;
    }

    protected IsValidParam(param: any): Boolean {
        let result: Boolean = false;
        if (isBoolean(param.Value)) {
            result = true;
        } else {
            if (param.Value && param.Value !== -1 && param.Value !== '') {
                result = true;
            }
        }
        return result;
    }

    protected GetReference(code: string, attributes: string[] = ['Description', 'ColorCode']): any {
        return {
            model: (<any>this.Models)['ReferenceValue'],
            attributes: attributes,
            as: code,
            required: false,
            where: { 'GroupCode': code }
        };
        // return {};
    }

    protected async ResolveReference(code: string, key: string): Promise<number> {
        let val = await (<any>this.Models)['ReferenceValue'].find({
            where: {
                GroupCode: code, ReferenceValueCode: key
            }, attributes: ['ReferenceValueCodeId']
        });
        return val.dataValues.ReferenceValueCodeId;
        //return 0;
    }

    protected HandleNullDataViaFileUpload(data: any): void {
        for (var idx in data) {
            var strValue = data[idx];
            if (strValue === 'null') {
                data[idx] = null;
            }
        }
    }

    protected HandleActiveState(item: any): void {
        if (item.ActiveStatus) {
            if (item.ActiveStatus === 'Draft') {
                item.ActiveStatusId = item.ActiveStatusId || 1;
                if (item.ActiveStatusId === 2) {
                    if (item.IsActive === false || item.IsActive === 0) {
                        item.IsActive = false;
                        item.ActiveStatusId = 3;//inactive
                    }
                }
            }
            if (item.ActiveStatus === 'Active') {
                item.ActiveStatusId = item.ActiveStatusId || 2;
                switch (item.ActiveStatusId) {
                    case 1:
                        item.IsActive = true;
                        item.ActiveStatusId = 2;//active
                        break;
                    case 2:
                        if (item.IsActive === false || item.IsActive === 0) {
                            item.IsActive = false;
                            item.ActiveStatusId = 3;//inactive
                        }
                        break;
                    case 3:
                        if (item.IsActive === true || item.IsActive === 1) {
                            item.IsActive = true;
                            item.ActiveStatusId = 2;//active
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private CheckId(entity: TAttributes): void {
        if (!entity || entity.Id <= 0) {
            throw 'Invalid Id. Operation Faild.';
        }
    }
}

export class ProcResult {
    Results: any;
    MetaData: any;
}

export class BoFactory {
    public static GetBo<T extends IBaseBo>(type: { new(req: Request): T }, req?: Request): T {
        return new type(req);
    }
}

export class BO<TModel extends Instance<IAttributes>, TAttributes extends IAttributes> extends BaseBo<TModel, TAttributes> {
    private Model: SStatic.Model<TModel, TAttributes>;
    constructor(model: SStatic.Model<TModel, TAttributes>, req?: Request) {
        super(req);
        this.Model = model;
    }
    public GetModel(): SStatic.Model<TModel, TAttributes> {
        return this.Model;
    }
}

export class MapBo<TModel extends Instance<IAttributes>, TAttributes extends IAttributes> extends BaseBo<TModel, TAttributes> {
    private PivoteKey: string;
    private ToBeCompare: string;
    private Model: SStatic.Model<TModel, TAttributes>;
    constructor(model: SStatic.Model<TModel, TAttributes>, pivoteKey: string /*| Array<string>*/, toBeCompare: string, req?: Request) {
        super(req);
        this.PivoteKey = pivoteKey;
        this.ToBeCompare = toBeCompare;
        this.Model = model;
    }
    public async Manage(entities: Array<TAttributes>): Promise<boolean> {
        let response = entities && entities.length > 0;
        console.log('********************entities***************', entities);
        console.log('********************response***************', response);
        if (response) {
            let _entities = _(entities);
            let groups = _entities.groupBy(this.PivoteKey).map().value();
            if (groups.length > 1) {
                throw `More than one group of '` + this.PivoteKey + `' cannot mange at a time'`;
            }
            let pivoteValue = (<any>_entities.first())[this.PivoteKey];
            let source: Array<TModel> = await super.FindAll({ where: { [this.PivoteKey]: pivoteValue } });
            let _source = _(source);

            let _sourceIdMap = _source.map(this.ToBeCompare);
            let _entityIdMap = _entities.map(this.ToBeCompare);

            let sourceIds = _sourceIdMap.value();
            let entityIds = _entityIdMap.value();
            console.log('********************sourceIds***************', sourceIds);
            console.log('********************entityIds***************', entityIds);
            //Delete
            let toBeDeleteIds = _sourceIdMap.difference(entityIds).value();
            if (toBeDeleteIds.length > 0) {
                let cnt = await super.Items.destroy({ where: { [this.PivoteKey]: pivoteValue, [this.ToBeCompare]: toBeDeleteIds } });
                if (cnt !== toBeDeleteIds.length) {
                    throw 'MapBO - Manage Action failed due to Deleted record count mismatch';
                }
            }
            //Update
            let toBeUpdateIds = _sourceIdMap.intersection(entityIds).value();
            if (toBeUpdateIds.length > 0) {
                let toBeUpdate: Array<TAttributes> = [];
                toBeUpdate = _entities.filter((x: any) => _.includes(toBeUpdateIds, x[this.PivoteKey])).value();
                await Promise.all(toBeUpdate.map(updateItem => {
                    (async (item) => {
                        await super.Items.update(item, {
                            where: { [this.PivoteKey]: pivoteValue, [this.ToBeCompare]: (<any>item)[this.ToBeCompare] }
                        });
                    })(updateItem);
                }));
            }
            //Add
            let tobeAdd: Array<TAttributes> = [];
            let toBeAddIds = _entityIdMap.difference(sourceIds).value();
            tobeAdd = _.filter(entities, (x: any) => _.includes(toBeAddIds, x[this.ToBeCompare]));
            await super.Items.bulkCreate(tobeAdd);
        }
        return response;
    }
    public async Manages(entities: Array<TAttributes>): Promise<boolean> {
        let response = entities && entities.length > 0;
        if (response) {
            let _entities = _(entities);
            let groups = _entities.groupBy(this.PivoteKey).map().value();
            if (groups.length > 1) {
                throw `More than one group of '` + this.PivoteKey + `' cannot mange at a time'`;
            }
            let pivoteValue = (<any>_entities.first())[this.PivoteKey];
            let source: Array<TModel> = await super.FindAll({ where: { [this.PivoteKey]: pivoteValue } });
            let _source = _(source);

            let _sourceIdMap = _source.map(this.ToBeCompare);
            let _entityIdMap = _entities.map(this.ToBeCompare);

            let sourceIds = _sourceIdMap.value();
            let entityIds = _entityIdMap.value();
            //Delete
            // let toBeDeleteIds = _sourceIdMap.difference(entityIds).value();
            // if (toBeDeleteIds.length > 0) {
            //     let cnt = await super.Items.destroy({ where: { [this.PivoteKey]: pivoteValue, [this.ToBeCompare]: toBeDeleteIds } });
            //     if (cnt !== toBeDeleteIds.length) {
            //         throw 'MapBO - Manage Action failed due to Deleted record count mismatch';
            //     }
            // }
            //Update
            let toBeUpdateIds = _sourceIdMap.intersection(entityIds).value();
            if (toBeUpdateIds.length > 0) {
                let toBeUpdate: Array<TAttributes> = [];
                toBeUpdate = _entities.filter((x: any) => _.includes(toBeUpdateIds, x[this.PivoteKey])).value();
                await Promise.all(toBeUpdate.map(updateItem => {
                    (async (item) => {
                        await super.Items.update(item, {
                            where: { [this.PivoteKey]: pivoteValue, [this.ToBeCompare]: (<any>item)[this.ToBeCompare] }
                        });
                    })(updateItem);
                }));
            }
            //Add
            let tobeAdd: Array<TAttributes> = [];
            let toBeAddIds = _entityIdMap.difference(sourceIds).value();
            tobeAdd = _.filter(entities, (x: any) => _.includes(toBeAddIds, x[this.ToBeCompare]));
            await super.Items.bulkCreate(tobeAdd);
        }
        return response;
    }
    public async GetMaps(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<TAttributes>> {
        let where: WhereOptions<any> = {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where[this.PivoteKey] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }

    public GetModel(): SStatic.Model<TModel, TAttributes> {
        return this.Model;
    }
}
