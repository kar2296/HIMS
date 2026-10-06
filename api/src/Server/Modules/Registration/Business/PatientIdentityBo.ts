import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientIdentityInstance, PatientIdentityAttributes } from '../Model/Interface/Index';
import { PatientIdentityFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class PatientIdentityBo extends BaseBo<PatientIdentityInstance, PatientIdentityAttributes> {
    public async AddPatientIdentity(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.ImagePath = file.path;
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientIdentity(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.ImagePath = file.path;
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientIdentities(req : BaseRequest): Promise<boolean> {
        let list: PatientIdentityAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            let file = this.Request.file;
            if (file) {
                item.ImagePath = file.path;
            }
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
    public async GetPatientIdDocs(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.ImagePath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Photo: photoBase64 };
    }
    public async GetPatientIdentityById(req: BaseRequest): Promise<PatientIdentityAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientIdentitys(apiReq?: ApiRequest<PatientIdentityFilters>): Promise<Array<PatientIdentityAttributes>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PatientIdentityType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientIdentityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientIdentityFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientIdentityFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, include: include, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }

    public async DeletePatientIdentity(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientIdentityInstance, PatientIdentityAttributes> {
        return this.Models.PatientIdentity;
    }
}
