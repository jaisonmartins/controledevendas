// Google Apps Script para integração com o sistema de vendas
// Cole este código no Google Apps Script (script.google.com)

function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case "abrirCaixa":
        return ContentService.createTextOutput(
          JSON.stringify(abrirCaixa())
        ).setMimeType(ContentService.MimeType.JSON);
      case "adicionarVenda":
        const venda = JSON.parse(e.parameter.venda);
        return ContentService.createTextOutput(
          JSON.stringify(adicionarVenda(venda))
        ).setMimeType(ContentService.MimeType.JSON);
      case "carregarVendas":
        return ContentService.createTextOutput(
          JSON.stringify(carregarVendas(e.parameter.data))
        ).setMimeType(ContentService.MimeType.JSON);
      case "carregarCategorias":
        return ContentService.createTextOutput(
          JSON.stringify(carregarCategorias())
        ).setMimeType(ContentService.MimeType.JSON);
      case "excluirVenda":
        return ContentService.createTextOutput(
          JSON.stringify(excluirVenda(e.parameter.item))
        ).setMimeType(ContentService.MimeType.JSON);
      case "obterEstatisticas":
        return ContentService.createTextOutput(
          JSON.stringify(
            obterEstatisticas(e.parameter.dataInicio, e.parameter.dataFim)
          )
        ).setMimeType(ContentService.MimeType.JSON);
      case "buscarTaxaPagamento":
        const empresa = e.parameter.empresa;
        const tipo = e.parameter.tipo;
        return ContentService.createTextOutput(
          JSON.stringify(buscarTaxaPagamento(empresa, tipo))
        ).setMimeType(ContentService.MimeType.JSON);
      case "carregarEmpresasPagamento":
        return ContentService.createTextOutput(
          JSON.stringify(carregarEmpresasPagamento())
        ).setMimeType(ContentService.MimeType.JSON);
      default:
        return ContentService.createTextOutput(
          JSON.stringify({
            success: false,
            message: "Ação não reconhecida",
          })
        ).setMimeType(ContentService.MimeType.JSON);

        function doPost(e) {
          try {
            const data = JSON.parse(e.postData.contents);

            switch (data.action) {
              case "abrirCaixa":
                return ContentService.createTextOutput(
                  JSON.stringify(abrirCaixa())
                ).setMimeType(ContentService.MimeType.JSON);
              case "adicionarVenda":
                return ContentService.createTextOutput(
                  JSON.stringify(adicionarVenda(data.venda))
                ).setMimeType(ContentService.MimeType.JSON);
              case "carregarVendas":
                return ContentService.createTextOutput(
                  JSON.stringify(carregarVendas(data.data))
                ).setMimeType(ContentService.MimeType.JSON);
              case "carregarCategorias":
                return ContentService.createTextOutput(
                  JSON.stringify(carregarCategorias())
                ).setMimeType(ContentService.MimeType.JSON);
              case "excluirVenda":
                return ContentService.createTextOutput(
                  JSON.stringify(excluirVenda(data.item))
                ).setMimeType(ContentService.MimeType.JSON);
              case "obterEstatisticas":
                return ContentService.createTextOutput(
                  JSON.stringify(
                    obterEstatisticas(data.dataInicio, data.dataFim)
                  )
                ).setMimeType(ContentService.MimeType.JSON);
              case "buscarTaxaPagamento":
                const empresa = data.empresa;
                const tipo = data.tipo;
                return ContentService.createTextOutput(
                  JSON.stringify(buscarTaxaPagamento(empresa, tipo))
                ).setMimeType(ContentService.MimeType.JSON);
              case "carregarEmpresasPagamento":
                return ContentService.createTextOutput(
                  JSON.stringify(carregarEmpresasPagamento())
                ).setMimeType(ContentService.MimeType.JSON);
              default:
                return ContentService.createTextOutput(
                  JSON.stringify({
                    success: false,
                    message: "Ação não reconhecida",
                  })
                ).setMimeType(ContentService.MimeType.JSON);
            }
          } catch (error) {
            return ContentService.createTextOutput(
              JSON.stringify({
                success: false,
                message: "Erro no servidor: " + error.message,
              })
            ).setMimeType(ContentService.MimeType.JSON);
          }
        }

        // Busca taxa de pagamento na aba tipopagamento
        function buscarTaxaPagamento(empresa, tipo) {
          try {
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const sheet = ss.getSheetByName("tipopagamento");
            if (!sheet) {
              return {
                success: false,
                taxa: "0",
                message: "Aba tipopagamento não encontrada",
              };
            }
            const data = sheet.getDataRange().getValues();
            for (let i = 1; i < data.length; i++) {
              if (data[i][0] == empresa && data[i][1] == tipo) {
                return { success: true, taxa: String(data[i][2]) };
              }
            }
            return { success: true, taxa: "0" };
          } catch (error) {
            return {
              success: false,
              taxa: "0",
              message: "Erro ao buscar taxa: " + error.message,
            };
          }
        }

        // Carrega empresas reais da aba tipopagamento
        function carregarEmpresasPagamento() {
          try {
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const sheet = ss.getSheetByName("tipopagamento");
            if (!sheet) {
              return {
                success: false,
                empresas: [],
                message: "Aba tipopagamento não encontrada",
              };
            }
            const data = sheet.getDataRange().getValues();
            const empresasSet = new Set();
            for (let i = 1; i < data.length; i++) {
              if (data[i][0]) {
                empresasSet.add(data[i][0]);
              }
            }
            return {
              success: true,
              empresas: Array.from(empresasSet),
              message: "Empresas carregadas com sucesso",
            };
          } catch (error) {
            return {
              success: false,
              empresas: [],
              message: "Erro ao carregar empresas: " + error.message,
            };
          }
        }
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "Erro no servidor: " + error.message,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function abrirCaixa() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Verifica se a aba "movimento" já existe
    let sheetMovimento = spreadsheet.getSheetByName("movimento");

    const cabecalhoCompleto = [
      "Item",
      "Produto",
      "Categoria",
      "Empresa",
      "Pagamento",
      "Valor Original",
      "Taxa (%)",
      "Valor Final",
      "Observações",
      "Data",
    ];

    if (!sheetMovimento) {
      // Cria nova aba "movimento"
      sheetMovimento = spreadsheet.insertSheet("movimento");
      sheetMovimento
        .getRange(1, 1, 1, cabecalhoCompleto.length)
        .setValues([cabecalhoCompleto]);
    } else {
      // Atualiza o cabeçalho se necessário
      const cabecalhoAtual = sheetMovimento
        .getRange(1, 1, 1, cabecalhoCompleto.length)
        .getValues()[0];
      let precisaAtualizar = false;
      for (let i = 0; i < cabecalhoCompleto.length; i++) {
        if (cabecalhoAtual[i] !== cabecalhoCompleto[i]) {
          precisaAtualizar = true;
          break;
        }
      }
      if (precisaAtualizar) {
        sheetMovimento
          .getRange(1, 1, 1, cabecalhoCompleto.length)
          .setValues([cabecalhoCompleto]);
      }
    }

    // Formata o cabeçalho
    const headerRange = sheetMovimento.getRange(
      1,
      1,
      1,
      cabecalhoCompleto.length
    );
    headerRange.setBackground("#4CAF50");
    headerRange.setFontColor("white");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");

    // Ajusta largura das colunas
    sheetMovimento.setColumnWidth(1, 60); // Item
    sheetMovimento.setColumnWidth(2, 200); // Produto
    sheetMovimento.setColumnWidth(3, 120); // Categoria
    sheetMovimento.setColumnWidth(4, 120); // Empresa
    sheetMovimento.setColumnWidth(5, 150); // Pagamento
    sheetMovimento.setColumnWidth(6, 100); // Valor Original
    sheetMovimento.setColumnWidth(7, 80); // Taxa (%)
    sheetMovimento.setColumnWidth(8, 100); // Valor Final
    sheetMovimento.setColumnWidth(9, 250); // Observações
    sheetMovimento.setColumnWidth(10, 100); // Data

    // Adiciona formatação de moeda nas colunas Valor Original e Valor Final
    sheetMovimento.getRange(2, 6, 1000, 1).setNumberFormat("R$ #,##0.00");
    sheetMovimento.getRange(2, 8, 1000, 1).setNumberFormat("R$ #,##0.00");
    // Adiciona formatação de porcentagem na coluna Taxa (%)
    sheetMovimento.getRange(2, 7, 1000, 1).setNumberFormat("0.00%");
    // Adiciona formatação de data na coluna Data
    sheetMovimento.getRange(2, 10, 1000, 1).setNumberFormat("dd/mm/yyyy");

    // Verifica se a aba "categorias" existe, se não, cria com categorias padrão
    let sheetCategorias = spreadsheet.getSheetByName("categorias");

    if (!sheetCategorias) {
      sheetCategorias = spreadsheet.insertSheet("categorias");

      // Configura o cabeçalho da aba categorias
      const cabecalhoCategorias = ["Categoria"];
      sheetCategorias
        .getRange(1, 1, 1, cabecalhoCategorias.length)
        .setValues([cabecalhoCategorias]);

      // Formata o cabeçalho
      const headerRangeCategorias = sheetCategorias.getRange(
        1,
        1,
        1,
        cabecalhoCategorias.length
      );
      headerRangeCategorias.setBackground("#FF9800");
      headerRangeCategorias.setFontColor("white");
      headerRangeCategorias.setFontWeight("bold");
      headerRangeCategorias.setHorizontalAlignment("center");

      // Adiciona categorias padrão
      const categoriasDefault = [["Acessórios"], ["Brinquedos"]];

      sheetCategorias
        .getRange(2, 1, categoriasDefault.length, 1)
        .setValues(categoriasDefault);

      // Ajusta largura da coluna
      sheetCategorias.setColumnWidth(1, 150);
    }

    // Retorna também a data atual para o frontend exibir no card
    const dataAtual = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    );
    return {
      success: true,
      message: "Sistema inicializado com sucesso",
      nomeAba: "movimento",
      dataAtual: dataAtual,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao inicializar sistema: " + error.message,
    };
  }
}

function adicionarVenda(venda) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheetMovimento = spreadsheet.getSheetByName("movimento");

    if (!sheetMovimento) {
      // Se a aba não existir, inicializa o sistema primeiro
      const resultadoAbrirCaixa = abrirCaixa();
      if (!resultadoAbrirCaixa.success) {
        return resultadoAbrirCaixa;
      }
      sheetMovimento = spreadsheet.getSheetByName("movimento");
    }

    // Encontra a próxima linha vazia
    const proximaLinha = sheetMovimento.getLastRow() + 1;

    // Formata a data para DD/MM/AAAA
    const dataVenda = new Date(venda.timestamp);
    const dataFormatada = Utilities.formatDate(
      dataVenda,
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    );

    // Buscar taxa na aba tipopagamento
    let taxa = 0;
    if (venda.empresa && venda.pagamento) {
      const taxaResp = buscarTaxaPagamento(venda.empresa, venda.pagamento);
      if (taxaResp.success) {
        taxa =
          parseFloat(
            String(taxaResp.taxa).replace("%", "").replace(",", ".")
          ) || 0;
      }
    }

    // Calcular valor final com desconto da taxa
    const valorOriginal = venda.valorOriginal || venda.valor;
    const valorFinal =
      taxa > 0 ? valorOriginal * (1 - taxa / 100) : valorOriginal;

    // Dados da venda (seguindo ordem exata do cabeçalho)
    // Item (número), Produto (texto), Categoria (texto), Empresa (texto), Pagamento (texto), Valor Original (número), Taxa (%) (número), Valor Final (número), Observações (texto), Data (data)
    const dadosVenda = [
      Number(venda.item) || "",
      String(venda.produto || ""),
      String(venda.categoria || ""),
      String(venda.empresa || ""),
      String(venda.pagamento || ""),
      Number(valorOriginal) || 0,
      Number(taxa) || 0,
      Number(valorFinal) || 0,
      String(venda.observacoes || ""),
      dataFormatada,
    ];

    // Insere os dados na aba movimento
    sheetMovimento
      .getRange(proximaLinha, 1, 1, dadosVenda.length)
      .setValues([dadosVenda]);

    // Aplica formatação alternada nas linhas
    if (proximaLinha % 2 === 0) {
      sheetMovimento
        .getRange(proximaLinha, 1, 1, dadosVenda.length)
        .setBackground("#f8f9fa");
    }

    // Adiciona formatação especial para categoria
    const categoriaCell = sheetMovimento.getRange(proximaLinha, 3);
    if (venda.categoria === "Acessórios") {
      categoriaCell.setBackground("#e1f5fe");
      categoriaCell.setFontColor("#01579b");
    } else if (
      venda.categoria === "Brinquedos" ||
      venda.categoria === "Brinquedo"
    ) {
      categoriaCell.setBackground("#fff3e0");
      categoriaCell.setFontColor("#e65100");
    }

    return {
      success: true,
      message: "Venda adicionada com sucesso",
      linha: proximaLinha,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao adicionar venda: " + error.message,
    };
  }
}

function carregarVendas(data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetMovimento = spreadsheet.getSheetByName("movimento");

    if (!sheetMovimento) {
      return {
        success: true,
        vendas: [],
        message: "Aba movimento não encontrada",
      };
    }

    const ultimaLinha = sheetMovimento.getLastRow();

    if (ultimaLinha <= 1) {
      return {
        success: true,
        vendas: [],
        message: "Nenhuma venda encontrada",
      };
    }

    // Carrega todos os dados (exceto o cabeçalho)
    const dadosRange = sheetMovimento.getRange(2, 1, ultimaLinha - 1, 10);
    const dados = dadosRange.getValues();

    // Formata a data de filtro para comparação
    const dataFiltro = new Date(data + "T00:00:00");
    const dataFiltroFormatada = Utilities.formatDate(
      dataFiltro,
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    );

    // Filtra vendas pela data (coluna 10)
    const vendasFiltradas = dados.filter((linha) => {
      const dataVenda = linha[9]; // Coluna Data
      if (dataVenda instanceof Date) {
        const dataVendaFormatada = Utilities.formatDate(
          dataVenda,
          Session.getScriptTimeZone(),
          "dd/MM/yyyy"
        );
        return dataVendaFormatada === dataFiltroFormatada;
      }
      return dataVenda === dataFiltroFormatada;
    });

    // Ordena do mais recente para o mais antigo (item decrescente)
    vendasFiltradas.sort(function (a, b) {
      return (parseInt(b[0], 10) || 0) - (parseInt(a[0], 10) || 0);
    });

    const vendas = vendasFiltradas.map((linha) => ({
      item: linha[0],
      produto: linha[1],
      categoria: linha[2],
      empresa: linha[3],
      pagamento: linha[4],
      valorOriginal: linha[5],
      taxa: linha[6],
      valor: linha[7],
      observacoes: linha[8],
      data: linha[9],
    }));

    return {
      success: true,
      vendas: vendas,
      message: `${vendas.length} vendas encontradas para ${dataFiltroFormatada}`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao carregar vendas: " + error.message,
    };
  }
}

function carregarCategorias() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheetCategorias = spreadsheet.getSheetByName("categorias");

    if (!sheetCategorias) {
      return {
        success: false,
        categorias: [],
        message:
          "Aba de categorias não encontrada. Crie a aba 'categorias' na planilha.",
      };
    }

    const ultimaLinha = sheetCategorias.getLastRow();

    if (ultimaLinha <= 1) {
      return {
        success: false,
        categorias: [],
        message:
          "Nenhuma categoria encontrada. Adicione categorias na aba 'categorias'.",
      };
    }

    // Carrega as categorias (exceto o cabeçalho)
    const dadosRange = sheetCategorias.getRange(2, 1, ultimaLinha - 1, 1);
    const dados = dadosRange.getValues();

    const categorias = dados
      .map((linha) => linha[0])
      .filter((categoria) => categoria && categoria.trim() !== "");

    return {
      success: true,
      categorias: categorias,
      message: "Categorias carregadas com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao carregar categorias: " + error.message,
    };
  }
}

function excluirVenda(item) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetMovimento = spreadsheet.getSheetByName("movimento");

    if (!sheetMovimento) {
      return {
        success: false,
        message: "Aba movimento não encontrada",
      };
    }

    const ultimaLinha = sheetMovimento.getLastRow();

    if (ultimaLinha <= 1) {
      return {
        success: false,
        message: "Nenhuma venda encontrada para excluir",
      };
    }

    // Busca a linha com o item especificado
    const range = sheetMovimento.getRange(2, 1, ultimaLinha - 1, 1); // Coluna A (Item)
    const valores = range.getValues();

    let linhaParaExcluir = -1;
    for (let i = 0; i < valores.length; i++) {
      if (valores[i][0] == item) {
        linhaParaExcluir = i + 2; // +2 porque começamos na linha 2
        break;
      }
    }

    if (linhaParaExcluir === -1) {
      return {
        success: false,
        message: "Item não encontrado",
      };
    }

    // Backup da linha antes de excluir (para log)
    const linhaBackup = sheetMovimento
      .getRange(linhaParaExcluir, 1, 1, 7)
      .getValues()[0];

    // Exclui a linha
    sheetMovimento.deleteRow(linhaParaExcluir);

    // Log da exclusão
    Logger.log(
      `Venda excluída - Item: ${item}, Produto: ${linhaBackup[1]}, Categoria: ${linhaBackup[2]}, Valor: ${linhaBackup[4]}`
    );

    return {
      success: true,
      message: "Venda excluída com sucesso",
      item: item,
      produtoExcluido: linhaBackup[1],
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao excluir venda: " + error.message,
    };
  }
}

// Função para testar a integração
function testarIntegracao() {
  Logger.log("Testando integração...");

  // Testa abrir caixa (inicializar sistema)
  const resultadoAbrirCaixa = abrirCaixa();
  Logger.log("Resultado inicializar sistema:", resultadoAbrirCaixa);

  // Testa carregar categorias
  const resultadoCategorias = carregarCategorias();
  Logger.log("Resultado carregar categorias:", resultadoCategorias);

  // Testa adicionar venda
  const vendaTeste = {
    item: 1,
    produto: "Produto Teste",
    categoria: "Acessórios",
    pagamento: "Dinheiro",
    valor: 10.5,
    observacoes: "Teste de integração",
    timestamp: new Date().toISOString(),
  };

  const resultadoVenda = adicionarVenda(vendaTeste);
  Logger.log("Resultado adicionar venda:", resultadoVenda);

  // Testa carregar vendas
  const hoje = new Date().toISOString().split("T")[0];
  const resultadoCarregar = carregarVendas(hoje);
  Logger.log("Resultado carregar vendas:", resultadoCarregar);
}

// Função para configurar permissões iniciais
function configurarPermissoes() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("Planilha configurada:", spreadsheet.getName());
  Logger.log("URL da planilha:", spreadsheet.getUrl());

  // Inicializa o sistema
  const resultado = abrirCaixa();
  Logger.log("Sistema inicializado:", resultado);
}

// Função para obter estatísticas das vendas por período
function obterEstatisticas(dataInicio, dataFim) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetMovimento = spreadsheet.getSheetByName("movimento");

    if (!sheetMovimento || sheetMovimento.getLastRow() <= 1) {
      return {
        success: true,
        estatisticas: {
          totalVendas: 0,
          valorTotal: 0,
          ticketMedio: 0,
          formasPagamento: {},
          categorias: {},
          vendasPorDia: {},
          produtosMaisVendidos: [],
          produtosPorDia: {},
        },
      };
    }

    const ultimaLinha = sheetMovimento.getLastRow();
    const dados = sheetMovimento
      .getRange(2, 1, ultimaLinha - 1, 10)
      .getValues();

    let valorTotal = 0;
    const formasPagamento = {};
    const categorias = {};
    const vendasPorDia = {};
    const produtosVendidos = {};
    const produtosPorDia = {};

    dados.forEach((linha) => {
      const valor = parseFloat(linha[7]); // Valor Final
      const pagamento = linha[4];
      const categoria = linha[2];
      const dataVenda = linha[9];
      const produto = linha[1];

      valorTotal += valor;

      // Agrupa por tipo de pagamento
      if (formasPagamento[pagamento]) {
        formasPagamento[pagamento] += valor;
      } else {
        formasPagamento[pagamento] = valor;
      }

      // Agrupa por categoria
      if (categorias[categoria]) {
        categorias[categoria] += valor;
      } else {
        categorias[categoria] = valor;
      }

      // Agrupa vendas por dia
      if (vendasPorDia[dataVenda]) {
        vendasPorDia[dataVenda]++;
      } else {
        vendasPorDia[dataVenda] = 1;
      }

      // Agrupa produtos mais vendidos (total)
      if (produtosVendidos[produto]) {
        produtosVendidos[produto]++;
      } else {
        produtosVendidos[produto] = 1;
      }

      // Agrupa produtos por dia
      if (!produtosPorDia[dataVenda]) {
        produtosPorDia[dataVenda] = {};
      }
      if (produtosPorDia[dataVenda][produto]) {
        produtosPorDia[dataVenda][produto]++;
      } else {
        produtosPorDia[dataVenda][produto] = 1;
      }
    });

    // Monta lista de produtos mais vendidos (total)
    const produtosMaisVendidos = Object.entries(produtosVendidos)
      .map(([produto, quantidade]) => ({ produto, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10); // Top 10

    // Monta lista de produtos por dia
    const produtosPorDiaFormatado = {};
    Object.entries(produtosPorDia).forEach(([data, produtos]) => {
      produtosPorDiaFormatado[data] = Object.entries(produtos)
        .map(([produto, quantidade]) => ({ produto, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);
    });

    const estatisticas = {
      totalVendas: dados.length,
      valorTotal: valorTotal,
      ticketMedio: dados.length > 0 ? valorTotal / dados.length : 0,
      formasPagamento: formasPagamento,
      categorias: categorias,
      vendasPorDia: vendasPorDia,
      produtosMaisVendidos: produtosMaisVendidos,
      produtosPorDia: produtosPorDiaFormatado,
    };

    return {
      success: true,
      estatisticas: estatisticas,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao obter estatísticas: " + error.message,
    };
  }
}
