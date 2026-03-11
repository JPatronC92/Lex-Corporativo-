import React from 'react';
import { PenTool, Download, Copy, RefreshCw, FileText, FileSignature, Gavel, Users, Zap, Home, FileKey, Shield, Coins, Scale, HelpCircle, Truck, Building, Building2, Globe } from 'lucide-react';
import { draftLegalDocument } from '../services/gemini';
import { NotificationType, DraftingState, LegalDomain } from '../types';

export const Drafter: React.FC<{
  state: DraftingState;
  setState: React.Dispatch<React.SetStateAction<DraftingState>>;
  domain: LegalDomain;
  notify: (m: string, t?: NotificationType) => void;
}> = ({ state, setState, domain, notify }) => {

  const draftingModelsByDomain = {
    mercantil: [
      { title: "SAPI / Accionistas", icon: <Users size={14} />, prompt: "Convenio de accionistas para SAPI de CV con cláusulas de exclusividad, Drag-along y Tag-along." },
      { title: "Arrendamiento Local", icon: <Home size={14} />, prompt: "Contrato de arrendamiento de local comercial con cláusulas de mantenimiento, fianza y rescisión anticipada conforme a la legislación civil mexicana." },
      { title: "Poder Notarial", icon: <FileKey size={14} />, prompt: "Poder general para pleitos y cobranzas, actos de administración y actos de dominio con cláusulas especiales de representación." },
      { title: "Suministro Mercantil", icon: <FileSignature size={14} />, prompt: "Contrato de suministro mercantil internacional con cláusulas de arbitraje ICC." },
      { title: "Confidencialidad (NDA)", icon: <Shield size={14} />, prompt: "Convenio de confidencialidad y no competencia (Non-Disclosure Agreement) para protección de secretos industriales." },
      { title: "Asamblea Ordinaria", icon: <Building2 size={14} />, prompt: "Acta de asamblea general ordinaria de accionistas para la aprobación de resultados financieros y nombramiento de consejo." }
    ],
    fiscal: [
      { title: "Recurso Revocación", icon: <Coins size={14} />, prompt: "Escrito de Recurso de Revocación ante el SAT contra una resolución determinante de crédito fiscal, alegando falta de fundamentación." },
      { title: "Amparo Indirecto", icon: <Scale size={14} />, prompt: "Demanda de juicio de amparo indirecto contra actos de autoridad fiscal que vulneran derechos fundamentales de legalidad." },
      { title: "Respuesta Requerimiento", icon: <FileText size={14} />, prompt: "Escrito de respuesta a requerimiento de información emitido por la autoridad fiscalizadora (SAT), exhibiendo contabilidad." },
      { title: "Juicio de Nulidad", icon: <Gavel size={14} />, prompt: "Demanda de Juicio Contencioso Administrativo (Juicio de Nulidad) ante el TFJA contra multa fiscal." }
    ],
    comercio: [
      { title: "Compraventa Internacional", icon: <Globe size={14} />, prompt: "Contrato de compraventa internacional de mercancías sujetas a Incoterms 2020." },
      { title: "Agenciamiento Aduanal", icon: <Building size={14} />, prompt: "Contrato de prestación de servicios de agenciamiento aduanal para el despacho de mercancías de importación." },
      { title: "Recurso PAMA", icon: <Scale size={14} />, prompt: "Escrito de alegatos y ofrecimiento de pruebas dentro de un Procedimiento Administrativo en Materia Aduanera (PAMA)." },
      { title: "Contrato de Transporte", icon: <Truck size={14} />, prompt: "Contrato de transporte de carga terrestre internacional con limitación de responsabilidad y seguros." }
    ]
  };

  const currentModels = draftingModelsByDomain[domain] || draftingModelsByDomain.mercantil;

  const handleDraft = async () => {
    if (!state.prompt.trim()) return;
    setState(prev => ({ ...prev, isGenerating: true }));
    try {
      const doc = await draftLegalDocument(state.prompt, domain);
      setState(prev => ({ ...prev, generatedDoc: doc, isGenerating: false }));
      notify("Instrumento proyectado exitosamente", "success");
    } catch (error) {
      notify("Error en la proyección técnica.", "error");
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(state.generatedDoc);
    notify("Texto copiado al portapapeles", "success");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-10 pb-4">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-4xl font-serif font-bold text-legal-900 tracking-tight">Ingeniería Jurídica</h2>
          <div className="relative group/help">
            <HelpCircle size={20} className="text-slate-400 cursor-help hover:text-legal-gold transition-colors mt-1" />
            <div className="absolute left-0 top-full mt-2 w-80 p-5 bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 pointer-events-none">
              <p className="text-[11px] font-bold text-legal-950 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Guía de Redacción</p>
              <ul className="space-y-3 text-[12px] leading-relaxed text-slate-600">
                <li><b>Plantillas Base:</b> Estructuras comunes listas para usar adaptadas al módulo activo.</li>
                <li><b>Personalización:</b> Detalle partes y objeto en el panel de instrucciones.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 max-w-5xl">
            {currentModels.map((m, i) => (
                <button 
                    key={i} 
                    onClick={() => setState(prev => ({ ...prev, prompt: m.prompt }))}
                    className={`flex items-center space-x-2 px-4 py-2 bg-white border rounded-xl text-xs font-bold transition-all shadow-sm ${state.prompt === m.prompt ? 'border-legal-gold text-legal-gold ring-2 ring-legal-gold/10' : 'border-slate-200 text-slate-600 hover:border-legal-gold hover:text-legal-gold'}`}
                >
                    {m.icon} <span>{m.title}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-10 pt-2 gap-8 overflow-hidden">
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Instrucciones de Redacción</label>
          <textarea
            value={state.prompt}
            onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder={`Describa el objeto del ${domain === 'fiscal' ? 'recurso o demanda' : 'contrato o instrumento'}...`}
            className="flex-1 w-full p-5 rounded-2xl border border-slate-200 outline-none text-sm bg-slate-50 mb-6 focus:border-legal-gold focus:ring-4 ring-legal-gold/5 transition-all resize-none leading-relaxed"
          />
          <button
            onClick={handleDraft}
            disabled={state.isGenerating || !state.prompt}
            className="w-full py-5 bg-legal-900 text-legal-gold rounded-2xl font-bold hover:bg-legal-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-xl shadow-legal-900/20"
          >
             {state.isGenerating ? <RefreshCw className="animate-spin" size={20}/> : <PenTool size={20} />}
             <span>Generar Instrumento Completo</span>
          </button>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 flex gap-3 z-10">
            {state.generatedDoc && (
              <>
                <button onClick={handleCopy} className="p-3 bg-white/90 border border-slate-200 text-slate-500 hover:text-legal-gold rounded-xl transition-all shadow-sm active:scale-95" title="Copiar"><Copy size={20} /></button>
                <button className="p-3 bg-white/90 border border-slate-200 text-slate-500 hover:text-legal-gold rounded-xl transition-all shadow-sm active:scale-95" title="Descargar"><Download size={20} /></button>
              </>
            )}
          </div>
          
          <div className="flex-1 p-12 overflow-y-auto font-serif text-[15px] leading-relaxed text-slate-800">
            {state.generatedDoc ? (
              <div className="max-w-3xl mx-auto whitespace-pre-wrap animate-in fade-in duration-700">
                {state.generatedDoc}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40">
                <FileText size={64} className="mb-6" />
                <h3 className="text-xl font-serif font-bold text-slate-700">Proyecto de Redacción</h3>
                <p className="max-w-sm text-center text-sm mt-2">Seleccione una plantilla o ingrese instrucciones para visualizar el instrumento integral.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};