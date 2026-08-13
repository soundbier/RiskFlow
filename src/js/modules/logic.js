/**
 * RiskFlow & GB-Tool – Kernlogik
 * Steuert Formular-Workflows, Risikomatrix, STOP-Prinzip, Multi-Betriebs-Logik
 */

import * as storage from './storage.js';
import { defaultStandardTemplates } from './storage.js';
import { navigateTo, setOnNavigateCallback } from './app.js';

// ==========================================
// SYSTEM KONFIGURATION & STATE
// ==========================================

const riskMatrix = {
    '1-1': { level: 'Gering', class: 'low' }, '1-2': { level: 'Gering', class: 'low' }, '1-3': { level: 'Mittel', class: 'medium' },
    '2-1': { level: 'Gering', class: 'low' }, '2-2': { level: 'Mittel', class: 'medium' }, '2-3': { level: 'Hoch', class: 'high' },
    '3-1': { level: 'Mittel', class: 'medium' }, '3-2': { level: 'Hoch', class: 'high' }, '3-3': { level: 'Hoch', class: 'high' }
};

const gefaehrdungOrder = [
    "Mechanische Gefährdungen", "Elektrische Gefährdungen", "Gefahrstoffe",
    "Biologische Arbeitsstoffe", "Brand und Explosionsgefährdungen", "Thermische Gefährdungen",
    "Gefährdung durch spezielle physikalische Einwirkungen", "Gefährdungen durch Arbeitsumgebungsbedingungen",
    "Physische Belastung/Arbeitsschwere", "Psychische Faktoren", "Sonstige Gefährdungen"
];

const validIntervals = ['Täglich', 'Wöchentlich', 'Monatlich', 'Quartalsweise', 'Halbjährlich', 'Jährlich', 'Laufend'];

// State
let assessmentList = [];
let psaHazardData = [];
let branchTemplates = {};

// Multi-Betrieb-State
let companiesList = [];
let activeCompanyId = null;
let activeCompany = null;
let editingCompanyId = null;

let currentSelectedPsa = [];
let editingRecordId = null;
let highlightRecordId = null;
let currentSort = { key: 'gefaehrdung', dir: 'asc' };
let currentStep = 1;


// ==========================================
// INITIALISIERUNG
// ==========================================

export async function initializeLogic() {
    psaHazardData = await storage.getPsaCatalog();
    branchTemplates = await storage.getBranchTemplates();

    setupEventDelegation();
    setOnNavigateCallback(updateUIBasedOnState);
    await updateUIBasedOnState();
}

function switchMobileTab(tab) {
    document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.panel === tab);
    });
    document.querySelectorAll('.mobile-tab[data-tab="create"], .mobile-tab[data-tab="table"]').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });
}

async function updateUIBasedOnState() {
    const params = new URLSearchParams(window.location.search);
    
    // Immer die aktuellsten Betriebe laden
    companiesList = await storage.getAllCompanies();

    if (document.getElementById('betriebe-grid')) {
        document.getElementById('company-info-bar').style.display = 'none';
        await loadAndRenderCompanies();
    }

    if (document.getElementById('gb-workspace')) {
        const companyIdParam = params.get('companyId');
        activeCompanyId = companyIdParam ? parseInt(companyIdParam) : null;
        activeCompany = companiesList.find(c => c.id === activeCompanyId);

        if (!activeCompany) {
            // Falls keine ID oder Betrieb nicht gefunden -> zurück ins Dashboard
            navigateTo('betriebe');
            return;
        }

        renderCompanyState();
        
        // NUR die Gefährdungen für den aktuell aktiven Betrieb laden
        assessmentList = await storage.getGbsByCompany(activeCompanyId);

        resetStopFields();
        updateDualMatrix();
        applyCurrentSort();
        renderTable();
        showStep(currentStep);
    }
}

// ==========================================
// EVENT DELEGATION HUB
// ==========================================

function setupEventDelegation() {
    document.addEventListener('click', async (e) => {
        // --- Globale Aktionen ---
        if (e.target.closest('#btn-settings')) openSettingsModal();
        if (e.target.closest('#btn-close-settings-top') || e.target.closest('#btn-close-settings-bottom')) closeSettingsModal();
        if (e.target.closest('#btn-goto-betriebe') || e.target.closest('#btn-close-workspace')) navigateTo('betriebe');

        // --- Company Setup & Dashboard ---
        if (e.target.closest('#btn-edit-company')) {
            if(activeCompanyId) openCompanyModal(activeCompanyId);
        }
        if (e.target.closest('#btn-new-betrieb')) openCompanyModal();
        
        if (e.target.closest('.betrieb-card-main')) {
            // Betrieb auswählen -> in Workspace wechseln
            const card = e.target.closest('.betrieb-card');
            window.location.search = `?action=workspace&companyId=${card.dataset.id}`;
        }
        
        if (e.target.closest('.edit-betrieb')) {
            openCompanyModal(Number(e.target.closest('.edit-betrieb').dataset.id));
        }
        if (e.target.closest('.delete-betrieb')) {
            await deleteCompanyHandler(Number(e.target.closest('.delete-betrieb').dataset.id));
        }
        if (e.target.closest('#btn-close-betrieb-top') || e.target.closest('#btn-close-betrieb-bottom')) {
            closeCompanyModal();
        }

        // --- Wizard Navigation ---
        if (e.target.closest('#btn-next')) {
            if (validateCurrentStep()) { currentStep++; showStep(currentStep); }
        }
        if (e.target.closest('#btn-prev')) {
            currentStep--; showStep(currentStep);
        }
        if (e.target.closest('#btn-cancel-edit')) cancelEditMode();

        // --- STOP Prinzip ---
        if (e.target.closest('.btn-add-small')) {
            const btn = e.target.closest('.btn-add-small');
            addStopRow(btn.dataset.stop, btn.dataset.placeholder);
        }
        if (e.target.closest('.btn-remove')) {
            removeStopRow(e.target.closest('.btn-remove'));
        }

        // --- PSA Modal ---
        if (e.target.closest('#btn-open-psa')) openPsaModal();
        if (e.target.closest('#btn-close-psa-top') || e.target.closest('#btn-close-psa-bottom')) closePsaModal();
        if (e.target.closest('#btn-apply-psa')) applyPsaModalSelection();

        // --- Tabelle & Templates ---
        if (e.target.closest('.tpl-btn')) {
            const tpl = e.target.closest('.tpl-btn').dataset.tpl;
            await loadTemplate(tpl);
        }
        if (e.target.closest('th.sortable')) {
            sortTable(e.target.closest('th.sortable').dataset.sort);
        }
        if (e.target.closest('.btn-icon.edit')) {
            editRecord(Number(e.target.closest('tr').dataset.id));
        }
        if (e.target.closest('.btn-icon.delete')) {
            await deleteRecord(Number(e.target.closest('tr').dataset.id));
        }

        // --- Einstellungen: Tab-Umschaltung ---
        if (e.target.closest('.module-tab')) {
            switchSettingsTab(e.target.closest('.module-tab').id);
        }

        // --- Mobile-Tableiste ---
        if (e.target.closest('.mobile-tab')) {
            const tabBtn = e.target.closest('.mobile-tab');
            const tab = tabBtn.dataset.tab;
            if (tab === 'settings') openSettingsModal();
            else switchMobileTab(tab);
        }
    });

    document.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (e.target.id === 'gb-form') await saveAssessmentRecord();
        if (e.target.id === 'betrieb-form') await saveCompanyForm();
    });

    document.addEventListener('change', (e) => {
        if (['s-vor', 'w-vor', 's-nach', 'w-nach'].includes(e.target.id)) updateDualMatrix();
        if (e.target.id === 'frist-typ') {
            const di = document.getElementById('frist-datum');
            if (e.target.value === 'datum') { di.style.display = 'block'; di.required = true; } 
            else { di.style.display = 'none'; di.required = false; di.value = ''; }
        }
    });
}

// ==========================================
// COMPANY SETUP & HEADER
// ==========================================

function renderCompanyState() {
    const infoBar = document.getElementById('company-info-bar');
    if (!infoBar || !activeCompany) return;
    
    infoBar.style.display = 'flex';
    document.getElementById('display-c-name').innerText = activeCompany.name;
    document.getElementById('display-c-location').innerText = activeCompany.anschrift || '—';
    document.getElementById('display-c-auditor').innerText = activeCompany.auditor || '—';
    document.getElementById('display-c-date').innerText = formatDate(activeCompany.createdAt);
}

// ==========================================
// WIZARD & MATRIX
// ==========================================

function showStep(step) {
    document.querySelectorAll('.wizard-step').forEach((el, index) => el.classList.toggle('active', index + 1 === step));
    document.querySelectorAll('.step-indicator').forEach((el, index) => {
        el.classList.toggle('active', index + 1 <= step);
        el.classList.toggle('current', index + 1 === step);
    });
    
    if (step === 3 && document.getElementById('step3-current-gefaehrdung')) {
        document.getElementById('step3-current-gefaehrdung').innerText = document.getElementById('gefaehrdung').value;
    }

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    
    if(btnPrev) btnPrev.style.display = step === 1 ? 'none' : 'inline-flex';
    if(btnNext) btnNext.style.display = step === 3 ? 'none' : 'inline-flex';
    if(btnSubmit) btnSubmit.style.display = step === 3 ? 'inline-flex' : 'none';
}

function validateCurrentStep() {
    const inputs = document.getElementById(`step-${currentStep}`).querySelectorAll('input[required], select[required]');
    let isValid = true;
    for (let i = inputs.length - 1; i >= 0; i--) {
        if (!inputs[i].checkValidity()) { inputs[i].reportValidity(); isValid = false; }
    }
    return isValid;
}

function updateDualMatrix() {
    const sVor = document.getElementById('s-vor')?.value;
    const wVor = document.getElementById('w-vor')?.value;
    const sNach = document.getElementById('s-nach')?.value;
    const wNach = document.getElementById('w-nach')?.value;
    
    if(!sVor) return;

    document.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('active'));
    if(document.getElementById(`vor-${sVor}-${wVor}`)) document.getElementById(`vor-${sVor}-${wVor}`).classList.add('active');
    if(document.getElementById(`nach-${sNach}-${wNach}`)) document.getElementById(`nach-${sNach}-${wNach}`).classList.add('active');
}

// ==========================================
// STOP-PRINZIP & FORMULAR
// ==========================================

function addStopRow(letter, placeholder, value = '') {
    const container = document.getElementById(`multi-${letter}`);
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
        <span class="row-num">${container.children.length + 1}.</span>
        <input type="text" class="stop-val" placeholder="${placeholder}" value="${value}">
        <button type="button" class="btn-remove" data-letter="${letter}">×</button>
    `;
    container.appendChild(row);
    updateStopNumbers(letter);
}

function removeStopRow(btn) {
    const letter = btn.dataset.letter;
    const container = document.getElementById(`multi-${letter}`);
    if (container.children.length === 1) { container.querySelector('input').value = ''; return; }
    btn.closest('.input-row').remove();
    updateStopNumbers(letter);
}

function updateStopNumbers(letter) {
    document.getElementById(`multi-${letter}`).querySelectorAll('.input-row').forEach((row, index) => { 
        row.querySelector('.row-num').innerText = `${index + 1}.`; 
    });
}

function resetStopFields() {
    ['s', 't', 'o', 'p'].forEach(letter => {
        const c = document.getElementById(`multi-${letter}`);
        if(c) c.innerHTML = '';
    });
    addStopRow('s', 'Substitution (z.B. Gefahrstoff ersetzen)');
    addStopRow('t', 'Technische Maßnahmen');
    addStopRow('o', 'Organisatorische Maßnahmen');
    addStopRow('p', 'Persönliche Maßnahmen (sonstige)');
}

function getStopValues(letter) { 
    return Array.from(document.querySelectorAll(`#multi-${letter} .stop-val`))
                .map(i => i.value.trim()).filter(v => v !== '').join('|'); 
}

// ==========================================
// TABELLEN-RENDERING & DB-SYNC
// ==========================================

async function saveAssessmentRecord() {
    const fristTyp = document.getElementById('frist-typ').value;
    const finalFrist = fristTyp === 'datum' ? document.getElementById('frist-datum').value : fristTyp;
    const currentTaetigkeit = document.getElementById('taetigkeit').value;
    const currentBereich = document.getElementById('bereich-input').value;

    const record = {
        id: editingRecordId !== null ? editingRecordId : Date.now(),
        companyId: activeCompanyId, // Verknüpfung zum aktuellen Betrieb!
        bereich: currentBereich,
        taetigkeit: currentTaetigkeit, 
        gefaehrdung: document.getElementById('gefaehrdung').value,
        sVor: document.getElementById('s-vor').value, wVor: document.getElementById('w-vor').value, 
        sNach: document.getElementById('s-nach').value, wNach: document.getElementById('w-nach').value,
        stopS: getStopValues('s'), stopT: getStopValues('t'), stopO: getStopValues('o'), stopP: getStopValues('p'),
        psaList: [...currentSelectedPsa], 
        psaStillRequired: document.getElementById('psa-still-required').checked,
        verantwortlich: document.getElementById('verantwortlich').value, 
        frist: finalFrist
    };

    await storage.saveAssessment(record);
    assessmentList = await storage.getGbsByCompany(activeCompanyId);
    highlightRecordId = record.id;
    
    if (editingRecordId !== null) cancelEditMode();
    else resetFormAfterSave(currentTaetigkeit, currentBereich);
    
    applyCurrentSort(); 
    renderTable(); 
    switchMobileTab('table');
    document.getElementById('table-anchor').scrollIntoView({ behavior: 'smooth' });
}

function resetFormAfterSave(keepTaetigkeit, keepBereich) {
    document.getElementById('gb-form').reset();
    document.getElementById('bereich-input').value = keepBereich || '';
    document.getElementById('taetigkeit').value = keepTaetigkeit; 
    currentSelectedPsa = []; 
    document.getElementById('psa-still-required').checked = true; 
    renderStep3PsaPreview();
    document.getElementById('s-vor').value = "3"; document.getElementById('w-vor').value = "2"; 
    document.getElementById('s-nach').value = "1"; document.getElementById('w-nach').value = "1";
    document.getElementById('frist-typ').value = 'datum'; 
    document.getElementById('frist-datum').style.display = 'block'; 
    document.getElementById('frist-datum').required = true;
    resetStopFields(); 
    currentStep = 1; 
    showStep(currentStep); 
    updateDualMatrix();
}

function renderTable() {
    const tbody = document.querySelector('#gb-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    const countBadge = document.getElementById('mobile-tab-count');
    if (countBadge) {
        if (assessmentList.length > 0) {
            countBadge.textContent = assessmentList.length;
            countBadge.style.display = 'inline-flex';
        } else {
            countBadge.style.display = 'none';
        }
    }

    // Gruppierung nach Bereich > Tätigkeit
    const groupMap = {};
    assessmentList.forEach(item => {
        const bName = item.bereich ? `${item.bereich} ➔ ` : '';
        const tName = item.taetigkeit || 'Ohne Zuordnung';
        const groupKey = bName + tName;
        if (!groupMap[groupKey]) groupMap[groupKey] = [];
        groupMap[groupKey].push(item);
    });

    const groups = Object.keys(groupMap);
    if (currentSort.key === 'taetigkeit') {
        groups.sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1) * (currentSort.dir === 'asc' ? 1 : -1));
    }

    groups.forEach(groupName => {
        const trGroup = document.createElement('tr');
        trGroup.className = 'group-header-row';
        trGroup.innerHTML = `<td colspan="9"><div style="display:flex; justify-content: space-between; align-items: center;"><span class="group-title">📂 <span style="color: var(--primary);">${groupName}</span></span><span style="font-size: 11px; font-weight: normal; color: #64748b;">${groupMap[groupName].length} Gefährdung(en)</span></div></td>`;
        tbody.appendChild(trGroup);

        groupMap[groupName].forEach(item => {
            const riskVor = riskMatrix[`${item.sVor}-${item.wVor}`];
            const riskNach = riskMatrix[`${item.sNach}-${item.wNach}`];
            
            let stopHtml = `<div class="table-stop-display">`;
            ['S','T','O','P'].forEach(l => { 
                if(item[`stop${l}`]) stopHtml += `<div class="table-stop-row"><div class="table-stop-indicator ${l.toLowerCase()}">${l}</div> <div class="table-stop-text">${renderStopList(item[`stop${l}`])}</div></div>`; 
            });
            stopHtml += `</div>`;
            if(!item.stopS && !item.stopT && !item.stopO && !item.stopP) stopHtml = `<span style="color:#94a3b8; font-style:italic;">Keine Maßnahmen</span>`;

            let psaColHtml = `<span style="color:#94a3b8; font-style:italic;">Keine PSA</span>`;
            if (item.psaList && item.psaList.length > 0) {
                psaColHtml = item.psaList.map(p => `<span class="psa-cell-badge">🛡️ ${p}</span>`).join('');
                const isReq = item.psaStillRequired !== false;
                psaColHtml += `<div style="font-size: 11px; margin-top: 4px; color: ${isReq ? '#db2777' : '#64748b'};">Nach Maßnahmen: ${isReq ? '<strong>Erforderlich</strong>' : '<span style="color:#64748b;">Entbehrlich</span>'}</div>`;
            }

            const tr = document.createElement('tr');
            tr.dataset.id = item.id;
            if(item.id === highlightRecordId) tr.classList.add('highlight-record');

            tr.innerHTML = `
                <td class="no-print drag-cell"><div class="drag-handle">☰</div></td>
                <td data-label="Tätigkeit" style="font-weight: 600; font-size: 12px; color: #475569;">${item.taetigkeit}</td>
                <td data-label="Gefahr"><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #334155;">${item.gefaehrdung}</span></td>
                <td data-label="Risiko"><div><span class="badge ${riskVor.class}">${riskVor.level}</span><span class="risk-arrow">➔</span><span class="badge ${riskNach.class}">${riskNach.level}</span></div></td>
                <td data-label="Maßnahmen (STOP)">${stopHtml}</td>
                <td data-label="PSA / Schutzausrüstung">${psaColHtml}</td>
                <td data-label="Verantw.">${item.verantwortlich}</td>
                <td data-label="Frist"><div class="frist-container"><div class="status-dot ${getFristColor(item.frist)}"></div>${formatFrist(item.frist)}</div></td>
                <td class="no-print action-td">
                    <div class="action-cell">
                        <button type="button" class="btn-icon edit" title="Bearbeiten"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                        <button type="button" class="btn-icon delete" title="Löschen"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });

    highlightRecordId = null;
    updateSortIcons();
    updateDatalist();
}

// ==========================================
// UTILS & HELPER
// ==========================================

function renderStopList(dataStr) {
    if (!dataStr) return '';
    const items = dataStr.split('|');
    if (items.length === 1) return items[0]; 
    return `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
}

function formatDate(dateStr) {
    if(!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; 
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatFrist(val) {
    if(!val) return '—';
    if (validIntervals.includes(val)) return val;
    return formatDate(val);
}

function getFristColor(val) {
    if(!val) return 'dot-none';
    if (validIntervals.includes(val)) return 'dot-blue'; 
    const diffDays = Math.ceil((new Date(val).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 'dot-red' : (diffDays <= 7 ? 'dot-yellow' : 'dot-green');                    
}

function updateDatalist() {
    const tList = document.getElementById('taetigkeit-list');
    const bList = document.getElementById('bereich-list');
    if(tList) {
        const uniqueT = [...new Set(assessmentList.map(i => i.taetigkeit).filter(Boolean))];
        tList.innerHTML = uniqueT.map(t => `<option value="${t}">`).join('');
    }
    if(bList) {
        const uniqueB = [...new Set(assessmentList.map(i => i.bereich).filter(Boolean))];
        bList.innerHTML = uniqueB.map(b => `<option value="${b}">`).join('');
    }
}

// ==========================================
// ACTIONS (Delete, Edit, Sort, Templates)
// ==========================================

async function deleteRecord(id) { 
    if(confirm("Diesen Eintrag wirklich löschen?")) {
        await storage.deleteAssessment(id);
        assessmentList = await storage.getGbsByCompany(activeCompanyId);
        if(editingRecordId === id) cancelEditMode();
        renderTable(); 
    }
}

function editRecord(id) {
    const record = assessmentList.find(r => r.id === id);
    if (!record) return;
    editingRecordId = record.id;
    document.getElementById('edit-mode-banner').style.display = 'flex';
    document.getElementById('bereich-input').value = record.bereich || '';
    document.getElementById('taetigkeit').value = record.taetigkeit || '';
    document.getElementById('gefaehrdung').value = record.gefaehrdung || gefaehrdungOrder[0];
    document.getElementById('s-vor').value = record.sVor || '3'; document.getElementById('w-vor').value = record.wVor || '2';
    document.getElementById('s-nach').value = record.sNach || '1'; document.getElementById('w-nach').value = record.wNach || '1';
    updateDualMatrix();

    currentSelectedPsa = record.psaList ? [...record.psaList] : [];
    renderStep3PsaPreview();
    document.getElementById('psa-still-required').checked = record.psaStillRequired !== false;

    ['s', 't', 'o', 'p'].forEach(letter => {
        const container = document.getElementById(`multi-${letter}`); container.innerHTML = '';
        (record[`stop${letter.toUpperCase()}`] || '').split('|').forEach(pVal => addStopRow(letter, 'Maßnahme', pVal));
        if(container.children.length === 0) addStopRow(letter, 'Maßnahme', '');
    });

    document.getElementById('verantwortlich').value = record.verantwortlich || '';
    const fristVal = record.frist || '';
    if (validIntervals.includes(fristVal)) {
        document.getElementById('frist-typ').value = fristVal; document.getElementById('frist-datum').style.display = 'none'; document.getElementById('frist-datum').required = false; document.getElementById('frist-datum').value = '';
    } else {
        document.getElementById('frist-typ').value = 'datum'; document.getElementById('frist-datum').style.display = 'block'; document.getElementById('frist-datum').required = true; document.getElementById('frist-datum').value = fristVal;
    }
    currentStep = 1; showStep(currentStep);
    switchMobileTab('create');
    document.getElementById('gb-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelEditMode() {
    editingRecordId = null;
    document.getElementById('edit-mode-banner').style.display = 'none';
    resetFormAfterSave(document.getElementById('taetigkeit').value, document.getElementById('bereich-input').value);
}

function sortTable(key) {
    if (currentSort.key === key) currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
    else { currentSort.key = key; currentSort.dir = 'asc'; }
    applyCurrentSort();
    renderTable();
}

function applyCurrentSort() {
    if (!currentSort.key || currentSort.key === 'taetigkeit') return;
    assessmentList.sort((a, b) => {
        let valA, valB;
        if (currentSort.key === 'risiko') { valA = parseInt(a.sVor) * parseInt(a.wVor); valB = parseInt(b.sVor) * parseInt(b.wVor); } 
        else if (currentSort.key === 'gefaehrdung') { valA = gefaehrdungOrder.indexOf(a.gefaehrdung); valB = gefaehrdungOrder.indexOf(b.gefaehrdung); } 
        else { valA = (a[currentSort.key] || '').toString().toLowerCase(); valB = (b[currentSort.key] || '').toString().toLowerCase(); }
        if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
        return 0;
    });
}

async function loadTemplate(type) {
    const combinedTemplates = [...defaultStandardTemplates, ...(branchTemplates[type] || [])];
    const newRecords = combinedTemplates.map(t => ({ 
        ...t, 
        id: Date.now() + Math.floor(Math.random() * 1000),
        companyId: activeCompanyId 
    }));
    await storage.saveMultipleAssessments(newRecords);
    assessmentList = await storage.getGbsByCompany(activeCompanyId);
    applyCurrentSort(); renderTable(); alert("Vorlagen erfolgreich geladen!");
}

// ==========================================
// PSA MODAL
// ==========================================

function openPsaModal() { 
    renderModalPsaList(); 
    document.getElementById('psa-modal').style.display = 'flex'; 
}

function closePsaModal() { 
    document.getElementById('psa-modal').style.display = 'none'; 
}

function renderModalPsaList() {
    const container = document.getElementById('modal-psa-list');
    container.innerHTML = '';
    psaHazardData.forEach(group => {
        let html = `<div class="modal-group-title">[${group.letter}] ${group.group}</div>`;
        group.items.forEach(item => {
            const badgeText = `${item.psa} (${item.ref})`;
            const isChecked = currentSelectedPsa.includes(badgeText);
            html += `
                <div class="modal-item-row">
                    <input type="checkbox" value="${badgeText}" ${isChecked ? 'checked' : ''} class="psa-checkbox">
                    <div>
                        <div style="font-weight: 600; font-size: 13px; color: var(--text-main);">${item.label}</div>
                        <div style="font-size: 11.5px; color: var(--text-muted);">🛡️ ${item.psa} — Ref: ${item.ref}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML += html;
    });
    
    container.querySelectorAll('.psa-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            document.getElementById('modal-selected-counter').innerText = `${document.querySelectorAll('#modal-psa-list input[type="checkbox"]:checked').length} ausgewählt`;
        });
    });
    document.getElementById('modal-selected-counter').innerText = `${document.querySelectorAll('#modal-psa-list input[type="checkbox"]:checked').length} ausgewählt`;
}

function applyPsaModalSelection() {
    currentSelectedPsa = Array.from(document.querySelectorAll('#modal-psa-list input[type="checkbox"]:checked')).map(cb => cb.value);
    renderStep3PsaPreview();
    closePsaModal();
}

function renderStep3PsaPreview() {
    const container = document.getElementById('step3-psa-preview');
    if(!container) return;
    document.getElementById('psa-badge-count').innerText = `${currentSelectedPsa.length} gewählt`;
    if (currentSelectedPsa.length === 0) { container.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">Keine PSA ausgewählt</span>`; return; }
    container.innerHTML = currentSelectedPsa.map(p => `<span class="selected-psa-tag">🛡️ ${p}</span>`).join('');
}

// ==========================================
// BETRIEBE-VERWALTUNG
// ==========================================

async function loadAndRenderCompanies() {
    companiesList = await storage.getAllCompanies();
    companiesList.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'));

    const gbCounts = await Promise.all(
        companiesList.map(c => storage.getGbsByCompany(c.id).then(gbs => gbs.length))
    );
    companiesList.forEach((c, i) => { c._gbCount = gbCounts[i]; });

    renderCompaniesGrid();
}

function renderCompaniesGrid() {
    const grid = document.getElementById('betriebe-grid');
    if (!grid) return;

    if (companiesList.length === 0) {
        grid.innerHTML = `
            <div class="betriebe-empty">
                <div style="font-size: 32px; margin-bottom: 10px;">🏢</div>
                Noch keine Betriebe angelegt.<br>
                Lege deinen ersten Betrieb an, um ihm Gefährdungsbeurteilungen zuzuordnen.
            </div>`;
        return;
    }

    grid.innerHTML = companiesList.map(c => `
        <div class="betrieb-card" data-id="${c.id}" style="cursor: pointer;">
            <div class="betrieb-card-main">
                <div class="betrieb-card-icon">🏢</div>
                <div class="betrieb-card-info">
                    <div class="betrieb-card-name">${c.name}</div>
                    <div class="betrieb-card-address">${c.anschrift || 'Keine Anschrift hinterlegt'}</div>
                    <div class="betrieb-card-meta">${c._gbCount} Gefährdungsbeurteilung${c._gbCount === 1 ? '' : 'en'}</div>
                </div>
            </div>
            <div class="betrieb-card-actions" style="cursor: default;" onclick="event.stopPropagation();">
                <button type="button" class="btn-icon edit-betrieb" title="Bearbeiten" data-id="${c.id}">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button type="button" class="btn-icon delete-betrieb" title="Löschen" data-id="${c.id}">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function openCompanyModal(id = null) {
    editingCompanyId = id;
    const title = document.getElementById('betrieb-modal-title');
    const nameInput = document.getElementById('betrieb-name');
    const anschriftInput = document.getElementById('betrieb-anschrift');
    const auditorInput = document.getElementById('betrieb-auditor');

    if (id !== null) {
        const c = companiesList.find(x => x.id === id);
        title.textContent = 'Betrieb bearbeiten';
        nameInput.value = c?.name || '';
        anschriftInput.value = c?.anschrift || '';
        if(auditorInput) auditorInput.value = c?.auditor || '';
    } else {
        title.textContent = 'Neuer Betrieb';
        nameInput.value = '';
        anschriftInput.value = '';
        if(auditorInput) auditorInput.value = '';
    }

    document.getElementById('betrieb-modal').style.display = 'flex';
    nameInput.focus();
}

function closeCompanyModal() {
    document.getElementById('betrieb-modal').style.display = 'none';
    editingCompanyId = null;
}

async function saveCompanyForm() {
    const name = document.getElementById('betrieb-name').value.trim();
    const anschrift = document.getElementById('betrieb-anschrift').value.trim();
    const auditorInput = document.getElementById('betrieb-auditor');
    const auditor = auditorInput ? auditorInput.value.trim() : '';
    
    if (!name) return;

    const existing = editingCompanyId !== null ? companiesList.find(c => c.id === editingCompanyId) : null;

    const company = {
        id: editingCompanyId !== null ? editingCompanyId : Date.now(),
        name,
        anschrift,
        auditor,
        createdAt: existing?.createdAt || new Date().toISOString()
    };

    await storage.saveCompany(company);
    closeCompanyModal();
    
    // Nach Speichern die Oberfläche direkt refreshen
    await updateUIBasedOnState();
}

async function deleteCompanyHandler(id) {
    const company = companiesList.find(c => c.id === id);
    const gbCount = company?._gbCount || 0;

    const warning = gbCount > 0
        ? `Der Betrieb "${company?.name}" enthält ${gbCount} Gefährdungsbeurteilung(en). Beim Löschen werden ALLE zugehörigen Beurteilungen unwiderruflich mitgelöscht.\n\nFortfahren?`
        : `Betrieb "${company?.name}" wirklich löschen?`;

    if (!window.confirm(warning)) return;

    await storage.deleteCompany(id);
    await updateUIBasedOnState();
}

// ==========================================
// EINSTELLUNGEN MODAL
// ==========================================

function switchSettingsTab(tabId) {
    const tabMap = {
        'st-tab-psa': 'st-content-psa',
        'st-tab-tpl': 'st-content-tpl',
        'st-tab-backup': 'st-content-backup'
    };
    document.querySelectorAll('.module-tab').forEach(b => b.classList.toggle('active', b.id === tabId));
    Object.entries(tabMap).forEach(([btnId, contentId]) => {
        const el = document.getElementById(contentId);
        if (el) el.style.display = (btnId === tabId) ? 'block' : 'none';
    });
}

function openSettingsModal() { 
    document.getElementById('settings-modal').style.display = 'flex'; 
}

function closeSettingsModal() { 
    document.getElementById('settings-modal').style.display = 'none'; 
}
