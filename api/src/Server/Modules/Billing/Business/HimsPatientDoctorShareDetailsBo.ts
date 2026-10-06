import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDoctorShareDetailsInstance, PatientDoctorShareDetailsAttributes } from '../Model/Interface/Index';
import { PatientDoctorShareDetailsFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
import * as _ from 'lodash';

export class PatientDoctorShareDetailsBo extends BaseBo<PatientDoctorShareDetailsInstance, PatientDoctorShareDetailsAttributes>  {
    public async AddPatientDoctorShareDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }


    public async ManagePatientDoctorShareDetails(billId: number, billdetailId: number,
        details: any[]): Promise<any> {
        details = details || [];
        console.log(details);
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }
    public async ManagePatientDoctorShareDetailsUpdate(req: BaseRequest): Promise<boolean> {
        let list: PatientDoctorShareDetailsAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async UpdatePatientShareInfoDetails(req: BaseRequest): Promise<boolean> {
        let details: PatientDoctorShareDetailsAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async UpdatePatientDoctorShareDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDoctorShareDetailsById(req: BaseRequest): Promise<PatientDoctorShareDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDoctorShareDetails(apiReq?: ApiRequest<PatientDoctorShareDetailsFilters>):
        Promise<ApiResponse<PatientDoctorShareDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientBillWhere: WhereOptions<any> = {};
        let parentBillWhere: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientBillSearch: boolean = false;
        let isMRNSearch: boolean = false;
        let BillDetailsWhere: WhereOptions<any> = {};
        let isReqBillDetailSearch: boolean = false;
        let EncounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DrShareType'));
        include.push(this.GetReference('Team'));
        include.push({
            model: this.Models.User, required: false,
            include: [
                this.GetReference('Title'),
                this.GetReference('Team'),
                { model: this.Models.GstMaster, attributes: ['GstCode', 'GstName', 'GstPercentage'], required: false },
                { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDoctorShareDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.FromCreDate:
                        where['UpdatedAt'] = where['UpdatedAt'] || {};
                        (where['UpdatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.ToCreDate:
                        where['UpdatedAt'] = where['UpdatedAt'] || {};
                        (where['UpdatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientDoctorShareDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.MRN:
                        patientWhere['MRN'] = param.Value;
                        isMRNSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.EncounterType:
                        where['EncounterTypeId'] = param.Value;
                        (patientBillWhere as any)['EncounterTypeId'] = param.Value;
                        isReqPatientBillSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.BillNumber:
                        (patientBillWhere as any)['$or'] = [{ 'BillNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientBillSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.ParentBillNumber:
                        (parentBillWhere as any)['$or'] = [{ 'BillNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        // isReqParentBillSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.IsFinalBill:
                        where['ParentBillId'] = where['ParentBillId'] || {};
                        (where['ParentBillId'] as any)['$gt'] = 0;
                        break;
                    case PatientDoctorShareDetailsFilters.ServiceCategoryId:
                        BillDetailsWhere['ServiceCategoryId'] = param.Value;
                        isReqBillDetailSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.NotinServiceCategoryId:
                        BillDetailsWhere['ServiceCategoryId'] = { '$ne': param.Value };
                        isReqBillDetailSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.AdmissionStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            EncounterWhere['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        isReqEncounterSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.PatientBillDetailId:
                        where['PatientBillDetailId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.DoctorShareStatusId:
                        where['DoctorShareStatusId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.DoctorShareStatusIPId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DoctorShareStatusIPId'] = { '$in': paramArr };
                        }
                        // where['DoctorShareStatusIPId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.ServiceItemId:
                        where['ServiceItemId'] = param.Value;
                        break;
                    case PatientDoctorShareDetailsFilters.PatientBillStatusId:
                        patientBillWhere['PatientBillStatusId'] = param.Value;
                        isReqPatientBillSearch = true;
                        break;
                    case PatientDoctorShareDetailsFilters.BillTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            patientBillWhere['BillTypeId'] = { '$in': paramArr };
                        }
                        isReqPatientBillSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientBills,
            as: 'ParentBill',
            where: parentBillWhere,
            attributes: ['Id', 'BillNumber', 'BillTypeId'],
            // required: isReqParentBillSearch
        });
        include.push({
            model: this.Models.PatientBills,
            required: isReqPatientBillSearch,
            where: patientBillWhere,
            include: [this.GetReference('Gender'), this.GetReference('EncounterType'),
            {
                model: this.Models.Patient,
                attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'
                    , 'AddressLine1', 'AddressLine2', 'City', 'mobile', 'Email'],
                required: isMRNSearch,
                where: patientWhere,
                include: [this.GetReference('Title'), this.GetReference('Gender')]
            },

            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName','UserName'], as: 'CreatedUser', required: false,
                include: [
                    this.GetReference('Title')
                ]
            }]
        });
        include.push({
            model: this.Models.PatientBillDetails,
            required: isReqBillDetailSearch,
            where: BillDetailsWhere,
            include: [
                { model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false }
            ]
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate',
                'DischargeDate', 'EncounterId', 'IsBillCompleted', 'GuarantorId', 'AdmissionStatusId'],
            required: isReqEncounterSearch,
            where: EncounterWhere,
            include: [
                { model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async PrintDoctorShareDetailReport(apiReq?: ApiRequest<PatientDoctorShareDetailsFilters>): Promise<any> {
        let data = await this.GetPatientDoctorShareDetails(apiReq);
        let PatientDoctorShare = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncounterType = apiReq.Data.EncounterType;
        let DepartmentName = apiReq.Data.DepartmentName;
        let PatientDoctorShareData = data.Data[0];
        let TotalBillAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDoctorShareAmt: number = 0;
        let TotalTdsAmt: number = 0;
        let TotalNetDrAmt: number = 0;
        let item: any = {};
        for (let idx in PatientDoctorShare) {
            item = PatientDoctorShare[idx];
            if (item.User.GstMaster) {
                item.TdsPercentage = item.User.GstMaster.GstPercentage;
            }
            if (item.TdsPercentage) {
                item.TdsAmount = item.DoctorShareAmount * (item.TdsPercentage / 100);
            }
            if (item.TdsAmount) {
                item.NetDrAmount = item.DoctorShareAmount - item.TdsAmount;
            } else {
                item.NetDrAmount = item.DoctorShareAmount;
            }
            TotalBillAmount += item.PatientBillDetail.GrossAmount;
            TotalDisAmount += item.PatientBillDetail.DiscountAmount;
            TotalNetAmount += item.ServiceAmount;
            TotalDoctorShareAmt += item.DoctorShareAmount;
            TotalTdsAmt += item.TdsAmount;
            TotalNetDrAmt += item.NetDrAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDoctorShareData.FacilityId);
        let info = {
            PatientDoctorShare: PatientDoctorShare,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalBillAmount: TotalBillAmount,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDoctorShareAmt: TotalDoctorShareAmt,
            TotalTdsAmt: TotalTdsAmt,
            DoctorName: DoctorName,
            EncounterType: EncounterType,
            DepartmentName: DepartmentName,
            TotalNetDrAmt: TotalNetDrAmt

        };
        let pdfOption: any = null;
        let key = 'doctorsharereferperformdetailsreport';
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

    public async PrintDoctorShareSummaryReport(req: BaseRequest): Promise<any> {
        // let data = await this.GetPatientDoctorShareDetails(apiReq);
        // let PatientDoctorShare = data.Data;
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let DoctorName = req.Data.DoctorName;
        let FacilityId = req.Data.FacilityId;
        let DrShareSummary: any = [];
        let OPDrProceShareDetails: any = [];
        let IPDrProceShareDetails: any = [];
        let OPDrConsShareDetails: any = [];
        let summReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDoctorShareDetailsFilters.FromDate, Value: req.Data.FromDate },
            { Key: PatientDoctorShareDetailsFilters.ToDate, Value: req.Data.ToDate },
            { Key: PatientDoctorShareDetailsFilters.DoctorId, Value: req.Data.DoctorId },
                // { Key: PatientDoctorShareDetailsFilters.EncounterType, Value: 1 },
                // { Key: PatientDoctorShareDetailsFilters.ServiceCategoryId, Value: [4, 11] },
            ]
        };
        let DoctorShareSummary = await this.GetPatientDoctorShareDetails(summReq);
        let drsummary: any = {};
        let grpData = _.groupBy(DoctorShareSummary.Data, 'DoctorId');
        for (let idx in grpData) {
            let item = grpData[idx];
            let shareData = {
                OpdIncome: 0,
                IpdIncome: 0,
                Tds: 0,
                DrNetAmt: 0,
                BillAmount: 0,
            };
            let netamt = 0;
            for (let kdx in item) {
                drsummary = item[kdx];
                if (drsummary.PatientBill.EncounterTypeId === 1) {
                    shareData.OpdIncome += drsummary.DoctorShareAmount;
                }
                if (drsummary.PatientBill.EncounterTypeId === 2) {
                    if (drsummary.Encounter.AdmissionStatusId === 5 || drsummary.Encounter.AdmissionStatusId === 6) {
                        shareData.IpdIncome += drsummary.DoctorShareAmount;
                    }
                }
                if (drsummary.User.GstMaster) {
                    drsummary.TdsPercentage = drsummary.User.GstMaster.GstPercentage;
                }
                if (drsummary.TdsPercentage) {
                    drsummary.TdsAmount = (drsummary.DoctorShareAmount * (drsummary.TdsPercentage / 100)).toFixed(2);
                }
                shareData.BillAmount += drsummary.ServiceAmount;
                shareData.Tds += drsummary.TdsAmount;
                netamt = parseFloat(drsummary.DoctorShareAmount) - parseFloat(drsummary.TdsAmount);
                shareData.DrNetAmt += netamt;
            }
            DrShareSummary.push(shareData);
        }
        let OPDProceReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDoctorShareDetailsFilters.FromDate, Value: req.Data.FromDate },
            { Key: PatientDoctorShareDetailsFilters.ToDate, Value: req.Data.ToDate },
            { Key: PatientDoctorShareDetailsFilters.DoctorId, Value: req.Data.DoctorId },
            { Key: PatientDoctorShareDetailsFilters.EncounterType, Value: 1 },
                // { Key: PatientDoctorShareDetailsFilters.NotinServiceCategoryId, Value: 4 },
            ]
        };
        let OPDProceDoctorShareSummary = await this.GetPatientDoctorShareDetails(OPDProceReq);
        let OPDgrpData = _.groupBy(OPDProceDoctorShareSummary.Data, 'PatientBillDetail.ServiceCategoryId');
        for (let gdx in OPDgrpData) {
            let drShare = OPDgrpData[gdx];
            let opproceshareData: any = {
                ServiceCategoryName: '',
                GrpdServiceItems: []
            };
            let Servicegroup = _.groupBy(drShare, 'ServiceItemId');
            let procInfo: any = {};
            for (let dx in Servicegroup) {
                let opproceshare = Servicegroup[dx];
                let grpServicesInfo = {
                    ServiceName: '',
                    ProcTotalPatient: 0,
                    ProcOpdAmount: 0,
                    ProcDrShare: 0,
                    ProcTds: 0,
                    ProcNetAmt: 0
                };
                let netamt = 0;
                for (let ix in opproceshare) {
                    procInfo = opproceshare[ix];
                    opproceshareData.ServiceCategoryName = procInfo.PatientBillDetail.ServiceCategory.ServiceCategoryName;
                    grpServicesInfo.ServiceName = procInfo.PatientBillDetail.ServiceName;
                    grpServicesInfo.ProcTotalPatient = opproceshare.length;
                    grpServicesInfo.ProcOpdAmount += procInfo.ServiceAmount;
                    grpServicesInfo.ProcDrShare += procInfo.DoctorShareAmount;
                    if (procInfo.User.GstMaster) {
                        procInfo.TdsPercentage = procInfo.User.GstMaster.GstPercentage;
                    }
                    if (procInfo.TdsPercentage) {
                        procInfo.TdsAmount = procInfo.DoctorShareAmount * (procInfo.TdsPercentage / 100);
                    }
                    grpServicesInfo.ProcTds += procInfo.TdsAmount;
                    netamt = parseFloat(procInfo.DoctorShareAmount) - parseFloat(procInfo.TdsAmount);
                    grpServicesInfo.ProcNetAmt += netamt;
                }
                opproceshareData.GrpdServiceItems.push(grpServicesInfo);
            }
            OPDrProceShareDetails.push(opproceshareData);
        }
        let NetTotOpProcPatient = 0;
        let NetTotOPProcOpdAmount = 0;
        let NetTotOpProcDrShare = 0;
        let NetTotOpProcTds = 0;
        let NetOPProcTotal = 0;
        for (let cdx in OPDrProceShareDetails) {
            let itemProceshare = OPDrProceShareDetails[cdx];
            for (let jdx in itemProceshare.GrpdServiceItems) {
                let netselect = itemProceshare.GrpdServiceItems[jdx];
                NetTotOpProcPatient += netselect.ProcTotalPatient;
                NetTotOPProcOpdAmount += netselect.ProcOpdAmount;
                NetTotOpProcDrShare += netselect.ProcDrShare;
                NetTotOpProcTds += netselect.ProcTds;
                NetOPProcTotal += netselect.ProcNetAmt;
            }
        }

        let IPDProceReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDoctorShareDetailsFilters.FromDate, Value: req.Data.FromDate },
            { Key: PatientDoctorShareDetailsFilters.ToDate, Value: req.Data.ToDate },
            { Key: PatientDoctorShareDetailsFilters.DoctorId, Value: req.Data.DoctorId },
            { Key: PatientDoctorShareDetailsFilters.EncounterType, Value: 2 },
            { Key: PatientDoctorShareDetailsFilters.AdmissionStatusId, Value: [5, 6] },
            ]
        };
        let IPDProceDoctorShareSummary = await this.GetPatientDoctorShareDetails(IPDProceReq);
        let ipprocInfo: any = {};
        let IPDgrpData = _.groupBy(IPDProceDoctorShareSummary.Data, 'PatientBillDetail.ServiceCategoryId');
        for (let gdx in IPDgrpData) {
            let IPdrShare = IPDgrpData[gdx];
            let ipproceshareData: any = {
                ipServiceCategoryName: '',
                ipGrpdServiceItems: []
            };
            let IPServicegroup = _.groupBy(IPdrShare, 'ServiceItemId');
            for (let dx in IPServicegroup) {
                let ipproceshare = IPServicegroup[dx];
                let ipgrpServicesInfo = {
                    ipServiceName: '',
                    ipProcTotalPatient: 0,
                    ipProcIpdAmount: 0,
                    ipProcDrShare: 0,
                    ipProcTds: 0,
                    ipProcNetAmt: 0
                };
                let netamt = 0;
                for (let ix in ipproceshare) {
                    ipprocInfo = ipproceshare[ix];
                    ipproceshareData.ipServiceCategoryName = ipprocInfo.PatientBillDetail.ServiceCategory.ServiceCategoryName;
                    ipgrpServicesInfo.ipServiceName = ipprocInfo.PatientBillDetail.ServiceName;
                    ipgrpServicesInfo.ipProcTotalPatient = ipproceshare.length;
                    ipgrpServicesInfo.ipProcIpdAmount += ipprocInfo.ServiceAmount;
                    ipgrpServicesInfo.ipProcDrShare += ipprocInfo.DoctorShareAmount;
                    if (ipprocInfo.User.GstMaster) {
                        ipprocInfo.TdsPercentage = ipprocInfo.User.GstMaster.GstPercentage;
                    }
                    if (ipprocInfo.TdsPercentage) {
                        ipprocInfo.TdsAmount = ipprocInfo.DoctorShareAmount * (ipprocInfo.TdsPercentage / 100);
                    }
                    ipgrpServicesInfo.ipProcTds += ipprocInfo.TdsAmount;
                    netamt = parseFloat(ipprocInfo.DoctorShareAmount) - parseFloat(ipprocInfo.TdsAmount);
                    ipgrpServicesInfo.ipProcNetAmt += netamt;
                }
                ipproceshareData.ipGrpdServiceItems.push(ipgrpServicesInfo);
            }
            IPDrProceShareDetails.push(ipproceshareData);
        }
        let NetTotIPProcPatient = 0;
        let NetTotIPProcIpdAmount = 0;
        let NetTotIPProcDrShare = 0;
        let NetTotIPProcTds = 0;
        let NetIPProcTotal = 0;
        for (let cdx in IPDrProceShareDetails) {
            let itemipProceshare = IPDrProceShareDetails[cdx];
            for (let kdx in itemipProceshare.ipGrpdServiceItems) {
                let netipselect = itemipProceshare.ipGrpdServiceItems[kdx];
                NetTotIPProcPatient += netipselect.ipProcTotalPatient;
                NetTotIPProcIpdAmount += netipselect.ipProcIpdAmount;
                NetTotIPProcDrShare += netipselect.ipProcDrShare;
                NetTotIPProcTds += netipselect.ipProcTds;
                NetIPProcTotal += netipselect.ipProcNetAmt;
            }
        }


        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            DrShareSummary: DrShareSummary,
            OPDrProceShareDetails: OPDrProceShareDetails,
            IPDrProceShareDetails: IPDrProceShareDetails,
            OPDrConsShareDetails: OPDrConsShareDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
            NetTotOpProcPatient: NetTotOpProcPatient,
            NetTotOPProcOpdAmount: NetTotOPProcOpdAmount,
            NetTotOpProcDrShare: NetTotOpProcDrShare,
            NetTotOpProcTds: NetTotOpProcTds,
            NetOPProcTotal: NetOPProcTotal,
            NetTotIPProcPatient: NetTotIPProcPatient,
            NetTotIPProcIpdAmount: NetTotIPProcIpdAmount,
            NetTotIPProcDrShare: NetTotIPProcDrShare,
            NetTotIPProcTds: NetTotIPProcTds,
            NetIPProcTotal: NetIPProcTotal,

        };
        let pdfOption: any = null;
        let key = 'doctorsharesummaryreport';
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
    public async PrintDailyWiseDoctorShareSummaryReport(req: BaseRequest): Promise<any> {
        // let data = await this.GetPatientDoctorShareDetails(apiReq);
        // let PatientDoctorShare = data.Data;
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let DoctorName = req.Data.DoctorName;
        let ServiceCategory = req.Data.ServiceCategory;
        let FacilityId = req.Data.FacilityId;
        let DrShareSummary: any = [];
        let OPDrProceShareDetails: any = [];
        let IPDrProceShareDetails: any = [];
        let OPDrConsShareDetails: any = [];
        let summReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDoctorShareDetailsFilters.FromDate, Value: req.Data.FromDate },
            { Key: PatientDoctorShareDetailsFilters.ToDate, Value: req.Data.ToDate },
            { Key: PatientDoctorShareDetailsFilters.DoctorId, Value: req.Data.DoctorId },
            { Key: PatientDoctorShareDetailsFilters.ServiceCategoryId, Value: req.Data.ServiceCategoryId },
                // { Key: PatientDoctorShareDetailsFilters.ServiceCategoryId, Value: [4, 11] },
            ]
        };
        let DoctorShareSummary = await this.GetPatientDoctorShareDetails(summReq);
        let drsummary: any = {};
        let grpData = _.groupBy(DoctorShareSummary.Data, 'DoctorId');
        for (let idx in grpData) {
            let item = grpData[idx];
            let shareData = {
                OpdIncome: 0,
                IpdIncome: 0,
                Tds: 0,
                DrNetAmt: 0,
                BillAmount: 0,
            };
            let netamt = 0;
            for (let kdx in item) {
                drsummary = item[kdx];
                if (drsummary.PatientBill.EncounterTypeId === 1) {
                    shareData.OpdIncome += drsummary.DoctorShareAmount;
                }
                if (drsummary.PatientBill.EncounterTypeId === 2) {
                    if (drsummary.Encounter.AdmissionStatusId === 5 || drsummary.Encounter.AdmissionStatusId === 6) {
                        shareData.IpdIncome += drsummary.DoctorShareAmount;
                    }
                }
                if (drsummary.User.GstMaster) {
                    drsummary.TdsPercentage = drsummary.User.GstMaster.GstPercentage;
                }
                if (drsummary.TdsPercentage) {
                    drsummary.TdsAmount = drsummary.DoctorShareAmount * (drsummary.TdsPercentage / 100);
                }
                shareData.BillAmount += drsummary.ServiceAmount;
                shareData.Tds += drsummary.TdsAmount;
                netamt = parseFloat(drsummary.DoctorShareAmount) - parseFloat(drsummary.TdsAmount);
                shareData.DrNetAmt += netamt;
            }
            DrShareSummary.push(shareData);
        }
        let OPDConsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDoctorShareDetailsFilters.FromDate, Value: req.Data.FromDate },
            { Key: PatientDoctorShareDetailsFilters.ToDate, Value: req.Data.ToDate },
            { Key: PatientDoctorShareDetailsFilters.DoctorId, Value: req.Data.DoctorId },
            { Key: PatientDoctorShareDetailsFilters.EncounterType, Value: 1 },
            { Key: PatientDoctorShareDetailsFilters.ServiceCategoryId, Value: 4 },
            ]
        };
        let OPDConsDoctorShareSummary = await this.GetPatientDoctorShareDetails(OPDConsReq);
        let item: any = {};
        let itemgrouped = [];
        for (let idx in OPDConsDoctorShareSummary.Data) {
            item = OPDConsDoctorShareSummary.Data[idx];
            let year = new Date(item.PatientBill.BillDateTime).getFullYear();
            let month = new Date(item.PatientBill.BillDateTime).getMonth();
            let date = new Date(item.PatientBill.BillDateTime).getDate();
            item.ConsultDate = (month + 1) + '/' + date + '/' + year;
            itemgrouped.push(item);
        }
        let CongrpData = _.groupBy(itemgrouped, 'ConsultDate');
        for (var gdx in CongrpData) {
            var opconsshareData = {
                Date: '',
                TotalPatient: 0,
                OpdAmount: 0,
                DrShare: 0,
                Tds: 0,
                NetAmt: 0
            };
            var netamt = 0;
            var drShare = CongrpData[gdx];
            opconsshareData.Date = gdx;
            opconsshareData.TotalPatient = drShare.length;
            for (var dx in drShare) {
                var opconsShare = drShare[dx];
                opconsshareData.OpdAmount += opconsShare.ServiceAmount;
                opconsshareData.DrShare += opconsShare.DoctorShareAmount;
                opconsshareData.Tds += opconsShare.TdsAmount;
                netamt = parseFloat(opconsShare.DoctorShareAmount) - parseFloat(opconsShare.TdsAmount);
                opconsshareData.NetAmt += netamt;
            }
            OPDrConsShareDetails.push(opconsshareData);
        }
        let NetTotOpPatient = 0;
        let NetTotOPdAmount = 0;
        let NetTotOpDrShare = 0;
        let NetTotOpTds = 0;
        let NetOPTotal = 0;
        for (let cdx in OPDrConsShareDetails) {
            let itemshare = OPDrConsShareDetails[cdx];
            NetTotOpPatient += itemshare.TotalPatient;
            NetTotOPdAmount += itemshare.OpdAmount;
            NetTotOpDrShare += itemshare.DrShare;
            NetTotOpTds += itemshare.Tds;
            NetOPTotal += itemshare.NetAmt;
        }


        let OPDProceReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDoctorShareDetailsFilters.FromDate, Value: req.Data.FromDate },
            { Key: PatientDoctorShareDetailsFilters.ToDate, Value: req.Data.ToDate },
            { Key: PatientDoctorShareDetailsFilters.DoctorId, Value: req.Data.DoctorId },
            { Key: PatientDoctorShareDetailsFilters.EncounterType, Value: 1 },
            { Key: PatientDoctorShareDetailsFilters.ServiceCategoryId, Value: req.Data.ServiceCategoryId },
            ]
        };
        let OPDProceDoctorShareSummary = await this.GetPatientDoctorShareDetails(OPDProceReq);
        let OPDgrpData = _.groupBy(OPDProceDoctorShareSummary.Data, 'PatientBillDetail.ServiceCategoryId');
        for (let gdx in OPDgrpData) {
            let drShare = OPDgrpData[gdx];
            let opproceshareData: any = {
                ServiceCategoryName: '',
                GrpdServiceItems: []
            };
            let itemgrouped = [];
            let item: any = {};
            for (let idx in drShare) {
                item = drShare[idx];
                let year = new Date(item.PatientBill.BillDateTime).getFullYear();
                let month = new Date(item.PatientBill.BillDateTime).getMonth();
                let date = new Date(item.PatientBill.BillDateTime).getDate();
                item.ConsultDate = (month + 1) + '/' + date + '/' + year;
                itemgrouped.push(item);
            }
            let Servicegroup = _.groupBy(itemgrouped, 'ConsultDate');
            let procInfo: any = {};
            for (let dx in Servicegroup) {
                let opproceshare = Servicegroup[dx];
                let grpServicesInfo = {
                    ServiceName: '',
                    Date: '',
                    ProcTotalPatient: 0,
                    ProcOpdAmount: 0,
                    ProcDrShare: 0,
                    ProcTds: 0,
                    ProcNetAmt: 0
                };
                let netamt = 0;
                for (let ix in opproceshare) {
                    procInfo = opproceshare[ix];
                    opproceshareData.ServiceCategoryName = procInfo.PatientBillDetail.ServiceCategory.ServiceCategoryName;
                    grpServicesInfo.ServiceName = procInfo.PatientBillDetail.ServiceName;
                    grpServicesInfo.Date = procInfo.ConsultDate;
                    grpServicesInfo.ProcTotalPatient = opproceshare.length;
                    grpServicesInfo.ProcOpdAmount += procInfo.ServiceAmount;
                    grpServicesInfo.ProcDrShare += procInfo.DoctorShareAmount;
                    if (procInfo.User.GstMaster) {
                        procInfo.TdsPercentage = procInfo.User.GstMaster.GstPercentage;
                    }
                    if (procInfo.TdsPercentage) {
                        procInfo.TdsAmount = procInfo.DoctorShareAmount * (procInfo.TdsPercentage / 100);
                    }
                    grpServicesInfo.ProcTds += procInfo.TdsAmount;
                    netamt = parseFloat(procInfo.DoctorShareAmount) - parseFloat(procInfo.TdsAmount);
                    grpServicesInfo.ProcNetAmt += netamt;
                }
                opproceshareData.GrpdServiceItems.push(grpServicesInfo);
            }
            OPDrProceShareDetails.push(opproceshareData);
        }
        let NetTotOpProcPatient = 0;
        let NetTotOPProcOpdAmount = 0;
        let NetTotOpProcDrShare = 0;
        let NetTotOpProcTds = 0;
        let NetOPProcTotal = 0;
        for (let cdx in OPDrProceShareDetails) {
            let itemProceshare = OPDrProceShareDetails[cdx];
            for (let jdx in itemProceshare.GrpdServiceItems) {
                let netselect = itemProceshare.GrpdServiceItems[jdx];
                NetTotOpProcPatient += netselect.ProcTotalPatient;
                NetTotOPProcOpdAmount += netselect.ProcOpdAmount;
                NetTotOpProcDrShare += netselect.ProcDrShare;
                NetTotOpProcTds += netselect.ProcTds;
                NetOPProcTotal += netselect.ProcNetAmt;
            }
        }

        let IPDProceReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDoctorShareDetailsFilters.FromDate, Value: req.Data.FromDate },
            { Key: PatientDoctorShareDetailsFilters.ToDate, Value: req.Data.ToDate },
            { Key: PatientDoctorShareDetailsFilters.DoctorId, Value: req.Data.DoctorId },
            { Key: PatientDoctorShareDetailsFilters.EncounterType, Value: 2 },
            { Key: PatientDoctorShareDetailsFilters.AdmissionStatusId, Value: [5, 6] },
            { Key: PatientDoctorShareDetailsFilters.ServiceCategoryId, Value: req.Data.ServiceCategoryId },
            ]
        };
        let IPDProceDoctorShareSummary = await this.GetPatientDoctorShareDetails(IPDProceReq);
        let ipprocInfo: any = {};
        let IPDgrpData = _.groupBy(IPDProceDoctorShareSummary.Data, 'PatientBillDetail.ServiceCategoryId');
        for (let gdx in IPDgrpData) {
            let IPdrShare = IPDgrpData[gdx];
            let ipproceshareData: any = {
                ipServiceCategoryName: '',
                ipGrpdServiceItems: []
            };
            let itemgrouped = [];
            let item: any = {};
            for (let idx in IPdrShare) {
                item = IPdrShare[idx];
                let year = new Date(item.PatientBill.BillDateTime).getFullYear();
                let month = new Date(item.PatientBill.BillDateTime).getMonth();
                let date = new Date(item.PatientBill.BillDateTime).getDate();
                item.ConsultDate = (month + 1) + '/' + date + '/' + year;
                itemgrouped.push(item);
            }
            let IPServicegroup = _.groupBy(IPdrShare, 'ConsultDate');
            for (let dx in IPServicegroup) {
                let ipproceshare = IPServicegroup[dx];
                let ipgrpServicesInfo = {
                    ipServiceName: '',
                    ipProcTotalPatient: 0,
                    ipProcIpdAmount: 0,
                    ipProcDrShare: 0,
                    ipProcTds: 0,
                    ipProcNetAmt: 0,
                    Date: '',
                };
                let netamt = 0;
                for (let ix in ipproceshare) {
                    ipprocInfo = ipproceshare[ix];
                    ipproceshareData.ipServiceCategoryName = ipprocInfo.PatientBillDetail.ServiceCategory.ServiceCategoryName;
                    ipgrpServicesInfo.ipServiceName = ipprocInfo.PatientBillDetail.ServiceName;
                    ipgrpServicesInfo.Date = ipprocInfo.ConsultDate;
                    ipgrpServicesInfo.ipProcTotalPatient = ipproceshare.length;
                    ipgrpServicesInfo.ipProcIpdAmount += ipprocInfo.ServiceAmount;
                    ipgrpServicesInfo.ipProcDrShare += ipprocInfo.DoctorShareAmount;
                    if (ipprocInfo.User.GstMaster) {
                        ipprocInfo.TdsPercentage = ipprocInfo.User.GstMaster.GstPercentage;
                    }
                    if (ipprocInfo.TdsPercentage) {
                        ipprocInfo.TdsAmount = ipprocInfo.DoctorShareAmount * (ipprocInfo.TdsPercentage / 100);
                    }
                    ipgrpServicesInfo.ipProcTds += ipprocInfo.TdsAmount;
                    netamt = parseFloat(ipprocInfo.DoctorShareAmount) - parseFloat(ipprocInfo.TdsAmount);
                    ipgrpServicesInfo.ipProcNetAmt += netamt;
                }
                ipproceshareData.ipGrpdServiceItems.push(ipgrpServicesInfo);
            }
            IPDrProceShareDetails.push(ipproceshareData);
        }
        let NetTotIPProcPatient = 0;
        let NetTotIPProcIpdAmount = 0;
        let NetTotIPProcDrShare = 0;
        let NetTotIPProcTds = 0;
        let NetIPProcTotal = 0;
        for (let cdx in IPDrProceShareDetails) {
            let itemipProceshare = IPDrProceShareDetails[cdx];
            for (let kdx in itemipProceshare.ipGrpdServiceItems) {
                let netipselect = itemipProceshare.ipGrpdServiceItems[kdx];
                NetTotIPProcPatient += netipselect.ipProcTotalPatient;
                NetTotIPProcIpdAmount += netipselect.ipProcIpdAmount;
                NetTotIPProcDrShare += netipselect.ipProcDrShare;
                NetTotIPProcTds += netipselect.ipProcTds;
                NetIPProcTotal += netipselect.ipProcNetAmt;
            }
        }


        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            DrShareSummary: DrShareSummary,
            OPDrProceShareDetails: OPDrProceShareDetails,
            IPDrProceShareDetails: IPDrProceShareDetails,
            OPDrConsShareDetails: OPDrConsShareDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
            NetTotOpProcPatient: NetTotOpProcPatient,
            NetTotOPProcOpdAmount: NetTotOPProcOpdAmount,
            NetTotOpProcDrShare: NetTotOpProcDrShare,
            NetTotOpProcTds: NetTotOpProcTds,
            NetOPProcTotal: NetOPProcTotal,
            NetTotIPProcPatient: NetTotIPProcPatient,
            NetTotIPProcIpdAmount: NetTotIPProcIpdAmount,
            NetTotIPProcDrShare: NetTotIPProcDrShare,
            NetTotIPProcTds: NetTotIPProcTds,
            NetIPProcTotal: NetIPProcTotal,
            NetTotOpPatient: NetTotOpPatient,
            NetTotOPdAmount: NetTotOPdAmount,
            NetTotOpDrShare: NetTotOpDrShare,
            NetTotOpTds: NetTotOpTds,
            NetOPTotal: NetOPTotal,
            ServiceCategory: ServiceCategory

        };
        let pdfOption: any = null;
        let key = 'dailywisedoctorsharesummaryreport';
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

    public GetModel(): SStatic.Model<PatientDoctorShareDetailsInstance, PatientDoctorShareDetailsAttributes> {
        return this.Models.PatientDoctorShareDetails;
    }

}
