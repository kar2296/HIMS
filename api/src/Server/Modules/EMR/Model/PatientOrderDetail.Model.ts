import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientOrderDetailInstance, i.PatientOrderDetailAttributes> {
    let PatientOrderDetail = sequelize.define<i.PatientOrderDetailInstance, i.PatientOrderDetailAttributes>('PatientOrderDetail', {
        Id: { type: DataTypes.BIGINT, field: 'PatientOrderDetailId', primaryKey: true, autoIncrement: true },
        PatientOrderId: { type: DataTypes.BIGINT, field: 'PatientOrderId' },
        DisplaySeqId: { type: DataTypes.INTEGER, field: 'DisplaySeqId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        GroupId: { type: DataTypes.INTEGER, field: 'GroupId' },
        RequestDate: { type: DataTypes.DATE, field: 'RequestDate' },
        SideId: { type: DataTypes.BIGINT, field: 'SideId' },
        TestMasterPositionId: { type: DataTypes.BIGINT, field: 'TestMasterPositionId' },
        TestId: { type: DataTypes.BIGINT, field: 'TestId' },
        TestCode: { type: DataTypes.STRING, field: 'TestCode' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        CategoryName: { type: DataTypes.STRING, field: 'CategoryName' },
        TestDescription: { type: DataTypes.STRING, field: 'TestDescription' },
        TestTypeId: { type: DataTypes.INTEGER, field: 'TestTypeId' },
        DiagnosisId: { type: DataTypes.INTEGER, field: 'DiagnosisId' },
        TestPrice: { type: DataTypes.DECIMAL, field: 'TestPrice' },
        TestPriceCurrencyCode: { type: DataTypes.STRING, field: 'TestPriceCurrencyCode' },
        TestPriceCode: { type: DataTypes.STRING, field: 'TestPriceCode' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        TestCost: { type: DataTypes.DECIMAL, field: 'TestCost' },
        TestCostCurrencyCode: { type: DataTypes.STRING, field: 'TestCostCurrencyCode' },
        TestCostCode: { type: DataTypes.STRING, field: 'TestCostCode' },
        TaxId: { type: DataTypes.INTEGER, field: 'TaxId' },
        TaxCost: { type: DataTypes.DECIMAL, field: 'TaxCost' },
        IsOrdered: { type: DataTypes.INTEGER, field: 'IsOrdered' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        OrderToLocationId: { type: DataTypes.INTEGER, field: 'OrderToLocationId' },
        OrderLocationId: { type: DataTypes.INTEGER, field: 'OrderLocationId' },
        OrderStatusId: { type: DataTypes.INTEGER, field: 'OrderStatusId' },
        OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
        TestInstruction: { type: DataTypes.STRING, field: 'TestInstruction' },
        SpecimanId: { type: DataTypes.BIGINT, field: 'SpecimanId' },
        BodySiteId: { type: DataTypes.BIGINT, field: 'BodySiteId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        IsAlertRequired: { type: DataTypes.INTEGER, field: 'IsAlertRequired' },
        IsProcessed: { type: DataTypes.INTEGER, field: 'IsProcessed' },
        RepeatFrequency: { type: DataTypes.STRING, field: 'RepeatFrequency' },
        Indication: { type: DataTypes.STRING, field: 'Indication' },
        IsUsePreviousSample: { type: DataTypes.BOOLEAN, field: 'IsUsePreviousSample' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        Extoid: { type: DataTypes.STRING, field: 'Extoid' },
        ProfileName: { type: DataTypes.STRING, field: 'ProfileName' },
        PackageName: { type: DataTypes.STRING, field: 'PackageName' },
        MasterObjectTypeId: { type: DataTypes.INTEGER, field: 'MasterObjectTypeId' },
        MasterId: { type: DataTypes.INTEGER, field: 'MasterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        ScheduleDate: { type: DataTypes.DATE, field: 'ScheduleDate' },
        ResultEstimatedDate: { type: DataTypes.DATE, field: 'ResultEstimatedDate' },
        IsCanceled: { type: DataTypes.INTEGER, field: 'IsCanceled' },
        CanceledById: { type: DataTypes.BIGINT, field: 'CanceledById' },
        CanceledDateTime: { type: DataTypes.DATE, field: 'CanceledDateTime' },
        PrimaryInsId: { type: DataTypes.INTEGER, field: 'PrimaryInsId' },
        SecondaryInsId: { type: DataTypes.INTEGER, field: 'SecondaryInsId' },
        ReferrarShare: { type: DataTypes.DECIMAL, field: 'ReferrarShare' },
        IsCalculateGST: { type: DataTypes.INTEGER, field: 'IsCalculateGST' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        PatientBillDetailId: { type: DataTypes.INTEGER, field: 'PatientBillDetailId' },
        PatientBillId: { type: DataTypes.INTEGER, field: 'PatientBillId' },
        PatientBillStatusId: { type: DataTypes.INTEGER, field: 'PatientBillStatusId' },
        IsPackage: { type: DataTypes.BOOLEAN, field: 'IsPackage' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        IsExecutableProcedure: { type: DataTypes.BOOLEAN, field: 'IsExecutableProcedure' },
        ExternalProviderId: { type: DataTypes.INTEGER, field: 'ExternalProviderId' },
        ExternalProviderCost: { type: DataTypes.DECIMAL, field: 'ExternalProviderCost' },
        IsAdditionalVisit: { type: DataTypes.BOOLEAN, field: 'IsAdditionalVisit' },
        DoctorClassId: { type: DataTypes.BIGINT, field: 'DoctorClassId' },
        EligiblePercentage: { type: DataTypes.DECIMAL, field: 'EligiblePercentage' },
        DoctorShare: { type: DataTypes.DECIMAL, field: 'DoctorShare' },
        PerformDoctorId: { type: DataTypes.BIGINT, field: 'PerformDoctorId' },
        PerformDrShare: { type: DataTypes.DECIMAL, field: 'PerformDrShare' },
        SharePercentage: { type: DataTypes.DECIMAL, field: 'SharePercentage' },
        ShareAmount: { type: DataTypes.DECIMAL, field: 'ShareAmount' },
        DrShareTaxId: { type: DataTypes.BIGINT, field: 'DrShareTaxId' },
        DrTaxPercentage: { type: DataTypes.DECIMAL, field: 'DrTaxPercentage' },
        DrTaxAmount: { type: DataTypes.DECIMAL, field: 'DrTaxAmount' },
        ClinicalReason: { type: DataTypes.DECIMAL, field: 'ClinicalReason' },
        OrderComments: { type: DataTypes.STRING, field: 'OrderComments' },
        IsExternalLab: { type: DataTypes.BOOLEAN, field: 'IsExternalLab' },
        ExternalPrice: { type: DataTypes.DECIMAL, field: 'ExternalPrice' },
        InsNetAmount: { type: DataTypes.DECIMAL, field: 'InsNetAmount' },
        PatNetAmount: { type: DataTypes.DECIMAL, field: 'PatNetAmount' },
        ClinicalData: { type: DataTypes.STRING, field: 'ClinicalData' },
        Duration: { type: DataTypes.STRING, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
        IsFollowup: { type: DataTypes.BOOLEAN, field: 'IsFollowup' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientorderdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientOrderDetail as any).associate = function (models: Models) {
        PatientOrderDetail.belongsTo(models.ReferenceValue, { as: 'OrderPriority', targetKey: 'ReferenceValueCodeId' });
        PatientOrderDetail.belongsTo(models.Department, { foreignKey: 'OrderToLocationId', as: 'OrderToLocation' });
        PatientOrderDetail.belongsTo(models.ReferenceValue, { as: 'PatientBillStatus', targetKey: 'ReferenceValueCodeId' });
        PatientOrderDetail.belongsTo(models.Department);
        PatientOrderDetail.belongsTo(models.Patient);
        PatientOrderDetail.belongsTo(models.ReferenceValue, { as: 'Side', targetKey: 'ReferenceValueCodeId' });
        PatientOrderDetail.belongsTo(models.ReferenceValue, { as: 'DurationPeriod', targetKey: 'ReferenceValueCodeId' });
        PatientOrderDetail.belongsTo(models.OrderStatus);
        PatientOrderDetail.belongsTo(models.PatientOrder);
        PatientOrderDetail.belongsTo(models.ReferenceValue,
            { as: 'TESTMASTERTYP', foreignKey: 'TestTypeId', targetKey: 'ReferenceValueCodeId' });
        PatientOrderDetail.belongsTo(models.Testmaster, { foreignKey: 'TestId' });
        PatientOrderDetail.belongsTo(models.PatientBillDetails, { foreignKey: 'PatientBillDetailId' });
        PatientOrderDetail.belongsTo(models.ServiceItem, { foreignKey: 'TestId', targetKey: 'MasterItemId' });
        PatientOrderDetail.hasMany(models.PatientWorkorderdetails, { foreignKey: 'Orderdetailid' });
    };
    return PatientOrderDetail;
}
