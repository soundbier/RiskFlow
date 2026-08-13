/**
 * RiskFlow & GB-Tool Storage Module
 * Asynchrone IndexedDB-Verwaltung für Gefährdungsbeurteilungen und Einstellungen
 */

import { openDB } from 'idb';

const DB_NAME = 'riskflow-db';
const DB_VERSION = 3; // Upgrade auf Version 3 für Multi-Betrieb-Struktur

let db;

// --- Standard-Daten (Werden beim ersten Start in die DB geschrieben) ---

const defaultPsaHazardData = [
    { letter: 'A', group: 'Mechanische Gefährdungen', items: [{ id: 'mech_kopf', label: 'Stoß, Schlag, herabfallende Gegenstände', psa: 'Kopfschutz', ref: 'DGUV Regel 112-193' }, { id: 'mech_schnitt', label: 'Schnittverletzungen', psa: 'Schnittschutzhandschuhe', ref: 'DGUV Regel 112-195' }, { id: 'mech_quetsch', label: 'Quetsch-/Einzugstellen', psa: 'Schutzhandschuhe', ref: 'DGUV Regel 112-195' }, { id: 'mech_stich', label: 'Stichverletzungen', psa: 'Stechschutzkleidung', ref: 'DGUV Regel 112-196' }, { id: 'mech_fuss_tritt', label: 'Fallende/rollende Gegenstände', psa: 'Sicherheitsschuhe', ref: 'DGUV Regel 112-191' }, { id: 'mech_fuss_rutsch', label: 'Rutschgefahr', psa: 'Sicherheitsschuhe SRC', ref: 'DGUV Regel 112-191' }, { id: 'mech_auge', label: 'Splitter, Späne', psa: 'Augenschutz', ref: 'DGUV Regel 112-192' }, { id: 'mech_absturz', label: 'Absturz aus Höhe', psa: 'PSA gegen Absturz', ref: 'DGUV Regel 112-198' }] },
    { letter: 'B', group: 'Elektrische Gefährdungen', items: [{ id: 'elektro_kontakt', label: 'Stromschlag', psa: 'Isolierende Ausrüstung', ref: 'DGUV Regel 112-195' }, { id: 'elektro_lichtbogen', label: 'Störlichtbogen', psa: 'PSAgS', ref: 'DGUV Info 203-077' }, { id: 'elektro_esd', label: 'Elektrostatik', psa: 'Ableitfähige Schuhe', ref: 'DGUV Regel 112-191' }] },
    { letter: 'C', group: 'Thermische Gefährdungen', items: [{ id: 'thermo_kontakt', label: 'Heiße Oberflächen', psa: 'Hitzeschutz', ref: 'DGUV Info 212-013' }, { id: 'thermo_schweiss', label: 'Schweißen', psa: 'Schweißerschutz', ref: 'DGUV Regel 112-192' }, { id: 'thermo_kaelte', label: 'Kälte', psa: 'Kälteschutz', ref: 'DGUV Regel 112-189' }] },
    { letter: 'D', group: 'Chemische Gefährdungen', items: [{ id: 'chem_haut', label: 'Reizend/Ätzend', psa: 'Chemikalienschutzhandschuhe', ref: 'DGUV Info 212-007' }, { id: 'chem_auge', label: 'Chemikalienspritzer', ref: 'DGUV Regel 112-192', psa: 'Korbbrille' }, { id: 'chem_partikel', label: 'Stäube/Partikel', psa: 'Partikelfilter', ref: 'DGUV Regel 112-190' }, { id: 'chem_gase', label: 'Gase/Dämpfe', psa: 'Gasfilter', ref: 'DGUV Regel 112-190' }] },
    { letter: 'E', group: 'Biologische Gefährdungen', items: [{ id: 'bio_haut', label: 'Hautkontakt', psa: 'Schutzhandschuhe Bio', ref: 'DGUV Regel 112-195' }, { id: 'bio_aerosol', label: 'Aerosole', psa: 'Atemschutz', ref: 'DGUV Regel 112-190' }, { id: 'bio_stich', label: 'Schnitt/Stich', psa: 'Durchstichsichere Handschuhe', ref: 'DGUV Regel 112-195' }] },
    { letter: 'F', group: 'Physikalische Gefährdungen', items: [{ id: 'phys_laerm', label: 'Lärm', psa: 'Gehörschutz', ref: 'DGUV Regel 112-194' }, { id: 'phys_strahlung', label: 'Optische Strahlung', psa: 'Augenschutz Filter', ref: 'DGUV Regel 112-192' }, { id: 'phys_warn', label: 'Geringe Sichtbarkeit', psa: 'Warnkleidung', ref: 'DGUV Info 212-016' }] },
    { letter: 'G', group: 'Sonstige Gefährdungen', items: [{ id: 'sonst_ertrinken', label: 'Ertrinken', psa: 'PSA gegen Ertrinken', ref: 'DGUV Regel 112-201' }, { id: 'sonst_erstickung', label: 'Sauerstoffmangel', psa: 'Umluftunabh. Atemschutz', ref: 'DGUV Regel 112-190' }] }
];

export const defaultStandardTemplates = [
    { taetigkeit: "Brandschutz", gefaehrdung: "Brand und Explosionsgefährdungen", sVor: "3", wVor: "1", sNach: "2", wNach: "1", stopS: "", stopT: "Rauchmelder|Feuerlöscher", stopO: "Brandschutzordnung", stopP: "", psaList: [], psaStillRequired: false, verantwortlich: "Arbeitgeber", frist: "Jährlich" },
    { taetigkeit: "Erste Hilfe", gefaehrdung: "Gefährdungen durch Arbeitsumgebungsbedingungen", sVor: "3", wVor: "1", sNach: "1", wNach: "1", stopS: "", stopT: "Verbandkasten", stopO: "Ersthelfer benennen", stopP: "", psaList: [], psaStillRequired: false, verantwortlich: "Arbeitgeber", frist: "Jährlich" }
];

const defaultTemplates = {
    spielhalle: [{ taetigkeit: "Kassenführung", gefaehrdung: "Sonstige Gefährdungen", sVor: "3", wVor: "2", sNach: "3", wNach: "1", stopS: "Bargeld minimieren", stopT: "Notrufknopf", stopO: "Deeskalationstraining", stopP: "", psaList: [], psaStillRequired: false, verantwortlich: "Filialleitung", frist: "Täglich" }],
    fitnessstudio: [{ taetigkeit: "Wartung Kraftgeräte", gefaehrdung: "Mechanische Gefährdungen", sVor: "2", wVor: "3", sNach: "2", wNach: "1", stopS: "", stopT: "Klemmschutz", stopO: "Sichtprüfung", stopP: "", psaList: ["Schutzhandschuhe (DGUV Regel 112-195)"], psaStillRequired: true, verantwortlich: "Technik", frist: "Wöchentlich" }],
    schwimmbad: [{ taetigkeit: "Chlorgasraum", gefaehrdung: "Gefahrstoffe", sVor: "3", wVor: "2", sNach: "3", wNach: "1", stopS: "Elektrolyse", stopT: "Warnanlage", stopO: "2-Personen-Regel", stopP: "", psaList: ["Atemschutz (DGUV Regel 112-190)"], psaStillRequired: true, verantwortlich: "Schwimmmeister", frist: "Monatlich" }],
    buero: [{ taetigkeit: "Bildschirmarbeit", gefaehrdung: "Physische Belastung/Arbeitsschwere", sVor: "2", wVor: "3", sNach: "1", wNach: "1", stopS: "Abwechslung", stopT: "Ergo-Stuhl", stopO: "Pausen", stopP: "", psaList: [], psaStillRequired: false, verantwortlich: "Büroleitung", frist: "Jährlich" }],
    gebaeudereinigung: [{ taetigkeit: "Unterhaltsreinigung", gefaehrdung: "Gefahrstoffe", sVor: "2", wVor: "3", sNach: "1", wNach: "1", stopS: "Milde Reiniger", stopT: "Dosieranlagen", stopO: "Hautschutzplan", stopP: "", psaList: ["Chemikalienschutzhandschuhe (DGUV Info 212-007)"], psaStillRequired: true, verantwortlich: "Objektleitung", frist: "Täglich" }],
    itunternehmen: [{ taetigkeit: "Serverwartung", gefaehrdung: "Elektrische Gefährdungen", sVor: "3", wVor: "2", sNach: "2", wNach: "1", stopS: "", stopT: "Serverracks", stopO: "Freischalten", stopP: "", psaList: ["Isolierende Ausrüstung (DGUV Regel 112-195)"], psaStillRequired: true, verantwortlich: "IT", frist: "Jährlich" }],
    einzelhandel: [{ taetigkeit: "Warenverräumung", gefaehrdung: "Physische Belastung/Arbeitsschwere", sVor: "2", wVor: "3", sNach: "1", wNach: "1", stopS: "Rollcontainer", stopT: "Hubwagen", stopO: "Hebetechnik", stopP: "", psaList: ["Sicherheitsschuhe (DGUV Regel 112-191)"], psaStillRequired: true, verantwortlich: "Lagerleitung", frist: "Laufend" }]
};

// --- Initialisierung ---

export async function initializeStorage() {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, tx) {
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('assessments')) db.deleteObjectStore('assessments');
        if (db.objectStoreNames.contains('settings')) db.deleteObjectStore('settings');
      }

      if (!db.objectStoreNames.contains('assessments')) {
        const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id' });
        assessmentStore.createIndex('taetigkeit', 'taetigkeit');
        assessmentStore.createIndex('gefaehrdung', 'gefaehrdung');
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Version 3 Upgrade: Multi-Betrieb-Struktur
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains('companies')) {
          db.createObjectStore('companies', { keyPath: 'id' });
        }
        
        // Füge den companyId-Index zu den bestehenden Gefährdungen hinzu
        const assessmentStore = tx.objectStore('assessments');
        if (!assessmentStore.indexNames.contains('companyId')) {
          assessmentStore.createIndex('companyId', 'companyId');
        }
      }
    }
  });
  
  await seedInitialSettings();
  await migrateV2ToV3(); // Automatische Daten-Migration
  
  return db;
}

async function seedInitialSettings() {
  const psaCatalog = await getSetting('psaCatalog');
  if (!psaCatalog) await saveSetting('psaCatalog', defaultPsaHazardData);
  
  const templates = await getSetting('branchTemplates');
  if (!templates) await saveSetting('branchTemplates', defaultTemplates);
}

async function migrateV2ToV3() {
  const oldCompanyData = await getCompanyData();
  
  // Wenn noch alte, globale Betriebsdaten existieren, wandeln wir sie in einen echten "Betrieb" um
  if (oldCompanyData) {
    console.log('🔄 Starte Migration auf Multi-Betrieb-Struktur...');
    
    const defaultCompany = {
      id: Date.now(),
      name: oldCompanyData.name || 'Standard Betrieb',
      anschrift: oldCompanyData.location || '',
      auditor: oldCompanyData.auditor || '',
      createdAt: oldCompanyData.date || new Date().toISOString()
    };
    
    await saveCompany(defaultCompany);

    // Alle bisherigen Gefährdungen abrufen und dem neuen Betrieb zuordnen
    const allAssessments = await db.getAll('assessments');
    const tx = db.transaction('assessments', 'readwrite');
    for (const g of allAssessments) {
      if (!g.companyId) {
        g.companyId = defaultCompany.id;
        tx.store.put(g);
      }
    }
    await tx.done;
    
    // Altes Setup löschen, damit die Migration nicht beim nächsten Start erneut läuft
    await clearCompanyData();
    console.log('✅ Migration abgeschlossen.');
  }
}

// --- Betriebe (Companies) Funktionen ---

export async function getAllCompanies() {
  return await db.getAll('companies');
}

export async function saveCompany(company) {
  return await db.put('companies', company);
}

export async function deleteCompany(id) {
  // Löscht den Betrieb UND kaskadierend alle zugehörigen Gefährdungsbeurteilungen
  const tx = db.transaction(['companies', 'assessments'], 'readwrite');
  
  // Betrieb löschen
  tx.objectStore('companies').delete(id);
  
  // Verknüpfte Gefährdungen löschen
  const index = tx.objectStore('assessments').index('companyId');
  let cursor = await index.openCursor(id);
  while (cursor) {
    cursor.delete();
    cursor = await cursor.continue();
  }
  
  await tx.done;
}

export async function getGbsByCompany(companyId) {
  // Holt alle Gefährdungen, die zu einer bestimmten Betriebs-ID gehören
  return await db.getAllFromIndex('assessments', 'companyId', companyId);
}

// --- Assessment (Gefährdungsbeurteilungen) Funktionen ---

export async function getAllAssessments() {
  return await db.getAll('assessments');
}

export async function saveAssessment(assessment) {
  return await db.put('assessments', assessment);
}

export async function deleteAssessment(id) {
  return await db.delete('assessments', id);
}

export async function clearAllAssessments() {
  return await db.clear('assessments');
}

export async function saveMultipleAssessments(assessments) {
  const tx = db.transaction('assessments', 'readwrite');
  for (const item of assessments) {
    tx.store.put(item);
  }
  await tx.done;
}

// --- Settings Funktionen (Für PSA-Katalog & Templates) ---

export async function getSetting(key) {
  return await db.get('settings', key);
}

export async function saveSetting(key, value) {
  return await db.put('settings', { key, value });
}

// Veraltete Funktionen (werden noch für die Migration oder Backups gebraucht)
export async function getCompanyData() {
  const data = await getSetting('companyData');
  return data ? data.value : null;
}

export async function saveCompanyData(companyData) {
  return await saveSetting('companyData', companyData);
}

export async function clearCompanyData() {
  return await db.delete('settings', 'companyData');
}

export async function getPsaCatalog() {
  const data = await getSetting('psaCatalog');
  return data ? data.value : defaultPsaHazardData;
}

export async function getBranchTemplates() {
  const data = await getSetting('branchTemplates');
  return data ? data.value : defaultTemplates;
}

export async function resetFactorySettings() {
  await saveSetting('psaCatalog', defaultPsaHazardData);
  await saveSetting('branchTemplates', defaultTemplates);
}
