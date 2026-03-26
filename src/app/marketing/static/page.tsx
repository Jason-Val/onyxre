"use client";

import { useState, useEffect } from "react";
import { WizardFrame } from "@/components/wizard/WizardFrame";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

const STEPS = [
  { title: "Select Property" },
  { title: "Image Selection" },
  { title: "Template Match" },
  { title: "Copy & Export" },
];

export default function StaticStudioWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  // Step 1 State
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("new");
  const [customAddress, setCustomAddress] = useState("");
  const [customCityState, setCustomCityState] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState("");
  
  // Step 2 State
  const [propertyImages, setPropertyImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Step 3 State
  const [selectedTemplate, setSelectedTemplate] = useState("Just Listed");

  // Step 4 State
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

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
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    try {
      const { data, error } = await supabase.storage.from('property_images').upload(`temp/${filename}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('property_images').getPublicUrl(`temp/${filename}`);
      setSelectedImage(publicUrl);
    } catch (err: any) {
      console.warn("Upload failed, falling back to blob:", err.message);
      setSelectedImage(URL.createObjectURL(file));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      setCurrentStep(3);
      setIsGenerating(true);
      const propData = properties.find(p => p.id === selectedPropertyId);
      const address = selectedPropertyId === "new" ? customAddress : propData?.address_line1;
      const cCity = selectedPropertyId === "new" 
        ? customCityState 
        : (propData ? `${propData.city || ''}, ${propData.state || ''} ${propData.zip_code || ''}`.trim() : '');
      const cPrice = propData ? `$${propData.price?.toLocaleString() || ''}` : price;
      const baseFeatures = propData ? `${propData.bedrooms || '-'} BEDS • ${propData.bathrooms || '-'} BATHS • ${propData.sq_ft || '-'} SQ FT` : features;
      const finalFeatures = baseFeatures || cPrice;

      try {
        const res = await fetch('/api/marketing/orshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             type: selectedTemplate,
             address,
             cityState: cCity,
             price: cPrice,
             bedrooms: propData?.bedrooms?.toString() || '',
             bathrooms: propData?.bathrooms?.toString() || '',
             sq_ft: propData?.sq_ft?.toString() || '',
             features: finalFeatures,
             propertyImage: selectedImage || 'https://placehold.co/800x800/222/999?text=Replace%20Image'
          })
        });
        const data = await res.json();
        if (data.url) {
           setGeneratedImageUrl(data.url);
        } else {
           setGeneratedImageUrl('https://placehold.co/800x800/1e293b/00D1FF?text=Error+Generating');
        }
      } catch (err) {
        setGeneratedImageUrl('https://placehold.co/800x800/1e293b/00D1FF?text=Error');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (currentStep === 3) {
      setIsScheduling(true);
      try {
        await fetch('/api/marketing/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: selectedPropertyId === "new" ? null : selectedPropertyId,
            imageUrl: generatedImageUrl,
            text: caption,
            scheduledAt: `${scheduleDate}T${scheduleTime}`,
            platforms: selectedPlatforms
          })
        });
        window.location.href = "/marketing";
      } catch (err) {
      } finally {
        setIsScheduling(false);
      }
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const generateCaption = async (action: 'generate' | 'polish') => {
    setIsGeneratingCaption(true);
    const propData = properties.find(p => p.id === selectedPropertyId);
    try {
      const res = await fetch('/api/ai/caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            existingCaption: caption,
            templateType: selectedTemplate,
            propertyData: selectedPropertyId === "new" ? { address: customAddress, features } : propData
          })
      });
      const data = await res.json();
      if (data.caption) setCaption(data.caption);
    } catch {
       // Silent error for now
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-onyx text-slate-100 flex items-center justify-center mt-8">
      <WizardFrame
        title="Static Studio"
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onEscape={() => router.push('/marketing')}
        nextLabel={currentStep === 3 ? "Schedule Post" : "Continue"}
        isNextDisabled={(currentStep === 0 && selectedPropertyId === 'new' && !customAddress.trim()) || isGenerating || isScheduling}
      >
        {/* Step 1: Property */}
        <div className="flex flex-col gap-8 pr-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold border-l-4 border-cyan pl-4 tracking-tight">Select Property</h2>
            <p className="text-slate-400 pl-4">Choose the listing to build a static flyer or social grid post for.</p>
          </div>
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
            <h3 className="font-bold mb-4 text-white">Active Listings</h3>
            <select 
              value={selectedPropertyId} 
              onChange={e => setSelectedPropertyId(e.target.value)}
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 outline-none focus:border-cyan transition-colors shadow-inner appearance-none cursor-pointer"
            >
              <option value="new">-- New Property (Custom Address) --</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.address_line1 || 'Unknown'}, {p.city || ''} {p.price ? `($${p.price.toLocaleString()})` : ''}
                </option>
              ))}
            </select>

            {selectedPropertyId === "new" && (
              <div className="mt-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
                <input 
                  type="text" 
                  placeholder="Street Address..." 
                  value={customAddress} 
                  onChange={e => setCustomAddress(e.target.value)}
                  className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 outline-none focus:border-cyan"
                />
                <input 
                  type="text" 
                  placeholder="City, State, Zip..." 
                  value={customCityState} 
                  onChange={e => setCustomCityState(e.target.value)}
                  className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 outline-none focus:border-cyan"
                />
                <div className="flex gap-4">
                  <input type="text" placeholder="Price (e.g. $1.5M)" value={price} onChange={e => setPrice(e.target.value)} className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 outline-none focus:border-cyan" />
                  <input type="text" placeholder="Features (e.g. 4 Beds, 3 Baths)" value={features} onChange={e => setFeatures(e.target.value)} className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 outline-none focus:border-cyan" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Image */}
        <div className="flex flex-col gap-8 pr-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold border-l-4 border-cyan pl-4 tracking-tight">Image Selection</h2>
            <p className="text-slate-400 pl-4">Choose an attached property photo or upload your own.</p>
          </div>
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               {propertyImages.map(img => (
                 <div 
                   key={img.id} 
                   onClick={() => setSelectedImage(img.url)}
                   className={`h-32 rounded-lg cursor-pointer bg-cover bg-center border-2 transition-all ${selectedImage === img.url ? 'border-cyan scale-[1.05] shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'border-[#27373a] opacity-60 hover:opacity-100'}`}
                   style={{ backgroundImage: `url(${img.url})` }}
                 />
               ))}
               {propertyImages.length === 0 && <p className="text-slate-500 col-span-full italic">No attached property photos found.</p>}
             </div>
             
             <div className="border-t border-[#27373a] pt-8">
               <h3 className="font-bold mb-4 text-white">Upload Custom Photo</h3>
               <label className="flex items-center justify-center h-32 border-2 border-dashed border-[#27373a] hover:border-cyan rounded-xl cursor-pointer bg-onyx transition-colors">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="material-symbols-outlined text-3xl">{isUploadingImage ? 'hourglass_empty' : 'upload_file'}</span>
                    <span className="text-sm">{isUploadingImage ? 'Uploading...' : 'Click to Browse Photos'}</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploadingImage} />
               </label>
               {selectedImage && !propertyImages.find(i => i.url === selectedImage) && (
                 <div className="mt-4 p-4 bg-[#161B22] border border-cyan/20 rounded-lg flex items-center gap-4">
                    <img src={selectedImage} alt="Selected" className="w-16 h-16 object-cover rounded shadow" />
                    <span className="text-sm text-cyan font-bold">Custom Image Selected!</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Step 3: Template Match */}
        <div className="flex flex-col gap-8 pr-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold border-l-4 border-cyan pl-4 tracking-tight">Template Selection</h2>
            <p className="text-slate-400 pl-4">Select an Orshot-powered layout designed for real estate conversion.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TemplateCard title="Just Listed" active={selectedTemplate === 'Just Listed'} onClick={() => setSelectedTemplate('Just Listed')} />
            <TemplateCard title="Open House" active={selectedTemplate === 'Open House'} onClick={() => setSelectedTemplate('Open House')} />
            <TemplateCard title="In Contract" active={selectedTemplate === 'In Contract'} onClick={() => setSelectedTemplate('In Contract')} />
            <TemplateCard title="Just Sold" active={selectedTemplate === 'Just Sold'} onClick={() => setSelectedTemplate('Just Sold')} />
          </div>
        </div>

        {/* Step 4: Copy & Export */}
        <div className="flex flex-col gap-8 pr-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold border-l-4 border-emerald-500 pl-4 tracking-tight">AI Copy & Scheduling</h2>
            <p className="text-slate-400 pl-4">Review the requested creative and schedule via Buffer.</p>
          </div>

          {isGenerating ? (
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-16 shadow-2xl flex flex-col items-center justify-center gap-4">
               <span className="material-symbols-outlined text-cyan text-6xl animate-pulse shadow-[0_0_30px_rgba(0,209,255,0.6)] rounded-full">deployed_code</span>
               <h3 className="text-xl font-bold">Rendering Asset...</h3>
               <p className="text-slate-400 text-sm">Please wait while Orshot generates the post.</p>
            </div>
          ) : (
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl flex flex-col lg:flex-row gap-8">
              {/* Preview */}
              <div className="w-[320px] shrink-0 self-center h-fit bg-onyx rounded-xl border border-[#27373a] flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 {generatedImageUrl ? (
                   <img src={generatedImageUrl} alt="Preview" className="w-full h-auto object-cover" />
                 ) : (
                   <div className="w-full aspect-square bg-gradient-to-br from-cyan/20 to-onyx flex items-center justify-center p-4 text-center text-cyan">
                     Image generation unavailable preview
                   </div>
                 )}
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-300">Social Caption</h3>
                  <button onClick={() => generateCaption(caption ? 'polish' : 'generate')} className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20 shadow-sm transition-colors cursor-pointer disabled:opacity-50" disabled={isGeneratingCaption}>
                    <span className="material-symbols-outlined text-[12px]">auto_awesome</span> {caption ? "Polish via Gemini" : "Generate via Gemini"}
                  </button>
                </div>
                <textarea 
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Click 'Generate via Gemini' or enter your caption here..."
                  className="w-full h-32 bg-onyx border border-[#27373a] text-slate-200 rounded-lg p-4 focus:border-cyan outline-none resize-none transition-colors leading-relaxed text-sm" 
                />
                
                <h3 className="font-bold text-sm text-slate-300 mt-2">Schedule Post (Buffer Integration)</h3>
                <div className="flex gap-4">
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-4 outline-none focus:border-cyan appearance-none" />
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-4 outline-none focus:border-cyan appearance-none" />
                </div>

                <div className="flex gap-4 mt-2">
                  <PlatformToggle name="Instagram" active={selectedPlatforms.includes('Instagram')} onToggle={() => togglePlatform('Instagram')} />
                  <PlatformToggle name="Facebook" active={selectedPlatforms.includes('Facebook')} onToggle={() => togglePlatform('Facebook')} />
                  <PlatformToggle name="LinkedIn" active={selectedPlatforms.includes('LinkedIn')} onToggle={() => togglePlatform('LinkedIn')} />
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!caption || !scheduleDate || !scheduleTime || selectedPlatforms.length === 0 || isScheduling}
                  className="mt-auto bg-cyan text-onyx font-bold rounded-xl p-4 flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,209,255,0.3)]"
                >
                  <span className="material-symbols-outlined">{isScheduling ? 'hourglass_empty' : 'rocket_launch'}</span>
                  {isScheduling ? 'Scheduling...' : 'Finalize & Schedule Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </WizardFrame>
    </div>
  );
}

function TemplateCard({ title, active, onClick }: { title: string, active: boolean, onClick: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${active ? 'border-cyan bg-cyan/5 shadow-[0_0_20px_rgba(0,209,255,0.2)] scale-[1.02]' : 'border-[#27373a] bg-onyx-surface hover:border-slate-500 hover:scale-[1.02]'}`}>
      <div className="h-40 bg-onyx flex items-center justify-center border-b border-[#27373a] relative">
         <span className={`material-symbols-outlined text-4xl ${active ? 'text-cyan shadow-[0_0_15px_rgba(0,209,255,0.6)] rounded-lg' : 'text-slate-600'}`}>dashboard</span>
      </div>
      <div className="p-5">
        <h4 className={`font-bold text-lg ${active ? 'text-white' : 'text-slate-200'}`}>{title}</h4>
      </div>
    </div>
  )
}

function PlatformToggle({ name, active, onToggle }: { name: string, active: boolean, onToggle: () => void }) {
  return (
    <div onClick={onToggle} className={`flex-1 py-2 px-3 border rounded-lg text-center cursor-pointer font-bold text-sm transition-all ${active ? 'border-cyan bg-cyan/10 text-cyan' : 'border-[#27373a] bg-onyx text-slate-400 hover:border-slate-500'}`}>
      {name}
    </div>
  )
}
