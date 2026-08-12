/**
 * RiskFlow Storage Module
 * IndexedDB-Verwaltung für Gefährdungsbeurteilungen und Risikodaten
 */

import { openDB } from 'idb';

let db;

export async function initializeStorage() {
  db = await openDB('riskflow-db', 1, {
    upgrade(db) {
      // Assessments (Gefährdungsbeurteilungen)
      if (!db.objectStoreNames.contains('assessments')) {
        const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id', autoIncrement: true });
        assessmentStore.createIndex('betriebsstätte', 'betriebsstätte');
        assessmentStore.createIndex('datum', 'datum');
        assessmentStore.createIndex('status', 'status');
      }
      
      // Risks (Gefährdungen/Risiken)
      if (!db.objectStoreNames.contains('risks')) {
        const riskStore = db.createObjectStore('risks', { keyPath: 'id', autoIncrement: true });
        riskStore.createIndex('assessmentId', 'assessmentId');
        riskStore.createIndex('severity', 'severity');
      }
      
      // Measures (Maßnahmen)
      if (!db.objectStoreNames.contains('measures')) {
        const measureStore = db.createObjectStore('measures', { keyPath: 'id', autoIncrement: true });
        measureStore.createIndex('assessmentId', 'assessmentId');
        measureStore.createIndex('riskId', 'riskId');
      }
      
      // Settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      
      // Sync Queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
  
  return db;
}

// Assessment-Funktionen
export async function saveAssessment(assessment) {
  return await db.add('assessments', {
    ...assessment,
    datum: new Date().toISOString(),
    synced: false
  });
}

export async function getAssessments() {
  return await db.getAll('assessments');
}

export async function getAssessmentById(id) {
  return await db.get('assessments', id);
}

export async function updateAssessment(id, data) {
  const assessment = await db.get('assessments', id);
  return await db.put('assessments', { ...assessment, ...data });
}

export async function deleteAssessment(id) {
  return await db.delete('assessments', id);
}

// Risk-Funktionen
export async function saveRisk(risk) {
  return await db.add('risks', risk);
}

export async function getRisksForAssessment(assessmentId) {
  return await db.getAllFromIndex('risks', 'assessmentId', assessmentId);
}

export async function updateRisk(id, data) {
  const risk = await db.get('risks', id);
  return await db.put('risks', { ...risk, ...data });
}

export async function deleteRisk(id) {
  return await db.delete('risks', id);
}

// Measure-Funktionen
export async function saveMeasure(measure) {
  return await db.add('measures', measure);
}

export async function getMeasuresForRisk(riskId) {
  return await db.getAllFromIndex('measures', 'riskId', riskId);
}

export async function updateMeasure(id, data) {
  const measure = await db.get('measures', id);
  return await db.put('measures', { ...measure, ...data });
}

export async function deleteMeasure(id) {
  return await db.delete('measures', id);
}

export function getDatabase() {
  return db;
}