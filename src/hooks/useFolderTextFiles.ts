
import { useEffect, useState } from "react";

// نوع هر فایل متنی با ردیف‌ها و محتویاتشان
export interface FolderTextFileRows {
  fileName: string;
  rows: { label: string; value: string }[];
}

// هوک کریت شده برای خواندن تمام فایل‌های txt و html از دایرکتوری /public/datafiles
export function useFolderTextFiles() {
  const [files, setFiles] = useState<FolderTextFileRows[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // فایل لیست را داینامیک بخوان (از لیست دایرکتوری سمت سرور، که در این محیط قابل انجام نیست، اما در پروژه واقعی با api)
    // برای این محیط همچنان باید با یک فایل json کار کنیم؛ اما تلاش می‌کنیم اگر فایل‌هایی جدید اضافه شد و در فایل json نبود، اضافه کنیم.
    fetch("/datafiles")
      .then(async (res) => {
        // چون سرور static است، دسترسی به لیست همه فایل‌ها نداریم
        // پس همچنان فایل json را چک می‌کنیم اما راهنمایی می‌دهیم که برای بروزرسانی باید فایل‌های جدید را به json اضافه کنید
        try {
          const fileListRes = await fetch("/datafiles/files.json");
          const fileList: string[] = await fileListRes.json();

          // فقط فایل‌هایی با فرمت txt یا html را نگه دار
          const filteredFileList = fileList.filter(f => /\.txt$|\.html$/i.test(f));

          const allFiles: FolderTextFileRows[] = [];

          for (const fn of filteredFileList) {
            const txtContent = await fetch(`/datafiles/${fn}`).then((x) => x.text()).catch(() => "");
            const rows: { label: string; value: string }[] = [];
            txtContent.split(/\r?\n/).forEach(line => {
              const colonIndex = line.indexOf(":");
              if (colonIndex > -1) {
                const label = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                if (label || value) {
                  rows.push({ label, value });
                }
              }
            });
            allFiles.push({ fileName: fn, rows });
          }

          setFiles(allFiles);
        } catch (e) {
          setFiles([]);
        } finally {
          setLoading(false);
        }

      })
      .catch(() => setLoading(false));
  }, []);

  return { files, loading };
}
