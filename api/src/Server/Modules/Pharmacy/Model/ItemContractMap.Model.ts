import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemContractMapInstance, i.ItemContractMapAttributes> {
    let ItemContractMap = sequelize.define<i.ItemContractMapInstance, i.ItemContractMapAttributes>('ItemContractMap', {
        Id: { type: DataTypes.BIGINT, field: 'ItemContractMapId', primaryKey: true, autoIncrement: true },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ContractName: { type: DataTypes.STRING, field: 'ContractName' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DepartmentName: { type: DataTypes.STRING, field: 'DepartmentName' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        DocumentTypeId: { type: DataTypes.BIGINT, field: 'DocumentTypeId' },
        DocumentDate: { type: DataTypes.DATE, field: 'DocumentDate' },
        Attachments: { type: DataTypes.STRING, field: 'Attachments' },
        ReleaseToPatientId: { type: DataTypes.INTEGER, field: 'ReleaseToPatientId' },
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
            tableName: 'ItemContractMap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ItemContractMap as any).associate = function(models: Models) {
                    ItemContractMap.belongsTo(models.ReferenceValue,
                        { foreignKey: 'ReleaseToPatientId', as: 'YesNo', targetKey: 'ReferenceValueCodeId' });
                    ItemContractMap.belongsTo(models.ReferenceValue, { as: 'DocumentType', targetKey: 'ReferenceValueCodeId' });

                };
 return ItemContractMap;
}
