"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/client";

type Post = {
  id: string;
  image_url: string;
  caption: string;
  scheduled_at: string;
  platforms: string[];
  property_id: string | null;
  created_at?: string;
  status: string;
  motion_assets?: { total: number; completed: number; urls: string[] };
};

export default function MarketingManagerPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('property_marketing_posts')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
        
      if (data) setPosts(data as unknown as Post[]);
    }
    
    fetchPosts();

    // Set up realtime subscription to listen for webhook updates
    const channel = supabase.channel('marketing_posts_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'property_marketing_posts' },
        (payload) => {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new as unknown as Post : p));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'property_marketing_posts' },
        (payload) => {
          setPosts(prev => [payload.new as unknown as Post, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Filter posts into categories
  const generatingPosts = posts.filter(p => p.status === 'generating');
  const scheduledPosts = posts.filter(p => {
    if (p.status === 'generating') return false;
    if (p.scheduled_at && new Date(p.scheduled_at) < new Date()) return false;
    return true;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-10 space-y-10 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight font-display">Marketing Manager</h1>
        <p className="text-slate-400 text-sm">Create high-end media via our Content Studios and manage your Buffer schedule.</p>
      </header>

      {/* Content Studios Entry */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-[#27373a] pb-2 text-cyan">Content Studios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Static Studio */}
          <Link href="/marketing/static" className="group">
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,209,255,0.1)] transition-all flex flex-col items-center text-center gap-4 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="size-20 rounded-full bg-cyan/10 border-2 border-cyan/20 flex items-center justify-center text-cyan group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(0,209,255,0.1)] z-10 font-bold">
                <span className="material-symbols-outlined text-4xl">burst_mode</span>
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Static Studio</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Generate beautiful static image posts with AI-optimized copy.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-cyan font-bold uppercase tracking-widest text-[11px] group-hover:bg-cyan/10 px-4 py-2 rounded-full transition-all z-10 border border-transparent group-hover:border-cyan/30">
                Launch Studio <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* Motion Studio */}
          <Link href="/marketing/motion" className="group">
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.1)] transition-all flex flex-col items-center text-center gap-4 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="size-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(129,140,248,0.1)] z-10">
                <span className="material-symbols-outlined text-4xl">movie_filter</span>
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Motion Studio</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Turn 3 photos into cinematic reels with branding overlays and AI-Optimized copy</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-widest text-[11px] group-hover:bg-indigo-500/10 px-4 py-2 rounded-full transition-all z-10 border border-transparent group-hover:border-indigo-500/30">
                Launch Studio <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* Realtime In-Progress Generation Cards */}
      {generatingPosts.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-xl font-bold border-b border-cyan/30 pb-2 text-cyan flex items-center gap-2">
             <span className="material-symbols-outlined text-cyan motion-safe:animate-spin">autorenew</span> Active Rendering Jobs
           </h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
             {generatingPosts.map(post => (
                <div key={post.id} className="bg-onyx rounded-xl border border-cyan border-dashed opacity-80 cursor-wait flex flex-col overflow-hidden transition-all shadow-[0_0_15px_rgba(0,209,255,0.1)]">
                  <div className="h-40 bg-black relative flex items-center justify-center">
                    <div className="flex flex-col items-center text-cyan gap-2">
                      <span className="material-symbols-outlined text-4xl animate-spin">autorenew</span>
                      <span className="text-xs font-bold uppercase tracking-widest">Generating Video...</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span> 
                        {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : "Unscheduled"}
                      </span>
                      <span className="text-amber-400 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> Drafting...</span>
                    </div>
                    <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed opacity-80">{post.caption || "No caption provided."}</p>
                    {post.motion_assets && (
                      <div className="mt-2 w-full bg-[#161B26] rounded-full h-1 overflow-hidden">
                        <div className="bg-cyan h-1 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,209,255,0.8)]" style={{ width: `${(post.motion_assets.completed / Math.max(post.motion_assets.total, 1)) * 100}%` }} />
                      </div>
                    )}
                  </div>
                </div>
             ))}
           </div>
        </section>
      )}

      {/* Buffer Schedule / Completed Posts */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold border-b border-[#27373a] pb-2 text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500">calendar_month</span> Scheduled & Completed Posts
        </h2>
        
        {scheduledPosts.length === 0 ? (
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl overflow-hidden shadow-xl">
             <ScheduleRow platform="Instagram" type="Template" content="Your generated posts will show up here." date="Pending" status="Draft" icon="photo_camera" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scheduledPosts.map(post => (
               <div key={post.id} className="bg-onyx rounded-xl border border-[#27373a] hover:border-cyan/50 transition-all flex flex-col overflow-hidden group cursor-pointer">
                 <div className="h-40 bg-black relative flex items-center justify-center">
                    {post.image_url?.toLowerCase().endsWith('.mp4') || post.image_url?.includes("creatomate.com") ? (
                       <video src={post.image_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                       <img src={post.image_url} alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    )}
                    {(post.image_url?.toLowerCase().endsWith('.mp4') || post.image_url?.includes("creatomate.com")) && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-12 h-12 bg-black/60 backdrop-blur rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white text-2xl ml-1">play_arrow</span>
                         </div>
                       </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 pointer-events-none">
                       <div className="flex gap-1">
                          {post.platforms.map(p => (
                             <span key={p} className="bg-black/50 backdrop-blur text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-white/10">{p}</span>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="p-4 flex flex-col flex-1 gap-2">
                   <div className="flex items-center justify-between text-xs font-bold">
                     <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : "Unscheduled"}
                     </span>
                     <span className={post.scheduled_at ? "text-emerald-400 flex items-center gap-1.5" : "text-amber-400 flex items-center gap-1.5"}>
                        <span className="material-symbols-outlined text-[14px]">{post.scheduled_at ? "schedule" : "edit_calendar"}</span>
                        {post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Click to Schedule"}
                     </span>
                   </div>
                   <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed opacity-80">{post.caption || "No caption provided."}</p>
                 </div>
               </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScheduleRow({ platform, type, content, date, status, icon }: { platform: string, type: string, content: string, date: string, status: string, icon: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 py-4 border-b border-[#27373a] last:border-0 hover:bg-[#1a2029] transition-colors cursor-pointer group">
      <div className="flex items-center gap-4 flex-1">
        <div className="size-10 shrink-0 rounded bg-onyx border border-[#27373a] flex items-center justify-center text-slate-400 group-hover:text-cyan group-hover:border-cyan/50 transition-colors">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-slate-200">{platform}</h4>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-onyx border border-[#27373a] text-slate-500 shadow-inner group-hover:bg-[#27373a] transition-colors">{type}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{content}</p>
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0">
        <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide"><span className="material-symbols-outlined text-[14px] text-slate-500">schedule</span> {date}</p>
        <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 bg-onyx border rounded-full ${status === 'Pending' ? 'text-amber-500 border-amber-500/30' : 'text-slate-400 border-slate-700'}`}>{status}</span>
      </div>
    </div>
  )
}
