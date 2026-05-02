import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientOrderInstance, i.PatientOrderAttributes> {
    let PatientOrder = sequelize.define<i.PatientOrderInstance, i.PatientOrderAttributes>('PatientOrder', {
        Id: { type: DataTypes.BIGINT, field: 'PatientOrderId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        OrderTypeId: { type: DataTypes.BIGINT, field: 'OrderTypeId' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        ConsultationId: { type: DataTypes.INTEGER, field: 'ConsultationId' },
        OrderNumber: { type: DataTypes.STRING, field: 'OrderNumber' },
        OrderRequestDate: { type: DataTypes.DATE, field: 'OrderRequestDate' },
        OrderScheduleDate: { type: DataTypes.DATE, field: 'OrderScheduleDate' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        OrderFromId: { type: DataTypes.BIGINT, field: 'OrderFromId' },
        OrderToId: { type: DataTypes.BIGINT, field: 'OrderToId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        OrderStatusId: { type: DataTypes.INTEGER, field: 'OrderStatusId' },
        OrderCompletedDate: { type: DataTypes.DATE, field: 'OrderCompletedDate' },
        OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
        OrderTotal: { type: DataTypes.INTEGER, field: 'OrderTotal' },
        ParentDeparementId: { type: DataTypes.INTEGER, field: 'ParentDeparementId' },
        OrderToLocation: { type: DataTypes.INTEGER, field: 'OrderToLocation' },
        OrderLocationId: { type: DataTypes.INTEGER, field: 'OrderLocationId' },
        PatientMRN: { type: DataTypes.STRING, field: 'PatientMRN' },
        AccessionNumber: { type: DataTypes.STRING, field: 'AccessionNumber' },
        ExternalLabId: { type: DataTypes.INTEGER, field: 'ExternalLabId' },
        HisOrderId: { type: DataTypes.STRING, field: 'HisOrderId' },
        SourceTypeId: { type: DataTypes.INTEGER, field: 'SourceTypeId' },
        ReferredId: { type: DataTypes.INTEGER, field: 'ReferredId' },
        ReferredBy: { type: DataTypes.STRING, field: 'ReferredBy' },
        OrderNotes: { type: DataTypes.STRING, field: 'OrderNotes' },
        OrderComments: { type: DataTypes.STRING, field: 'OrderComments' },
        BillingStatusId: { type: DataTypes.INTEGER, field: 'BillingStatusId' },
        PatientBillStatusId: { type: DataTypes.INTEGER, field: 'PatientBillStatusId' },
        OrderPackageId: { type: DataTypes.INTEGER, field: 'OrderPackageId' },
        OrderPackageName: { type: DataTypes.INTEGER, field: 'OrderPackageName' },
        BillingId: { type: DataTypes.INTEGER, field: 'BillingId' },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        BillDate: { type: DataTypes.DATE, field: 'BillDate' },
        ResultEstimateDate: { type: DataTypes.DATE, field: 'ResultEstimateDate' },
        GroupId: { type: DataTypes.INTEGER, field: 'GroupId' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        Extoid: { type: DataTypes.STRING, field: 'Extoid' },
        DataTemplateId: { type: DataTypes.INTEGER, field: 'DataTemplateId' },
        InstanceIdentifier: { type: DataTypes.STRING, field: 'InstanceIdentifier' },
        BillTypeId: { type: DataTypes.INTEGER, field: 'BillTypeId' },
        PrimaryInsId: { type: DataTypes.INTEGER, field: 'PrimaryInsId' },
        SecondaryInsId: { type: DataTypes.INTEGER, field: 'SecondaryInsId' },
        ScheduledDate: { type: DataTypes.DATE, field: 'ScheduledDate' },
        OrderAuthorizedById: { type: DataTypes.BIGINT, field: 'OrderAuthorizedById' },
        OrderAuthorizeByName: { type: DataTypes.STRING, field: 'OrderAuthorizeByName' },
        OrderAuthorizedDate: { type: DataTypes.DATE, field: 'OrderAuthorizedDate' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        TestTypeId: { type: DataTypes.INTEGER, field: 'TestTypeId' },
        PatientBillId: { type: DataTypes.INTEGER, field: 'PatientBillId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        ReviewStatusId: { type: DataTypes.INTEGER, field: 'ReviewStatusId' },
        IsAdditionalVisit: { type: DataTypes.BOOLEAN, field: 'IsAdditionalVisit' },
        PatientReceiptId: { type: DataTypes.BIGINT, field: 'PatientReceiptId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        PatientMobile: { type: DataTypes.STRING, field: 'PatientMobile' },
        SurgeryIdentifier: { type: DataTypes.STRING, field: 'SurgeryIdentifier' },
        SurgeryEntryId: { type: DataTypes.BIGINT, field: 'SurgeryEntryId' },
        IsVirtualOrders: { type: DataTypes.BOOLEAN, field: 'IsVirtualOrders' },
        IsLabOrders: { type: DataTypes.BOOLEAN, field: 'IsLabOrders' },
        IsVaccineOrders: { type: DataTypes.BOOLEAN, field: 'IsVaccineOrders' },
        // ParentPatientId: { type: DataTypes.BIGINT, field: 'ParentPatientId' },
        VirtualOrderId: { type: DataTypes.BIGINT, field: 'VirtualOrderId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        Address: { type: DataTypes.STRING, field: 'Address' },
        Landmark: { type: DataTypes.STRING, field: 'Landmark' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        PaymentGatewayRefNo: { type: DataTypes.STRING, field: 'PaymentGatewayRefNo' },
        PaymentModeId: { type: DataTypes.BIGINT, field: 'PaymentModeId' },
        Amount: { type: DataTypes.BIGINT, field: 'Amount' },
        PaymentStatusId: { type: DataTypes.BIGINT, field: 'PaymentStatusId' },
        BankName: { type: DataTypes.STRING, field: 'BankName' },
        ApprovalNumber: { type: DataTypes.STRING, field: 'ApprovalNumber' },
        ResultFormatTypeId: { type: DataTypes.BIGINT, field: 'ResultFormatTypeId' },
        IsPaidFully: { type: DataTypes.BOOLEAN, field: 'IsPaidFully' },
        IsBooking: { type: DataTypes.BOOLEAN, field: 'IsBooking' },
        IsGovtApproved: { type: DataTypes.BOOLEAN, field: 'IsGovtApproved' },
        IsGovtCancelled: { type: DataTypes.BOOLEAN, field: 'IsGovtCancelled' },
        IsOxygenOrders: { type: DataTypes.BOOLEAN, field: 'IsOxygenOrders' },
        NoofDays: { type: DataTypes.INTEGER, field: 'NoofDays' },
        MinAdvance: { type: DataTypes.DECIMAL, field: 'MinAdvance' },
        CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
        RenewalId: { type: DataTypes.BIGINT, field: 'RenewalId' },
        IsRenewed: { type: DataTypes.BOOLEAN, field: 'IsRenewed' },
        IsExternalLab: { type: DataTypes.BOOLEAN, field: 'IsExternalLab' },
        LISId: { type: DataTypes.BIGINT, field: 'LISId' },
        LISResultId: { type: DataTypes.BIGINT, field: 'LISResultId' },
        ExternalOrderStatusId: { type: DataTypes.BIGINT, field: 'ExternalOrderStatusId' },
        NetPatientAmount: { type: DataTypes.DECIMAL, field: 'NetPatientAmount' },
        NetInsuranceAmount: { type: DataTypes.DECIMAL, field: 'NetInsuranceAmount' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientorders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientOrder as any).associate = function (models: Models) {
        PatientOrder.belongsTo(models.PatientPaymentDetails, { foreignKey: 'PatientReceiptId' });
        PatientOrder.belongsTo(models.User, { foreignKey: 'DoctorId' });
        PatientOrder.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientOrder.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientOrder.belongsTo(models.ReferenceValue, { as: 'OrderPriority', targetKey: 'ReferenceValueCodeId' });
        PatientOrder.belongsTo(models.Department, { foreignKey: 'OrderFromId', as: 'OrderFrom' });
        PatientOrder.belongsTo(models.Department, { foreignKey: 'OrderToId', as: 'OrderTo' });
        PatientOrder.belongsTo(models.Department, { foreignKey: 'SubDepartmentId', as: 'SubDeparement' });
        PatientOrder.belongsTo(models.OrderStatus);
        PatientOrder.belongsTo(models.Patient);
        PatientOrder.belongsTo(models.PatientBills, { foreignKey: 'BillingId', as: 'PatientBills' });
        PatientOrder.hasMany(models.PatientOrderDetail);
        PatientOrder.hasMany(models.PatientWorkorder, { foreignKey: 'Orderid' });
        PatientOrder.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        PatientOrder.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientOrder.belongsTo(models.Department, { foreignKey: 'ParentDeparementId', as: 'ParentDeparement' });
        PatientOrder.belongsTo(models.ReferenceValue,
            { as: 'TESTMASTERTYP', foreignKey: 'TestTypeId', targetKey: 'ReferenceValueCodeId' });
        PatientOrder.belongsTo(models.ReferenceValue,
            { as: 'BillType', foreignKey: 'BillTypeId', targetKey: 'ReferenceValueCodeId' });
        PatientOrder.belongsTo(models.ReferenceValue,
            { as: 'EncounterType', foreignKey: 'EncounterTypeId', targetKey: 'ReferenceValueCodeId' });
        PatientOrder.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        PatientOrder.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        PatientOrder.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        PatientOrder.hasMany(models.TokenDisplay);
        PatientOrder.belongsTo(models.VirtualOrder, { foreignKey: 'VirtualOrderId' });
    };
    return PatientOrder;
}
