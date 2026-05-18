const { getUrgentPatient } = require('./getUrgentPatient.js'); 

// ==========================================
// Functional Unit Testing
// ==========================================
function runUnitTests() {
    console.log('--- Running Functional Tests ---');

    // Emergency (E) ต้องได้ตรวจก่อน Normal (N)
    const q1 = [
        { id: 'P1', type: 'N', severity: 9, arrivalTime: 10 },
        { id: 'P2', type: 'E', severity: 3, arrivalTime: 10 }
    ];

    console.assert(getUrgentPatient(q1, 15).id === 'P2', 'Test 1 ไม่ผ่าน: E ต้องมาก่อน N');

    // Severity สูงกว่าต้องได้ก่อน
    const q2 = [
        { id: 'P1', type: 'E', severity: 5, arrivalTime: 10 },
        { id: 'P2', type: 'E', severity: 8, arrivalTime: 10 }
    ];
    console.assert(getUrgentPatient(q2, 15).id === 'P2', 'Test 2 ไม่ผ่าน: Severity สูงกว่าต้องได้ก่อน');

    // Normal รอเกิน 60 นาที ต้องถูกเปลี่ยนเป็น Emergency
    const q3 = [
        { id: 'P1', type: 'E', severity: 5, arrivalTime: 50 }, 
        { id: 'P2', type: 'N', severity: 7, arrivalTime: 0 }   
    ];
    // นาทีที่ 60 P1 ยังชนะเพราะเป็น E (P2 ยังไม่เกิน 60)
    console.assert(getUrgentPatient(q3, 60).id === 'P1', 'Test 3.1 ไม่ผ่าน');
    
    // นาทีที่ 61 P2 รอไป 61 นาที (>60) กลายเป็น E ชั่วคราว และ severity 7 > 5 จึงต้องชนะ P1
    console.assert(getUrgentPatient(q3, 61).id === 'P2', 'Test 3.2 ไม่ผ่าน');

    // ถ้าทุกอย่างเท่ากัน ให้สิทธิ์คนมาก่อน
    const q4 = [
        { id: 'P1', type: 'E', severity: 8, arrivalTime: 20 },
        { id: 'P2', type: 'E', severity: 8, arrivalTime: 10 }
    ];
    console.assert(getUrgentPatient(q4, 25).id === 'P2', 'Test 4 ไม่ผ่าน: หากความรุนแรงเท่ากัน ให้สิทธิ์คนมาก่อน');

    console.log('ฟังก์ชั่นทำงานได้ถูกต้อง\n');
}

// ==========================================
// Performance & Scale Testing 
// ==========================================
function runPerformanceTest() {
    console.log('--- Running Performance Test (10,000 Patients) ---');

    const largeQueue = [];
    const currentTime = 500;

    // สร้างข้อมูลจำลองคนไข้ 10,000 คนแบบสุ่ม
    for (let i = 0; i < 10000; i++) {
        largeQueue.push({
            id: `PATIENT_${i}`,
            type: i % 3 === 0 ? 'E' : 'N', // สลับประเภท
            severity: Math.floor(Math.random() * 10) + 1, // สุ่ม 1-10
            arrivalTime: Math.floor(Math.random() * 450) // สุ่มเวลาที่มาถึง
        });
    }

    console.log(`คิวปัจจุบันมีคนไข้ทั้งหมด: ${largeQueue.length.toLocaleString()} คน`);

    // จับเวลาการทำงาน
    console.time('Execution Time');
    const result = getUrgentPatient(largeQueue, currentTime);
    console.timeEnd('Execution Time');

    console.log(`คนไข้ที่ด่วนที่สุดที่ค้นพบคือ: ${result.id} (Type: ${result.type}, Severity: ${result.severity})`);
}

runUnitTests();
runPerformanceTest();