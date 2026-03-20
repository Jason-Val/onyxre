"use client";

import { motion } from "framer-motion";

export interface TransactionDetails {
  representation: 'BUYER' | 'SELLER';
  contract_acceptance_date: string;
  purchase_price: string;
  commission_percentage: string;
  agent_deduction: string;
  other_agent_name: string;
  other_agent_email: string;
  other_agent_phone: string;
  escrow_company_name: string;
  escrow_officer_name: string;
  escrow_officer_email: string;
  escrow_officer_phone: string;
  escrow_number: string;
}

interface DetailsStepProps {
  details: TransactionDetails;
  onChange: (details: TransactionDetails) => void;
}

export function DetailsStep({ details, onChange }: DetailsStepProps) {
  const updateField = (field: keyof TransactionDetails, value: string) => {
    onChange({ ...details, [field]: value });
  };

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Transaction Details</h2>
        <p className="text-slate-400 text-sm">Fill in the core contract and escrow information.</p>
      </div>

      <div className="space-y-10">
        {/* Representation Selector */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Agency Representation</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => updateField('representation', 'BUYER')}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group ${
                details.representation === 'BUYER'
                  ? 'bg-cyan/10 border-cyan shadow-[0_0_15px_rgba(0,209,255,0.1)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${details.representation === 'BUYER' ? 'text-cyan' : 'text-slate-500'}`}>shopping_cart</span>
              <span className={`text-xs font-bold uppercase tracking-widest ${details.representation === 'BUYER' ? 'text-white' : 'text-slate-500'}`}>Representing Buyer</span>
            </button>
            <button
              onClick={() => updateField('representation', 'SELLER')}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group ${
                details.representation === 'SELLER'
                  ? 'bg-cyan/10 border-cyan shadow-[0_0_15px_rgba(0,209,255,0.1)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${details.representation === 'SELLER' ? 'text-cyan' : 'text-slate-500'}`}>sell</span>
              <span className={`text-xs font-bold uppercase tracking-widest ${details.representation === 'SELLER' ? 'text-white' : 'text-slate-500'}`}>Representing Seller</span>
            </button>
          </div>
        </div>

        {/* Financials & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label="Contract Acceptance Date *"
            type="date"
            value={details.contract_acceptance_date}
            onChange={(val) => updateField('contract_acceptance_date', val)}
            icon="event"
          />
          <InputGroup
            label="Purchase Price *"
            type="number"
            value={details.purchase_price}
            onChange={(val) => updateField('purchase_price', val)}
            icon="payments"
            placeholder="e.g. 850000"
          />
          <InputGroup
            label="Commission Percentage *"
            type="number"
            value={details.commission_percentage}
            onChange={(val) => updateField('commission_percentage', val)}
            icon="percent"
            placeholder="e.g. 2.5"
          />
          <InputGroup
            label="Agent Deduction"
            type="number"
            value={details.agent_deduction}
            onChange={(val) => updateField('agent_deduction', val)}
            icon="remove_circle"
            placeholder="e.g. 1250"
          />
        </div>

        {/* Other Agent Info */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">person</span>
            Co-Op Agent Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputGroup
              label="Agent Name"
              value={details.other_agent_name}
              onChange={(val) => updateField('other_agent_name', val)}
              placeholder="Name"
            />
            <InputGroup
              label="Email"
              value={details.other_agent_email}
              onChange={(val) => updateField('other_agent_email', val)}
              placeholder="Email"
            />
            <InputGroup
              label="Phone"
              value={details.other_agent_phone}
              onChange={(val) => updateField('other_agent_phone', val)}
              placeholder="Phone"
            />
          </div>
        </div>

        {/* Escrow Details */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">business</span>
            Escrow Company & Officer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              label="Escrow Company Name"
              value={details.escrow_company_name}
              onChange={(val) => updateField('escrow_company_name', val)}
              placeholder="Company Name"
            />
            <InputGroup
              label="Escrow Number"
              value={details.escrow_number}
              onChange={(val) => updateField('escrow_number', val)}
              placeholder="Escrow #"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputGroup
              label="Officer Name"
              value={details.escrow_officer_name}
              onChange={(val) => updateField('escrow_officer_name', val)}
              placeholder="Officer Name"
            />
            <InputGroup
              label="Officer Email"
              value={details.escrow_officer_email}
              onChange={(val) => updateField('escrow_officer_email', val)}
              placeholder="Officer Email"
            />
            <InputGroup
              label="Officer Phone"
              value={details.escrow_officer_phone}
              onChange={(val) => updateField('escrow_officer_phone', val)}
              placeholder="Officer Phone"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, type = "text", value, onChange, icon, placeholder }: { label: string, type?: string, value: string, onChange: (val: string) => void, icon?: string, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</label>
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-cyan transition-colors">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan focus:bg-cyan/5 outline-none transition-all ${icon ? 'pl-11' : ''} [color-scheme:dark]`}
        />
      </div>
    </div>
  );
}
