import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GuarantorInstance, GuarantorAttributes } from '../Model/Interface/Index';
import { GuarantorFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as appMgrBO from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class GuarantorBo extends BaseBo<GuarantorInstance, GuarantorAttributes> {
    public async AddGuarantor(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGuarantor(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        console.log(this.Session.FacilityId);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGuarantorById(req: BaseRequest): Promise<GuarantorAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantors(apiReq?: ApiRequest<GuarantorFilters>): Promise<ApiResponse<GuarantorAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('TPA'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({
            model: this.Models.PincodeMaster, attributes: ['Pincode'], required: false,
        });
        include.push({
            model: this.Models.Facility, required: false,
        });
        include.push({
            model: this.Models.CityMaster, attributes: ['CityName'], required: false,
        });
        include.push({
            model: this.Models.CountryMaster, attributes: ['CountryName'], required: false,
        });
        include.push({
            model: this.Models.StateMaster, attributes: ['StateName'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GuarantorFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GuarantorFilters.Name:
                        (where as any)[Op.or] = [{ GuarantorName: { [Op.like]: (param.Value || '') + '%' } },
                        { Code: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case GuarantorFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case GuarantorFilters.TPAId:
                        where['TPAId'] = param.Value;
                        break;
                    case GuarantorFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case GuarantorFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case GuarantorFilters.ContractExpiryDate:
                        where['ContractExpiryDate'] = { '$between': param.Value };
                        break;
                    case GuarantorFilters.From:
                        where['ContractExpiryDate'] = where['ContractExpiryDate'] || {};
                        (where['ContractExpiryDate'] as any)['$gte'] = param.Value;
                        break;
                    case GuarantorFilters.To:
                        where['ContractExpiryDate'] = where['ContractExpiryDate'] || {};
                        (where['ContractExpiryDate'] as any)['$lte'] = param.Value;
                        break;
                    case GuarantorFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    case GuarantorFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGuarantor(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorInstance, GuarantorAttributes> {
        return this.Models.Guarantor;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<GuarantorFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['GuarantorName', 'Text'],
            'Code', 'GuarantorTypeId', 'TPAId', 'ServiceRateCategoryId', 'IsIPBedTariff', 'CoPayPercent'];
        let val = await this.GetGuarantors(apiReq);
        return { [key]: val.Data };
    }

    public async GetSelfGuarantor(): Promise<GuarantorAttributes> {
        let GuarantorId_ = 1000;
        await this.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        let result = await this.GetById(GuarantorId_); //1000 is self Guarantor primary id
        return this.GetAttribute(result);
    }

    public async GetFreeGuarantor(): Promise<GuarantorAttributes> {
        let GuarantorId_ = 2000;
        let result = await this.GetById(GuarantorId_); //2000 is free Guarantor primary id
        return this.GetAttribute(result);
    }

    public async GetCurrentGuarantorId(): Promise<number> {
        let CurrentFacilityId = this.Session.FacilityId;
        if (!CurrentFacilityId) CurrentFacilityId = 1;
        let GuarantorId_ = 1 * CurrentFacilityId;
        return GuarantorId_;
    }
    public async PrintInsuranceListReport(apiReq?: ApiRequest<GuarantorFilters>): Promise<any> {
        let data = await this.GetGuarantors(apiReq);
        let Guarantor = data.Data;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorType = apiReq.Data.GuarantorType;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let GuarantorData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GuarantorData.FacilityId);
        let info = {
            Guarantor: Guarantor,
            Preferences: printPreferencesData,
            FacilityName: FacilityName,
            GuarantorType: GuarantorType,
            ActiveStatus: ActiveStatus
        };
        let pdfOption: any = null;
        let key = 'insurancelistreport';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async AddGuarantorMasterExcel(req: BaseRequest): Promise<boolean> {
        let details: GuarantorAttributes[] = req.Data || [];
        const filteredDetails: any[] = [];

        for (const DetailItem of details) {
            let codeduplicate = await this.FindAll({
                where: { Code: DetailItem.Code }
            });

            if (!codeduplicate || codeduplicate.length === 0) {
                filteredDetails.push(DetailItem);
            } else {
                console.warn('Duplicate Code found: ' + DetailItem.Code + '. Skipping this row.');
            }
        }

        if (filteredDetails.length === 0) {
            console.warn('No new items to insert.');
            return false; // No items to insert
        }

        let successCount = 0;

        await Promise.all(filteredDetails.map(async (DetailItem: any) => {
            try {
                await this.Save(DetailItem);
                successCount++;
            } catch (error) {
                console.error('Error saving detail:', DetailItem, error);
            }
        }));
        return successCount > 0;
    }
}
