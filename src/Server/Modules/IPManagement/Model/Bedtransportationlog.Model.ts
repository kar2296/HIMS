import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BedtransportationlogInstance, i.BedtransportationlogAttributes> {
    let Bedtransportationlog = sequelize.define<i.BedtransportationlogInstance, i.BedtransportationlogAttributes>('Bedtransportationlog', {
        Id: { type: DataTypes.BIGINT, field: 'BedtransportationlogId', primaryKey: true, autoIncrement: true },
        TransportId: { type: DataTypes.BIGINT, field: 'TransportId' },
        VisitIdentifier: { type: DataTypes.BIGINT, field: 'VisitIdentifier' },
        TransportstatusId: { type: DataTypes.BIGINT, field: 'TransportstatusId' },
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
            tableName: 'Bedtransportationlog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Bedtransportationlog as any).associate = function(models: Models) {
                    Bedtransportationlog.belongsTo(models.Patient);
                };
 return Bedtransportationlog;
}
