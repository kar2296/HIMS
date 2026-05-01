import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { CategorySectionEntryInstance, CategorySectionEntryAttributes } from '../Model/Interface/Index';
import { CategorySectionEntryFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';

export class CategorySectionEntryBo extends BaseBo<CategorySectionEntryInstance, CategorySectionEntryAttributes>  {
    public async AddCategorySectionEntry(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCategorySectionEntry(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetLastIPCasesheetId(req: BaseRequest): Promise<number> {
        let IPCasesheetId_ = 1;
        let IPCasesheetIdInst: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('IPCasesheetId')), 'IPCasesheetId'],
            ]
        });
        if (IPCasesheetIdInst) {
            let IPCasesheetIdAttr: any = this.GetAttribute(IPCasesheetIdInst);
            IPCasesheetId_ = IPCasesheetIdAttr['IPCasesheetId'];
            if (!IPCasesheetId_) {
                IPCasesheetId_ = 1;
            } else { IPCasesheetId_++; }
        }
        return IPCasesheetId_;
    }

    public async ManageCategorySectionEntries(req: BaseRequest): Promise<boolean> {
        let IPCasesheetId_ = await this.GetLastIPCasesheetId(req);
        let details: any[] = req.Data.details || [];
        for (let k = 0, len = details.length; k < len; k++) {
            let detail = details[k];
            if (!detail.IPCasesheetId) detail.IPCasesheetId = IPCasesheetId_;
            if (detail.Id === 0) {
                if (await this.findCategorySectionEntry(detail) === 0) {
                    // details.splice(k, 1);
                    await this.Save(detail);
                }
            } else if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
            } else if (detail.Id > 0) {
                    await this.Update(detail);
            }
        }
        // await Promise.all(details.map((DetailItem): Promise<void> => {
        //     return (async (detail): Promise<void> => {
        //         if (!detail.IPCasesheetId) detail.IPCasesheetId = IPCasesheetId_;
        //         if (detail.Status === 2 && detail.Id !== 0) {
        //             await this.MarkAsDelete(detail.Id);
        //         } else if (detail.Id === 0) {
        //             // if (await this.findCategorySectionEntry(detail) === 0) {
        //                 await this.Save(detail);
        //             // }
        //         } else if (detail.Id > 0) {
        //             await this.Update(detail);
        //         }
        //     })(DetailItem);
        // }));
        return true;
    }

    public async findCategorySectionEntry(req: CategorySectionEntryAttributes): Promise<number> {
        let checkEntry: any = await this.Find({
            attributes: [
                [this.Dal.fn('COUNT', this.Dal.col('CategorySectionEntryId')), 'CategorySectionEntryId'],
            ],
            where: {
                EncounterId: req.EncounterId,
                ConsultationId: req.ConsultationId,
                PatientId: req.PatientId,
                SectionId: req.SectionId,
                CategoryKey: req.CategoryKey,
                ConceptKey: req.ConceptKey
            }
        });
        if (checkEntry) {
            let catcnt: any = this.GetAttribute(checkEntry);
            console.log(catcnt['CategorySectionEntryId']);
            if (catcnt['CategorySectionEntryId']) {
                return catcnt['CategorySectionEntryId'];
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    public async GetCategorySectionEntryById(req: BaseRequest): Promise<CategorySectionEntryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCategorySectionEntrys(apiReq?: ApiRequest<CategorySectionEntryFilters>):
        Promise<ApiResponse<CategorySectionEntryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Category, as: 'Category', required: false });
        include.push({ model: this.Models.Concept, as: 'Concept', required: false });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Encounter, attributes: ['DoctorName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CategorySectionEntryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CategorySectionEntryFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case CategorySectionEntryFilters.SectionId:
                        where['SectionId'] = param.Value;
                        break;
                    case CategorySectionEntryFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case CategorySectionEntryFilters.IPCasesheetId:
                        where['IPCasesheetId'] = param.Value;
                        break;
                    case CategorySectionEntryFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case CategorySectionEntryFilters.IPCasesheetAt:
                        where['IPCasesheetAt'] = { '$between': param.Value || '' };
                        break;
                    case CategorySectionEntryFilters.PhysioRegisterId:
                        where['PhysioRegisterId'] = param.Value;
                        break;
                    case CategorySectionEntryFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetCategorySectionEntrysForReview(req: BaseRequest):
        Promise<ApiResponse<any>> {
        let sectionId = req.Data.sectionid;
        let consultationId = req.Data.consultationid;
        let IPCasesheetId = req.Data.ipcasesheetid;
        let IPCasesheetAt = req.Data.ipcasesheetat;
        let OTRegisterId = req.Data.otregisterid;
        let PhysioRegisterId = req.Data.physioregid;
        let apiReq: any = {
            Params: [
                { Key: 2, Value: sectionId },
                { Key: 3, Value: consultationId }
            ]
        };

        if (req.Data.patientid)
            apiReq.Params.push({ Key: 8, Value: req.Data.patientid });

        if (IPCasesheetId)
            apiReq.Params.push({ Key: 4, Value: IPCasesheetId });

        if (OTRegisterId)
            apiReq.Params.push({ Key: 5, Value: OTRegisterId });

        if (IPCasesheetAt)
            apiReq.Params.push({ Key: 6, Value: IPCasesheetAt });

        if (PhysioRegisterId)
            apiReq.Params.push({ Key: 7, Value: PhysioRegisterId });

        let entries = await this.GetCategorySectionEntrys(apiReq);

        var inputData: any = {
            Params: [
                { Key: 0, Value: sectionId }]
        };
        // let sectionMasterBo = BoFactory.GetBo(bo.SectionMasterBo, this.Request);
        // let maps = await sectionMasterBo.GetCategories(inputData);

        let sectionCategoryMapBo = BoFactory.GetBo(bo.SectionCategoryMapBo, this.Request);
        let maps = await sectionCategoryMapBo.GetSectionCategories(inputData);

        // console.log('maps');
        // console.log(maps);
        let result: any = { list: entries.Data, map: maps };
        return result;
    }

    public async DeleteCategorySectionEntryGroup(req: BaseRequest): Promise<Boolean> {
        let sectionId = req.Data.sectionid;
        let consultationId = req.Data.consultationid;
        let IPCasesheetId = req.Data.ipcasesheetid;
        let OTRegisterId = req.Data.otregisterid;
        let PhysioRegisterId = req.Data.physioregid;
        let apiReq: any = {
            Params: [
                { Key: 2, Value: sectionId },
                { Key: 3, Value: consultationId }
            ]
        };

        if (IPCasesheetId)
            apiReq.Params.push({ Key: 4, Value: IPCasesheetId });

        if (OTRegisterId)
            apiReq.Params.push({ Key: 5, Value: OTRegisterId });

        if (PhysioRegisterId)
            apiReq.Params.push({ Key: 7, Value: PhysioRegisterId });

        let details = await this.GetCategorySectionEntrys(apiReq);
        await Promise.all(details.Data.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                if (detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                }
            })(DetailItem);
        }));

        return true;

    }

    public async DeleteCategorySectionEntry(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CategorySectionEntryInstance, CategorySectionEntryAttributes> {
        return this.Models.CategorySectionEntry;
    }

}
