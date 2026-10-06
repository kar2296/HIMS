import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        VirtualCategory: SequelizeStatic.Model<i.VirtualCategoryInstance, i.VirtualCategoryAttributes>;
        VirtualSubCategory: SequelizeStatic.Model<i.VirtualSubCategoryInstance, i.VirtualSubCategoryAttributes>;
        VirtualOrder: SequelizeStatic.Model<i.VirtualOrderInstance, i.VirtualOrderAttributes>;
        VirtualOrderDetail: SequelizeStatic.Model<i.VirtualOrderDetailInstance, i.VirtualOrderDetailAttributes>;
        VirtualBill: SequelizeStatic.Model<i.VirtualBillInstance, i.VirtualBillAttributes>;
        VirtualBillDetail: SequelizeStatic.Model<i.VirtualBillDetailInstance, i.VirtualBillDetailAttributes>;
        VirtualConference: SequelizeStatic.Model<i.VirtualConferenceInstance, i.VirtualConferenceAttributes>;
        VirtualConferenceSession: SequelizeStatic.Model<i.VirtualConferenceSessionInstance, i.VirtualConferenceSessionAttributes>;
        VirtualConferenceParticipant: SequelizeStatic.Model<i.VirtualConferenceParticipantInstance,
        i.VirtualConferenceParticipantAttributes>;
        VirtualConferenceSessionUser: SequelizeStatic.Model<i.VirtualConferenceSessionUserInstance,
        i.VirtualConferenceSessionUserAttributes>;
        VirtualPayment: SequelizeStatic.Model<i.VirtualPaymentInstance,
        i.VirtualPaymentAttributes>;
        SuccessStory: SequelizeStatic.Model<i.SuccessStoryInstance,
        i.SuccessStoryAttributes>;
        BannerContent: SequelizeStatic.Model<i.BannerContentInstance,
        i.BannerContentAttributes>;
        VirtualMedicineOrder: SequelizeStatic.Model<i.VirtualMedicineOrderInstance, i.VirtualMedicineOrderAttributes>;
        VirtualMedicineOrderDetail: SequelizeStatic.Model<i.VirtualMedicineOrderDetailInstance, i.VirtualMedicineOrderDetailAttributes>;
    }
}
