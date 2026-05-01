import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LinenStockTransferInstance, i.LinenStockTransferAttributes> {
    let LinenStockTransfer = sequelize.define<i.LinenStockTransferInstance,
        i.LinenStockTransferAttributes>('LinenStockTransfer', {
            Id: { type: DataTypes.BIGINT, field: 'LinenStockTransferId', primaryKey: true, autoIncrement: true },
            LinenStockTransferNo: { type: DataTypes.STRING, field: 'LinenStockTransferNo' },
            LinenStockTransferDate: { type: DataTypes.DATE, field: 'LinenStockTransferDate' },
            LinenStockRequestId: { type: DataTypes.BIGINT, field: 'LinenStockRequestId' },
            LinenStockRequestNo: { type: DataTypes.STRING, field: 'LinenStockRequestNo' },
            LinenStockRequestDate: { type: DataTypes.DATE, field: 'LinenStockRequestDate' },
            FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
            ToDepartmentId: { type: DataTypes.BIGINT, field: 'ToDepartmentId' },
            FromFacilityId: { type: DataTypes.BIGINT, field: 'FromFacilityId' },
            ToFacilityId: { type: DataTypes.BIGINT, field: 'ToFacilityId' },
            OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
            IssuedById: { type: DataTypes.BIGINT, field: 'IssuedById' },
            LinenStockRequestStatusId: { type: DataTypes.BIGINT, field: 'LinenStockRequestStatusId' },
            LinenStockTransferStatusId: { type: DataTypes.BIGINT, field: 'LinenStockTransferStatusId' },
            ReceivedBy: { type: DataTypes.INTEGER, field: 'ReceivedBy' },
            ReceivedDate: { type: DataTypes.DATE, field: 'ReceivedDate' },
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
                tableName: 'linenstocktransfers',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (LinenStockTransfer as any).associate = function (models: Models) {
        LinenStockTransfer.belongsTo(models.ReferenceValue,
            { as: 'LinenStockTransferStatus', targetKey: 'ReferenceValueCodeId', foreignKey: 'LinenStockTransferStatusId' });
        LinenStockTransfer.belongsTo(models.Department, { as: 'Department', foreignKey: 'FromDepartmentId' });
        LinenStockTransfer.belongsTo(models.User, { as: 'IssuedUser', foreignKey: 'IssuedById' });
        LinenStockTransfer.belongsTo(models.Department, { as: 'ToDepartment', foreignKey: 'ToDepartmentId' });

    };
    return LinenStockTransfer;
}
