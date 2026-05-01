import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDietOrderDetailInstance, PatientDietOrderDetailAttributes } from '../Model/Interface/Index';
import { PatientDietOrderDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../EMR/Business/Index';
import { join } from 'path';
// import * as userbo from '../../SystemSettings/Business/Index';

export class PatientDietOrderDetailBo extends BaseBo<PatientDietOrderDetailInstance, PatientDietOrderDetailAttributes>  {
    public async AddPatientDietOrderDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDietOrderDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDietOrderDetailById(req: BaseRequest): Promise<PatientDietOrderDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientDietOrderDetails(patientDietOrderId: number, details: PatientDietOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientDietOrderId = patientDietOrderId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ProcessDetailsForOrder(patientDietOrderId: number): Promise<boolean> {
        let orderDetails = await this.FindAll({
            where: {
                PatientDietOrderId: patientDietOrderId
            }
        });
        //console.log('order details');
        //console.log(orderDetails);
        if (orderDetails) {
            let orderDetailAttribs = this.GetAttributes(orderDetails);
            let orderGroups: any = {};
            let firstGroupKey: any = '';
            for (var idx in orderDetailAttribs) {
                var item = orderDetailAttribs[idx];
                if (!orderGroups[item.DietFrequencyId]) {
                    orderGroups[item.DietFrequencyId] = [];
                }
                if (!firstGroupKey) {
                    firstGroupKey = item.DietFrequencyId;
                }
                orderGroups[item.DietFrequencyId].push(item);
            }
            var groupLength = Object.keys(orderGroups).length;
            //console.log('order groups length');
            //console.log(groupLength);
            let orderBO = BoFactory.GetBo(bo.PatientDietOrderBo, this.Request);
            if (groupLength > 1) {
                delete orderGroups[firstGroupKey];
                var result = await orderBO.PlaceOrder(patientDietOrderId, orderGroups, firstGroupKey);
                return result;
            } else {
                var result1 = await orderBO.UpdateDietFrequency(patientDietOrderId, firstGroupKey);
                return result1;
            }
        }
        return true;
    }


    public async GetPatientDietOrderDetails(apiReq?: ApiRequest<PatientDietOrderDetailFilters>):
        Promise<ApiResponse<PatientDietOrderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientOrderWhere: WhereOptions<any> = {};
        let isReqPatientOrderSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('DietFrequency'));
        include.push({ model: this.Models.DietItemMaster, attributes: ['DietName'], required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push(this.GetReference('DietItemType'));
        include.push(this.GetReference('DietCategory'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PatientDietOrderDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PatientDietOrderDetailFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case PatientDietOrderDetailFilters.PatientDietOrderId:
                    where['PatientDietOrderId'] = param.Value;
                    break;
                case PatientDietOrderDetailFilters.PatientDietOrders:
                    where['PatientDietOrderId'] = { '$in': [param.Value] };
                    break;
                case PatientDietOrderDetailFilters.Ids:
                    where['Id'] = { '$in': param.Value };
                    break;
                case PatientDietOrderDetailFilters.IncludeServiceItem:
                    let info = param.Value;
                    include.push({
                        model: this.Models.ServiceItem,
                        attributes: ['Id', 'Name', 'ItemCode', 'CategoryId'],
                        required: false,
                        where: { 'MasterTypeId': 3 }, //DietItemMaster
                        include: [{
                            model: this.Models.ServiceItemTariffDetail,
                            attributes: ['Rate', 'DoctorShare'],
                            required: false,
                            where: { 'ServiceRateCategoryId': info.ServiceRateCategoryId }
                        }]
                    });
                    break;
                case PatientDietOrderDetailFilters.IsDirectBill:
                    where['IsDirectBill'] = param.Value;
                    break;
                case PatientDietOrderDetailFilters.FromDate:
                    where['RequestDate'] = where['RequestDate'] || {};
                    (where['RequestDate'] as any)['$gte'] = param.Value;
                    break;
                case PatientDietOrderDetailFilters.ToDate:
                    where['RequestDate'] = where['RequestDate'] || {};
                    (where['RequestDate'] as any)['$lte'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        include.push({
            model: this.Models.PatientDietOrder,
            include: [
                { model: this.Models.WardMaster, attributes: ['WardName'], required: false },
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                    include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                    include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
                },
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
                    include: [this.GetReference('Title')]
                }
            ],
            where: patientOrderWhere, required: isReqPatientOrderSearch,
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDietOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintMonthlySalesandRevenueDetails(apiReq?: ApiRequest<PatientDietOrderDetailFilters>): Promise<any> {
        let data = await this.GetPatientDietOrderDetails(apiReq);
        let PatientDietOrder = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        // let PatientDietOrderData = data.Data[0];
        // let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDietOrderData.FacilityId);
        let info = {
            PatientDietOrder: PatientDietOrder,
            // Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,

        };
        let pdfOption: any = null;
        let key = 'monthlysalesandrevenuedetails';
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
    public GetModel(): SStatic.Model<PatientDietOrderDetailInstance, PatientDietOrderDetailAttributes> {
        return this.Models.PatientDietOrderDetail;
    }

}
