import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientAccountsInstance, i.PatientAccountsAttributes> {
    let PatientAccounts = sequelize.define<i.PatientAccountsInstance, i.PatientAccountsAttributes>('PatientAccounts', {
        Id: { type: DataTypes.BIGINT, field: 'PatientAccountId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        VisitNumber: { type: DataTypes.STRING, field: 'VisitNumber' },
        TransactionTypeId: { type: DataTypes.BIGINT, field: 'TransactionTypeId' },
        TransactionId: { type: DataTypes.BIGINT, field: 'TransactionId' },
        TransactionNumber: { type: DataTypes.STRING, field: 'TransactionNumber' },
        TransactionDate: { type: DataTypes.DATE, field: 'TransactionDate' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
        AdjustedAmount: { type: DataTypes.DECIMAL, field: 'AdjustedAmount' },
        UnAdjustedAmount: { type: DataTypes.DECIMAL, field: 'UnAdjustedAmount' },
        DueAmount: { type: DataTypes.DECIMAL, field: 'DueAmount' },
        DebitAmount: { type: DataTypes.DECIMAL, field: 'DebitAmount' },
        CreditAmount: { type: DataTypes.DECIMAL, field: 'CreditAmount' },
        ClosingBalance: { type: DataTypes.DECIMAL, field: 'ClosingBalance' },
        IsAdvance: { type: DataTypes.BOOLEAN, field: 'IsAdvance' },
		IsAdvanceAdjusted: { type: DataTypes.BOOLEAN, field: 'IsAdvanceAdjusted' },
        IsDueCollection: { type: DataTypes.BOOLEAN, field: 'IsDueCollection' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
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
            tableName: 'patientaccounts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientAccounts as any).associate = function(models: Models) {
                    PatientAccounts.belongsTo(models.Patient, { foreignKey: 'PatientId' });
                    PatientAccounts.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
                    PatientAccounts.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
                    PatientAccounts.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
                };
 return PatientAccounts;
}
