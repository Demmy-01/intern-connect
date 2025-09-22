import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import organizationProfileService from '../lib/OrganizationProfileService';

const useVerificationStatus = () => {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orgData = await organizationProfileService.getOrganizationByUserId(user.id);
        setVerificationStatus(orgData?.verification_status || null);
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [user]);

  const isVerified = verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending';
  const isRejected = verificationStatus === 'rejected';

  const getRestrictionMessage = () => {
    if (isPending) {
      return {
        title: 'Verification Pending',
        message: 'Your organization profile is under review. Update your profile, you will receive an email notification once verification is complete. This process typically takes 1-2 business days.',
        type: 'warning'
      };
    }

    if (isRejected) {
      return {
        title: 'Verification Failed',
        message: 'Your organization verification was unsuccessful. Please contact support for re-verification.',
        type: 'error'
      };
    }

    return null;
  };

  return {
    verificationStatus,
    isVerified,
    isPending,
    isRejected,
    loading,
    error,
    restrictionMessage: getRestrictionMessage(),
    canPostInternships: isVerified
  };
};

export default useVerificationStatus;
