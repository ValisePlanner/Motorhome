let events = JSON.parse(localStorage.getItem('tp_v17')) || [];
    let checks = JSON.parse(localStorage.getItem('tc_v17')) || [];
    let tripNames = JSON.parse(localStorage.getItem('tr_names_v17')) || ["Viagem"];
    let cartoes = JSON.parse(localStorage.getItem('tp_cartoes_v17')) || ["Nubank", "Itaú", "Bradesco", "Inter", "XP"];
    let links = JSON.parse(localStorage.getItem('tp_links_v17')) || [];
    let allBudgets = JSON.parse(localStorage.getItem('tp_budgets_v18')) || {};
    let fuelLog = JSON.parse(localStorage.getItem('tp_fuel_v1')) || [];
    let manLog = JSON.parse(localStorage.getItem('tp_man_v1')) || [];
    let globalTripFilter = "";
    let pendingCheckTrip = "";
    let pendingLinkTrip = "";
    let chartD, chartC, chartCity, chartPay, chartCurrency;

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            const msg = currentLang === 'en'
                ? 'Storage full! Some data could not be saved. Please export a backup and clear old data.'
                : 'Armazenamento cheio! Alguns dados não puderam ser salvos. Exporte um backup e limpe dados antigos.';
            alert(msg);
        }
    }
    let currentLang = 'pt';

    Chart.register(ChartDataLabels);

    const iconConfig = { 
        'Aéreo': { icon: 'fa-plane', color: '#88d8b0', bg: '#f1faf5' },
        'Aluguel de carro': { icon: 'fa-car', color: '#8d99ae', bg: '#f4f5f7' },
        'Camping Fee': { icon: 'fa-campground', color: '#6aaa64', bg: '#eef7ee' },
        'Combustível': { icon: 'fa-gas-pump', color: '#f4a259', bg: '#fff8f0' },
        'Compras': { icon: 'fa-shopping-bag', color: '#d4a5a5', bg: '#fdf2f2' },
        'Energia / Solar': { icon: 'fa-solar-panel', color: '#f0c040', bg: '#fffbea' },
        'GLP / Gás': { icon: 'fa-fire-flame-curved', color: '#e07b54', bg: '#fff1ec' },
        'Hospedagem': { icon: 'fa-hotel', color: '#c38d9e', bg: '#f9f2f4' },
        'Internet/Fone': { icon: 'fa-wifi', color: '#5da9a1', bg: '#eefbfa' },
        'Lavanderia': { icon: 'fa-soap', color: '#9bafd9', bg: '#f0f4fc' },
        'Lazer': { icon: 'fa-landmark', color: '#95b8d1', bg: '#f4f7f9' },
        'Manutenção / Mecânica': { icon: 'fa-wrench', color: '#b07d4a', bg: '#faf4ec' },
        'Pedágio': { icon: 'fa-road', color: '#b5a886', bg: '#f9f7f2' },
        'Refeição': { icon: 'fa-utensils', color: '#e8a87c', bg: '#fff5ed' },
        'Seguro': { icon: '🛡️', color: '#6c9bd1', bg: '#eef4fb', emoji: true },
        'Transporte': { icon: 'fa-bus', color: '#7fa9c4', bg: '#f0f4f8' },
        'Água / Esgoto': { icon: 'fa-droplet', color: '#5aabcc', bg: '#eaf6fb' }
    };

    /* Renderiza o ícone de uma categoria: emoji (ex.: Seguro) ou Font Awesome */
    function catIconHtml(cfg, extraStyle) {
        const style = extraStyle || '';
        if (cfg.emoji) {
            return `<span style="font-size:1em; line-height:1; ${style}">${cfg.icon}</span>`;
        }
        return `<i class="fas ${cfg.icon}" style="${style}"></i>`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        const daysOfWeek = t('days');
        const months = t('months');
        const ddd = daysOfWeek[date.getDay()];
        const dd = parts[2].padStart(2, '0');
        const mmm = months[date.getMonth()];
        const aaaa = parts[0];
        return `${ddd} ${dd} ${mmm} ${aaaa}`;
    }

    // ========== SISTEMA DE INTERNACIONALIZAÇÃO (i18n) ==========
    const i18n = {
        pt: {
            tab_links: '🔗 Links & Endereços',
            // Tabs
            tab_timeline: 'Timeline',
            tab_cards: 'Card Diário',
            tab_finance: 'Financeiro',
            tab_checklist: 'Checklist',
            tab_cronograma: '💳 Fluxo de Caixa',
            tab_combustivel: '⛽ Abastecimento',
            lbl_fuel_date: 'Data', lbl_fuel_trip: 'Viagem', lbl_fuel_city: 'Cidade / Local',
            lbl_fuel_posto: 'Posto', lbl_fuel_km: 'Hodômetro (km)', lbl_fuel_litros: 'Litros',
            lbl_fuel_preco: 'Preço / Litro (R$)', lbl_fuel_total: 'Total (R$)',
            lbl_fuel_tipo: 'Combustível', lbl_fuel_obs: 'Observações',
            fuel_no_items: 'Nenhum abastecimento registrado ainda.',
            fuel_confirm_delete: 'Excluir este abastecimento?',
            tab_manutencao: '🔧 Manutenção',
            lbl_man_date: 'Data',
            lbl_man_type: 'Tipo de Serviço',
            lbl_man_km: 'Hodômetro (km)',
            lbl_man_cost: 'Custo (R$)',
            lbl_man_local: 'Oficina / Local',
            lbl_man_next_km: 'Próxima troca (km)',
            lbl_man_next_date: 'Próxima troca (data)',
            lbl_man_status: 'Status',
            lbl_man_obs: 'Observações',
            man_no_items: 'Nenhuma manutenção registrada ainda.',
            man_confirm_delete: 'Excluir este registro de manutenção?',
            tab_help: '❓ Como Usar',
            btn_export: 'Exportar',
            btn_import: 'Importar',
            btn_print: 'Imprimir',
            // Form labels
            lbl_trip_title: 'Título da Viagem',
            lbl_new_trip: 'Nova Viagem',
            lbl_city: 'DESTINO DO DIA',
            lbl_accommodation: 'CIDADE BASE',
            lbl_date: 'Data',
            lbl_time: 'Hora',
            lbl_activity: 'Atividade',
            lbl_category: 'Categoria',
            lbl_value: 'Valor',
            lbl_rate: 'Cotação',
            lbl_total_brl: '💰 Total convertido',
            lbl_filter_trip: 'Selecionar Viagem (Filtro)',
            lbl_filter_trip_short: 'Filtrar Viagem',
            lbl_filter_date: 'Data (Filtro)',
            lbl_filter_city: 'Filtrar Cidade',
            lbl_filter_category: 'Filtrar Categoria',
            lbl_what_to_pack: 'O que levar/fazer?',
            lbl_new_cat: 'Nova',
            lbl_installments: 'Parcelas (Hosp. e Aéreo)',
            lbl_installments_aereo: '✈️ Parcelas Aéreo',
            lbl_installments_hosp: '🏨 Parcelas Hospedagem',
            lbl_payment_method: '💳 Meio de Pagamento',
            lbl_card_name: 'Nome do Cartão',
            lbl_payment_installments: 'Parcelas',
            lbl_payment_date: '📅 Data de Vencimento',
            lbl_payment_method_label: 'Pagamento',
            pay_credit: '💳 Crédito',
            pay_debit: '🏧 Débito',
            pay_pix: '⚡ Pix',
            pay_cash: '💵 Dinheiro',
            pay_other: '📎 Outro',
            prompt_new_card: 'Nome do novo cartão (ex: Nubank, Itaú Gold):',
            // Buttons
            btn_save: 'Salvar',
            btn_clear: 'Limpar',
            btn_set_budget: 'Definir Orçamento',
            btn_save_budgets: 'Salvar Orçamentos',
            // Select options
            opt_all_trips: 'Todas as Viagens',
            opt_all_dates: 'Todas as Datas',
            opt_all_cities: 'Todas as Cidades',
            opt_all_categories: 'Todas as Categorias',
            opt_cash: 'À vista (1x)',
            // Finance
            finance_total_label: 'Gasto Total (Filtrado)',
            budget_header: '📊 Evolução do Orçamento Planejado',
            budget_info: 'Defina o orçamento planejado. Deixe em branco para não monitorar uma categoria.',
            budget_total_label: '💰 Total da Viagem',
            budget_planned: 'Planejado',
            budget_spent: 'Gasto',
            budget_balance: 'Saldo',
            budget_no_budget: 'Sem orçamento',
            budget_over: '⚠️ Acima do orçamento',
            budget_used: '% utilizado',
            budget_set_hint: 'Clique em <b>"Definir Orçamento"</b> para configurar o orçamento planejado da viagem e acompanhar a evolução dos gastos.',
            budget_total_pill: 'Orçado',
            budget_spent_pill: 'Gasto',
            // Fluxo de Caixa
            cron_title: '💳 Fluxo de Caixa',
            cron_desc: 'Compras parceladas são distribuídas mensalmente a partir da data do próximo vencimento do meio de pagamento. Demais gastos são alocados no mês do evento.',
            cron_month: 'Mês',
            cron_aerial: '✈️ Aéreo',
            cron_accommodation: '🏨 Hospedagem',
            cron_others: '📦 Outros',
            cron_month_total: '💰 Total Mês',
            cron_total: 'TOTAL',
            cron_items_label: 'Itens deste mês:',
            cron_chart_title: 'Desembolso Mensal por Categoria',
            // Charts
            chart_daily: 'Gasto por Dia',
            chart_category: 'Por Categoria',
            chart_city: 'Por Cidade',
            // Prompts / confirms
            confirm_delete_item: 'Excluir este item?',
            lbl_hidden_from_client: 'Oculto do cliente',
            lbl_toggle_client_visibility: 'Ocultar/Exibir este item no roteiro do cliente',
            btn_export_client: 'Roteiro do Cliente',
            client_itinerary_title: 'Roteiro de Viagem',
            client_no_trip_selected: 'Selecione uma viagem específica no filtro para gerar o roteiro do cliente.',
            confirm_import: 'Isso substituirá os dados atuais. Deseja continuar?',
            prompt_new_trip: 'Digite o nome da nova viagem:',
            btn_clear_data: 'Limpar Dados',
            confirm_clear_data: 'Isso apagará TODOS os dados (eventos, checklist, viagens, cartões e orçamentos). Esta ação não pode ser desfeita. Deseja continuar?',
            error_import: 'Erro ao ler o arquivo.',
            // Extra labels/options sem tradução
            lbl_currency: 'Moeda',
            lbl_show_chart: '📊 Exibir Gráfico',
            lbl_delete_trip: 'Excluir Viagem',
            lbl_add_card: 'Adicionar cartão',
            placeholder_new_cat: 'Ex: Saúde',
            opt_all_charts: 'Todos os Gráficos',
            opt_chart_daily: '📅 Gasto por Dia',
            opt_chart_category: '🏷️ Por Categoria',
            opt_chart_city: '🏙️ Por Cidade',
            opt_chart_payment: '💳 Meio de Pagamento',
            opt_select_card: '— Selecione —',
            opt_cash_installment: 'À vista (1x)',
            opt_cat_aereo: '✈️ Aéreo',
            opt_cat_aluguelcarro: '🚗 Aluguel de carro',
            opt_cat_campingfee: '🏕️ Camping Fee',
            opt_cat_combustivel: '⛽ Combustível',
            opt_cat_compras: '🛍️ Compras',
            opt_cat_energiasolar: '🔆 Energia / Solar',
            opt_cat_glpgas: '🔥 GLP / Gás',
            opt_cat_hospedagem: '🏨 Hospedagem',
            opt_cat_internetfone: '📶 Internet/Fone',
            opt_cat_lavanderia: '🧺 Lavanderia',
            opt_cat_lazer: '🏛️ Lazer',
            opt_cat_manutencao: '🔧 Manutenção / Mecânica',
            opt_cat_pedagio: '🛣️ Pedágio',
            opt_cat_refeicao: '🍴 Refeição',
            opt_cat_seguro: '🛡️ Seguro',
            opt_cat_transporte: '🚌 Transporte',
            opt_cat_aguaesgoto: '💧 Água / Esgoto',
            opt_payment_credit: '💳 Cartão de Crédito',
            opt_payment_debit: '🏧 Cartão de Débito',
            opt_payment_pix: '⚡ Pix',
            opt_payment_cash: '💵 Dinheiro',
            opt_payment_other: '📎 Outro',
            // Checklist base categories
            check_cat_bagagem: 'Bagagem',
            check_cat_documentos: 'Documentos',
            check_cat_financeiro: 'Financeiro',
            check_lbl_group: 'Grupo',
            check_lbl_filter_group: 'Filtrar Grupo',
            // Links & Endereços
            lbl_links_name: 'Nome / Local',
            lbl_links_category: 'Categoria',
            lbl_links_trip: 'Viagem',
            lbl_links_address: 'Endereço',
            lbl_links_phone: 'Telefone',
            lbl_links_url: 'Website / Link',
            lbl_links_notes: 'Observações',
            lbl_links_search: 'Buscar',
            btn_add_link: 'Adicionar',
            btn_save_link: 'Salvar',
            ph_links_name: 'Ex: Consulado dos EUA',
            ph_links_address: 'Ex: 1234 Main St, New York',
            ph_links_phone: 'Ex: +1 (212) 000-0000',
            ph_links_url: 'https://...',
            ph_links_notes: 'Ex: Horário de funcionamento...',
            ph_links_search: 'Nome ou endereço...',
            opt_link_consulado: '🏛️ Consulado / Embaixada',
            opt_link_museu: '🖼️ Museu / Atração',
            opt_link_transporte: '🚌 Transporte',
            opt_link_saude: '🏥 Saúde / Hospital',
            opt_link_hotel: '🏨 Hotel / Hospedagem',
            opt_link_camping: '🚐 Camping / Área RV',
            opt_link_restaurante: '🍽️ Restaurante',
            opt_link_compras: '🛍️ Compras',
            opt_link_emergencia: '🚨 Emergência',
            opt_link_outro: '📌 Outro',
            links_no_items: 'Nenhum link cadastrado ainda.',
            links_open_map: 'Ver no mapa',
            links_open_site: 'Visitar site',
            links_copy_address: 'Copiar endereço',
            links_edit: 'Editar',
            links_delete: 'Excluir',
            confirm_delete_link: 'Excluir este item?',
            // Months
            months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        },
        en: {
            tab_links: '🔗 Links & Addresses',
            // Tabs
            tab_timeline: 'Timeline',
            tab_cards: 'Daily Cards',
            tab_finance: 'Finances',
            tab_checklist: 'Checklist',
            tab_cronograma: '💳 Cash Flow',
            tab_combustivel: '⛽ Fuel Log',
            lbl_fuel_date: 'Date', lbl_fuel_trip: 'Trip', lbl_fuel_city: 'City / Location',
            lbl_fuel_posto: 'Gas Station', lbl_fuel_km: 'Odometer (km)', lbl_fuel_litros: 'Liters',
            lbl_fuel_preco: 'Price / Liter (R$)', lbl_fuel_total: 'Total (R$)',
            lbl_fuel_tipo: 'Fuel Type', lbl_fuel_obs: 'Notes',
            fuel_no_items: 'No fueling records yet.',
            fuel_confirm_delete: 'Delete this fueling record?',
            tab_manutencao: '🔧 Maintenance',
            lbl_man_date: 'Date',
            lbl_man_type: 'Service Type',
            lbl_man_km: 'Odometer (km)',
            lbl_man_cost: 'Cost (R$)',
            lbl_man_local: 'Workshop / Location',
            lbl_man_next_km: 'Next service (km)',
            lbl_man_next_date: 'Next service (date)',
            lbl_man_status: 'Status',
            lbl_man_obs: 'Notes',
            man_no_items: 'No maintenance records yet.',
            man_confirm_delete: 'Delete this maintenance record?',
            tab_help: '❓ How to Use',
            btn_export: 'Export',
            btn_import: 'Import',
            btn_print: 'Print',
            // Form labels
            lbl_trip_title: 'Trip Name',
            lbl_new_trip: 'New Trip',
            lbl_city: 'City',
            lbl_accommodation: 'Accommodation',
            lbl_date: 'Date',
            lbl_time: 'Time',
            lbl_activity: 'Activity',
            lbl_category: 'Category',
            lbl_value: 'Amount',
            lbl_rate: 'Rate (1 → base)',
            lbl_total_brl: '💰 Converted Total',
            lbl_filter_trip: 'Select Trip (Filter)',
            lbl_filter_trip_short: 'Filter Trip',
            lbl_filter_date: 'Date (Filter)',
            lbl_filter_city: 'Filter City',
            lbl_filter_category: 'Filter Category',
            lbl_what_to_pack: 'What to bring/do?',
            lbl_new_cat: 'New',
            lbl_installments: 'Installments (Accom. & Flights)',
            lbl_installments_aereo: '✈️ Flight Installments',
            lbl_installments_hosp: '🏨 Accommodation Installments',
            lbl_payment_method: '💳 Payment Method',
            lbl_card_name: 'Card Name',
            lbl_payment_installments: 'Installments',
            lbl_payment_date: '📅 Payment Date',
            lbl_payment_method_label: 'Payment',
            pay_credit: '💳 Credit',
            pay_debit: '🏧 Debit',
            pay_pix: '⚡ Pix',
            pay_cash: '💵 Cash',
            pay_other: '📎 Other',
            prompt_new_card: 'New card name (e.g. Visa Gold, Nubank):',
            // Buttons
            btn_save: 'Save',
            btn_clear: 'Clear',
            btn_set_budget: 'Set Budget',
            btn_save_budgets: 'Save Budgets',
            // Select options
            opt_all_trips: 'All Trips',
            opt_all_dates: 'All Dates',
            opt_all_cities: 'All Cities',
            opt_all_categories: 'All Categories',
            opt_cash: 'Cash (1x)',
            // Finance
            finance_total_label: 'Total Spent (Filtered)',
            budget_header: '📊 Budget Overview',
            budget_info: 'Set the planned budget. Leave blank to skip monitoring a category.',
            budget_total_label: '💰 Trip Total',
            budget_planned: 'Budget',
            budget_spent: 'Spent',
            budget_balance: 'Balance',
            budget_no_budget: 'No budget',
            budget_over: '⚠️ Over budget',
            budget_used: '% used',
            budget_set_hint: 'Click <b>"Set Budget"</b> to define spending limits and track your expenses.',
            budget_total_pill: 'Budgeted',
            budget_spent_pill: 'Spent',
            // Fluxo de Caixa
            cron_title: '💳 Cash Flow',
            cron_desc: 'Disbursements are calculated based on the payment method, installments and payment date set for each item in the Timeline.',
            cron_month: 'Month',
            cron_aerial: '✈️ Flights',
            cron_accommodation: '🏨 Accommodation',
            cron_others: '📦 Others',
            cron_month_total: '💰 Month Total',
            cron_total: 'TOTAL',
            cron_items_label: 'Items this month:',
            cron_chart_title: 'Monthly Disbursement by Category',
            // Charts
            chart_daily: 'Daily Expenses',
            chart_category: 'By Category',
            chart_city: 'By City',
            // Prompts / confirms
            confirm_delete_item: 'Delete this item?',
            lbl_hidden_from_client: 'Hidden from client',
            lbl_toggle_client_visibility: 'Hide/show this item in the client itinerary',
            btn_export_client: 'Client Itinerary',
            client_itinerary_title: 'Travel Itinerary',
            client_no_trip_selected: 'Select a specific trip in the filter to generate the client itinerary.',
            confirm_import: 'This will replace current data. Continue?',
            prompt_new_trip: 'Enter the name of the new trip:',
            btn_clear_data: 'Clear Data',
            confirm_clear_data: 'This will erase ALL data (events, checklist, trips, cards and budgets). This action cannot be undone. Continue?',
            error_import: 'Error reading the file.',
            // Extra labels/options sem tradução
            lbl_currency: 'Currency',
            lbl_show_chart: '📊 Show Chart',
            lbl_delete_trip: 'Delete Trip',
            lbl_add_card: 'Add card',
            placeholder_new_cat: 'E.g.: Health',
            opt_all_charts: 'All Charts',
            opt_chart_daily: '📅 Daily Expenses',
            opt_chart_category: '🏷️ By Category',
            opt_chart_city: '🏙️ By City',
            opt_chart_payment: '💳 Payment Method',
            opt_select_card: '— Select —',
            opt_cash_installment: 'In full (1x)',
            opt_cat_aereo: '✈️ Flight',
            opt_cat_aluguelcarro: '🚗 Car Rental',
            opt_cat_campingfee: '🏕️ Camping Fee',
            opt_cat_combustivel: '⛽ Fuel',
            opt_cat_compras: '🛍️ Shopping',
            opt_cat_energiasolar: '🔆 Energy / Solar',
            opt_cat_glpgas: '🔥 LPG / Gas',
            opt_cat_hospedagem: '🏨 Accommodation',
            opt_cat_internetfone: '📶 Internet/Phone',
            opt_cat_lavanderia: '🧺 Laundry',
            opt_cat_lazer: '🏛️ Leisure',
            opt_cat_manutencao: '🔧 Maintenance / Mechanic',
            opt_cat_pedagio: '🛣️ Toll',
            opt_cat_refeicao: '🍴 Meal',
            opt_cat_seguro: '🛡️ Insurance',
            opt_cat_transporte: '🚌 Transport',
            opt_cat_aguaesgoto: '💧 Water / Sewage',
            opt_payment_credit: '💳 Credit Card',
            opt_payment_debit: '🏧 Debit Card',
            opt_payment_pix: '⚡ Pix',
            opt_payment_cash: '💵 Cash',
            opt_payment_other: '📎 Other',
            // Checklist base categories
            check_cat_bagagem: 'Luggage',
            check_cat_documentos: 'Documents',
            check_cat_financeiro: 'Finance',
            check_lbl_group: 'Group',
            check_lbl_filter_group: 'Filter Group',
            // Links & Addresses
            tab_links: '🔗 Links & Addresses',
            lbl_links_name: 'Name / Place',
            lbl_links_category: 'Category',
            lbl_links_trip: 'Trip',
            lbl_links_address: 'Address',
            lbl_links_phone: 'Phone',
            lbl_links_url: 'Website / Link',
            lbl_links_notes: 'Notes',
            lbl_links_search: 'Search',
            btn_add_link: 'Add',
            btn_save_link: 'Save',
            ph_links_name: 'e.g. US Consulate',
            ph_links_address: 'e.g. 1234 Main St, New York',
            ph_links_phone: 'e.g. +1 (212) 000-0000',
            ph_links_url: 'https://...',
            ph_links_notes: 'e.g. Opening hours, required documents...',
            ph_links_search: 'Name or address...',
            opt_link_consulado: '🏛️ Consulate / Embassy',
            opt_link_museu: '🖼️ Museum / Attraction',
            opt_link_transporte: '🚌 Transport',
            opt_link_saude: '🏥 Health / Hospital',
            opt_link_hotel: '🏨 Hotel / Accommodation',
            opt_link_camping: '🚐 Campground / RV Park',
            opt_link_restaurante: '🍽️ Restaurant',
            opt_link_compras: '🛍️ Shopping',
            opt_link_emergencia: '🚨 Emergency',
            opt_link_outro: '📌 Other',
            links_no_items: 'No links added yet.',
            links_open_map: 'View on map',
            links_open_site: 'Visit website',
            links_copy_address: 'Copy address',
            links_edit: 'Edit',
            links_delete: 'Delete',
            confirm_delete_link: 'Delete this item?',
            // Months / Days
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        }
    };

    function t(key) {
        return (i18n[currentLang] && i18n[currentLang][key]) || i18n['pt'][key] || key;
    }


    function renderHelp() {
        const isEn = currentLang === 'en';
        const el = document.getElementById('ajuda-content');
        if (!el) return;
        el.innerHTML = `
            <!-- Cabeçalho -->
            <div style="background: linear-gradient(135deg, #6b8e23, #8aad2e); border-radius: 16px; padding: 35px 40px; margin-bottom: 30px; color: white; position: relative; overflow: hidden;">
                <div style="position: absolute; right: -20px; top: -20px; font-size: 8rem; opacity: 0.08; line-height:1;">✈️</div>
                <h2 style="font-family: serif; font-size: 1.8rem; margin: 0 0 10px; font-weight: 400;">${isEn ? 'Welcome to Valise Manager' : 'Bem-vindo ao Valise Manager'}</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 0.95rem; line-height: 1.6;">
                    ${isEn
                        ? 'A complete planner to organize your trip — itinerary, checklist, finances, cash flow, links and addresses — all in one place. Follow the guide below to get started.'
                        : 'Um planejador completo para organizar sua viagem — itinerário, checklist, finanças, fluxo de caixa, links e endereços — tudo em um só lugar. Siga o guia abaixo para começar.'}
                </p>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:20px;">
                    ${['📅 Timeline','🗓️ Card Diário','✅ Checklist','📊 Financeiro','💳 Fluxo de Caixa','🔗 Links & Endereços','⛽ Abastecimento','🔧 Manutenção'].map(tab =>
                        `<span style="background:rgba(255,255,255,0.18); border-radius:20px; padding:4px 14px; font-size:0.82rem; font-weight:600;">${tab}</span>`
                    ).join('')}
                </div>
            </div>

            <!-- Passo a passo -->
            <div style="margin-bottom: 10px;">
                <p style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.08em; margin-bottom: 20px;">📋 ${isEn ? 'Step by step' : 'Passo a passo'}</p>
            </div>

            <!-- NOVIDADE: Filtro de Viagem -->
            <div class="glass-card" style="border-left: 4px solid #6b8e23; background: var(--accent-light); padding: 18px 24px; margin-bottom: 18px; display:flex; align-items:flex-start; gap:14px;">
                <span style="font-size:1.6rem; flex-shrink:0;">✈️</span>
                <div>
                    <b style="color:var(--accent);">${isEn ? 'Trip filter — synced across all tabs' : 'Filtro de Viagem — sincronizado em todas as abas'}</b>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin:6px 0 0; line-height:1.6;">
                        ${isEn
                            ? 'Whenever you select a trip in the filter on any tab, <b>all other tabs update instantly</b> to show only data from that trip. The trip filter selector turns <b style="color:var(--accent);">green with a badge</b> so you always know which trip is active. To return to the full view, click <b>Clear</b> or choose <i>"All Trips"</i>.'
                            : 'Ao selecionar uma viagem no filtro de qualquer aba, <b>todas as outras abas se atualizam instantaneamente</b> para mostrar apenas os dados daquela viagem. O seletor fica <b style="color:var(--accent);">verde com um badge</b> para você sempre saber qual viagem está ativa. Para voltar à visão completa, clique em <b>Limpar</b> ou escolha <i>"Todas as Viagens"</i>.'}
                    </p>
                </div>
            </div>

            <!-- Passo 1 — Timeline -->
            <div class="glass-card" style="border-left: 4px solid #6b8e23; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #6b8e23; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; margin-top:2px;">1</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">📅 ${isEn ? 'Create your trip and add events in the <b>Timeline</b>' : 'Crie sua viagem e adicione eventos na <b>Timeline</b>'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 18px; line-height: 1.6;">
                            ${isEn
                                ? 'The <b>Timeline</b> tab is the heart of the planner. Every item you add here automatically feeds all the other tabs. Below is a detailed explanation of each field in the form.'
                                : 'A aba <b>Timeline</b> é o coração do planner. Cada item que você adicionar aqui alimenta automaticamente todas as outras abas. Abaixo, a explicação detalhada de cada campo do formulário.'}
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.84rem;">

                            <!-- Título da Viagem -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    🗂️ ${isEn ? 'Trip Name' : 'Título da Viagem'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Select the trip this event belongs to. Use the <b>+ button</b> to create a new trip name (e.g. <i>"Europe 2025"</i>, <i>"Patagonia Trek"</i>). All events, charts and the cash flow are filtered per trip — keeping multiple trips completely separate.'
                                        : 'Selecione a viagem à qual esse evento pertence. Use o <b>botão +</b> para criar um novo nome de viagem (ex: <i>"Europa 2025"</i>, <i>"Patagônia"</i>). Todos os eventos, gráficos e o fluxo de caixa são filtrados por viagem — mantendo múltiplas viagens completamente separadas.'}
                                </div>
                            </div>

                            <!-- Destino do Dia / Cidade Base -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    🏙️ ${isEn ? 'City / Place to Visit & Accommodation Base' : 'Destino do Dia e Cidade Base'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? '<b>City / Place to Visit:</b> the city or place where this event takes place (e.g. <i>"Paris"</i>, <i>"Rome – Vatican"</i>). Powers the <b>Spending by City</b> chart — always write the city name the same way.<br><br><b>Accommodation Base:</b> the city where you will be staying during this event. Appears on the <b>Daily Cards</b> tab as a reference for the day.'
                                        : '<b>Destino do Dia:</b> a cidade ou local onde o evento acontece (ex: <i>"Paris"</i>, <i>"Roma – Vaticano"</i>). Alimenta o gráfico de <b>Gastos por Cidade</b> — sempre escreva o nome da cidade da mesma forma.<br><br><b>Cidade Base:</b> a cidade onde você estará hospedado durante esse evento. Aparece na aba <b>Card Diário</b> como referência do dia.'}
                                </div>
                            </div>

                            <!-- Data e Hora -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    📆 ${isEn ? 'Date & Time' : 'Data e Hora'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Use the <b>actual date of the event</b> for activities, meals, transport and leisure. For <b>flights and accommodation</b>, use the <b>purchase/booking date</b> — the Cash Flow uses this date as the starting point to split the amount into monthly installments. The time field is optional but helps sort events within the same day.'
                                        : 'Use a <b>data real do evento</b> para atividades, refeições, transporte e lazer. Para <b>passagens aéreas e hospedagem</b>, use a <b>data de compra/reserva</b> — o Fluxo de Caixa usa essa data como ponto de partida para parcelar o valor nos meses seguintes. O campo de hora é opcional, mas ajuda a ordenar os eventos dentro do mesmo dia.'}
                                </div>
                            </div>

                            <!-- Atividade -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    📝 ${isEn ? 'Activity' : 'Atividade'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'A short description of the event (e.g. <i>"Eiffel Tower visit"</i>, <i>"Flight GRU→CDG"</i>, <i>"Dinner at Le Jules Verne"</i>). This text appears as the main label on the Timeline and on the Daily Cards. Be descriptive but concise.'
                                        : 'Uma descrição curta do evento (ex: <i>"Visita à Torre Eiffel"</i>, <i>"Voo GRU→CDG"</i>, <i>"Jantar no Le Jules Verne"</i>). Esse texto aparece como rótulo principal na Timeline e nos Cards Diários. Seja descritivo, mas conciso.'}
                                </div>
                            </div>

                            <!-- Categoria -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    🏷️ ${isEn ? 'Category' : 'Categoria'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6; margin-bottom: 10px;">
                                    ${isEn
                                        ? 'Choose the category that best describes the expense. This drives the color-coded icon on the Timeline, the Finance charts and — crucially — the installment logic in the Cash Flow:'
                                        : 'Escolha a categoria que melhor descreve o gasto. Ela define o ícone colorido na Timeline, os gráficos do Financeiro e — principalmente — a lógica de parcelamento no Fluxo de Caixa:'}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 6px;">
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #f1faf5; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">✈️</span>
                                        <div><b style="color:#3d8b6e;">${isEn ? 'Flights' : 'Aéreo'}</b> — ${isEn ? 'Airline tickets. Use the <b>purchase date</b>. Automatically split in the Cash Flow according to the number of installments selected.' : 'Passagens aéreas. Use a <b>data de compra</b>. Parcelado automaticamente no Fluxo de Caixa conforme o número de parcelas escolhido.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #f4f5f7; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🚗</span>
                                        <div><b style="color:#8d99ae;">${isEn ? 'Car Rental' : 'Aluguel de carro'}</b> — ${isEn ? 'Renting a car. Allocated in the <b>month of the event</b>.' : 'Locação de veículo. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #fff8f0; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">⛽</span>
                                        <div><b style="color:#f4a259;">${isEn ? 'Fuel' : 'Combustível'}</b> — ${isEn ? 'Gas station fill-ups. Allocated in the <b>month of the event</b>.' : 'Abastecimento de combustível. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #fdf2f2; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🛍️</span>
                                        <div><b style="color:#d4a5a5;">${isEn ? 'Shopping' : 'Compras'}</b> — ${isEn ? 'Souvenirs, clothes, gifts. Allocated in the <b>month of the event</b>.' : 'Souvenirs, roupas, presentes. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #f9f2f4; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🏨</span>
                                        <div><b style="color:#c38d9e;">${isEn ? 'Accommodation' : 'Hospedagem'}</b> — ${isEn ? 'Hotel, hostel, Airbnb. Use the <b>booking date</b>. Also split automatically in the Cash Flow.' : 'Hotel, hostel, Airbnb. Use a <b>data da reserva</b>. Também parcelado automaticamente no Fluxo de Caixa.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #f4f7f9; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🏛️</span>
                                        <div><b style="color:#95b8d1;">${isEn ? 'Leisure' : 'Lazer'}</b> — ${isEn ? 'Museums, tours, shows, tickets. Allocated in the <b>month of the event</b>.' : 'Museus, passeios, shows, ingressos. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #f9f7f2; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🛣️</span>
                                        <div><b style="color:#b5a886;">${isEn ? 'Toll' : 'Pedágio'}</b> — ${isEn ? 'Highway and bridge tolls. Allocated in the <b>month of the event</b>.' : 'Pedágios de rodovia e pontes. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #fff5ed; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🍴</span>
                                        <div><b style="color:#e8a87c;">${isEn ? 'Meals' : 'Refeição'}</b> — ${isEn ? 'Restaurants, cafés, delivery. Allocated in the <b>month of the event</b>.' : 'Restaurantes, cafés, delivery. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #eef4fb; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🛡️</span>
                                        <div><b style="color:#6c9bd1;">${isEn ? 'Insurance' : 'Seguro'}</b> — ${isEn ? 'Travel insurance. Allocated in the <b>month of the event</b>.' : 'Seguro viagem. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; background: #f0f4f8; border-radius: 8px;">
                                        <span style="width: 22px; text-align:center;">🚌</span>
                                        <div><b style="color:#7fa9c4;">${isEn ? 'Transport' : 'Transporte'}</b> — ${isEn ? 'Transfers, taxi, subway, bus. Allocated in the <b>month of the event</b>.' : 'Transfer, táxi, metrô, ônibus. Alocado no <b>mês do evento</b>.'}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Moeda, Valor e Conversão -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    💱 ${isEn ? 'Currency, Amount & Conversion' : 'Moeda, Valor e Conversão'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6; margin-bottom: 12px;">
                                    ${isEn ? 'This block has four fields that work together:' : 'Esse bloco possui quatro campos que funcionam em conjunto:'}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem;">
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 80px;">${isEn ? 'Currency' : 'Moeda'}</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? 'Select the currency you actually paid in. If you paid in Reais, leave as <b>BRL</b>. For international trips choose USD, EUR, GBP etc.' : 'Selecione a moeda em que o pagamento foi feito. Se pagou em Reais, deixe <b>BRL</b>. Para viagens internacionais, escolha USD, EUR, GBP etc.'}</span>
                                    </div>
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 80px;">${isEn ? 'Amount' : 'Valor'}</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? 'Enter the amount in the <b>selected currency</b>. Example: if you paid USD 150, type <i>150</i>.' : 'Informe o valor na <b>moeda selecionada</b>. Exemplo: se pagou USD 150, digite <i>150</i>.'}</span>
                                    </div>
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 80px;">${isEn ? 'Rate (→ R$)' : 'Cotação (→ R$)'}</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? 'How many Reais 1 unit of the chosen currency is worth at payment time (e.g. <i>5.85</i> for 1 USD = R$ 5.85). Locked at 1 when BRL is selected.' : 'Quantos Reais vale 1 unidade da moeda escolhida no momento do pagamento (ex: <i>5,85</i> para 1 USD = R$ 5,85). Trava em 1 quando BRL está selecionado.'}</span>
                                    </div>
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: var(--accent-light); border-radius: 8px; border: 1px solid var(--accent-light);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 80px;">💰 Total em R$</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? '<b>Calculated automatically</b> (Amount × Rate). This is the value stored and used in all tabs — Finance, Cash Flow and Budget Tracker. You cannot edit it directly.' : '<b>Calculado automaticamente</b> (Valor × Cotação). Esse é o valor armazenado e usado em todas as abas — Financeiro, Fluxo de Caixa e Budget. Não é editável diretamente.'}</span>
                                    </div>
                                </div>
                                <div style="margin-top: 12px; padding: 10px 14px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a; font-size: 0.8rem; color: #92400e; line-height: 1.5;">
                                    💡 <b>${isEn ? 'Tip:' : 'Dica:'}</b> ${isEn ? 'When editing an existing event, the original currency and amount are restored in the form so you can correct the exchange rate without losing the original values.' : 'Ao editar um evento existente, a moeda e o valor original são restaurados no formulário para que você possa corrigir a cotação sem perder os valores originais.'}
                                </div>
                            </div>

                            <!-- Meio de Pagamento -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    💳 ${isEn ? 'Payment Method, Card, Installments & Due Date' : 'Meio de Pagamento, Cartão, Parcelas e Data de Vencimento'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6; margin-bottom: 12px;">
                                    ${isEn
                                        ? 'This block records how the expense was paid and is the key input for the <b>Cash Flow</b>.'
                                        : 'Esse bloco registra como o gasto foi pago e é a entrada principal para o <b>Fluxo de Caixa</b>.'}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem;">
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 120px;">${isEn ? 'Payment Method' : 'Meio de Pagamento'}</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? 'Choose between <b>Credit Card</b>, Debit Card, Pix, Cash or Other. Selecting Credit Card unlocks the card name, installments and due date fields.' : 'Escolha entre <b>Cartão de Crédito</b>, Cartão de Débito, Pix, Dinheiro ou Outro. Ao selecionar Cartão de Crédito, os campos de cartão, parcelas e vencimento são habilitados.'}</span>
                                    </div>
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 120px;">${isEn ? 'Card Name' : 'Nome do Cartão'}</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? 'Select a registered card or add a new one using the <b>＋ button</b>. Appears for Credit and Debit methods. Card names are saved for future use.' : 'Selecione um cartão já cadastrado ou adicione um novo pelo <b>botão ＋</b>. Aparece para os meios Crédito e Débito. Os nomes são salvos para uso futuro.'}</span>
                                    </div>
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 120px;">${isEn ? 'Installments' : 'Parcelas'}</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? 'Available only for Credit Card. Select the number of installments (1x to 24x). Always enter the <b>total amount</b> — the app divides it equally across months in the Cash Flow.' : 'Disponível apenas para Cartão de Crédito. Selecione o número de parcelas (1x até 24x). Insira sempre o <b>valor total</b> — o app divide igualmente pelos meses no Fluxo de Caixa.'}</span>
                                    </div>
                                    <div style="display: flex; gap: 10px; padding: 10px 12px; background: var(--accent-light); border-radius: 8px; border: 1px solid var(--accent-light);">
                                        <span style="font-weight:700; color:var(--accent); min-width: 120px;">📅 ${isEn ? 'Due Date' : 'Data de Vencimento'}</span>
                                        <span style="color:var(--text-muted); line-height:1.5;">${isEn ? '<b>Date the charge first appears on your credit card bill.</b> The Cash Flow uses this as the starting month for spreading installments — leave blank for the expense to follow the event date.' : '<b>Data em que o valor entra pela primeira vez na fatura do cartão.</b> O Fluxo de Caixa usa essa data como mês inicial para distribuir as parcelas — deixe em branco para o gasto seguir a data do evento.'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Ocultar do Cliente -->
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
                                    <i class="fas fa-eye-slash"></i> ${isEn ? 'Hide from Client' : 'Ocultar do Cliente'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Each item on the Timeline has an <i class="fas fa-eye"></i> button. Click it to mark the item as <b>hidden from the client</b> — it stays visible to you (shown with a dashed red border) but is left out of the <b>Client Itinerary</b>. Useful for personal notes, internal costs or anything you don\'t want to show the traveler.'
                                        : 'Cada item da Timeline possui um botão <i class="fas fa-eye"></i>. Clique nele para marcar o item como <b>oculto do cliente</b> — ele continua visível para você (com uma borda vermelha tracejada), mas não aparece no <b>Roteiro do Cliente</b>. Útil para anotações internas, custos próprios ou qualquer coisa que não deva ser exibida ao viajante.'}
                                </div>
                            </div>
                    </div>
                </div>
            </div>

            <!-- Passo 2 — Card Diário -->
            <div class="glass-card" style="border-left: 4px solid #88d8b0; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #88d8b0; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0;">2</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">🗓️ ${isEn ? 'View your trip day by day in <b>Daily Cards</b>' : 'Visualize sua viagem dia a dia nos <b>Cards Diários</b>'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 14px; line-height: 1.6;">
                            ${isEn
                                ? 'The <b>Daily Cards</b> tab groups all events by day, showing a summary card for each date of your trip. Ideal for a quick overview of what\'s planned for each day.'
                                : 'A aba <b>Card Diário</b> agrupa todos os eventos por dia, exibindo um cartão resumido para cada data da viagem. Ideal para ter uma visão rápida do que está planejado em cada dia.'}
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem; color: var(--text-muted);">
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Each card shows the date, accommodation base, city, total cost for the day and a list of activities.' : 'Cada card exibe a data, cidade base, destino do dia, custo total e a lista de atividades.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Click on any card to filter the Timeline to that specific day.' : 'Clique em qualquer card para filtrar a Timeline para aquele dia específico.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Use the trip filter at the top to view cards for a specific trip only.' : 'Use o filtro de viagem no topo para visualizar apenas os cards de uma viagem específica.'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passo 3 — Checklist -->
            <div class="glass-card" style="border-left: 4px solid #e8a87c; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #e8a87c; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0;">3</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">✅ ${isEn ? 'Organize your preparation <b>Checklist</b>' : 'Organize o <b>Checklist</b> de preparativos'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 14px; line-height: 1.6;">
                            ${isEn ? 'Add everything you need to bring or do before traveling. Create custom categories (e.g. <i>Documents, Clothes, Health</i>) and check items off as you complete them.' : 'Adicione tudo que precisa levar ou fazer antes de viajar. Crie categorias personalizadas (ex: <i>Documentos, Roupas, Saúde</i>) e marque os itens conforme for concluindo.'}
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem; color: var(--text-muted);">
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Type the item name, choose or create a group and click <b>+</b> to add.' : 'Digite o item, escolha ou crie um grupo e clique em <b>+</b> para adicionar.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Click any item to mark it as done. Click again to undo.' : 'Clique em qualquer item para marcá-lo como concluído. Clique novamente para desfazer.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Filter by trip or group to focus on what matters.' : 'Filtre por viagem ou grupo para focar no que importa.'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passo 4 — Financeiro -->
            <div class="glass-card" style="border-left: 4px solid #95b8d1; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #95b8d1; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0;">4</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">📊 ${isEn ? 'Track <b>Finances</b> and set your Budget' : 'Acompanhe o <b>Financeiro</b> e defina seu Orçamento'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 14px; line-height: 1.6;">
                            ${isEn ? 'The Finances tab shows spending charts by day, category and city. Use the <b>"Set Budget"</b> button to configure limits per category and track whether you\'re within your plan.' : 'A aba Financeiro mostra gráficos de gastos por dia, por categoria e por cidade. Use o botão <b>"Definir Orçamento"</b> para configurar limites por categoria e acompanhar se está dentro do planejado.'}
                        </p>
                        <div style="background: #f0f4f8; border-radius: 10px; padding: 14px 16px; font-size: 0.83rem; color: var(--text-muted); line-height: 1.5;">
                            💡 <b>${isEn ? 'Tip:' : 'Dica:'}</b> ${isEn ? 'Progress bars turn <span style="color: #f59e0b; font-weight: 700;">yellow</span> at 80% of budget and <span style="color: #ef4444; font-weight: 700;">red</span> when exceeded.' : 'As barras de progresso ficam <span style="color: #f59e0b; font-weight: 700;">amarelas</span> ao atingir 80% do orçamento e <span style="color: #ef4444; font-weight: 700;">vermelhas</span> quando ultrapassado.'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passo 5 — Fluxo de Caixa -->
            <div class="glass-card" style="border-left: 4px solid #c38d9e; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #c38d9e; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0;">5</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">💳 ${isEn ? 'Use the <b>Cash Flow</b>' : 'Use o <b>Fluxo de Caixa</b>'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 14px; line-height: 1.6;">
                            ${isEn ? 'This tab spreads your expenses across months, making financial planning easier before and during your trip.' : 'Esta aba distribui seus gastos ao longo dos meses, facilitando o planejamento financeiro antes e durante a viagem.'}
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem; color: var(--text-muted);">
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Select the desired number of installments (e.g. 6x). Accommodation and Flights will be split equally from the purchase date.' : 'Selecione o número de parcelas desejado (ex: 6x). Hospedagem e Aéreo serão divididos igualmente a partir da data de compra.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Click any row in the table to see the breakdown of items for that month.' : 'Clique em qualquer linha da tabela para ver o detalhamento dos itens daquele mês.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: var(--accent); font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'The stacked bar chart visually shows the cash flow month by month.' : 'O gráfico de barras empilhadas mostra visualmente o fluxo de caixa mês a mês.'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passo 6 — Exportar / Importar -->
            <div class="glass-card" style="border-left: 4px solid var(--accent); padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: var(--accent); color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0;">6</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">💾 ${isEn ? 'Save and share your data' : 'Salve e compartilhe seus dados'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 14px; line-height: 1.6;">
                            ${isEn ? 'Data is saved automatically in the browser. To avoid losing anything when switching computers, use the buttons at the top of the page:' : 'Os dados ficam salvos automaticamente no navegador. Para não perder nada ao trocar de computador, use os botões no topo da página:'}
                        </p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 0.83rem;">
                            <div style="background: #f8f9f5; border-radius: 9px; padding: 12px 14px; text-align: center;">
                                <div style="font-size: 1.3rem; margin-bottom: 5px;">📤</div>
                                <b>${isEn ? 'Export' : 'Exportar'}</b><br><span style="color: var(--text-muted);">${isEn ? 'Saves a .json file with all your data' : 'Salva um arquivo .json com todos os seus dados'}</span>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 9px; padding: 12px 14px; text-align: center;">
                                <div style="font-size: 1.3rem; margin-bottom: 5px;">📥</div>
                                <b>${isEn ? 'Import' : 'Importar'}</b><br><span style="color: var(--text-muted);">${isEn ? 'Loads a previously exported .json backup' : 'Carrega um backup .json exportado anteriormente'}</span>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 9px; padding: 12px 14px; text-align: center;">
                                <div style="font-size: 1.3rem; margin-bottom: 5px;">📋</div>
                                <b>${isEn ? 'Client Itinerary' : 'Roteiro do Cliente'}</b><br><span style="color: var(--text-muted);">${isEn ? 'Generates a clean itinerary summary to share with the client' : 'Gera um resumo do roteiro para compartilhar com o cliente'}</span>
                            </div>
                        </div>
                        <div style="margin-top: 12px; padding: 10px 14px; background: #e6f5f0; border-radius: 8px; border: 1px solid #2e8b6e33; font-size: 0.83rem; color: var(--text-muted); line-height: 1.6;">
                            <i class="fas fa-route" style="color:#2e8b6e;"></i> ${isEn
                                ? 'The <b>Client Itinerary</b> button opens a clean, printable summary of all events for the trip currently selected in the filter — perfect for sending to the traveler. Items marked as <b>hidden from client</b> on the Timeline (see Step 1) are automatically left out.'
                                : 'O botão <b>Roteiro do Cliente</b> abre um resumo limpo e pronto para impressão de todos os eventos da viagem selecionada no filtro — ideal para enviar ao viajante. Itens marcados como <b>ocultos do cliente</b> na Timeline (veja o Passo 1) são automaticamente deixados de fora.'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passo 7 — Links & Endereços -->
            <div class="glass-card" style="border-left: 4px solid #7fa9c4; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #7fa9c4; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; margin-top:2px;">7</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">🔗 ${isEn ? 'Save important contacts in <b>Links & Addresses</b>' : 'Salve contatos importantes em <b>Links & Endereços</b>'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 14px; line-height: 1.6;">
                            ${isEn
                                ? 'Use this tab to store any contact, address or link you may need during your trip — consulates, hospitals, transport, hotels, restaurants, museums and more. Everything organized by category and linked to a specific trip.'
                                : 'Use esta aba para guardar qualquer contato, endereço ou link que você possa precisar durante a viagem — consulados, hospitais, transporte, hotéis, restaurantes, museus e muito mais. Tudo organizado por categoria e vinculado a uma viagem específica.'}
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem; color: var(--text-muted);">
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: #7fa9c4; font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Fill in the name, category, trip and optionally address, phone, website and notes, then click <b>Save</b>.' : 'Preencha o nome, categoria, viagem e opcionalmente endereço, telefone, site e observações, depois clique em <b>Salvar</b>.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: #7fa9c4; font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Click <b>Open Map</b> to open the address directly in Google Maps for navigation.' : 'Clique em <b>Ver no Mapa</b> para abrir o endereço direto no Google Maps e navegar.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: #7fa9c4; font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Use the copy icon to copy the address to the clipboard — useful for pasting into a taxi or rideshare app.' : 'Use o ícone de copiar para copiar o endereço para a área de transferência — útil para colar em apps de táxi ou transporte.'}</div>
                            <div style="display: flex; gap: 10px; align-items: flex-start;"><span style="color: #7fa9c4; font-weight: 800; flex-shrink:0;">→</span> ${isEn ? 'Filter by trip, category or search by name to find what you need quickly.' : 'Filtre por viagem, categoria ou pesquise por nome para encontrar o que precisa rapidamente.'}</div>
                        </div>
                        <div style="margin-top:14px; display:flex; flex-wrap:wrap; gap:8px; font-size:0.8rem;">
                            ${[
                                {c:'#b08040', bg:'#fdf5e6', icon:'🏛️', label: isEn ? 'Consulate/Embassy' : 'Consulado/Embaixada'},
                                {c:'#e05c5c', bg:'#fdf0f0', icon:'🚨', label: isEn ? 'Emergency' : 'Emergência'},
                                {c:'#3a8c6e', bg:'#e8f6f0', icon:'🏥', label: isEn ? 'Health' : 'Saúde'},
                                {c:'#7fa9c4', bg:'#f0f4f8', icon:'🚌', label: isEn ? 'Transport' : 'Transporte'},
                                {c:'#c38d9e', bg:'#f9f2f4', icon:'🏨', label: isEn ? 'Hotel' : 'Hotel'},
                                {c:'#e8a87c', bg:'#fff5ed', icon:'🍽️', label: isEn ? 'Restaurant' : 'Restaurante'},
                                {c:'#95b8d1', bg:'#f4f7f9', icon:'🖼️', label: isEn ? 'Museum/Attraction' : 'Museu/Atração'},
                                {c:'#d4a5a5', bg:'#fdf2f2', icon:'🛍️', label: isEn ? 'Shopping' : 'Compras'},
                                {c:'#9ca3af', bg:'#f3f4f6', icon:'📌', label: isEn ? 'Other' : 'Outro'},
                            ].map(item =>
                                `<span style="display:inline-flex; align-items:center; gap:4px; background:${item.bg}; color:${item.c}; border-radius:8px; padding:4px 10px; font-weight:600;">${item.icon} ${item.label}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passo 8 — Abastecimento -->
            <div class="glass-card" style="border-left: 4px solid #c47a2b; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #c47a2b; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; margin-top:2px;">8</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">⛽ ${isEn ? 'Log fuel fill-ups in <b>Fuel Log</b>' : 'Registre abastecimentos em <b>Abastecimento</b>'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 18px; line-height: 1.6;">
                            ${isEn
                                ? 'Ideal for road trips and RV travel. Every fill-up you log here builds a fuel history, calculates cost and lets you track your vehicle\'s fuel efficiency over the trip.'
                                : 'Ideal para viagens de estrada e em motorhome/RV. Cada abastecimento registrado aqui monta um histórico de combustível, calcula os gastos e permite acompanhar o consumo do veículo ao longo da viagem.'}
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.84rem;">
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #c47a2b; margin-bottom: 8px;">
                                    📝 ${isEn ? 'Fill-up details' : 'Dados do abastecimento'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Fill in the <b>date</b>, <b>trip</b>, <b>city/place</b> and <b>gas station</b>. Choose the <b>fuel type</b> (Diesel S10, Common Diesel, Gasoline, Additized Gasoline, Ethanol or CNG) and add any <b>notes</b> — e.g. "full tank" or "first stop of the trip".'
                                        : 'Preencha a <b>data</b>, <b>viagem</b>, <b>cidade/local</b> e o <b>posto</b>. Escolha o <b>tipo de combustível</b> (Diesel S10, Diesel Comum, Gasolina, Gasolina Aditivada, Etanol ou GNV) e adicione <b>observações</b> — ex: "tanque cheio" ou "primeira parada da viagem".'}
                                </div>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #c47a2b; margin-bottom: 8px;">
                                    🧮 ${isEn ? 'Odometer, liters and total' : 'Hodômetro, litros e total'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Always enter the <b>odometer reading (km)</b> at the time of the fill-up — this is what powers the fuel efficiency chart. Enter <b>liters</b> and <b>price per liter</b>: the <b>total</b> is calculated automatically, but you can adjust it manually if needed (e.g. discounts).'
                                        : 'Informe sempre o <b>hodômetro (km)</b> no momento do abastecimento — é ele que alimenta o gráfico de consumo. Digite os <b>litros</b> e o <b>preço por litro</b>: o <b>total</b> é calculado automaticamente, mas pode ser ajustado manualmente se necessário (ex: descontos).'}
                                </div>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #c47a2b; margin-bottom: 8px;">
                                    💳 ${isEn ? 'Payment' : 'Pagamento'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Same payment block as the Timeline: choose the method, card and installments if paid by credit card. This is tracked separately per fill-up for your own record — it does not appear in the <b>Cash Flow</b> table, which only follows Timeline events.'
                                        : 'Mesmo bloco de pagamento da Timeline: escolha o meio, o cartão e as parcelas caso pago no crédito. Isso é registrado separadamente por abastecimento, apenas como controle — não aparece na tabela do <b>Fluxo de Caixa</b>, que segue apenas os eventos da Timeline.'}
                                </div>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #c47a2b; margin-bottom: 8px;">
                                    📈 ${isEn ? 'Fuel efficiency chart (km/L)' : 'Gráfico de consumo (km/L)'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Once you have <b>at least 2 fill-ups with odometer readings</b>, the app calculates the km/L between each consecutive pair automatically. Switch the view mode to see consumption <b>per fill-up</b> or grouped <b>per city</b>, and filter by trip. A detailed table below the chart shows the distance, liters and consumption of every stretch, plus the overall average.'
                                        : 'A partir de <b>2 abastecimentos com hodômetro</b>, o app calcula automaticamente o km/L entre cada par consecutivo. Alterne o modo de visualização entre consumo <b>por abastecimento</b> ou agrupado <b>por cidade</b>, e filtre por viagem. Uma tabela detalhada abaixo do gráfico mostra a distância, os litros e o consumo de cada trecho, além da média geral.'}
                                </div>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #c47a2b; margin-bottom: 8px;">
                                    🔍 ${isEn ? 'Stats and filters' : 'Estatísticas e filtros'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Summary cards at the top show totals like amount spent and average consumption. Use the filters to narrow the list by trip, fuel type or by searching the city/station name.'
                                        : 'Os cartões de resumo no topo mostram totais como valor gasto e consumo médio. Use os filtros para restringir a lista por viagem, tipo de combustível ou pesquisando pelo nome da cidade/posto.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passo 9 — Manutenção -->
            <div class="glass-card" style="border-left: 4px solid #a0632c; padding: 25px 30px; margin-bottom: 18px;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="background: #a0632c; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; margin-top:2px;">9</div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.05rem; margin: 0 0 8px; color: var(--text);">🔧 ${isEn ? 'Keep vehicle service history in <b>Maintenance</b>' : 'Mantenha o histórico do veículo em <b>Manutenção</b>'}</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 18px; line-height: 1.6;">
                            ${isEn
                                ? 'Track every service done on your vehicle — oil changes, tires, brakes and more — and let the app warn you when the next service is coming up, by date or by mileage. Records can be linked to a trip or kept general with <i>"— No trip —"</i>.'
                                : 'Registre todo serviço feito no veículo — troca de óleo, pneus, freios e outros — e deixe o app avisar quando a próxima manutenção estiver se aproximando, por data ou por quilometragem. Os registros podem ser vinculados a uma viagem ou ficar gerais, usando <i>"— Sem viagem —"</i>.'}
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.84rem;">
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #a0632c; margin-bottom: 8px;">
                                    🛠️ ${isEn ? 'Service details' : 'Dados do serviço'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'Fill in the <b>date</b>, <b>service type</b> (oil change, tires, brakes, battery, general inspection and many more), the <b>odometer reading</b>, the <b>cost</b> and the <b>workshop/location</b>. Add <b>notes</b> for extra detail, like the oil brand used.'
                                        : 'Preencha a <b>data</b>, o <b>tipo de serviço</b> (troca de óleo, pneus, freios, bateria, revisão geral e muitos outros), o <b>hodômetro</b>, o <b>custo</b> e a <b>oficina/local</b>. Use as <b>observações</b> para detalhes extras, como a marca do óleo utilizado.'}
                                </div>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #a0632c; margin-bottom: 8px;">
                                    🔔 ${isEn ? 'Next service & alerts' : 'Próxima troca e alertas'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'For services marked <b>Done</b>, fill in <b>next service (km)</b> and/or <b>next service (date)</b> to enable alerts. The app compares them against today\'s date and the highest odometer reading you\'ve logged, and shows a warning banner when a service is <b>within 30 days or 2,000 km</b> — turning red if it\'s already overdue. Records marked <b>Scheduled</b> or <b>Pending</b> always appear in the alert banner until updated.'
                                        : 'Para serviços marcados como <b>Realizado</b>, preencha a <b>próxima troca (km)</b> e/ou <b>próxima troca (data)</b> para ativar os alertas. O app compara essas informações com a data de hoje e o maior hodômetro já registrado, exibindo um aviso quando a manutenção estiver a <b>30 dias ou 2.000 km</b> de distância — ficando vermelho se já estiver vencida. Registros marcados como <b>Agendado</b> ou <b>Pendente</b> sempre aparecem no aviso até serem atualizados.'}
                                </div>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #a0632c; margin-bottom: 8px;">
                                    🏷️ ${isEn ? 'Status' : 'Status'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? '<b>✅ Done:</b> service already completed. <b>📅 Scheduled:</b> booked for a future date. <b>⚠️ Pending:</b> needed but not yet scheduled. Update the status as things progress to keep the alerts accurate.'
                                        : '<b>✅ Realizado:</b> serviço já concluído. <b>📅 Agendado:</b> marcado para uma data futura. <b>⚠️ Pendente:</b> necessário, mas ainda não agendado. Atualize o status conforme a situação evolui para manter os alertas precisos.'}
                                </div>
                            </div>
                            <div style="background: #f8f9f5; border-radius: 10px; padding: 16px 18px; border: 1px solid var(--accent-light);">
                                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #a0632c; margin-bottom: 8px;">
                                    💳 ${isEn ? 'Payment, stats and filters' : 'Pagamento, estatísticas e filtros'}
                                </div>
                                <div style="color: var(--text-muted); line-height: 1.6;">
                                    ${isEn
                                        ? 'The same payment block as Fuel Log lets you record method, card and installments for your own control — also independent from the Cash Flow tab. Summary cards show totals like completed vs. pending services, and you can filter the list by service type, status or search by workshop name.'
                                        : 'O mesmo bloco de pagamento do Abastecimento permite registrar meio, cartão e parcelas apenas como controle próprio — também independente da aba Fluxo de Caixa. Os cartões de resumo mostram totais como serviços realizados x pendentes, e você pode filtrar a lista por tipo de serviço, status ou pesquisar pelo nome da oficina.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dicas rápidas -->
            <div class="glass-card" style="background: var(--accent-light); border: 1px solid #c8dca0; padding: 25px 30px; margin-bottom: 30px;">
                <h3 style="font-size: 1rem; margin: 0 0 15px; color: var(--accent);">⚡ ${isEn ? 'Quick tips' : 'Dicas rápidas'}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.84rem; color: var(--text-muted);">
                    <div style="display: flex; gap: 8px;"><span>✏️</span> ${isEn ? 'Click the pencil icon on any Timeline item to edit it.' : 'Clique no ícone de lápis em qualquer item da Timeline para editar.'}</div>
                    <div style="display: flex; gap: 8px;"><span>🗂️</span> ${isEn ? 'Use different trips to separate destinations (e.g. "Paris" and "Rome").' : 'Use viagens diferentes para separar destinos (ex: "Paris" e "Roma").'}</div>
                    <div style="display: flex; gap: 8px;"><span>📅</span> ${isEn ? 'In Daily Cards, click a card to jump to that day in the Timeline.' : 'No Card Diário, clique no card para filtrar a Timeline para aquele dia.'}</div>
                    <div style="display: flex; gap: 8px;"><span>🔽</span> ${isEn ? 'In the Cash Flow table, click a month to see the breakdown.' : 'Na tabela do Fluxo de Caixa, clique em um mês para ver o detalhamento.'}</div>
                    <div style="display: flex; gap: 8px;"><span>✈️</span> ${isEn ? 'The trip filter syncs all tabs at once — the selector turns green when active.' : 'O filtro de viagem sincroniza todas as abas — o seletor fica verde quando ativo.'}</div>
                    <div style="display: flex; gap: 8px;"><span>🗺️</span> ${isEn ? 'In Links & Addresses, click "Open Map" to navigate directly in Google Maps.' : 'Em Links & Endereços, clique em "Ver no Mapa" para navegar direto no Google Maps.'}</div>
                    <div style="display: flex; gap: 8px;"><span>🖨️</span> ${isEn ? 'The Print button generates a formatted PDF of the current screen.' : 'O botão Imprimir gera um PDF formatado da tela atual.'}</div>
                    <div style="display: flex; gap: 8px;"><span>💰</span> ${isEn ? 'Always enter the total expense amount (not the individual installment).' : 'Insira sempre o valor total do gasto (não a parcela individual).'}</div>
                    <div style="display: flex; gap: 8px;"><span>🌍</span> ${isEn ? 'Use the flag buttons (🇧🇷 🇺🇸) to switch the interface language at any time.' : 'Use os botões de bandeira (🇧🇷 🇺🇸) para trocar o idioma da interface a qualquer momento.'}</div>
                    <div style="display: flex; gap: 8px;"><span>💾</span> ${isEn ? 'Export your data regularly to avoid losing it when clearing the browser.' : 'Exporte seus dados regularmente para não perder nada ao limpar o navegador.'}</div>
                    <div style="display: flex; gap: 8px;"><span>⛽</span> ${isEn ? 'Always log the odometer reading at each fill-up — it\'s required for the consumption chart to work.' : 'Registre sempre o hodômetro em cada abastecimento — ele é necessário para o gráfico de consumo funcionar.'}</div>
                    <div style="display: flex; gap: 8px;"><span>🔧</span> ${isEn ? 'Fill in "Next service" (km or date) on completed maintenance to get proactive alerts.' : 'Preencha "Próxima troca" (km ou data) nas manutenções concluídas para receber alertas antecipados.'}</div>
                </div>
            </div>

            <div style="text-align: center; padding-bottom: 10px;">
                <button class="btn-confirm" onclick="switchTab(null, 'tab-timeline')" style="padding: 14px 35px; font-size: 1rem; border-radius: 10px;">
                    🚀 ${isEn ? 'Start planning' : 'Começar a planejar'}
                </button>
            </div>

            <!-- Rodapé com Política de Privacidade -->
            <div style="text-align: center; padding: 18px 0 30px; border-top: 1px solid var(--border); margin-top: 10px;">
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">
                    © 2025 José Ricardo Verona Alves — Valise Manager. ${isEn ? 'All rights reserved.' : 'Todos os direitos reservados.'}
                </p>
                <button onclick="document.getElementById('modal-privacidade').style.display='flex'"
                    style="background: none; border: none; color: var(--accent); font-size: 0.82rem; cursor: pointer; text-decoration: underline; padding: 0;">
                    🔒 ${isEn ? 'Privacy Policy' : 'Política de Privacidade'}
                </button>
            </div>
        `;
    }

    function renderPrivacyModal() {
        const el = document.getElementById('modal-privacidade-content');
        if (!el) return;
        const isEn = currentLang === 'en';
        el.innerHTML = `
            <div style="background:#6b8e23; color:white; padding:28px 35px 22px; border-radius:16px 16px 0 0; display:flex; justify-content:space-between; align-items:flex-start; position:sticky; top:0; z-index:2;">
                <div>
                    <div style="font-size:1.4rem; font-weight:700; margin-bottom:4px;">🔒 ${isEn ? 'Privacy Policy' : 'Política de Privacidade'}</div>
                    <div style="opacity:0.85; font-size:0.88rem;">Valise Manager — ${isEn ? 'Version 1.0 · May 14, 2025' : 'Versão 1.0 · 14 de maio de 2025'}</div>
                </div>
                <button onclick="document.getElementById('modal-privacidade').style.display='none'"
                    style="background:rgba(255,255,255,0.2); border:none; color:white; border-radius:8px; width:36px; height:36px; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;">✕</button>
            </div>
            <div style="padding:30px 35px; font-size:0.93rem; line-height:1.8; color:#2c2c2c;">
                <div style="background:#f0f4e8; border-left:4px solid #6b8e23; border-radius:0 8px 8px 0; padding:14px 18px; margin-bottom:24px;">
                    <strong style="color:#6b8e23;">${isEn ? 'Summary:' : 'Resumo:'}</strong> ${isEn
                        ? 'Valise Manager does not collect, store on servers, or share any of your personal data. All your information stays only on your own device.'
                        : 'O Valise Manager não coleta, não armazena em servidores e não compartilha nenhum dado pessoal seu. Todas as suas informações ficam apenas no seu próprio dispositivo.'}
                </div>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '1. Controller Identification' : '1. Identificação do Responsável'}</h3>
                <p><strong>${isEn ? 'Name' : 'Nome'}:</strong> José Ricardo Verona Alves<br>
                <strong>E-mail:</strong> <a href="mailto:jrverona@gmail.com" style="color:#6b8e23;">jrverona@gmail.com</a><br>
                <strong>${isEn ? 'Country' : 'País'}:</strong> ${isEn ? 'Brazil' : 'Brasil'}</p>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '2. What Data Is Collected' : '2. Quais Dados São Coletados'}</h3>
                <p>${isEn
                    ? 'Valise Manager <strong>does not collect any personal data</strong> on external servers. Data generated by the user includes:'
                    : 'O Valise Manager <strong>não coleta nenhum dado pessoal</strong> em servidores externos. Os dados gerados pelo usuário são:'}</p>
                <ul style="margin:10px 0 0 20px;">
                    ${isEn ? `
                    <li>Trip names and itineraries</li>
                    <li>Dates, times and activity descriptions</li>
                    <li>Financial amounts and expense categories</li>
                    <li>Payment methods and card names</li>
                    <li>Custom checklist items</li>
                    <li>Language preference</li>
                    ` : `
                    <li>Nomes de viagens e itinerários</li>
                    <li>Datas, horários e descrições de atividades</li>
                    <li>Valores financeiros e categorias de gastos</li>
                    <li>Meios de pagamento e nomes de cartões</li>
                    <li>Itens de checklist personalizados</li>
                    <li>Preferência de idioma</li>
                    `}
                </ul>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '3. How Data Is Stored' : '3. Como os Dados São Armazenados'}</h3>
                <p>${isEn
                    ? 'The app uses exclusively the browser\'s <strong>localStorage</strong> — data stays only on your device and is never sent to external servers.'
                    : 'O aplicativo utiliza exclusivamente o <strong>localStorage</strong> do navegador — os dados ficam apenas no seu dispositivo e nunca são enviados a servidores externos.'}</p>
                <table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:0.88rem;">
                    <tr style="background:#6b8e23; color:white;">
                        <th style="padding:9px 13px; text-align:left; border-radius:6px 0 0 0;">${isEn ? 'Key' : 'Chave'}</th>
                        <th style="padding:9px 13px; text-align:left; border-radius:0 6px 0 0;">${isEn ? 'Content' : 'Conteúdo'}</th>
                    </tr>
                    <tr><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">tp_v17</td><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">${isEn ? 'Timeline events and activities' : 'Eventos e atividades da timeline'}</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">tc_v17</td><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">${isEn ? 'Checklist items' : 'Itens do checklist'}</td></tr>
                    <tr><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">tr_names_v17</td><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">${isEn ? 'Trip names' : 'Nomes das viagens'}</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">tp_budgets_v18</td><td style="padding:8px 13px; border-bottom:1px solid #e9ecef;">${isEn ? 'Budgets per category' : 'Orçamentos por categoria'}</td></tr>
                    <tr><td style="padding:8px 13px;">tp_cartoes_v17</td><td style="padding:8px 13px;">${isEn ? 'Registered card names' : 'Nomes de cartões cadastrados'}</td></tr>
                </table>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '4. Cookies and Tracking' : '4. Cookies e Rastreamento'}</h3>
                <p>${isEn
                    ? 'Valise Manager <strong>does not use cookies</strong>, trackers, analytics or targeted advertising.'
                    : 'O Valise Manager <strong>não utiliza cookies</strong>, rastreadores, analytics nem publicidade direcionada.'}</p>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '5. Third-Party Sharing' : '5. Compartilhamento com Terceiros'}</h3>
                <p>${isEn
                    ? '<strong>No data is shared with third parties.</strong> The app loads libraries via CDN (Chart.js, Font Awesome, Flag CDN) solely for the interface to function. These libraries do not receive user data.'
                    : '<strong>Nenhum dado é compartilhado com terceiros.</strong> O aplicativo carrega bibliotecas via CDN (Chart.js, Font Awesome, Flag CDN) apenas para funcionamento da interface. Essas bibliotecas não recebem dados do usuário.'}</p>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '6. Export and Sharing' : '6. Exportação e Compartilhamento'}</h3>
                <p>${isEn
                    ? 'The Export, Import, Client Itinerary and Print functions are initiated exclusively by the user and do not transmit data to the developer.'
                    : 'As funções Exportar, Importar, Roteiro do Cliente e Imprimir são iniciadas exclusivamente pelo usuário e não transmitem dados ao desenvolvedor.'}</p>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '7. Your Rights' : '7. Seus Direitos (LGPD — Lei nº 13.709/2018)'}</h3>
                <ul style="margin:10px 0 0 20px;">
                    ${isEn ? `
                    <li><strong>Access:</strong> view all data directly in the app</li>
                    <li><strong>Correction:</strong> edit any information at any time</li>
                    <li><strong>Deletion:</strong> delete data through the app or by clearing localStorage</li>
                    <li><strong>Portability:</strong> export everything in JSON format via the "Export" function</li>
                    ` : `
                    <li><strong>Acesso:</strong> visualize todos os dados diretamente no app</li>
                    <li><strong>Correção:</strong> edite qualquer informação a qualquer momento</li>
                    <li><strong>Exclusão:</strong> apague dados pelo app ou limpando o localStorage</li>
                    <li><strong>Portabilidade:</strong> exporte tudo em formato JSON pela função "Exportar"</li>
                    `}
                </ul>
                <h3 style="color:#6b8e23; border-bottom:2px solid #f0f4e8; padding-bottom:8px; margin:24px 0 12px;">${isEn ? '8. Contact' : '8. Contato'}</h3>
                <p>${isEn ? 'Questions or requests:' : 'Dúvidas ou solicitações:'} <a href="mailto:jrverona@gmail.com" style="color:#6b8e23;">jrverona@gmail.com</a></p>
                <div style="background:#f8f9fa; border-radius:8px; padding:14px 18px; margin-top:24px; font-size:0.82rem; color:#7a828a; text-align:center;">
                    © 2025 José Ricardo Verona Alves — Valise Manager. ${isEn ? 'All rights reserved.' : 'Todos os direitos reservados.'}<br>
                    ${isEn ? 'Governed by Brazilian law. Jurisdiction: Ribeirão Preto/SP.' : 'Regido pela legislação brasileira. Foro: Ribeirão Preto/SP.'}
                </div>
            </div>
        `;
    }

    function applyTranslations() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = t(key);
            if (text) el.innerHTML = text;
        });
        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const text = t(key);
            if (text) el.title = text;
        });
        // Translate placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const text = t(key);
            if (text) el.placeholder = text;
        });
        // Re-render dynamic content so charts/tables pick up new language
        renderHelp();
        renderPrivacyModal();
        updateTripSelectors();
        updateTimelineFilters();
        updateCartaoSelector();
        renderTimeline();
        renderCards();
        if (document.getElementById('tab-finance').classList.contains('active')) {
            updateFinanceSelectors(); renderFinance();
        }
        renderBudgetBars();
        if (document.getElementById('budget-inputs-section') && document.getElementById('budget-inputs-section').classList.contains('open')) { renderBudgetInputs(); }
        if (document.getElementById('tab-cronograma').classList.contains('active')) {
            updateCronogramaSelectors(); renderCronograma();
        }
        renderChecklist();
    }

    function changeLang(lang) {
        currentLang = lang;
        document.querySelectorAll('.lang-flag-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.getAttribute('onclick').includes(`'${lang}'`)) btn.classList.add('active');
        });
        applyTranslations();
    }

    // ========== MEIOS DE PAGAMENTO ==========

    function updateCartaoSelector() {
        const sel = document.getElementById('nome-cartao');
        if (!sel) return;
        sel.innerHTML = `<option value="">${t('opt_select_card')}</option>` + cartoes.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    function adicionarCartao() {
        const nome = prompt(t('prompt_new_card'));
        if (nome && nome.trim() && !cartoes.includes(nome.trim())) {
            cartoes.push(nome.trim());
            safeSetItem('tp_cartoes_v17', JSON.stringify(cartoes));
            updateCartaoSelector();
            document.getElementById('nome-cartao').value = nome.trim();
        }
    }

    function onMeioPagamentoChange() {
        const meio = document.getElementById('meio-pagamento').value;
        const campoCartao = document.getElementById('campo-cartao');
        const campoParcelas = document.getElementById('campo-parcelas');
        const campoDataPag = document.getElementById('campo-data-pagamento');
        const isCredito = meio === 'credito';
        const isDebito = meio === 'debito';
        const isPix = meio === 'pix';
        campoCartao.style.display = (isCredito || isDebito || isPix) ? '' : 'none';
        campoParcelas.style.display = isCredito ? '' : 'none';
        campoDataPag.style.display = isCredito ? '' : 'none';
        if (!isCredito) {
            document.getElementById('parcelas-pagamento').value = '1';
            document.getElementById('data-pagamento').value = '';
        }
    }

    function labelMeioPagamento(meio) {
        const map = { credito: t('pay_credit'), debito: t('pay_debit'), pix: t('pay_pix'), dinheiro: t('pay_cash'), outro: t('pay_other') };
        return map[meio] || meio || '—';
    }

    function buildPaymentBadge(i) {
        if (!i.meioPagamento) return '';
        let txt = ' | <i class="fas fa-credit-card"></i> ' + labelMeioPagamento(i.meioPagamento);
        if (i.nomeCartao) txt += ' – ' + i.nomeCartao;
        if (i.parcelas > 1) txt += ' (' + i.parcelas + 'x)';
        if (i.dataPagamento) txt += ' | 📅 ' + i.dataPagamento.split('-').reverse().join('/');
        return txt;
    }

    function syncTripFilter(val) {
        globalTripFilter = val;
        const selects = ['filter-trip-title', 'filter-cards-trip', 'fin-filter-trip', 'cron-filter-trip', 'filter-check-trip', 'filter-link-trip', 'filter-fuel-trip', 'fuel-chart-trip', 'fuel-trip', 'man-trip', 'link-trip'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                if (val && ![...el.options].some(o => o.value === val)) {
                    el.add(new Option(val, val));
                }
                el.value = val;
            }
        });
        highlightTripFilters(val);
        renderTimeline();
        renderCards();
        renderFinance();
        renderChecklist();
        renderLinks();
        renderFuel();
        renderFuelChart();
        saveData();
        if (document.getElementById('tab-cronograma').classList.contains('active')) {
            renderCronograma();
        }
    }

    function highlightTripFilters(val) {
        const selects = ['filter-trip-title', 'filter-cards-trip', 'fin-filter-trip', 'cron-filter-trip', 'filter-check-trip', 'filter-link-trip', 'filter-fuel-trip', 'fuel-chart-trip', 'fuel-trip', 'man-trip', 'link-trip'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (val) {
                el.classList.add('trip-filter-active');
                const badge = el.parentElement.querySelector('.trip-filter-badge-name');
                if (badge) badge.textContent = val;
            } else {
                el.classList.remove('trip-filter-active');
            }
        });
    }

    function sendWhatsApp() {
        let filtered = getAllEvents();
        if (globalTripFilter) filtered = filtered.filter(e => e.trip === globalTripFilter);
        filtered = filtered.slice().sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''));

        if (filtered.length === 0) {
            alert(currentLang === 'en' ? 'No events to share.' : 'Nenhum evento para compartilhar.');
            return;
        }

        const tripName = globalTripFilter || (currentLang === 'en' ? 'My Trip' : 'Minha Viagem');
        let msg = `✈️ *${tripName}*\n\n`;

        let lastDate = '';
        filtered.forEach(e => {
            if (e.data !== lastDate) {
                msg += `\n📅 *${formatDate(e.data)}*\n`;
                lastDate = e.data;
            }
            const hora = e.hora ? `${e.hora} – ` : '';
            const valor = e.valor ? ` ($ ${e.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})})` : '';
            msg += `  ${hora}${e.desc}${valor}\n`;
        });

        const total = filtered.reduce((s, e) => s + (e.valor || 0), 0);
        msg += `\n💰 *${currentLang === 'en' ? 'Total' : 'Total'}:* $ ${total.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    async function exportData() {
        const data = { events, checks, tripNames, allBudgets, cartoes, links, fuelLog, manLog, exportDate: new Date().toISOString() };
        const content = JSON.stringify(data, null, 2);
        const fileName = `travel_planner_backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
            } catch (err) {}
        } else {
            const blob = new Blob([content], { type: 'application/json' });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'application/json' })] })) {
                try {
                    await navigator.share({ files: [new File([blob], fileName, { type: 'application/json' })], title: fileName });
                    return;
                } catch (err) {}
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
        }
    }

    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        // Extrai o nome do arquivo sem a extensão como nome da viagem
        const tripNameFromFile = file.name.replace(/\.[^/.]+$/, '');
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm(t('confirm_import'))) {
                    events = data.events || [];
                    checks = data.checks || [];
                    tripNames = data.tripNames || ["Viagem"];
                    allBudgets = data.allBudgets || {};
                    cartoes = data.cartoes || ["Nubank", "Itaú", "Bradesco", "Inter", "XP"];
                    links = (data.links || []).map(l => ({
                        id:      l.id      || Date.now().toString() + Math.random(),
                        name:    l.name    || l.nome     || '',
                        cat:     l.cat     || 'Outro',
                        trip:    l.trip    || '',
                        address: l.address || l.endereco || '',
                        phone:   l.phone   || l.telefone || '',
                        url:     l.url     || '',
                        notes:   l.notes   || l.obs      || '',
                    }));
                    safeSetItem('tp_v17', JSON.stringify(events));
                    safeSetItem('tc_v17', JSON.stringify(checks));
                    safeSetItem('tr_names_v17', JSON.stringify(tripNames));
                    safeSetItem('tp_budgets_v18', JSON.stringify(allBudgets));
                    safeSetItem('tp_cartoes_v17', JSON.stringify(cartoes));
                    safeSetItem('tp_links_v17', JSON.stringify(links));
                    fuelLog = data.fuelLog || [];
                    safeSetItem('tp_fuel_v1', JSON.stringify(fuelLog));
                    manLog = data.manLog || [];
                    safeSetItem('tp_man_v1', JSON.stringify(manLog));
                    // Salva o nome do arquivo para ser selecionado automaticamente após o reload
                    safeSetItem('tp_pending_trip_select', tripNameFromFile);
                    location.reload();
                }
            } catch (err) { alert(t('error_import')); }
        };
        reader.readAsText(file);
    }

    function clearAllData() {
        if (confirm(t('confirm_clear_data'))) {
            localStorage.removeItem('tp_v17');
            localStorage.removeItem('tc_v17');
            localStorage.removeItem('tr_names_v17');
            localStorage.removeItem('tp_budgets_v18');
            localStorage.removeItem('tp_cartoes_v17');
            localStorage.removeItem('tp_links_v17');
            localStorage.removeItem('tp_fuel_v1');
            localStorage.removeItem('tp_man_v1');
            location.reload();
        }
    }

    function switchTab(e, tabId) {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        const targetBtn = document.getElementById('btn-' + tabId);
        if(targetBtn) {
            targetBtn.classList.add('active');
            targetBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
        }
        if (tabId === 'tab-finance') { updateFinanceSelectors(); renderFinance(); }
        if (tabId === 'tab-timeline') { updateTripSelectors(); updateTimelineFilters(); renderTimeline(); }
        if (tabId === 'tab-cards') { updateTripSelectors(); renderCards(); }
        if (tabId === 'tab-cronograma') { updateCronogramaSelectors(); renderCronograma(); }
        if (tabId === 'tab-checklist') renderChecklist();
        if (tabId === 'tab-ajuda') renderHelp();
        if (tabId === 'tab-links') { updateLinkTripSelectors(); renderLinks(); }
        if (tabId === 'tab-combustivel') { updateFuelTripSelectors(); renderFuel(); renderFuelChart(); }
        if (tabId === 'tab-manutencao') { updateManTripSelectors(); renderMan(); }
    }

    function clearFilters() {
        syncTripFilter("");
        document.getElementById('filter-date').value = "";
        renderTimeline();
    }

    function filterByDate(date) {
        updateTimelineFilters();
        document.getElementById('filter-date').value = date;
        switchTab(null, 'tab-timeline');
    }

    function addNewTripName() {
        const name = prompt(t('prompt_new_trip'));
        if (name && !tripNames.includes(name)) {
            tripNames.push(name);
            safeSetItem('tr_names_v17', JSON.stringify(tripNames));
            updateTripSelectors();
            const form = document.getElementById('trip-title');
            if (form) form.value = name;
            pendingLinkTrip = name;
            updateLinkTripSelectors();
            pendingCheckTrip = name;
            syncTripFilter(name);
        }
    }

    function deleteCurrentTrip() {
        const sel = document.getElementById('trip-title');
        const name = sel ? sel.value : '';
        if (!name) return;
        const isEn = currentLang === 'en';
        const msg = isEn
            ? `Delete the trip "${name}"? This will NOT delete the events linked to it.`
            : `Excluir a viagem "${name}"? Isso NÃO excluirá os eventos vinculados a ela.`;
        if (!confirm(msg)) return;
        tripNames = tripNames.filter(t => t !== name);
        if (tripNames.length === 0) tripNames = [isEn ? 'Trip' : 'Viagem'];
        safeSetItem('tr_names_v17', JSON.stringify(tripNames));
        if (globalTripFilter === name) syncTripFilter('');
        updateTripSelectors();
    }

    function updateTripSelectors() {
        const f1 = document.getElementById('filter-trip-title');
        const f2 = document.getElementById('filter-cards-trip');
        const form = document.getElementById('trip-title');
        const allTripsOpt = `<option value="">${t('opt_all_trips')}</option>`;
        const optionsHtml = allTripsOpt + tripNames.map(tr => `<option value="${tr}">${tr}</option>`).join('');
        if(f1) { f1.innerHTML = optionsHtml; f1.value = globalTripFilter; }
        if(f2) { f2.innerHTML = optionsHtml; f2.value = globalTripFilter; }
        if(form) { const prev = form.value; form.innerHTML = tripNames.map(tr => `<option value="${tr}">${tr}</option>`).join(''); if(prev && tripNames.includes(prev)) form.value = prev; }
        updateLinkTripSelectors();
        updateFuelTripSelectors();
        updateManTripSelectors();
        updateTripStampTitle();
    }

    /* Atualiza o carimbo de passaporte do cabeçalho com o Título da Viagem atual */
    function updateTripStampTitle() {
        const stamp = document.getElementById('trip-stamp-title');
        if (!stamp) return;
        const form = document.getElementById('trip-title');
        const fallback = currentLang === 'en' ? 'My Trip' : 'Minha Viagem';
        stamp.textContent = (form && form.value) ? form.value : fallback;
    }

    function updateTimelineFilters() {
        const dateSel = document.getElementById('filter-date');
        if(!dateSel) return;
        const current = dateSel.value;
        const uniqueDates = [...new Set(events.map(e => e.data))].sort();
        dateSel.innerHTML = `<option value="">${t('opt_all_dates')}</option>` + uniqueDates.map(d => `<option value="${d}">${formatDate(d)}</option>`).join('');
        dateSel.value = current;
    }

    function resetFinanceFilters() {
        syncTripFilter("");
        document.getElementById('fin-filter-city').value = "";
        document.getElementById('fin-filter-cat').value = "";
        document.getElementById('fin-chart-filter').value = "all";
        filterFinanceCharts();
        renderFinance();
    }

    function updateFinanceSelectors() {
        const tS = document.getElementById('fin-filter-trip');
        const cS = document.getElementById('fin-filter-city');
        const cc = cS.value;
        tS.innerHTML = `<option value="">${t('opt_all_trips')}</option>` + tripNames.map(tr => `<option value="${tr}">${tr}</option>`).join('');
        tS.value = globalTripFilter;
        const allCidades = [
            ...events.map(e => e.cidade),
            ...fuelLog.map(f => f.cidade),
            ...manLog.map(m => m.local),
        ];
        const uniqueCities = [...new Set(allCidades)].filter(c => c);
        cS.innerHTML = `<option value="">${t('opt_all_cities')}</option>` + uniqueCities.map(c => `<option value="${c}">${c}</option>`).join('');
        cS.value = cc;
    }

    function calcConversao() {
        const moeda = document.getElementById('moeda-estrangeira').value;
        const cotacaoEl = document.getElementById('cotacao-moeda');
        const valorEl = document.getElementById('valor');
        const previewEl = document.getElementById('valor-brl-preview');
        if (moeda === 'BRL') { cotacaoEl.value = 1; cotacaoEl.readOnly = true; }
        else { cotacaoEl.readOnly = false; }
        const valorOriginal = parseFloat(valorEl.value || 0);
        const cotacao = parseFloat(cotacaoEl.value || 1);
        previewEl.value = (valorOriginal * cotacao).toFixed(2);
    }

    function saveEvent() {
        try {
            const editId = document.getElementById('edit-id').value;
            const moeda = document.getElementById('moeda-estrangeira').value;
            const cotacao = parseFloat(document.getElementById('cotacao-moeda').value || 1);
            const valorOriginal = parseFloat(document.getElementById('valor').value || 0);
            const valorBRL = moeda === 'BRL' ? valorOriginal : parseFloat((valorOriginal * cotacao).toFixed(2));
            const meioPag = document.getElementById('meio-pagamento').value;
            const isCredito = meioPag === 'credito';
            const isDebito = meioPag === 'debito';
            const item = {
                id: editId ? parseInt(editId) : Date.now(),
                trip: document.getElementById('trip-title').value,
                cidade: document.getElementById('cidade').value,
                hospedagem: document.getElementById('hospedagem').value,
                data: document.getElementById('data').value,
                hora: document.getElementById('hora').value,
                desc: document.getElementById('desc').value,
                classe: document.getElementById('classe').value,
                valor: valorBRL,
                moedaOriginal: moeda,
                valorOriginal: valorOriginal,
                cotacao: cotacao,
                meioPagamento: meioPag,
                nomeCartao: (isCredito || isDebito) ? document.getElementById('nome-cartao').value : '',
                parcelas: isCredito ? parseInt(document.getElementById('parcelas-pagamento').value || 1) : 1,
                dataPagamento: isCredito ? document.getElementById('data-pagamento').value : '',
                ocultoCliente: editId ? (events.find(e => e.id === parseInt(editId))?.ocultoCliente || false) : false
            };
            if (editId) {
                const index = events.findIndex(e => e.id === parseInt(editId));
                if (index !== -1) events[index] = item;
                else events.push(item);
                document.getElementById('edit-id').value = '';
            } else {
                events.push(item);
            }
            safeSetItem('tp_v17', JSON.stringify(events));
            updateTimelineFilters();
            renderTimeline();
            ['cidade', 'hospedagem', 'desc', 'valor'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('moeda-estrangeira').value = 'BRL';
            document.getElementById('cotacao-moeda').value = 1;
            document.getElementById('valor-brl-preview').value = '';
            document.getElementById('meio-pagamento').value = 'credito';
            document.getElementById('nome-cartao').value = '';
            document.getElementById('parcelas-pagamento').value = '1';
            document.getElementById('data-pagamento').value = '';
            onMeioPagamentoChange();
            // Feedback visual
            const btn = document.getElementById('btn-save');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Salvo!';
            btn.style.background = '#4caf50';
            setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; }, 1500);
        } catch(err) {
            alert('Erro ao salvar: ' + err.message);
            console.error(err);
        }
    }

    function editEvent(id) {
        const item = events.find(e => e.id === id);
        if (item) {
            document.getElementById('edit-id').value = item.id;
            document.getElementById('trip-title').value = item.trip;
            updateTripStampTitle();
            document.getElementById('cidade').value = item.cidade;
            document.getElementById('hospedagem').value = item.hospedagem;
            document.getElementById('data').value = item.data;
            document.getElementById('hora').value = item.hora;
            document.getElementById('desc').value = item.desc;
            document.getElementById('classe').value = item.classe;
            document.getElementById('valor').value = item.valorOriginal !== undefined ? item.valorOriginal : item.valor;
            document.getElementById('moeda-estrangeira').value = item.moedaOriginal || 'BRL';
            document.getElementById('cotacao-moeda').value = item.cotacao || 1;
            document.getElementById('valor-brl-preview').value = item.valor.toFixed(2);
            if ((item.moedaOriginal || 'BRL') === 'BRL') {
                document.getElementById('cotacao-moeda').readOnly = true;
            } else {
                document.getElementById('cotacao-moeda').readOnly = false;
            }
            // Restaurar campos de pagamento
            document.getElementById('meio-pagamento').value = item.meioPagamento || 'credito';
            onMeioPagamentoChange();
            if (item.nomeCartao) document.getElementById('nome-cartao').value = item.nomeCartao;
            if (item.parcelas) document.getElementById('parcelas-pagamento').value = item.parcelas;
            if (item.dataPagamento) document.getElementById('data-pagamento').value = item.dataPagamento;
            window.scrollTo({ top: 150, behavior: 'smooth' });
        }
    }

    function deleteEvent(id) {
        if(confirm(t('confirm_delete_item'))) {
            events = events.filter(e => e.id !== id);
            safeSetItem('tp_v17', JSON.stringify(events));
            updateTimelineFilters(); renderTimeline();
        }
    }

    function toggleClientVisibility(id) {
        const item = events.find(e => e.id === id);
        if (item) {
            item.ocultoCliente = !item.ocultoCliente;
            safeSetItem('tp_v17', JSON.stringify(events));
            renderTimeline();
        }
    }

    function renderTimeline() {
        const div = document.getElementById('render-timeline');
        if(!div) return;
        div.innerHTML = '';
        const dateFilter = document.getElementById('filter-date').value;
        let filtered = events;
        if (globalTripFilter) filtered = filtered.filter(e => e.trip === globalTripFilter);
        if (dateFilter) filtered = filtered.filter(e => e.data === dateFilter);
        const grouped = filtered.sort((a,b) => (a.data+a.hora).localeCompare(b.data+b.hora))
            .reduce((acc, i) => { acc[i.data] = acc[i.data] || []; acc[i.data].push(i); return acc; }, {});
        if (Object.keys(grouped).length === 0) {
            const isEn = currentLang === 'en';
            div.innerHTML = `<div style="text-align:center; padding: 60px 20px; color:var(--text-muted);">
                <div style="font-size:3rem; margin-bottom:16px;">🗺️</div>
                <div style="font-size:1.1rem; font-weight:600; color:var(--text); margin-bottom:8px;">${isEn ? 'No events yet' : 'Nenhum evento ainda'}</div>
                <div style="font-size:0.88rem;">${isEn ? 'Fill in the form above and click Save to start planning your trip.' : 'Preencha o formulário acima e clique em Salvar para começar a planejar sua viagem.'}</div>
            </div>`;
            return;
        }
        for(let date in grouped) {
            const allHidden = grouped[date].every(i => i.ocultoCliente);
            div.innerHTML += `<div class="day-header${allHidden ? ' hidden-from-client' : ''}"><i class="far fa-calendar-alt"></i>${formatDate(date)}</div>`;
            grouped[date].forEach(i => {
                const cfg = iconConfig[i.classe] || { icon: 'fa-star', color: '#666', bg: '#f5f5f5' };
                div.innerHTML += `
                    <div class="${i.ocultoCliente ? 'item-card hidden-from-client' : 'item-card'}" style="${i.ocultoCliente ? 'opacity:0.55; border-left:4px dashed #dc2626;' : ''}">
                        <div class="item-time">${i.hora}</div>
                        <div class="icon-box-timeline" style="background: ${cfg.bg}; color: ${cfg.color};">${catIconHtml(cfg)}</div>
                        <div class="item-details"><b>${i.desc}</b><small><i class="fas fa-map-marker-alt"></i> ${i.cidade} | <i class="fas fa-suitcase"></i> ${i.hospedagem}${buildPaymentBadge(i)}</small>${i.ocultoCliente ? `<small style="color:#dc2626; font-weight:700;"><i class="fas fa-eye-slash"></i> ${t('lbl_hidden_from_client')}</small>` : ''}</div>
                        <div class="item-price" style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
                            <span>$ ${i.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                            ${(i.moedaOriginal && i.moedaOriginal !== 'BRL') ? `<span style="font-size:0.7rem;color:var(--text-muted);font-weight:400;">${i.moedaOriginal} ${(i.valorOriginal||0).toLocaleString('pt-BR',{minimumFractionDigits:2})} × ${(i.cotacao||1).toFixed(4)}</span>` : ''}
                        </div>
                        <div class="timeline-actions">
                            <button class="btn-edit-item" onclick="toggleClientVisibility(${i.id})" title="${t('lbl_toggle_client_visibility')}" style="${i.ocultoCliente ? 'color:#dc2626; border-color:#dc2626;' : ''}"><i class="fas ${i.ocultoCliente ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                            <button class="btn-edit-item" onclick="editEvent(${i.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete-item" onclick="deleteEvent(${i.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
            });
        }
    }

    function renderCards() {
        const div = document.getElementById('render-cards');
        if(!div) return;
        div.innerHTML = '';
        let filtered = events;
        if (globalTripFilter) filtered = filtered.filter(e => e.trip === globalTripFilter);
        const grouped = filtered.reduce((acc, i) => { acc[i.data] = acc[i.data] || []; acc[i.data].push(i); return acc; }, {});
        for(let date in grouped) {
            const dayEvents = grouped[date];
            div.innerHTML += `
                <div class="daily-card" onclick="filterByDate('${date}')">
                    <h3>${formatDate(date)}</h3>
                    <div class="card-row"><i class="fas fa-map-marker-alt card-icon"></i> ${dayEvents[0].cidade}</div>
                    <div class="card-row"><i class="fas fa-hotel card-icon"></i> ${dayEvents[0].hospedagem}</div>
                    <hr style="border:0; border-top:1px solid #eee; margin:10px 0">
                    ${dayEvents.map(e => `
                        <div style="font-size:0.8rem; margin-bottom:6px; display: flex; align-items: center; gap: 8px;">
                            ${catIconHtml(iconConfig[e.classe] || { icon: 'fa-star', color: '#666' }, `color: ${iconConfig[e.classe]?.color || '#666'}; width: 14px;`)}
                            <span><b>${e.hora}</b> - ${e.desc}</span>
                        </div>`).join('')}
                </div>`;
        }
    }

    function updateManTripSelectors() {
        const sel = document.getElementById('man-trip');
        if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = '<option value="">— Sem viagem —</option>';
        tripNames.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name; opt.textContent = name;
            sel.appendChild(opt);
        });
        if (cur && tripNames.includes(cur)) sel.value = cur;
    }

    function getAllEvents() {
        const fuelAsEvents = fuelLog
            .filter(f => f.total > 0)
            .map(f => ({
                id: 'fuel_' + f.id, trip: f.trip || '', cidade: f.cidade || '',
                data: f.data, hora: '', desc: f.posto ? 'Abastecimento - ' + f.posto : 'Abastecimento',
                classe: 'Combustível', valor: f.total,
                meioPagamento: f.meioPagamento || 'dinheiro',
                nomeCartao:    f.nomeCartao    || '',
                parcelas:      f.parcelas      || 1,
                dataPagamento: f.dataPagamento || '',
            }));
        const manAsEvents = manLog
            .filter(m => m.custo > 0)
            .map(m => ({
                id: 'man_' + m.id, trip: m.trip || '', cidade: m.local || '',
                data: m.data, hora: '', desc: 'Manutenção - ' + m.tipo,
                classe: 'Manutenção / Mecânica', valor: m.custo,
                meioPagamento: m.meioPagamento || 'dinheiro',
                nomeCartao:    m.nomeCartao    || '',
                parcelas:      m.parcelas      || 1,
                dataPagamento: m.dataPagamento || '',
            }));
        return [...events, ...fuelAsEvents, ...manAsEvents];
    }

    function renderFinance() {
        const cF = document.getElementById('fin-filter-city').value;
        const ctF = document.getElementById('fin-filter-cat').value;
        let filtered = getAllEvents();
        if (globalTripFilter) filtered = filtered.filter(e => e.trip === globalTripFilter);
        if (cF) filtered = filtered.filter(e => e.cidade === cF);
        if (ctF) filtered = filtered.filter(e => e.classe === ctF);
        const total = filtered.reduce((sum, i) => sum + i.valor, 0);
        const totalEl = document.getElementById('finance-total-val');
        if(totalEl) totalEl.innerText = `$ ${total.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        const dailyData = filtered.reduce((acc, i) => { acc[i.data] = (acc[i.data] || 0) + i.valor; return acc; }, {});
        const catData = filtered.reduce((acc, i) => { acc[i.classe] = (acc[i.classe] || 0) + i.valor; return acc; }, {});
        const cityData = filtered.reduce((acc, i) => { const c = i.cidade || 'N/A'; acc[c] = (acc[c] || 0) + i.valor; return acc; }, {});

        const isEn = currentLang === 'en';
        const emptyMsg = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);gap:8px;">
            <i class="fas fa-chart-bar" style="font-size:2rem;opacity:0.25;"></i>
            <span style="font-size:0.85rem;">${isEn ? 'No data to display' : 'Nenhum dado para exibir'}</span>
        </div>`;

        const numDailyLabels = Object.keys(dailyData).length;
        const dailyScrollContent = document.getElementById('daily-scroll-content');
        if(dailyScrollContent) {
            const minWidthPerBar = 70;
            const dailyChartWidth = Math.max(100, numDailyLabels * minWidthPerBar);
            dailyScrollContent.style.width = dailyChartWidth + 'px';
        }

        const dailyCanvas = document.getElementById('chartDaily');
        if(dailyCanvas) {
            if(chartD) chartD.destroy();
            if (Object.keys(dailyData).length === 0) {
                dailyCanvas.style.display = 'none';
                let emp = dailyCanvas.parentElement.querySelector('.chart-empty');
                if (!emp) { emp = document.createElement('div'); emp.className = 'chart-empty'; emp.style.cssText = 'height:100%;'; dailyCanvas.parentElement.appendChild(emp); }
                emp.innerHTML = emptyMsg;
            } else {
                dailyCanvas.style.display = '';
                const emp = dailyCanvas.parentElement.querySelector('.chart-empty');
                if (emp) emp.remove();
                chartD = new Chart(dailyCanvas, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(dailyData).map(formatDate),
                        datasets: [{ label: t('chart_daily'), data: Object.values(dailyData), backgroundColor: '#6b8e23', borderRadius: 8, borderSkipped: false }]
                    },
                    options: { 
                        responsive: true, maintainAspectRatio: false,
                        layout: { padding: { top: 40, bottom: 10 } },
                        plugins: { 
                            legend: { display: false },
                            title: { display: true, text: t('chart_daily') },
                            datalabels: { anchor: 'end', align: 'top', formatter: (v) => '$ '+v.toLocaleString(), font: { size: 10, weight: 'bold' } }
                        },
                        scales: { 
                            y: { beginAtZero: true, suggestedMax: Math.max(...Object.values(dailyData), 0) * 1.2 },
                            x: { ticks: { font: { size: 10 } } }
                        }
                    }
                });
            }
        }

        const catCanvas = document.getElementById('chartCategory');
        if(catCanvas) {
            if(chartC) chartC.destroy();
            if (Object.keys(catData).length === 0) {
                catCanvas.style.display = 'none';
                let emp = catCanvas.parentElement.querySelector('.chart-empty');
                if (!emp) { emp = document.createElement('div'); emp.className = 'chart-empty'; emp.style.cssText = 'height:80%;'; catCanvas.parentElement.appendChild(emp); }
                emp.innerHTML = emptyMsg;
            } else {
                catCanvas.style.display = '';
                const emp = catCanvas.parentElement.querySelector('.chart-empty');
                if (emp) emp.remove();
                const catI18nMap = { 'Aéreo': 'opt_cat_aereo', 'Aluguel de carro': 'opt_cat_aluguelcarro', 'Camping Fee': 'opt_cat_campingfee', 'Combustível': 'opt_cat_combustivel', 'Compras': 'opt_cat_compras', 'Energia / Solar': 'opt_cat_energiasolar', 'GLP / Gás': 'opt_cat_glpgas', 'Hospedagem': 'opt_cat_hospedagem', 'Internet/Fone': 'opt_cat_internetfone', 'Lavanderia': 'opt_cat_lavanderia', 'Lazer': 'opt_cat_lazer', 'Manutenção / Mecânica': 'opt_cat_manutencao', 'Pedágio': 'opt_cat_pedagio', 'Refeição': 'opt_cat_refeicao', 'Seguro': 'opt_cat_seguro', 'Transporte': 'opt_cat_transporte', 'Água / Esgoto': 'opt_cat_aguaesgoto' };
                chartC = new Chart(catCanvas, {
                    type: 'bar', data: { labels: Object.keys(catData).map(c => t(catI18nMap[c]) || c), datasets: [{ data: Object.values(catData), backgroundColor: Object.keys(catData).map(c => (iconConfig[c] || {color: '#ddd'}).color), borderRadius: 8, borderSkipped: false }] },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, layout: { padding: { right: 80 } }, plugins: { legend: { display: false }, title: { display: true, text: t('chart_category') }, datalabels: { anchor: 'end', align: 'right', formatter: (v) => '$ '+v.toLocaleString(), font: { size: 10 } } }, scales: { x: { display: false, suggestedMax: Math.max(...Object.values(catData), 0) * 1.3 }, y: { grid: { display: false } } } }
                });
            }
        }

        const cityCanvas = document.getElementById('chartCity');
        if(cityCanvas) {
            if(chartCity) chartCity.destroy();
            if (Object.keys(cityData).length === 0) {
                cityCanvas.style.display = 'none';
                let emp = cityCanvas.parentElement.querySelector('.chart-empty');
                if (!emp) { emp = document.createElement('div'); emp.className = 'chart-empty'; emp.style.cssText = 'height:80%;'; cityCanvas.parentElement.appendChild(emp); }
                emp.innerHTML = emptyMsg;
            } else {
                cityCanvas.style.display = '';
                const emp = cityCanvas.parentElement.querySelector('.chart-empty');
                if (emp) emp.remove();
                chartCity = new Chart(cityCanvas, {
                    type: 'bar', data: { labels: Object.keys(cityData), datasets: [{ data: Object.values(cityData), backgroundColor: '#7fa9c4', borderRadius: 8, borderSkipped: false }] },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, layout: { padding: { right: 80 } }, plugins: { legend: { display: false }, title: { display: true, text: t('chart_city') }, datalabels: { anchor: 'end', align: 'right', formatter: (v) => '$ '+v.toLocaleString(), font: { size: 10 } } }, scales: { x: { display: false, suggestedMax: Math.max(...Object.values(cityData), 0) * 1.3 }, y: { grid: { display: false } } } }
                });
            }
        }

        const payLabelMap = { credito: t('pay_credit'), debito: t('pay_debit'), pix: t('pay_pix'), dinheiro: t('pay_cash'), outro: t('pay_other') };
        const payData = filtered.reduce((acc, i) => {
            const mp = i.meioPagamento || 'outro';
            const label = payLabelMap[mp] || mp;
            acc[label] = (acc[label] || 0) + i.valor;
            return acc;
        }, {});

        const payColors = {
            [t('pay_credit')]: '#c38d9e',
            [t('pay_debit')]: '#7fa9c4',
            [t('pay_pix')]: '#88d8b0',
            [t('pay_cash')]: '#e8a87c',
            [t('pay_other')]: '#d4a5a5'
        };

        const payCanvas = document.getElementById('chartPaymentMethod');
        if (payCanvas) {
            if (chartPay) chartPay.destroy();
            if (Object.keys(payData).length === 0) {
                payCanvas.style.display = 'none';
                let emp = payCanvas.parentElement.querySelector('.chart-empty');
                if (!emp) { emp = document.createElement('div'); emp.className = 'chart-empty'; emp.style.cssText = 'height:80%;'; payCanvas.parentElement.appendChild(emp); }
                emp.innerHTML = emptyMsg;
            } else {
                payCanvas.style.display = '';
                const emp = payCanvas.parentElement.querySelector('.chart-empty');
                if (emp) emp.remove();
                chartPay = new Chart(payCanvas, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(payData),
                        datasets: [{
                            data: Object.values(payData),
                            backgroundColor: Object.keys(payData).map(k => payColors[k] || '#95b8d1'),
                            borderRadius: 8,
                            borderSkipped: false
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: { padding: { right: 90 } },
                        plugins: {
                            legend: { display: false },
                            title: { display: true, text: isEn ? '💳 Expenses by Payment Method' : '💳 Gastos por Meio de Pagamento' },
                            datalabels: { anchor: 'end', align: 'right', formatter: (v) => '$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), font: { size: 10 } }
                        },
                        scales: {
                            x: { display: false, suggestedMax: Math.max(...Object.values(payData), 0) * 1.35 },
                            y: { grid: { display: false } }
                        }
                    }
                });
            }
        }

        // ===== GRÁFICO POR MOEDA =====
        const currencyData = filtered.reduce((acc, i) => {
            const moeda = i.moedaOriginal || 'BRL';
            // Agrupa pelo valor original na moeda (soma valorOriginal por moeda)
            if (!acc[moeda]) acc[moeda] = { totalOriginal: 0, totalBRL: 0, count: 0 };
            acc[moeda].totalOriginal += (i.valorOriginal !== undefined ? i.valorOriginal : i.valor);
            acc[moeda].totalBRL += i.valor;
            acc[moeda].count++;
            return acc;
        }, {});

        const currencyCanvas = document.getElementById('chartCurrency');
        if (currencyCanvas) {
            if (chartCurrency) chartCurrency.destroy();
            if (Object.keys(currencyData).length === 0) {
                currencyCanvas.style.display = 'none';
                let emp = currencyCanvas.parentElement.querySelector('.chart-empty');
                if (!emp) { emp = document.createElement('div'); emp.className = 'chart-empty'; emp.style.cssText = 'height:80%;'; currencyCanvas.parentElement.appendChild(emp); }
                emp.innerHTML = emptyMsg;
            } else {
                currencyCanvas.style.display = '';
                const emp = currencyCanvas.parentElement.querySelector('.chart-empty');
                if (emp) emp.remove();

                const currencyPalette = ['#6b8e23','#88d8b0','#7fa9c4','#e8a87c','#c38d9e','#95b8d1','#d4a5a5','#f0c987','#a8d8a8','#b8a9c9'];
                const currencyLabels = Object.keys(currencyData);
                const currencyColors = currencyLabels.map((_, i) => currencyPalette[i % currencyPalette.length]);
                const currencyValues = currencyLabels.map(m => parseFloat(currencyData[m].totalOriginal.toFixed(2)));
                const maxCurrVal = Math.max(...currencyValues, 0);

                chartCurrency = new Chart(currencyCanvas, {
                    type: 'bar',
                    data: {
                        labels: currencyLabels,
                        datasets: [{
                            data: currencyValues,
                            backgroundColor: currencyColors,
                            borderRadius: 8,
                            borderSkipped: false
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: { padding: { right: 110 } },
                        plugins: {
                            legend: { display: false },
                            title: { display: true, text: isEn ? '💱 Expenses by Currency' : '💱 Gastos por Moeda', font: { size: 14 } },
                            datalabels: {
                                anchor: 'end',
                                align: 'right',
                                formatter: (value, ctx) => {
                                    const moeda = currencyLabels[ctx.dataIndex];
                                    return `${moeda} ${value.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
                                },
                                font: { size: 10 }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => {
                                        const moeda = currencyLabels[ctx.dataIndex];
                                        const d = currencyData[moeda];

                                        return [
                                            ` ${isEn ? 'Total' : 'Total'}: ${moeda} ${d.totalOriginal.toLocaleString('pt-BR', {minimumFractionDigits:2})}`,
                                            ` ${isEn ? 'Transactions' : 'Transações'}: ${d.count}`
                                        ];
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { display: false, suggestedMax: maxCurrVal * 1.35 },
                            y: { grid: { display: false } }
                        }
                    }
                });
            }
        }

        renderBudgetBars();
    }

    function addCheck() {
        const txt = document.getElementById('check-input').value;
        const cat = document.getElementById('check-new-cat').value || document.getElementById('check-cat').value;
        const trip = document.getElementById('check-trip').value;
        if(!txt) return;
        checks.push({id: Date.now(), txt, cat, trip, done: false});
        safeSetItem('tc_v17', JSON.stringify(checks));
        renderChecklist();
        document.getElementById('check-input').value = '';
        document.getElementById('check-new-cat').value = '';
    }

    function deleteCheck(id) {
        checks = checks.filter(c => c.id !== id);
        safeSetItem('tc_v17', JSON.stringify(checks));
        renderChecklist();
    }

    function renderChecklist() {
        const div = document.getElementById('render-checklist');
        if(!div) return;
        div.innerHTML = '';
        const base = ["Bagagem", "Documentos", "Financeiro"];
        const baseCatI18n = { 'Bagagem': 'check_cat_bagagem', 'Documentos': 'check_cat_documentos', 'Financeiro': 'check_cat_financeiro' };
        const allCats = [...new Set([...base, ...checks.map(c => c.cat)])].sort();
        const catLabel = c => t(baseCatI18n[c]) || c;
        const selForm = document.getElementById('check-cat');
        if(selForm) {
            const currForm = selForm.value;
            selForm.innerHTML = allCats.map(c => `<option value="${c}">${catLabel(c)}</option>`).join('');
            if (allCats.includes(currForm)) selForm.value = currForm;
        }

        const selTripForm = document.getElementById('check-trip');
        if(selTripForm) {
            const currTripForm = pendingCheckTrip || selTripForm.value;
            selTripForm.innerHTML = `<option value="">${t('opt_all_trips')}</option>` + tripNames.map(tr => `<option value="${tr}">${tr}</option>`).join('');
            if (tripNames.includes(currTripForm)) selTripForm.value = currTripForm;
            if (pendingCheckTrip) pendingCheckTrip = "";
        }

        const selFilterTrip = document.getElementById('filter-check-trip');
        if(selFilterTrip) {
            const currFilterTrip = selFilterTrip.value;
            selFilterTrip.innerHTML = `<option value="">${t('opt_all_trips')}</option>` + tripNames.map(tr => `<option value="${tr}">${tr}</option>`).join('');
            if (tripNames.includes(currFilterTrip)) selFilterTrip.value = currFilterTrip;
        }

        const selFilter = document.getElementById('filter-check-cat');
        if(selFilter) {
            const currFilter = selFilter.value;
            selFilter.innerHTML = `<option value="">${t('opt_all_categories')}</option>` + allCats.map(c => `<option value="${c}">${catLabel(c)}</option>`).join('');
            selFilter.value = currFilter;

            const currFilterTrip = selFilterTrip ? selFilterTrip.value : '';
            let filteredChecks = checks;
            if (currFilterTrip) {
                filteredChecks = filteredChecks.filter(c => c.trip === currFilterTrip);
            }
            if (currFilter) {
                filteredChecks = filteredChecks.filter(c => c.cat === currFilter);
            }
            const grouped = filteredChecks.reduce((acc, c) => { acc[c.cat] = acc[c.cat] || []; acc[c.cat].push(c); return acc; }, {});
            if (Object.keys(grouped).length === 0) {
                const isEn = currentLang === 'en';
                div.innerHTML = `<div style="text-align:center; padding: 50px 20px; color:var(--text-muted);">
                    <div style="font-size:2.5rem; margin-bottom:14px;">✅</div>
                    <div style="font-size:1rem; font-weight:600; color:var(--text); margin-bottom:6px;">${isEn ? 'No items in the checklist' : 'Nenhum item no checklist'}</div>
                    <div style="font-size:0.85rem;">${isEn ? 'Add items using the form above to start organizing your trip.' : 'Adicione itens pelo formulário acima para começar a organizar sua viagem.'}</div>
                </div>`;
            } else {
                for(let cat in grouped) {
                    const sorted = [...grouped[cat]].sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);
                    const total = sorted.length;
                    const done = sorted.filter(i => i.done).length;
                    const allDone = done === total;
                    div.innerHTML += `<div class="check-group-title">${cat} <span style="font-size:0.78rem; font-weight:600; color:${allDone ? 'var(--accent)' : 'var(--text-muted)'}; margin-left:6px; font-family:sans-serif;">${done}/${total}</span></div>`;
                    sorted.forEach(i => {
                        div.innerHTML += `<div class="check-item ${i.done ? 'done' : ''}" onclick="toggleCheck(${i.id})"><div class="custom-checkbox"></div><span>${i.txt}</span><button class="btn-del-check" onclick="event.stopPropagation(); deleteCheck(${i.id})"><i class="fas fa-trash"></i></button></div>`;
                    });
                }
            }
        }
    }

    function toggleCheck(id) {
        const item = checks.find(i => i.id === id);
        if (item) {
            item.done = !item.done;
            safeSetItem('tc_v17', JSON.stringify(checks));
            renderChecklist();
        }
    }

    // ========== BUDGET TRACKER ==========
    const categories = ['Aéreo', 'Aluguel de carro', 'Combustível', 'Compras', 'Hospedagem', 'Internet/Fone', 'Lazer', 'Pedágio', 'Refeição', 'Seguro', 'Transporte'];
    const catIcons = { 'Aéreo': '✈️', 'Aluguel de carro': '🚗', 'Combustível': '⛽', 'Compras': '🛍️', 'Hospedagem': '🏨', 'Internet/Fone': '📶', 'Lazer': '🏛️', 'Pedágio': '🛣️', 'Refeição': '🍴', 'Seguro': '🛡️', 'Transporte': '🚌' };

    function getTripBudgetKey() {
        return globalTripFilter || '__all__';
    }

    function toggleBudgetEdit() {
        const sec = document.getElementById('budget-inputs-section');
        sec.classList.toggle('open');
        if (sec.classList.contains('open')) renderBudgetInputs();
    }

    function renderBudgetInputs() {
        const grid = document.getElementById('budget-inputs-grid');
        if (!grid) return;
        const budgets = allBudgets[getTripBudgetKey()] || {};
        // Total budget input
        grid.innerHTML = `
            <div class="budget-input-item" style="grid-column: 1/-1;">
                <label><span style="font-size:1rem;">💰</span> ${currentLang === 'en' ? 'Total Trip Budget' : 'Orçamento Total da Viagem'}</label>
                <input type="number" id="budget-input-total" placeholder="${currentLang === 'en' ? 'Ex: 5000' : 'Ex: 5000'}" 
                    value="${budgets['__total__'] || ''}" min="0" step="0.01">
            </div>
            ${categories.map(cat => `
            <div class="budget-input-item">
                <label>${t({'Aéreo':'opt_cat_aereo','Aluguel de carro':'opt_cat_aluguelcarro','Camping Fee':'opt_cat_campingfee','Combustível':'opt_cat_combustivel','Compras':'opt_cat_compras','Energia / Solar':'opt_cat_energiasolar','GLP / Gás':'opt_cat_glpgas','Hospedagem':'opt_cat_hospedagem','Internet/Fone':'opt_cat_internetfone','Lavanderia':'opt_cat_lavanderia','Lazer':'opt_cat_lazer','Manutenção / Mecânica':'opt_cat_manutencao','Pedágio':'opt_cat_pedagio','Refeição':'opt_cat_refeicao','Seguro':'opt_cat_seguro','Transporte':'opt_cat_transporte','Água / Esgoto':'opt_cat_aguaesgoto'}[cat])||cat}</label>
                <input type="number" id="budget-input-${cat}" placeholder="Ex: 1000"
                    value="${budgets[cat] || ''}" min="0" step="0.01">
            </div>`).join('')}`;
    }

    function saveBudgets() {
        const key = getTripBudgetKey();
        if (!allBudgets[key]) allBudgets[key] = {};
        const budgets = allBudgets[key];
        const totalInput = document.getElementById('budget-input-total');
        if (totalInput && totalInput.value !== '') budgets['__total__'] = parseFloat(totalInput.value);
        else delete budgets['__total__'];
        categories.forEach(cat => {
            const inp = document.getElementById(`budget-input-${cat}`);
            if (inp && inp.value !== '') budgets[cat] = parseFloat(inp.value);
            else delete budgets[cat];
        });
        safeSetItem('tp_budgets_v18', JSON.stringify(allBudgets));
        document.getElementById('budget-inputs-section').classList.remove('open');
        renderBudgetBars();
    }

    function renderBudgetBars() {
        const budgets = allBudgets[getTripBudgetKey()] || {};
        // Get filtered totals per category
        const cF = document.getElementById('fin-filter-city') ? document.getElementById('fin-filter-city').value : '';
        const ctF = document.getElementById('fin-filter-cat') ? document.getElementById('fin-filter-cat').value : '';
        let filtered = getAllEvents();
        if (globalTripFilter) filtered = filtered.filter(e => e.trip === globalTripFilter);
        if (cF) filtered = filtered.filter(e => e.cidade === cF);
        if (ctF) filtered = filtered.filter(e => e.classe === ctF);

        const spent = filtered.reduce((acc, i) => { acc[i.classe] = (acc[i.classe] || 0) + i.valor; return acc; }, {});
        const totalSpent = filtered.reduce((sum, i) => sum + i.valor, 0);

        // Render total bar
        const totalSec = document.getElementById('budget-total-section');
        const totalBudget = budgets['__total__'];
        if (totalSec) {
            if (totalBudget) {
                const pct = Math.min((totalSpent / totalBudget) * 100, 120);
                const over = totalSpent > totalBudget;
                const color = over ? '#ef4444' : totalSpent / totalBudget > 0.8 ? '#f59e0b' : '#6b8e23';
                totalSec.innerHTML = `
                    <div class="budget-row-label">
                        <span style="font-size:1rem; font-weight:700;">${t('budget_total_label')}</span>
                        <span class="status-badge ${over ? 'over' : totalSpent/totalBudget > 0.8 ? 'warn' : 'ok'}">
                            ${over ? t('budget_over') : Math.round(totalSpent/totalBudget*100) + t('budget_used')}
                        </span>
                    </div>
                    <div style="margin-bottom:8px; display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-muted);">
                        <span>${t('budget_spent')}: <b style="color:${color}">$ ${totalSpent.toLocaleString('pt-BR', {minimumFractionDigits:2})}</b></span>
                        <span>${t('budget_planned')}: <b>$ ${totalBudget.toLocaleString('pt-BR', {minimumFractionDigits:2})}</b></span>
                        <span>${t('budget_balance')}: <b style="color:${over?'#ef4444':'#059669'}">${over?'-':''}$ ${Math.abs(totalBudget-totalSpent).toLocaleString('pt-BR', {minimumFractionDigits:2})}</b></span>
                    </div>
                    <div class="progress-track" style="height:16px; background:#f3f4f6; border-radius:10px; overflow:hidden; position:relative;">
                        <div class="progress-fill ${over ? 'over-budget' : ''}" 
                             style="width:${Math.min(pct,100)}%; height:100%; background:${over ? 'linear-gradient(90deg,#fca5a5,#ef4444)' : `linear-gradient(90deg, ${color}cc, ${color})`}; border-radius:10px;"></div>
                        <div style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:white; text-shadow:0 1px 3px rgba(0,0,0,0.3); mix-blend-mode:normal;">
                            ${Math.round(Math.min(pct,100))}%
                        </div>
                    </div>`;
            } else {
                totalSec.innerHTML = `
                    <div style="font-size:0.85rem; color:var(--text-muted); display:flex; align-items:center; gap:8px; padding:5px 0;">
                        <i class="fas fa-lightbulb" style="color:#f59e0b"></i>
                        ${t('budget_set_hint')}
                    </div>`;
            }
        }

        // Render category bars
        const container = document.getElementById('budget-bars-container');
        if (!container) return;

        // Only show categories that have spending or budget
        const activeCats = categories.filter(cat => spent[cat] || budgets[cat]);
        if (activeCats.length === 0) { container.innerHTML = ''; return; }

        let html = '';
        activeCats.forEach(cat => {
            const s = spent[cat] || 0;
            const b = budgets[cat];
            const hasBudget = b && b > 0;
            const pct = hasBudget ? Math.min((s / b) * 100, 120) : 0;
            const over = hasBudget && s > b;
            const warn = hasBudget && s / b > 0.8;
            const color = over ? '#ef4444' : warn ? '#f59e0b' : (iconConfig[cat] || {color:'#6b8e23'}).color;
            const badgeClass = !hasBudget ? 'nobudget' : over ? 'over' : warn ? 'warn' : 'ok';
            const badgeText = !hasBudget ? t('budget_no_budget') : over ? `⚠️ +$ ${(s-b).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : `${Math.round(pct)}%`;

            html += `<div class="budget-row">
                <div class="budget-row-label">
                    <span class="cat-name"><b>${t({'Aéreo':'opt_cat_aereo','Aluguel de carro':'opt_cat_aluguelcarro','Camping Fee':'opt_cat_campingfee','Combustível':'opt_cat_combustivel','Compras':'opt_cat_compras','Energia / Solar':'opt_cat_energiasolar','GLP / Gás':'opt_cat_glpgas','Hospedagem':'opt_cat_hospedagem','Internet/Fone':'opt_cat_internetfone','Lavanderia':'opt_cat_lavanderia','Lazer':'opt_cat_lazer','Manutenção / Mecânica':'opt_cat_manutencao','Pedágio':'opt_cat_pedagio','Refeição':'opt_cat_refeicao','Seguro':'opt_cat_seguro','Transporte':'opt_cat_transporte','Água / Esgoto':'opt_cat_aguaesgoto'}[cat])||cat}</b></span>
                    <span style="display:flex; align-items:center; gap:10px;">
                        <span class="amounts">
                            <b>$ ${s.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b>
                            ${hasBudget ? ` / $ ${b.toLocaleString('pt-BR',{minimumFractionDigits:2})}` : ''}
                        </span>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </span>
                </div>
                <div class="progress-track">
                    ${hasBudget ? `
                    <div class="progress-fill" style="width:${Math.min(pct,100)}%; height:100%; background:linear-gradient(90deg, ${color}99, ${color}); border-radius:10px;"></div>
                    <div class="progress-marker" style="left:100%;"></div>
                    ` : `
                    <div style="height:100%; border-radius:10px; background: repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 5px, #f3f4f6 5px, #f3f4f6 10px);"></div>
                    `}
                </div>
            </div>`;
        });
        container.innerHTML = html;

        // Summary pills
        const pillsEl = document.getElementById('budget-summary-pills');
        if (pillsEl && totalBudget) {
            const over = totalSpent > totalBudget;
            pillsEl.innerHTML = `
                <span class="budget-pill total">${t('budget_total_pill')}: $ ${totalBudget.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                <span class="budget-pill ${over ? 'over' : 'ok'}">${over ? '🔴' : '🟢'} ${t('budget_spent_pill')}: $ ${totalSpent.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>`;
        } else if (pillsEl) {
            pillsEl.innerHTML = '';
        }
    }

    // ========== CRONOGRAMA DE DESEMBOLSO ==========
    let chartCron;

    const PARCELADAS = ['Aéreo', 'Hospedagem'];

    function getMonthKey(year, month) {
        return `${year}-${String(month + 1).padStart(2, '0')}`;
    }

    function monthLabel(key) {
        const [y, m] = key.split('-');
        const months = t('months');
        return `${months[parseInt(m) - 1]}/${y}`;
    }

    function updateCronogramaSelectors() {
        const sel = document.getElementById('cron-filter-trip');
        if (!sel) return;
        sel.innerHTML = `<option value="">${t('opt_all_trips')}</option>` + tripNames.map(tr => `<option value="${tr}">${tr}</option>`).join('');
        sel.value = globalTripFilter;
    }

    function renderCronograma() {
        const tripFilter = document.getElementById('cron-filter-trip')?.value || '';

        let filtered = getAllEvents().filter(e => e.valor > 0);
        if (tripFilter) filtered = filtered.filter(e => e.trip === tripFilter);
        if (filtered.length === 0) {
            document.getElementById('cron-table-wrap').innerHTML = `<p style="padding:30px; text-align:center; color:var(--text-muted);">${currentLang === 'en' ? 'No events found. Add items in the Timeline tab.' : 'Nenhum evento encontrado. Adicione itens na aba Timeline.'}</p>`;
            document.getElementById('cron-summary-cards').innerHTML = '';
            return;
        }

        // Mapa mensal: { 'YYYY-MM': { total, Aéreo, Hospedagem, Outros, items[] } }
        const monthMap = {};

        function addToMonth(key, classe, valor, desc, parcela, totalParcelas, meioPagamento, nomeCartao) {
            if (!monthMap[key]) monthMap[key] = { total: 0, 'Aéreo': 0, 'Hospedagem': 0, 'Outros': 0, items: [] };
            monthMap[key].total += valor;
            if (PARCELADAS.includes(classe)) monthMap[key][classe] += valor;
            else monthMap[key]['Outros'] += valor;
            monthMap[key].items.push({ desc, classe, valor, parcela, totalParcelas, meioPagamento, nomeCartao });
        }

        // Totais por categoria para summary
        let totalAereo = 0, totalHosp = 0, totalOutros = 0;

        filtered.forEach(ev => {
            if (!ev.data) return;

            // Determinar data base: se cartão de crédito com dataPagamento, usa ela; senão usa data do evento
            const dataBase = (ev.meioPagamento === 'credito' && ev.dataPagamento) ? ev.dataPagamento : ev.data;
            const [year, month, day] = dataBase.split('-').map(Number);

            // Número de parcelas: usa o do item (meio de pagamento crédito) ou 1
            let parcelas = 1;
            if (ev.meioPagamento === 'credito' && ev.parcelas && ev.parcelas > 1) {
                parcelas = ev.parcelas;
            }

            if (parcelas > 1) {
                const valorParcela = ev.valor / parcelas;
                for (let p = 0; p < parcelas; p++) {
                    const d = new Date(year, month - 1 + p, day);
                    const key = getMonthKey(d.getFullYear(), d.getMonth());
                    addToMonth(key, ev.classe, valorParcela, ev.desc, p + 1, parcelas, ev.meioPagamento, ev.nomeCartao);
                }
            } else {
                const key = getMonthKey(year, month - 1);
                addToMonth(key, ev.classe, ev.valor, ev.desc, null, null, ev.meioPagamento, ev.nomeCartao);
            }

            if (ev.classe === 'Aéreo') totalAereo += ev.valor;
            else if (ev.classe === 'Hospedagem') totalHosp += ev.valor;
            else totalOutros += ev.valor;
        });

        const sortedKeys = Object.keys(monthMap).sort();
        const grandTotal = totalAereo + totalHosp + totalOutros;

        // Summary cards
        const summaryEl = document.getElementById('cron-summary-cards');
        if (summaryEl) {
            const cards = [
                { label: currentLang === 'en' ? 'Grand Total' : 'Total Geral', val: grandTotal, icon: '💰', color: '#6b8e23', bg: '#f0f4e8' },
                { label: currentLang === 'en' ? '✈️ Flights (total)' : '✈️ Aéreo (total)', val: totalAereo, icon: '', color: '#88d8b0', bg: '#f1faf5' },
                { label: currentLang === 'en' ? '🏨 Accommodation (total)' : '🏨 Hospedagem (total)', val: totalHosp, icon: '', color: '#c38d9e', bg: '#f9f2f4' },
                { label: currentLang === 'en' ? '📦 Other Expenses' : '📦 Outros Gastos', val: totalOutros, icon: '', color: '#7fa9c4', bg: '#f0f4f8' },
            ];
            summaryEl.innerHTML = cards.map(c => `
                <div style="background:${c.bg}; border-radius:12px; padding:18px 20px; border:1px solid ${c.color}33;">
                    <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:${c.color}; margin-bottom:6px;">${c.label}</div>
                    <div style="font-size:1.4rem; font-weight:800; color:${c.color};">$ ${c.val.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                </div>`).join('');
        }

        // Table
        const tableEl = document.getElementById('cron-table-wrap');
        let tableHtml = `
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
            <thead>
                <tr style="background:var(--accent); color:white; text-align:left;">
                    <th style="padding:14px 18px; font-weight:600; border-radius:10px 0 0 0;">${t('cron_month')}</th>
                    <th style="padding:14px 12px; font-weight:600; text-align:right;">${t('cron_aerial')}</th>
                    <th style="padding:14px 12px; font-weight:600; text-align:right;">${t('cron_accommodation')}</th>
                    <th style="padding:14px 12px; font-weight:600; text-align:right;">${t('cron_others')}</th>
                    <th style="padding:14px 18px; font-weight:600; text-align:right; border-radius:0 10px 0 0;">${t('cron_month_total')}</th>
                </tr>
            </thead>
            <tbody>`;

        sortedKeys.forEach((key, idx) => {
            const m = monthMap[key];
            const bg = idx % 2 === 0 ? 'white' : '#fafaf8';
            // Build item tooltips
            const itemsHtml = m.items.map(i => {
                const parcelInfo = i.parcela ? ` <span style="font-size:0.7rem; color:var(--text-muted);">(${i.parcela}/${i.totalParcelas})</span>` : '';
                const pagInfo = i.meioPagamento ? `<span style="font-size:0.7rem; background:#f0f4e8; color:var(--accent); border-radius:5px; padding:1px 6px; margin-left:6px;">${labelMeioPagamento(i.meioPagamento)}${i.nomeCartao ? ' – '+i.nomeCartao : ''}</span>` : '';
                return `<div style="padding:4px 0; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <span>${catIcons[i.classe] || '📦'} ${i.desc}${parcelInfo}${pagInfo}</span>
                    <span style="font-weight:700; white-space:nowrap;">$ ${i.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                </div>`;
            }).join('');

            tableHtml += `
                <tr style="background:${bg}; cursor:pointer;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display==='none'?'table-row':'none'">
                    <td style="padding:12px 18px; font-weight:700; color:var(--accent);">${monthLabel(key)}</td>
                    <td style="padding:12px; text-align:right; color:#88d8b0; font-weight:${m['Aéreo']>0?'700':'400'};">${m['Aéreo']>0 ? '$ '+m['Aéreo'].toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—'}</td>
                    <td style="padding:12px; text-align:right; color:#c38d9e; font-weight:${m['Hospedagem']>0?'700':'400'};">${m['Hospedagem']>0 ? '$ '+m['Hospedagem'].toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—'}</td>
                    <td style="padding:12px; text-align:right; color:#7fa9c4; font-weight:${m['Outros']>0?'700':'400'};">${m['Outros']>0 ? '$ '+m['Outros'].toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—'}</td>
                    <td style="padding:12px 18px; text-align:right; font-weight:800; color:var(--text);">$ ${m.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                </tr>
                <tr style="display:none; background:#f8f9f5;">
                    <td colspan="5" style="padding:10px 30px 15px;">
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:6px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">${t('cron_items_label')}</div>
                        ${itemsHtml}
                    </td>
                </tr>`;
        });

        // Total row
        const totalAereoMensal = Object.values(monthMap).reduce((s,m)=>s+m['Aéreo'],0);
        const totalHospMensal = Object.values(monthMap).reduce((s,m)=>s+m['Hospedagem'],0);
        const totalOutrosMensal = Object.values(monthMap).reduce((s,m)=>s+m['Outros'],0);
        const totalGeral = Object.values(monthMap).reduce((s,m)=>s+m.total,0);

        tableHtml += `
            <tr style="background:var(--accent-light); border-top:2px solid var(--accent); font-weight:800;">
                <td style="padding:14px 18px; color:var(--accent); border-radius:0 0 0 10px;">${t('cron_total')}</td>
                <td style="padding:14px 12px; text-align:right; color:#88d8b0;">$ ${totalAereoMensal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td style="padding:14px 12px; text-align:right; color:#c38d9e;">$ ${totalHospMensal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td style="padding:14px 12px; text-align:right; color:#7fa9c4;">$ ${totalOutrosMensal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td style="padding:14px 18px; text-align:right; color:var(--accent); font-size:1.05rem; border-radius:0 0 10px 0;">$ ${totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
            </tr>
            </tbody></table>`;
        tableEl.innerHTML = tableHtml;

        // Chart
        const canvas = document.getElementById('chartCronograma');
        if (canvas) {
            if (chartCron) chartCron.destroy();
            chartCron = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: sortedKeys.map(monthLabel),
                    datasets: [
                        { label: t('cron_aerial').replace('✈️ ',''), data: sortedKeys.map(k => monthMap[k]['Aéreo']), backgroundColor: '#88d8b0', borderRadius: 8, borderSkipped: false, stack: 'stack' },
                        { label: t('cron_accommodation').replace('🏨 ',''), data: sortedKeys.map(k => monthMap[k]['Hospedagem']), backgroundColor: '#c38d9e', borderRadius: 8, borderSkipped: false, stack: 'stack' },
                        { label: t('cron_others').replace('📦 ',''), data: sortedKeys.map(k => monthMap[k]['Outros']), backgroundColor: '#7fa9c4', borderRadius: 8, borderSkipped: false, stack: 'stack' },
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: t('cron_chart_title'), font: { size: 14 } },
                        datalabels: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: $ ${ctx.parsed.y.toLocaleString('pt-BR',{minimumFractionDigits:2})}`,
                                footer: items => `Total: $ ${items.reduce((s,i)=>s+i.parsed.y,0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
                            }
                        }
                    },
                    scales: {
                        x: { stacked: true, grid: { display: false } },
                        y: { stacked: true, beginAtZero: true, ticks: { callback: v => '$ '+v.toLocaleString('pt-BR') } }
                    }
                }
            });
        }
    }

    function filterFinanceCharts() {
        const val = document.getElementById('fin-chart-filter').value;
        const map = {
            daily:    'wrap-chartDaily',
            category: 'wrap-chartCategory',
            city:     'wrap-chartCity',
            payment:  'wrap-chartPaymentMethod',
            currency: 'wrap-chartCurrency'
        };
        const allIds = Object.values(map);
        const budgetCard = document.querySelector('.budget-tracker-card');
        const isBudget = val === 'budget';
        if (val === 'all') {
            allIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.style.display = ''; el.style.gridColumn = ''; }
            });
            document.getElementById('wrap-chartDaily').style.gridColumn = 'span 2';
            document.getElementById('wrap-chartPaymentMethod').style.gridColumn = 'span 2';
            document.getElementById('wrap-chartCurrency').style.gridColumn = 'span 2';
            if (budgetCard) budgetCard.style.display = '';
            requestAnimationFrame(() => {
                [chartD, chartC, chartCity, chartPay, chartCurrency].forEach(c => { if (c) c.resize(); });
            });
        } else {
            allIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            if (budgetCard) budgetCard.style.display = isBudget ? '' : 'none';
            if (!isBudget) {
                const target = document.getElementById(map[val]);
                if (target) { target.style.display = ''; target.style.gridColumn = 'span 2'; }
            }
        }
    }

    async function generateClientItinerary() {
        if (!globalTripFilter) {
            alert(t('client_no_trip_selected'));
            return;
        }

        const filteredEvents = events
            .filter(e => e.trip === globalTripFilter && !e.ocultoCliente)
            .sort((a,b) => (a.data+a.hora).localeCompare(b.data+b.hora))
            .map(e => ({
                data: e.data,
                hora: e.hora,
                desc: e.desc,
                classe: e.classe,
                valor: e.valor || 0
            }));

        const filteredLinks = links
            .filter(l => l.trip === globalTripFilter)
            .map(l => ({
                id: l.id || (Date.now().toString() + Math.random()),
                nome: l.name || '',
                cat: l.cat || 'Outro',
                endereco: l.address || '',
                telefone: l.phone || '',
                url: l.url || '',
                obs: l.notes || ''
            }));

        const tripChecks = checks
            .filter(c => !c.trip || c.trip === globalTripFilter)
            .map((c, i) => ({
                id: String(c.id || (Date.now() + i)),
                texto: c.txt || c.texto || '',
                grupo: c.cat || c.grupo || 'Geral',
                feito: false
            }));

        const data = {
            principal: {
                budget: 0,
                baseCurrency: "BRL",
                tripName: globalTripFilter
            },
            events: filteredEvents,
            checklist: tripChecks,
            links: filteredLinks
        };

        const content = JSON.stringify(data, null, 2);
        const fileName = `${globalTripFilter.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'')}_valise.json`;

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{ description: 'Ficheiro de Viagem Valise (JSON)', accept: { 'application/json': ['.json', '.valise'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
            } catch (err) {}
        } else {
            const blob = new Blob([content], { type: 'application/json' });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'application/json' })] })) {
                try {
                    await navigator.share({ files: [new File([blob], fileName, { type: 'application/json' })], title: fileName });
                    return;
                } catch (err) {}
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
        }
    }

    function printPage() {
        // Se a aba financeiro estiver ativa, redimensiona os gráficos antes de imprimir
        const isFinance = document.getElementById('tab-finance').classList.contains('active');
        if (isFinance) {
            const charts = [chartD, chartC, chartCity, chartPay, chartCurrency];
            // Força height explícita no canvas antes do print para o Chart.js não perder as dimensões
            charts.forEach(ch => {
                if (!ch) return;
                const canvas = ch.canvas;
                const container = canvas.closest('.chart-container');
                if (container) {
                    const h = 230; // altura alvo de impressão em px
                    canvas.style.width  = '100%';
                    canvas.style.height = h + 'px';
                    canvas.height = h;
                }
                ch.resize();
            });
        }
        // Pequeno delay para o resize ser aplicado antes do diálogo de impressão
        setTimeout(() => {
            window.print();
            // Depois do print, restaura os gráficos para o modo responsivo normal
            if (isFinance) {
                const charts = [chartD, chartC, chartCity, chartPay, chartCurrency];
                charts.forEach(ch => {
                    if (!ch) return;
                    ch.canvas.style.width  = '';
                    ch.canvas.style.height = '';
                    ch.resize();
                });
            }
        }, 200);
    }

    // Garante redimensionamento correto no evento nativo de impressão (Ctrl+P)
    window.addEventListener('beforeprint', () => {
        const charts = [chartD, chartC, chartCity, chartPay, chartCurrency];
        charts.forEach(ch => {
            if (!ch) return;
            const canvas = ch.canvas;
            canvas.style.width  = '100%';
            canvas.style.height = '230px';
            canvas.height = 230;
            ch.resize();
        });
    });
    window.addEventListener('afterprint', () => {
        const charts = [chartD, chartC, chartCity, chartPay, chartCurrency];
        charts.forEach(ch => {
            if (!ch) return;
            ch.canvas.style.width  = '';
            ch.canvas.style.height = '';
            ch.resize();
        });
    });

    window.onload = () => {
        updateTripSelectors();
        updateTimelineFilters();
        renderTimeline();
        applyTranslations();
        updateCartaoSelector();
        onMeioPagamentoChange();
        onFuelMeioPagamentoChange();
        onManMeioPagamentoChange();
        updateLinkTripSelectors();
        renderLinks();
        updateFuelTripSelectors();
        updateManTripSelectors();
        renderFuel();
        renderFuelChart();
        renderMan();

        // Após importação: seleciona automaticamente a viagem pelo nome do arquivo
        const pendingTrip = localStorage.getItem('tp_pending_trip_select');
        if (pendingTrip) {
            localStorage.removeItem('tp_pending_trip_select');
            // Seleciona no campo "Título da Viagem" (formulário)
            const tripTitleSel = document.getElementById('trip-title');
            if (tripTitleSel && tripNames.includes(pendingTrip)) {
                tripTitleSel.value = pendingTrip;
            } else if (tripTitleSel && tripNames.length > 0) {
                tripTitleSel.value = tripNames[0];
            }
            // Seleciona nos filtros de viagem de todas as abas
            const matchedTrip = tripNames.includes(pendingTrip) ? pendingTrip : (tripNames[0] || '');
            if (matchedTrip) {
                // pendingCheckTrip e pendingLinkTrip são lidos ao recriar os selects de formulário
                pendingCheckTrip = matchedTrip;
                pendingLinkTrip = matchedTrip;
                syncTripFilter(matchedTrip);
            }
        }

        highlightTripFilters(globalTripFilter);
        updateTripStampTitle();
        initTabsScrollIndicator();
    };

    // Controla o fade visual nas bordas do menu de abas quando ele tem overflow horizontal
    function initTabsScrollIndicator() {
        const wrap = document.getElementById('tabs-wrap');
        const nav = document.getElementById('tabs-nav');
        if (!wrap || !nav) return;
        const update = () => {
            const max = nav.scrollWidth - nav.clientWidth;
            wrap.classList.toggle('has-overflow', max > 4);
            wrap.classList.toggle('scrolled-left', nav.scrollLeft > 4);
            wrap.classList.toggle('scrolled-end', nav.scrollLeft >= max - 4);
        };
        nav.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    const linkCategoryConfig = {
        'Consulado':   { icon: 'fa-building-columns', color: '#7fa9c4', bg: '#f0f4f8' },
        'Museu':       { icon: 'fa-palette',           color: '#c38d9e', bg: '#f9f2f4' },
        'Transporte':  { icon: 'fa-bus',               color: '#88d8b0', bg: '#f1faf5' },
        'Saúde':       { icon: 'fa-kit-medical',       color: '#ef4444', bg: '#fff1f1' },
        'Hotel':       { icon: 'fa-hotel',             color: '#c38d9e', bg: '#f9f2f4' },
        'Camping':     { icon: 'fa-caravan',           color: '#f4a259', bg: '#fff8f0' },
        'Restaurante': { icon: 'fa-utensils',          color: '#e8a87c', bg: '#fff5ed' },
        'Compras':     { icon: 'fa-shopping-bag',      color: '#d4a5a5', bg: '#fdf2f2' },
        'Emergência':  { icon: 'fa-circle-exclamation',color: '#dc2626', bg: '#fee2e2' },
        'Outro':       { icon: 'fa-map-pin',           color: '#95b8d1', bg: '#f4f7f9' },
    };

    function saveLinks() {
        safeSetItem('tp_links_v17', JSON.stringify(links));
    }

    function updateLinkTripSelectors() {
        const selectors = ['link-trip', 'filter-link-trip'];
        selectors.forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            const cur = (id === 'link-trip' && pendingLinkTrip) ? pendingLinkTrip : sel.value;
            if (id === 'filter-link-trip') {
                sel.innerHTML = `<option value="" data-i18n="opt_all_trips">${t('opt_all_trips')}</option>`;
            } else {
                sel.innerHTML = '';
            }
            tripNames.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                sel.appendChild(opt);
            });
            if (cur) sel.value = cur;
            if (id === 'link-trip' && pendingLinkTrip) pendingLinkTrip = "";
        });
    }

    function saveLink() {
        const name    = document.getElementById('link-name').value.trim();
        const cat     = document.getElementById('link-cat').value;
        const trip    = document.getElementById('link-trip').value;
        const address = document.getElementById('link-address').value.trim();
        const phone   = document.getElementById('link-phone').value.trim();
        let   url     = document.getElementById('link-url').value.trim();
        const notes   = document.getElementById('link-notes').value.trim();
        const editId  = document.getElementById('link-edit-id').value;

        if (!name) { alert('Informe o nome ou local.'); return; }

        // Normaliza URL: adiciona https:// se o usuário não informou o protocolo
        if (url && !/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        const entry = { id: editId || Date.now().toString(), name, cat, trip, address, phone, url, notes };

        if (editId) {
            const idx = links.findIndex(l => l.id === editId);
            if (idx > -1) links[idx] = entry;
        } else {
            links.push(entry);
        }
        saveLinks();
        clearLinkForm();
        renderLinks();
    }

    function clearLinkForm() {
        ['link-name','link-address','link-phone','link-url','link-notes'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('link-edit-id').value = '';
        document.getElementById('link-cat').selectedIndex = 0;
    }

    function editLink(id) {
        const l = links.find(x => x.id === id);
        if (!l) return;
        document.getElementById('link-name').value    = l.name    || '';
        document.getElementById('link-cat').value     = l.cat     || 'Outro';
        document.getElementById('link-trip').value    = l.trip    || '';
        document.getElementById('link-address').value = l.address || '';
        document.getElementById('link-phone').value   = l.phone   || '';
        document.getElementById('link-url').value     = l.url     || '';
        document.getElementById('link-notes').value   = l.notes   || '';
        document.getElementById('link-edit-id').value = l.id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteLink(id) {
        if (!confirm(t('confirm_delete_link'))) return;
        links = links.filter(l => l.id !== id);
        saveLinks();
        renderLinks();
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
        });
    }

    function renderLinks() {
        const container = document.getElementById('render-links');
        if (!container) return;

        const filterTrip   = (document.getElementById('filter-link-trip')   || {}).value || '';
        const filterCat    = (document.getElementById('filter-link-cat')    || {}).value || '';
        const filterSearch = ((document.getElementById('filter-link-search') || {}).value || '').toLowerCase();

        let filtered = links.filter(l => {
            if (filterTrip   && l.trip !== filterTrip) return false;
            if (filterCat    && l.cat  !== filterCat)  return false;
            if (filterSearch && !((l.name||'').toLowerCase().includes(filterSearch) || (l.address||'').toLowerCase().includes(filterSearch))) return false;
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<div class="glass-card" style="text-align:center; color:var(--text-muted); padding:40px;">${t('links_no_items')}</div>`;
            return;
        }

        // Group by category
        const groups = {};
        filtered.forEach(l => {
            if (!groups[l.cat]) groups[l.cat] = [];
            groups[l.cat].push(l);
        });

        const catOrder = ['Emergência','Consulado','Saúde','Transporte','Hotel','Camping','Museu','Restaurante','Compras','Outro'];
        const sortedCats = catOrder.filter(c => groups[c]).concat(Object.keys(groups).filter(c => !catOrder.includes(c)));

        let html = '';
        sortedCats.forEach(cat => {
            const cfg = linkCategoryConfig[cat] || linkCategoryConfig['Outro'];
            const catLabel = t('opt_link_' + ({
                'Consulado':'consulado','Museu':'museu','Transporte':'transporte','Saúde':'saude',
                'Hotel':'hotel','Camping':'camping','Restaurante':'restaurante','Compras':'compras','Emergência':'emergencia','Outro':'outro'
            }[cat] || 'outro'));
            html += `<div style="margin-bottom:8px; font-family:serif; font-size:1.05rem; color:var(--text); display:flex; align-items:center; gap:10px; padding:8px 0 4px;">
                <i class="fas ${cfg.icon}" style="color:${cfg.color}; font-size:1rem;"></i> ${catLabel}
                <span style="flex:1; height:1px; background:var(--border); margin-left:5px;"></span>
            </div>`;
            groups[cat].forEach(l => {
                const mapUrl  = l.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address)}` : '';
                html += `<div class="item-card" style="margin-bottom:10px; border-left:4px solid ${cfg.color}; flex-wrap:wrap; gap:10px 15px;">
                    <div style="width:42px; height:42px; border-radius:12px; background:${cfg.bg}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <i class="fas ${cfg.icon}" style="color:${cfg.color}; font-size:1.1rem;"></i>
                    </div>
                    <div style="flex:1; min-width:200px;">
                        <b style="font-size:1rem;">${l.name}</b>
                        ${l.trip ? `<span style="font-size:0.72rem; background:var(--accent-light); color:var(--accent); border-radius:5px; padding:1px 7px; margin-left:8px;">${l.trip}</span>` : ''}
                        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:5px;">
                            ${l.address ? `<span style="font-size:0.8rem; color:var(--text-muted); display:flex; align-items:center; gap:4px;"><i class="fas fa-location-dot" style="font-size:0.7rem;"></i>${l.address}</span>` : ''}
                            ${l.phone   ? `<span style="font-size:0.8rem; color:var(--text-muted); display:flex; align-items:center; gap:4px;"><i class="fas fa-phone" style="font-size:0.7rem;"></i>${l.phone}</span>` : ''}
                            ${l.notes   ? `<span style="font-size:0.8rem; color:var(--text-muted); display:flex; align-items:center; gap:4px; font-style:italic;"><i class="fas fa-note-sticky" style="font-size:0.7rem;"></i>${l.notes}</span>` : ''}
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; flex-shrink:0;">
                        ${l.url ? `<a href="${l.url}" target="_blank" style="background:var(--accent-light); color:var(--accent); border:none; padding:6px 11px; border-radius:8px; cursor:pointer; font-size:0.78rem; font-weight:600; text-decoration:none; display:flex; align-items:center; gap:5px;"><i class="fas fa-arrow-up-right-from-square"></i> ${t('links_open_site')}</a>` : ''}
                        ${mapUrl ? `<a href="${mapUrl}" target="_blank" style="background:#f0f4f8; color:#7fa9c4; border:none; padding:6px 11px; border-radius:8px; cursor:pointer; font-size:0.78rem; font-weight:600; text-decoration:none; display:flex; align-items:center; gap:5px;"><i class="fas fa-map-location-dot"></i> ${t('links_open_map')}</a>` : ''}
                        ${l.address ? `<button onclick="copyToClipboard('${l.address.replace(/'/g,"\\'")}'); this.innerHTML='<i class=\\'fas fa-check\\'></i>'; setTimeout(()=>this.innerHTML='<i class=\\'fas fa-copy\\'></i>', 1500);" style="background:#f3f4f6; color:#9ca3af; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:0.78rem;" title="${t('links_copy_address')}"><i class="fas fa-copy"></i></button>` : ''}
                        <button onclick="editLink('${l.id}')" class="btn-edit-item" title="${t('links_edit')}"><i class="fas fa-pen"></i></button>
                        <button onclick="deleteLink('${l.id}')" class="btn-delete-item" title="${t('links_delete')}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            });
        });

        container.innerHTML = `<div class="glass-card">${html}</div>`;
    }
    // ========== MANUTENÇÃO DO VEÍCULO ==========

    function saveManData() {
        safeSetItem('tp_man_v1', JSON.stringify(manLog));
    }

    function saveMan() {
        const data      = document.getElementById('man-data').value;
        const trip      = (document.getElementById('man-trip') || {}).value || '';
        const tipo      = document.getElementById('man-tipo').value;
        const km        = parseFloat(document.getElementById('man-km').value)    || null;
        const custo     = parseFloat(document.getElementById('man-custo').value) || null;
        const local     = document.getElementById('man-local').value.trim();
        const proxKm    = parseFloat(document.getElementById('man-prox-km').value) || null;
        const proxData  = document.getElementById('man-prox-data').value;
        const status    = document.getElementById('man-status').value;
        const obs       = document.getElementById('man-obs').value.trim();
        const editId    = document.getElementById('man-edit-id').value;

        // Campos de pagamento
        const meioPagamento  = (document.getElementById('man-meio-pagamento')  || {}).value || 'dinheiro';
        const isCredito      = meioPagamento === 'credito';
        const isDebito       = meioPagamento === 'debito';
        const isPix          = meioPagamento === 'pix';
        const nomeCartao     = (isCredito || isDebito || isPix) ? ((document.getElementById('man-nome-cartao')   || {}).value || '') : '';
        const parcelas       = isCredito ? parseInt((document.getElementById('man-parcelas')             || {}).value || 1) : 1;
        const dataPagamento  = (isCredito || isDebito) ? ((document.getElementById('man-data-pagamento') || {}).value || '') : '';

        if (!data) { alert('Informe a data do serviço.'); return; }
        if (!tipo)  { alert('Selecione o tipo de serviço.'); return; }

        const entry = { id: editId || Date.now().toString(), data, trip, tipo, km, custo, local, proxKm, proxData, status, obs, meioPagamento, nomeCartao, parcelas, dataPagamento };

        if (editId) {
            const idx = manLog.findIndex(m => m.id === editId);
            if (idx > -1) manLog[idx] = entry;
        } else {
            manLog.push(entry);
        }
        saveManData();
        clearManForm();
        renderMan();
    }

    function clearManForm() {
        ['man-data','man-km','man-custo','man-local','man-prox-km','man-prox-data','man-obs','man-data-pagamento'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('man-edit-id').value = '';
        document.getElementById('man-tipo').selectedIndex = 0;
        document.getElementById('man-status').selectedIndex = 0;
        const mp = document.getElementById('man-meio-pagamento');
        if (mp) { mp.value = 'dinheiro'; }
        const nc = document.getElementById('man-nome-cartao');
        if (nc) nc.value = '';
        const pc = document.getElementById('man-parcelas');
        if (pc) pc.value = '1';
        if (typeof onManMeioPagamentoChange === 'function') onManMeioPagamentoChange();
    }

    function editMan(id) {
        const m = manLog.find(x => x.id === id);
        if (!m) return;
        document.getElementById('man-data').value      = m.data     || '';
        const manTripEl = document.getElementById('man-trip'); if (manTripEl) manTripEl.value = m.trip || '';
        document.getElementById('man-tipo').value      = m.tipo     || 'Troca de óleo';
        document.getElementById('man-km').value        = m.km       != null ? m.km       : '';
        document.getElementById('man-custo').value     = m.custo    != null ? m.custo    : '';
        document.getElementById('man-local').value     = m.local    || '';
        document.getElementById('man-prox-km').value   = m.proxKm   != null ? m.proxKm   : '';
        document.getElementById('man-prox-data').value = m.proxData || '';
        document.getElementById('man-status').value    = m.status   || 'Realizado';
        document.getElementById('man-obs').value       = m.obs      || '';
        document.getElementById('man-edit-id').value   = m.id;
        // Restaurar campos de pagamento
        const mp = document.getElementById('man-meio-pagamento');
        if (mp) { mp.value = m.meioPagamento || 'dinheiro'; if (typeof onManMeioPagamentoChange === 'function') onManMeioPagamentoChange(); }
        const nc = document.getElementById('man-nome-cartao');
        if (nc) nc.value = m.nomeCartao || '';
        const pc = document.getElementById('man-parcelas');
        if (pc) pc.value = m.parcelas || '1';
        const dp = document.getElementById('man-data-pagamento');
        if (dp) dp.value = m.dataPagamento || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteMan(id) {
        if (!confirm(t('man_confirm_delete'))) return;
        manLog = manLog.filter(m => m.id !== id);
        saveManData();
        renderMan();
    }

    function getManStatusStyle(status) {
        if (status === 'Realizado') return { bg: '#e8f6f0', color: '#2e8b6e', icon: 'fa-circle-check' };
        if (status === 'Agendado')  return { bg: '#eef3ff', color: '#4a6cf7', icon: 'fa-calendar-check' };
        if (status === 'Pendente')  return { bg: '#fff8e8', color: '#c47a2b', icon: 'fa-triangle-exclamation' };
        return { bg: '#f3f4f6', color: '#9ca3af', icon: 'fa-circle' };
    }

    function getManTipoIcon(tipo) {
        const map = {
            'Troca de óleo': 'fa-oil-can',
            'Filtro de ar': 'fa-wind',
            'Filtro de combustível': 'fa-gas-pump',
            'Filtro de cabine': 'fa-fan',
            'Pneus': 'fa-circle-dot',
            'Alinhamento e balanceamento': 'fa-sliders',
            'Freios': 'fa-hand',
            'Bateria': 'fa-battery-half',
            'Correia dentada': 'fa-gear',
            'Velas / Injeção': 'fa-bolt',
            'Amortecedores': 'fa-compress',
            'Fluido de arrefecimento': 'fa-temperature-half',
            'Fluido de transmissão': 'fa-gears',
            'Revisão geral': 'fa-wrench',
            'Elétrica': 'fa-plug',
            'Carroceria / Funilaria': 'fa-car',
        };
        return map[tipo] || 'fa-screwdriver-wrench';
    }

    function renderMan() {
        const container = document.getElementById('render-man');
        const statsEl   = document.getElementById('man-stats');
        const alertsEl  = document.getElementById('man-alerts');
        if (!container) return;

        const filterTipo   = (document.getElementById('filter-man-tipo')   || {}).value || '';
        const filterStatus = (document.getElementById('filter-man-status') || {}).value || '';
        const filterSearch = ((document.getElementById('filter-man-search') || {}).value || '').toLowerCase();

        let filtered = manLog.filter(m => {
            if (filterTipo   && m.tipo   !== filterTipo)   return false;
            if (filterStatus && m.status !== filterStatus) return false;
            if (filterSearch && !((m.tipo||'').toLowerCase().includes(filterSearch) || (m.local||'').toLowerCase().includes(filterSearch) || (m.obs||'').toLowerCase().includes(filterSearch))) return false;
            return true;
        });

        filtered = filtered.slice().sort((a, b) => (b.data||'').localeCompare(a.data||''));

        // ── Alertas ──
        if (alertsEl) {
            const today = new Date();
            const allKms    = manLog.filter(m => m.km > 0).map(m => m.km);
            const currentKm = allKms.length > 0 ? Math.max(...allKms) : null;
            const alerts = [];

            manLog.forEach(m => {
                if (m.status === 'Realizado') {
                    if (m.proxData) {
                        const diff = Math.round((new Date(m.proxData) - today) / (1000*60*60*24));
                        if (diff <= 30) {
                            const isOver = diff < 0;
                            alerts.push({
                                tipo: m.tipo,
                                msg: isOver
                                    ? `Vencida há ${Math.abs(diff)} dia${Math.abs(diff)!==1?'s':''} (${m.proxData.split('-').reverse().join('/')})`
                                    : `Vence em ${diff} dia${diff!==1?'s':''} (${m.proxData.split('-').reverse().join('/')})`,
                                isOver, id: m.id
                            });
                        }
                    }
                    if (m.proxKm && currentKm) {
                        const diff = m.proxKm - currentKm;
                        if (diff <= 2000) {
                            const isOver = diff < 0;
                            alerts.push({
                                tipo: m.tipo,
                                msg: isOver
                                    ? `Passou do hodômetro em ${Math.abs(Math.round(diff)).toLocaleString('pt-BR')} km (prev.: ${m.proxKm.toLocaleString('pt-BR')} km)`
                                    : `Faltam ${Math.round(diff).toLocaleString('pt-BR')} km (prev.: ${m.proxKm.toLocaleString('pt-BR')} km)`,
                                isOver, id: m.id
                            });
                        }
                    }
                }
                if (m.status === 'Agendado' || m.status === 'Pendente') {
                    alerts.push({
                        tipo: m.tipo,
                        msg: m.status === 'Agendado'
                            ? `Agendado para ${m.proxData ? m.proxData.split('-').reverse().join('/') : 'data a confirmar'}`
                            : 'Manutenção pendente',
                        isOver: m.status === 'Pendente', id: m.id
                    });
                }
            });

            alertsEl.innerHTML = alerts.length > 0
                ? `<div class="glass-card" style="border-left:4px solid #c47a2b; background:#fffbf0; margin-bottom:4px; padding:14px 20px;">
                    <div style="font-weight:700; color:#c47a2b; margin-bottom:10px; display:flex; align-items:center; gap:8px;"><i class="fas fa-bell"></i> Alertas de Manutenção</div>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        ${alerts.map(a => `
                            <div style="display:flex; align-items:center; gap:10px; background:${a.isOver?'#fff1f1':'#fffdf0'}; border:1px solid ${a.isOver?'#fecaca':'#fde68a'}; border-radius:8px; padding:8px 14px;">
                                <i class="fas ${a.isOver?'fa-circle-exclamation':'fa-clock'}" style="color:${a.isOver?'#dc2626':'#c47a2b'}; flex-shrink:0;"></i>
                                <span style="font-size:0.85rem; color:${a.isOver?'#991b1b':'#92400e'};"><b>${a.tipo}</b> — ${a.msg}</span>
                                <button onclick="editMan('${a.id}')" style="margin-left:auto; background:white; border:1px solid var(--border); padding:4px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">Ver registro</button>
                            </div>`).join('')}
                    </div>
                </div>`
                : '';
        }

        // ── Stats ──
        if (statsEl) {
            const totalCusto = manLog.reduce((s,m) => s + (m.custo||0), 0);
            const realizados = manLog.filter(m => m.status === 'Realizado').length;
            const pendentes  = manLog.filter(m => m.status === 'Pendente' || m.status === 'Agendado').length;
            const allKms     = manLog.filter(m => m.km > 0).map(m => m.km);
            const currentKm  = allKms.length > 0 ? Math.max(...allKms) : null;
            const proxPorKm  = manLog.filter(m => m.proxKm > 0).sort((a,b) => a.proxKm - b.proxKm)[0];
            const kmRestante = (proxPorKm && currentKm) ? proxPorKm.proxKm - currentKm : null;

            const statCard = (label, value, color) =>
                `<div style="background:white; border:1px solid var(--border); border-radius:10px; padding:14px 18px; text-align:center;">
                    <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">${label}</div>
                    <div style="font-size:1.2rem; font-weight:700; color:${color};">${value}</div>
                </div>`;

            statsEl.innerHTML =
                statCard('Registros',       manLog.length, '#6b8e23') +
                statCard('Realizados',      realizados, '#2e8b6e') +
                statCard('Pendentes',       pendentes, pendentes > 0 ? '#c47a2b' : '#9ca3af') +
                statCard('Total Gasto',     totalCusto > 0 ? 'R$ ' + totalCusto.toLocaleString('pt-BR', {minimumFractionDigits:2}) : '—', '#e05c5c') +
                statCard('Hodômetro Atual', currentKm ? currentKm.toLocaleString('pt-BR') + ' km' : '—', '#7fa9c4') +
                statCard('Próx. Serviço',   kmRestante != null ? (kmRestante >= 0 ? kmRestante.toLocaleString('pt-BR') + ' km' : '⚠️ Vencido') : '—', kmRestante != null && kmRestante < 0 ? '#dc2626' : '#88d8b0');
        }

        // ── Empty state ──
        if (filtered.length === 0) {
            container.innerHTML = `<div class="glass-card" style="text-align:center; color:var(--text-muted); padding:40px;">${t('man_no_items')}</div>`;
            return;
        }

        // ── List ──
        let html = '';
        filtered.forEach(m => {
            const dtFormatada = m.data ? formatDate(m.data) : '—';
            const ss     = getManStatusStyle(m.status);
            const faIcon = getManTipoIcon(m.tipo);

            const proxInfo = [];
            if (m.proxData) proxInfo.push(`<span style="font-size:0.78rem; color:var(--text-muted);"><i class="fas fa-calendar-day" style="font-size:0.7rem;"></i> Próx.: ${m.proxData.split('-').reverse().join('/')}</span>`);
            if (m.proxKm)   proxInfo.push(`<span style="font-size:0.78rem; color:var(--text-muted);"><i class="fas fa-gauge-high" style="font-size:0.7rem;"></i> Próx.: ${m.proxKm.toLocaleString('pt-BR')} km</span>`);

            html += `<div class="item-card" style="margin-bottom:10px; border-left:4px solid #8d99ae;">
                <div style="width:44px; height:44px; border-radius:12px; background:#f4f5f7; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i class="fas ${faIcon}" style="color:#8d99ae; font-size:1.2rem;"></i>
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:5px;">
                        <b style="font-size:1rem;">${m.tipo}</b>
                        <span style="background:${ss.bg}; color:${ss.color}; border-radius:6px; padding:2px 8px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                            <i class="fas ${ss.icon}" style="font-size:0.7rem;"></i> ${m.status}
                        </span>
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:10px; font-size:0.82rem; color:var(--text-muted); margin-bottom:4px;">
                        <span><i class="fas fa-calendar-day" style="font-size:0.7rem;"></i> ${dtFormatada}</span>
                        ${m.km    ? `<span><i class="fas fa-gauge-high" style="font-size:0.7rem;"></i> ${m.km.toLocaleString('pt-BR')} km</span>` : ''}
                        ${m.local ? `<span><i class="fas fa-wrench" style="font-size:0.7rem;"></i> ${m.local}</span>` : ''}
                        ${m.custo ? `<span style="font-weight:700; color:#e05c5c;">R$ ${m.custo.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>` : ''}
                    </div>
                    ${proxInfo.length > 0 ? `<div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:2px;">${proxInfo.join('')}</div>` : ''}
                    ${m.obs ? `<div style="margin-top:3px; font-size:0.78rem; color:var(--text-muted); font-style:italic;"><i class="fas fa-note-sticky" style="font-size:0.7rem;"></i> ${m.obs}</div>` : ''}
                </div>
                <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                    <button onclick="editMan('${m.id}')" class="btn-edit-item" title="Editar"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteMan('${m.id}')" class="btn-delete-item" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        });

        container.innerHTML = `<div class="glass-card">${html}</div>`;
    }

    // ========== DIÁRIO DE ABASTECIMENTO ==========

    let fuelChartInstance = null;

    function saveFuelData() {
        safeSetItem('tp_fuel_v1', JSON.stringify(fuelLog));
    }

    function calcFuelTotal() {
        const litros = parseFloat(document.getElementById('fuel-litros').value) || 0;
        const preco  = parseFloat(document.getElementById('fuel-preco').value)  || 0;
        if (litros > 0 && preco > 0)
            document.getElementById('fuel-total').value = (litros * preco).toFixed(2);
    }

    function updateFuelTripSelectors() {
        ['fuel-trip','filter-fuel-trip','fuel-chart-trip'].forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            const cur = sel.value;
            if (id !== 'fuel-trip') sel.innerHTML = '<option value="">Todas as viagens</option>';
            else sel.innerHTML = '';
            tripNames.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name; opt.textContent = name;
                sel.appendChild(opt);
            });
            if (cur) sel.value = cur;
        });
    }

    function saveFuel() {
        const data   = document.getElementById('fuel-data').value;
        const trip   = document.getElementById('fuel-trip').value;
        const cidade = document.getElementById('fuel-cidade').value.trim();
        const posto  = document.getElementById('fuel-posto').value.trim();
        const km     = parseFloat(document.getElementById('fuel-km').value)     || null;
        const litros = parseFloat(document.getElementById('fuel-litros').value) || null;
        const preco  = parseFloat(document.getElementById('fuel-preco').value)  || null;
        const total  = parseFloat(document.getElementById('fuel-total').value)  || null;
        const tipo   = document.getElementById('fuel-tipo').value;
        const obs    = document.getElementById('fuel-obs').value.trim();
        const editId = document.getElementById('fuel-edit-id').value;

        // Campos de pagamento
        const meioPagamento  = (document.getElementById('fuel-meio-pagamento')  || {}).value || 'dinheiro';
        const isCredito      = meioPagamento === 'credito';
        const isDebito       = meioPagamento === 'debito';
        const isPix          = meioPagamento === 'pix';
        const nomeCartao     = (isCredito || isDebito || isPix) ? ((document.getElementById('fuel-nome-cartao')  || {}).value || '') : '';
        const parcelas       = isCredito ? parseInt((document.getElementById('fuel-parcelas')           || {}).value || 1) : 1;
        const dataPagamento  = (isCredito || isDebito) ? ((document.getElementById('fuel-data-pagamento') || {}).value || '') : '';

        if (!data) { alert('Informe a data do abastecimento.'); return; }
        if (!litros && !total) { alert('Informe os litros ou o valor total.'); return; }

        const entry = { id: editId || Date.now().toString(), data, trip, cidade, posto, km, litros, preco, total, tipo, obs, meioPagamento, nomeCartao, parcelas, dataPagamento };

        if (editId) {
            const idx = fuelLog.findIndex(f => f.id === editId);
            if (idx > -1) fuelLog[idx] = entry;
        } else {
            fuelLog.push(entry);
        }
        saveFuelData();
        clearFuelForm();
        renderFuel();
        renderFuelChart();
    }

    function clearFuelForm() {
        ['fuel-data','fuel-cidade','fuel-posto','fuel-km','fuel-litros','fuel-preco','fuel-total','fuel-obs','fuel-data-pagamento'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('fuel-edit-id').value = '';
        document.getElementById('fuel-tipo').selectedIndex = 0;
        const mp = document.getElementById('fuel-meio-pagamento');
        if (mp) { mp.value = 'dinheiro'; }
        const nc = document.getElementById('fuel-nome-cartao');
        if (nc) nc.value = '';
        const pc = document.getElementById('fuel-parcelas');
        if (pc) pc.value = '1';
        if (typeof onFuelMeioPagamentoChange === 'function') onFuelMeioPagamentoChange();
    }

    function editFuel(id) {
        const f = fuelLog.find(x => x.id === id);
        if (!f) return;
        document.getElementById('fuel-data').value    = f.data    || '';
        document.getElementById('fuel-trip').value    = f.trip    || '';
        document.getElementById('fuel-cidade').value  = f.cidade  || '';
        document.getElementById('fuel-posto').value   = f.posto   || '';
        document.getElementById('fuel-km').value      = f.km      != null ? f.km      : '';
        document.getElementById('fuel-litros').value  = f.litros  != null ? f.litros  : '';
        document.getElementById('fuel-preco').value   = f.preco   != null ? f.preco   : '';
        document.getElementById('fuel-total').value   = f.total   != null ? f.total   : '';
        document.getElementById('fuel-tipo').value    = f.tipo    || 'Diesel S10';
        document.getElementById('fuel-obs').value     = f.obs     || '';
        document.getElementById('fuel-edit-id').value = f.id;
        // Restaurar campos de pagamento
        const mp = document.getElementById('fuel-meio-pagamento');
        if (mp) { mp.value = f.meioPagamento || 'dinheiro'; if (typeof onFuelMeioPagamentoChange === 'function') onFuelMeioPagamentoChange(); }
        const nc = document.getElementById('fuel-nome-cartao');
        if (nc) nc.value = f.nomeCartao || '';
        const pc = document.getElementById('fuel-parcelas');
        if (pc) pc.value = f.parcelas || '1';
        const dp = document.getElementById('fuel-data-pagamento');
        if (dp) dp.value = f.dataPagamento || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteFuel(id) {
        if (!confirm(t('fuel_confirm_delete'))) return;
        fuelLog = fuelLog.filter(f => f.id !== id);
        saveFuelData();
        renderFuel();
        renderFuelChart();
    }

    // ── Calcula trechos (consumo km/L entre abastecimentos consecutivos com km) ──
    function calcTrechos(entries) {
        // Filtra só os que têm km e litros, ordena por km
        const comKm = entries
            .filter(f => f.km > 0 && f.litros > 0)
            .slice()
            .sort((a, b) => a.km - b.km);

        const trechos = [];
        for (let i = 1; i < comKm.length; i++) {
            const prev = comKm[i - 1];
            const curr = comKm[i];
            const kmPercorrido = curr.km - prev.km;
            if (kmPercorrido <= 0) continue;
            trechos.push({
                label:        `${prev.cidade || prev.km + ' km'} → ${curr.cidade || curr.km + ' km'}`,
                labelCurto:   curr.cidade || (curr.km.toLocaleString('pt-BR') + ' km'),
                de:           prev.cidade || (prev.km.toLocaleString('pt-BR') + ' km'),
                ate:          curr.cidade || (curr.km.toLocaleString('pt-BR') + ' km'),
                kmPercorrido,
                litros:       curr.litros,
                consumo:      kmPercorrido / curr.litros,
                custoTotal:   curr.total || null,
                custoPorKm:   curr.total ? curr.total / kmPercorrido : null,
                data:         curr.data,
                tipo:         curr.tipo,
                trip:         curr.trip,
                id:           curr.id,
            });
        }
        return trechos;
    }

    function renderFuelChart() {
        const canvas   = document.getElementById('fuel-chart-canvas');
        const emptyEl  = document.getElementById('fuel-chart-empty');
        const tableEl  = document.getElementById('fuel-trecho-table');
        const tripSel  = document.getElementById('fuel-chart-trip');
        const modeSel  = document.getElementById('fuel-chart-mode');
        if (!canvas) return;

        const filterTrip = tripSel ? tripSel.value : '';
        const mode       = modeSel ? modeSel.value : 'trecho';

        let entries = fuelLog.slice();
        if (filterTrip) entries = entries.filter(f => f.trip === filterTrip);

        const trechos = calcTrechos(entries);

        if (trechos.length === 0) {
            canvas.style.display  = 'none';
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableEl) tableEl.innerHTML = '';
            if (fuelChartInstance) { fuelChartInstance.destroy(); fuelChartInstance = null; }
            return;
        }

        canvas.style.display  = 'block';
        if (emptyEl) emptyEl.style.display = 'none';

        // Agrupa por cidade destino se mode === 'cidade'
        let labels, valores, cores;
        if (mode === 'cidade') {
            const grupos = {};
            trechos.forEach(tr => {
                const key = tr.ate;
                if (!grupos[key]) grupos[key] = { soma: 0, count: 0 };
                grupos[key].soma  += tr.consumo;
                grupos[key].count += 1;
            });
            labels  = Object.keys(grupos);
            valores = labels.map(k => Math.round((grupos[k].soma / grupos[k].count) * 100) / 100);
        } else {
            labels  = trechos.map(tr => tr.labelCurto);
            valores = trechos.map(tr => Math.round(tr.consumo * 100) / 100);
        }

        // Média geral para linha de referência
        const media = Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 100) / 100;

        // Cor por desempenho: verde se >= média, laranja se < média
        cores = valores.map(v => v >= media ? 'rgba(136, 216, 176, 0.85)' : 'rgba(244, 162, 89, 0.85)');
        const coresBorda = valores.map(v => v >= media ? '#2e8b6e' : '#c47a2b');

        if (fuelChartInstance) { fuelChartInstance.destroy(); fuelChartInstance = null; }

        fuelChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Consumo (km/L)',
                        data: valores,
                        backgroundColor: cores,
                        borderColor: coresBorda,
                        borderWidth: 1.5,
                        borderRadius: 6,
                        order: 2,
                    },
                    {
                        label: `Média (${media.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} km/L)`,
                        data: new Array(labels.length).fill(media),
                        type: 'line',
                        borderColor: '#7fa9c4',
                        borderWidth: 2,
                        borderDash: [5, 4],
                        pointRadius: 0,
                        fill: false,
                        tension: 0,
                        order: 1,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 14 } },
                    tooltip: {
                        callbacks: {
                            afterLabel: (ctx) => {
                                if (ctx.datasetIndex !== 0) return '';
                                const tr = mode === 'trecho' ? trechos[ctx.dataIndex] : null;
                                if (!tr) return `Média agrupada`;
                                return [
                                    `Trecho: ${tr.kmPercorrido.toLocaleString('pt-BR')} km`,
                                    `Litros: ${tr.litros.toLocaleString('pt-BR', {minimumFractionDigits:2})} L`,
                                    tr.custoTotal ? `Custo: R$ ${tr.custoTotal.toLocaleString('pt-BR', {minimumFractionDigits:2})}` : '',
                                    tr.custoPorKm ? `R$ ${tr.custoPorKm.toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3})}/km` : '',
                                ].filter(Boolean);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'km/L', font: { size: 11 } },
                        ticks: { font: { size: 11 } }
                    },
                    x: { ticks: { font: { size: 10 }, maxRotation: 40 } }
                }
            }
        });

        // ── Tabela detalhada por trecho ──
        if (tableEl && mode === 'trecho') {
            const melhor = Math.max(...valores);
            const pior   = Math.min(...valores);
            let rows = trechos.map((tr, i) => {
                const consumo = Math.round(tr.consumo * 100) / 100;
                const consumoStr = tr.consumo.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
                const isMelhor = consumo === melhor;
                const isPior   = consumo === pior && melhor !== pior;
                const badge = isMelhor
                    ? '<span style="background:#e8f6f0;color:#2e8b6e;border-radius:5px;padding:1px 7px;font-size:0.7rem;font-weight:700;">↑ Melhor</span>'
                    : isPior
                    ? '<span style="background:#fff8e8;color:#c47a2b;border-radius:5px;padding:1px 7px;font-size:0.7rem;font-weight:700;">↓ Menor</span>'
                    : '';
                const diff = consumo - media;
                const diffStr = (diff >= 0 ? '+' : '') + diff.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
                const diffColor = diff >= 0 ? '#2e8b6e' : '#c47a2b';
                return `<tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 10px; font-size:0.82rem; color:var(--text-muted);">${formatDate(tr.data)}</td>
                    <td style="padding:8px 10px; font-size:0.82rem;">${tr.de}</td>
                    <td style="padding:8px 10px; font-size:0.82rem;">${tr.ate}</td>
                    <td style="padding:8px 10px; font-size:0.82rem; text-align:right;">${tr.kmPercorrido.toLocaleString('pt-BR')} km</td>
                    <td style="padding:8px 10px; font-size:0.82rem; text-align:right;">${tr.litros.toLocaleString('pt-BR', {minimumFractionDigits:2})} L</td>
                    <td style="padding:8px 10px; font-weight:700; text-align:right;">${consumoStr} km/L ${badge}</td>
                    <td style="padding:8px 10px; font-size:0.82rem; text-align:right; color:${diffColor}; font-weight:600;">${diffStr}</td>
                    <td style="padding:8px 10px; font-size:0.82rem; text-align:right; color:#e05c5c;">${tr.custoTotal ? 'R$ ' + tr.custoTotal.toLocaleString('pt-BR', {minimumFractionDigits:2}) : '—'}</td>
                    <td style="padding:8px 10px; font-size:0.82rem; text-align:right; color:var(--text-muted);">${tr.custoPorKm ? 'R$ ' + tr.custoPorKm.toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3}) + '/km' : '—'}</td>
                </tr>`;
            }).join('');

            tableEl.innerHTML = `
                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; font-weight:600; letter-spacing:0.05em; text-transform:uppercase;">
                    Detalhamento por trecho — Média geral: <span style="color:var(--accent); font-weight:700;">${media.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} km/L</span>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f8f9fa; border-bottom:2px solid #e9ecef;">
                            <th style="padding:8px 10px; text-align:left; font-size:0.75rem; color:var(--text-muted); font-weight:600;">Data</th>
                            <th style="padding:8px 10px; text-align:left; font-size:0.75rem; color:var(--text-muted); font-weight:600;">De</th>
                            <th style="padding:8px 10px; text-align:left; font-size:0.75rem; color:var(--text-muted); font-weight:600;">Até</th>
                            <th style="padding:8px 10px; text-align:right; font-size:0.75rem; color:var(--text-muted); font-weight:600;">Distância</th>
                            <th style="padding:8px 10px; text-align:right; font-size:0.75rem; color:var(--text-muted); font-weight:600;">Litros</th>
                            <th style="padding:8px 10px; text-align:right; font-size:0.75rem; color:var(--text-muted); font-weight:600;">Consumo</th>
                            <th style="padding:8px 10px; text-align:right; font-size:0.75rem; color:var(--text-muted); font-weight:600;">vs Média</th>
                            <th style="padding:8px 10px; text-align:right; font-size:0.75rem; color:var(--text-muted); font-weight:600;">Gasto</th>
                            <th style="padding:8px 10px; text-align:right; font-size:0.75rem; color:var(--text-muted); font-weight:600;">R$/km</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>`;
        } else if (tableEl) {
            tableEl.innerHTML = '';
        }
    }

    function renderFuel() {
        const container = document.getElementById('render-fuel');
        const statsEl   = document.getElementById('fuel-stats');
        if (!container) return;

        const filterTrip   = (document.getElementById('filter-fuel-trip')   || {}).value || '';
        const filterTipo   = (document.getElementById('filter-fuel-tipo')   || {}).value || '';
        const filterSearch = ((document.getElementById('filter-fuel-search') || {}).value || '').toLowerCase();

        let filtered = fuelLog.filter(f => {
            if (filterTrip   && f.trip !== filterTrip) return false;
            if (filterTipo   && f.tipo !== filterTipo) return false;
            if (filterSearch && !((f.cidade||'').toLowerCase().includes(filterSearch) || (f.posto||'').toLowerCase().includes(filterSearch))) return false;
            return true;
        });

        filtered = filtered.slice().sort((a, b) =>
            (b.data||'').localeCompare(a.data||'') || (b.km||0) - (a.km||0));

        // ── Stats ──
        if (statsEl) {
            const totalLitros = filtered.reduce((s,f) => s + (f.litros||0), 0);
            const totalGasto  = filtered.reduce((s,f) => s + (f.total||0),  0);
            const precoMedio  = totalLitros > 0 ? totalGasto / totalLitros : 0;

            const trechos = calcTrechos(filtered);
            const consumoMedio = trechos.length > 0
                ? trechos.reduce((s,tr) => s + tr.consumo, 0) / trechos.length
                : null;
            const custoPorKm = consumoMedio && precoMedio ? precoMedio / consumoMedio : null;

            const statCard = (label, value, color) =>
                `<div style="background:white;border:1px solid var(--border);border-radius:10px;padding:14px 18px;text-align:center;">
                    <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">${label}</div>
                    <div style="font-size:1.25rem;font-weight:700;color:${color};">${value}</div>
                </div>`;

            statsEl.innerHTML =
                statCard('Abastecimentos', filtered.length, '#6b8e23') +
                statCard('Total Litros', totalLitros > 0 ? totalLitros.toLocaleString('pt-BR',{minimumFractionDigits:2})+' L' : '—', '#f4a259') +
                statCard('Total Gasto', totalGasto > 0 ? 'R$ '+totalGasto.toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—', '#e05c5c') +
                statCard('Preço Médio/L', precoMedio > 0 ? 'R$ '+precoMedio.toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3}) : '—', '#7fa9c4') +
                statCard('Consumo Médio', consumoMedio ? consumoMedio.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' km/L' : '—', '#88d8b0') +
                statCard('Custo/km', custoPorKm ? 'R$ '+custoPorKm.toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3}) : '—', '#c38d9e');
        }

        if (filtered.length === 0) {
            container.innerHTML = `<div class="glass-card" style="text-align:center;color:var(--text-muted);padding:40px;">${t('fuel_no_items')}</div>`;
            return;
        }

        // Consumo por id para badge na lista
        const trechos = calcTrechos(filtered);
        const consumoPorId = {};
        trechos.forEach(tr => { consumoPorId[tr.id] = tr.consumo.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); });

        let html = '';
        filtered.forEach(f => {
            const dtFormatada = f.data ? formatDate(f.data) : '—';
            const consumo = consumoPorId[f.id]
                ? `<span style="background:#e8f6f0;color:#2e8b6e;border-radius:6px;padding:2px 8px;font-size:0.78rem;font-weight:700;">⚡ ${consumoPorId[f.id]} km/L</span>`
                : '';
            const mapUrl = f.cidade ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((f.posto?f.posto+' ':'')+f.cidade)}` : '';

            html += `<div class="item-card" style="margin-bottom:10px;border-left:4px solid #f4a259;">
                <div style="width:44px;height:44px;border-radius:12px;background:#fff8f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fas fa-gas-pump" style="color:#f4a259;font-size:1.2rem;"></i>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:4px;">
                        <b style="font-size:1rem;">${f.tipo||'Combustível'}</b>
                        ${f.trip?`<span style="font-size:0.72rem;background:var(--accent-light);color:var(--accent);border-radius:5px;padding:1px 7px;">${f.trip}</span>`:''}
                        ${consumo}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.82rem;color:var(--text-muted);margin-bottom:4px;">
                        <span><i class="fas fa-calendar-day" style="font-size:0.7rem;"></i> ${dtFormatada}</span>
                        ${f.cidade?`<span><i class="fas fa-map-pin" style="font-size:0.7rem;"></i> ${f.cidade}</span>`:''}
                        ${f.posto?`<span><i class="fas fa-store" style="font-size:0.7rem;"></i> ${f.posto}</span>`:''}
                        ${f.km?`<span><i class="fas fa-gauge-high" style="font-size:0.7rem;"></i> ${f.km.toLocaleString('pt-BR')} km</span>`:''}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:0.85rem;">
                        ${f.litros?`<span style="font-weight:600;color:#f4a259;"><i class="fas fa-droplet"></i> ${f.litros.toLocaleString('pt-BR',{minimumFractionDigits:2})} L</span>`:''}
                        ${f.preco?`<span style="color:var(--text-muted);">R$ ${f.preco.toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3})}/L</span>`:''}
                        ${f.total?`<span style="font-weight:700;color:#e05c5c;">R$ ${f.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>`:''}
                    </div>
                    ${f.obs?`<div style="margin-top:4px;font-size:0.78rem;color:var(--text-muted);font-style:italic;"><i class="fas fa-note-sticky" style="font-size:0.7rem;"></i> ${f.obs}</div>`:''}
                </div>
                <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap;">
                    ${mapUrl?`<a href="${mapUrl}" target="_blank" style="background:#f0f4f8;color:#7fa9c4;border:none;padding:6px 11px;border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:5px;"><i class="fas fa-map-location-dot"></i> Mapa</a>`:''}
                    <button onclick="editFuel('${f.id}')" class="btn-edit-item" title="Editar"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteFuel('${f.id}')" class="btn-delete-item" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        });

        container.innerHTML = `<div class="glass-card">${html}</div>`;
    }

    // ========== CONTROLE DE PAGAMENTO — ABASTECIMENTO E MANUTENÇÃO ==========

    function sincronizarCartoes(destId) {
        const dest = document.getElementById(destId);
        const mainSelect = document.getElementById('nome-cartao');
        if (!dest || !mainSelect) return;
        const currentVal = dest.value;
        dest.innerHTML = '<option value="">— Selecione —</option>';
        Array.from(mainSelect.options).forEach(opt => {
            if (opt.value) {
                const o = document.createElement('option');
                o.value = opt.value;
                o.textContent = opt.textContent;
                dest.appendChild(o);
            }
        });
        dest.value = currentVal;
    }

    function onFuelMeioPagamentoChange() {
        const meio = (document.getElementById('fuel-meio-pagamento') || {}).value;
        const campoCartao   = document.getElementById('fuel-campo-cartao');
        const campoParcelas = document.getElementById('fuel-campo-parcelas');
        const campoData     = document.getElementById('fuel-campo-data-pagamento');
        if (!campoCartao) return;
        const isCredito = meio === 'credito';
        const isDebito  = meio === 'debito';
        const isPix     = meio === 'pix';
        campoCartao.style.display   = (isCredito || isDebito || isPix) ? '' : 'none';
        campoParcelas.style.display = isCredito ? '' : 'none';
        campoData.style.display     = (isCredito || isDebito) ? '' : 'none';
        sincronizarCartoes('fuel-nome-cartao');
    }

    function onManMeioPagamentoChange() {
        const meio = (document.getElementById('man-meio-pagamento') || {}).value;
        const campoCartao   = document.getElementById('man-campo-cartao');
        const campoParcelas = document.getElementById('man-campo-parcelas');
        const campoData     = document.getElementById('man-campo-data-pagamento');
        if (!campoCartao) return;
        const isCredito = meio === 'credito';
        const isDebito  = meio === 'debito';
        const isPix     = meio === 'pix';
        campoCartao.style.display   = (isCredito || isDebito || isPix) ? '' : 'none';
        campoParcelas.style.display = isCredito ? '' : 'none';
        campoData.style.display     = (isCredito || isDebito) ? '' : 'none';
        sincronizarCartoes('man-nome-cartao');
    }
