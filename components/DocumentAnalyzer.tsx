import React from 'react';
import { Upload, FileText, AlertTriangle, ShieldCheck, Gavel, X, Zap, FileSearch, Landmark, Coins, Download, LayoutDashboard, Loader2, HelpCircle } from 'lucide-react';
import { analyzeLegalDocument } from '../services/gemini';
import { AnalysisResult, AnalyzedDocumentHistory, AnalyzedFile, NotificationType, DocumentAnalysisState, LegalDomain } from '../types';

interface PillarCardProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  color: string;
  gradient: string;
}

const PillarCard: React.FC<PillarCardProps> = ({ title, icon, content, color, gradient }) => (
  <div className={`p-6 rounded-2xl border ${color} bg-white shadow-sm flex flex-col space-y-4 transition-all hover:shadow-md group relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] -mr-10 -mt-10 rounded-full group-hover:scale-110 transition-transform`} />
    <div className="flex items-center space-x-2 font-bold text-[11px] uppercase tracking-widest border-b border-slate-100 pb-3">
      <span className="p-1.5 rounded-lg bg-slate-50">{icon}</span>
      <span className="text-slate-700">{title}</span>
    </div>
    <p className="text-[13px] leading-relaxed text-slate-600 font-serif italic line-clamp-4">{content}</p>
  </div>
);

export const DocumentAnalyzer: React.FC<{
  state: DocumentAnalysisState;
  setState: React.Dispatch<React.SetStateAction<DocumentAnalysisState>>;
  onAddAnalysis: (item: AnalyzedDocumentHistory) => void;
  domain: LegalDomain;
  notify: (m: string, t?: NotificationType, tit?: string) => void;
}> = ({ state, setState, onAddAnalysis, domain, notify }) => {

  const handleAnalyze = async () => {
    if (state.files.length === 0) return;
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const filesPayload = await Promise.all(state.files.map(async (file) => {
        return new Promise<{base64: string, mimeType: string, name: string}>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              base64: (reader.result as string).split(',')[1],
              mimeType: file.type,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      }));

      const response = await analyzeLegalDocument(filesPayload, state.customInstruction, domain);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: AnalysisResult = JSON.parse(cleanJson);
      
      setState(prev => ({ ...prev, result: parsed, isAnalyzing: false }));
      
      onAddAnalysis({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        result: parsed,
        files: filesPayload.map(f => ({
          fileName: f.name,
          mimeType: f.mimeType,
          fileBase64: f.base64,
          previewUrl: null
        })),
        customInstruction: state.customInstruction
      });
    } catch (err) {
      notify("Error en la auditoría técnica.", "error");
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const processFiles = (newFiles: File[]) => {
    setState(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const removeFile = (index: number) => {
    setState(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleExport = () => {
    if (!state.result) return;
    const content = `DICTAMEN DE AUDITORÍA INTEGRAL - LEX
Módulo: ${domain.toUpperCase()}
Fecha: ${new Date().toLocaleDateString()}
Puntuación de Riesgo: ${state.result.riskScore}/10

RESUMEN EJECUTIVO:
${state.result.summary}

PILARES DE ANÁLISIS:
${Object.entries(state.result.pillars).map(([k, v]) => `${k.toUpperCase()}:\n${v}`).join('\n\n')}

HALLAZGOS ESPECÍFICOS:
${state.result.risks.map((r, i) => `${i+1}. ${r}`).join('\n')}

RECOMENDACIÓN FINAL:
${state.result.recommendation}

---
Generado por el Sistema Experto Lex. Privacidad Total.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dictamen_${domain}_${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Dictamen exportado correctamente", "success");
  };

  const domainIcons = [
    <Landmark size={18} />,
    <Coins size={18} />,
    <Gavel size={18} />
  ];
  
  const domainColors = [
    { color: "border-blue-100/50", gradient: "from-blue-600 to-indigo-600" },
    { color: "border-amber-100/50", gradient: "from-amber-600 to-orange-600" },
    { color: "border-purple-100/50", gradient: "from-purple-600 to-fuchsia-600" }
  ];

  return (
    <div className="h-full overflow-y-auto p-8 md:p-12 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-wrap justify-between items-end gap-6 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-white rounded-2xl shadow-premium border border-slate-100">
               <LayoutDashboard className="text-legal-gold" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-serif font-bold text-legal-950 tracking-tight">Auditoría {domain === 'mercantil' ? 'Corporativa' : domain === 'fiscal' ? 'Tributaria' : 'Aduanera'}</h2>
              </div>
              <p className="text-slate-500 text-sm mt-1 font-medium italic">Diagnóstico exhaustivo y detección de contingencias legales.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-sm">
                <ShieldCheck size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Modo Privado</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center relative hover:border-legal-gold/50 transition-all group shadow-sm hover:shadow-md cursor-pointer">
              <div className="p-5 bg-slate-50 rounded-2xl w-fit mx-auto mb-5 group-hover:bg-legal-gold/10 transition-colors">
                 <Upload className="text-slate-400 group-hover:text-legal-gold transition-colors" size={28} />
              </div>
              <h3 className="text-sm font-bold text-legal-950 mb-1">Cargar Documentos</h3>
              <p className="text-[11px] text-slate-400 font-medium">PDF o imágenes</p>
              <input type="file" multiple onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            
            {state.files.length > 0 && (
              <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Expediente Preparado ({state.files.length})</p>
                  <div className="max-h-56 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                    {state.files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-2xl text-[12px] shadow-sm animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <FileText size={16} className="text-slate-400" />
                            <span className="truncate max-w-[150px] font-semibold text-slate-700">{f.name}</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><X size={16}/></button>
                      </div>
                    ))}
                  </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-premium space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Foco de la Auditoría</label>
                <textarea 
                  value={state.customInstruction}
                  onChange={(e) => setState(prev => ({ ...prev, customInstruction: e.target.value }))}
                  placeholder="Ej: Análisis de contingencias y penalizaciones..."
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] outline-none h-32 focus:ring-4 ring-legal-gold/5 focus:border-legal-gold transition-all shadow-inner-soft leading-relaxed"
                />
              </div>
              <button 
                onClick={handleAnalyze} 
                disabled={state.isAnalyzing || state.files.length === 0}
                className="w-full py-5 bg-legal-950 text-legal-gold rounded-2xl font-bold shadow-xl shadow-legal-950/20 hover:bg-legal-900 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {state.isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                <span>{state.isAnalyzing ? 'Ejecutando Diagnóstico...' : 'Iniciar Auditoría Experta'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-premium border border-slate-200/50 p-12 min-h-[600px] relative overflow-hidden flex flex-col">
            {!state.result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <FileSearch size={72} className="opacity-20 text-legal-950 mb-8" />
                <h3 className="text-2xl font-serif font-bold text-slate-800">Panel de Resultados</h3>
                <p className="max-w-xs text-center text-sm text-slate-400 mt-3 leading-relaxed">
                  Cargue documentos para generar un dictamen técnico de riesgos integral.
                </p>
              </div>
            ) : (
              <div className="space-y-10 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-2">Índice de Exposición Legal</span>
                    <div className="flex items-baseline gap-3">
                      <span className={`text-6xl font-serif font-bold tracking-tighter ${state.result.riskScore > 7 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {state.result.riskScore}<span className="text-2xl text-slate-300">/10</span>
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${state.result.riskScore > 7 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        Riesgo {state.result.riskScore > 7 ? 'Alto' : 'Controlado'}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-legal-950 rounded-3xl flex items-center justify-center shadow-2xl">
                    <ShieldCheck className="text-legal-gold" size={40} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(state.result.pillars).map(([key, content], index) => (
                    <PillarCard 
                      key={key} 
                      title={key} 
                      icon={domainIcons[index % domainIcons.length]} 
                      content={content} 
                      color={domainColors[index % domainColors.length].color} 
                      gradient={domainColors[index % domainColors.length].gradient} 
                    />
                  ))}
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200/40 shadow-inner-soft">
                  <h4 className="text-[11px] font-bold text-legal-950 uppercase mb-6 flex items-center gap-2.5 tracking-[0.2em]">
                    <AlertTriangle size={18} className="text-red-500" /> Hallazgos Críticos Identificados
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.result.risks.map((r, i) => (
                      <li key={i} className="text-[13px] text-slate-700 flex items-start gap-4 bg-white/60 p-5 rounded-2xl border border-white">
                        <span className="w-6 h-6 rounded-lg bg-legal-950 text-legal-gold text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i+1}
                        </span> 
                        <span className="font-medium leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-10 flex gap-5">
                   <button 
                    onClick={handleExport}
                    className="flex-1 bg-gradient-to-br from-legal-gold to-legal-goldhover text-legal-950 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:brightness-105 transition-all"
                   >
                     <Download size={22} /> Exportar Dictamen Técnico (.txt)
                   </button>
                   <button 
                    onClick={() => setState({ files: [], result: null, customInstruction: '', isAnalyzing: false })}
                    className="px-8 border border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all"
                   >
                     <Zap size={22} />
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};