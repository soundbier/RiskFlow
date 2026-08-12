/**
 * RiskFlow & GB-Tool – Kernlogik
 * Steuert Formular-Workflows, Risikomatrix, STOP-Prinzip und IndexedDB-Anbindung
 */

import * as storage from './storage.js';
import { defaultStandardTemplates } from './storage.js';

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
let companyData = null;
let psaHazardData = [];
let branchTemplates = {};

let currentSelectedPsa = [];
let editingRecordId = null;
let highlightRecordId = null;
let currentSort = { key: 'gefaehrdung', dir: 'asc' };
let currentStep = 1;

// ==========================================
// INITIALISIERUNG
// ==========================================

export async function initializeLogic() {
    // Daten aus IndexedDB laden
    assessmentList = await storage.getAllAssessments();
    companyData = await storage.getCompanyData();
    psaHazardData = await storage.getPsaCatalog();
    branchTemplates = await storage.getBranchTemplates();

    setupEventDelegation();
    updateUIBasedOnState();
}

function updateUIBasedOnState() {
    // Prüfen, ob wir uns im Setup oder Workspace befinden
    if (document.getElementById('company-info-bar')) {
        renderCompanyState();
    }
    if (document.getElementById('gb-workspace')) {
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
        if (e.target.closest('#btn-clear')) await clearAllData();

        // --- Company Setup ---
        if (e.target.closest('#btn-edit-company')) editCompanySetup();

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
    });

    // Form Submits abfangen
    document.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (e.target.id === 'company-form') await saveCompanySetup();
        if (e.target.id === 'gb-form') await saveAssessmentRecord();
    });

    // Change-Events abfangen (Matrix-Updates & Fristen)
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
// COMPANY SETUP
// ==========================================

async function saveCompanySetup() {
    companyData = {
        name: document.getElementById('c-name').value,
        location: document.getElementById('c-location').value,
        auditor: document.getElementById('c-auditor').value,
        date: document.getElementById('c-date').value || new Date().toISOString().split('T')[0],
        nextReview: document.getElementById('c-next-review').value || ''
    };
    await storage.saveCompanyData(companyData);
    
    // Router URL anpassen (App lädt Workspace)
    window.location.search = '?action=workspace';
}

function renderCompanyState() {
    const setupCard = document.getElementById('company-setup-card');
    const infoBar = document.getElementById('company-info-bar');
    
    if (companyData && companyData.name) {
        if(setupCard) setupCard.style.display = 'none';
        if(infoBar) {
            infoBar.style.display = 'flex';
            document.getElementById('display-c-name').innerText = companyData.name;
            document.getElementById('display-c-location').innerText = companyData.location;
            document.getElementById('display-c-auditor').innerText = companyData.auditor || '—';
            document.getElementById('display-c-date').innerText = formatDate(companyData.date);
            document.getElementById('display-c-next-review').innerText = formatDate(companyData.nextReview);
        }
    } else {
        if(setupCard) setupCard.style.display = 'block';
        if(infoBar) infoBar.style.display = 'none';
        if(document.getElementById('c-date')) {
            document.getElementById('c-date').value = new Date().toISOString().split('T')[0];
        }
    }
}

function editCompanySetup() {
    window.location.search = '?action=setup';
    setTimeout(() => {
        if(companyData) {
            document.getElementById('c-name').value = companyData.name;
            document.getElementById('c-location').value = companyData.location;
            document.getElementById('c-auditor').value = companyData.auditor;
            document.getElementById('c-date').value = companyData.date;
            document.getElementById('c-next-review').value = companyData.nextReview;
        }
    }, 100);
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
    
    if(!sVor) return; // Guard clause, falls DOM noch nicht ready

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

    const record = {
        id: editingRecordId !== null ? editingRecordId : Date.now(),
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
    assessmentList = await storage.getAllAssessments();
    highlightRecordId = record.id;
    
    if (editingRecordId !== null) cancelEditMode();
    else resetFormAfterSave(currentTaetigkeit);
    
    applyCurrentSort(); 
    renderTable(); 
    document.getElementById('table-anchor').scrollIntoView({ behavior: 'smooth' });
}

function resetFormAfterSave(keepTaetigkeit) {
    document.getElementById('gb-form').reset();
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

    const groupMap = {};
    assessmentList.forEach(item => {
        const tName = item.taetigkeit || 'Ohne Zuordnung';
        if (!groupMap[tName]) groupMap[tName] = [];
        groupMap[tName].push(item);
    });

    const groups = Object.keys(groupMap);
    if (currentSort.key === 'taetigkeit') groups.sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1) * (currentSort.dir === 'asc' ? 1 : -1));

    groups.forEach(groupName => {
        const trGroup = document.createElement('tr');
        trGroup.className = 'group-header-row';
        trGroup.innerHTML = `<td colspan="9"><div style="display:flex; justify-content: space-between; align-items: center;"><span class="group-title">📂 Arbeitsplatz / Tätigkeit: <span style="color: var(--primary);">${groupName}</span></span><span style="font-size: 11px; font-weight: normal; color: #64748b;">${groupMap[groupName].length} Gefährdung(en)</span></div></td>`;
        tbody.appendChild(trGroup);

        groupMap[groupName].forEach(item => {
            const riskVor = riskMatrix[`${item.sVor}-${item.wVor}`];
            const riskNach = riskMatrix[`${item.sNach}-${item.wNach}`];
            
            // Render STOP Logic
            let stopHtml = `<div class="table-stop-display">`;
            ['S','T','O','P'].forEach(l => { 
                if(item[`stop${l}`]) stopHtml += `<div class="table-stop-row"><div class="table-stop-indicator ${l.toLowerCase()}">${l}</div> <div class="table-stop-text">${renderStopList(item[`stop${l}`])}</div></div>`; 
            });
            stopHtml += `</div>`;
            if(!item.stopS && !item.stopT && !item.stopO && !item.stopP) stopHtml = `<span style="color:#94a3b8; font-style:italic;">Keine Maßnahmen</span>`;

            // Render PSA Logic
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
    const datalist = document.getElementById('taetigkeit-list');
    if(!datalist) return;
    const unique = [...new Set(assessmentList.map(i => i.taetigkeit).filter(Boolean))];
    datalist.innerHTML = unique.map(t => `<option value="${t}">`).join('');
}

// ==========================================
// ACTIONS (Delete, Edit, Sort, Templates)
// ==========================================

async function deleteRecord(id) { 
    if(confirm("Diesen Eintrag wirklich löschen?")) {
        await storage.deleteAssessment(id);
        assessmentList = await storage.getAllAssessments();
        if(editingRecordId === id) cancelEditMode();
        renderTable(); 
    }
}

async function clearAllData() { 
    if(confirm("Alle Gefährdungen UND die Betriebsdaten komplett löschen?")) { 
        await storage.clearAllAssessments();
        await storage.clearCompanyData();
        assessmentList = []; 
        companyData = null; 
        cancelEditMode(); 
        window.location.search = '?action=setup';
    } 
}

function editRecord(id) {
    const record = assessmentList.find(r => r.id === id);
    if (!record) return;
    editingRecordId = record.id;
    document.getElementById('edit-mode-banner').style.display = 'flex';
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
    currentStep = 1; showStep(currentStep); document.getElementById('gb-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelEditMode() {
    editingRecordId = null;
    document.getElementById('edit-mode-banner').style.display = 'none';
    const currentTaetigkeit = document.getElementById('taetigkeit').value;
    resetFormAfterSave(currentTaetigkeit);
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

function updateSortIcons() {
    document.querySelectorAll('th.sortable').forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if(!icon) return;
        if (currentSort.key === th.getAttribute('data-sort')) { icon.innerHTML = currentSort.dir === 'asc' ? '↑' : '↓'; icon.style.color = 'var(--primary)'; } 
        else { icon.innerHTML = '↕'; icon.style.color = '#cbd5e1'; }
    });
}

async function loadTemplate(type) {
    const combinedTemplates = [...defaultStandardTemplates, ...(branchTemplates[type] || [])];
    const newRecords = combinedTemplates.map(t => ({ ...t, id: Date.now() + Math.floor(Math.random() * 1000) }));
    await storage.saveMultipleAssessments(newRecords);
    assessmentList = await storage.getAllAssessments();
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
    
    // Counter live update
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
// EINSTELLUNGEN MODAL
// ==========================================

function openSettingsModal() { 
    document.getElementById('settings-modal').style.display = 'flex'; 
}

function closeSettingsModal() { 
    document.getElementById('settings-modal').style.display = 'none'; 
}
