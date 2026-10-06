import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { WardRoomMasterInstance, WardRoomMasterAttributes } from '../Model/Interface/Index';
import { WardRoomMasterFilters, WardRoomBedMasterFilters } from '../Common/Filters.e';
import * as generalBo from '../../GeneralMaster/Business/Index';
import { readFileSync } from 'fs';

export class WardRoomMasterBo extends BaseBo<WardRoomMasterInstance, WardRoomMasterAttributes> {
    public async AddWardRoomMaster(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.PhotoPath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleActiveState(req.Data);
        let wardBO = BoFactory.GetBo(generalBo.WardMasterBo, this.Request);
        let wardInfo = await wardBO.GetWardMasterById({ Id: req.Data.WardId });
        req.Data.LocationId = wardInfo.LocationId;
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWardRoomMaster(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.PhotoPath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRoomLogo(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.PhotoPath);
        return new Buffer(result).toString('base64');
    }

    public async GetWardRoomMasterById(req: BaseRequest): Promise<WardRoomMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRoomFile(req: BaseRequest, res: any): Promise<any> {
        let result = await res.download(req.Data.PhotoPath);
        return result;
    }

    public async GetWardRoomMasters(apiReq?: ApiRequest<WardRoomMasterFilters>): Promise<ApiResponse<WardRoomMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let WardWhere: WhereOptions<any> = {};
        let IsWardSearch: boolean = false;
        include.push({ model: this.Models.LocationMaster, attributes: ['LocationName'], required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WardRoomMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WardRoomMasterFilters.RoomTypeId:
                        where['RoomTypeId'] = param.Value;
                        break;
                    case WardRoomMasterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case WardRoomMasterFilters.WardMasterTypeId:
                        IsWardSearch = true;
                        WardWhere['WardMasterTypeId'] = param.Value;
                        break;
                    case WardRoomMasterFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case WardRoomMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case WardRoomMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let WardInclude: any = { model: this.Models.WardMaster, where: WardWhere, attributes: ['WardName'], required: IsWardSearch };
        include.push(WardInclude);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteWardRoomMaster(req: BaseRequest): Promise<Boolean> {
        let result = await this.MarkAsDelete(req.Id);
        let WardBedBo = BoFactory.GetBo(generalBo.WardRoomBedMasterBo, this.Request);
        let ApiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: WardRoomBedMasterFilters.RoomId, Value: req.Id }]
        };
        let data = await WardBedBo.GetWardRoomBedMasters(ApiReq);
        let Details = data.Data;
        Details.forEach(detail => {
            detail.Status = 2;
        });
        await WardBedBo.ManageWardRoomBedMaster(Details);
        return result;
    }

    public GetModel(): SStatic.Model<WardRoomMasterInstance, WardRoomMasterAttributes> {
        return this.Models.WardRoomMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<WardRoomMasterFilters>): Promise<any> {
        apiReq.Params = apiReq.Params || [];
        if (key === 'OtRooms') {
            apiReq.Params.push({ Key: WardRoomMasterFilters.WardMasterTypeId, Value: 3 });
        }
        apiReq.Attributes = apiReq.Attributes || ['Id', ['RoomNo', 'Text']];
        let val = await this.GetWardRoomMasters(apiReq);
        return { [key]: val.Data };
    }
}
