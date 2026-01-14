"use client";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Search, Sparkles, Camera, Shield, Trash2, LogOut, User as UserIcon, Flame, Home as HomeIcon, PlusSquare, Menu, X } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [view, setView] = useState("feed");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  
  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminStats, setAdminStats] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Upload State
  const [form, setForm] = useState({ name: "", bio: "", location: "", dob: "" });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => { runSearch(""); }, []);

  // --- ACTIONS ---
  const runSearch = async (q) => {
    try {
        const res = await fetch("/api/search", { method: "POST", body: JSON.stringify({ query: q }) });
        const data = await res.json();
        setUsers(data.users || []);
    } catch (e) { console.error(e); }
  };

  const handleAdminLogin = async () => {
    const res = await fetch("/api/admin", {
        method: "POST",
        body: JSON.stringify({ action: "stats", password: adminPass })
    });
    const data = await res.json();
    if (data.success) {
        setIsAdminLoggedIn(true);
        setAdminStats(data.data);
    } else {
        alert("Access Denied: Wrong Password");
    }
  };

  const deleteUser = async (id) => {
    if(!confirm("Permanently delete this user?")) return;
    const res = await fetch("/api/admin", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id, password: adminPass })
    });
    if(res.ok) {
        alert("Deleted.");
        runSearch("");
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!image) return alert("Upload a photo!");
    setStatus("AI Analyzing: Checking Age & Human Verification...");
    
    const res = await fetch("/api/create", {
      method: "POST",
      body: JSON.stringify({ 
          ...form, 
          email: session.user.email,
          imageBase64: image 
      }),
    });
    
    const data = await res.json();
    if (data.success) {
      setStatus(data.user.isBaddie ? "🔥 VERIFIED BADDIE!" : "✅ Profile Created");
      setTimeout(() => { setView("feed"); runSearch(""); }, 2000);
    } else {
      setStatus("Error: " + data.error);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- COMPONENTS ---
  const AdComponent = ({ title }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center h-48 md:h-64 flex flex-col items-center justify-center overflow-hidden my-4 md:my-0">
        <span className="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Advertisement</span>
        <div className="w-full h-full bg-neutral-800/50 rounded-lg flex items-center justify-center text-neutral-500 text-sm p-4">
            {title || "Google Ad Space"}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white pb-24 md:pb-0">
      
      {/* --- DESKTOP NAVBAR (Hidden on Mobile) --- */}
      <nav className="hidden md:block fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("feed")}>
             <Flame className="text-pink-600" fill="currentColor" />
             <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
               ONLY BADDIES
             </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-neutral-400 hover:text-white text-sm font-bold transition mr-2">About</Link>
            {session ? (
               <div className="flex items-center gap-3">
                 {session.user.image && <img src={session.user.image} className="w-8 h-8 rounded-full border border-pink-500" />}
                 <button onClick={() => setView("upload")} className="bg-pink-600 hover:bg-pink-700 px-4 py-1.5 rounded-full text-sm font-bold transition">+ Join</button>
                 <button onClick={() => signOut()} className="text-neutral-400 hover:text-white"><LogOut size={18}/></button>
               </div>
            ) : (
               <button onClick={() => signIn("google")} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">Login with Google</button>
            )}
            <button onClick={() => setShowAdmin(!showAdmin)} className="text-neutral-600 hover:text-red-500 transition ml-2"><Shield size={16} /></button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-black/90 backdrop-blur border-b border-white/10 px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => setView("feed")}>
             <Flame className="text-pink-600 w-5 h-5" fill="currentColor" />
             <h1 className="text-lg font-black tracking-tighter text-white">ONLY BADDIES</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAdmin(!showAdmin)} className="text-neutral-600"><Shield size={16} /></button>
            <Link href="/about" className="text-neutral-400 text-xs font-bold">About</Link>
          </div>
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="md:hidden fixed bottom-0 w-full z-50 bg-black border-t border-white/10 pb-safe pt-2 px-6 flex justify-between items-center h-16 safe-area-bottom">
          <button onClick={() => setView("feed")} className={`flex flex-col items-center gap-1 ${view === 'feed' ? 'text-pink-500' : 'text-neutral-500'}`}>
              <HomeIcon size={24} strokeWidth={view === 'feed' ? 3 : 2} />
              <span className="text-[10px] font-medium">Feed</span>
          </button>
          
          <button onClick={() => setView("upload")} className={`flex flex-col items-center gap-1 ${view === 'upload' ? 'text-pink-500' : 'text-neutral-500'}`}>
              <PlusSquare size={24} strokeWidth={view === 'upload' ? 3 : 2} />
              <span className="text-[10px] font-medium">Create</span>
          </button>

          <button onClick={() => session ? signOut() : signIn("google")} className="flex flex-col items-center gap-1 text-neutral-500">
              {session?.user?.image ? (
                  <img src={session.user.image} className="w-6 h-6 rounded-full border border-neutral-500" />
              ) : (
                  <UserIcon size={24} />
              )}
              <span className="text-[10px] font-medium">{session ? "Logout" : "Login"}</span>
          </button>
      </div>

      {/* Admin Modal */}
      {showAdmin && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative">
                <button onClick={() => setShowAdmin(false)} className="absolute top-4 right-4 text-neutral-500 p-2">✕</button>
                <h2 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2"><Shield /> Admin Panel</h2>

                {!isAdminLoggedIn ? (
                    <div className="space-y-4">
                        <input type="password" placeholder="Admin Password" className="w-full p-4 bg-black rounded-xl border border-neutral-700 outline-none focus:border-red-500 text-white" 
                            onChange={(e) => setAdminPass(e.target.value)} />
                        <button onClick={handleAdminLogin} className="w-full bg-red-600 py-3 rounded-xl font-bold">Unlock</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-black p-4 rounded-xl border border-neutral-800">
                                <div className="text-2xl font-black text-white">{adminStats?.userCount}</div>
                                <div className="text-[10px] text-neutral-500 uppercase">Users</div>
                            </div>
                            <div className="bg-black p-4 rounded-xl border border-neutral-800">
                                <div className="text-2xl font-black text-pink-500">{adminStats?.baddieCount}</div>
                                <div className="text-[10px] text-neutral-500 uppercase">Baddies</div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-neutral-500">Delete icons are now visible on profiles.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <main className="pt-20 md:pt-24 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN (Search & Filters) - Desktop Only */}
        <div className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-6">
                <div className="bg-neutral-900 rounded-3xl p-6 border border-white/5">
                    <h3 className="font-bold text-lg mb-4 text-neutral-200">Search</h3>
                    <div className="relative">
                        <input className="w-full bg-black border border-neutral-800 p-3 pl-10 rounded-xl outline-none focus:border-pink-500 text-sm" placeholder="Filter..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch(search)} />
                        <Search className="absolute left-3 top-3.5 text-neutral-600" size={16} />
                    </div>
                    <button onClick={() => runSearch(search)} className="w-full mt-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2 rounded-xl text-sm font-medium">Apply</button>
                </div>
                <AdComponent title="Sponsor Ad" />
            </div>
        </div>

        {/* CENTER COLUMN (Feed & Upload) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Mobile Search Bar (Always visible on Feed) */}
            {view === 'feed' && (
                <div className="lg:hidden sticky top-16 z-30 mb-4">
                    <div className="relative shadow-xl">
                        <input className="w-full bg-neutral-900/90 backdrop-blur border border-white/10 p-3 pl-10 rounded-2xl outline-none text-white text-sm" placeholder="Search (e.g. 'NYC', 'Blonde')..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch(search)} />
                        <Search className="absolute left-3 top-3.5 text-pink-500" size={18} />
                    </div>
                </div>
            )}

            {view === "upload" ? (
                <div className="bg-neutral-900 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                     {!session ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-500"><UserIcon size={32} /></div>
                            <h2 className="text-xl md:text-2xl font-bold">Login Required</h2>
                            <p className="text-neutral-400 text-sm max-w-xs mx-auto">Login via Google to post.</p>
                            <button onClick={() => signIn("google")} className="bg-white text-black px-8 py-3 rounded-full font-bold">Login with Google</button>
                        </div>
                    ) : (
                        <form onSubmit={submitProfile} className="space-y-6">
                            <div className="text-center pb-4 border-b border-white/5">
                                <h2 className="text-xl font-bold">Create Profile</h2>
                            </div>
                            <div className="flex justify-center">
                                <label className="relative w-full aspect-[3/4] max-w-[200px] bg-black rounded-2xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center cursor-pointer">
                                    {image ? <img src={image} className="absolute inset-0 w-full h-full object-cover rounded-xl" /> : <div className="text-center"><Camera size={24} className="mx-auto mb-2 text-neutral-500"/><span className="text-xs text-neutral-500">Tap to Upload</span></div>}
                                    <input type="file" className="hidden" onChange={handleImage} accept="image/*" />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name" className="w-full p-3 bg-black rounded-xl border border-neutral-800 text-sm" required />
                                <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full p-3 bg-black rounded-xl border border-neutral-800 text-neutral-300 text-sm" required />
                            </div>
                            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location" className="w-full p-3 bg-black rounded-xl border border-neutral-800 text-sm" required />
                            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Bio..." className="w-full p-3 bg-black rounded-xl border border-neutral-800 min-h-[80px] text-sm" required />
                            <button type="submit" disabled={status.includes("AI Analyzing")} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-50">
                                {status || "Launch Profile"}
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="space-y-6 md:space-y-8">
                    {users.length === 0 && <div className="text-center py-20 text-neutral-600 text-sm"><p>No results found.</p></div>}
                    {users.map(u => (
                        <div key={u._id} className="relative bg-neutral-900 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                            {u.isBaddie && <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1"><Sparkles size={10} className="text-pink-400" /> Verified</div>}
                            {isAdminLoggedIn && <button onClick={() => deleteUser(u._id)} className="absolute top-4 left-4 z-30 bg-red-600 text-white p-2 rounded-full"><Trash2 size={16} /></button>}
                            
                            <div className="aspect-[3/4] relative">
                                <img src={u.imageUrl} className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90"></div>
                                <div className="absolute bottom-0 right-0 p-6 text-right w-full">
                                    <h3 className="text-3xl md:text-4xl font-black text-white">{u.name}</h3>
                                    <div className="text-xl md:text-2xl font-medium text-pink-500 mt-1">{u.age} <span className="text-[10px] md:text-sm text-neutral-400 font-normal uppercase">Years Old</span></div>
                                    <p className="mt-3 text-neutral-300 text-sm md:text-base leading-relaxed max-w-[85%] ml-auto line-clamp-2">{u.bio}</p>
                                    <div className="mt-3 inline-block bg-white/10 backdrop-blur px-2 py-1 rounded text-[10px] text-neutral-300">{u.location}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Mobile Ad Inserted in Feed */}
                    <div className="lg:hidden">
                        <AdComponent title="Mobile Feed Ad" />
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN (Ads & Sticky) - Desktop Only */}
        <div className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-6">
                <AdComponent title="Google Ad Space #1" />
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center">
                    <h4 className="font-bold text-lg mb-2">Join the Club</h4>
                    <p className="text-neutral-500 text-sm mb-4">Upload your profile and get AI verified today.</p>
                    <button onClick={() => setView("upload")} className="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded-xl font-bold transition">Get Verified</button>
                </div>
                <AdComponent title="Google Ad Space #2" />
            </div>
        </div>
      </main>
    </div>
  );
}