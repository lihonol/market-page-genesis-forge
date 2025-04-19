
import { useEffect, useState } from "react";

export interface FolderTextFileRows {
  fileName: string;
  rows: { label: string; value: string }[];
}

/**
 * خواندن و پارس کردن تمام فایل‌های txt در public/datafiles (در زمان build باید فایل‌ها همانجا کپی باشند)
 */
export function useFolderTextFiles() {
  const [files, setFiles] = useState<FolderTextFileRows[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // فایل لیستی ساده از نام txtها را بخوانیم (مثلاً از public/datafiles/files.json)، پس باید این فایل json را کاربر خودش دستی قرار بدهد یا ما شبیه‌سازی کنیم.
    fetch("/datafiles/files.json")
      .then((res) => res.json())
      .then(async (fileList: string[]) => {
        const allFiles: FolderTextFileRows[] = [];

        for (const fn of fileList) {
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { files, loading };
}
