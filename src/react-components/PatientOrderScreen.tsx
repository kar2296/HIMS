import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export type OrderCategory = 'LAB' | 'RADIOLOGY' | 'DIAGNOSTIC' | 'CONSULT' | 'PROCEDURE';
export type OrderPriority = 'STAT' | 'URGENT' | 'ROUTINE';
export type OrderStatus = 'ORDERED' | 'SAMPLE_COLLECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ClinicalOrderItem {
    id: number | string;
    patientId: number | string;
    encounterId?: number | string;
    category: OrderCategory;
    orderName: string;
    orderCode?: string;
    priority: OrderPriority;
    status: OrderStatus;
    orderedDate: string;
    orderedBy?: string;
    clinicalIndication: string;
    specialInstructions?: string;
    resultsSummary?: string;
    completedDate?: string;
}

export interface PatientOrderScreenProps {
    patientId: number | string;
    patientName?: string;
    encounterId?: number | string;
    orders?: ClinicalOrderItem[];
    onPlaceOrder?: (order: Omit<ClinicalOrderItem, 'id' | 'orderedDate' | 'status'>) => void;
    onCancelOrder?: (id: number | string, reason?: string) => void;
    onViewResults?: (order: ClinicalOrderItem) => void;
    onClose?: () => void;
}

export const COMMON_TEST_CATALOG: Array<{ category: OrderCategory; code: string; name: string }> = [
    // LAB
    { category: 'LAB', code: 'CBC', name: 'Complete Blood Count (CBC)' },
    { category: 'LAB', code: 'BMP', name: 'Basic Metabolic Panel (BMP)' },
    { category: 'LAB', code: 'LFT', name: 'Liver Function Tests (LFT)' },
    { category: 'LAB', code: 'RFT', name: 'Renal Function Tests / Creatinine' },
    { category: 'LAB', code: 'HBA1C', name: 'Hemoglobin A1c (HbA1c)' },
    { category: 'LAB', code: 'LIPID', name: 'Lipid Profile' },
    { category: 'LAB', code: 'URINE_R', name: 'Urinalysis Routine & Microscopy' },
    { category: 'LAB', code: 'TROP_I', name: 'Troponin-I (High Sensitivity)' },
    // RADIOLOGY
    { category: 'RADIOLOGY', code: 'CXR_PA', name: 'Chest X-Ray PA View' },
    { category: 'RADIOLOGY', code: 'USG_ABD', name: 'Ultrasound Abdomen & Pelvis' },
    { category: 'RADIOLOGY', code: 'CT_BRAIN', name: 'CT Brain Plain' },
    { category: 'RADIOLOGY', code: 'MRI_LS', name: 'MRI Lumbo-Sacral Spine' },
    // DIAGNOSTIC
    { category: 'DIAGNOSTIC', code: 'ECG_12', name: '12-Lead Electrocardiogram (ECG)' },
    { category: 'DIAGNOSTIC', code: 'ECHO_2D', name: '2D Echocardiography with Doppler' },
    // CONSULT
    { category: 'CONSULT', code: 'CONS_CARD', name: 'Cardiology Consultation' },
    { category: 'CONSULT', code: 'CONS_NEURO', name: 'Neurology Consultation' },
    { category: 'CONSULT', code: 'CONS_ENDO', name: 'Endocrinology Consultation' },
];

export const PatientOrderScreen: React.FC<PatientOrderScreenProps> = ({
    patientId,
    patientName,
    encounterId,
    orders = [],
    onPlaceOrder,
    onCancelOrder,
    onViewResults,
    onClose,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | OrderCategory>('ALL');
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<ClinicalOrderItem | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ClinicalOrderItem | null>(null);

    // Form state
    const [category, setCategory] = useState<OrderCategory>('LAB');
    const [orderName, setOrderName] = useState('');
    const [orderCode, setOrderCode] = useState('');
    const [priority, setPriority] = useState<OrderPriority>('ROUTINE');
    const [clinicalIndication, setClinicalIndication] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSelectCatalogItem = (item: { category: OrderCategory; code: string; name: string }) => {
        setCategory(item.category);
        setOrderCode(item.code);
        setOrderName(item.name);
    };

    const handleSaveOrder = () => {
        if (!orderName.trim()) {
            setValidationError('Order name or test selection is required.');
            return;
        }
        if (!clinicalIndication.trim()) {
            setValidationError('Clinical indication / reason for order is required.');
            return;
        }

        if (onPlaceOrder) {
            onPlaceOrder({
                patientId,
                encounterId,
                category,
                orderName: orderName.trim(),
                orderCode: orderCode.trim() || undefined,
                priority,
                clinicalIndication: clinicalIndication.trim(),
                specialInstructions: specialInstructions.trim() || undefined,
            });
        }

        // Reset
        setCategory('LAB');
        setOrderName('');
        setOrderCode('');
        setPriority('ROUTINE');
        setClinicalIndication('');
        setSpecialInstructions('');
        setValidationError('');
        setIsAddModalOpen(false);
    };

    const getPriorityTone = (p: OrderPriority): 'danger' | 'warning' | 'neutral' => {
        switch (p) {
            case 'STAT': return 'danger';
            case 'URGENT': return 'warning';
            default: return 'neutral';
        }
    };

    const getStatusTone = (s: OrderStatus): 'info' | 'warning' | 'success' | 'danger' | 'neutral' => {
        switch (s) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'info';
            case 'SAMPLE_COLLECTED': return 'info';
            case 'ORDERED': return 'warning';
            case 'CANCELLED': return 'danger';
            default: return 'neutral';
        }
    };

    const filteredOrders = orders.filter(o => {
        if (activeTab === 'ALL') return true;
        return o.category === activeTab;
    });

    const statOrdersCount = orders.filter(o => o.priority === 'STAT' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Clinical Orders Entry (CPOE)</h1>
                        {statOrdersCount > 0 && (
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {statOrdersCount} STAT ORDER{statOrdersCount > 1 ? 'S' : ''} PENDING
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        {patientName ? `Patient: ${patientName}` : `Patient ID: ${patientId}`}
                        {encounterId ? ` • Encounter: ${encounterId}` : ''}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm shadow-sm flex items-center gap-1.5"
                    >
                        <span>+</span>
                        <span>Place New Order</span>
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>

            {/* Category Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-3 rounded-t-lg">
                {(['ALL', 'LAB', 'RADIOLOGY', 'DIAGNOSTIC', 'CONSULT'] as const).map((tab) => {
                    const count = tab === 'ALL' ? orders.length : orders.filter(o => o.category === tab).length;
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'ALL' ? 'All Orders' : tab} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Orders Table */}
            <Card title={`Orders List (${filteredOrders.length})`}>
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No clinical orders found in this category. Click &quot;Place New Order&quot; to create one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Priority</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Order / Test</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Indication</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date/Time</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.map((ord) => (
                                    <tr key={ord.id} className={`hover:bg-gray-50 ${ord.priority === 'STAT' && ord.status !== 'COMPLETED' ? 'bg-red-50/40' : ''}`}>
                                        <td className="px-4 py-3">
                                            <Badge tone={getPriorityTone(ord.priority)}>
                                                {ord.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">{ord.orderName}</div>
                                            {ord.orderCode && (
                                                <span className="text-xs font-mono text-gray-500">{ord.orderCode}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 font-medium">
                                            {ord.category}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={ord.clinicalIndication}>
                                            {ord.clinicalIndication}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={getStatusTone(ord.status)}>
                                                {ord.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                            {ord.orderedDate}
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrderForDetails(ord)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Details
                                            </button>
                                            {ord.status === 'COMPLETED' && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onViewResults && onViewResults(ord)}
                                                        className="text-emerald-600 hover:text-emerald-800 font-medium"
                                                    >
                                                        Results
                                                    </button>
                                                </>
                                            )}
                                            {ord.status === 'ORDERED' && onCancelOrder && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedOrderForCancel(ord)}
                                                        className="text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal: Place Order */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Place Clinical Order"
                width="max-w-2xl"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveOrder}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            Confirm & Place Order
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {validationError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                            {validationError}
                        </div>
                    )}

                    {/* Catalog suggestions */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quick Select Standard Orders:
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-gray-50 rounded border border-gray-200">
                            {COMMON_TEST_CATALOG.map((item) => (
                                <button
                                    key={item.code}
                                    type="button"
                                    onClick={() => handleSelectCatalogItem(item)}
                                    className="text-xs bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-2 py-1 rounded text-left transition-colors"
                                >
                                    <span className="font-mono text-xs text-gray-500 mr-1">[{item.category}]</span>
                                    <span className="font-medium text-gray-800">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={category}
                                onChange={(v) => setCategory(v as any)}
                                options={[
                                    { label: 'Laboratory', value: 'LAB' },
                                    { label: 'Radiology / Imaging', value: 'RADIOLOGY' },
                                    { label: 'Diagnostic / ECG', value: 'DIAGNOSTIC' },
                                    { label: 'Consultation', value: 'CONSULT' },
                                    { label: 'Procedure', value: 'PROCEDURE' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Priority <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={priority}
                                onChange={(v) => setPriority(v as any)}
                                options={[
                                    { label: 'Routine (Standard)', value: 'ROUTINE' },
                                    { label: 'Urgent (Within 2 hrs)', value: 'URGENT' },
                                    { label: 'STAT (Immediate)', value: 'STAT' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Order Code (Optional)
                            </label>
                            <Input
                                placeholder="e.g. CBC, CXR"
                                value={orderCode}
                                onChange={(e) => setOrderCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Order / Test Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Enter order or investigation name..."
                            value={orderName}
                            onChange={(e) => setOrderName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Clinical Indication / Reason for Order <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Suspected pneumonia, Acute chest pain, Pre-op evaluation"
                            value={clinicalIndication}
                            onChange={(e) => setClinicalIndication(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Special Instructions / Fasting Requirements
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500"
                            rows={2}
                            placeholder="e.g. Fasting 8 hrs, patient on anticoagulants, bedside portable..."
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {/* Modal: Order Details */}
            {selectedOrderForDetails && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedOrderForDetails(null)}
                    title={`Order Details: ${selectedOrderForDetails.orderName}`}
                    footer={
                        <button
                            type="button"
                            onClick={() => setSelectedOrderForDetails(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                        >
                            Close
                        </button>
                    }
                >
                    <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200">
                            <div><span className="text-gray-500">Order ID:</span> <span className="font-semibold">{selectedOrderForDetails.id}</span></div>
                            <div><span className="text-gray-500">Ordered Date:</span> <span className="font-semibold">{selectedOrderForDetails.orderedDate}</span></div>
                            <div><span className="text-gray-500">Category:</span> <span className="font-semibold">{selectedOrderForDetails.category}</span></div>
                            <div><span className="text-gray-500">Priority:</span> <span className="font-semibold text-red-600">{selectedOrderForDetails.priority}</span></div>
                            <div><span className="text-gray-500">Status:</span> <span className="font-semibold">{selectedOrderForDetails.status}</span></div>
                            {selectedOrderForDetails.orderedBy && (
                                <div><span className="text-gray-500">Ordered By:</span> <span className="font-semibold">{selectedOrderForDetails.orderedBy}</span></div>
                            )}
                        </div>

                        <div>
                            <div className="text-gray-500 font-medium">Clinical Indication:</div>
                            <div className="text-gray-900 mt-0.5">{selectedOrderForDetails.clinicalIndication}</div>
                        </div>

                        {selectedOrderForDetails.specialInstructions && (
                            <div>
                                <div className="text-gray-500 font-medium">Special Instructions:</div>
                                <div className="text-gray-900 mt-0.5">{selectedOrderForDetails.specialInstructions}</div>
                            </div>
                        )}

                        {selectedOrderForDetails.resultsSummary && (
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded mt-2">
                                <div className="text-emerald-900 font-semibold mb-1">Results Summary:</div>
                                <div className="text-emerald-800">{selectedOrderForDetails.resultsSummary}</div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Confirmation Dialog: Cancel Order */}
            {selectedOrderForCancel && (
                <ConfirmationDialog
                    isOpen={true}
                    title="Cancel Clinical Order"
                    message={`Are you sure you want to cancel the order for "${selectedOrderForCancel.orderName}"? This action cannot be undone.`}
                    yesLabel="Yes, Cancel Order"
                    noLabel="Keep Order"
                    variant="danger"
                    onConfirm={() => {
                        if (onCancelOrder && selectedOrderForCancel) {
                            onCancelOrder(selectedOrderForCancel.id, 'Cancelled by clinician');
                        }
                        setSelectedOrderForCancel(null);
                    }}
                    onCancel={() => setSelectedOrderForCancel(null)}
                />
            )}
        </div>
    );
};
