import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientFeedbackDetailsInstance, PatientFeedbackDetailsAttributes } from '../Model/Interface/Index';
import { PatientFeedbackDetailsFilters } from '../Common/Filters.e';
import * as _ from 'lodash';
import { BoFactory } from '../../Base/Business/Index';
import * as genbo from '../../GeneralMaster/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import { FeedbacksMasterFilters } from '../../GeneralMaster/Common/Filters.e';
import { join } from 'path';

export class PatientFeedbackDetailsBo extends BaseBo<PatientFeedbackDetailsInstance, PatientFeedbackDetailsAttributes>  {
    public async AddPatientFeedbackDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientFeedbackDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientFeedbackDetails(PatientFeedbackId: number, details: PatientFeedbackDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PatientFeedbackId = PatientFeedbackId;
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

    public async GetPatientFeedbackDetailsById(req: BaseRequest): Promise<PatientFeedbackDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientFeedbackDetails(apiReq?: ApiRequest<PatientFeedbackDetailsFilters>):
        Promise<ApiResponse<PatientFeedbackDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.FeedbacksMaster, attributes: ['Feedbacks', 'Description'], required: false,
        });
        include.push(this.GetReference('FeedbackCategory'));
        include.push(this.GetReference('Rating'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientFeedbackDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientFeedbackDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientFeedbackDetailsFilters.PatientFeedbackId:
                        where['PatientFeedbackId'] = param.Value;
                        break;
                    case PatientFeedbackDetailsFilters.PatientFeedbackStatusId:
                        where['PatientFeedbackStatusId'] = param.Value;
                        break;
                    case PatientFeedbackDetailsFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFeedbackDetailsFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFeedbackDetailsFilters.FeedbackTypeId:
                        where['FeedbackTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPatientFeedbackSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPFeedbackRating(req) });
        result.push({ Key: 2, Value: await this.IPFeedbackRating(req) });
        return result;
    }

    public async IPFeedbackRating(req: BaseRequest): Promise<any> {
        let RatingGroup: { [id: number]: any[] } = {};
        // let RatingJoin: any = {
        //     this.GetReference('Title')
        // };

        let ipfeedbackInstance: any = await this.FindAll({
            attributes: ['RatingId', 'FeedbackTypeId'],
            where: {
                CreatedAt: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                FeedbackTypeId: 1,
                RatingId: { '$gt': -1 },
            },
            include: [this.GetReference('Rating')]
        });
        if (ipfeedbackInstance) {
            let groupbills = _.groupBy(ipfeedbackInstance, 'RatingId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let IPCount: number = 0;
                let Rating: string = '';
                let RatingId: number = 0;
                IPCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    if (bills.Rating) {
                        Rating = bills.Rating.Description;
                    }
                    RatingId = bills.RatingId;
                    RatingGroup[RatingId] = RatingGroup[RatingId] || [];
                }
                let info = {
                    'Rating': Rating,
                    'RatingId': RatingId,
                    'IPCount': IPCount
                };
                RatingGroup[RatingId].push(info);
            }
        }

        return RatingGroup;
    }

    public async OPFeedbackRating(req: BaseRequest): Promise<any> {
        let RatingGroup: { [id: number]: any[] } = {};
        // let RatingJoin: any = {
        //     this.GetReference('Title')
        // };

        let opfeedbackInstance: any = await this.FindAll({
            attributes: ['RatingId', 'FeedbackTypeId'],
            where: {
                CreatedAt: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                FeedbackTypeId: 2,
                RatingId: { '$gt': -1 },
            },
            include: [this.GetReference('Rating')]
        });
        if (opfeedbackInstance) {
            let groupbills = _.groupBy(opfeedbackInstance, 'RatingId');
            for (let a in groupbills) {
                let groupedBills = groupbills[a];
                let OPCount: number = 0;
                let Rating: string = '';
                let RatingId: number = 0;
                OPCount = groupedBills.length;
                for (let a = 0; a < groupedBills.length; a++) {
                    let bills: any = groupedBills[a];
                    if (bills.Rating) {
                        Rating = bills.Rating.Description;
                    }
                    RatingId = bills.RatingId;
                    RatingGroup[RatingId] = RatingGroup[RatingId] || [];
                }
                let info = {
                    'Rating': Rating,
                    'RatingId': RatingId,
                    'OPCount': OPCount
                };
                RatingGroup[RatingId].push(info);
            }
        }

        return RatingGroup;
    }

    public async DeletePatientFeedbackDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);

    }
    public async fillEmptyCols(colIndexes: any, cols: any) {
        for (let cIndex = cols.length; cIndex < colIndexes.length; cIndex++) {
            cols.push({ text: '' });
        }
    }
    public async getFeedbackLabel(key: any, Feedbacklabel: any) {
        let Items: any = {
            AllFeedbackName: Feedbacklabel
        };
        let empname = Items.AllFeedbackName[key];
        return empname;
    }
    public async getRatinglabel(key: any, RatingInfo: any) {
        let Items: any = {
            AllRating: RatingInfo
        };
        let vtype = Items.AllRating[key] || key;
        return vtype;
    }
    public async constructTable(gItems: any, RatingInfo: any, Feedbacklabel: any) {
        let colIndexes = ['Feedbacks'];
        let rows = [];
        let headerrows = [];
        for (let sdKey in gItems) {
            let row: any = {
                cols: []
            };
            await this.fillEmptyCols(colIndexes, row.cols);
            row.cols[0] = {
                text: await this.getFeedbackLabel(sdKey, Feedbacklabel)
            };

            let total = 0;
            for (let osKey in gItems[sdKey]) {
                let osIndex = colIndexes.indexOf(osKey);
                let osTotal = gItems[sdKey][osKey].length;
                if (osIndex === -1) {
                    colIndexes.push(osKey);
                    osIndex = colIndexes.indexOf(osKey);
                    await this.fillEmptyCols(colIndexes, row.cols);
                }
                row.cols[osIndex] = {
                    text: osTotal
                };
                total += osTotal;
            }

            rows.push(row);
        }
        // var grandtotal = 0;
        // for (var idx in $scope.rows) {
        //     var total = $scope.rows[idx];
        //     for (var wts in total.cols)
        //         var gtTotal = total.cols[1];
        //     grandtotal += gtTotal.text;
        // }
        // $scope.total.cols[1] = { text: grandtotal }

        // let grandtotal = 0;
        // for (let idx in rows) {
        //     let total = rows[idx];
        //     for (let iddx in total.cols)
        //         let gtTotal = total.cols[1];
        //     grandtotal += gtTotal.text;
        // }
        let headerRow: any = {
            cols: []
        };

        for (let cIndex = 0; cIndex < colIndexes.length; cIndex++) {
            headerRow.cols.push({
                text: await this.getRatinglabel(colIndexes[cIndex], RatingInfo)
            });
        }
        headerrows.push(headerRow);
        //$scope.rows.splice(0,0, $scope.headerRow);
        let returnData: any = {
            rows: rows,
            headerRow: headerrows
        };

        for (let rIndex = 0; rIndex < rows.length; rIndex++) {
            await this.fillEmptyCols(colIndexes, rows[rIndex].cols);
        }
        return returnData;
    }
    public groupByMulti(collection: any, values: any, context: any): any { // BaseBo
        context = [];
        if (!values.length) {
            context.push(collection);
            return collection;
        }
        let byFirst = _.groupBy(collection, values[0]),
            rest = values.slice(1);
        for (let prop in byFirst) {
            byFirst[prop] = this.groupByMulti(byFirst[prop], rest, context);
        }
        return byFirst;
    }

    public async PrintPatientFeedbacksummaryforop(apiReq?: ApiRequest<PatientFeedbackDetailsFilters>): Promise<any> {
        let FeedbackDetails: any = [];
        let FeedbackRatingId: any = [];
        let FeedbackId: any = [];
        let Items: any = [];
        Items.AllFeedbackName = {};
        Items.AllRating = {};
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let ratingdata: any = [];
        let vReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Rating' }
            ]
        };
        let ticketBO = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
        ratingdata = await ticketBO.GetReferenceValues(vReq);

        let RatingInfo = [];
        for (var idx in ratingdata.Data) {
            FeedbackRatingId.push(ratingdata.Data[idx].Id);
            let id = ratingdata.Data[idx].ReferenceValueCodeId;
            let name = ratingdata.Data[idx].Description;
            Items.AllRating[id] = name;
            RatingInfo = Items.AllRating;
        }

        let feedbackReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: FeedbacksMasterFilters.FacilityId, Value: apiReq.Data.FacilityId },
                { Key: FeedbacksMasterFilters.FeedbackTypeId, Value: 2 },
                { Key: FeedbacksMasterFilters.ActiveStatusId, Value: 2 },
            ]
        };
        let feedbackBO = BoFactory.GetBo(genbo.FeedbacksMasterBo, this.Request);
        let feedbackData = await feedbackBO.GetFeedbacksMasters(feedbackReq);
        let Feedbacklabel = [];
        let FeedbackName: any = '';
        for (let idx in feedbackData.Data) {
            // let feedbacks = feedbackData.Data[idx];
            FeedbackId.push(feedbackData.Data[idx].Id);
            let id = feedbackData.Data[idx].Id;

            if (feedbackData.Data[idx].Feedbacks) {
                FeedbackName = feedbackData.Data[idx].Feedbacks;
            }
            var name = FeedbackName;
            Items.AllFeedbackName[id] = name;
            Feedbacklabel = Items.AllFeedbackName;
        }

        let feedbackdata = await this.GetPatientFeedbackDetails(apiReq);
        let sourceData = feedbackdata.Data;
        let groupedItems = await this.groupByMulti(sourceData, ['FeedbackMasterId', 'RatingId'], '');
        let table = await this.constructTable(groupedItems, RatingInfo, Feedbacklabel);
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            FeedbackDetails: FeedbackDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            headerRow: table.headerRow,
            rows: table.rows,
        };
        let pdfOption: any = null;
        let key = 'feedbacksummaryforopreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/hrm/accounts')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPatientFeedbacksummaryforip(apiReq?: ApiRequest<PatientFeedbackDetailsFilters>): Promise<any> {
        let FeedbackDetails: any = [];
        let FeedbackRatingId: any = [];
        let FeedbackId: any = [];
        let Items: any = [];
        Items.AllFeedbackName = {};
        Items.AllRating = {};
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let ratingdata: any = [];
        let vReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Rating' }
            ]
        };
        let ticketBO = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
        ratingdata = await ticketBO.GetReferenceValues(vReq);

        let RatingInfo = [];
        for (var idx in ratingdata.Data) {
            FeedbackRatingId.push(ratingdata.Data[idx].Id);
            let id = ratingdata.Data[idx].ReferenceValueCodeId;
            let name = ratingdata.Data[idx].Description;
            Items.AllRating[id] = name;
            RatingInfo = Items.AllRating;
        }

        let feedbackReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: FeedbacksMasterFilters.FacilityId, Value: apiReq.Data.FacilityId },
                { Key: FeedbacksMasterFilters.FeedbackTypeId, Value: 1 },
                { Key: FeedbacksMasterFilters.ActiveStatusId, Value: 2 },
            ]
        };
        let feedbackBO = BoFactory.GetBo(genbo.FeedbacksMasterBo, this.Request);
        let feedbackData = await feedbackBO.GetFeedbacksMasters(feedbackReq);
        let Feedbacklabel = [];
        let FeedbackName: any = '';
        for (let idx in feedbackData.Data) {
            // let feedbacks = feedbackData.Data[idx];
            FeedbackId.push(feedbackData.Data[idx].Id);
            let id = feedbackData.Data[idx].Id;

            if (feedbackData.Data[idx].Feedbacks) {
                FeedbackName = feedbackData.Data[idx].Feedbacks;
            }
            var name = FeedbackName;
            Items.AllFeedbackName[id] = name;
            Feedbacklabel = Items.AllFeedbackName;
        }

        let feedbackdata = await this.GetPatientFeedbackDetails(apiReq);
        let sourceData = feedbackdata.Data;
        let groupedItems = await this.groupByMulti(sourceData, ['FeedbackMasterId', 'RatingId'], '');
        let table = await this.constructTable(groupedItems, RatingInfo, Feedbacklabel);
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            FeedbackDetails: FeedbackDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            headerRow: table.headerRow,
            rows: table.rows,
        };
        let pdfOption: any = null;
        let key = 'feedbacksummaryforipreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/hrm/accounts')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public GetModel(): SStatic.Model<PatientFeedbackDetailsInstance, PatientFeedbackDetailsAttributes> {
        return this.Models.PatientFeedbackDetails;
    }

}
