// emailNotificationService.js - Handles sending email notifications for application decisions
import { supabase } from './supabase.js';

class EmailNotificationService {
  /**
   * Send acceptance email to applicant
   */
  async sendAcceptanceEmail(applicationId) {
    try {
      const { data: application, error: fetchError } = await supabase
        .from('internship_applications')
        .select(`
          id,
          applicant_email,
          students (
            profiles (
              display_name
            )
          ),
          internships (
            id,
            organization_id,
            position_title,
            location,
            min_duration,
            max_duration,
            work_type,
            compensation,
            organizations (
              company_name
            )
          )
        `)
        .eq('id', applicationId)
        .single();

      if (fetchError || !application) {
        console.error('Could not fetch application for acceptance email:', fetchError);
        return { success: false, error: 'Application not found' };
      }

      const studentName = application.students?.profiles?.display_name || 'Applicant';
      const studentEmail = application.applicant_email;
      const positionTitle = application.internships?.position_title || 'Internship Position';
      const companyName = application.internships?.organizations?.company_name || 'Our Organization';
      // Fetch primary contact email from organization_contacts table if available
      let contactEmail = 'info@internconnect.com';
      const orgId = application.internships?.organization_id;
      if (orgId) {
        try {
          const { data: orgContact, error: contactError } = await supabase
            .from('organization_contacts')
            .select('contact_email')
            .eq('organization_id', orgId)
            .eq('is_primary', true)
            .limit(1)
            .single();

          if (!contactError && orgContact?.contact_email) {
            contactEmail = orgContact.contact_email;
          }
        } catch (e) {
          // keep fallback
        }
      }
      const location = application.internships?.location || 'Not specified';
      const workType = application.internships?.work_type || 'Not specified';
      const minDuration = application.internships?.min_duration || 1;
      const maxDuration = application.internships?.max_duration || 3;
      const duration = minDuration === maxDuration ? `${minDuration} months` : `${minDuration}-${maxDuration} months`;
      const compensation = application.internships?.compensation || 'Not specified';

      if (!studentEmail) {
        console.warn('No email found for accepted applicant');
        return { success: false, error: 'No email address on file' };
      }

      // Log the acceptance email (in production, you'd send via email service like SendGrid, AWS SES, etc.)
      const emailContent = {
        to: studentEmail,
        subject: `🎉 Congratulations! Your Application for ${positionTitle} Has Been Accepted`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e; margin: 0;">🎉 Congratulations!</h1>
            </div>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #16a34a;">
                Dear ${studentName},
              </p>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: #166534;">
                We are pleased to inform you that your application has been <strong>ACCEPTED</strong>!
              </p>
            </div>

            <div style="background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #1e293b;">Position Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; font-weight: 600; color: #475569; width: 40%;">Position:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${positionTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; font-weight: 600; color: #475569;">Organization:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${companyName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; font-weight: 600; color: #475569;">Location:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${location}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; font-weight: 600; color: #475569;">Work Type:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${workType}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; font-weight: 600; color: #475569;">Duration:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${duration}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600; color: #475569;">Compensation:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${compensation}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 20px 0; padding: 20px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
              <h3 style="margin-top: 0; color: #1e40af;">Next Steps:</h3>
              <ol style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                <li style="margin: 8px 0;">Check your email for further instructions</li>
                <li style="margin: 8px 0;">Complete any onboarding requirements</li>
                <li style="margin: 8px 0;">Contact ${companyName} with any questions</li>
              </ol>
            </div>

            <div style="margin: 20px 0; padding: 20px; background: #fef3c7; border-radius: 8px; border: 1px solid #fed7aa;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Contact Information:</strong><br />
                ${companyName}<br />
                Email: <a href="mailto:${contactEmail}" style="color: #d97706; text-decoration: none;">${contactEmail}</a>
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
              <p style="margin: 0;">
                This is an automated message from Intern Connect.<br />
                Please do not reply to this email. Contact ${companyName} directly for inquiries.
              </p>
              <p style="margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} Intern Connect. All rights reserved.
              </p>
            </div>
          </div>
        `,
        plainText: `
Dear ${studentName},

Congratulations! Your application for the ${positionTitle} position at ${companyName} has been ACCEPTED!

Position Details:
- Position: ${positionTitle}
- Organization: ${companyName}
- Location: ${location}
- Work Type: ${workType}
- Duration: ${duration}
- Compensation: ${compensation}

Next Steps:
1. Check your email for further instructions
2. Complete any onboarding requirements
3. Contact ${companyName} with any questions

Contact Information:
${companyName}
Email: ${contactEmail}

Thank you,
Intern Connect Team
        `
      };

      // Log email for debugging
      console.log(`
        ===== ACCEPTANCE EMAIL =====
        To: ${studentEmail}
        Subject: ${emailContent.subject}
        Name: ${studentName}
        Position: ${positionTitle}
        Company: ${companyName}
        ============================
      `);

      // Store email notification in database (for audit trail) and capture id
      let insertedNotificationId = null;
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('email_notifications')
          .insert({
            application_id: applicationId,
            recipient_email: studentEmail,
            notification_type: 'acceptance',
            subject: emailContent.subject,
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.warn('Could not log email notification:', insertError);
        } else if (insertData && insertData.id) {
          insertedNotificationId = insertData.id;
        }
      } catch (insertError) {
        console.warn('Could not log email notification:', insertError);
      }

      // Attempt to send the email via serverless endpoint (Vercel). Update DB if send fails.
      try {
        const resp = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: studentEmail,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.plainText
          })
        });

        const result = await resp.json().catch(() => ({}));
        if (!resp.ok || !result.success) {
          const errMsg = (result && result.error) || `HTTP ${resp.status}`;
          console.warn('Email endpoint returned failure:', errMsg);
          if (insertedNotificationId) {
            try {
              await supabase
                .from('email_notifications')
                .update({ status: 'failed', error_message: String(errMsg) })
                .eq('id', insertedNotificationId);
            } catch (uErr) {
              console.warn('Could not update email notification status:', uErr);
            }
          }
        }
      } catch (sendErr) {
        console.error('Failed to call email endpoint:', sendErr);
        if (insertedNotificationId) {
          try {
            await supabase
              .from('email_notifications')
              .update({ status: 'failed', error_message: String(sendErr) })
              .eq('id', insertedNotificationId);
          } catch (uErr) {
            console.warn('Could not update email notification status:', uErr);
          }
        }
      }

      return {
        success: true,
        message: `Acceptance email sent to ${studentEmail}`,
        email: studentEmail
      };
    } catch (error) {
      console.error('Error sending acceptance email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send acceptance email'
      };
    }
  }

  /**
   * Send rejection email to applicant
   */
  async sendRejectionEmail(applicationId) {
    try {
      const { data: application, error: fetchError } = await supabase
        .from('internship_applications')
        .select(`
          id,
          applicant_email,
          students (
            profiles (
              display_name
            )
          ),
          internships (
            id,
            organization_id,
            position_title,
            organizations (
              company_name
            )
          )
        `)
        .eq('id', applicationId)
        .single();

      if (fetchError || !application) {
        console.error('Could not fetch application for rejection email:', fetchError);
        return { success: false, error: 'Application not found' };
      }

      const studentName = application.students?.profiles?.display_name || 'Applicant';
      const studentEmail = application.applicant_email;
      const positionTitle = application.internships?.position_title || 'Internship Position';
      const companyName = application.internships?.organizations?.company_name || 'Our Organization';
      // Fetch primary contact email from organization_contacts table if available
      let contactEmail = 'info@internconnect.com';
      const orgId = application.internships?.organization_id;
      if (orgId) {
        try {
          const { data: orgContact, error: contactError } = await supabase
            .from('organization_contacts')
            .select('contact_email')
            .eq('organization_id', orgId)
            .eq('is_primary', true)
            .limit(1)
            .single();

          if (!contactError && orgContact?.contact_email) {
            contactEmail = orgContact.contact_email;
          }
        } catch (e) {
          // keep fallback
        }
      }

      if (!studentEmail) {
        console.warn('No email found for rejected applicant');
        return { success: false, error: 'No email address on file' };
      }

      // Log the rejection email
      const emailContent = {
        to: studentEmail,
        subject: `Application Status: ${positionTitle} Position at ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e293b; margin: 0;">Application Status Update</h1>
            </div>

            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b;">
                Dear ${studentName},
              </p>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: #b91c1c;">
                Thank you for your interest in the <strong>${positionTitle}</strong> position.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 16px; color: #1e293b;">
                After careful review of your application, we have decided to move forward with other candidates who more closely match our current requirements.
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #1e293b;">
                <strong>We truly appreciate your effort and time in applying!</strong>
              </p>
            </div>

            <div style="margin: 20px 0; padding: 20px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
              <h3 style="margin-top: 0; color: #1e40af;">We Encourage You To:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                <li style="margin: 8px 0;">Continue developing your skills and expertise</li>
                <li style="margin: 8px 0;">Update your profile with new accomplishments</li>
                <li style="margin: 8px 0;">Explore other internship opportunities on our platform</li>
                <li style="margin: 8px 0;">Apply for future positions that align with your background</li>
              </ul>
            </div>

            <div style="margin: 20px 0; padding: 20px; background: #fef3c7; border-radius: 8px; border: 1px solid #fed7aa;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Questions?</strong><br />
                Feel free to contact ${companyName} directly at:<br />
                Email: <a href="mailto:${contactEmail}" style="color: #d97706; text-decoration: none;">${contactEmail}</a>
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
              <p style="margin: 0;">
                This is an automated message from Intern Connect.<br />
                Please do not reply to this email. Contact ${companyName} directly for inquiries.
              </p>
              <p style="margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} Intern Connect. All rights reserved.
              </p>
            </div>
          </div>
        `,
        plainText: `
Dear ${studentName},

Thank you for your interest in the ${positionTitle} position at ${companyName}.

After careful review of your application, we have decided to move forward with other candidates who more closely match our current requirements.

We truly appreciate your effort and time in applying!

We Encourage You To:
- Continue developing your skills and expertise
- Update your profile with new accomplishments
- Explore other internship opportunities on our platform
- Apply for future positions that align with your background

Questions?
Feel free to contact ${companyName} directly at:
Email: ${contactEmail}

Thank you,
Intern Connect Team
        `
      };

      // Log email for debugging
      console.log(`
        ===== REJECTION EMAIL =====
        To: ${studentEmail}
        Subject: ${emailContent.subject}
        Name: ${studentName}
        Position: ${positionTitle}
        Company: ${companyName}
        ===========================
      `);

      // Store email notification in database (for audit trail) and capture id
      let insertedNotificationId = null;
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('email_notifications')
          .insert({
            application_id: applicationId,
            recipient_email: studentEmail,
            notification_type: 'rejection',
            subject: emailContent.subject,
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.warn('Could not log email notification:', insertError);
        } else if (insertData && insertData.id) {
          insertedNotificationId = insertData.id;
        }
      } catch (insertError) {
        console.warn('Could not log email notification:', insertError);
      }

      // Attempt to send the email via serverless endpoint (Vercel). Update DB if send fails.
      try {
        const resp = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: studentEmail,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.plainText
          })
        });

        const result = await resp.json().catch(() => ({}));
        if (!resp.ok || !result.success) {
          const errMsg = (result && result.error) || `HTTP ${resp.status}`;
          console.warn('Email endpoint returned failure:', errMsg);
          if (insertedNotificationId) {
            try {
              await supabase
                .from('email_notifications')
                .update({ status: 'failed', error_message: String(errMsg) })
                .eq('id', insertedNotificationId);
            } catch (uErr) {
              console.warn('Could not update email notification status:', uErr);
            }
          }
        }
      } catch (sendErr) {
        console.error('Failed to call email endpoint:', sendErr);
        if (insertedNotificationId) {
          try {
            await supabase
              .from('email_notifications')
              .update({ status: 'failed', error_message: String(sendErr) })
              .eq('id', insertedNotificationId);
          } catch (uErr) {
            console.warn('Could not update email notification status:', uErr);
          }
        }
      }

      return {
        success: true,
        message: `Rejection email sent to ${studentEmail}`,
        email: studentEmail
      };
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send rejection email'
      };
    }
  }

  /**
   * Get email notification history for an application
   */
  async getEmailNotificationHistory(applicationId) {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('application_id', applicationId)
        .order('sent_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        notifications: data || []
      };
    } catch (error) {
      console.error('Error fetching email notification history:', error);
      return {
        success: false,
        notifications: [],
        error: error.message
      };
    }
  }
}

const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
