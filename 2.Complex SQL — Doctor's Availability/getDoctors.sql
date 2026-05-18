SELECT 
    d.doctor_id,
    d.name
FROM 
    doctors d
WHERE 
    -- แพทย์ต้องไม่มีนัดหมายที่ยืนยันแล้ว
    NOT EXISTS (
        SELECT 1 
        FROM appointments a
        WHERE a.doctor_id = d.doctor_id
          AND a.status = 'confirmed'
          -- เช็ก Overlap: เวลานัดหมายเริ่มก่อน 11:00 น. และสิ้นสุดหลัง 10:00 น.
          AND a.start_time < '2026-03-19 11:00:00'
          AND a.end_time > '2026-03-19 10:00:00'
    )
    
    -- แพทย์ต้องไม่อยู่ในช่วง "พักกะ" ในช่วงเวลาดังกล่าว
    AND NOT EXISTS (
        SELECT 1
        FROM doctor_shifts s
        WHERE s.doctor_id = d.doctor_id
          AND s.shift_type = 'break' -- ช่วงพักกะ
          -- เช็ก Overlap: เวลาพักกะเริ่มก่อน 11:00 น. และสิ้นสุดหลัง 10:00 น.
          AND s.start_time < '2026-03-19 11:00:00'
          AND s.end_time > '2026-03-19 10:00:00'
    );