import mixpanel from 'mixpanel-browser';

/**
 * Group Analytics Service for B2B team/organization tracking
 */
export class GroupService {
    private static isEnabled: boolean = !!import.meta.env.VITE_MIXPANEL_TOKEN;

    /**
     * Set a group for the current user
     */
    static setGroup(
        groupKey: 'company' | 'team' | 'project',
        groupId: string
    ): void {
        if (!this.isEnabled) {
            return;
        }

        try {
            mixpanel.set_group(groupKey, groupId);
            console.debug('Group set:', groupKey, groupId);
        } catch (error) {
            console.error('Error setting group:', error);
        }
    }

    /**
     * Set group profile properties
     */
    static setGroupProfile(
        groupKey: string,
        groupId: string,
        properties: {
            name: string;
            created_at?: Date | string;
            plan?: string;
            total_members?: number;
            industry?: string;
            company_size?: string;
            total_spend?: number;
            monthly_api_calls?: number;
            total_cost_savings?: number;
            active_projects?: number;
            [key: string]: any;
        }
    ): void {
        if (!this.isEnabled) {
            return;
        }

        try {
            const profileData: Record<string, any> = {
                name: properties.name,
                $updated: new Date().toISOString()
            };

            if (properties.created_at) {
                profileData.created_at = new Date(properties.created_at).toISOString();
            }
            if (properties.plan) profileData.plan = properties.plan;
            if (properties.total_members !== undefined) profileData.total_members = properties.total_members;
            if (properties.industry) profileData.industry = properties.industry;
            if (properties.company_size) profileData.company_size = properties.company_size;
            if (properties.total_spend !== undefined) profileData.total_spend = properties.total_spend;
            if (properties.monthly_api_calls !== undefined) profileData.monthly_api_calls = properties.monthly_api_calls;
            if (properties.total_cost_savings !== undefined) profileData.total_cost_savings = properties.total_cost_savings;
            if (properties.active_projects !== undefined) profileData.active_projects = properties.active_projects;

            // Set additional custom properties
            Object.keys(properties).forEach(key => {
                if (!['name', 'created_at', 'plan', 'total_members', 'industry', 'company_size', 
                      'total_spend', 'monthly_api_calls', 'total_cost_savings', 'active_projects'].includes(key)) {
                    profileData[key] = properties[key];
                }
            });

            (mixpanel as any).get_group(groupKey, groupId).set(profileData);
            console.debug('Group profile set:', groupKey, groupId, properties);
        } catch (error) {
            console.error('Error setting group profile:', error);
        }
    }

    /**
     * Track a group-level event
     */
    static trackGroupEvent(
        event: string,
        groupKey: string,
        groupId: string,
        properties?: Record<string, any>
    ): void {
        if (!this.isEnabled) {
            return;
        }

        try {
            mixpanel.track(event, {
                ...properties,
                [groupKey]: groupId,
                event_type: 'group_event',
                timestamp: new Date().toISOString()
            });
            console.debug('Group event tracked:', event, groupKey, groupId);
        } catch (error) {
            console.error('Error tracking group event:', error);
        }
    }

    /**
     * Add user to a group
     */
    static addUserToGroup(
        userId: string,
        groupKey: string,
        groupId: string,
        role?: string
    ): void {
        if (!this.isEnabled) {
            return;
        }

        try {
            // Set the group for the user
            this.setGroup(groupKey as 'company' | 'team' | 'project', groupId);

            // Track the event
            mixpanel.track('User Added to Group', {
                user_id: userId,
                group_key: groupKey,
                group_id: groupId,
                role: role,
                event_type: 'group_management',
                timestamp: new Date().toISOString()
            });

            // Update user profile
            mixpanel.people.set({
                [`${groupKey}_id`]: groupId,
                [`${groupKey}_role`]: role
            });

            console.debug('User added to group:', userId, groupKey, groupId, role);
        } catch (error) {
            console.error('Error adding user to group:', error);
        }
    }

    /**
     * Remove user from a group
     */
    static removeUserFromGroup(
        userId: string,
        groupKey: string,
        groupId: string
    ): void {
        if (!this.isEnabled) {
            return;
        }

        try {
            mixpanel.track('User Removed from Group', {
                user_id: userId,
                group_key: groupKey,
                group_id: groupId,
                event_type: 'group_management',
                timestamp: new Date().toISOString()
            });

            // Update user profile
            mixpanel.people.unset([`${groupKey}_id`, `${groupKey}_role`]);

            console.debug('User removed from group:', userId, groupKey, groupId);
        } catch (error) {
            console.error('Error removing user from group:', error);
        }
    }

    /**
     * Increment a group property
     */
    static incrementGroupProperty(
        groupKey: string,
        groupId: string,
        property: string,
        value: number = 1
    ): void {
        if (!this.isEnabled) {
            return;
        }

        try {
            const increment: Record<string, number> = {};
            increment[property] = value;
            (mixpanel as any).get_group(groupKey, groupId).set_once(increment);
            console.debug('Group property incremented:', groupKey, groupId, property, value);
        } catch (error) {
            console.error('Error incrementing group property:', error);
        }
    }

    /**
     * Track company/organization created
     */
    static trackCompanyCreated(
        companyId: string,
        companyName: string,
        properties?: {
            industry?: string;
            company_size?: string;
            plan?: string;
            created_by?: string;
        }
    ): void {
        this.setGroup('company', companyId);
        this.setGroupProfile('company', companyId, {
            name: companyName,
            created_at: new Date(),
            industry: properties?.industry,
            company_size: properties?.company_size,
            plan: properties?.plan || 'free',
            total_members: 1
        });

        mixpanel.track('Company Created', {
            company_id: companyId,
            company_name: companyName,
            ...properties,
            event_type: 'group_management',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track team created
     */
    static trackTeamCreated(
        teamId: string,
        teamName: string,
        companyId: string,
        properties?: {
            created_by?: string;
            department?: string;
        }
    ): void {
        this.setGroup('team', teamId);
        this.setGroupProfile('team', teamId, {
            name: teamName,
            created_at: new Date(),
            company_id: companyId,
            department: properties?.department,
            total_members: 1
        });

        mixpanel.track('Team Created', {
            team_id: teamId,
            team_name: teamName,
            company_id: companyId,
            ...properties,
            event_type: 'group_management',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Update group spending metrics
     */
    static updateGroupSpending(
        groupKey: string,
        groupId: string,
        amount: number,
        type: 'api_usage' | 'subscription' | 'add_on'
    ): void {
        this.incrementGroupProperty(groupKey, groupId, 'total_spend', amount);
        this.incrementGroupProperty(groupKey, groupId, `${type}_spend`, amount);
        
        mixpanel.track('Group Spending Updated', {
            group_key: groupKey,
            group_id: groupId,
            amount,
            spend_type: type,
            event_type: 'group_analytics',
            timestamp: new Date().toISOString()
        });
    }
}

// Export singleton-like interface
export const groupService = GroupService;

