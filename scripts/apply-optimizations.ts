import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function runSqlFile(filePath: string) {
  console.log(`\n========================================`);
  console.log(`Đang đọc tệp SQL: ${path.basename(filePath)}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`Lỗi: Không tìm thấy tệp ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  
  // Split queries by semicolon to execute them sequentially and handle properly
  const queries = content
    .split(";")
    .map((q) => q.trim())
    .filter((q) => q.length > 0 && !q.startsWith("--"));

  console.log(`Tìm thấy ${queries.length} câu lệnh SQL. Bắt đầu thực thi...`);

  let successCount = 0;
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    try {
      // Print a short summary of the query
      const firstLine = query.split("\n")[0].substring(0, 60);
      console.log(`[${i + 1}/${queries.length}] Đang chạy: "${firstLine}..."`);
      
      await prisma.$executeRawUnsafe(query);
      successCount++;
    } catch (err: any) {
      console.error(`❌ Thất bại ở câu lệnh [${i + 1}]:`);
      console.error(query);
      console.error(`Lỗi chi tiết:`, err.message);
      // We don't throw so other independent queries can still try to run
    }
  }

  console.log(`Hoàn thành tệp: Thành công ${successCount}/${queries.length} câu lệnh.`);
  return successCount === queries.length;
}

async function main() {
  try {
    const addIndexesPath = path.join(process.cwd(), "docs", "add_indexes.sql");
    const optimizeIndexesPath = path.join(process.cwd(), "docs", "optimize_indexes.sql");

    console.log("🚀 BẮT ĐẦU THIẾT LẬP TỐI ƯU HÓA DATABASE TRÊN SUPABASE...");

    const ok1 = await runSqlFile(addIndexesPath);
    const ok2 = await runSqlFile(optimizeIndexesPath);

    if (ok1 && ok2) {
      console.log("\n🎉 HOÀN THÀNH TOÀN BỘ TỐI ƯU HÓA THÀNH CÔNG RỰC RỠ!");
    } else {
      console.log("\n⚠️ CÓ MỘT SỐ CÂU LỆNH GẶP LỖI, VUI LÒNG KIỂM TRA LẠI LOG BÊN TRÊN.");
    }
  } catch (error: any) {
    console.error("Lỗi nghiêm trọng khi chạy script:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
