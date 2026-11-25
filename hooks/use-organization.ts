import { useState, useEffect } from 'react';
import { Organization } from '@/types/organization';
import { OrganizationService } from '@/services/organization.service';

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      // 1. Try local storage first
      const cached = localStorage.getItem('zelixa_organization');
      if (cached) {
        try {
          setOrganization(JSON.parse(cached));
          setLoading(false);
          // Optional: Re-fetch in background to update cache if needed
        } catch (e) {
          localStorage.removeItem('zelixa_organization');
        }
      }

      // 2. Fetch from API if not cached or always refresh in background
      try {
        const data = await OrganizationService.get();
        setOrganization(data);
        localStorage.setItem('zelixa_organization', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch organization data', error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchOrg();
    }
  }, []);

  return { organization, loading };
}
