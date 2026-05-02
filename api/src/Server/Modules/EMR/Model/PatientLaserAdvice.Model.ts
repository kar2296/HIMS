import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientLaserAdviceInstance, i.PatientLaserAdviceAttributes> {
    let PatientLaserAdvice = sequelize.define<i.PatientLaserAdviceInstance, i.
        PatientLaserAdviceAttributes>('PatientLaserAdvice', {
            Id: { type: DataTypes.BIGINT, field: 'LaserAdviceId', primaryKey: true, autoIncrement: true },
            LaserGroupingId: { type: DataTypes.BIGINT, field: 'LaserGroupingId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            LaserNameId: { type: DataTypes.BIGINT, field: 'LaserNameId' },
            LaserName: { type: DataTypes.STRING, field: 'LaserName' },
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
            tableName: 'laseradvice',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientLaserAdvice as any).associate = function (models: Models) {
        PatientLaserAdvice.belongsTo(models.SystemMaster, { foreignKey: 'LaserNameId' });
        PatientLaserAdvice.belongsTo(models.ReferenceValue, { as: 'EyeSide', foreignKey: 'SideId', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientLaserAdvice;
}
