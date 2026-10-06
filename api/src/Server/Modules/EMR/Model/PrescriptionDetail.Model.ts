import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PrescriptionDetailInstance, i.PrescriptionDetailAttributes> {
    let PrescriptionDetail = sequelize.define<i.PrescriptionDetailInstance, i.PrescriptionDetailAttributes>('PrescriptionDetail', {
        Id: { type: DataTypes.BIGINT, field: 'PrescriptionDetailId', primaryKey: true, autoIncrement: true },
        PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        IsGeneric: { type: DataTypes.BOOLEAN, field: 'IsGeneric' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        DrugGenericId: { type: DataTypes.BIGINT, field: 'DrugGenericId' },
        DrugGenericCode: { type: DataTypes.STRING, field: 'DrugGenericCode' },
        DrugGenericName: { type: DataTypes.STRING, field: 'DrugGenericName' },
        DrugFrequencyId: { type: DataTypes.BIGINT, field: 'DrugFrequencyId' },
        PrecriptionStatusId: { type: DataTypes.BIGINT, field: 'PrecriptionStatusId' },
        DrugRouteId: { type: DataTypes.BIGINT, field: 'DrugRouteId' },
        Dosage: { type: DataTypes.STRING, field: 'Dosage' },
        Duration: { type: DataTypes.INTEGER, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        DispensedQuantity: { type: DataTypes.INTEGER, field: 'DispensedQuantity' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        RxName: { type: DataTypes.STRING, field: 'RxName' },
        AdminInstructions: { type: DataTypes.STRING, field: 'AdminInstructions' },
        PharmacyId: { type: DataTypes.BIGINT, field: 'PharmacyId' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        Diagnosis: { type: DataTypes.STRING, field: 'Diagnosis' },
        Price: { type: DataTypes.DECIMAL, field: 'Price' },
        SpecialApprovalId: { type: DataTypes.BIGINT, field: 'SpecialApprovalId' },
        Notes: { type: DataTypes.STRING, field: 'Notes' },
        DrugFormId: { type: DataTypes.BIGINT, field: 'DrugFormId' },
        DrugFormName: { type: DataTypes.STRING, field: 'DrugFormName' },
        NoOfRefills: { type: DataTypes.INTEGER, field: 'NoOfRefills' },
        PrescriptionPriorityId: { type: DataTypes.BIGINT, field: 'PrescriptionPriorityId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        SubstitutionAllowedId: { type: DataTypes.BIGINT, field: 'SubstitutionAllowedId' },
        TaperingOrderId: { type: DataTypes.BIGINT, field: 'TaperingOrderId' },
        RefusetoBuyId: { type: DataTypes.BIGINT, field: 'RefusetoBuyId' },
        DrugInstructionId: { type: DataTypes.BIGINT, field: 'DrugInstructionId' },
        SearchTypeId: { type: DataTypes.BIGINT, field: 'SearchTypeId' },
        STAT: { type: DataTypes.BOOLEAN, field: 'STAT' },
        Morning: { type: DataTypes.DECIMAL, field: 'Morning' },
        Noon: { type: DataTypes.DECIMAL, field: 'Noon' },
        Night: { type: DataTypes.DECIMAL, field: 'Night' },
        AdministeredQuantity: { type: DataTypes.INTEGER, field: 'AdministeredQuantity' },
        AdministerStatusId: { type: DataTypes.INTEGER, field: 'AdministerStatusId' },
        IseMAR: { type: DataTypes.BOOLEAN, field: 'IseMAR' },
        IsAllergyOverride: { type: DataTypes.BOOLEAN, field: 'IsAllergyOverride' },
        AllergyOverrideReason: { type: DataTypes.STRING, field: 'AllergyOverrideReason' },
        AllergyOverrideBy: { type: DataTypes.INTEGER, field: 'AllergyOverrideBy' },
        AllergyOverrideAt: { type: DataTypes.DATE, field: 'AllergyOverrideAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'hims_prescriptiondetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PrescriptionDetail as any).associate = function (models: Models) {
        PrescriptionDetail.belongsTo(models.Prescription, { foreignKey: 'PrescriptionId' });
        PrescriptionDetail.belongsTo(models.ReferenceValue, { as: 'PrescriptionPriority', targetKey: 'ReferenceValueCodeId' });
        PrescriptionDetail.belongsTo(models.ReferenceValue, { as: 'Pharmacy', targetKey: 'ReferenceValueCodeId' });
        PrescriptionDetail.belongsTo(models.ReferenceValue, { as: 'DurationPeriod', targetKey: 'ReferenceValueCodeId' });
        PrescriptionDetail.belongsTo(models.ReferenceValue, { as: 'DrugInstruction', targetKey: 'ReferenceValueCodeId' });
        PrescriptionDetail.belongsTo(models.ReferenceValue, { as: 'DrugRoute', targetKey: 'ReferenceValueCodeId' });
        PrescriptionDetail.belongsTo(models.DrugFrequency);
        PrescriptionDetail.belongsTo(models.User, { foreignKey: 'CreatedBy', as: 'CreatedUser' });
        PrescriptionDetail.belongsTo(models.User, { foreignKey: 'UpdatedBy', as: 'UpdatedUser' });
        PrescriptionDetail.belongsTo(models.GenericMaster, { foreignKey: 'GenericId' });
        PrescriptionDetail.belongsTo(models.DrugMaster, { foreignKey: 'DrugId' });
    };
    return PrescriptionDetail;
}
