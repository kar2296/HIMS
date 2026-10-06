import { BaseService, BoFactory } from '../../Base/Index';
import { UserBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import {
    UserAttributes, UserDepartmentMapAttributes,
    UserFacilityMapAttributes, UserSpecialityMapAttributes
    // Remove UserCategoryMapAttributes for now
} from '../Model/Interface/Index';
import { UserFilters } from '../Common/Filters.e';

export class UserService extends BaseService {
    private UserBo: UserBo;
    constructor(req?: Request) {
        super(req);
        this.UserBo = BoFactory.GetBo(UserBo, this.Request);
    }

    public async AddUser(req: BaseRequest): Promise<number> {
        return await this.UserBo.AddUser(req);
    }

    public async UpdateUser(req: BaseRequest): Promise<boolean> {
        return await this.UserBo.UpdateUser(req);
    }

    public async UpdateSelfUser(req: BaseRequest): Promise<boolean> {
        return await this.UserBo.UpdateSelfUser(req);
    }

    public async ChangePassword(req: BaseRequest): Promise<boolean> {
        return await this.UserBo.ChangePassword(req);
    }

    public async ChangeSecurityPin(req: BaseRequest): Promise<boolean> {
        return await this.UserBo.ChangeSecurityPin(req);
    }

    public async SendUserNameSms(req: BaseRequest): Promise<UserAttributes> {
        return await this.UserBo.SendUserNameSms(req);
    }

    public async GetUserProfilePic(req: BaseRequest): Promise<UserAttributes> {
        return await this.UserBo.GetUserProfilePic(req);
    }

    public async GetUserSignPic(req: BaseRequest): Promise<UserAttributes> {
        return await this.UserBo.GetUserSignPic(req);
    }

    public async GetUserById(req: BaseRequest): Promise<UserAttributes> {
        return await this.UserBo.GetUserById(req);
    }

    public async GetViewDetails(req: BaseRequest): Promise<any> {
        return await this.UserBo.GetViewDetails(req);
    }

    public async GetEmergencyUsers(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
        return await this.UserBo.GetEmergencyUsers(apiReq);
    }

    public async GetUsers(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
        return await this.UserBo.GetUsers(apiReq);
    }

    public async GetUsersNoAuth(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
        // return await this.UserBo.GetUsersWithoutAuth(apiReq);
        return await this.UserBo.GetUsers(apiReq);
    }

    public async GetUserswithAppointments(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
        return await this.UserBo.GetUserswithAppointments(apiReq);
    }

    public async GetMinUsers(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
        return await this.UserBo.GetMinUsers(apiReq);
    }

    public async DeleteUser(req: BaseRequest): Promise<Boolean> {
        return await this.UserBo.DeleteUser(req);
    }

    public async MapDepartments(req: BaseRequest): Promise<Boolean> {
        return await this.UserBo.MapDeparments(req);
    }

    public async GetDepartments(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<UserDepartmentMapAttributes>> {
        return await this.UserBo.GetDepartments(apiReq) as UserDepartmentMapAttributes[];
    }

    public async MapFacilities(req: BaseRequest): Promise<Boolean> {
        return await this.UserBo.MapFacilities(req);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<UserFacilityMapAttributes>> {
        return await this.UserBo.GetFacilities(apiReq) as UserFacilityMapAttributes[];
    }

    public async MapCategory(req: BaseRequest): Promise<Boolean> {
        return await this.UserBo.MapCategory(req);
    }

    public async GetCategory(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<any>> {
        // Changed return type to 'any' temporarily until UserCategoryMapAttributes is properly created
        return await this.UserBo.GetCategory(apiReq);
    }

    public async MapSpecialities(req: BaseRequest): Promise<Boolean> {
        return await this.UserBo.MapSpecialities(req);
    }

    public async GetSpecialities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<UserSpecialityMapAttributes>> {
        return await this.UserBo.GetSpecialities(apiReq) as UserSpecialityMapAttributes[];
    }

    public async setUserCurrentFacility(req: BaseRequest): Promise<Boolean> {
        return await this.UserBo.setUserCurrentFacility(req);
    }
    public async PrintUserMasterReport(apiReq?: ApiRequest<UserFilters>): Promise<any> {
        return await this.UserBo.PrintUserMasterReport(apiReq);
    }
    public async PrintDoctorListReport(apiReq?: ApiRequest<UserFilters>): Promise<any> {
        return await this.UserBo.PrintDoctorListReport(apiReq);
    }
    public async ChangePasswordWithoutSession(req: BaseRequest): Promise<boolean> {
        return await this.UserBo.ChangePasswordNoSession(req);
    }

    public async getUserAndSendSwosthaId(req: BaseRequest): Promise<boolean> {
        return await this.UserBo.getUserAndSendSms(req);
    }

    public async getUserAndSendSms(req: BaseRequest): Promise<boolean> {
        return await this.UserBo.getUserAndSendSms(req);
    }
    public async AddUserDoctorMasterExcel(req: BaseRequest): Promise<number> {
        return await this.UserBo.AddUserDoctorMasterExcel(req);
    }
}
