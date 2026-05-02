import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Template } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { OtpVerifyInstance, OtpVerifyAttributes } from '../Model/Interface/Index';
import { OtpVerifyFilters, UserFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
export class OtpVerifyBo extends BaseBo<OtpVerifyInstance, OtpVerifyAttributes>  {
    public async AddOtpVerify(req: BaseRequest): Promise<any> {
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result: any;
        // let userReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 50, PageNumber: 1 },
        //     Params: [
        //         { Key: UserFilters.Mobile, Value: req.Data.Mobile }]
        // };
        // let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        // let Userdata = await userBO.GetUsers(userReq);

        // if (Userdata.Data.length === 0) {
        let digits = req.Data.Mobile;
        let OTP = '';
        for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        console.log('otp is', OTP);
        console.log(req.Data);
        req.Data.Otp = OTP;
        result = await this.Save(req.Data);
        if (result) {
            let smsProvider = this.GetSmsProvider();
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('Otp', 'OtpVerification', 1);

            if (smsTemplateInfo) {
                let smsmodel = {
                    numbers: [req.Data.Mobile],
                    message: Template.Compile(smsTemplateInfo.TemplateContent,
                        {
                            facName: req.Data.FacilityName,
                            otp: OTP,
                        })
                };
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' +
                        req.Data.Mobile);
                }
            }
        }

        // } else if (Userdata.Data.length > 0) {
        //     throw { code: 'ALREADYEXIST' };
        // }
        return result;
    }

    public async AddOtpVerifyWithoutSession(req: BaseRequest): Promise<any> {
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result: any;
        let digits = req.Data.Mobile;
        let OTP = '';
        for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        console.log('otp is', OTP);
        req.Data.Otp = OTP;
        result = await this.SaveWithOutSession(req.Data);
        if (result) {
            let smsProvider = this.GetSmsProvider();
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('Otp', 'OtpVerification', 1);

            if (smsTemplateInfo) {
                let smsmodel = {
                    numbers: [req.Data.Mobile],
                    message: Template.Compile(smsTemplateInfo.TemplateContent,
                        { otp: OTP, })
                };
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBoundWithoutSession(SMSStatus, smsmodel.message + ' To : ' +
                        req.Data.Mobile);
                }
            }
        }
        return result;
    }

    public async AddProviderOtpVerify(req: BaseRequest): Promise<any> {
        let result: any;
        let digits = req.Data.Mobile;
        let OTP = '';
        for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        console.log('otp is', OTP);
        req.Data.Otp = OTP;
        result = await this.Save(req.Data);
        if (result) {
            let smsProvider = this.GetSmsProvider();
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('Otp', 'OtpVerification', 1);

            if (smsTemplateInfo) {
                let smsmodel = {
                    numbers: [req.Data.Mobile],
                    message: Template.Compile(smsTemplateInfo.TemplateContent,
                        { otp: OTP, })
                };
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' +
                        req.Data.Mobile);
                }
            }
        }
        return result;
    }

    public async UpdateProviderOtpVerify(req: BaseRequest): Promise<any> {
        if (req.Data.Otp === req.Data.Inputotp) {
            req.Data.IsOtpVerified = true;
            if (req.Data.UserId) {
                // let userId = req.Data.UserId;
                // let userIdentifier: any = null;
                // let seqidentifier = SequenceKeys.UserId;
                // userIdentifier = this.getSequenceIdentifier(seqidentifier);
                let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
                let Userdata = await userBO.GetUserById({ Id: req.Data.UserId });
                // this.deferSequenceKey(userId, 'UserName', userIdentifier);
                let UserUpdate: any = {
                    Data: {
                        Id: Userdata.Id,
                        IsOtpVerified: true,
                        FirstName: Userdata.FirstName,
                        LastName: Userdata.LastName,
                        TitleId: Userdata.TitleId,
                        Mobile: Userdata.Mobile,
                    }
                };
                await userBO.UpdateOtp(UserUpdate);
            }
        } else if (req.Data.Otp !== req.Data.Inputotp) {
            req.Data.returnErrorMsg = 'Entered OTP is incorrect';
        }
        this.HandleActiveState(req.Data);
        await this.Update(req.Data);
        return req.Data;
    }

    public async UpdateOtpVerifyWithoutSession(req: BaseRequest): Promise<any> {
        if (req.Data.Otp === req.Data.Inputotp) {
            req.Data.IsOtpVerified = true;
        } else if (req.Data.Otp !== req.Data.Inputotp) {
            req.Data.returnErrorMsg = 'Entered OTP is incorrect';
        }
        this.HandleActiveState(req.Data);
        await this.UpdatewithoutSession(req.Data);
        return req.Data;
    }

    public async UpdateOtpVerify(req: BaseRequest): Promise<any> {
        if (req.Data.Otp === req.Data.Inputotp) {
            req.Data.IsOtpVerified = true;
        } else if (req.Data.Otp !== req.Data.Inputotp) {
            req.Data.returnErrorMsg = 'Entered OTP is incorrect';
        }
        this.HandleActiveState(req.Data);
        await this.Update(req.Data);
        return req.Data;
    }

    public async SendForgotOtpVerify(req: BaseRequest): Promise<any> {
        let digits = req.Data.Mobile;
        let username = req.Data.User;
        let OTP = '';
        for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        console.log('otp is', OTP);
        req.Data.ForgotOtp = OTP;
        let result = await this.Update(req.Data);
        if (result) {
            let smsProvider = this.GetSmsProvider();
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('ForgotPwd', 'ChangePwd', 1);

            if (smsTemplateInfo) {
                let smsmodel = {
                    numbers: [req.Data.Mobile],
                    message: Template.Compile(smsTemplateInfo.TemplateContent,
                        {
                            otp: OTP,
                            userName: username,
                        })
                };
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' +
                        req.Data.Mobile);
                }
            }
        }
        return req.Data;
    }

    public async SendForgotOtpVerifyWithoutSession(req: BaseRequest): Promise<any> {
        const user = BoFactory.GetBo(userbo.UserBo);
        if (req.Data.Mobile) {
            let digits = req.Data.Mobile;
            //let username = req.Data.User;
            let OTP = '';
            for (let i = 0; i < 4; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            console.log('otp is', OTP);


            // const whereQuery: any = {
            //     Mobile: req.Data.Mobile,
            // };
            // const result1: any = await user.Find({
            //     where: whereQuery,
            //     attributes: ['Id', 'UserName']
            // });

            // set old records to false
            const whereQuery: any = {
                Mobile: req.Data.Mobile,
                IsForgotOtpVerified: false
            };
            const updateResult: any = await this.FindAll({
                where: whereQuery,
            });

            // old otp expiry
            for (let i = 0; i < updateResult.length; i++) {
                const updateData: any = {
                    Id: updateResult[i].Id,
                    IsOtpVerified: true
                };
                await this.UpdatewithoutSession(updateData);
            }

            let userReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    //{ Key: UserFilters.Facility, Value: req.Data.FacilityId },
                    { Key: UserFilters.Mobile, Value: req.Data.Mobile },
                    { Key: UserFilters.UserName, Value: req.Data.UserName },
                ]
            };
            let userList = await user.GetUsers(userReq);
            console.log('********');
            console.log(userList.Data);
            if (userList.Data.length === 0) {
                req.Data.returnErrorMsg = 'Entered Mobile No is Invalid';
                return req.Data;
            } else {
                req.Data.IsForgotOtpVerified = false;
                req.Data.ForgotOtp = OTP;
                let result = await this.SaveWithOutSession(req.Data);
                req.Data.User = userList.Data[0];
                req.Data.Id = result.dataValues.Id;
                if (result) {
                    let smsProvider = this.GetSmsProvider();
                    let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                    let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('ForgotPwd', 'ChangePwd', 1);

                    if (smsTemplateInfo) {
                        let smsmodel = {
                            numbers: [req.Data.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    otp: OTP,
                                    userName: req.Data.User.UserName,
                                })
                        };
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBoundWithoutSession(SMSStatus, smsmodel.message + ' To : ' +
                                req.Data.Mobile);
                        }


                    }
                }
                return req.Data;
            }
        }
    }

    public async UpdateForgotOtpVerify(req: BaseRequest): Promise<any> {
        if (req.Data.ForgotOtp === req.Data.Inputotp) {
            req.Data.IsForgotOtpVerified = true;
        } else if (req.Data.ForgotOtp !== req.Data.Inputotp) {
            req.Data.returnErrorMsg = 'Entered OTP is incorrect';
        }
        this.HandleActiveState(req.Data);
        await this.UpdatewithoutSession(req.Data);
        return req.Data;
    }

    public async GetOtpVerifyById(req: BaseRequest): Promise<OtpVerifyAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOtpVerifys(apiReq?: ApiRequest<OtpVerifyFilters>): Promise<ApiResponse<OtpVerifyAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OtpVerifyFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OtpVerifyFilters.Mobile:
                        where['Mobile'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteOtpVerify(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OtpVerifyInstance, OtpVerifyAttributes> {
        return this.Models.OtpVerify;
    }

    private async IsAlreadyExist(req: any): Promise<number> {
        let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        if (!req.Data['OverrideDuplicate'] || req.Data['OverrideDuplicate'] === 'false') {
            let duplicate = await userBO.FindAll({
                where: {
                    'Mobile': req.Data['Mobile']
                }
            });
            if (duplicate && duplicate.length > 0) {
                return (duplicate.length * -1);
            }
        }
        return 1;
    }
}
