import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabaseUrl = "https://luqjbtthkjnrpocjargr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cWpidHRoa2pucnBvY2phcmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMjQ1ODAsImV4cCI6MjA2MzgwMDU4MH0.As0B1JDduqq0FqxmG_GX6KIt06q9vjjwdwt0lV4kwKI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  try {
    console.log("🔄 กำลัง Export ข้อมูลจาก Supabase...");

    // Export Users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*");

    if (usersError) throw usersError;

    // Export Tours
    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("*");

    if (toursError) throw toursError;

    console.log(`✅ พบผู้ใช้ ${users.length} คน`);
    console.log(`✅ พบทัวร์ ${tours.length} รายการ`);

    // สร้าง SQL INSERT statements
    let sqlContent = "-- SevenSmile Database Export\n\n";

    // Users SQL
    sqlContent += "-- Users Data\n";
    if (users.length > 0) {
      users.forEach((user) => {
        const values = [
          user.id,
          `'${user.username.replace(/'/g, "''")}'`,
          `'${user.password.replace(/'/g, "''")}'`,
          `'${user.role}'`,
          user.created_at ? `'${user.created_at}'` : "NOW()",
        ].join(", ");

        sqlContent += `INSERT INTO users (id, username, password, role, created_at) VALUES (${values}) ON DUPLICATE KEY UPDATE username=VALUES(username);\n`;
      });
    }

    sqlContent += "\n-- Tours Data\n";
    // Tours SQL
    if (tours.length > 0) {
      tours.forEach((tour) => {
        const values = [
          tour.id,
          tour.sub_agent_name
            ? `'${tour.sub_agent_name.replace(/'/g, "''")}'`
            : "NULL",
          tour.address ? `'${tour.address.replace(/'/g, "''")}'` : "NULL",
          tour.phone ? `'${tour.phone.replace(/'/g, "''")}'` : "NULL",
          tour.line ? `'${tour.line.replace(/'/g, "''")}'` : "NULL",
          tour.facebook ? `'${tour.facebook.replace(/'/g, "''")}'` : "NULL",
          tour.whatsapp ? `'${tour.whatsapp.replace(/'/g, "''")}'` : "NULL",
          `'${tour.tour_name.replace(/'/g, "''")}'`,
          tour.departure_from
            ? `'${tour.departure_from.replace(/'/g, "''")}'`
            : "NULL",
          tour.pier ? `'${tour.pier.replace(/'/g, "''")}'` : "NULL",
          tour.adult_price || 0,
          tour.child_price || 0,
          tour.start_date ? `'${tour.start_date}'` : "NULL",
          tour.end_date ? `'${tour.end_date}'` : "NULL",
          tour.notes ? `'${tour.notes.replace(/'/g, "''")}'` : "NULL",
          tour.park_fee_included ? 1 : 0,
          tour.updated_by ? `'${tour.updated_by.replace(/'/g, "''")}'` : "NULL",
          tour.created_at ? `'${tour.created_at}'` : "NOW()",
          tour.updated_at ? `'${tour.updated_at}'` : "NOW()",
        ].join(", ");

        sqlContent += `INSERT INTO tours (id, sub_agent_name, address, phone, line, facebook, whatsapp, tour_name, departure_from, pier, adult_price, child_price, start_date, end_date, notes, park_fee_included, updated_by, created_at, updated_at) VALUES (${values}) ON DUPLICATE KEY UPDATE tour_name=VALUES(tour_name), updated_at=NOW();\n`;
      });
    }

    // บันทึกไฟล์
    fs.writeFileSync("supabase-export.sql", sqlContent);
    fs.writeFileSync("users-backup.json", JSON.stringify(users, null, 2));
    fs.writeFileSync("tours-backup.json", JSON.stringify(tours, null, 2));

    console.log("✅ Export สำเร็จ!");
    console.log("📁 ไฟล์ที่สร้าง:");
    console.log("   - supabase-export.sql (สำหรับ import ลง MariaDB)");
    console.log("   - users-backup.json (backup ข้อมูลผู้ใช้)");
    console.log("   - tours-backup.json (backup ข้อมูลทัวร์)");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error.message);
  }
}

exportData();
