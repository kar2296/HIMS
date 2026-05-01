import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DocumentInstance, i.DocumentAttributes> {
    let Document = sequelize.define<i.DocumentInstance, i.DocumentAttributes>('Document', {
        Id: { type: DataTypes.BIGINT, field: 'DocumentId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DocumentTitle: { type: DataTypes.STRING, field: 'DocumentTitle' },
        DocumentDate: { type: DataTypes.DATE, field: 'DocumentDate' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        DocumentForId: { type: DataTypes.BIGINT, field: 'DocumentForId' },
        DocumentTypeId: { type: DataTypes.BIGINT, field: 'DocumentTypeId' },
        DocumentName: { type: DataTypes.STRING, field: 'DocumentName' },
        DocumentStatusId: { type: DataTypes.BIGINT, field: 'DocumentStatusId' },
        DocumentPath: { type: DataTypes.STRING, field: 'DocumentPath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
        CancelledAt: { type: DataTypes.DATE, field: 'CancelledAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patient_documents',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Document as any).associate = function (models: Models) {
      Document.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
      Document.belongsTo(models.ReferenceValue, { as: 'AnnouncementFor', targetKey: 'ReferenceValueCodeId',foreignKey:'DocumentForId' });
      Document.belongsTo(models.ReferenceValue, { as: 'DocumentAttachmentType',
      targetKey: 'ReferenceValueCodeId',foreignKey:'DocumentTypeId' });
      Document.belongsTo(models.ReferenceValue, { as: 'DocumentStatus', targetKey: 'ReferenceValueCodeId',foreignKey:'DocumentStatusId' });
      Document.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
      Document.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
    };
    return Document;
}
