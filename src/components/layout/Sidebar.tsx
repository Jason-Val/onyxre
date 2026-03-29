"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { createClient } from "@/supabase/client";

const navItems = [
  { name: "Command Center", href: "/dashboard", icon: "dashboard" },
  { name: "Marketing Manager", href: "/marketing", icon: "auto_awesome" },
  { name: "Property Manager", href: "/properties", icon: "home_work" },
  { name: "Transaction Manager", href: "/transactions", icon: "hub" },
  { name: "Loomis CRM", href: "/crm", icon: "group" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<{
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    subscription_tier: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          first_name,
          last_name,
          avatar_url,
          organization:organizations(subscription_tier)
        `)
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserProfile({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          subscription_tier: (profile.organization as any)?.subscription_tier || "Agent"
        });
      }
    }
    fetchUserData();
  }, [supabase]);

  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/property/") ||
    pathname.startsWith("/agent/") ||
    pathname === "/"
  ) return null;

  return (
    <aside
      className={clsx(
        "bg-onyx/80 backdrop-blur-md border-r border-[#161B22] flex flex-col py-8 shrink-0 z-50 sticky top-0 h-screen transition-all duration-300 ease-in-out overflow-hidden relative",
        isExpanded ? "w-64 px-6 items-start" : "w-20 px-3 items-center"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Dynamic Background Glow */}
      <div className={clsx(
        "absolute pointer-events-none transition-all duration-500",
        isExpanded
          ? "top-10 -right-20 size-40 bg-cyan/5 blur-[50px] opacity-100"
          : "top-10 right-0 size-20 bg-cyan/5 blur-[30px] opacity-0"
      )}></div>

      <div className="flex items-center gap-3 mb-10 h-10 w-full shrink-0 px-2 lg:px-0">
        <div className="size-10 bg-cyan/5 rounded-xl flex items-center justify-center border border-cyan/20 shadow-[0_0_15px_rgba(0,209,255,0.1)] shrink-0 overflow-hidden p-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-transparent opacity-50"></div>
          <img
            src="/logo.png"
            alt="Specular OS Logo"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_5px_rgba(0,209,255,0.5)]"
          />
        </div>
        <span className={clsx(
          "font-display font-bold text-xl tracking-tight text-white whitespace-nowrap transition-all duration-300",
          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 hidden"
        )}>
          Specular OS
        </span>
      </div>

      <nav className="flex flex-col gap-4 flex-1 w-full relative z-10 px-2 lg:px-0">
        <div className={clsx(
          "text-[10px] font-bold uppercase tracking-widest text-[#27373a] mb-2 transition-all duration-300",
          isExpanded ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
        )}>
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isExpanded ? item.name : undefined}
              className={clsx(
                "p-3 flex items-center gap-4 rounded-xl transition-all border group relative overflow-hidden",
                isActive
                  ? "bg-cyan/10 text-cyan border-cyan/20 shadow-[0_0_10px_rgba(0,209,255,0.15)]"
                  : "text-slate-400 hover:text-cyan border-transparent hover:bg-[#161B22]",
                isExpanded ? "justify-start w-full" : "justify-center w-12 mx-auto"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan rounded-r-full shadow-[0_0_10px_rgba(0,209,255,0.8)]"></div>
              )}
              <span className={clsx("material-symbols-outlined shrink-0", isActive && "shadow-cyan")}>{item.icon}</span>
              <span className={clsx(
                "whitespace-nowrap font-semibold text-sm transition-all duration-300",
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 hidden"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col w-full relative z-10 gap-4 mt-auto border-t border-[#161B22] pt-6 px-2 lg:px-0">
        <Link
          href="/account"
          className={clsx(
            "p-3 flex items-center gap-4 rounded-xl transition-all border group relative overflow-hidden",
            pathname.startsWith("/account")
              ? "bg-cyan/10 text-cyan border-cyan/20 shadow-[0_0_10px_rgba(0,209,255,0.15)]"
              : "text-slate-400 hover:text-cyan border-transparent hover:bg-[#161B22]",
            isExpanded ? "justify-start w-full" : "justify-center w-12 mx-auto"
          )}
        >
          {pathname.startsWith("/account") && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan rounded-r-full shadow-[0_0_10px_rgba(0,209,255,0.8)]"></div>
          )}
          <span className="material-symbols-outlined shrink-0">manage_accounts</span>
          <span className={clsx(
            "whitespace-nowrap font-medium text-sm transition-all duration-300",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 hidden"
          )}>
            Account
          </span>
        </Link>

        <div className={clsx(
          "flex items-center gap-3 p-2 rounded-xl border border-transparent",
          isExpanded ? "justify-start w-full" : "justify-center w-12 mx-auto p-1"
        )}>
          <div className="size-8 shrink-0 rounded-full border border-cyan/30 p-0.5 relative group">
            <img
              alt="User avatar"
              className="rounded-full w-full h-full object-cover bg-onyx"
              src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"}
            />
          </div>
          <div className={clsx(
            "flex flex-col transition-all duration-300",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 hidden"
          )}>
            <span className="text-sm font-bold text-slate-200">
              {userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Agent' : 'Loading...'}
            </span>
            <span className="text-[10px] text-cyan uppercase tracking-widest font-bold">
              {userProfile?.subscription_tier || 'Elite'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
