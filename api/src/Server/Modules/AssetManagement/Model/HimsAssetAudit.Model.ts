import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetAuditInstance, i.AssetAuditAttributes> {
    let AssetAudit = sequelize.define<i.AssetAuditInstance, i.AssetAuditAttributes>('AssetAudit', {
        Id: { type: DataTypes.BIGINT, field: 'AssetAuditId', primaryKey: true, autoIncrement: true },
        AuditNameId: { type: DataTypes.BIGINT, field: 'AuditNameId' },
        FundingName: { type: DataTypes.STRING, field: 'FundingName' },
        DepartmentId: { type: DataTypes.STRING, field: 'DepartmentId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        ReconcileStartDate: { type: DataTypes.DATE, field: 'ReconcileStartDate' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        Notes: { type: DataTypes.STRING, field: 'Notes' },
        AuditStatusId: { type: DataTypes.BIGINT, field: 'AuditStatusId' },
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
            tableName: 'hims_assetaudit',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetAudit as any).associate = function (models: Models) {
        AssetAudit.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        AssetAudit.belongsTo(models.ReferenceValue, { as: 'AuditStatus', targetKey: 'ReferenceValueCodeId' });
        AssetAudit.belongsTo(models.ReferenceValue, { as: 'LOCATION', targetKey: 'ReferenceValueCodeId' });
        AssetAudit.belongsTo(models.User, { as: 'AuditName', foreignKey: 'AuditNameId' });
    };
    return AssetAudit;
}
