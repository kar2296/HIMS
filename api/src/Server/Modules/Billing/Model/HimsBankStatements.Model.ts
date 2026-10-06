import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BankStatementsInstance, i.BankStatementsAttributes> {
    let BankStatements = sequelize.define<i.BankStatementsInstance, i.BankStatementsAttributes>('BankStatements', {
        Id: { type: DataTypes.BIGINT, field: 'BankStatementId', primaryKey: true, autoIncrement: true },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        BillingCounterId: { type: DataTypes.BIGINT, field: 'BillingCounterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DocumentNumber: { type: DataTypes.STRING, field: 'DocumentNumber' },
        DocumentDate: { type: DataTypes.DATE, field: 'DocumentDate' },
        OpeningDate: { type: DataTypes.DATE, field: 'OpeningDate' },
        OpenedBy: { type: DataTypes.INTEGER, field: 'OpenedBy' },
        OpeningBalance: { type: DataTypes.DECIMAL, field: 'OpeningBalance' },
        OpeningCash: { type: DataTypes.DECIMAL, field: 'OpeningCash' },
        OpeningCard: { type: DataTypes.DECIMAL, field: 'OpeningCard' },
        OpeningCheque: { type: DataTypes.DECIMAL, field: 'OpeningCheque' },
        OpeningRemarks: { type: DataTypes.STRING, field: 'OpeningRemarks' },
        ClosingDate: { type: DataTypes.DATE, field: 'ClosingDate' },
        ClosedBy: { type: DataTypes.INTEGER, field: 'ClosedBy' },
        ClosingBalance: { type: DataTypes.DECIMAL, field: 'ClosingBalance' },
        ClosingCash: { type: DataTypes.DECIMAL, field: 'ClosingCash' },
        ClosingCard: { type: DataTypes.DECIMAL, field: 'ClosingCard' },
        ClosingCheque: { type: DataTypes.DECIMAL, field: 'ClosingCheque' },
        ClosingRemarks: { type: DataTypes.STRING, field: 'ClosingRemarks' },
        DifferenceAmount: { type: DataTypes.DECIMAL, field: 'DifferenceAmount' },
        DenominationsNetCount: { type: DataTypes.DECIMAL, field: 'DenominationsNetCount' },
        DenominationsNetTotal: { type: DataTypes.DECIMAL, field: 'DenominationsNetTotal' },
        OtherDenominationsTotal: { type: DataTypes.DECIMAL, field: 'OtherDenominationsTotal' },
        BillingCounterStatusId: { type: DataTypes.INTEGER, field: 'BillingCounterStatusId' },
        SubmitedDate: { type: DataTypes.DATE, field: 'SubmitedDate' },
        SubmitedBy: { type: DataTypes.INTEGER, field: 'SubmitedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        FetalAmount:  { type: DataTypes.DECIMAL, field: 'FetalAmount' },
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
            tableName: 'bankstatements',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (BankStatements as any).associate = function (models: Models) {
        BankStatements.hasMany(models.BankStatementDetails, { foreignKey: 'BankStatementId' });
        BankStatements.hasMany(models.BankStatementDenominations, { foreignKey: 'BankStatementId' });
        BankStatements.hasMany(models.BankStatementCancellations, { foreignKey: 'BankStatementId' });
        BankStatements.belongsTo(models.User, { as: 'Users', foreignKey: 'UserId' });
        BankStatements.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        BankStatements.belongsTo(models.User, { as: 'Updateduser', foreignKey: 'UpdatedBy' });
        BankStatements.belongsTo(models.ReferenceValue, { as: 'BillingCounterStatus', targetKey: 'ReferenceValueCodeId' });
        BankStatements.belongsTo(models.ReferenceValue, { as: 'BillingCounter', targetKey: 'ReferenceValueCodeId' });
        BankStatements.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        BankStatements.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        BankStatements.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    };
    return BankStatements;
}
