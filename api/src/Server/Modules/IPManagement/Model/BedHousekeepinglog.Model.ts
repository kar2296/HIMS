import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BedHousekeepinglogInstance, i.BedHousekeepinglogAttributes> {
    let BedHousekeepinglog = sequelize.define<i.BedHousekeepinglogInstance, i.BedHousekeepinglogAttributes>('BedHousekeepinglog', {
        Id: { type: DataTypes.BIGINT, field: 'BedHousekeepinglogId', primaryKey: true, autoIncrement: true },
        HousekeepingId: { type: DataTypes.BIGINT, field: 'HousekeepingId' },
        VisitIdentifier: { type: DataTypes.BIGINT, field: 'VisitIdentifier' },
        HousekeepingStatusId: { type: DataTypes.BIGINT, field: 'HousekeepingStatusId' },
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
            tableName: 'bedhousekeepinglog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (BedHousekeepinglog as any).associate = function(models: Models) {
                    BedHousekeepinglog.belongsTo(models.Patient);
                };
 return BedHousekeepinglog;
}
