import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProcedureServicesInstance, i.ProcedureServicesAttributes> {
    let ProcedureServices = sequelize.define<i.ProcedureServicesInstance, i.ProcedureServicesAttributes>('ProcedureServices', {
        Id: { type: DataTypes.BIGINT, field: 'ProcedureServiceId', primaryKey: true, autoIncrement: true },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Percent: { type: DataTypes.INTEGER, field: 'Percent' },
        IsProcedureCharge: { type: DataTypes.BOOLEAN, field: 'IsProcedureCharge' },
        IsCheifSurgeon: { type: DataTypes.BOOLEAN, field: 'IsCheifSurgeon' },
        IsAssistantSurgeon: { type: DataTypes.BOOLEAN, field: 'IsAssistantSurgeon' },
        IsAssociateSurgeon: { type: DataTypes.BOOLEAN, field: 'IsAssociateSurgeon' },
        IsAnesthetist: { type: DataTypes.BOOLEAN, field: 'IsAnesthetist' },
        IsOTHourlyCharge: { type: DataTypes.BOOLEAN, field: 'IsOTHourlyCharge' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        DoctorSharePercent: { type: DataTypes.DECIMAL, field: 'DoctorSharePercent' },
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
            tableName: 'procedureservices',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ProcedureServices as any).associate = function (models: Models) {
        ProcedureServices.belongsTo(models.ServiceItem, { foreignKey: 'ServiceItemId' });
    };
    return ProcedureServices;
}
