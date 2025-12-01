import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '../components/subscription/InvoicePDF';
import { Invoice } from '../types/subscription.types';
import { User } from '../types/auth.types';
import { Subscription } from '../types/subscription.types';

/**
 * PDF Service for generating invoices using @react-pdf/renderer
 * Matches app theme with glass morphism design elements
 */
export class PDFService {
    /**
     * Generate invoice PDF and return as blob URL
     */
    static async getInvoicePDFDataURL(
        invoice: Invoice,
        user: User,
        subscription: Subscription
    ): Promise<string> {
        try {
            const doc = <InvoicePDF invoice={invoice} user={user} subscription={subscription} />;
            const blob = await pdf(doc).toBlob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error generating invoice PDF:', error);
            throw error;
        }
    }

    /**
     * Download invoice PDF
     */
    static async downloadInvoicePDF(
        invoice: Invoice,
        user: User,
        subscription: Subscription
    ): Promise<void> {
        try {
            const doc = <InvoicePDF invoice={invoice} user={user} subscription={subscription} />;
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading invoice PDF:', error);
            throw error;
        }
    }

    /**
     * Preview invoice PDF in new window
     */
    static async previewInvoicePDF(
        invoice: Invoice,
        user: User,
        subscription: Subscription
    ): Promise<void> {
        try {
            const dataUrl = await this.getInvoicePDFDataURL(invoice, user, subscription);
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(
                    `<iframe width="100%" height="100%" src="${dataUrl}"></iframe>`
                );
            }
        } catch (error) {
            console.error('Error previewing invoice PDF:', error);
            throw error;
        }
    }
}

