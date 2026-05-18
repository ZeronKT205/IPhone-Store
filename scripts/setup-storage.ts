/**
 * Script khởi tạo Supabase Storage bucket "products"
 * Chạy: npx tsx scripts/setup-storage.ts
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qkuvbwfwtyjqlitqsphz.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdXZid2Z3dHlqcWxpdHFzcGh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA5MDQ4NCwiZXhwIjoyMDk0NjY2NDg0fQ.PBZzpHHIk1ViH8hJ-7W1WEVlCK4-8aRU0HIc1qCA55M";

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  // Kiểm tra bucket đã tồn tại chưa
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("Lỗi khi list buckets:", listErr.message);
    process.exit(1);
  }

  const exists = buckets?.some((b) => b.name === "products");

  if (exists) {
    console.log('✅ Bucket "products" đã tồn tại.');
  } else {
    const { error } = await supabase.storage.createBucket("products", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) {
      console.error("❌ Lỗi tạo bucket:", error.message);
      process.exit(1);
    }
    console.log('✅ Tạo bucket "products" thành công!');
  }

  console.log(
    "🔗 Public URL base:",
    `${supabaseUrl}/storage/v1/object/public/products/`
  );
}

main();
