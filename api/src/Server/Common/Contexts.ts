import { AppConfig } from '../../config/index';

export interface PageContext {
    PageSize: number;
    PageNumber: number;
    TotalRecords?: number;
}

export class Paginator {
    private pc: PageContext;
    constructor(pc: PageContext) {
        this.pc = pc || { PageSize: 500, PageNumber: 1 };
    }
    public get Limit(): number {
        return this.pc.PageSize === 0 ? AppConfig.DefaultPageSize : this.pc.PageSize;
    }

    public get Offset(): number {
        return (this.pc.PageNumber - 1) * this.pc.PageSize;
    }

    public NextPage(): void {
        this.pc.PageNumber += 1;
    }
}

export class UserContext {
    public Id: number;
}
