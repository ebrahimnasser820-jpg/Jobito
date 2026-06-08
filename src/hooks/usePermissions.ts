import { useJobitoAuth } from "../context/LinkContxt";

export type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
export type Entity = 'JOB' | 'USER' | 'COMPANY';

export const usePermissions = () => {
  const { role, user } = useJobitoAuth();

  const can = (action: Action, entity: Entity, targetId?: string): boolean => {
    if (!role) return false;
    if (role === 'admin') return true;

    // implicit logic matching backend
    const rolePermissions: Record<string, string[]> = {
      manager: ['CREATE_JOB', 'UPDATE_JOB', 'READ_JOB', 'READ_USER'],
      company: ['CREATE_JOB', 'UPDATE_JOB', 'READ_JOB', 'DELETE_JOB'], // company can delete own jobs
      student: ['READ_JOB'],
    };

    const perm = `${action}_${entity}`;
    const hasBasePermission = rolePermissions[role]?.includes(perm) || false;

    // Optional: Ownership check
    // If it's a job and user is a company, they might only delete THEIR jobs
    // This logic usually depends on data passed (targetId)
    if (role === 'company' && entity === 'JOB' && action === 'DELETE') {
        // If we have an ID check logic here, we'd use it
        return hasBasePermission; 
    }

    return hasBasePermission;
  };

  return { can };
};
