import { useState, useEffect, useCallback, useMemo } from "react";

const DEFAULT_TEMPLATE =
  "Hola {name}, le recordamos que tiene un saldo pendiente de {remainingDebt}. Por favor realice el pago lo antes posible. Gracias.";

const CONTACTS_TEMPLATE =
  "Hola {name}, le escribimos de Ferretería Yenri para recordarle nuestros productos y servicios. Gracias.";

function normalizeKey(k) {
  return k
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(
      /[áéíóúñ]/g,
      (c) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n" })[c],
    );
}

function findBalanceColumn(columns) {
  const keywords = [
    "balancependiente",
    "balancep",
    "balance",
    "montodeuda",
    "monto",
    "restante",
    "pendiente",
    "remainingdebt",
    "deuda",
    "saldo",
    "total",
    "adeudo",
  ];
  for (const col of columns) {
    const key = normalizeKey(col);
    if (keywords.some((kw) => key.includes(kw))) return col;
  }
  return null;
}

function findIdColumn(columns) {
  const idKeywords = [
    "codigo",
    "numerocliente",
    "numero_cliente",
    "num_cliente",
    "id",
    "customerid",
  ];
  for (const col of columns) {
    const key = normalizeKey(col);
    if (idKeywords.includes(key)) return col;
  }
  return null;
}

function extractRowFields(row) {
  const norm = {};
  for (const key of Object.keys(row || {})) {
    norm[normalizeKey(key)] = row[key];
  }
  const name =
    norm["nombrecliente"] ||
    norm["nombrerepresentante"] ||
    norm["nombre_cliente"] ||
    norm["nombre"] ||
    norm["name"] ||
    norm["nombrer"] ||
    "Cliente";
  const telephone = String(
    norm["telefono"] || norm["phone"] || norm["numero"] || norm["number"] || "",
  ).trim();
  let remainingDebt = "";
  if (norm["balancependiente"] != null && norm["balancependiente"] !== "")
    remainingDebt = norm["balancependiente"];
  else if (norm["restante"] != null && norm["restante"] !== "")
    remainingDebt = norm["restante"];
  else if (norm["balance"] != null) remainingDebt = norm["balance"];
  else if (norm["saldo"] != null) remainingDebt = norm["saldo"];
  else if (norm["montodeuda"] != null) remainingDebt = norm["montodeuda"];
  else if (norm["remainingdebt"] != null) remainingDebt = norm["remainingdebt"];
  else if (norm["total"] != null && norm["abono"] != null) {
    const t = parseFloat(String(norm["total"]).replace(/[^0-9.-]+/g, "")) || 0;
    const a = parseFloat(String(norm["abono"]).replace(/[^0-9.-]+/g, "")) || 0;
    remainingDebt = t - a;
  } else if (norm["total"] != null) remainingDebt = norm["total"];
  return { name, telephone, remainingDebt };
}

const LS = (key, fallback) => () => {
  try {
    return JSON.parse(localStorage.getItem("wbot_" + key));
  } catch {
    return localStorage.getItem("wbot_" + key) ?? fallback;
  }
};
const saveLS = (key, val) => {
  try {
    localStorage.setItem("wbot_" + key, JSON.stringify(val));
  } catch {
    localStorage.setItem("wbot_" + key, String(val));
  }
};

export function useClientSource() {
  const [sourceType, setSourceType] = useState(() => LS("sourceType", "excel"));
  useEffect(() => {
    saveLS("sourceType", sourceType);
  }, [sourceType]);

  useEffect(() => {
    setRawData([]);
    setColumns([]);
    setFile(null);
    setFileUrl("");
    setSendResults({ enviados: [], fallidos: [] });
    if (sourceType !== "db") {
      setDbConnected(false);
      setDbStep("host");
      setDbStatus("");
    }
    const currentTemplate =
      localStorage.getItem("msgTemplate") || DEFAULT_TEMPLATE;
    if (
      sourceType === "contacts" &&
      currentTemplate.includes("{remainingDebt}")
    ) {
      setMessageTemplate(CONTACTS_TEMPLATE);
      localStorage.setItem("msgTemplate", CONTACTS_TEMPLATE);
    }
  }, [sourceType]);

  const [dbHost, setDbHost] = useState(() => LS("dbHost", "localhost"));
  const [dbPort, setDbPort] = useState(() => LS("dbPort", "3306"));
  const [dbUser, setDbUser] = useState(() => LS("dbUser", ""));
  const [dbPassword, setDbPassword] = useState(() => LS("dbPassword", ""));
  const [dbName, setDbName] = useState(() => LS("dbName", ""));
  const [dbTable, setDbTable] = useState(() => LS("dbTable", ""));

  const [dbConnected, setDbConnected] = useState(false);
  const [dbStep, setDbStep] = useState(() => LS("dbStep", "host"));
  const [dbStatus, setDbStatus] = useState("");
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);

  const saveDbConfig = useCallback(() => {
    saveLS("dbHost", dbHost);
    saveLS("dbPort", dbPort);
    saveLS("dbUser", dbUser);
    saveLS("dbPassword", dbPassword);
    saveLS("dbName", dbName);
    saveLS("dbTable", dbTable);
    saveLS("dbStep", dbStep);
    return true;
  }, [dbHost, dbPort, dbUser, dbPassword, dbName, dbTable, dbStep]);

  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const [rawData, setRawData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [allCustomers, setAllCustomers] = useState([]);
  const [excCustomers, setExcCustomers] = useState([]);
  const [exceptionIds, setExceptionIds] = useState([]);

  const [customFilters, setCustomFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wbot_customFilters")) || [];
    } catch {
      return [];
    }
  });

  const saveCustomFilters = useCallback(() => {
    localStorage.setItem("wbot_customFilters", JSON.stringify(customFilters));
    return true;
  }, [customFilters]);

  const [messageTemplate, setMessageTemplate] = useState(
    () => localStorage.getItem("msgTemplate") || DEFAULT_TEMPLATE,
  );

  const [sendResults, setSendResults] = useState({
    enviados: [],
    fallidos: [],
  });
  const [isSending, setIsSending] = useState(false);

  const [userInfo, setUserInfo] = useState(null);
  const [contactsCount, setContactsCount] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const addFeedback = useCallback((message, type) => {
    const id = Date.now() + Math.random();
    setFeedbacks((prev) => [...prev, { id, message, type: type || "info" }]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 4500);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const info = await window.api.getMe();
        if (info) setUserInfo(info);

        const cust = await window.api.getCustomers();
        if (cust.res) setAllCustomers(cust.result || []);
        const exc = await window.api.getExcCustomers();
        const ids = exc || [];
        setExceptionIds(ids);
        if (cust.res) {
          setExcCustomers(
            (cust.result || []).filter((c) => ids.includes(String(c.Codigo))),
          );
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    const handler = (e, data) => {
      setSendResults(data);
      setIsSending(false);
      const sent = (data.enviados || []).length;
      const failed = (data.fallidos || []).length;
      addFeedback(
        `Envío completado: ${sent} enviados, ${failed} fallidos`,
        failed > 0 ? "warning" : "success",
      );
    };
    window.api.onMsgResult(handler);
  }, [addFeedback]);

  const balanceColumn = useMemo(() => findBalanceColumn(columns), [columns]);
  const idColumn = useMemo(() => findIdColumn(columns), [columns]);

  const excludedByBalance = 0;

  const filteredData = useMemo(() => {
    let data = [...rawData];
    if (idColumn && exceptionIds.length > 0) {
      data = data.filter((r) => !exceptionIds.includes(String(r[idColumn])));
    }
    for (const f of customFilters) {
      if (f.column && f.operator && f.value !== "") {
        data = data.filter((r) => {
          const raw = r[f.column];
          const strVal = String(raw ?? "").trim();
          const numVal = parseFloat(strVal.replace(/[^0-9.-]+/g, ""));
          const isNum = !isNaN(numVal) && strVal.length > 0;
          if (isNum) {
            const fv = parseFloat(f.value);
            if (isNaN(fv)) return true;
            switch (f.operator) {
              case ">":
                return numVal > fv;
              case "<":
                return numVal < fv;
              case ">=":
                return numVal >= fv;
              case "<=":
                return numVal <= fv;
              case "==":
                return numVal === fv;
              case "!=":
                return numVal !== fv;
              default:
                return true;
            }
          } else {
            const lower = strVal.toLowerCase();
            const filterLower = f.value.toLowerCase();
            switch (f.operator) {
              case "==":
                return lower === filterLower;
              case "!=":
                return lower !== filterLower;
              case ">":
                return lower > filterLower;
              case "<":
                return lower < filterLower;
              case ">=":
                return lower >= filterLower;
              case "<=":
                return lower <= filterLower;
              default:
                return true;
            }
          }
        });
      }
    }
    return data;
  }, [rawData, columns, idColumn, exceptionIds, customFilters]);

  const authDbConfig = useMemo(
    () => ({
      host: dbHost,
      port: Number(dbPort) || 3306,
      username: dbUser,
      password: dbPassword,
    }),
    [dbHost, dbPort, dbUser, dbPassword],
  );
  const fullDbConfig = useMemo(
    () => ({ ...authDbConfig, database: dbName }),
    [authDbConfig, dbName],
  );

  const fetchDatabases = useCallback(async () => {
    const r = await window.api.getDatabases(authDbConfig);
    if (r.res) {
      setDatabases(r.result || []);
    }
  }, [authDbConfig]);

  const fetchTables = useCallback(
    async (db) => {
      if (!db) return;
      const r = await window.api.getTables(authDbConfig, db);
      if (r.res) {
        setTables(r.result || []);
      }
    },
    [authDbConfig],
  );

  useEffect(() => {
    if (dbName) fetchTables(dbName);
  }, [dbName, fetchTables]);

  const testConnection = useCallback(async () => {
    if (!dbUser || !dbPassword) {
      setDbStatus("Ingrese usuario y contraseña");
      return false;
    }
    setDbStatus("Probando conexión...");
    const r = await window.api.testDbConnection(authDbConfig);
    if (r.res) {
      setDbConnected(true);
      setDbStep("dbselect");
      setDbStatus("Conectado");
      setDbName("");
      setDbTable("");
      setDatabases([]);
      setTables([]);
      addFeedback("Conexión exitosa a la base de datos", "success");
      fetchDatabases();
      return true;
    }
    setDbConnected(false);
    setDbStatus("Error: " + r.message);
    addFeedback("Error de conexión: " + r.message, "error");
    return false;
  }, [authDbConfig, dbUser, dbPassword, addFeedback, fetchDatabases]);

  const loadDbData = useCallback(async () => {
    if (!dbConnected || !dbName || !dbTable) {
      addFeedback("Complete la configuración de la base de datos", "warning");
      return;
    }
    setIsLoading(true);
    const r = await window.api.getTableRows(fullDbConfig, dbTable);
    if (r.res) {
      setRawData(r.result || []);
      if (r.result && r.result.length > 0) setColumns(Object.keys(r.result[0]));
      const count = r.result ? r.result.length : 0;
      setDbStatus(count + " filas cargadas");
      addFeedback(count + " filas cargadas de " + dbTable, "success");
    } else {
      setDbStatus("Error: " + r.message);
      addFeedback("Error al cargar datos: " + r.message, "error");
    }
    setIsLoading(false);
  }, [dbConnected, dbName, dbTable, fullDbConfig, addFeedback]);

  const loadExcelFile = useCallback(
    async (f) => {
      if (!f) return;
      setIsLoading(true);
      try {
        const buf = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(f);
        });
        const r = await window.api.parseExcelBuffer(new Uint8Array(buf));
        if (r.res) {
          setRawData(r.result || []);
          if (r.result && r.result.length > 0)
            setColumns(Object.keys(r.result[0]));
          setFileUrl(f.name);
          addFeedback(
            "Archivo cargado: " +
              (r.result ? r.result.length : 0) +
              " registros",
            "success",
          );
        } else {
          addFeedback("Error al leer archivo: " + r.message, "error");
        }
      } catch (err) {
        addFeedback("Error al leer archivo: " + err.message, "error");
      }
      setIsLoading(false);
    },
    [addFeedback],
  );

  const loadWhatsAppContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const contacts = await window.api.getWhatsAppContacts();
      setRawData(contacts || []);
      setContactsCount(contacts ? contacts.length : 0);
      if (contacts && contacts.length > 0) {
        setColumns(Object.keys(contacts[0]));
      }
      addFeedback(
        "Contactos cargados: " + (contacts ? contacts.length : 0),
        "success",
      );
    } catch (err) {
      addFeedback("Error al cargar contactos: " + err.message, "error");
    }
    setIsLoading(false);
  }, [addFeedback]);

  useEffect(() => {
    if (sourceType === "contacts" && rawData.length === 0 && !isLoading) {
      loadWhatsAppContacts();
    }
  }, [sourceType, rawData.length, isLoading, loadWhatsAppContacts]);

  const updateExceptions = useCallback(async (ids) => {
    const r = await window.api.updateExcCustomers(ids);
    return r.res;
  }, []);

  const saveMessageTemplate = useCallback((t) => {
    setMessageTemplate(t);
    localStorage.setItem("msgTemplate", t);
  }, []);

  const sendMessages = useCallback(async () => {
    if (filteredData.length === 0) {
      addFeedback(
        "No hay datos para enviar después de aplicar los filtros",
        "warning",
      );
      return;
    }
    setIsSending(true);
    setSendResults({ enviados: [], fallidos: [] });
    addFeedback("Enviando " + filteredData.length + " mensajes...", "info");
    try {
      const debtors = filteredData.map((row) => {
        const { name, telephone, remainingDebt } = extractRowFields(row);
        return { name, telephone, remainingDebt };
      });
      const r = await window.api.sendMsg(messageTemplate, null, null, debtors);
      if (r) setSendResults(r);
    } catch (err) {
      setSendResults({ enviados: [], fallidos: [], error: err.message });
      addFeedback("Error al enviar: " + err.message, "error");
    }
  }, [filteredData, messageTemplate, addFeedback]);

  return {
    sourceType,
    setSourceType,
    dbHost,
    setDbHost,
    dbPort,
    setDbPort,
    dbUser,
    setDbUser,
    dbPassword,
    setDbPassword,
    dbName,
    setDbName,
    dbTable,
    setDbTable,
    dbConnected,
    setDbConnected,
    dbStep,
    setDbStep,
    dbStatus,
    setDbStatus,
    databases,
    tables,
    fetchDatabases,
    fetchTables,
    testConnection,
    loadDbData,
    saveDbConfig,
    file,
    setFile,
    fileUrl,
    setFileUrl,
    loadExcelFile,
    rawData,
    columns,
    filteredData,
    isLoading,
    allCustomers,
    excCustomers,
    setExcCustomers,
    exceptionIds,
    updateExceptions,
    customFilters,
    setCustomFilters,
    saveCustomFilters,
    messageTemplate,
    saveMessageTemplate,
    sendResults,
    isSending,
    sendMessages,
    addFeedback,
    excludedByBalance,
    balanceColumn,
    idColumn,
    feedbacks,
    userInfo,
    loadWhatsAppContacts,
    contactsCount,
  };
}
