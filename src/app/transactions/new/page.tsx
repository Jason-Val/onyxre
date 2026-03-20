"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WizardFrame } from "@/components/wizard/WizardFrame";
import { PropertySelectStep } from "@/components/wizard/steps/transaction/PropertySelectStep";
import { MilestoneStep, Milestone } from "@/components/wizard/steps/transaction/MilestoneStep";
import { DetailsStep, TransactionDetails } from "@/components/wizard/steps/transaction/DetailsStep";
import { DocumentStep, DocumentChecklistItem } from "@/components/wizard/steps/transaction/DocumentStep";
import { createClient } from "@/supabase/client";

const STEPS = [
  { title: "Select Property" },
  { title: "Transaction Details" },
  { title: "Escrow Milestones" },
  { title: "Documents Checklist" },
];

const INITIAL_DETAILS: TransactionDetails = {
  representation: 'BUYER',
  contract_acceptance_date: '',
  purchase_price: '',
  commission_percentage: '',
  agent_deduction: '',
  other_agent_name: '',
  other_agent_email: '',
  other_agent_phone: '',
  escrow_company_name: '',
  escrow_officer_name: '',
  escrow_officer_email: '',
  escrow_officer_phone: '',
  escrow_number: '',
};

interface TransactionWizardInnerProps {
  editId?: string | null;
}

function TransactionWizardInner({ editId }: TransactionWizardInnerProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [details, setDetails] = useState<TransactionDetails>(INITIAL_DETAILS);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [documents, setDocuments] = useState<DocumentChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  useEffect(() => {
    async function fetchExistingData() {
      if (!editId) return;
      try {
        const { data: tx, error: txError } = await supabase
          .from("transactions")
          .select(`
            *,
            milestones:transaction_milestones(*),
            documents:transaction_documents(*)
          `)
          .eq("id", editId)
          .single();

        if (txError) throw txError;
        
        setPropertyId(tx.property_id);
        
        // Load details
        setDetails({
          representation: (tx.representation as any) || 'BUYER',
          contract_acceptance_date: tx.contract_acceptance_date || '',
          purchase_price: tx.purchase_price?.toString() || '',
          commission_percentage: tx.commission_percentage?.toString() || '',
          agent_deduction: tx.agent_deduction?.toString() || '',
          other_agent_name: tx.other_agent_name || '',
          other_agent_email: tx.other_agent_email || '',
          other_agent_phone: tx.other_agent_phone || '',
          escrow_company_name: tx.escrow_company_name || '',
          escrow_officer_name: tx.escrow_officer_name || '',
          escrow_officer_email: tx.escrow_officer_email || '',
          escrow_officer_phone: tx.escrow_officer_phone || '',
          escrow_number: tx.escrow_number || '',
        });

        if (tx.milestones) {
          const formattedMilestones = tx.milestones
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((m: any) => ({
              title: m.title,
              date: m.due_date,
              status: m.status
            }));
          setMilestones(formattedMilestones);
        }

        if (tx.documents) {
          const formattedDocs = tx.documents
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((d: any) => ({
              title: d.title
            }));
          setDocuments(formattedDocs);
        }
      } catch (err) {
        console.error("Failed to fetch existing transaction:", err);
      } finally {
        setFetching(false);
      }
    }
    fetchExistingData();
  }, [editId, supabase]);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finalize
      setSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        if (!propertyId) throw new Error("No property selected");

        let txId = editId;

        const txPayload = {
          property_id: propertyId,
          representation: details.representation,
          contract_acceptance_date: details.contract_acceptance_date || null,
          purchase_price: details.purchase_price ? parseFloat(details.purchase_price) : null,
          commission_percentage: details.commission_percentage ? parseFloat(details.commission_percentage) : null,
          agent_deduction: details.agent_deduction ? parseFloat(details.agent_deduction) : null,
          other_agent_name: details.other_agent_name || null,
          other_agent_email: details.other_agent_email || null,
          other_agent_phone: details.other_agent_phone || null,
          escrow_company_name: details.escrow_company_name || null,
          escrow_officer_name: details.escrow_officer_name || null,
          escrow_officer_email: details.escrow_officer_email || null,
          escrow_officer_phone: details.escrow_officer_phone || null,
          escrow_number: details.escrow_number || null,
        };

        if (editId) {
          // Update existing transaction
          const { error: txError } = await supabase
            .from("transactions")
            .update(txPayload)
            .eq("id", editId);

          if (txError) throw txError;
          console.log("Updated transaction record for:", txId);

          // Replace milestones
          const { error: delError } = await supabase
            .from("transaction_milestones")
            .delete()
            .eq("transaction_id", editId);
            
          if (delError) {
            console.error("Error deleting milestones:", delError);
            throw delError;
          }
          console.log("Deleted old milestones for:", txId);

          // Replace documents
          const { error: docDelError } = await supabase
            .from("transaction_documents")
            .delete()
            .eq("transaction_id", editId);

          if (docDelError) {
            console.error("Error deleting documents:", docDelError);
            throw docDelError;
          }
          console.log("Deleted old documents for:", txId);
        } else {
          // Create new transaction
          const { data: profile } = await supabase
            .from("profiles")
            .select("organization_id")
            .eq("id", user.id)
            .single();
            
          const orgId = profile?.organization_id || user.id;

          const { data: tx, error: txError } = await supabase
            .from("transactions")
            .insert({
              ...txPayload,
              agent_id: user.id,
              organization_id: orgId,
              status: "ESCROW",
            })
            .select("id")
            .single();

          if (txError) throw txError;
          txId = tx.id;
        }

        // Create milestones
        if (milestones.length > 0) {
          const milestonePayload = milestones
            .filter(m => m.date)
            .map((m, i) => ({
              transaction_id: txId as string,
              title: m.title,
              due_date: m.date,
              status: m.status,
              sort_order: i
            }));
          
          console.log("Inserting milesone payload:", milestonePayload);
          const { error: insError } = await supabase.from("transaction_milestones").insert(milestonePayload);
          if (insError) {
            console.error("Error inserting milestones:", insError);
            throw insError;
          }
        }

        // Create documents
        if (documents.length > 0) {
          const documentPayload = documents.map((doc, i) => ({
            transaction_id: txId as string,
            title: doc.title,
            status: 'pending' as 'pending' | 'active' | 'completed',
            sort_order: i
          }));

          console.log("Inserting document payload:", documentPayload);
          const { error: docInsError } = await supabase.from("transaction_documents").insert(documentPayload);
          if (docInsError) {
            console.error("Error inserting documents:", docInsError);
            throw docInsError;
          }
        }

        console.log("Save complete, navigating...");
        router.push(editId ? `/transactions/${editId}` : "/transactions");
      } catch (err) {
        console.error("Failed to save transaction:", err);
        setSaving(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  if (fetching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined text-cyan text-4xl animate-spin">autorenew</span>
      </div>
    );
  }

  const isNextDisabled = () => {
    if (saving) return true;
    if (currentStep === 0) return !propertyId;
    if (currentStep === 1) {
      return !details.contract_acceptance_date || !details.purchase_price || !details.commission_percentage;
    }
    return false;
  };

  return (
    <div className="flex-1 bg-[#0B0E14] text-slate-100 flex items-center justify-center mt-8">
      <WizardFrame
        title={editId ? "Edit Escrow" : "Launch New Escrow"}
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onEscape={() => router.push(editId ? `/transactions/${editId}` : "/transactions")}
        isNextDisabled={isNextDisabled()}
        nextLabel={currentStep === STEPS.length - 1 ? (saving ? "Saving…" : editId ? "Update Escrow" : "Launch Escrow") : "Continue"}
      >
        {currentStep === 0 && <PropertySelectStep selectedId={propertyId} onSelect={setPropertyId} />}
        {currentStep === 1 && <DetailsStep details={details} onChange={setDetails} />}
        {currentStep === 2 && <MilestoneStep milestones={milestones} onChange={setMilestones} />}
        {currentStep === 3 && <DocumentStep documents={documents} onChange={setDocuments} />}
      </WizardFrame>
    </div>
  );
}

function TransactionWizardPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  return <TransactionWizardInner editId={id} />;
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined text-cyan text-4xl animate-spin">autorenew</span>
      </div>
    }>
      <TransactionWizardPage />
    </Suspense>
  );
}

