import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EmarInstance, i.EmarAttributes> {
    let Emar = sequelize.define<i.EmarInstance, i.EmarAttributes>('Emar', {
        Id: { type: DataTypes.BIGINT, field: 'EmarId', primaryKey: true, autoIncrement: true },
        PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
        PrescriptionDetailId: { type: DataTypes.BIGINT, field: 'PrescriptionDetailId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        Dosage: { type: DataTypes.STRING, field: 'Dosage' },
        Duration: { type: DataTypes.INTEGER, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
        STAT: { type: DataTypes.BOOLEAN, field: 'STAT' },
        Morning: { type: DataTypes.INTEGER, field: 'Morning' },
        Noon: { type: DataTypes.INTEGER, field: 'Noon' },
        Night: { type: DataTypes.INTEGER, field: 'Night' },
        DrugInstructionId: { type: DataTypes.BIGINT, field: 'DrugInstructionId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        AdministeredQuantity: { type: DataTypes.INTEGER, field: 'AdministeredQuantity' },
        AdministerStatusId: { type: DataTypes.INTEGER, field: 'AdministerStatusId' },
        AdministerInstructions: { type: DataTypes.STRING, field: 'AdministerInstructions' },
        AdministerDosage: { type: DataTypes.STRING, field: 'AdministerDosage' },
        AdministeredBy: { type: DataTypes.INTEGER, field: 'AdministeredBy' },
        AdministeredDate: { type: DataTypes.DATE, field: 'AdministeredDate' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'hims_emar',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Emar as any).associate = function (models: Models) {
        Emar.belongsTo(models.Patient);
        Emar.belongsTo(models.Prescription);
        Emar.belongsTo(models.PrescriptionDetail);
        Emar.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        Emar.belongsTo(models.DrugMaster, { foreignKey: 'DrugId' });
        Emar.belongsTo(models.ReferenceValue, { as: 'DurationPeriod', targetKey: 'ReferenceValueCodeId' });
        Emar.belongsTo(models.ReferenceValue, { as: 'DrugInstruction', targetKey: 'ReferenceValueCodeId' });
        Emar.belongsTo(models.ReferenceValue, { as: 'AdministerStatus', targetKey: 'ReferenceValueCodeId' });
        Emar.belongsTo(models.User, { foreignKey: 'CreatedBy', as: 'CreatedUser' });
        Emar.belongsTo(models.User, { foreignKey: 'UpdatedBy', as: 'UpdatedUser' });

    };
    return Emar;
}
