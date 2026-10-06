import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
// import { WhereOptions, } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { SequenceMastersInstance, SequenceMastersAttributes } from '../Model/Interface/Index';
import { SequenceMastersFilters } from '../Common/Filters.e';
import { SequenceGenerator } from '../../../Core/Util/Index';

export class SequenceMastersBo extends BaseBo<SequenceMastersInstance, SequenceMastersAttributes> {
    public async AddSequenceMasters(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateSequenceMasters(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSequenceMastersById(req: BaseRequest): Promise<SequenceMastersAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async getMaxSequenceFromTable(value: any): Promise<number> {
        // const query = `SELECT MAX(CAST(SUBSTRING_INDEX(BillNumber, '/', -1) AS UNSIGNED)) AS MaxBillNumber
        //         FROM patientbills
        //                     WHERE BillNumber LIKE 'IPCR/2526/%'`;
        //     let maxnumber: any = await this.Dal.query(query);
        //     console.log(maxnumber);
        //     const allowedTables = ['PatientBills', 'OtherBills'];
        // const allowedColumns = ['BillNumber'];
        //     if (!allowedTables.includes(tableName)) {
        //     throw new Error('Invalid table name');
        // }
        //         if (!allowedColumns.includes(columnName)) {
        //     throw new Error('Invalid column name');
        //   }
        // let cfield: any = '' + checkfield + '';

        // const allowedTables: any = ['patientbills']; // whitelist
        let prefix = value.SeqPrefix;
        // let tvalue: string = value.TableName;

        // if (!allowedTables.includes(tvalue)) {
        //     throw new Error('Invalid table name');
        // }

        const [result] = await this.Dal.query(`SELECT
  MAX(CAST(SUBSTRING(BillNumber, CHAR_LENGTH(:prefix)) AS UNSIGNED)) AS MaxSeq
FROM patientbills
WHERE BillNumber LIKE :prefix`, {
            replacements: { prefix: prefix + '%' },
            type: this.Dal.QueryTypes.SELECT
        });
        //         const [result] = await this.Dal.query(`SELECT
        //   MAX(CAST(SUBSTRING(BillNumber, CHAR_LENGTH(:prefix) + 1) AS UNSIGNED)) AS MaxSeq
        // FROM ${tablename}
        // WHERE BillNumber LIKE :prefix`, {
        //             replacements: { prefix: prefix + '%' },
        //             type: this.Dal.QueryTypes.SELECT
        //         });
        console.log(result);



        return result ? result.MaxSeq : 0;
    }


    public async ManageNewSequences(req: BaseRequest): Promise<boolean> {
        let list: SequenceMastersAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetSequenceMasterss(apiReq?: ApiRequest<SequenceMastersFilters>): Promise<ApiResponse<SequenceMastersAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case SequenceMastersFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case SequenceMastersFilters.Name:
                    where['SeqName'] = param.Value;
                    break;
                case SequenceMastersFilters.GetAll:
                    where['SeqName'] = { '$like': '%' + param.Value + '%' };
                    break;
                case SequenceMastersFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, });
    }

    public async DeleteSequenceMasters(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async SyncRedisToSqlSequenceMasters(apiReq?: ApiRequest<SequenceMastersFilters>): Promise<boolean> {
        let res = await this.GetSequenceMasterss(apiReq);
        let Data = res.Data || [];
        await Promise.all(Data.map((seqItem): Promise<void> => {
            return (async (si): Promise<void> => {
                let sqlValue = si.SeqStartId;
                let redisValue = await SequenceGenerator.GetSequence(si.SeqName);
                si.SeqStartId = redisValue;
                await this.UpdateSequenceMasters({ Id: null, Data: si });
                console.log(['Sequence Gen',
                    ' Name:', si.SeqName,
                    ' CurrentDB:', sqlValue,
                    ' CurrentRedis:', redisValue,
                    ' UpdatedValue:', redisValue
                ].join(' '));
            })(seqItem);
        }));
        return true;
    }

    public async SyncSqlToRedisSequenceMasters(apiReq?: ApiRequest<SequenceMastersFilters>): Promise<boolean> {
        let res = await this.GetSequenceMasterss(apiReq);
        let Data = res.Data || [];
        await Promise.all(Data.map((seqItem): Promise<void> => {
            return (async (si): Promise<void> => {
                let redisValue = await SequenceGenerator.GetSequence(si.SeqName);
                let sqlValue = si.SeqStartId;
                await SequenceGenerator.SetSequence(si.SeqName, sqlValue);
                console.log(['Sequence Gen',
                    ' Name:', si.SeqName,
                    ' CurrentDB:', sqlValue,
                    ' CurrentRedis:', redisValue,
                    ' UpdatedValue:', sqlValue
                ].join(' '));
            })(seqItem);
        }));
        return true;
    }

    public GetModel(): SStatic.Model<SequenceMastersInstance, SequenceMastersAttributes> {
        return this.Models.SequenceMasters;
    }
}
