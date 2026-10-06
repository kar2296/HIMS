import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientExecutableProcedureInstance,
    i.PatientExecutableProcedureAttributes> {
    let PatientExecutableProcedure =
    sequelize.define<i.PatientExecutableProcedureInstance, i.PatientExecutableProcedureAttributes>('PatientExecutableProcedure', {
        Id: { type: DataTypes.BIGINT, field: 'PatientExecutableProcedureId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        BillsRaisedFromId: { type: DataTypes.BIGINT, field: 'BillsRaisedFromId' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
        PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
        PatientOrderId: { type: DataTypes.BIGINT, field: 'PatientOrderId' },
        PatientOrderDetailId: { type: DataTypes.BIGINT, field: 'PatientOrderDetailId' },
        OrderNumber: { type: DataTypes.STRING, field: 'OrderNumber' },
        OrderRequestDate: { type: DataTypes.DATE, field: 'OrderRequestDate' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        TestId: { type: DataTypes.BIGINT, field: 'TestId' },
        TestCode: { type: DataTypes.STRING, field: 'TestCode' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        OrderStatusId: { type: DataTypes.BIGINT, field: 'OrderStatusId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        PatientBillStatusId: { type: DataTypes.BIGINT, field: 'PatientBillStatusId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
        DiscountPercentage: { type: DataTypes.DECIMAL, field: 'DiscountPercentage' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        ReceivedAmount: { type: DataTypes.DECIMAL, field: 'ReceivedAmount' },
        DoctorShare: { type: DataTypes.DECIMAL, field: 'DoctorShare' },
        BodySiteId: { type: DataTypes.BIGINT, field: 'BodySiteId' },
        AssignTypeId: { type: DataTypes.BIGINT, field: 'AssignTypeId' },
        ExecutedBy: { type: DataTypes.INTEGER, field: 'ExecutedBy' },
        ExecutedAt: { type: DataTypes.DATE, field: 'ExecutedAt' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        ExecutableProcedureStatusId: { type: DataTypes.BIGINT, field: 'ExecutableProcedureStatusId' },
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
            tableName: 'patientexecutableprocedures',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientExecutableProcedure as any).associate = function(models: Models) {
        PatientExecutableProcedure.belongsTo(models.Facility);
        PatientExecutableProcedure.belongsTo(models.ReferenceValue, { as: 'PatientBillStatus', targetKey: 'ReferenceValueCodeId' });
        PatientExecutableProcedure.belongsTo(models.ReferenceValue, { as: 'ExecutableProcedureStatus', targetKey: 'ReferenceValueCodeId' });
        PatientExecutableProcedure.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientExecutableProcedure.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientExecutableProcedure.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        PatientExecutableProcedure.belongsTo(models.PatientOrder, { foreignKey: 'PatientOrderId' });
        PatientExecutableProcedure.belongsTo(models.User, { foreignKey: 'DoctorId' });
        PatientExecutableProcedure.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientExecutableProcedure.belongsTo(models.User, { as: 'Updateduser', foreignKey: 'UpdatedBy' });
        PatientExecutableProcedure.belongsTo(models.User, { as: 'Executeduser', foreignKey: 'ExecutedBy' });
        PatientExecutableProcedure.belongsTo(models.Department, { as: 'ServiceDepartment', foreignKey: 'DepartmentId' });
    };
 return PatientExecutableProcedure;
}
