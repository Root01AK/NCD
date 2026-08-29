import api from './api';

/**
 * Center Location Prefix Map
 */
export const LOCATION_PREFIX_MAP = {
  dharavi: 'DH',
  malvani: 'ML',
  vashi: 'VA',
  other: 'OT'
};

/**
 * Returns 2-letter location prefix for a given center name
 */
export function getLocationPrefix(locationName = 'Dharavi') {
  if (!locationName) return 'DH';
  const locLower = String(locationName).toLowerCase().trim();
  
  if (locLower.includes('dharavi') || locLower.includes('dh')) return 'DH';
  if (locLower.includes('malvani') || locLower.includes('ml')) return 'ML';
  if (locLower.includes('vashi') || locLower.includes('va')) return 'VA';
  if (locLower.includes('other') || locLower.includes('ot')) return 'OT';

  const clean = locLower.replace(/[^a-z0-9]/gi, '');
  return clean.length >= 2 ? clean.substring(0, 2).toUpperCase() : 'DH';
}

/**
 * Extracts numeric sequence number from a Participant ID string for a specific prefix
 */
export function extractSequenceNumber(participantId, targetPrefix = 'DH') {
  if (!participantId) return null;
  const str = String(participantId).toUpperCase().trim();
  const regex = new RegExp(`^NCD${targetPrefix}(\\d+)$`, 'i');
  const match = str.match(regex);
  if (match) {
    const num = parseInt(match[1], 10);
    return (!isNaN(num) && num > 0) ? num : null;
  }
  return null;
}

/**
 * Synchronous ID generator based on currently known local records
 */
export function generateNextParticipantID(location = 'Dharavi', existingRecords = []) {
  const prefix = getLocationPrefix(location);
  const foundSeqs = new Set();

  const addId = (pId) => {
    const seq = extractSequenceNumber(pId, prefix);
    if (seq !== null) foundSeqs.add(seq);
  };

  // 1. Scan passed records
  if (Array.isArray(existingRecords)) {
    existingRecords.forEach(item => {
      let raw = {};
      if (item && item.mem_scrn_q30) {
        try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
      }
      const pId = item?.participant_id || item?.mem_scrn_part_id || item?.id || raw?.participant_id;
      addId(pId);
    });
  }

  // 2. Scan localStorage (completed / initiated records & queue)
  ['ncd_local_initiated_participants', 'ncd_offline_queue', 'ncd_used_participant_ids'].forEach(storageKey => {
    try {
      const rawStr = localStorage.getItem(storageKey);
      if (rawStr) {
        const parsed = JSON.parse(rawStr);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (typeof item === 'string') {
              addId(item);
            } else if (item && typeof item === 'object') {
              let raw = {};
              if (item.mem_scrn_q30) {
                try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
              }
              const pId = item.participant_id || item.mem_scrn_part_id || item.id || raw.participant_id;
              addId(pId);
            }
          });
        }
      }
    } catch (e) {}
  });

  // 3. Compute active contiguous sequence (ignoring large gap outlier seeds like 16 -> 26)
  const sorted = Array.from(foundSeqs).sort((a, b) => a - b);
  let activeSeq = 0;
  if (sorted.length > 0) {
    activeSeq = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if ((sorted[i] - sorted[i - 1]) <= 3) {
        activeSeq = sorted[i];
      } else {
        break; // stop at big gap jump
      }
    }
  }

  const nextSeq = activeSeq + 1;
  return `NCD${prefix}${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Async ID generator combining backend DB screening list and local records
 */
export async function fetchNextParticipantIDFromDB(location = 'Dharavi') {
  let backendRecords = [];
  try {
    const res = await api.get('/api/v1/dashboard/screeninglist');
    if (res && res.status === 'success' && Array.isArray(res.data)) {
      backendRecords = res.data;
    }
  } catch (e) {}

  return generateNextParticipantID(location, backendRecords);
}

/**
 * Stable ID Locker: Guarantees active ID remains fixed during survey editing
 */
export function getOrLockParticipantID(currentId, targetLocation, existingRecords = []) {
  const prefix = getLocationPrefix(targetLocation);
  if (currentId && String(currentId).toUpperCase().startsWith(`NCD${prefix}`)) {
    return currentId; // Lock active ID! Do not regenerate!
  }
  return generateNextParticipantID(targetLocation, existingRecords);
}
