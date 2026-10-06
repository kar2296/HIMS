import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BedReservationDetailInstance, BedReservationDetailAttributes } from '../Model/Interface/Index';
import { BedReservationDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as generalMasterBo from '../../GeneralMaster/Business/Index';

export class BedReservationDetailBo extends BaseBo<BedReservationDetailInstance, BedReservationDetailAttributes> {
    public async AddBedReservationDetail(req: BaseRequest): Promise<number> {
        let result: any = {};
        result = await this.Save(req.Data);
        let generalmasterbo = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
        let item: any = {
            Data: {
                Id: req.Data.BedId,
                BedStatusId: req.Data.BedStatusId
            }
        };
        await generalmasterbo.UpdateBedMaster(item);
        return result.dataValues.Id;
    }

    public async UpdateBedReservationDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let generalmasterbo = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
        let item: any = {
            Data: {
                Id: req.Data.BedId,
                BedStatusId: req.Data.BedStatusId
            }
        };
        await generalmasterbo.UpdateBedMaster(item);
        return result;
    }

    public async GetBedReservationDetailById(req: BaseRequest): Promise<BedReservationDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBedReservationDetails(apiReq?: ApiRequest<BedReservationDetailFilters>)
        : Promise<ApiResponse<BedReservationDetailAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('BedReservationType'));
        include.push(this.GetReference('BedMaintenanceType'));
        include.push(this.GetReference('ReleaseStatus'));
        include.push({
            model: this.Models.User, as: 'ReleasedBy', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ReservedBy', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BedReservationDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BedReservationDetailFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case BedReservationDetailFilters.ReserveMaintenanceType:
                        where['ReserveMaintenanceTypeId'] = param.Value;
                        break;
                    case BedReservationDetailFilters.BedReservationType:
                        where['BedReservationTypeId'] = param.Value;
                        break;
                    case BedReservationDetailFilters.BedMaintenanceType:
                        where['BedMaintenanceTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteBedReservationDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BedReservationDetailInstance, BedReservationDetailAttributes> {
        return this.Models.BedReservationDetail;
    }
}
