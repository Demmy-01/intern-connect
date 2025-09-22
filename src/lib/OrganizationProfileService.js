import { supabase } from './supabase.js';

class OrganizationProfileService {
  constructor() {
    this.supabase = supabase;
  }

  // Helper method to get current user
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Create organization profile during onboarding
  async createOrganization(organizationData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('organizations')
        .insert([{
          id: user.id,
          company_name: organizationData.companyName,
          company_type: organizationData.companyType,
          industry: organizationData.industry,
          company_description: organizationData.companyDescription,
          location: organizationData.location,
          company_size: organizationData.companySize,
          branches: organizationData.branches,
          website: organizationData.website,
          linkedin_profile: organizationData.linkedinProfile,
          verification_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async uploadLogo(file) {
  try {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Validate file size (5MB limit for images)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please upload JPG, PNG, or WebP images only.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    console.log('Uploading logo to Supabase:', fileName);

    // Remove existing logo if it exists
    const { data: existingFiles } = await this.supabase.storage
      .from('avatars')
      .list(`${user.id}`, { search: 'logo.' });

    if (existingFiles && existingFiles.length > 0) {
      for (const fileObj of existingFiles) {
        if (fileObj.name.startsWith('logo.')) {
          await this.supabase.storage.from('avatars').remove([`${user.id}/${fileObj.name}`]);
          console.log('Removed existing logo:', fileObj.name);
        }
      }
    }
    
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('Logo uploaded successfully:', data);

    // Get the public URL
    const { data: { publicUrl } } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error('Failed to get logo URL');
    }

    console.log('Logo public URL:', publicUrl);

    // Update organization record with logo URL
    const { data: orgData, error: updateError } = await this.supabase
      .from('organizations')
      .update({ logo_url: publicUrl })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
}


  // Get organization profile by user ID
  async getOrganizationByUserId(userId) {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          *,
          organization_contacts (*)
        `)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      // Format contact data to match expected structure
      if (data && data.organization_contacts && data.organization_contacts.length > 0) {
        data.contact = data.organization_contacts[0];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  }

  // Get organization profile by organization ID
  async getOrganizationById(orgId) {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          *,
          organization_contacts (*),
          organization_documents (*),
          organization_compliance (*)
        `)
        .eq('id', orgId)
        .single();

      if (error) throw error;

      // Format contact data to match expected structure
      if (data.organization_contacts && data.organization_contacts.length > 0) {
        data.contact = data.organization_contacts[0];
      }

      return data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  }

  // Update organization profile
  async updateOrganization(orgId, updateData) {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .update({
          company_name: updateData.company_name,
          company_type: updateData.company_type,
          location: updateData.location,
          company_description: updateData.company_description,
          industry: updateData.industry,
          company_size: updateData.company_size,
          branches: updateData.branches,
          linkedin_profile: updateData.linkedin_profile,
          website: updateData.website,
          address: updateData.address,
          logo_url: updateData.logo_url
        })
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  // Upload organization document
  async uploadDocument(orgId, documentType, file) {
    try {
      // First upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${orgId}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('organization-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('organization-documents')
        .getPublicUrl(fileName);

      // Save document record to database
      const { data, error } = await this.supabase
        .from('organization_documents')
        .insert([{
          organization_id: orgId,
          document_type: documentType,
          document_name: file.name,
          document_url: publicUrl,
          file_size: file.size,
          mime_type: file.type
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get organization documents
  async getOrganizationDocuments(orgId) {
    try {
      const { data, error } = await this.supabase
        .from('organization_documents')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  // Update compliance status
  async updateCompliance(orgId, complianceData) {
    try {
      // First check if compliance record exists
      const { data: existingCompliance } = await this.supabase
        .from('organization_compliance')
        .select('id')
        .eq('organization_id', orgId)
        .single();

      let result;
      if (existingCompliance) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('organization_compliance')
          .update({
            terms_accepted: complianceData.terms_accepted,
            terms_accepted_at: complianceData.terms_accepted ? new Date().toISOString() : null,
            guidelines_accepted: complianceData.guidelines_accepted,
            guidelines_accepted_at: complianceData.guidelines_accepted ? new Date().toISOString() : null,
            privacy_policy_accepted: complianceData.privacy_policy_accepted,
            privacy_policy_accepted_at: complianceData.privacy_policy_accepted ? new Date().toISOString() : null
          })
          .eq('organization_id', orgId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new record
        const { data, error } = await this.supabase
          .from('organization_compliance')
          .insert([{
            organization_id: orgId,
            terms_accepted: complianceData.terms_accepted,
            terms_accepted_at: complianceData.terms_accepted ? new Date().toISOString() : null,
            guidelines_accepted: complianceData.guidelines_accepted,
            guidelines_accepted_at: complianceData.guidelines_accepted ? new Date().toISOString() : null,
            privacy_policy_accepted: complianceData.privacy_policy_accepted,
            privacy_policy_accepted_at: complianceData.privacy_policy_accepted ? new Date().toISOString() : null
          }])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error updating compliance:', error);
      throw error;
    }
  }

  // Add/Update contact person
  async updateContact(orgId, contactData) {
    try {
      // First check if contact exists
      const { data: existingContact } = await this.supabase
        .from('organization_contacts')
        .select('id')
        .eq('organization_id', orgId)
        .eq('is_primary', true)
        .single();

      let result;
      if (existingContact) {
        // Update existing contact
        const { data, error } = await this.supabase
          .from('organization_contacts')
          .update({
            contact_name: contactData.contactName,
            contact_role: contactData.contactRole,
            contact_email: contactData.contactEmail,
            contact_phone: contactData.contactPhone
          })
          .eq('id', existingContact.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new contact
        const { data, error } = await this.supabase
          .from('organization_contacts')
          .insert([{
            organization_id: orgId,
            contact_name: contactData.contactName,
            contact_role: contactData.contactRole,
            contact_email: contactData.contactEmail,
            contact_phone: contactData.contactPhone,
            is_primary: true
          }])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  // Complete onboarding process
  // Helper to convert company size string range to integer (minimum value)
  convertCompanySizeToInt(sizeStr) {
    if (!sizeStr) return null;
    const match = sizeStr.match(/^(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  async completeOnboarding(onboardingData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Starting onboarding for user:', user.id);

      // Convert company size string range to integer
      const companySizeInt = this.convertCompanySizeToInt(onboardingData.companySize);

      // Start by creating the organization
      const { data: organization, error: orgError } = await this.supabase
        .from('organizations')
        .insert([{
          id: user.id,
          company_name: onboardingData.companyName,
          company_type: onboardingData.companyType,
          industry: onboardingData.industry,
          company_description: onboardingData.companyDescription,
          location: onboardingData.location,
          company_size: companySizeInt,
          verification_status: 'pending'
        }])
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('Organization created:', organization);

      // Create contact
      try {
        await this.updateContact(organization.id, {
          contactName: onboardingData.contactName,
          contactRole: onboardingData.contactRole,
          contactEmail: onboardingData.contactEmail,
          contactPhone: onboardingData.contactPhone
        });
        console.log('Contact created successfully');
      } catch (contactError) {
        console.error('Contact creation error:', contactError);
        // Continue with onboarding even if contact fails
      }

      // Create compliance record
      try {
        await this.updateCompliance(organization.id, {
          terms_accepted: onboardingData.termsAccepted,
          guidelines_accepted: onboardingData.guidelinesAccepted
        });
        console.log('Compliance record created successfully');
      } catch (complianceError) {
        console.error('Compliance creation error:', complianceError);
        // Continue with onboarding even if compliance fails
      }

      // Create document records if document URLs are provided
      if (onboardingData.cacDocument) {
        try {
          const { data: cacDocRecord, error: cacDocError } = await this.supabase
            .from('organization_documents')
            .insert([{
              organization_id: organization.id,
              document_type: 'cac_certificate',
              document_name: 'CAC Certificate',
              document_url: onboardingData.cacDocument,
              file_size: 0, // We don't have the file size here
              mime_type: 'application/pdf' // Default assumption
            }])
            .select()
            .single();

          if (cacDocError) {
            console.error('CAC document record error:', cacDocError);
          } else {
            console.log('CAC document record created:', cacDocRecord);
          }
        } catch (docError) {
          console.error('Document creation error:', docError);
        }
      }

      if (onboardingData.businessPermit) {
        try {
          const { data: permitDocRecord, error: permitDocError } = await this.supabase
            .from('organization_documents')
            .insert([{
              organization_id: organization.id,
              document_type: 'business_permit',
              document_name: 'Business Permit',
              document_url: onboardingData.businessPermit,
              file_size: 0,
              mime_type: 'application/pdf'
            }])
            .select()
            .single();

          if (permitDocError) {
            console.error('Business permit document record error:', permitDocError);
          } else {
            console.log('Business permit document record created:', permitDocRecord);
          }
        } catch (docError) {
          console.error('Document creation error:', docError);
        }
      }

      return organization;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Upload files (for CAC document, business permit, etc.)
  async uploadFile(file, uploadType = 'document') {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload PDF, JPG, or PNG files only.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uploadType}_${Date.now()}.${fileExt}`;

      console.log('Uploading file to Supabase:', fileName);

      // Check if file already exists and remove it
      const { data: existingFiles } = await this.supabase.storage
        .from('uploads')
        .list(`${user.id}`, { search: `${uploadType}_` });

      if (existingFiles && existingFiles.length > 0) {
        for (const fileObj of existingFiles) {
          if (fileObj.name.startsWith(`${uploadType}_`)) {
            await this.supabase.storage.from('uploads').remove([`${user.id}/${fileObj.name}`]);
            console.log('Removed existing file:', fileObj.name);
          }
        }
      }
      
      const { data, error } = await this.supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('File uploaded successfully:', data);

      // Get the public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to get file URL');
      }

      console.log('File public URL:', publicUrl);

      return {
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get verification status
  async getVerificationStatus(orgId) {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select('verification_status, verification_notes')
        .eq('id', orgId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching verification status:', error);
      throw error;
    }
  }

  // Search organizations (for admin use)
  async searchOrganizations(query = '', status = '', page = 1, limit = 10) {
    try {
      let queryBuilder = this.supabase
        .from('organizations')
        .select('*', { count: 'exact' });

      // Add search conditions
      if (query) {
        queryBuilder = queryBuilder.ilike('company_name', `%${query}%`);
      }
      
      if (status) {
        queryBuilder = queryBuilder.eq('verification_status', status);
      }

      // Add pagination
      const from = (page - 1) * limit;
      queryBuilder = queryBuilder.range(from, from + limit - 1);

      const { data, error, count } = await queryBuilder;
      
      if (error) throw error;

      return {
        data,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error searching organizations:', error);
      throw error;
    }
  }

  // Update verification status (admin only)
  async updateVerificationStatus(orgId, status, notes = '') {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .update({
          verification_status: status,
          verification_notes: notes
        })
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }

  // Replace the existing public methods in your OrganizationProfileService.js with these corrected versions:

  async getPublicOrganizationById(organizationId) {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          *,
          organization_contacts(*)
        `)
        .eq('id', organizationId)
        .single(); // Remove verification filter for now to debug

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Raw organization data:', data); // Debug log

      // Format contact data to match expected structure
      if (data && data.organization_contacts && data.organization_contacts.length > 0) {
        data.contact = {
          contact_name: data.organization_contacts[0].contact_name,
          contact_role: data.organization_contacts[0].contact_role,
          contact_email: data.organization_contacts[0].contact_email,
          contact_phone: data.organization_contacts[0].contact_phone
        };
      }

      console.log('Processed organization data:', data); // Debug log

      return data;
    } catch (error) {
      console.error('Error fetching public organization:', error);
      throw error;
    }
  }

  /**
   * Get all organizations (public view - only verified ones)
   */
  async getPublicOrganizations() {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          id,
          company_name,
          industry,
          location,
          logo_url,
          company_description,
          company_size,
          company_type,
          website,
          linkedin_profile,
          verification_status
        `)
        .eq('verification_status', 'verified')
        .order('company_name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching public organizations:', error);
      throw error;
    }
  }

  /**
   * Get active internships for a specific organization
   */
  async getOrganizationInternships(organizationId) {
    try {
      console.log('Fetching internships for organization:', organizationId); // Debug log

      const { data, error } = await this.supabase
        .from('internships')
        .select(`
          id,
          position_title,
          department,
          location,
          work_type,
          compensation,
          min_duration,
          max_duration,
          description,
          status,
          created_at
        `)
        .eq('organization_id', organizationId)
        .in('status', ['active', 'open']) // Try both status values
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Internships query error:', error);
        throw new Error(error.message);
      }

      console.log('Fetched internships data:', data); // Debug log
      return data || [];
    } catch (error) {
      console.error('Error fetching organization internships:', error);
      throw error;
    }
  }

  /**
   * Alternative method if you want to show all organizations (including unverified)
   * but with a clear indication of verification status
   */
  async getAllPublicOrganizations() {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          id,
          company_name,
          industry,
          location,
          logo_url,
          company_description,
          company_size,
          company_type,
          website,
          linkedin_profile,
          verification_status
        `)
        .order('company_name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all public organizations:', error);
      throw error;
    }
  }

  /**
   * Get organization profile by ID without verification restriction
   * (use this if you want to show unverified organizations with a warning)
   */
  async getAnyOrganizationById(organizationId) {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          *,
          organization_contacts(*)
        `)
        .eq('id', organizationId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Format contact data to match expected structure
      if (data && data.organization_contacts && data.organization_contacts.length > 0) {
        data.contact = {
          contact_name: data.organization_contacts[0].contact_name,
          contact_role: data.organization_contacts[0].contact_role,
          contact_email: data.organization_contacts[0].contact_email,
          contact_phone: data.organization_contacts[0].contact_phone
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  }
}

const organizationProfileService = new OrganizationProfileService();
export default organizationProfileService;