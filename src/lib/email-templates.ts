/**
 * Shared email template for consistent branding across the application.
 * Uses simple template literals for maximum robustness and zero dependencies.
 */
interface EmailTemplateProps {
    title: string;
    body: string;
    ctaText: string;
    ctaUrl: string;
}

export const renderEmailTemplate = ({ title, body, ctaText, ctaUrl }: EmailTemplateProps): string => {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">${title}</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                ${body}
            </p>

            <a href="${ctaUrl}" 
               style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-bottom: 24px;">
                ${ctaText}
            </a>

            <p style="color: #64748b; font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
    `;
};
