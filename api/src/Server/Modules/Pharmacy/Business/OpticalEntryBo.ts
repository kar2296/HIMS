import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { OpticalEntryInstance, OpticalEntryAttributes } from '../Model/Interface/Index';
import { OpticalEntryFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
export class OpticalEntryBo extends BaseBo<OpticalEntryInstance, OpticalEntryAttributes> {
    public async AddOpticalEntry(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let opticalEntryId = result.dataValues.Id;
        this.deferSequenceKey(opticalEntryId, 'OrderNo',
            this.getSequenceIdentifier(SequenceKeys.OpticalEntryId));
        return opticalEntryId;

    }

    public async UpdateOpticalEntry(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOpticalEntryById(req: BaseRequest): Promise<OpticalEntryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOpticalEntrys(apiReq?: ApiRequest<OpticalEntryFilters>): Promise<ApiResponse<OpticalEntryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.Patient, attributes: ['TitleId', 'FirstName', 'LastName'],
            include: [
                this.GetReference('Title')
            ], required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OpticalEntryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteOpticalEntry(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OpticalEntryInstance, OpticalEntryAttributes> {
        return this.Models.OpticalEntry;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<OpticalEntryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CategoryName', 'Text'], 'CategoryName', 'CategoryCode'];
        let val = await this.GetOpticalEntrys(apiReq);
        return { [key]: val.Data };
    }
}
