
export interface Attachment {
  type: 'file' | 'text';
  mimeType?: string;
  data: string; // base64 for files, string content for text
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  attachment?: Attachment;
}

export enum AppView {
  CHAT = 'CHAT',
  DOCUMENT_ANALYSIS = 'DOCUMENT_ANALYSIS',
  DRAFTING = 'DRAFTING'
}

export type LegalDomain = 'mercantil' | 'fiscal' | 'comercio';

export interface AnalysisResult {
  summary: string;
  riskScore: number;
  pillars: Record<string, string>;
  risks: string[];
  recommendation: string;
}

export interface AnalyzedFile {
  fileName: string;
  fileBase64: string;
  mimeType: string;
  previewUrl: string | null;
}

export interface AnalyzedDocumentHistory {
  id: string;
  timestamp: Date;
  result: AnalysisResult;
  files: AnalyzedFile[];
  customInstruction: string;
}

export interface SavedCase {
  id: string;
  name: string;
  date: string;
  messages: ChatMessage[];
  analysisHistory: AnalyzedDocumentHistory[];
}

export interface DraftingState {
  prompt: string;
  generatedDoc: string;
  isGenerating?: boolean;
}

export interface DocumentAnalysisState {
  files: File[];
  result: AnalysisResult | null;
  customInstruction: string;
  isAnalyzing?: boolean;
}

export interface DemoUsage {
  messagesSent: number;
  docsAnalyzed: number;
  draftsGenerated: number;
}

export type NotificationType = 'error' | 'success' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
}
