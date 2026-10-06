import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AntibioticOrganismFilters } from '../Common/Filters.e';
import { AntibioticOrganismMapInstance, AntibioticOrganismMapAttributes } from '../Model/Interface/Index';

export class AntibioticOrganismMapBo extends BaseBo<AntibioticOrganismMapInstance, AntibioticOrganismMapAttributes> {
    public async AddAntibioticOrganismMap(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAntibioticOrganismMap(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAntibioticOrganismMapById(req: BaseRequest): Promise<AntibioticOrganismMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAntibioticOrganismMaps(apiReq?: ApiRequest<AntibioticOrganismFilters>):
        Promise<ApiResponse<AntibioticOrganismMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.AntibioticMaster, required: false });
        include.push({ model: this.Models.OrgIsolation, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AntibioticOrganismFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AntibioticOrganismFilters.AntibioticId:
                        where['AntibioticMasterId'] = param.Value;
                        break;
                    case AntibioticOrganismFilters.OrganismMapId:
                        where['OrganismMapId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAntibioticOrganismMap(req: BaseRequest): Promise<Boolean> {
        await this.Items.destroy({ where: { Id: req.Id }, limit: 1 });
        return true;
    }

    public GetModel(): SStatic.Model<AntibioticOrganismMapInstance, AntibioticOrganismMapAttributes> {
        return this.Models.AntibioticOrganismMap;
    }
}
