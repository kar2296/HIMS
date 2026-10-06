import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PrivilegeCardDetailInstance, PrivilegeCardDetailAttributes } from '../Model/Interface/Index';
import { PrivilegeCardDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PrivilegeCardDetailBo extends BaseBo<PrivilegeCardDetailInstance, PrivilegeCardDetailAttributes> implements IOptionProvider {
    public async AddPrivilegeCardDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePrivilegeCardDetail(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }


    public async ManagePrivilegeCardDetails(privilegecardId: number,
        details: any[]): Promise<boolean> {
        details = details || [];
        let patientId: number;
        let patInfo: any = {};
        let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PrivilegeCardId = privilegecardId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    patInfo = {
                        Data: {
                            PatientId: detail.PatientId,
                            TitleId: detail.TitleId,
                            FirstName: detail.FirstName,
                            LastName: detail.LastName,
                            HolderName: detail.HolderName,
                            Age: detail.Age,
                            DOB: detail.DOB,
                            Mobile: detail.MobileNo,
                            Address: detail.Address,
                            GenderId: detail.GenderId,
                            Gender: detail.Gender,
                            Title: detail.title,
                            MRNTypeId: 2,
                            NationalityId: 238,
                            PreferredLanguageId: 4,
                            RegisteredDate: detail.RegisteredDateG,
                            PatientStatusId: 2,
                            PatientStatus: 'Active',
                            FacilityId: detail.FacilityId,
                            OverrideDuplicate: false,
                            CountryId: 1,
                            CardTypeId: detail.CardTypeId,
                            PromotionSchemeId: detail.PromotionSchemeId,
                            CardNo: detail.CardNo,
                            ValidTo: detail.ValidTo,
                        }
                    };
                    if (detail.PatientId > 0) {
                        patInfo.Data.Id = detail.PatientId;
                        await patientBO.UpdatePatient(patInfo);
                    }
                    if (!detail.PatientId) {
                        patientId = await patientBO.AddPatient(patInfo);
                        detail.PatientId = patientId;
                    }
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }


    public async GetPrivilegeCardDetailById(req: BaseRequest): Promise<PrivilegeCardDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPrivilegeCardDetails(apiReq?: ApiRequest<PrivilegeCardDetailFilters>):
        Promise<ApiResponse<PrivilegeCardDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('Gender'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PrivilegeCardDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PrivilegeCardDetailFilters.PrivilegeCardId:
                        where['PrivilegeCardId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePrivilegeCardDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PrivilegeCardDetailFilters>): Promise<any> {
        let val = await this.GetPrivilegeCardDetails(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<PrivilegeCardDetailInstance, PrivilegeCardDetailAttributes> {
        return this.Models.PrivilegeCardDetail;
    }
}
