import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { WardRoomServiceMapInstance, WardRoomServiceMapAttributes } from '../Model/Interface/Index';
import { WardRoomServiceMapFilters, WardRoomBedMasterFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import { ServiceItemTariffDetailFilters } from '../../ClinicalMaster/Common/Filters.e';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import * as generalmasterBO from '../../GeneralMaster/Business/Index';

export class WardRoomServiceMapBo extends BaseBo<WardRoomServiceMapInstance, WardRoomServiceMapAttributes> {
    public async AddWardRoomServiceMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWardRoomServiceMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetWardRoomServiceMapById(req: BaseRequest): Promise<WardRoomServiceMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWardRoomServiceMaps(apiReq?: ApiRequest<WardRoomServiceMapFilters>):
        Promise<ApiResponse<WardRoomServiceMapAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ServiceItem, attributes: ['Name', 'ItemCode'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WardRoomServiceMapFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WardRoomServiceMapFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case WardRoomServiceMapFilters.ServiceItemId:
                        where['ServiceItemId'] = param.Value;
                        break;
                    case WardRoomServiceMapFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetRoomChargesDetails(req: BaseRequest): Promise<any> {
        let GeneralMasterBo = BoFactory.GetBo(generalmasterBO.WardRoomBedMasterBo, this.Request);
        let bedreq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: WardRoomBedMasterFilters.Id, Value: req.Id }]
        };
        let BedDetails = await GeneralMasterBo.GetWardRoomBedMasters(bedreq);
        let WardRoomDetails: any = BedDetails.Data[0];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: WardRoomServiceMapFilters.RoomId, Value: WardRoomDetails.RoomId }]
        };
        let data = await this.GetWardRoomServiceMaps(apiReq);
        let ServiceItemCharges: any = [];
        await Promise.all(data.Data.map((serviceitem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let DefaultTariffBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemTariffDetailBo, this.Request);
                let servicereq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: ServiceItemTariffDetailFilters.ServiceItemId, Value: detail.ServiceItemId }]
                };
                let TariffDetails: any = await DefaultTariffBo.GetServiceItemTariffDetails(servicereq);
                let Charges = {
                    ServiceName: TariffDetails.Data[0].ServiceItem.Name,
                    TariffDetails: TariffDetails.Data
                };
                ServiceItemCharges.push(Charges);
            })(serviceitem);
        }));
        WardRoomDetails.ServiceItemCharges = ServiceItemCharges;
        return WardRoomDetails;
    }
    public async DeleteWardRoomServiceMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WardRoomServiceMapInstance, WardRoomServiceMapAttributes> {
        return this.Models.WardRoomServiceMap;
    }
}
