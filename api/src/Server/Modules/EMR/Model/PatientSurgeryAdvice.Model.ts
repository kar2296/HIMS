import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientSurgeryAdviceInstance, i.PatientSurgeryAdviceAttributes> {
    let PatientSurgeryAdvice = sequelize.define<i.PatientSurgeryAdviceInstance, i.
        PatientSurgeryAdviceAttributes>('PatientSurgeryAdvice', {
            Id: { type: DataTypes.BIGINT, field: 'SurgeryAdviceId', primaryKey: true, autoIncrement: true },
            SurgeryGroupingId: { type: DataTypes.BIGINT, field: 'SurgeryGroupingId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            SurgeryNameId: { type: DataTypes.BIGINT, field: 'SurgeryNameId' },
            SurgeryName: { type: DataTypes.STRING, field: 'SurgeryName' },
            SideId: { type: DataTypes.BIGINT, field: 'SideId' },
            AppointmentDate: { type: DataTypes.DATE, field: 'AppointmentDate' },
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
            tableName: 'surgeryadvice',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientSurgeryAdvice as any).associate = function (models: Models) {
        PatientSurgeryAdvice.belongsTo(models.SystemMaster, { foreignKey: 'SurgeryNameId' });
        PatientSurgeryAdvice.belongsTo(models.ReferenceValue, { as: 'EyeSide', foreignKey: 'SideId', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientSurgeryAdvice;
}
