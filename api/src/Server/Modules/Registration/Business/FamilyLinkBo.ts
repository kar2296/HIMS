import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { FamilyLinkInstance, FamilyLinkAttributes } from '../Model/Interface/Index';
import { FamilyLinkFilters } from '../Common/Filters.e';
export class FamilyLinkBo extends BaseBo<FamilyLinkInstance, FamilyLinkAttributes> {
    public async AddFamilyLink(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFamilyLink(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageFamilyLinks(req: BaseRequest): Promise<boolean> {
        let list: FamilyLinkAttributes[] = req.Data || [];
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

    public async ManageFamilyLinksfromReg(req: any): Promise<boolean> {
        let list: FamilyLinkAttributes[] = req || [];
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

    public async GetFamilyLinkById(req: BaseRequest): Promise<FamilyLinkAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFamilyLinks(apiReq?: ApiRequest<FamilyLinkFilters>): Promise<Array<FamilyLinkAttributes>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('FamilyLinkType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FamilyLinkFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FamilyLinkFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case FamilyLinkFilters.PatientId:
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

    public async GetFamilyLinksForBillTransfer(apiReq?: ApiRequest<FamilyLinkFilters>): Promise<ApiResponse<FamilyLinkAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FamilyLinkFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FamilyLinkFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case FamilyLinkFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case FamilyLinkFilters.IncludeEncounter:
                        include.push({
                            model: this.Models.Encounter,
                            attributes: ['Id', 'VisitIdentifier', 'PatientMrn'],
                            required: false,
                            where: {
                                'Status': 1,
                                'EncounterTypeId': 2,
                                'AdmissionStatusId': { '$in': [2, 3, 4] }
                            }, as: 'PatientEncounter'
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFamilyLink(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FamilyLinkInstance, FamilyLinkAttributes> {
        return this.Models.FamilyLink;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<FamilyLinkFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'PatientId', 'MemberId', ['PatientName', 'Text'], 'MRN'];
        let val = await this.GetFamilyLinksForBillTransfer(apiReq);
        return { [key]: val.Data };
    }
}
