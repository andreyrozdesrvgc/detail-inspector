import { createContext, useCallback, useContext, useMemo, useState } from "react";

const LeadCtx = createContext(null);

export function LeadProvider({ children }) {
  const [state, setState] = useState({ open: false, source: "default", prefill: {} });

  const openLead = useCallback((opts = {}) => {
    setState({ open: true, source: opts.source || "default", prefill: opts.prefill || {} });
  }, []);

  const closeLead = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(() => ({ ...state, openLead, closeLead }), [state, openLead, closeLead]);
  return <LeadCtx.Provider value={value}>{children}</LeadCtx.Provider>;
}

export function useLead() {
  const ctx = useContext(LeadCtx);
  if (!ctx) throw new Error("useLead must be used inside LeadProvider");
  return ctx;
}
