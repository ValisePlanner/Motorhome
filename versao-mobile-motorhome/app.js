// Armazenamento em memória unificado no padrão nativo do Premium
let originalPremiumData = {
    principal: { budget: 0, baseCurrency: "BRL", tripName: "Minha Viagem" },
    events: [],
    checklist: [],
    budget: {}
};

// Helper seguro para localStorage (Safari modo privado lança exceção)
const store = {
    get(key) {
        try { return localStorage.getItem(key); } catch(e) { return null; }
    },
    set(key, value) {
        try { localStorage.setItem(key, value); } catch(e) {}
    },
    remove(key) {
        try { localStorage.removeItem(key); } catch(e) {}
    }
};

let linksData     = JSON.parse(store.get('valise_links_v1'))     || [];
let linkFiltroAtivo = '';
let checklistData = JSON.parse(store.get('valise_checklist_v1')) || [];
let checklistFiltroAtivo = '';
let maintData      = JSON.parse(store.get('valise_manutencao_v1')) || [];
let hodometroAtual  = parseFloat(store.get('valise_hodometro_v1')) || 0;

// Limiares para classificar um item "amarelo" (a aproximar-se do vencimento)
const MAINT_LIMIAR_KM   = 1000; // dentro de 1000 km do previsto
const MAINT_LIMIAR_DIAS = 30;   // dentro de 30 dias da data prevista

const linkCatConfig = {
    'Consulado':   { emoji: '🏛️', bg: '#f0f4f8', color: '#2d5a3d' },
    'Museu':       { emoji: '🖼️', bg: '#f9f2f4', color: '#8b4060' },
    'Transporte':  { emoji: '🚌', bg: '#f1faf5', color: '#2d6b45' },
    'Saúde':       { emoji: '🏥', bg: '#fff1f1', color: '#b91c1c' },
    'Hotel':       { emoji: '🏨', bg: '#f9f2f4', color: '#7b3a5a' },
    'Restaurante': { emoji: '🍽️', bg: '#fff5ed', color: '#c2600a' },
    'Compras':     { emoji: '🛍️', bg: '#fdf2f2', color: '#9b2020' },
    'Emergência':  { emoji: '🚨', bg: '#fee2e2', color: '#dc2626' },
    'Outro':       { emoji: '📌', bg: '#f4f7f9', color: '#2d5a3d' },
};

// --- Inicialização ---
window.addEventListener('DOMContentLoaded', () => {
    inicializarEventos();
    renderizarLinks();
    renderizarChecklist();
    renderizarManutencao();
    
    // Carregar dados salvos automaticamente se existirem no Cache
    const dadosSalvos = store.get('valise_premium_data');
    if (dadosSalvos) {
        try {
            originalPremiumData = JSON.parse(dadosSalvos);
            renderizarMobile();
        } catch(e) {
            console.error("Erro ao carregar cache automático", e);
        }
    }
});

function inicializarEventos() {
    // Abas de navegação
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentBtn = e.currentTarget;
            mudarAba(currentBtn.dataset.tab, currentBtn);
        });
    });

    // Importador de arquivos
    document.getElementById('file-import').addEventListener('change', importarViagem);
    document.getElementById('btn-export').addEventListener('click', exportarESalvarViagem);
    document.getElementById('btn-clear-all').addEventListener('click', limparTudo);

    // Filtros de link
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            linkFiltroAtivo = e.currentTarget.dataset.cat;
            renderizarLinks();
        });
    });

    // Eventos do modal e FAB de cadastro (FAB é partilhado entre Links e Manutenção)
    document.getElementById('btn-add-fab').addEventListener('click', () => {
        const abaAtiva = document.querySelector('.nav-item.active');
        const tabId = abaAtiva ? abaAtiva.dataset.tab : 'links';
        if (tabId === 'manutencao') abrirModalManutencao(null);
        else abrirModalLink(null);
    });
    document.getElementById('modal-link').addEventListener('click', fecharModalLink);
    document.getElementById('btn-cancel-link').addEventListener('click', () => fecharModalLink(null));
    document.getElementById('btn-save-link').addEventListener('click', salvarLink);

    // Eventos da Aba Manutenção
    document.getElementById('modal-manutencao').addEventListener('click', fecharModalManutencao);
    document.getElementById('btn-cancel-maint').addEventListener('click', () => fecharModalManutencao(null));
    document.getElementById('btn-save-maint').addEventListener('click', salvarManutencao);
    document.querySelectorAll('#maint-status-grid .link-cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#maint-status-grid .link-cat-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });
    const histToggleBtn = document.getElementById('maint-historico-toggle');
    if (histToggleBtn) histToggleBtn.addEventListener('click', toggleHistoricoManutencao);
    const inputHodometro = document.getElementById('maint-hodometro-atual');
    if (inputHodometro) {
        inputHodometro.value = hodometroAtual || '';
        inputHodometro.addEventListener('change', () => {
            hodometroAtual = parseFloat(inputHodometro.value) || 0;
            store.set('valise_hodometro_v1', String(hodometroAtual));
            renderizarManutencao();
        });
    }

    // Seletores de categoria dentro do Modal
    document.querySelectorAll('#link-cat-grid .link-cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#link-cat-grid .link-cat-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });

    // Checklist eventos
    document.getElementById('btn-add-todo').addEventListener('click', adicionarItemChecklist);
    document.getElementById('checklist-novo-item').addEventListener('keydown', (e) => {
        if(e.key === 'Enter') adicionarItemChecklist();
    });
    document.getElementById('btn-toggle-novo-grupo').addEventListener('click', () => {
        const sel  = document.getElementById('checklist-grupo-select');
        const inp  = document.getElementById('checklist-grupo-novo');
        const btn  = document.getElementById('btn-toggle-novo-grupo');
        const novoVisivel = inp.style.display !== 'none';
        if (novoVisivel) {
            // Voltar ao select
            inp.style.display = 'none';
            sel.style.display = '';
            btn.innerHTML = '<i class="fas fa-tag"></i>';
            inp.value = '';
        } else {
            // Mostrar input de novo grupo
            sel.style.display = 'none';
            inp.style.display = '';
            inp.focus();
            btn.innerHTML = '<i class="fas fa-times"></i>';
        }
    });
}

// --- Gerenciamento Geral da Interface ---
// --- Limpar Tudo ---
function limparTudo() {
    const confirmacao = confirm("Tem certeza que deseja apagar TODOS os dados (roteiro, checklist e links)? Esta ação não pode ser desfeita.");
    if (!confirmacao) return;

    // Reseta o estado em memória
    originalPremiumData = {
        principal: { budget: 0, baseCurrency: "BRL", tripName: "Minha Viagem" },
        events: [],
        checklist: [],
        budget: {}
    };
    linksData = [];
    checklistData = [];
    maintData = [];
    hodometroAtual = 0;
    linkFiltroAtivo = '';
    checklistFiltroAtivo = '';

    // Limpa o armazenamento local
    store.remove('valise_premium_data');
    store.remove('valise_links_v1');
    store.remove('valise_checklist_v1');
    store.remove('valise_manutencao_v1');
    store.remove('valise_hodometro_v1');

    // Atualiza a interface
    document.getElementById('lbl-cidade').innerHTML = `<i class="fas fa-map-marker-alt"></i> Aguardando ficheiro de viagem...`;
    document.getElementById('mobile-cards-container').innerHTML = `<div class="finance-empty"><i class="fas fa-route"></i>Por favor, abra um roteiro de viagem.</div>`;

    // Reseta filtro de links para "Todos"
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    const chipTodos = document.querySelector('.filter-chip[data-cat=""]');
    if (chipTodos) chipTodos.classList.add('active');

    renderizarChecklist();
    renderizarLinks();
    const inputHodometro = document.getElementById('maint-hodometro-atual');
    if (inputHodometro) inputHodometro.value = '';
    renderizarManutencao();

    alert('Todos os dados foram apagados.');
}
window.limparTudo = limparTudo;

function mudarAba(tabId, botao) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) targetTab.classList.add('active');
    if (botao) botao.classList.add('active');

    const fab = document.getElementById('btn-add-fab');
    if (fab) fab.style.display = (tabId === 'links' || tabId === 'manutencao') ? 'flex' : 'none';

    if (tabId === 'links') renderizarLinks();
    if (tabId === 'checklist') renderizarChecklist();
    if (tabId === 'manutencao') renderizarManutencao();
}

function formatarDataBR(dataStr) {
    if (!dataStr) return "";
    const partes = dataStr.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
}

// --- Importação de Viagem ---
function importarViagem(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Reseta o input para permitir reabrir o mesmo arquivo
    event.target.value = '';

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let raw = JSON.parse(e.target.result);

            originalPremiumData.events = raw.events || [];
            originalPremiumData.budget = raw.allBudgets || raw.budget || {};
            originalPremiumData.cartoes = raw.cartoes || [];
            originalPremiumData.fuelLog = raw.fuelLog || [];

            // Resolve o nome da viagem: arquivo do desktop usa tripNames[], mobile usa principal.tripName
            let tripName = "Minha Viagem";
            if (raw.principal && raw.principal.tripName) {
                tripName = raw.principal.tripName;
            } else if (raw.tripNames && raw.tripNames.length > 0) {
                // Pega o primeiro nome que não seja o placeholder padrão
                const naopadrao = raw.tripNames.find(n => n && n !== "Viagem" && n !== "Trip");
                tripName = naopadrao || raw.tripNames[0];
            } else {
                // Tenta inferir pelo campo trip dos eventos
                const ev = (raw.events || []).find(ev => ev.trip && ev.trip !== "Viagem" && ev.trip !== "Trip");
                if (ev) tripName = ev.trip;
            }

            originalPremiumData.principal = {
                budget: raw.principal
                    ? (raw.principal.budget || 0)
                    : (raw.allBudgets ? Object.values(raw.allBudgets).reduce((a, b) => a + b, 0) : 0),
                baseCurrency: (raw.principal && raw.principal.baseCurrency) || "BRL",
                tripName: tripName
            };
            originalPremiumData.tripNames = raw.tripNames || [tripName];

            // Links: suporta campo nome (mobile) e name (desktop)
            if (raw.links && raw.links.length > 0) {
                linksData = raw.links.map(l => ({
                    id:       l.id       || Date.now().toString(36) + Math.random().toString(36).slice(2),
                    nome:     l.nome     || l.name    || '',
                    cat:      l.cat      || 'Outro',
                    endereco: l.endereco || l.address || '',
                    telefone: l.telefone || l.phone   || '',
                    url:      l.url      || '',
                    obs:      l.obs      || l.notes   || '',
                }));
                store.set('valise_links_v1', JSON.stringify(linksData));
            }

            // Checklist: suporta checks[] (desktop) e checklist[] (mobile)
            const rawChecklist = raw.checks || raw.checklist || [];
            checklistData = rawChecklist.map((c, i) => {
                if (typeof c === 'string') {
                    return { id: (Date.now() + i).toString(), texto: c, grupo: 'Geral', feito: false };
                }
                return {
                    id:    String(c.id || (Date.now() + i)),
                    texto: c.txt   || c.texto || c.text || c.item || c.title || c.desc || c.nome || '',
                    grupo: c.cat   || c.grupo || c.category || c.group || c.categoria || c.section || 'Geral',
                    feito: !!(c.done || c.feito || c.checked || c.concluido || false),
                };
            }).filter(c => c.texto);

            store.set('valise_checklist_v1', JSON.stringify(checklistData));

            // Manutenção: lê manLog[] (formato desktop real) com fallback para nomes alternativos
            const rawManutencao = raw.manLog || raw.manutencao || raw.maintenance || raw.manutencoes || [];
            if (rawManutencao.length > 0) {
                maintData = rawManutencao.map((m, i) => ({
                    id:           String(m.id || (Date.now() + i)),
                    data:         m.data || m.date || '',
                    trip:         m.trip || tripName,
                    tipo:         m.tipo || m.type || m.item || m.nome || m.name || '',
                    km:           (m.km !== undefined && m.km !== null && m.km !== '') ? parseFloat(m.km) : null,
                    custo:        (m.custo !== undefined && m.custo !== null && m.custo !== '') ? parseFloat(m.custo) : null,
                    local:        m.local || m.local_nome || m.oficina || '',
                    proxKm:       (m.proxKm !== undefined && m.proxKm !== null && m.proxKm !== '') ? parseFloat(m.proxKm) : null,
                    proxData:     m.proxData || '',
                    status:       m.status || 'Realizado',
                    obs:          m.obs || m.observacoes || m.notes || '',
                    meioPagamento: m.meioPagamento || '',
                    nomeCartao:   m.nomeCartao || '',
                    parcelas:     m.parcelas || 1,
                    dataPagamento: m.dataPagamento || ''
                })).filter(m => m.tipo);
                store.set('valise_manutencao_v1', JSON.stringify(maintData));
            }

            // Hodômetro atual do veículo: usa valor explícito do ficheiro, ou sugere
            // com base no maior km registado no manLog (só se ainda não houver valor definido)
            const rawHodometro = raw.hodometro || raw.odometro || raw.km_atual || raw.currentOdometer;
            if (rawHodometro !== undefined && rawHodometro !== null) {
                hodometroAtual = parseFloat(rawHodometro) || 0;
            } else if (!hodometroAtual && maintData.length > 0) {
                const maxKm = Math.max(0, ...maintData.map(m => m.km || 0));
                if (maxKm > 0) hodometroAtual = maxKm;
            }
            store.set('valise_hodometro_v1', String(hodometroAtual));
            const inputHodometro = document.getElementById('maint-hodometro-atual');
            if (inputHodometro) inputHodometro.value = hodometroAtual || '';

            store.set('valise_premium_data', JSON.stringify(originalPremiumData));

            renderizarMobile();
            renderizarChecklist();
            renderizarLinks();
            renderizarManutencao();
            alert('Roteiro carregado com sucesso!');
        } catch (err) {
            console.error(err);
            alert("Erro ao ler o ficheiro. Verifique se é um arquivo de viagem válido.");
        }
    };
    reader.readAsText(file);
}

// CORREÇÃO DO CÁLCULO FINANCEIRO UNIFICADO EM REAIS (R$)
function renderizarMobile() {
    const p = originalPremiumData.principal || {};
    document.getElementById('lbl-cidade').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${p.tripName || "Minha Viagem"}`;

    // 1. Renderização das Atividades (Aba Roteiro)
    const container = document.getElementById('mobile-cards-container');
    if (originalPremiumData.events && originalPremiumData.events.length > 0) {
        const ordenados = [...originalPremiumData.events].sort((a,b) => {
            const d = (a.data || '').localeCompare(b.data || '');
            return d !== 0 ? d : (a.hora || '').localeCompare(b.hora || '');
        });

        const dias = {};
        ordenados.forEach(ev => {
            const d = ev.data || "Sem Data Fixada";
            if (!dias[d]) dias[d] = [];
            dias[d].push(ev);
        });

        let html = "";
        Object.keys(dias).forEach(chaveDia => {
            html += `
                <div class="day-card">
                    <div class="day-card-header">
                        <i class="far fa-calendar-alt"></i> ${chaveDia === "Sem Data Fixada" ? chaveDia : "Dia " + formatarDataBR(chaveDia)}
                    </div>
            `;
            dias[chaveDia].forEach(item => {
                const valorNumerico = parseFloat(item.valor || 0);
                const infoFinanceira = valorNumerico > 0 ? ` | Custo: R$ ${valorNumerico.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '';
                html += `
                    <div class="day-activity-item">
                        <div class="activity-meta">
                            <div class="activity-title">${item.desc || item.classe || 'Atividade'}</div>
                            <div class="activity-time">${item.hora || ''}${infoFinanceira}</div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        });
        container.innerHTML = html;
    } else {
        container.innerHTML = `<div class="finance-empty"><i class="fas fa-route"></i>Nenhum evento no roteiro.</div>`;
    }

}

// CORREÇÃO DO PROCESSO DE SALVAMENTO CONTRA 'REPLACE OF NULL'
// Detecção de iOS para fallback de exportação
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

async function exportarESalvarViagem() {
    const principal = originalPremiumData.principal || {};
    const tripName = principal.tripName || "Minha_Viagem";

    // Exporta no formato nativo do desktop para garantir compatibilidade bidirecional
    const checksDesktop = checklistData.map(c => ({
        id:   Number(c.id) || Date.now(),
        txt:  c.texto  || '',
        cat:  c.grupo  || 'Geral',
        trip: c.trip   || (tripName !== "Minha_Viagem" ? tripName : "Viagem"),
        done: !!c.feito
    }));

    const linksDesktop = linksData.map(l => ({
        id:      l.id      || Date.now().toString(),
        name:    l.nome    || '',
        cat:     l.cat     || 'Outro',
        address: l.endereco || '',
        phone:   l.telefone || '',
        url:     l.url     || '',
        notes:   l.obs     || ''
    }));

    const tripNames = tripName && tripName !== "Minha Viagem"
        ? [tripName]
        : (originalPremiumData.tripNames || ["Viagem"]);

    const dadosParaSalvar = {
        principal: {
            budget: principal.budget || 0,
            baseCurrency: "BRL",
            tripName: tripName
        },
        events:    originalPremiumData.events || [],
        checks:    checksDesktop,
        checklist: checklistData,
        tripNames: tripNames,
        allBudgets: originalPremiumData.budget || {},
        cartoes:   originalPremiumData.cartoes || [],
        links:     linksDesktop,
        manLog:    maintData,
        fuelLog:   originalPremiumData.fuelLog || [],
        hodometro:  hodometroAtual,
        exportDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(dadosParaSalvar, null, 2);
    const nomeArquivoSugerido = `${tripStringSafe(tripName)}_valise.json`;

    if ('showSaveFilePicker' in window) {
        try {
            const opcoes = {
                suggestedName: nomeArquivoSugerido,
                types: [{
                    description: 'Ficheiro de Viagem Valise (JSON)',
                    accept: { 'application/json': ['.json', '.valise'] }
                }]
            };
            const handle = await window.showSaveFilePicker(opcoes);
            const writable = await handle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.warn("Diálogo nativo falhou, usando download alternativo...", err);
        }
    }

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // No iOS Safari, <a download> não funciona — abre o arquivo no browser.
    // Orientamos o utilizador a usar o botão de partilha para salvar em Ficheiros.
    if (isIOS) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 300);
        alert('iOS: O ficheiro abriu no browser. Toque no botão de partilha (□↑) e escolha "Guardar em Ficheiros" para salvar.');
        return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivoSugerido;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function tripStringSafe(str) {
    if (!str) return "Roteiro";
    return String(str).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

// --- Funções da Aba Checklist ---
function atualizarFiltroChecklist() {
    const bar = document.getElementById('checklist-filter-bar');
    if (!bar) return;

    const todosGrupos = [...new Set(checklistData.map(i => i.grupo || 'Geral'))].sort();

    // Mostra a barra só se houver mais de um grupo
    if (todosGrupos.length <= 1) {
        bar.style.display = 'none';
        checklistFiltroAtivo = '';
        return;
    }

    bar.style.display = 'flex';

    // Garante que o filtro ativo ainda existe; caso contrário reseta para "Todos"
    if (checklistFiltroAtivo && !todosGrupos.includes(checklistFiltroAtivo)) {
        checklistFiltroAtivo = '';
    }

    bar.innerHTML = `<button class="filter-chip${checklistFiltroAtivo === '' ? ' active' : ''}" data-grupo="">Todos</button>` +
        todosGrupos.map(g =>
            `<button class="filter-chip${checklistFiltroAtivo === g ? ' active' : ''}" data-grupo="${g}">${g}</button>`
        ).join('');

    bar.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            checklistFiltroAtivo = e.currentTarget.dataset.grupo;
            renderizarChecklist();
        });
    });
}

function renderizarChecklist() {
    const container = document.getElementById('checklist-list');
    if (!container) return;

    atualizarFiltroChecklist();

    if (checklistData.length === 0) {
        container.innerHTML = `<div class="checklist-empty"><i class="fas fa-check-double"></i>Nenhuma tarefa pendente.</div>`;
        atualizarProgressoChecklist();
        return;
    }

    // 1. Aplica filtro de grupo ativo
    const dadosFiltrados = checklistFiltroAtivo
        ? checklistData.filter(i => (i.grupo || 'Geral') === checklistFiltroAtivo)
        : checklistData;

    // 2. Agrupar os itens por Categoria/Grupo
    const grupos = {};
    dadosFiltrados.forEach((item) => {
        const nomeGrupo = item.grupo || 'Geral';
        if (!grupos[nomeGrupo]) grupos[nomeGrupo] = [];
        grupos[nomeGrupo].push(item);
    });

    // 3. Construir o HTML separando por blocos de categorias
    let htmlResultado = "";

    Object.keys(grupos).sort().forEach(nomeGrupo => {
        // Ordena os itens do grupo: não feitos primeiro, feitos por último
        const itensOrdenados = [...grupos[nomeGrupo]].sort((a, b) => a.feito - b.feito);

        // Omite o cabeçalho do grupo quando o filtro já está ativo nesse grupo
        if (!checklistFiltroAtivo) {
            htmlResultado += `
                <div class="checklist-group-header">
                    <i class="fas fa-tags"></i> ${nomeGrupo}
                </div>
            `;
        }

        itensOrdenados.forEach(item => {
            const realIndex = checklistData.findIndex(orig => orig.id === item.id);
            htmlResultado += `
            <div class="checklist-item">
                <div class="checklist-item-left" onclick="toggleItemChecklist(${realIndex})">
                    <div class="checklist-box${item.feito ? ' done' : ''}">
                        ${item.feito ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <span class="checklist-item-text${item.feito ? ' done' : ''}">${item.texto}</span>
                </div>
                <button class="checklist-item-del" onclick="removerItemChecklist(${realIndex})"><i class="fas fa-trash"></i></button>
            </div>
            `;
        });
    });

    container.innerHTML = htmlResultado || `<div class="checklist-empty"><i class="fas fa-check-double"></i>Nenhuma tarefa neste grupo.</div>`;
    atualizarProgressoChecklist();
    atualizarSelectGrupos();
}

function atualizarSelectGrupos() {
    const sel = document.getElementById('checklist-grupo-select');
    if (!sel) return;
    const gruposExistentes = [...new Set(checklistData.map(i => i.grupo || 'Geral'))].sort();
    const valorAtual = sel.value;
    sel.innerHTML = gruposExistentes.map(g => `<option value="${g}">${g}</option>`).join('');
    // Garante que sempre exista "Geral"
    if (!gruposExistentes.includes('Geral')) {
        sel.innerHTML = `<option value="Geral">Geral</option>` + sel.innerHTML;
    }
    if (gruposExistentes.includes(valorAtual)) sel.value = valorAtual;
}

function adicionarItemChecklist() {
    const input = document.getElementById('checklist-novo-item');
    if (!input || !input.value.trim()) return;

    const inputNovoGrupo = document.getElementById('checklist-grupo-novo');
    const sel = document.getElementById('checklist-grupo-select');
    const novoGrupoVisivel = inputNovoGrupo && inputNovoGrupo.style.display !== 'none';

    let grupo = 'Geral';
    if (novoGrupoVisivel && inputNovoGrupo.value.trim()) {
        grupo = inputNovoGrupo.value.trim();
        // Fecha o modo "novo grupo" e volta ao select
        inputNovoGrupo.style.display = 'none';
        inputNovoGrupo.value = '';
        if (sel) sel.style.display = '';
        const btn = document.getElementById('btn-toggle-novo-grupo');
        if (btn) btn.innerHTML = '<i class="fas fa-tag"></i>';
    } else if (sel) {
        grupo = sel.value || 'Geral';
    }

    checklistData.push({
        id: Date.now().toString(),
        texto: input.value.trim(),
        grupo: grupo,
        feito: false
    });

    store.set('valise_checklist_v1', JSON.stringify(checklistData));
    input.value = '';
    renderizarChecklist();
}

function toggleItemChecklist(index) {
    checklistData[index].feito = !checklistData[index].feito;
    store.set('valise_checklist_v1', JSON.stringify(checklistData));
    renderizarChecklist();
}

// Correção do escopo global para o botão dinâmico funcionar
window.toggleItemChecklist = toggleItemChecklist;

function removerItemChecklist(index) {
    checklistData.splice(index, 1);
    store.set('valise_checklist_v1', JSON.stringify(checklistData));
    renderizarChecklist();
}

window.removerItemChecklist = removerItemChecklist;

function atualizarProgressoChecklist() {
    const total = checklistData.length;
    const concluidos = checklistData.filter(i => i.feito).length;
    const porcentagem = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    const lbl = document.getElementById('checklist-progress-label');
    const barra = document.getElementById('checklist-bar');

    if (lbl) lbl.textContent = `${concluidos} de ${total} itens concluídos (${porcentagem}%)`;
    if (barra) barra.style.width = `${porcentagem}%`;
}

// --- Funções da Aba Links Úteis ---
function renderizarLinks() {
    const container = document.getElementById('links-list');
    if (!container) return;

    const filtrados = linkFiltroAtivo 
        ? linksData.filter(l => l.cat === linkFiltroAtivo)
        : linksData;

    if (filtrados.length === 0) {
        container.innerHTML = `<div class="links-empty"><i class="fas fa-map-pin"></i>Nenhum link guardado nesta categoria.</div>`;
        return;
    }

    container.innerHTML = filtrados.map(l => {
        const cfg = linkCatConfig[l.cat] || linkCatConfig['Outro'];
        const mapUrl = l.endereco ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.endereco)}` : null;

        return `
        <div class="link-card">
            <div class="link-card-header">
                <div class="link-cat-badge" style="background:${cfg.bg}; color:${cfg.color};">${cfg.emoji}</div>
                <div class="link-card-name">${l.nome}</div>
            </div>
            <div class="link-card-body">
                ${l.endereco ? `<div class="link-detail-row"><i class="fas fa-map-marker-alt"></i><span>${l.endereco}</span></div>` : ''}
                ${l.telefone ? `<div class="link-detail-row"><i class="fas fa-phone-alt"></i><a href="tel:${l.telefone}">${l.telefone}</a></div>` : ''}
                ${l.obs ? `<div class="link-detail-row"><i class="fas fa-info-circle"></i><span style="font-style:italic;">${l.obs}</span></div>` : ''}
            </div>
            <div class="link-card-actions">
                ${mapUrl ? `<button class="btn-link-action btn-map" onclick="window.open('${mapUrl}','_blank')"><i class="fas fa-map-marked-alt"></i> Mapa</button>` : ''}
                ${l.url ? `<button class="btn-link-action btn-site" onclick="window.open('${l.url}','_blank')"><i class="fas fa-external-link-alt"></i> Site</button>` : ''}
                <button class="btn-link-action btn-del" onclick="excluirLink('${l.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        `;
    }).join('');
}

function abrirModalLink(id = null) {
    const modal = document.getElementById('modal-link');
    modal.classList.add('open');

    if (id) {
        const l = linksData.find(item => item.id === id);
        if (l) {
            document.getElementById('link-edit-id').value = l.id;
            document.getElementById('link-nome').value = l.nome;
            document.getElementById('link-endereco').value = l.endereco;
            document.getElementById('link-telefone').value = l.telefone;
            document.getElementById('link-url').value = l.url;
            document.getElementById('link-obs').value = l.obs;

            document.querySelectorAll('#link-cat-grid .link-cat-btn').forEach(btn => {
                if (btn.dataset.val === l.cat) btn.classList.add('selected');
                else btn.classList.remove('selected');
            });
            return;
        }
    }

    document.getElementById('link-edit-id').value = '';
    document.getElementById('link-nome').value = '';
    document.getElementById('link-endereco').value = '';
    document.getElementById('link-telefone').value = '';
    document.getElementById('link-url').value = '';
    document.getElementById('link-obs').value = '';
    document.querySelectorAll('#link-cat-grid .link-cat-btn').forEach((btn, idx) => {
        if(idx === 0) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
}
window.abrirModalLink = abrirModalLink;

function fecharModalLink(e) {
    // Em iOS, e.target pode ser um elemento filho do overlay — usamos closest() para verificar
    if (e === null || (e.target && !e.target.closest('.modal-sheet'))) {
        document.getElementById('modal-link').classList.remove('open');
    }
}

function salvarLink() {
    const nome = document.getElementById('link-nome').value.trim();
    if (!nome) { alert('Insira o nome do local.'); return; }

    const id = document.getElementById('link-edit-id').value;
    const catBtn = document.querySelector('#link-cat-grid .link-cat-btn.selected');
    const cat = catBtn ? catBtn.dataset.val : 'Outro';

    const novo = {
        id: id || Date.now().toString(),
        nome: nome,
        cat: cat,
        endereco: document.getElementById('link-endereco').value.trim(),
        telefone: document.getElementById('link-telefone').value.trim(),
        url: document.getElementById('link-url').value.trim(),
        obs: document.getElementById('link-obs').value.trim()
    };

    if (id) {
        const idx = linksData.findIndex(l => l.id === id);
        if (idx !== -1) linksData[idx] = novo;
    } else {
        linksData.push(novo);
    }

    store.set('valise_links_v1', JSON.stringify(linksData));
    document.getElementById('modal-link').classList.remove('open');
    renderizarLinks();
}

function excluirLink(id) {
    if (confirm('Deseja eliminar este link?')) {
        linksData = linksData.filter(l => l.id !== id);
        store.set('valise_links_v1', JSON.stringify(linksData));
        renderizarLinks();
    }
}
window.excluirLink = excluirLink;

// --- Funções da Aba Manutenção ---

// Calcula o status (vermelho/amarelo/verde) e o texto descritivo de um registro
// do manLog, espelhando a lógica "Alertas de Manutenção" da versão desktop/motorhome.
// Regras:
//  - status "Agendado"  -> sempre amarelo, mostra a próxima data.
//  - status "Pendente"  -> sempre vermelho, "Manutenção pendente".
//  - status "Realizado" com proxKm definido   -> compara com o hodômetro atual.
//  - status "Realizado" com proxData definido -> compara com a data de hoje.
//  - status "Realizado" sem proxKm/proxData   -> não gera alerta (fica só no histórico).
function calcularStatusManutencao(item) {
    if (item.status === 'Agendado') {
        const dataBR = item.proxData ? formatarDataBR(item.proxData) : (item.data ? formatarDataBR(item.data) : '');
        return { status: 'amber', texto: dataBR ? `Agendado para ${dataBR}` : 'Agendado', alerta: true };
    }

    if (item.status === 'Pendente') {
        return { status: 'red', texto: 'Manutenção pendente', alerta: true };
    }

    // Realizado — verifica se há um próximo km ou próxima data a vigiar
    if (item.proxKm !== null && item.proxKm !== undefined && item.proxKm !== '') {
        const kmAlvo = parseFloat(item.proxKm);
        const diff = hodometroAtual - kmAlvo;
        if (diff >= 0) {
            return { status: 'red', texto: `Passou do hodômetro em ${diff.toLocaleString('pt-BR')} km (prev.: ${kmAlvo.toLocaleString('pt-BR')} km)`, alerta: true };
        } else if (Math.abs(diff) <= MAINT_LIMIAR_KM) {
            return { status: 'amber', texto: `Faltam ${Math.abs(diff).toLocaleString('pt-BR')} km (prev.: ${kmAlvo.toLocaleString('pt-BR')} km)`, alerta: true };
        }
        return { status: 'green', texto: `Em dia — próxima em ${kmAlvo.toLocaleString('pt-BR')} km`, alerta: false };
    }

    if (item.proxData) {
        const hoje = new Date(); hoje.setHours(0,0,0,0);
        const alvo = new Date(item.proxData + 'T00:00:00');
        const diffDias = Math.round((alvo - hoje) / 86400000);
        const dataBR = formatarDataBR(item.proxData);
        if (diffDias < 0) {
            return { status: 'red', texto: `Vencida há ${Math.abs(diffDias)} dias (${dataBR})`, alerta: true };
        } else if (diffDias <= MAINT_LIMIAR_DIAS) {
            return { status: 'amber', texto: `Agendado para ${dataBR}`, alerta: true };
        }
        return { status: 'green', texto: `Em dia — próxima em ${dataBR}`, alerta: false };
    }

    // Sem próximo km/data: registro histórico sem acompanhamento ativo
    return { status: 'green', texto: 'Sem acompanhamento futuro definido.', alerta: false };
}

function renderizarManutencao() {
    const container = document.getElementById('maint-list');
    const sub = document.getElementById('maint-summary-sub');
    const histToggle = document.getElementById('maint-historico-toggle');
    const histList = document.getElementById('maint-historico-list');
    if (!container) return;

    if (maintData.length === 0) {
        container.innerHTML = `<div class="maint-empty"><i class="fas fa-wrench"></i>Nenhum registro de manutenção cadastrado.</div>`;
        if (sub) sub.textContent = 'Nenhum registro cadastrado';
        if (histToggle) histToggle.style.display = 'none';
        if (histList) { histList.style.display = 'none'; histList.innerHTML = ''; }
        return;
    }

    const iconesStatus = { red: 'fa-circle-exclamation', amber: 'fa-clock', green: 'fa-circle-check' };
    const ordemStatus = { red: 0, amber: 1, green: 2 };

    const calculados = maintData.map(item => ({ item, calc: calcularStatusManutencao(item) }));

    // Alertas: apenas itens vermelhos/amarelos (Agendado, Pendente, ou vencido/próximo por km/data)
    const alertas = calculados.filter(c => c.calc.alerta)
                               .sort((a, b) => ordemStatus[a.calc.status] - ordemStatus[b.calc.status]);

    if (sub) {
        sub.textContent = alertas.length > 0
            ? `${alertas.length} de ${maintData.length} registros precisam de atenção`
            : `Todos os ${maintData.length} registros em dia`;
    }

    if (alertas.length === 0) {
        container.innerHTML = `<div class="maint-empty"><i class="fas fa-circle-check"></i>Nenhum alerta ativo no momento.</div>`;
    } else {
        container.innerHTML = alertas.map(({ item, calc }) => `
            <div class="maint-item status-${calc.status}">
                <div class="maint-item-icon"><i class="fas ${iconesStatus[calc.status]}"></i></div>
                <div class="maint-item-body">
                    <div class="maint-item-title">${item.tipo}</div>
                    <div class="maint-item-sub">${calc.texto}</div>
                    ${item.obs ? `<div class="maint-item-obs">${item.obs}</div>` : ''}
                </div>
                <div class="maint-item-actions">
                    <button class="btn-maint-edit" onclick="abrirModalManutencao('${item.id}')">Ver registro</button>
                    <button class="btn-maint-del" onclick="excluirManutencao('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');
    }

    // Histórico: todos os registros "Realizado", mais recentes primeiro
    const historico = maintData.filter(m => m.status === 'Realizado')
                                .sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    if (histToggle && histList) {
        if (historico.length === 0) {
            histToggle.style.display = 'none';
            histList.style.display = 'none';
            histList.innerHTML = '';
        } else {
            histToggle.style.display = 'block';
            document.getElementById('maint-historico-label').textContent =
                `Ver histórico completo (${historico.length})`;
            histList.innerHTML = historico.map(item => `
                <div class="maint-hist-item">
                    <div class="maint-hist-body">
                        <div class="maint-hist-title">${item.tipo}</div>
                        <div class="maint-hist-sub">${item.data ? formatarDataBR(item.data) : ''}${item.km ? ` • ${item.km.toLocaleString('pt-BR')} km` : ''}${item.local ? ` • ${item.local}` : ''}</div>
                    </div>
                    ${item.custo ? `<div class="maint-hist-custo">R$ ${item.custo.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>` : ''}
                </div>
            `).join('');
        }
    }
}

function toggleHistoricoManutencao() {
    const toggle = document.getElementById('maint-historico-toggle');
    const list = document.getElementById('maint-historico-list');
    const aberto = list.style.display !== 'none';
    list.style.display = aberto ? 'none' : 'block';
    toggle.classList.toggle('open', !aberto);
}
window.toggleHistoricoManutencao = toggleHistoricoManutencao;

function abrirModalManutencao(id = null) {
    const modal = document.getElementById('modal-manutencao');
    modal.classList.add('open');
    const titulo = document.getElementById('modal-maint-titulo');

    const setStatusSelecionado = (status) => {
        document.querySelectorAll('#maint-status-grid .link-cat-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.val === status);
        });
    };

    if (id) {
        const m = maintData.find(item => item.id === id);
        if (m) {
            titulo.textContent = 'Editar Registro de Manutenção';
            document.getElementById('maint-edit-id').value = m.id;
            document.getElementById('maint-nome').value = m.tipo || '';
            document.getElementById('maint-data').value = m.data || '';
            document.getElementById('maint-km').value = m.km ?? '';
            document.getElementById('maint-local').value = m.local || '';
            document.getElementById('maint-custo').value = m.custo ?? '';
            document.getElementById('maint-prox-km').value = m.proxKm ?? '';
            document.getElementById('maint-prox-data').value = m.proxData || '';
            document.getElementById('maint-obs').value = m.obs || '';
            setStatusSelecionado(m.status || 'Realizado');
            return;
        }
    }

    titulo.textContent = 'Novo Registro de Manutenção';
    document.getElementById('maint-edit-id').value = '';
    document.getElementById('maint-nome').value = '';
    document.getElementById('maint-data').value = new Date().toISOString().slice(0, 10);
    document.getElementById('maint-km').value = hodometroAtual || '';
    document.getElementById('maint-local').value = '';
    document.getElementById('maint-custo').value = '';
    document.getElementById('maint-prox-km').value = '';
    document.getElementById('maint-prox-data').value = '';
    document.getElementById('maint-obs').value = '';
    setStatusSelecionado('Realizado');
}
window.abrirModalManutencao = abrirModalManutencao;

function fecharModalManutencao(e) {
    if (e === null || (e.target && !e.target.closest('.modal-sheet'))) {
        document.getElementById('modal-manutencao').classList.remove('open');
    }
}

function salvarManutencao() {
    const nome = document.getElementById('maint-nome').value.trim();
    if (!nome) { alert('Insira o nome do item / serviço.'); return; }

    const id = document.getElementById('maint-edit-id').value;
    const statusBtn = document.querySelector('#maint-status-grid .link-cat-btn.selected');
    const status = statusBtn ? statusBtn.dataset.val : 'Realizado';
    const existente = id ? maintData.find(m => m.id === id) : null;

    const novo = {
        id: id || Date.now().toString(),
        data: document.getElementById('maint-data').value || '',
        trip: (existente && existente.trip) || (originalPremiumData.principal && originalPremiumData.principal.tripName) || '',
        tipo: nome,
        km: document.getElementById('maint-km').value !== '' ? parseFloat(document.getElementById('maint-km').value) : null,
        custo: document.getElementById('maint-custo').value !== '' ? parseFloat(document.getElementById('maint-custo').value) : null,
        local: document.getElementById('maint-local').value.trim(),
        proxKm: document.getElementById('maint-prox-km').value !== '' ? parseFloat(document.getElementById('maint-prox-km').value) : null,
        proxData: document.getElementById('maint-prox-data').value || '',
        status: status,
        obs: document.getElementById('maint-obs').value.trim(),
        meioPagamento: (existente && existente.meioPagamento) || '',
        nomeCartao: (existente && existente.nomeCartao) || '',
        parcelas: (existente && existente.parcelas) || 1,
        dataPagamento: (existente && existente.dataPagamento) || ''
    };

    if (id) {
        const idx = maintData.findIndex(m => m.id === id);
        if (idx !== -1) maintData[idx] = novo;
    } else {
        maintData.push(novo);
    }

    store.set('valise_manutencao_v1', JSON.stringify(maintData));
    document.getElementById('modal-manutencao').classList.remove('open');
    renderizarManutencao();
}

function excluirManutencao(id) {
    if (confirm('Deseja eliminar este registro de manutenção?')) {
        maintData = maintData.filter(m => m.id !== id);
        store.set('valise_manutencao_v1', JSON.stringify(maintData));
        renderizarManutencao();
    }
}
window.excluirManutencao = excluirManutencao;