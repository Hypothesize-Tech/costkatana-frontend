import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BillingService } from '../../services/billing.service';
import { PDFService } from '../../services/pdf.service';
import { Invoice } from '../../types/subscription.types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { BillingHistoryShimmer } from '../shimmer/BillingHistoryShimmer';
import {
    DocumentArrowDownIcon,
    DocumentTextIcon,
    EyeIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

export const BillingHistory: React.FC = () => {
    const { user } = useAuth();
    const { showNotification } = useNotifications();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: invoicesData, isLoading, error: invoicesError } = useQuery(
        ['invoices', page],
        () => BillingService.getInvoices({ page, limit }),
        {
            keepPreviousData: true,
            retry: 2,
            onSuccess: (data) => {
                console.log('Invoices data received:', data);
            },
            onError: (error: unknown) => {
                console.error('Error fetching invoices:', error);
                const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load billing history';
                showNotification(errorMessage, 'error');
            },
        }
    );

    const handleDownloadInvoice = async (invoice: Invoice) => {
        try {
            if (!user) {
                showNotification('User information not available', 'error');
                return;
            }

            // Get subscription for invoice context
            const { SubscriptionService } = await import('../../services/subscription.service');
            const subscription = await SubscriptionService.getSubscription();

            await PDFService.downloadInvoicePDF(invoice, user, subscription);
            showNotification('Invoice downloaded successfully', 'success');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            showNotification('Failed to download invoice', 'error');
        }
    };

    const handlePreviewInvoice = async (invoice: Invoice) => {
        try {
            if (!user) {
                showNotification('User information not available', 'error');
                return;
            }

            const { SubscriptionService } = await import('../../services/subscription.service');
            const subscription = await SubscriptionService.getSubscription();

            await PDFService.previewInvoicePDF(invoice, user, subscription);
        } catch (error) {
            console.error('Error previewing invoice:', error);
            showNotification('Failed to preview invoice', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            paid: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CheckCircleIcon className="w-4 h-4" />
                    Paid
                </span>
            ),
            pending: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <ClockIcon className="w-4 h-4" />
                    Pending
                </span>
            ),
            failed: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <XCircleIcon className="w-4 h-4" />
                    Failed
                </span>
            ),
            refunded: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    Refunded
                </span>
            ),
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    if (isLoading) {
        return <BillingHistoryShimmer />;
    }

    if (invoicesError) {
        return (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                        Billing History
                    </h2>
                </div>
                <div className="card p-8 sm:p-10 md:p-12 text-center">
                    <p className="text-sm sm:text-base text-danger-500 mb-4">
                        Error loading billing history
                    </p>
                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {((invoicesError as { response?: { data?: { message?: string } } })?.response?.data?.message) || 'Please try again later'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                    Billing History
                </h2>
            </div>

            {!invoicesData || invoicesData.invoices.length === 0 ? (
                <div className="card p-8 sm:p-10 md:p-12 text-center">
                    <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                    <p className="text-sm sm:text-base font-semibold text-light-text dark:text-dark-text mb-2">
                        No invoices found
                    </p>
                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {user?.subscription?.plan === 'enterprise'
                            ? 'Enterprise subscriptions may not have invoices if they were manually created. Contact support if you need an invoice.'
                            : 'Your invoices will appear here once you have billing activity.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto -mx-4 sm:-mx-6 md:mx-0">
                            <div className="inline-block min-w-full align-middle px-4 sm:px-6 md:px-0">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-light-bg-secondary dark:bg-dark-bg-secondary">
                                        <tr>
                                            <th className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                                Invoice
                                            </th>
                                            <th className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 text-right text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary-200/10 dark:divide-primary-800/10">
                                        {invoicesData.invoices.map((invoice) => (
                                            <tr
                                                key={invoice.id}
                                                className="hover:bg-light-bg-secondary/50 dark:hover:bg-dark-bg-secondary/50 transition-colors"
                                            >
                                                <td className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 whitespace-nowrap">
                                                    <div className="text-xs sm:text-sm font-medium text-light-text dark:text-dark-text">
                                                        {invoice.invoiceNumber}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 whitespace-nowrap text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 whitespace-nowrap">
                                                    <div className="text-xs sm:text-sm font-semibold text-light-text dark:text-dark-text">
                                                        {invoice.currency} {invoice.total.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 whitespace-nowrap">
                                                    {getStatusBadge(invoice.status)}
                                                </td>
                                                <td className="px-3 py-2.5 sm:py-3 sm:px-4 md:px-6 md:py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                        <button
                                                            onClick={() => handlePreviewInvoice(invoice)}
                                                            className="p-1.5 sm:p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
                                                            title="Preview Invoice"
                                                        >
                                                            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadInvoice(invoice)}
                                                            className="p-1.5 sm:p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
                                                            title="Download Invoice"
                                                        >
                                                            <DocumentArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {invoicesData.total > limit && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                            <div className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary text-center sm:text-left">
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, invoicesData.total)} of{' '}
                                {invoicesData.total} invoices
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-outline text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page * limit >= invoicesData.total}
                                    className="btn-outline text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

