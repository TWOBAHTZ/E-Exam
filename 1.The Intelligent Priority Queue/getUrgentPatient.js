/**
 * ข้อมูลผู้ป่วยในคิว
 * @typedef {Object} Patient
 * @property {string} id - รหัสผู้ป่วย
 * @property {'E' | 'N'} type - 'E' (Emergency) หรือ 'N' (Normal)
 * @property {number} severity - ระดับความรุนแรง (1-10)
 * @property {number} arrivalTime - เวลาที่มาถึง (หน่วยเป็นนาที)
 */

/**
 * ค้นหาผู้ป่วยที่ด่วนที่สุดในคิวตามเงื่อนไขของโรงพยาบาล
 * 
 * เงื่อนไข:
 * 1. Emergency (E) ต้องมาก่อน Normal (N) เสมอ
 * 2. ถ้าอยู่กลุ่มเดียวกัน ให้ดู Severity Score (1–10) ใครคะแนนสูงกว่าได้รับการรักษาก่อน
 * 3. Wait-Time Factor: หากผู้ป่วยกลุ่ม Normal รอเกิน 60 นาที ให้ขยับ Priority ขึ้นมาเทียบเท่า Emergency ชั่วคราว
 * 
 * @param {Patient[]} queue - คิวผู้ป่วยปัจจุบัน
 * @param {number} currentTime - เวลาปัจจุบัน (หน่วยเป็นนาที)
 * @returns {Patient | null} ผู้ป่วยที่ด่วนที่สุด (คืนค่า null ถ้าคิวว่าง)
 */
function getUrgentPatient(queue, currentTime) {
    if (!queue || queue.length === 0) {
        return null;
    }

    let mostUrgent = queue[0];

    for (let i = 1; i < queue.length; i++) {
        const currentPatient = queue[i];

        // 1. ดึงสถานะความเร่งด่วน ณ ปัจจุบัน (คำนวณเวลารอ)
        const effectiveTypeCurrent = getEffectiveType(currentPatient, currentTime);
        const effectiveTypeMostUrgent = getEffectiveType(mostUrgent, currentTime);

        // 2. เปรียบเทียบกลุ่มความเร่งด่วน
        if (effectiveTypeCurrent === 'E' && effectiveTypeMostUrgent === 'N') {
            mostUrgent = currentPatient;
            continue;
        } else if (effectiveTypeCurrent === 'N' && effectiveTypeMostUrgent === 'E') {
            continue;
        }

        // 3. ถ้าเป็นกลุ่มเดียวกัน ให้เปรียบเทียบความรุนแรง
        if (currentPatient.severity > mostUrgent.severity) {
            mostUrgent = currentPatient;
            continue;
        } else if (currentPatient.severity < mostUrgent.severity) {
            continue;
        }

        // 4. ถ้าความรุนแรงเท่ากัน ให้สิทธิ์คนมาก่อน
        if (currentPatient.arrivalTime < mostUrgent.arrivalTime) {
            mostUrgent = currentPatient;
        }
    }

    return mostUrgent;
}

function getEffectiveType(patient, currentTime) {
    if (patient.type === 'E') {
        return 'E';
    }
    
    // คำนวณเวลารอ
    const waitTime = currentTime - patient.arrivalTime;
    if (waitTime > 60) {
        return 'E';
    }
    
    return 'N';
}

// ==========================================
// ตัวอย่างการใช้งาน
// ==========================================
const patientsQueue = [
    { id: 'P1', type: 'N', severity: 5, arrivalTime: 10 },
    { id: 'P2', type: 'N', severity: 8, arrivalTime: 40 },
    { id: 'P3', type: 'E', severity: 7, arrivalTime: 50 },
    { id: 'P4', type: 'N', severity: 9, arrivalTime: 0 }, 
];

const urgent = getUrgentPatient(patientsQueue, 70);
console.log('Most Urgent Patient:', urgent); 

module.exports = { getUrgentPatient };
