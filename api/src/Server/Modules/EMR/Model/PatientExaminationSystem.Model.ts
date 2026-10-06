import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientExaminationSystemInstance, i.PatientExaminationSystemAttributes> {
    let PatientExaminationSystem = sequelize.define<i.PatientExaminationSystemInstance, i.
        PatientExaminationSystemAttributes>('PatientExaminationSystem', {
            Id: { type: DataTypes.BIGINT, field: 'ExaminationSystemId', primaryKey: true, autoIncrement: true },
            ExaminationId: { type: DataTypes.BIGINT, field: 'ExaminationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            SystemId: { type: DataTypes.BIGINT, field: 'SystemId' },
            System: { type: DataTypes.STRING, field: 'System' },
            FindingsId: { type: DataTypes.BIGINT, field: 'FindingsId' },
            LeftEye: { type: DataTypes.STRING, field: 'LeftEye' },
            RightEye: { type: DataTypes.STRING, field: 'RightEye' },
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
            tableName: 'examinationsystems',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientExaminationSystem as any).associate = function (models: Models) {
        PatientExaminationSystem.belongsTo(models.SystemMaster, { foreignKey: 'SystemId' });
        PatientExaminationSystem.belongsTo(models.ClinicalFinding, { foreignKey: 'FindingsId' });
    };
    return PatientExaminationSystem;
}
