import { createClient } from "@/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ContactsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch leads
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
  
  if (searchParams?.q) {
    query = query.or(`first_name.ilike.%${searchParams.q}%,last_name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`);
  }

  const { data: leads } = await query;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-10 flex flex-col min-h-screen gap-8 bg-[#0B0E14] text-slate-100 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b border-[#27373a] pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 font-display uppercase italic text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-cyan text-4xl">contacts</span>
            Contact <span className="text-cyan">Directory</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Manage your network and review AI drip marketing progress.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/contacts/new" className="px-8 py-4 bg-cyan text-onyx font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,209,255,0.4)] hover:-translate-y-1">
            <span className="material-symbols-outlined font-bold">person_add</span>
            New Contact
          </Link>
        </div>
      </header>

      {/* Main Contacts Table */}
      <div className="bg-[#11151c] border border-[#27373a] rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        <div className="p-6 border-b border-[#27373a] flex items-center justify-between bg-onyx-surface">
          <h3 className="font-bold text-xl text-white uppercase italic tracking-tighter">All Contacts</h3>
          
          <form className="relative" method="GET" action="/contacts">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
            <input 
              name="q"
              defaultValue={searchParams?.q || ""}
              type="text" 
              className="bg-[#0B0E14] border border-[#27373a] rounded-lg h-10 pl-9 pr-4 text-sm focus:border-cyan outline-none text-slate-100 placeholder:text-slate-600 w-64 md:w-80 transition-all" 
              placeholder="Search by name or email..." 
            />
          </form>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#27373a] bg-[#161B22]/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Heat Index</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Notes Snapshot</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B22]">
              {leads && leads.length > 0 ? leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p>No contacts found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeadRow({ lead }: { lead: any }) {
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unknown Contact";
  const initials = lead.first_name ? lead.first_name.charAt(0) : "?";
  
  // Try to use a tag based on heat_index or fallback
  const heatColor = lead.heat_index === "HOT" ? "text-red-400 bg-red-400/10 border-red-400/30" :
                    lead.heat_index === "WARM" ? "text-orange-400 bg-orange-400/10 border-orange-400/30" :
                    lead.heat_index === "COLD" ? "text-blue-400 bg-blue-400/10 border-blue-400/30" :
                    "text-slate-300 bg-onyx-surface border-[#27373a]";

  const status = lead.heat_index || "NEW";

  const notesPreview = lead.internal_notes ? lead.internal_notes.slice(0, 50) + (lead.internal_notes.length > 50 ? '...' : '') : 'No notes added';

  return (
    <tr className="hover:bg-cyan/[0.02] transition-colors group">
      <td className="px-6 py-5">
        <Link href={`/contacts/${lead.id}`} className="flex items-center gap-4 group-hover:text-cyan transition-colors">
          <div className="size-10 bg-cyan/10 border border-cyan/30 text-cyan rounded-full flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="font-bold text-white group-hover:text-cyan transition-colors">{name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lead.phone_number || 'No phone'}</p>
          </div>
        </Link>
      </td>
      <td className="px-6 py-5">
        <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${heatColor}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-5 max-w-xs">
        <p className="text-sm text-slate-300 truncate">{lead.email || "No email"}</p>
      </td>
      <td className="px-6 py-5 max-w-[200px]">
        <p className="text-xs text-slate-400 truncate italic">"{notesPreview}"</p>
      </td>
      <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
        <Link href={`/contacts/${lead.id}`} className="px-4 py-2 bg-onyx-surface border border-[#27373a] rounded-lg text-slate-300 hover:text-cyan hover:border-cyan/50 text-xs font-bold transition-all uppercase tracking-widest">
          View Dossier
        </Link>
      </td>
    </tr>
  );
}
