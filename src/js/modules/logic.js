/**
 * RiskWerk & GB-Tool – Kernlogik
 * Steuert Formular-Workflows, Risikomatrix, STOP-Prinzip, Multi-Betriebs-Logik, Export & Drucken
 */

import * as storage from './storage.js';
import {
  navigateTo,
  setOnNavigateCallback,
  updateBetriebeGrid,
  updateBottomNavigation
} from './app.js';
import { Icons } from './ui/icons.js';
import { StopInputRow, BulkActionBar } from './ui/components.js';
import { escapeHtml } from './utils.js';

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

// Selektions-State
let selectedAssessmentIds = new Set();

// ==========================================
// INITIALISIERUNG
// ==========================================

export async function initializeLogic() {
    psaHazardData = await storage.getPsaCatalog();

    setupEventDelegation();
    setOnNavigateCallback(updateUIBasedOnState);
    await updateUIBasedOnState();
}

function switchMobileTab(tab) {
    if (window.innerWidth > 1280) return;

    const panelId = tab === 'table' || tab === 'nav-workspace-table' ? 'table' : 'create';
    const activeNavId = tab === 'table' || tab === 'nav-workspace-table' ? 'nav-workspace-table' : 'nav-workspace-create';

    document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.panel === panelId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateBottomNavigation(activeNavId, assessmentList.length);
}

async function updateUIBasedOnState() {
    const params = new URLSearchParams(window.location.search);
    
    companiesList = await storage.getAllCompanies();

    const exportBtn = document.getElementById('btn-export');
    const exportBtnMobile = document.getElementById('btn-export-mobile');
    const printBtn = document.getElementById('btn-print');
    const printBtnMobile = document.getElementById('btn-print-mobile');
    const quickSelect = document.getElementById('company-quick-select');
    const companyInfoBar = document.getElementById('company-info-bar');

    if (document.getElementById('betriebe-grid')) {
        if (companyInfoBar) companyInfoBar.classList.add('hidden');
        if (exportBtn) exportBtn.classList.add('hidden');
        if (exportBtnMobile) exportBtnMobile.classList.add('hidden');
        if (printBtn) printBtn.classList.add('hidden');
        if (printBtnMobile) printBtnMobile.classList.add('hidden');
        if (quickSelect) quickSelect.classList.add('hidden');

        await loadAndRenderCompanies();
    }

    if (document.getElementById('gb-workspace')) {
        const companyIdParam = params.get('companyId');
        activeCompanyId = companyIdParam ? parseInt(companyIdParam) : null;
        activeCompany = companiesList.find(c => c.id === activeCompanyId);

        if (!activeCompany) {
            navigateTo('betriebe');
            return;
        }

        renderCompanyState();
        renderQuickCompanySelect();

        if (exportBtn) exportBtn.classList.remove('hidden');
        if (exportBtnMobile) exportBtnMobile.classList.remove('hidden');
        if (printBtn) printBtn.classList.remove('hidden');
        if (printBtnMobile) printBtnMobile.classList.remove('hidden');

        assessmentList = await storage.getGbsByCompany(activeCompanyId);

        resetStopFields();
        updateDualMatrix();
        applyCurrentSort();
        renderTable();
        showStep(currentStep);

        // Mobile Auto-Focus: Wenn bereits Einträge da sind, zeige die Liste
        if (window.innerWidth <= 1280 && assessmentList.length > 0 && editingRecordId === null) {
            switchMobileTab('table');
        } else {
            switchMobileTab('create');
        }
    }
}

function renderQuickCompanySelect() {
    const select = document.getElementById('company-quick-select');
    if (!select) return;

    select.innerHTML = companiesList.map(c => `
        <option value="${c.id}" ${c.id === activeCompanyId ? 'selected' : ''}>${escapeHtml(c.name)}</option>
    `).join('');
    select.classList.remove('hidden');
}

function updateSortIcons() {
    document.querySelectorAll('th.sortable').forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if(!icon) return;
        if (currentSort.key === th.getAttribute('data-sort')) { 
            icon.innerHTML = currentSort.dir === 'asc' ? Icons.arrowUp : Icons.arrowDown;
            icon.style.color = 'var(--primary)'; 
        } else { 
            icon.innerHTML = Icons.chevronsUpDown;
            icon.style.color = '#cbd5e1'; 
        }
    });
}

// ==========================================
// EVENT DELEGATION HUB
// ==========================================

function setupEventDelegation() {
    document.addEventListener('click', async (e) => {
        
        // Navigation & Globale Aktionen
        if (e.target.closest('#btn-goto-betriebe') || e.target.closest('#btn-close-workspace')) navigateTo('betriebe');
        if (e.target.closest('#btn-export') || e.target.closest('#btn-export-mobile')) exportCompanyToCSV();
        if (e.target.closest('#btn-print') || e.target.closest('#btn-print-mobile')) window.print();

        // Betriebe Verwaltung
        if (e.target.closest('#btn-edit-company')) {
            if(activeCompanyId) openCompanyModal(activeCompanyId);
        }
        if (e.target.closest('#btn-new-betrieb') || e.target.closest('#btn-new-betrieb-empty')) openCompanyModal();
        
        if (e.target.closest('.btn-open-betrieb')) {
            const btn = e.target.closest('.btn-open-betrieb');
            window.location.search = `?action=workspace&companyId=${btn.dataset.id}`;
        }
        
        if (e.target.closest('.btn-edit-betrieb')) {
            openCompanyModal(Number(e.target.closest('.btn-edit-betrieb').id.replace('edit-', '')));
        }
        if (e.target.closest('.btn-delete-betrieb')) {
            await deleteCompanyHandler(Number(e.target.closest('.btn-delete-betrieb').id.replace('delete-', '')));
        }
        if (e.target.closest('#btn-close-betrieb-top') || e.target.closest('#btn-close-betrieb-bottom')) {
            closeCompanyModal();
        }

        // Wizard & Formular Steuerung
        if (e.target.closest('#btn-next')) {
            if (validateCurrentStep()) { currentStep++; showStep(currentStep); }
        }
        if (e.target.closest('#btn-prev')) {
            currentStep--; showStep(currentStep);
        }
        if (e.target.closest('#btn-cancel-edit')) cancelEditMode();

        // STOP-Prinzip
        if (e.target.closest('.btn-add-small')) {
            const btn = e.target.closest('.btn-add-small');
            addStopRow(btn.dataset.stop, btn.dataset.placeholder);
        }
        if (e.target.closest('.btn-remove')) {
            removeStopRow(e.target.closest('.btn-remove'));
        }

        // PSA Modal
        if (e.target.closest('#btn-open-psa')) openPsaModal();
        if (e.target.closest('#btn-close-psa-top') || e.target.closest('#btn-close-psa-bottom')) closePsaModal();
        if (e.target.closest('#btn-apply-psa')) applyPsaModalSelection();

        // Tabelle & Datensätze
        if (e.target.closest('th.sortable')) {
            sortTable(e.target.closest('th.sortable').dataset.sort);
        }
        if (e.target.closest('.row-checkbox')) {
            const cb = e.target.closest('.row-checkbox');
            const id = Number(cb.dataset.id);
            if (cb.checked) selectedAssessmentIds.add(id);
            else selectedAssessmentIds.delete(id);
            renderBulkBar();
        }
        if (e.target.closest('#select-all-rows')) {
            const masterCb = e.target.closest('#select-all-rows');
            const allCbs = document.querySelectorAll('.row-checkbox');
            allCbs.forEach(cb => {
                cb.checked = masterCb.checked;
                const id = Number(cb.dataset.id);
                if (masterCb.checked) selectedAssessmentIds.add(id);
                else selectedAssessmentIds.delete(id);
            });
            renderBulkBar();
        }
        if (e.target.closest('#btn-bulk-cancel')) {
            selectedAssessmentIds.clear();
            const masterCb = document.getElementById('select-all-rows');
            if (masterCb) masterCb.checked = false;
            document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
            renderBulkBar();
        }
        if (e.target.closest('#btn-bulk-print')) {
            printSelection();
        }
        if (e.target.closest('#btn-bulk-export')) {
            exportCompanyToCSV(true);
        }
        if (e.target.closest('.btn-icon.edit')) {
            editRecord(Number(e.target.closest('tr').dataset.id));
        }
        if (e.target.closest('.btn-icon.delete')) {
            await deleteRecord(Number(e.target.closest('tr').dataset.id));
        }

        // Mobile Nav (Bottom Bar)
        if (e.target.closest('#nav-betriebe')) navigateTo('betriebe');
        if (e.target.closest('#nav-workspace-table')) switchMobileTab('table');
        if (e.target.closest('#nav-workspace-create')) switchMobileTab('create');

        if (e.target.closest('#nav-plus')) {
            const params = new URLSearchParams(window.location.search);
            const isWorkspace = params.has('companyId') && document.getElementById('gb-workspace');

            if (isWorkspace) {
                // Im Workspace: Fokus auf neue Gefährdung
                currentStep = 1;
                showStep(currentStep);
                switchMobileTab('create');
                const tInput = document.getElementById('taetigkeit');
                if (tInput) tInput.focus();
            } else {
                // In Betriebe oder wenn Workspace noch nicht da: Neuer Betrieb
                openCompanyModal();
            }
        }
        if (e.target.closest('#nav-settings')) document.getElementById('settings-modal').showModal();

        // Mobile Tab Navigation (im Workspace)
        if (e.target.closest('.mobile-tab')) {
            const tabBtn = e.target.closest('.mobile-tab');
            const tab = tabBtn.dataset.tab;
            
            // Wenn der User unten auf dem Handy "Einstellungen" tippt,
            // simulieren wir einen Klick auf den Button oben rechts im Header
            if (tab === 'settings') {
                const settingsBtn = document.getElementById('open-settings-btn');
                if(settingsBtn) settingsBtn.click();
            } else {
                switchMobileTab(tab);
            }
        }
    });

    document.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (e.target.id === 'gb-form') await saveAssessmentRecord();
        if (e.target.id === 'betrieb-form') await saveCompanyForm();
    });

    document.addEventListener('input', (e) => {
        if (['s-vor', 'w-vor', 's-nach', 'w-nach'].includes(e.target.id)) updateDualMatrix();
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'company-quick-select') {
            window.location.search = `?action=workspace&companyId=${e.target.value}`;
        }
        if (e.target.id === 'frist-typ') {
            const di = document.getElementById('frist-datum');
            if (e.target.value === 'datum') { di.classList.remove('hidden'); di.required = true; }
            else { di.classList.add('hidden'); di.required = false; di.value = ''; }
        }
    });
}

// ==========================================
// EXPORT PRO BETRIEB (EXCEL / CSV)
// ==========================================

function exportCompanyToCSV(onlySelected = false) {
    if (!activeCompany) return;

    const sanitize = (text) => `"${(text || '').toString().replace(/"/g, '""')}"`;
    let csvContent = '\uFEFF'; 

    csvContent += `GEFÄHRDUNGSBEURTEILUNG - ${activeCompany.name.toUpperCase()}\n`;
    csvContent += `Standort / Anschrift:;${sanitize(activeCompany.anschrift)}\n`;
    csvContent += `Geprüft durch:;${sanitize(activeCompany.auditor)}\n`;
    csvContent += `Angelegt am:;${formatDate(activeCompany.createdAt)}\n`;
    csvContent += `Export-Datum:;${new Date().toLocaleDateString('de-DE')}\n\n`;

    const headers = [
        'Bereich', 'Tätigkeit', 'Gefährdungsfaktor', 
        'S (vor)', 'W (vor)', 'Risiko (vor)', 
        'STOP-S', 'STOP-T', 'STOP-O', 'STOP-P', 'PSA', 'PSA weiterhin erforderlich',
        'S (nach)', 'W (nach)', 'Restrisiko (nach)', 
        'Verantwortlich', 'Frist'
    ];
    csvContent += headers.map(h => sanitize(h)).join(';') + '\n';

    const itemsToExport = onlySelected
        ? assessmentList.filter(a => selectedAssessmentIds.has(a.id))
        : assessmentList;

    itemsToExport.forEach(item => {
        const riskVor = riskMatrix[`${item.sVor}-${item.wVor}`]?.level || '-';
        const riskNach = riskMatrix[`${item.sNach}-${item.wNach}`]?.level || '-';

        const row = [
            item.bereich || 'Allgemein',
            item.taetigkeit,
            item.gefaehrdung,
            item.sVor, item.wVor, riskVor,
            (item.stopS || '').replace(/\|/g, ' / '),
            (item.stopT || '').replace(/\|/g, ' / '),
            (item.stopO || '').replace(/\|/g, ' / '),
            (item.stopP || '').replace(/\|/g, ' / '),
            (item.psaList || []).join(' / '),
            item.psaStillRequired !== false ? 'Ja' : 'Nein',
            item.sNach, item.wNach, riskNach,
            item.verantwortlich,
            formatFrist(item.frist)
        ];
        csvContent += row.map(cell => sanitize(cell)).join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Gefaehrdungsbeurteilung_${activeCompany.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function printSelection() {
    if (selectedAssessmentIds.size === 0) {
        window.print();
        return;
    }

    // Temporär nicht ausgewählte Zeilen ausblenden
    const rows = document.querySelectorAll('#gb-table tbody tr:not(.group-header-row)');
    const groups = document.querySelectorAll('.group-header-row');

    const hiddenElements = [];

    rows.forEach(row => {
        if (!selectedAssessmentIds.has(Number(row.dataset.id))) {
            row.style.display = 'none';
            hiddenElements.push(row);
        }
    });

    // Gruppen-Header verstecken, wenn keine ihrer Zeilen sichtbar ist
    groups.forEach(group => {
        let next = group.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains('group-header-row')) {
            if (next.style.display !== 'none') {
                hasVisible = true;
                break;
            }
            next = next.nextElementSibling;
        }
        if (!hasVisible) {
            group.style.display = 'none';
            hiddenElements.push(group);
        }
    });

    window.print();

    // Wieder einblenden
    hiddenElements.forEach(el => el.style.display = '');
}

// ==========================================
// COMPANY SETUP & HEADER
// ==========================================

function renderCompanyState() {
    const infoBar = document.getElementById('company-info-bar');
    if (!infoBar || !activeCompany) return;
    
    infoBar.classList.remove('hidden');
    const nameEl = document.getElementById('display-c-name');
    const locEl = document.getElementById('display-c-location');
    const audEl = document.getElementById('display-c-auditor');
    const dateEl = document.getElementById('display-c-date');

    if (nameEl) nameEl.innerText = activeCompany.name;
    if (locEl) locEl.innerText = activeCompany.anschrift || activeCompany.ort || '—';
    if (audEl) audEl.innerText = activeCompany.auditor || '—';
    if (dateEl) dateEl.innerText = formatDate(activeCompany.createdAt);
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
        const gefEl = document.getElementById('gefaehrdung');
        if (gefEl) {
            document.getElementById('step3-current-gefaehrdung').innerText = gefEl.value;
        }
    }

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    
    if(btnPrev) btnPrev.classList.toggle('hidden', step === 1);
    if(btnNext) btnNext.classList.toggle('hidden', step === 3);
    if(btnSubmit) btnSubmit.classList.toggle('hidden', step !== 3);
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

    const vorCell = document.getElementById(`vor-${sVor}-${wVor}`);
    const nachCell = document.getElementById(`nach-${sNach}-${wNach}`);

    if(vorCell) vorCell.classList.add('active');
    if(nachCell) nachCell.classList.add('active');

    // Mobile Feedback: Automatisches Scrollen zur Matrix verhindern, aber visuell hervorheben
}

// ==========================================
// STOP-PRINZIP & FORMULAR
// ==========================================

function addStopRow(letter, placeholder, value = '') {
    const container = document.getElementById(`multi-${letter}`);
    if(!container) return;

    const index = container.children.length + 1;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = StopInputRow({ letter, index, placeholder, value });
    const row = tempDiv.firstElementChild;

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
        companyId: activeCompanyId,
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

    // Nach dem Speichern: Im Erfassungs-Modus bleiben für Speed-Entry
    // Fokus auf Gefährdungs-Select für den nächsten Eintrag (Bereich/Tätigkeit bleiben gleich)
    document.getElementById('gefaehrdung').focus();

    const tableAnchor = document.getElementById('table-anchor');
    if (tableAnchor && window.innerWidth > 768 && window.innerWidth <= 1280) {
        tableAnchor.scrollIntoView({ behavior: 'smooth' });
    }
}

function resetFormAfterSave(keepTaetigkeit, keepBereich) {
    document.getElementById('gb-form').reset();
    document.getElementById('bereich-input').value = keepBereich || '';
    document.getElementById('taetigkeit').value = keepTaetigkeit; 
    currentSelectedPsa = []; 
    document.getElementById('psa-still-required').checked = true; 
    renderStep3PsaPreview();

    // Reset Slider auf Default-Werte
    document.getElementById('s-vor').value = "3";
    document.getElementById('w-vor').value = "2";
    document.getElementById('s-nach').value = "1";
    document.getElementById('w-nach').value = "1";

    document.getElementById('frist-typ').value = 'datum'; 
    document.getElementById('frist-datum').classList.remove('hidden');
    document.getElementById('frist-datum').required = true;
    resetStopFields(); 
    currentStep = 1; 
    showStep(currentStep); 
    updateDualMatrix();
}

function renderBulkBar() {
    const container = document.getElementById('bulk-action-container');
    if (!container) return;
    container.innerHTML = BulkActionBar({
        count: selectedAssessmentIds.size,
        onCancelId: 'btn-bulk-cancel',
        onPrintId: 'btn-bulk-print',
        onExportId: 'btn-bulk-export'
    });
}

function renderTable() {
    const tbody = document.querySelector('#gb-table tbody');
    if(!tbody) return;

    const thead = document.querySelector('#gb-table thead tr');
    if (thead && !thead.querySelector('#select-all-rows')) {
        const th = document.createElement('th');
        th.style.width = '30px';
        th.className = 'no-print';
        th.innerHTML = `<input type="checkbox" id="select-all-rows">`;
        thead.insertBefore(th, thead.firstChild);
    }

    tbody.innerHTML = '';

    // Badge in der Bottom-Nav aktualisieren
    if (window.innerWidth <= 1280 && document.getElementById('gb-workspace')) {
        const activeNav = document.querySelector('.nav-item.active');
        updateBottomNavigation(activeNav ? activeNav.id : 'nav-workspace-table', assessmentList.length);
    }

    const countBadge = document.getElementById('mobile-tab-count');
    if (countBadge) {
        if (assessmentList.length > 0) {
            countBadge.textContent = assessmentList.length;
            countBadge.classList.remove('hidden');
        } else {
            countBadge.classList.add('hidden');
        }
    }

    const groupMap = {};
    assessmentList.forEach(item => {
        const bName = item.bereich || '';
        const tName = item.taetigkeit || 'Ohne Zuordnung';
        const groupKey = `${bName}:::${tName}`;
        if (!groupMap[groupKey]) groupMap[groupKey] = [];
        groupMap[groupKey].push(item);
    });

    const groups = Object.keys(groupMap);
    if (currentSort.key === 'taetigkeit') {
        groups.sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1) * (currentSort.dir === 'asc' ? 1 : -1));
    }

    groups.forEach(groupKey => {
        const [bereich, taetigkeit] = groupKey.split(':::');
        const displayTitle = bereich
            ? `${escapeHtml(bereich)} <span style="margin: 0 4px; color: #94a3b8;">${Icons.arrowRight}</span> ${escapeHtml(taetigkeit)}`
            : escapeHtml(taetigkeit);

        const trGroup = document.createElement('tr');
        trGroup.className = 'group-header-row';
        trGroup.innerHTML = `<td colspan="9"><div style="display:flex; justify-content: space-between; align-items: center;"><span class="group-title">${Icons.folder} <span style="color: var(--primary);">${displayTitle}</span></span><span style="font-size: 11px; font-weight: normal; color: #64748b;">${groupMap[groupKey].length} Gefährdung(en)</span></div></td>`;
        tbody.appendChild(trGroup);

        groupMap[groupKey].forEach(item => {
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
                psaColHtml = item.psaList.map(p => `<span class="psa-cell-badge">${Icons.shield} ${escapeHtml(p)}</span>`).join('');
                const isReq = item.psaStillRequired !== false;
                psaColHtml += `<div style="font-size: 11px; margin-top: 4px; color: ${isReq ? '#db2777' : '#64748b'};">Nach Maßnahmen: ${isReq ? '<strong>Erforderlich</strong>' : '<span style="color:#64748b;">Entbehrlich</span>'}</div>`;
            }

            const tr = document.createElement('tr');
            tr.dataset.id = item.id;
            if(item.id === highlightRecordId) tr.classList.add('highlight-record');
            const isSelected = selectedAssessmentIds.has(item.id);

            tr.innerHTML = `
                <td class="no-print"><input type="checkbox" class="row-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''}></td>
                <td class="no-print drag-cell"><div class="drag-handle">${Icons.menu}</div></td>
                <td data-label="Tätigkeit" style="font-weight: 600; font-size: 12px; color: #475569;">${escapeHtml(item.taetigkeit)}</td>
                <td data-label="Gefahr"><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #334155;">${escapeHtml(item.gefaehrdung)}</span></td>
                <td data-label="Risiko"><div><span class="badge ${riskVor.class}">${riskVor.level}</span><span class="risk-arrow">${Icons.arrowRight}</span><span class="badge ${riskNach.class}">${riskNach.level}</span></div></td>
                <td data-label="Maßnahmen (STOP)">${stopHtml}</td>
                <td data-label="PSA / Schutzausrüstung">${psaColHtml}</td>
                <td data-label="Verantw.">${escapeHtml(item.verantwortlich)}</td>
                <td data-label="Frist"><div class="frist-container"><div class="status-dot ${getFristColor(item.frist)}"></div>${formatFrist(item.frist)}</div></td>
                <td class="no-print action-td">
                    <div class="action-cell">
                        <button type="button" class="btn-icon edit" title="Bearbeiten">${Icons.edit}</button>
                        <button type="button" class="btn-icon delete" title="Löschen">${Icons.trash}</button>
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
    if (items.length === 1) return escapeHtml(items[0]); 
    return `<ol>${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ol>`;
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
    if (validIntervals.includes(val)) return val; 
    const diffDays = Math.ceil((new Date(val).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 'dot-red' : (diffDays <= 7 ? 'dot-yellow' : 'dot-green');                    
}

function updateDatalist() {
    const tList = document.getElementById('taetigkeit-list');
    const bList = document.getElementById('bereich-list');
    if(tList) {
        const uniqueT = [...new Set(assessmentList.map(i => i.taetigkeit).filter(Boolean))];
        tList.innerHTML = uniqueT.map(t => `<option value="${escapeHtml(t)}">`).join('');
    }
    if(bList) {
        const uniqueB = [...new Set(assessmentList.map(i => i.bereich).filter(Boolean))];
        bList.innerHTML = uniqueB.map(b => `<option value="${escapeHtml(b)}">`).join('');
    }
}

// ==========================================
// ACTIONS (Delete, Edit, Sort)
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
    document.getElementById('edit-mode-banner').classList.remove('hidden');
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
        document.getElementById('frist-typ').value = fristVal; document.getElementById('frist-datum').classList.add('hidden'); document.getElementById('frist-datum').required = false; document.getElementById('frist-datum').value = '';
    } else {
        document.getElementById('frist-typ').value = 'datum'; document.getElementById('frist-datum').classList.remove('hidden'); document.getElementById('frist-datum').required = true; document.getElementById('frist-datum').value = fristVal;
    }
    currentStep = 1; showStep(currentStep);
    switchMobileTab('create');
    document.getElementById('gb-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelEditMode() {
    editingRecordId = null;
    document.getElementById('edit-mode-banner').classList.add('hidden');
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

// ==========================================
// PSA MODAL
// ==========================================

function openPsaModal() { 
    renderModalPsaList(); 
    document.getElementById('psa-modal').classList.remove('hidden');
}

function closePsaModal() { 
    document.getElementById('psa-modal').classList.add('hidden');
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
                    <input type="checkbox" value="${escapeHtml(badgeText)}" ${isChecked ? 'checked' : ''} class="psa-checkbox">
                    <div>
                        <div style="font-weight: 600; font-size: 13px; color: var(--text-main);">${escapeHtml(item.label)}</div>
                        <div style="font-size: 11.5px; color: var(--text-muted); display:flex; align-items:center; gap:4px;">${Icons.shield} ${escapeHtml(item.psa)} — Ref: ${escapeHtml(item.ref)}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML += html;
    });
    
    container.querySelectorAll('.psa-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            const counter = document.getElementById('modal-selected-counter');
            if (counter) {
                counter.innerText = `${document.querySelectorAll('#modal-psa-list input[type="checkbox"]:checked').length} ausgewählt`;
            }
        });
    });
    const finalCounter = document.getElementById('modal-selected-counter');
    if (finalCounter) {
        finalCounter.innerText = `${document.querySelectorAll('#modal-psa-list input[type="checkbox"]:checked').length} ausgewählt`;
    }
}

function applyPsaModalSelection() {
    currentSelectedPsa = Array.from(document.querySelectorAll('#modal-psa-list input[type="checkbox"]:checked')).map(cb => cb.value);
    renderStep3PsaPreview();
    closePsaModal();
}

function renderStep3PsaPreview() {
    const container = document.getElementById('step3-psa-preview');
    if(!container) return;
    const badge = document.getElementById('psa-badge-count');
    if (badge) {
        badge.innerText = `${currentSelectedPsa.length} gewählt`;
    }
    if (currentSelectedPsa.length === 0) { container.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">Keine PSA ausgewählt</span>`; return; }
    container.innerHTML = currentSelectedPsa.map(p => `<span class="selected-psa-tag">${Icons.shield} ${escapeHtml(p)}</span>`).join('');
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
    companiesList.forEach((c, i) => { c.count = gbCounts[i]; });

    updateBetriebeGrid(companiesList);
}

// renderCompaniesGrid wurde durch updateBetriebeGrid in app.js ersetzt.

function openCompanyModal(id = null) {
    editingCompanyId = id;
    const title = document.getElementById('betrieb-modal-title');
    const nameInput = document.getElementById('betrieb-name');
    const strasseInput = document.getElementById('betrieb-strasse');
    const plzInput = document.getElementById('betrieb-plz');
    const ortInput = document.getElementById('betrieb-ort');
    const kontaktInput = document.getElementById('betrieb-kontakt');
    const telefonInput = document.getElementById('betrieb-telefon');
    const emailInput = document.getElementById('betrieb-email');
    const auditorInput = document.getElementById('betrieb-auditor');

    if (id !== null) {
        const c = companiesList.find(x => x.id === id);
        title.textContent = 'Betrieb bearbeiten';
        nameInput.value = c?.name || '';

        // Populate new fields or fallback to legacy anschrift
        strasseInput.value = c?.strasse || '';
        plzInput.value = c?.plz || '';
        ortInput.value = c?.ort || '';

        // If it's a legacy entry without new fields but has anschrift, maybe pre-fill strasse?
        // For now, we keep it separate to avoid messy splitting.
        if (!c.strasse && !c.plz && !c.ort && c.anschrift) {
            strasseInput.value = c.anschrift;
        }

        kontaktInput.value = c?.kontakt || '';
        telefonInput.value = c?.telefon || '';
        emailInput.value = c?.email || '';
        if(auditorInput) auditorInput.value = c?.auditor || '';
    } else {
        title.textContent = 'Neuer Betrieb';
        nameInput.value = '';
        strasseInput.value = '';
        plzInput.value = '';
        ortInput.value = '';
        kontaktInput.value = '';
        telefonInput.value = '';
        emailInput.value = '';

        // Pre-fill from Auditor Profile
        const uiSettings = storage.loadUISettings();
        if (auditorInput && uiSettings.auditorProfile) {
            const p = uiSettings.auditorProfile;
            auditorInput.value = [p.name, p.role].filter(Boolean).join(', ');
        } else if (auditorInput) {
            auditorInput.value = '';
        }
    }

    const modal = document.getElementById('betrieb-modal');
    if (modal) modal.classList.remove('hidden');
    if (nameInput) nameInput.focus();
}

function closeCompanyModal() {
    const modal = document.getElementById('betrieb-modal');
    if (modal) modal.classList.add('hidden');
    editingCompanyId = null;
}

async function saveCompanyForm() {
    const name = document.getElementById('betrieb-name').value.trim();
    const strasse = document.getElementById('betrieb-strasse').value.trim();
    const plz = document.getElementById('betrieb-plz').value.trim();
    const ort = document.getElementById('betrieb-ort').value.trim();
    const kontakt = document.getElementById('betrieb-kontakt').value.trim();
    const telefon = document.getElementById('betrieb-telefon').value.trim();
    const email = document.getElementById('betrieb-email').value.trim();
    const auditorInput = document.getElementById('betrieb-auditor');
    const auditor = auditorInput ? auditorInput.value.trim() : '';
    
    if (!name) return;

    const existing = editingCompanyId !== null ? companiesList.find(c => c.id === editingCompanyId) : null;

    const company = {
        id: editingCompanyId !== null ? editingCompanyId : Date.now(),
        name,
        strasse,
        plz,
        ort,
        kontakt,
        telefon,
        email,
        auditor,
        createdAt: existing?.createdAt || new Date().toISOString()
    };

    // If we have legacy data, we keep it just in case, but preferred are the new fields
    if (existing?.anschrift && !strasse && !plz && !ort) {
        company.anschrift = existing.anschrift;
    }

    await storage.saveCompany(company);
    closeCompanyModal();
    
    await updateUIBasedOnState();
}

async function deleteCompanyHandler(id) {
    const company = companiesList.find(c => c.id === id);
    const gbCount = company?.count || 0;

    const warning = gbCount > 0
        ? `Der Betrieb "${company?.name}" enthält ${gbCount} Gefährdungsbeurteilung(en). Beim Löschen werden ALLE zugehörigen Beurteilungen unwiderruflich mitgelöscht.\n\nFortfahren?`
        : `Betrieb "${company?.name}" wirklich löschen?`;

    if (!window.confirm(warning)) return;

    await storage.deleteCompany(id);
    await updateUIBasedOnState();
}
