-- 1. สร้างตารางประวัติแพ้ยา
CREATE TABLE drug_allergies (
    patient_id INT NOT NULL,
    drug_id INT NOT NULL,
    severity_level VARCHAR(20) DEFAULT 'High',
    PRIMARY KEY (patient_id, drug_id)
);

-- 2. สร้างตารางใบสั่งยา
CREATE TABLE prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    drug_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- สถานะการสั่งยา
    override_reason TEXT, -- เหตุผลที่ต้องฝืนสั่งยา
    override_by INT       -- รหัสแพทย์อาวุโสที่อนุมัติ
);

-- 3. สร้าง Trigger เป็น Constraint ป้องกันการสั่งยาที่แพ้
CREATE OR REPLACE FUNCTION check_allergy() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM drug_allergies WHERE patient_id = NEW.patient_id AND drug_id = NEW.drug_id) THEN
        RAISE EXCEPTION 'บล็อกการสั่งยา: พบประวัติแพ้ยานี้!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_allergic_prescription
BEFORE INSERT ON prescriptions
FOR EACH ROW EXECUTE FUNCTION check_allergy();