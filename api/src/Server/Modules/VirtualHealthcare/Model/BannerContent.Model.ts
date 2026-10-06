import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BannerContentInstance, i.BannerContentAttributes> {
    let BannerContent = sequelize.define<i.BannerContentInstance,
        i.BannerContentAttributes>('BannerContent', {
            Id: { type: DataTypes.BIGINT, field: 'BannerContentId', primaryKey: true, autoIncrement: true },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
            Attachment: { type: DataTypes.STRING, field: 'Attachment' },
            BannerContent: { type: DataTypes.STRING, field: 'BannerContent' },
            Content: { type: DataTypes.STRING, field: 'Content' },
            ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
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
                tableName: 'hims_bannercontent',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (BannerContent as any).associate = function (models: Models) {
        BannerContent.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        BannerContent.belongsTo(models.VirtualCategory, { foreignKey: 'CategoryId' });
        BannerContent.belongsTo(models.ReferenceValue, {
            as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'ActiveStatusId'
        });
        BannerContent.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        BannerContent.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
    };
    return BannerContent;
}
