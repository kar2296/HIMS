import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AETriageInstance, i.AETriageAttributes> {
    let AETriage = sequelize.define<i.AETriageInstance, i.AETriageAttributes>('AETriage', {
        Id: { type: DataTypes.BIGINT, field: 'AETriageId', primaryKey: true, autoIncrement: true },
        TriageLevelId: { type: DataTypes.BIGINT, field: 'TriageLevelId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        AERegistraionId: { type: DataTypes.BIGINT, field: 'AERegistraionId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        IsResuscitate: { type: DataTypes.INTEGER, field: 'IsResuscitate' },
        IsEquipmentGreaterThan2: { type: DataTypes.INTEGER, field: 'IsEquipmentGreaterThan2' },
        IsEquipmentGreaterThan1: { type: DataTypes.INTEGER, field: 'IsEquipmentGreaterThan1' },
        IsOtherServices: { type: DataTypes.INTEGER, field: 'IsOtherServices' },
        IsRequiredAdmission: { type: DataTypes.INTEGER, field: 'IsRequiredAdmission' },
        IsRequiredSurgery: { type: DataTypes.INTEGER, field: 'IsRequiredSurgery' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        ComaScaleE: { type: DataTypes.INTEGER, field: 'ComaScaleE' },
        ComaScaleV: { type: DataTypes.INTEGER, field: 'ComaScaleV' },
        ComaScaleM: { type: DataTypes.INTEGER, field: 'ComaScaleM' },
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
            tableName: 'aetriage',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (AETriage as any).associate = function(models: Models) {
                    AETriage.belongsTo(models.Patient, { foreignKey: 'PatientId' });
                    AETriage.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
                    AETriage.belongsTo(models.PatientGuarantor, { foreignKey: 'GuarantorId' });
                    AETriage.belongsTo(models.User, { foreignKey: 'DoctorId' });
                    AETriage.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
                    AETriage.belongsTo(models.ReferenceValue, { as: 'ERType', targetKey: 'ReferenceValueCodeId' });
                    AETriage.belongsTo(models.ReferenceValue, {
                        as: 'ModeOfTransport', foreignKey: 'ArrivalModeId',
                        targetKey: 'ReferenceValueCodeId'
                    });
                };
 return AETriage;
}
