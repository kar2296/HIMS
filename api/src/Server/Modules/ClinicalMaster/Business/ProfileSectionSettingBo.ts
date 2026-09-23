import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ProfileSectionSettingInstance, ProfileSectionSettingAttributes } from '../Model/Interface/Index';
import { ProfileSectionSettingFilters } from '../Common/Filters.e';

/**
 * Panel nickname / mandatory flag per EMR form (ProfileMaster) and panel (SectionMaster).
 */
export class ProfileSectionSettingBo extends BaseBo<ProfileSectionSettingInstance, ProfileSectionSettingAttributes> {

    public async GetProfileSectionSettings(apiReq?: ApiRequest<ProfileSectionSettingFilters>): Promise<ApiResponse<ProfileSectionSettingAttributes[]>> {
        let where: WhereOptions<any> = {};
        (apiReq.Params || []).forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProfileSectionSettingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProfileSectionSettingFilters.ProfileId:
                        where['ProfileId'] = param.Value;
                        break;
                    case ProfileSectionSettingFilters.SectionId:
                        where['SectionId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, attributes: apiReq.Attributes });
    }

    /**
     * Replaces the settings of one form. req.Id = ProfileId, req.Data = [{ SectionId, NickName, IsMandatory }].
     * Rows are matched on SectionId: existing ones are updated, new ones added, missing ones soft-deleted.
     */
    public async ManageProfileSectionSettings(req: BaseRequest): Promise<boolean> {
        const profileId = Number(req.Id);
        if (!profileId) {
            throw new Error('ProfileId is required.');
        }
        const incoming: Array<any> = (req.Data || []).filter((x: any) => x && x.SectionId);
        const existing = (await this.FindAll({ where: { ProfileId: profileId } })).map((r) => this.GetAttribute(r));
        const promises: Array<Promise<any>> = [];

        incoming.forEach((item) => {
            const nickName = item.NickName ? String(item.NickName).trim().substring(0, 150) : null;
            const current = existing.find((e) => Number(e.SectionId) === Number(item.SectionId));
            if (current) {
                promises.push(this.Update({ Id: current.Id, NickName: nickName, IsMandatory: !!item.IsMandatory } as any));
            } else {
                promises.push(this.Save({ ProfileId: profileId, SectionId: Number(item.SectionId), NickName: nickName, IsMandatory: !!item.IsMandatory } as any));
            }
        });
        existing
            .filter((e) => !incoming.some((i) => Number(i.SectionId) === Number(e.SectionId)))
            .forEach((e) => promises.push(this.MarkAsDelete(e.Id)));

        await Promise.all(promises);
        return true;
    }

    public GetModel(): SStatic.Model<ProfileSectionSettingInstance, ProfileSectionSettingAttributes> {
        return this.Models.ProfileSectionSetting;
    }
}
