import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { LocalWellCustomerOrderInstance, LocalWellCustomerOrderAttributes } from '../Model/Interface/Index';
import { LocalWellCustomerOrderFilters } from '../Common/Filters.e';
import * as request from 'request';
import * as bo from '../../Registration/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class LocalWellCustomerOrderBo extends BaseBo<LocalWellCustomerOrderInstance, LocalWellCustomerOrderAttributes> {
    public async AddLocalWellCustomerOrder(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLocalWellCustomerOrder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetLocalWellCustomerOrderById(req: BaseRequest): Promise<LocalWellCustomerOrderAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLocalWellCustomerOrders(apiReq?: ApiRequest<LocalWellCustomerOrderFilters>):
        Promise<ApiResponse<LocalWellCustomerOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LocalWellCustomerOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LocalWellCustomerOrderFilters.CustomerId:
                        where['CustomerId'] = param.Value;
                        break;
                    case LocalWellCustomerOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case LocalWellCustomerOrderFilters.CustomerOrderId:
                        where['CustomerOrderId'] = param.Value;
                        break;
                    case LocalWellCustomerOrderFilters.From:
                        where['OrderedDate'] = where['OrderedDate'] || {};
                        (where['OrderedDate'] as any)['$gte'] = param.Value;
                        break;
                    case LocalWellCustomerOrderFilters.To:
                        where['OrderedDate'] = where['OrderedDate'] || {};
                        (where['OrderedDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLocalWellCustomerOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async CreateLocalWellCustomer(req: any, PatientId: number): Promise<any> {
        try {
            const apiUrl = process.env.LOCALWELL_BASE_URL + 'v1/customer/create_customer';
            // map GenderId → gender string
            let gender = '';
            switch (req.Data.GenderId) {
                case 1: gender = 'Male'; break;
                case 2: gender = 'Female'; break;
                case 3: gender = 'Transgender'; break;
                default: gender = '';
            }

            const payload = {
                customer_name: (req.Data.FirstName + ' ' + (req.Data.LastName || '')).trim(),
                customer_mobile_number: req.Data.Mobile,
                customer_reference_no: PatientId,
                customer_is_business: false,
                customer_gstin: req.Data.GSTIN || '',
                is_composition_dealer: false,
                customer_dob: req.Data.DOB,
                customer_gender: gender,
                customer_address: req.Data.AddressLine1 || '',
                pincode: req.Data.Pincode || ''
            };

            const headers = {
                'Authorization': 'Bearer ' + process.env.LOCALWELL_TOKEN,
                'Content-Type': 'application/json',
                'x-pharmacy-id': process.env.LOCALWELL_PHARMACY_ID
            };

            await new Promise<void>((resolve, reject) => {
                request.post(
                    {
                        url: apiUrl,
                        headers: headers,
                        body: JSON.stringify(payload)
                    },
                    async (error, response, body) => {
                        if (error) {
                            console.error('LocalWell API error:', error);
                            return reject(error);
                        }

                        try {
                            const parsed = JSON.parse(body);

                            if (response.statusCode === 200 && parsed.data && parsed.data.customer_id) {
                                console.log('LocalWell API success:', parsed);
                                let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
                                let data: any = {
                                    Id: PatientId,
                                    CustomerId: parsed.data.customer_id
                                };
                                await patientBo.Update(data);
                                resolve();
                            } else {
                                console.error('LocalWell API failed:', response.statusCode, body);
                                reject(new Error(body));
                            }
                        } catch (parseErr) {
                            console.error('Error parsing LocalWell API response:', parseErr);
                            reject(parseErr);
                        }
                    }
                );
            });

        } catch (err) {
            console.error('Error posting data to LocalWell:', err);
        }
    }

    public async SearchMedicine(req: any): Promise<any> {
        try {
            const apiUrl = process.env.LOCALWELL_BASE_URL + 'v1/medicine/search_medicine';

            const payload = {
                search_text: req.Data.MedicineName || '',
                is_in_stock: true
            };

            const headers = {
                'Authorization': 'Bearer ' + process.env.LOCALWELL_TOKEN,
                'Content-Type': 'application/json',
                'x-pharmacy-id': process.env.LOCALWELL_PHARMACY_ID
            };

            return await new Promise<any>((resolve, reject) => {
                request.post(
                    {
                        url: apiUrl,
                        headers: headers,
                        body: JSON.stringify(payload)
                    },
                    (error, response, body) => {
                        if (error) {
                            console.error('LocalWell API error:', error);
                            return reject({ status: false, error });
                        }

                        try {
                            const parsed = JSON.parse(body);
                            console.log('parsed success:', parsed);
                            if (response.statusCode === 200 && parsed.data) {
                                const medicines = parsed.data.medicines || [];
                                const finalResponse = {
                                    Data: medicines
                                };

                                console.log('Transformed SearchMedicine success:', finalResponse);
                                return resolve(finalResponse);
                            } else {
                                console.error('LocalWell SearchMedicine failed:', response.statusCode, body);
                                return reject({ status: false, error: parsed });
                            }
                        } catch (parseErr) {
                            console.error('Error parsing LocalWell SearchMedicine response:', parseErr);
                            return reject({ status: false, error: parseErr });
                        }
                    }
                );
            });
        } catch (err) {
            console.error('Unexpected error in SearchMedicine:', err);
            throw err;
        }
    }

    public async AddCustomerOrder(req: any): Promise<any> {
        try {
            const apiUrl = process.env.LOCALWELL_BASE_URL + 'v1/order/add_customer_order';

            if (!req.Data.CustomerId) {
                let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
                let patData = await patientBo.GetById(req.Data.PatientId);

                if (!patData) {
                    throw new Error('Patient not found with Id ' + req.Data.PatientId);
                }
                await this.CreateLocalWellCustomer({ Data: patData.dataValues }, req.Data.PatientId);
                patData = await patientBo.GetById(req.Data.PatientId);

                if (!patData.dataValues.CustomerId) {
                    throw new Error('Customer creation failed, no CustomerId returned');
                }

                req.Data.CustomerId = patData.dataValues.CustomerId;
            }

            const payload = {
                customer_id: req.Data.CustomerId,
                products: req.Data.Products,
                order_notes: req.Data.OrderNotes || '',
                partner_order_identifier: req.Data.PatientId
            };

            const headers = {
                'Authorization': 'Bearer ' + process.env.LOCALWELL_TOKEN,
                'Content-Type': 'application/json',
                'x-pharmacy-id': process.env.LOCALWELL_PHARMACY_ID
            };

            return await new Promise<any>((resolve, reject) => {
                request.post(
                    {
                        url: apiUrl,
                        headers: headers,
                        body: JSON.stringify(payload)
                    },
                    async (error, response, body) => {
                        if (error) {
                            console.error('LocalWell AddCustomerOrder API error:', error);
                            return reject({ status: false, error });
                        }

                        try {
                            const parsed = JSON.parse(body);

                            if (response.statusCode === 200 && parsed.data) {
                                console.log('LocalWell AddCustomerOrder success:', parsed);
                                const saveObj = {
                                    PatientId: req.Data.PatientId,
                                    CustomerId: req.Data.CustomerId,
                                    CustomerOrderId: parsed.data.customer_order_id,
                                    OrderedDate: new Date()
                                };
                                try {
                                    await this.Save(saveObj);
                                } catch (saveErr) {
                                    console.error('Error while saving:', saveErr);
                                }
                                return resolve({ status: true, data: parsed.data });
                            } else {
                                console.error('LocalWell AddCustomerOrder failed:', response.statusCode, body);
                                return reject({ status: false, error: parsed });
                            }
                        } catch (parseErr) {
                            console.error('Error parsing LocalWell AddCustomerOrder response:', parseErr);
                            return reject({ status: false, error: parseErr });
                        }
                    }
                );
            });
        } catch (err) {
            console.error('Unexpected error in AddCustomerOrder:', err);
            throw err;
        }
    }

    public async GetOrderStatus(req: any): Promise<any> {
        try {
            const apiUrl = process.env.LOCALWELL_BASE_URL + 'v1/order/get_order_status';

            const payload = {
                customer_order_id: req.Data.CustomerOrderId
            };

            const headers = {
                'Authorization': 'Bearer ' + process.env.LOCALWELL_TOKEN,
                'Content-Type': 'application/json',
                'x-pharmacy-id': process.env.LOCALWELL_PHARMACY_ID
            };

            return await new Promise<any>((resolve, reject) => {
                request.post(
                    {
                        url: apiUrl,
                        headers: headers,
                        body: JSON.stringify(payload)
                    },
                    (error, response, body) => {
                        if (error) {
                            console.error('LocalWell GetOrderStatus API error:', error);
                            return reject({ status: false, error });
                        }

                        try {
                            const parsed = JSON.parse(body);

                            if (response.statusCode === 200 && parsed.data) {
                                console.log('LocalWell GetOrderStatus success:', parsed);
                                return resolve({ status: true, data: parsed.data });
                            } else {
                                console.error('LocalWell GetOrderStatus failed:', response.statusCode, body);
                                return reject({ status: false, error: parsed });
                            }
                        } catch (parseErr) {
                            console.error('Error parsing LocalWell GetOrderStatus response:', parseErr);
                            return reject({ status: false, error: parseErr });
                        }
                    }
                );
            });
        } catch (err) {
            console.error('Unexpected error in GetOrderStatus:', err);
            throw err;
        }
    }

    public GetModel(): SStatic.Model<LocalWellCustomerOrderInstance, LocalWellCustomerOrderAttributes> {
        return this.Models.LocalWellCustomerOrder;
    }

}
