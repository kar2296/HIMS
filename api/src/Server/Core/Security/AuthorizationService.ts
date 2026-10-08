// Server/Core/Security/AuthorizationService.ts

export class AuthorizationService {
    public static isAdministrator(session: any): boolean {
        if (!session) return false;
        if (session.Group?.GroupName === 'APPLICATION ADMIN') return true;
        if (session.Group?.Roles?.some((r: any) => r.RoleCode === 'ADMINISTRATOR' || r.RoleName === 'ADMINISTRATOR')) return true;
        if (session.UserGroupId === 5 || session.RoleId === 6) return true;
        return false;
    }

    public static checkFacilityAccess(session: any, targetFacilityId?: number): boolean {
        if (!session) return false;
        if (this.isAdministrator(session)) return true;
        if (!targetFacilityId || targetFacilityId <= 0) return true;
        const userFacilityId = Number(session.FacilityId);
        const targetFacId = Number(targetFacilityId);
        return userFacilityId === targetFacId;
    }

    public static hasClinicalEditPermission(session: any, targetFacilityId?: number): boolean {
        if (!session) return false;
        if (this.isAdministrator(session)) return true;
        if (!this.checkFacilityAccess(session, targetFacilityId)) return false;

        const groupName = (session.Group?.GroupName || '').toLowerCase();
        if (groupName.includes('doctor') || groupName.includes('clinical')) return true;

        const roles = session.Group?.Roles || [];
        for (const r of roles) {
            const code = (r.RoleCode || r.RoleName || '').toLowerCase();
            if (code === 'doctor' || code === 'physician' || code === 'specialist') return true;
            if (r.RolePrivileges && Array.isArray(r.RolePrivileges)) {
                const hasEmrAllow = r.RolePrivileges.some((p: any) =>
                    (p.AccessObjectType === 'EMRControls' || p.AccessObjectType === 'OutPatients' || p.AccessObjectType === 'InPatients') &&
                    p.Access === 'allow'
                );
                if (hasEmrAllow) return true;
            }
        }
        return false;
    }

    public static hasRefundPermission(session: any, targetFacilityId?: number): boolean {
        if (!session) return false;
        if (this.isAdministrator(session)) return true;
        if (!this.checkFacilityAccess(session, targetFacilityId)) return false;

        const groupName = (session.Group?.GroupName || '').toLowerCase();
        if (groupName.includes('billing') || groupName.includes('finance') || groupName.includes('cashier')) return true;

        const roles = session.Group?.Roles || [];
        for (const r of roles) {
            const code = (r.RoleCode || r.RoleName || '').toLowerCase();
            if (code === 'billing' || code === 'cashier' || code === 'finance' || code === 'accountant') return true;
            if (r.RolePrivileges && Array.isArray(r.RolePrivileges)) {
                const hasBillingAllow = r.RolePrivileges.some((p: any) =>
                    (p.AccessObjectType === 'IPBILLING_MODIFICATION' || p.AccessObjectType === 'IPBILLING_TAB' || p.AccessObjectType === 'OPBilling') &&
                    p.Access === 'allow'
                );
                if (hasBillingAllow) return true;
            }
        }
        return false;
    }

    public static hasOtSchedulePermission(session: any, targetFacilityId?: number): boolean {
        if (!session) return false;
        if (this.isAdministrator(session)) return true;
        if (!this.checkFacilityAccess(session, targetFacilityId)) return false;

        const groupName = (session.Group?.GroupName || '').toLowerCase();
        if (groupName.includes('operation theater') || groupName.includes('ot') || groupName.includes('doctor') || groupName.includes('surgeon')) return true;

        const roles = session.Group?.Roles || [];
        for (const r of roles) {
            const code = (r.RoleCode || r.RoleName || '').toLowerCase();
            if (code === 'ot' || code === 'operation theater' || code === 'doctor' || code === 'surgeon') return true;
            if (r.RolePrivileges && Array.isArray(r.RolePrivileges)) {
                const hasOtAllow = r.RolePrivileges.some((p: any) =>
                    p.AccessObjectType && p.AccessObjectType.toLowerCase().includes('ot') && p.Access === 'allow'
                );
                if (hasOtAllow) return true;
            }
        }
        return false;
    }

    public static assertPermission(allowed: boolean, message = 'Access Denied: You do not have permission to perform this action'): void {
        if (!allowed) {
            const err: any = new Error(message);
            err.statusCode = 403;
            err.code = 'FORBIDDEN';
            throw err;
        }
    }
}
