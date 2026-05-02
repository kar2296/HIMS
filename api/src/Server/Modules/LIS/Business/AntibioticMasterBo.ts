import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { Request } from '../../../Core/Index';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AntibioticMasterInstance, AntibioticMasterAttributes, AntibioticOrganismMapAttributes } from '../Model/Interface/Index';
import { AntibioticMasterFilters, AntibioticOrganismFilters } from '../Common/Filters.e';
import * as bo from '../../LIS/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class AntibioticMasterBo extends BaseBo<AntibioticMasterInstance, AntibioticMasterAttributes> implements IOptionProvider {
    protected AntibioOrganismBO: bo.AntibioticOrganismMapBo;
    public constructor(req?: Request) {
        super(req);
        this.AntibioOrganismBO = BoFactory.GetBo(bo.AntibioticOrganismMapBo, req); //TODO
    }
    public async AddAntibioticMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAntibioticMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAntibioticMasterById(req: BaseRequest): Promise<AntibioticMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAntibioticMasters(apiReq?: ApiRequest<AntibioticMasterFilters>): Promise<ApiResponse<AntibioticMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AntibioticType'));
        include.push({ model: this.Models.OrgIsolation, attributes: ['OrgIsolationName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AntibioticMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AntibioticMasterFilters.Code:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case AntibioticMasterFilters.MnemonicName:
                        (where as any)[Op.or] = [{ Mnemonic: { [Op.like]: (param.Value || '') + '%' } },
                        { AntibioticName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case AntibioticMasterFilters.Type:
                        where['AntibioticTypeId'] = param.Value;
                        break;
                    case AntibioticMasterFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AntibioticMasterFilters.OrganismId:
                        where['OrganismId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });

    }

    public async DeleteAntibioticMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AntibioticMasterInstance, AntibioticMasterAttributes> {
        return this.Models.AntibioticMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AntibioticMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AntibioticName', 'Text'], 'Code'];
        let val = await this.GetAntibioticMasters(apiReq);
        return { [key]: val.Data };
    }
    //antibioticorganismmapbo
    public async AddAntibioticOrganismMap(req: BaseRequest): Promise<number> {
        return this.AntibioOrganismBO.AddAntibioticOrganismMap(req);
    }
    public async UpdateAntibioticOrganismMap(req: BaseRequest): Promise<boolean> {
        return this.AntibioOrganismBO.UpdateAntibioticOrganismMap(req);
    }
    public async GetAntibioticOrganismMapById(req: BaseRequest): Promise<AntibioticOrganismMapAttributes> {
        return this.AntibioOrganismBO.GetAntibioticOrganismMapById(req);
    }
    public async GetAntibioticOrganismMaps(apiReq?: ApiRequest<AntibioticOrganismFilters>):
        Promise<ApiResponse<AntibioticOrganismMapAttributes[]>> {
        return this.AntibioOrganismBO.GetAntibioticOrganismMaps(apiReq);
    }
    public async DeleteAntibioticOrganismMap(req: BaseRequest): Promise<Boolean> {
        return this.AntibioOrganismBO.DeleteAntibioticOrganismMap(req);
    }
}
