import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TickSheetMasterDetailInstance, TickSheetMasterDetailAttributes } from '../Model/Interface/Index';
import { TickSheetMasterDetailFilters } from '../Common/Filters.e';

export class TickSheetMasterDetailBo extends BaseBo<TickSheetMasterDetailInstance, TickSheetMasterDetailAttributes>  {
    public async AddTickSheetMasterDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTickSheetMasterDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageDetails(masterId: number, details: TickSheetMasterDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.TickSheetMasterId = masterId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetTickSheetMasterDetailById(req: BaseRequest): Promise<TickSheetMasterDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTickSheetMasterDetails(apiReq?: ApiRequest<TickSheetMasterDetailFilters>):
        Promise<ApiResponse<TickSheetMasterDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];

        include.push({
            model: this.Models.Testmaster, required: false,
            include: [this.GetReference('TESTMASTERTYP')]
        });
        include.push({ model: this.Models.DrugMaster, required: false });
        include.push({ model: this.Models.DietItemMaster, required: false });
        include.push(this.GetReference('DurationPeriod'));
        include.push(this.GetReference('TESTMASTERTYP'));

        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case TickSheetMasterDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case TickSheetMasterDetailFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case TickSheetMasterDetailFilters.TickSheetMasterId:
                    where['TickSheetMasterId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTickSheetMasterDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TickSheetMasterDetailInstance, TickSheetMasterDetailAttributes> {
        return this.Models.TickSheetMasterDetail;
    }

}
