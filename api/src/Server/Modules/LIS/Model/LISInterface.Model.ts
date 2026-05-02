import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes> {
    let LISInterfaceResults = sequelize.define<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes>('LISInterfaceResults', {
        Id: { type: DataTypes.BIGINT, field: 'LISResultId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        Sampleid: { type: DataTypes.STRING, field: 'Sampleid' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        ResultValue: { type: DataTypes.STRING, field: 'ResultValue' },
        FullResultValue: { type: DataTypes.STRING, field: 'FullResultValue' },
        Approved: { type: DataTypes.BOOLEAN, field: 'Approved' },
        ApproveDt: { type: DataTypes.DATE, field: 'ApproveDt' },
        Rejected: { type: DataTypes.BOOLEAN, field: 'Rejected' },
        RejectedDt: { type: DataTypes.DATE, field: 'RejectedDt' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    } as any, // ← TEMPORARY TYPE BYPASS - ADD THIS
        {
            indexes: [],
            timestamps: true,
            tableName: 'lisinterfaceresults',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // Fix the return type casting
    return LISInterfaceResults as SequelizeStatic.Model<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes>;
}
