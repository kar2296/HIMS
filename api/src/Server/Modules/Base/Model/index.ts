export interface IAudit {
    CreatedAt?: Date;
    UpdatedAt?: Date;
    CreatedBy?: number;
    UpdatedBy?: number;
}

export interface IAttributes extends IAudit {
    Id?: number;
    Rev?: number;
    Status?: number;
}
