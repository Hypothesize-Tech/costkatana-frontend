import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice } from '../../types/subscription.types';
import { User } from '../../types/auth.types';
import { Subscription } from '../../types/subscription.types';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2px solid #06ec9e',
        paddingBottom: 20,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#06ec9e',
        marginBottom: 5,
    },
    companyInfo: {
        fontSize: 10,
        color: '#666666',
        marginTop: 5,
    },
    invoiceTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        fontSize: 10,
    },
    label: {
        color: '#666666',
        width: '40%',
    },
    value: {
        color: '#0f172a',
        fontWeight: 'bold',
        width: '60%',
        textAlign: 'right',
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#06ec9e',
        padding: 10,
        borderRadius: 4,
    },
    tableHeaderText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottom: '1px solid #e5e7eb',
    },
    tableCell: {
        fontSize: 10,
        color: '#0f172a',
    },
    colDescription: {
        width: '40%',
    },
    colQuantity: {
        width: '15%',
        textAlign: 'center',
    },
    colPrice: {
        width: '20%',
        textAlign: 'right',
    },
    colTotal: {
        width: '25%',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    totals: {
        marginTop: 20,
        paddingTop: 20,
        borderTop: '2px solid #e5e7eb',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontSize: 11,
    },
    totalLabel: {
        color: '#666666',
    },
    totalValue: {
        color: '#0f172a',
        fontWeight: 'bold',
    },
    grandTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#06ec9e',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid #e5e7eb',
    },
    statusBadge: {
        backgroundColor: '#06ec9e',
        color: '#ffffff',
        padding: 5,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 60,
    },
    footer: {
        marginTop: 40,
        paddingTop: 20,
        borderTop: '1px solid #e5e7eb',
        fontSize: 9,
        color: '#666666',
        textAlign: 'center',
    },
});

interface InvoicePDFProps {
    invoice: Invoice;
    user: User;
    subscription: Subscription;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, user, subscription }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: invoice.currency || 'USD',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return '#22c55e';
            case 'pending':
                return '#eab308';
            case 'failed':
                return '#ef4444';
            default:
                return '#06ec9e';
        }
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>Cost Katana</Text>
                    <Text style={styles.companyInfo}>AI Cost Optimization Platform</Text>
                    <Text style={styles.companyInfo}>support@costkatana.com</Text>
                    <Text style={styles.invoiceTitle}>Invoice</Text>
                </View>

                {/* Invoice Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Invoice Details</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Invoice Number:</Text>
                        <Text style={styles.value}>{invoice.invoiceNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Issue Date:</Text>
                        <Text style={styles.value}>{formatDate(invoice.createdAt)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Due Date:</Text>
                        <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Status:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                            <Text style={{ color: '#ffffff' }}>{invoice.status.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* Billing Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill To</Text>
                    <Text style={{ fontSize: 10, color: '#0f172a', marginBottom: 3 }}>{user.name}</Text>
                    <Text style={{ fontSize: 10, color: '#666666', marginBottom: 3 }}>{user.email}</Text>
                </View>

                {/* Line Items */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
                        <Text style={[styles.tableHeaderText, styles.colQuantity]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
                        <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
                    </View>
                    {invoice.lineItems?.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
                            <Text style={[styles.tableCell, styles.colQuantity]}>{item.quantity}</Text>
                            <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.amount)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
                    </View>
                    {invoice.lineItems?.some(item => item.type === 'discount') && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Discount:</Text>
                            <Text style={styles.totalValue}>
                                -{formatCurrency(Math.abs(invoice.lineItems.find(item => item.type === 'discount')?.amount || 0))}
                            </Text>
                        </View>
                    )}
                    {invoice.tax > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tax:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(invoice.tax)}</Text>
                        </View>
                    )}
                    <View style={[styles.totalRow, styles.grandTotal]}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={[styles.totalValue, { color: '#06ec9e' }]}>{formatCurrency(invoice.total)}</Text>
                    </View>
                </View>

                {/* Payment Information */}
                {invoice.paymentDate && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Information</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Payment Date:</Text>
                            <Text style={styles.value}>{formatDate(invoice.paymentDate)}</Text>
                        </View>
                        {invoice.paymentMethodUsed?.paymentGateway && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Payment Method:</Text>
                                <Text style={styles.value}>
                                    {invoice.paymentMethodUsed.paymentGateway.charAt(0).toUpperCase() + invoice.paymentMethodUsed.paymentGateway.slice(1)}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for using Cost Katana!</Text>
                    <Text style={{ marginTop: 5 }}>
                        For questions about this invoice, please contact support@costkatana.com
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

