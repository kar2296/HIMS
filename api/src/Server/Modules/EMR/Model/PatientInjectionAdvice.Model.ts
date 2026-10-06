import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientInjectionAdviceInstance, i.PatientInjectionAdviceAttributes> {
    let PatientInjectionAdvice = sequelize.define<i.PatientInjectionAdviceInstance, i.
        PatientInjectionAdviceAttributes>('PatientInjectionAdvice', {
            Id: { type: DataTypes.BIGINT, field: 'InjectionAdviceId', primaryKey: true, autoIncrement: true },
            InjectionGroupingId: { type: DataTypes.BIGINT, field: 'InjectionGroupingId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            InjectionNameId: { type: DataTypes.BIGINT, field: 'InjectionNameId' },
            InjectionName: { type: DataTypes.STRING, field: 'InjectionName' },
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
            tableName: 'injectionadvice',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientInjectionAdvice as any).associate = function (models: Models) {
        PatientInjectionAdvice.belongsTo(models.SystemMaster, { foreignKey: 'InjectionNameId' });
        PatientInjectionAdvice.belongsTo(models.ReferenceValue, { as: 'EyeSide', foreignKey: 'SideId', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientInjectionAdvice;
}
