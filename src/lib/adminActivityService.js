import { supabase } from './supabase';

class AdminActivityService {
    /**
     * Log admin activity to database
     * @param {string} action - Action performed (e.g., 'approve_organization', 'delete_user')
     * @param {string|null} targetType - Type of target (e.g., 'organization', 'student', 'internship')
     * @param {string|null} targetId - UUID of the target
     * @param {object} details - Additional details about the action
     */
    async logActivity(action, targetType = null, targetId = null, details = {}) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.warn('Cannot log activity: No authenticated user');
                return;
            }

            // Verify user is admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', user.id)
                .single();

            if (profile?.user_type !== 'admin') {
                console.warn('Cannot log activity: User is not admin');
                return;
            }

            // Get IP address (best effort)
            const ipAddress = await this.getClientIP();

            const { error } = await supabase
                .from('admin_activity_logs')
                .insert({
                    admin_id: user.id,
                    action,
                    target_type: targetType,
                    target_id: targetId,
                    details: details || {},
                    ip_address: ipAddress,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('Failed to log admin activity:', error);
            } else {
                console.log(`✅ Admin activity logged: ${action}`, {
                    target_type: targetType,
                    target_id: targetId
                });
            }
        } catch (error) {
            console.error('Error logging admin activity:', error);
        }
    }

    /**
     * Get client IP address for logging
     * @returns {Promise<string|null>}
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json', {
                timeout: 2000
            });
            const data = await response.json();
            return data.ip;
        } catch (error) {
            // IP logging is best-effort, don't fail if unavailable
            return null;
        }
    }

    /**
     * Get recent activity for current admin
     * @param {number} limit - Number of records to fetch
     * @returns {Promise<Array>}
     */
    async getMyActivity(limit = 50) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return [];

            const { data, error } = await supabase
                .from('admin_activity_logs')
                .select('*')
                .eq('admin_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching admin activity:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getMyActivity:', error);
            return [];
        }
    }

    /**
     * Get all admin activity (super admin only)
     * @param {number} limit - Number of records to fetch
     * @returns {Promise<Array>}
     */
    async getAllActivity(limit = 100) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return [];

            // Verify user is super admin
            const { data: admin } = await supabase
                .from('admins')
                .select('role')
                .eq('id', user.id)
                .single();

            if (admin?.role !== 'super_admin') {
                console.warn('Only super admins can view all activity');
                return [];
            }

            const { data, error } = await supabase
                .from('admin_activity_logs')
                .select(`
          *,
          admins (
            id,
            role
          )
        `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching all admin activity:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllActivity:', error);
            return [];
        }
    }
}

export default new AdminActivityService();
