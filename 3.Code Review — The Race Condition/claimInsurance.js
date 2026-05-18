// * ปัญหา: ระบบพังเมื่อกดเบิกประกันพร้อมกัน 2 เครื่อง

// async function claimInsurance(patientId, treatmentCost) {

//     const p = await db.query(

//         `SELECT limit FROM patients WHERE id = ${patientId}`),

//     if (p.limit >= treatmentCost) {

//         const newLimit = p.limit - treatmentCost;

//         await db.query(

//             `UPDATE patients SET limit = ${newLimit} WHERE id = ${patientId}`),

//         return true;

//     }

//     return false;

// }
// * SQL Injection มีการใช้ Template Literals ของ JavaScript (${patientId} และ ${newLimit}) 
// เพื่อส่งตัวแปรเข้าไปฝังในเนื้อคำสั่ง SQL ตรงๆ โดยไม่มีการคัดกรองข้อมูล
// * Race Condition เกิดจากมีหลาย Transaction เข้าถึงข้อมูลเดียวกัน ทำให้สองเครื่อง run คำสั่ง SELECT และ
// ได้ค่า limit ที่เท่ากันออกมา

async function claimInsurance(patientId, treatmentCost) {
    // 1. ป้องกัน Race Condition และ SQL Injection
    await db.query('BEGIN');

    try {
        const queryResult = await db.query(
            'SELECT limit FROM patients WHERE id = $1 FOR UPDATE',
            [patientId]
        );

        // 2. ตรวจสอบข้อมูลผู้ป่วยและวงเงิน
        if (queryResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return false;
        }

        const p = queryResult.rows[0];

        if (p.limit >= treatmentCost) {
            const newLimit = p.limit - treatmentCost;

            // 3. บันทึกการเปลี่ยนแปลง
            await db.query(
                'UPDATE patients SET limit = $1 WHERE id = $2',
                [newLimit, patientId]
            );
            await db.query('COMMIT');
            return true;
        }

        // กรณีวงเงินไม่พอ
        await db.query('ROLLBACK');
        return false;

    } catch (error) {
        // 4. ยกเลิกคำสั่งทั้งหมดเมื่อระบบเกิดปัญหา
        await db.query('ROLLBACK');
        console.error('Transaction Error:', error);
        throw error;
    }
}