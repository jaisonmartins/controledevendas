// Arquivo de conexão centralizado para URLs do sistema
export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1G0whVVjSAihvZ724i8yVNXSYutflna66vidWDXB7iQw/edit";

export const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxEpIX-YyjDpvIctlQzmr67NfbdSrN9CX1f6Chufx9OyRak5HBF3uOu_tQ77N68ozIw/exec";

// Configurações do sistema
export const CONFIG = {
  // Timeout para requisições (em milissegundos)
  REQUEST_TIMEOUT: 30000,

  // Retry automático em caso de falha
  MAX_RETRIES: 3,

  // Delay entre tentativas (em milissegundos)
  RETRY_DELAY: 1000,

  // Modo debug (exibe logs detalhados)
  DEBUG_MODE: true, // Habilitado para debug
};

// Função utilitária para fazer requisições com retry
export async function makeRequest(url, options = {}) {
  const { MAX_RETRIES, RETRY_DELAY, DEBUG_MODE } = CONFIG;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (DEBUG_MODE) {
        console.log(`🌐 Tentativa ${attempt}/${MAX_RETRIES}: ${url}`);
      }

      const response = await fetch(url, {
        ...options,
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (DEBUG_MODE) {
        console.log(`✅ Sucesso na tentativa ${attempt}:`, result);
      }

      return result;
    } catch (error) {
      if (DEBUG_MODE) {
        console.log(
          `❌ Tentativa ${attempt}/${MAX_RETRIES} falhou:`,
          error.message
        );
      }

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Falha após ${MAX_RETRIES} tentativas: ${error.message}`
        );
      }

      // Aguarda antes da próxima tentativa
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * attempt)
      );
    }
  }
}
