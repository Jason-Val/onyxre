"use client";

import { useState, useEffect } from "react";
import { WizardFrame } from "@/components/wizard/WizardFrame";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

const STEPS = [
  { title: "Select Property" },
  { title: "Photos" },
  { title: "Template" },
  { title: "Format" },
  { title: "Generate" },
];

const RATIOS = [
  { id: "1:1", label: "Square (1:1)", w: 1080, h: 1080, icon: "crop_square" },
  { id: "4:5", label: "Portrait (4:5)", w: 1080, h: 1350, icon: "crop_portrait" },
  { id: "9:16", label: "Vertical (9:16)", w: 1080, h: 1920, icon: "smartphone" }
];

export default function MotionStudioWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  // Step 1 State
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("new");

  // Step 2 State
  const [propertyImages, setPropertyImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Step 3 State
  const [templateId, setTemplateId] = useState("just-listed");
  const [ohDate, setOhDate] = useState("");
  const [ohStartTime, setOhStartTime] = useState("");
  const [ohEndTime, setOhEndTime] = useState("");

  // Step 4 State
  const [aspectRatio, setAspectRatio] = useState("9:16");

  // Step 5 State
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProps() {
      const { data } = await supabase.from('properties').select('*').limit(50);
      if (data) setProperties(data);
    }
    loadProps();
  }, [supabase]);

  useEffect(() => {
    async function loadImgs() {
      if (!selectedPropertyId || selectedPropertyId === "new") {
        setPropertyImages([]);
        return;
      }
      const { data } = await supabase.from('property_images').select('*').eq('property_id', selectedPropertyId);
      if (data) setPropertyImages(data);
    }
    loadImgs();
  }, [selectedPropertyId, supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploadingImage(true);
    const newFiles = Array.from(e.target.files).slice(0, 3 - selectedImages.length);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...newPreviews].slice(0, 3));
    setIsUploadingImage(false);
  };

  const toggleImageSelection = (url: string) => {
    setSelectedImages(prev => {
      if (prev.includes(url)) return prev.filter(u => u !== url);
      if (prev.length < 3) return [...prev, url];
      return prev;
    });
  }

  // Utility to center-crop an image to the desired aspect ratio before uploading
  const getCroppedBlob = async (imageUrl: string, ratioId: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Important for external URLs
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        const targetRatio = ratioId === "1:1" ? 1 : ratioId === "4:5" ? 0.8 : (9 / 16);
        const imgRatio = img.width / img.height;

        let drawW = img.width;
        let drawH = img.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          drawW = img.height * targetRatio;
          offsetX = (img.width - drawW) / 2;
        } else {
          drawH = img.width / targetRatio;
          offsetY = (img.height - drawH) / 2;
        }

        canvas.width = 1080;
        canvas.height = canvas.width / targetRatio;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/jpeg", 0.9);
      };
      img.onerror = () => resolve(new Blob());
    });
  };

  const handleNext = async () => {
    if (currentStep === 4) {
      if (selectedImages.length === 0) return;
      setIsGenerating(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Crop & Upload all images to Supabase Storage
        const uploadedUrls: string[] = [];
        for (let i = 0; i < selectedImages.length; i++) {
          const blob = await getCroppedBlob(selectedImages[i], aspectRatio);
          if (blob.size === 0) continue; // Skip invalid images
          const path = `motion/${user.id}/${Date.now()}-${i}.jpg`;
          const { error } = await supabase.storage.from("property_images").upload(path, blob, { upsert: true });
          if (!error) {
            const { data: { publicUrl } } = supabase.storage.from("property_images").getPublicUrl(path);
            uploadedUrls.push(publicUrl);
          } else {
            console.error("Storage upload error:", error);
            throw new Error(`Upload failed for image ${i}: ${error.message}`);
          }
        }

        // Format times for display: "10am-12pm"
        const formatTime = (t: string) => {
          if (!t) return "";
          let [h, m] = t.split(':');
          let hour = parseInt(h);
          const ampm = hour >= 12 ? 'pm' : 'am';
          hour = hour % 12 || 12;
          return `${hour}${m === '00' ? '' : ':' + m}${ampm}`;
        }

        let formattedDate = "";
        if (ohDate) {
          const d = new Date(ohDate);
          formattedDate = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
        }

        const formattedTime = (ohStartTime && ohEndTime) ? `${formatTime(ohStartTime)}-${formatTime(ohEndTime)}` : "";

        // 2. Dispatch the generation job
        const res = await fetch("/api/marketing/motion/dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: selectedPropertyId === "new" ? null : selectedPropertyId,
            imageUrls: uploadedUrls,
            text: templateId === "open-house" ? "Join us for an Open House!" : "Watch this incredible property tour!",
            platforms: ["instagram"],
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            motionData: {
              templateId,
              ohDate: formattedDate,
              ohTime: formattedTime
            }
          })
        });

        if (!res.ok) {
           const errText = await res.text();
           throw new Error(`Dispatch API error: ${res.status} ${errText}`);
        }

        setSuccess(true);
        setTimeout(() => { router.push("/marketing"); }, 2000);

      } catch (err: any) {
        console.error("Studio Pipeline Error:", err);
        alert(err.message || "Something went wrong during generation!");
      } finally {
        setIsGenerating(false);
      }
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="flex-1 min-h-screen bg-onyx text-slate-100 flex items-center justify-center mt-8 pl-4 pr-12 pb-12">
      <WizardFrame
        title="Motion Studio"
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onEscape={() => router.push('/marketing')}
        nextLabel={currentStep === 4 ? "Generate Video" : "Continue"}
        isNextDisabled={
          (currentStep === 1 && selectedImages.length === 0) ||
          (currentStep === 2 && templateId === 'open-house' && (!ohDate || !ohStartTime || !ohEndTime)) ||
          isGenerating || success
        }
      >
        {/* Step 1: Property */}
        {currentStep === 0 && (
          <div className="flex flex-col gap-8 pr-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold border-l-4 border-cyan pl-4 tracking-tight">Select Property</h2>
              <p className="text-slate-400 pl-4">Choose the listing to build a cinematic tour for.</p>
            </div>
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
              <h3 className="font-bold mb-4 text-white">Active Listings</h3>
              <select
                value={selectedPropertyId}
                onChange={e => {
                  setSelectedPropertyId(e.target.value);
                  setSelectedImages([]); // Clear images when switching property
                }}
                className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 outline-none focus:border-cyan transition-colors shadow-inner appearance-none cursor-pointer"
              >
                <option value="new">-- New Property --</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.address_line1 || 'Unknown'}, {p.city || ''} {p.price ? `($${p.price.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Image Selection */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-8 pr-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold border-l-4 border-cyan pl-4 tracking-tight">Select Photos ({selectedImages.length}/3)</h2>
              <p className="text-slate-400 pl-4">Choose up to 3 photos. We will orchestrate them into a video tour.</p>
            </div>
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">

              {/* Gallery */}
              <h3 className="font-bold mb-4 text-white">Property Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {propertyImages.map(img => {
                  const isSelected = selectedImages.includes(img.url);
                  return (
                    <div
                      key={img.id}
                      onClick={() => toggleImageSelection(img.url)}
                      className={`h-32 rounded-lg cursor-pointer bg-cover bg-center border-2 transition-all ${isSelected ? 'border-cyan scale-[1.05] shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'border-[#27373a] opacity-60 hover:opacity-100'}`}
                      style={{ backgroundImage: `url(${img.url})` }}
                    >
                      {isSelected && (
                        <div className="bg-cyan text-onyx w-6 h-6 rounded-br-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {propertyImages.length === 0 && <p className="text-slate-500 col-span-full italic">No attached property photos found.</p>}
              </div>

              {/* Upload */}
              <div className="border-t border-[#27373a] pt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white">Custom Uploads</h3>
                  <span className="text-xs text-slate-400">{selectedImages.filter(url => !propertyImages.find(i => i.url === url)).length} custom</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedImages.filter(url => !propertyImages.find(i => i.url === url)).map((url, i) => (
                    <div key={i} className="h-32 rounded-lg bg-cover bg-center border-2 border-cyan shadow-[0_0_15px_rgba(0,209,255,0.4)] relative" style={{ backgroundImage: `url(${url})` }}>
                      <button onClick={() => toggleImageSelection(url)} className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-onyx">
                        <span className="material-symbols-outlined text-[14px] text-white">close</span>
                      </button>
                    </div>
                  ))}
                  {selectedImages.length < 3 && (
                    <label className="flex items-center justify-center h-32 border-2 border-dashed border-[#27373a] hover:border-cyan rounded-xl cursor-pointer bg-onyx transition-colors">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">{isUploadingImage ? 'hourglass_empty' : 'upload_file'}</span>
                        <span className="text-sm">{isUploadingImage ? 'Loading...' : 'Upload'}</span>
                      </div>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploadingImage} />
                    </label>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Step 3: Template */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300 pr-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold border-l-4 border-cyan pl-4 tracking-tight">Select Template</h2>
              <p className="text-slate-400 pl-4">Choose the motion graphic packaging to surround your media.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TemplateCard
                title="Just Listed"
                icon="campaign"
                active={templateId === 'just-listed'}
                onClick={() => setTemplateId('just-listed')}
              />
              <TemplateCard
                title="Open House"
                icon="meeting_room"
                active={templateId === 'open-house'}
                onClick={() => setTemplateId('open-house')}
              />
            </div>

            {templateId === "open-house" && (
              <div className="bg-onyx-surface border border-cyan/30 rounded-xl p-6 shadow-2xl mt-4 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan">calendar_month</span> Event Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs font-semibold">Date</label>
                    <input type="date" value={ohDate} onChange={e => setOhDate(e.target.value)} className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-3 outline-none focus:border-cyan" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs font-semibold">Start Time</label>
                    <input type="time" value={ohStartTime} onChange={e => setOhStartTime(e.target.value)} className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-3 outline-none focus:border-cyan" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs font-semibold">End Time</label>
                    <input type="time" value={ohEndTime} onChange={e => setOhEndTime(e.target.value)} className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-3 outline-none focus:border-cyan" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Aspect Ratio */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300 pr-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold border-l-4 border-cyan pl-4 tracking-tight">Select Output Ratio</h2>
              <p className="text-slate-400 pl-4">The final video aspect ratio for the social network you choose.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${aspectRatio === ratio.id ? "border-cyan bg-cyan/10 scale-105 shadow-[0_0_15px_rgba(0,209,255,0.3)]" : "border-[#30363D] hover:border-[#4B5563]"
                    }`}
                >
                  <span className="material-symbols-outlined text-4xl">{ratio.icon}</span>
                  <span className="font-bold">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review & Generate */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300 pr-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold border-l-4 border-emerald-500 pl-4 tracking-tight">AI Rendering Pipeline</h2>
              <p className="text-slate-400 pl-4">The agent network will transform your selections into a 12s cinematic tour.</p>
            </div>
            <div className="bg-[#0A0D14] border border-[#30363D] rounded-xl p-6 shadow-2xl">
              <p className="font-semibold text-white">⚙️ Pipeline Operations</p>
              <div className="flex text-sm text-slate-400 gap-8 mt-4 flex-wrap">
                <div className="flex flex-col"><span className="text-xs uppercase tracking-widest text-slate-500">Inputs</span><strong className="text-white text-lg">{selectedImages.length} Shots</strong></div>
                <div className="flex flex-col"><span className="text-xs uppercase tracking-widest text-slate-500">Layout</span><strong className="text-cyan text-lg capitalize">{templateId.replace('-', ' ')}</strong></div>
                <div className="flex flex-col"><span className="text-xs uppercase tracking-widest text-slate-500">Format</span><strong className="text-white text-lg">{aspectRatio} (HD)</strong></div>
                <div className="flex flex-col"><span className="text-xs uppercase tracking-widest text-slate-500">System Status</span>{isGenerating ? <strong className="text-amber-400 animate-pulse text-lg">Dispatching...</strong> : <strong className="text-emerald-400 text-lg">Awaiting Execution</strong>}</div>
              </div>
            </div>

            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex font-bold items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                Job dispatched successfully! Redirecting to Marketing Manager...
              </div>
            )}

            {isGenerating && !success && (
              <div className="p-16 border rounded-xl border-cyan/30 flex flex-col items-center justify-center gap-4 bg-cyan/5">
                <span className="material-symbols-outlined text-cyan text-5xl animate-spin">autorenew</span>
                <p className="font-bold">Queuing Generative Video Job...</p>
              </div>
            )}
          </div>
        )}

      </WizardFrame>
    </div>
  );
}

function TemplateCard({ title, icon, active, onClick }: { title: string, icon: string, active: boolean, onClick: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${active ? 'border-cyan bg-cyan/5 shadow-[0_0_20px_rgba(0,209,255,0.2)] scale-[1.02]' : 'border-[#27373a] bg-onyx-surface hover:border-slate-500 hover:scale-[1.02]'}`}>
      <div className="h-40 bg-onyx flex items-center justify-center border-b border-[#27373a] relative">
        <span className={`material-symbols-outlined text-4xl transition-all ${active ? 'text-cyan drop-shadow-[0_0_10px_rgba(0,209,255,0.8)]' : 'text-slate-600'}`}>{icon}</span>
      </div>
      <div className="p-5">
        <h4 className={`font-bold text-lg ${active ? 'text-white' : 'text-slate-300'}`}>{title}</h4>
      </div>
    </div>
  )
}
