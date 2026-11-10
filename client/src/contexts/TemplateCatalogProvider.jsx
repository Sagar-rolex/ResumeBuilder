import React, { useCallback, useEffect, useState } from "react";
import api from "../api";
import { fallbackTemplates, TemplateCatalogContext } from "./templateCatalog";

const TemplateCatalogProvider = ({ children }) => {
  const [templates, setTemplates] = useState(fallbackTemplates);
  const [rendererTemplates, setRendererTemplates] = useState(fallbackTemplates);
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/templates");
      if (Array.isArray(data?.templates)) setTemplates(data.templates);
      if (Array.isArray(data?.rendererTemplates)) setRendererTemplates(data.rendererTemplates);
    } catch {
      // Keep the code-bundled built-in layouts available while the API is unavailable.
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return <TemplateCatalogContext.Provider value={{ templates, rendererTemplates, refresh }}>{children}</TemplateCatalogContext.Provider>;
};

export default TemplateCatalogProvider;
