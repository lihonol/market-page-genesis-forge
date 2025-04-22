
import { useEffect, useState } from "react";

// نوع هر فایل متنی با ردیف‌ها و محتویاتشان
export interface FolderTextFileRows {
  fileName: string;
  rows: { label: string; value: string }[];
  folderType: "txt" | "page"; // Added to distinguish between file types
}

// هوک کریت شده برای خواندن تمام فایل‌های txt و html از دایرکتوری‌های مربوطه
export function useFolderTextFiles() {
  const [files, setFiles] = useState<FolderTextFileRows[]>([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<FolderTextFileRows[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        // Load TXT files
        const txtFileListRes = await fetch("/datafiles/txt/files.json");
        const txtFileList: string[] = await txtFileListRes.json();
        const txtFiles: FolderTextFileRows[] = [];
        
        for (const fn of txtFileList) {
          const txtContent = await fetch(`/datafiles/txt/${fn}`).then((x) => x.text()).catch(() => "");
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
          txtFiles.push({ fileName: fn, rows, folderType: "txt" });
        }
        
        // Load pages
        const pageFileListRes = await fetch("/datafiles/pages/files.json");
        const pageFileList: string[] = await pageFileListRes.json();
        const pageFiles: FolderTextFileRows[] = [];
        
        for (const fn of pageFileList) {
          const pageContent = await fetch(`/datafiles/pages/${fn}`).then((x) => x.text()).catch(() => "");
          // For pages, we just store the filename and a simple metadata row
          const rows = [
            { label: "Title", value: fn.replace(/\.[^.]+$/, "") },
            { label: "Type", value: "HTML Page" },
            { label: "Path", value: `/datafiles/pages/${fn}` }
          ];
          pageFiles.push({ fileName: fn, rows, folderType: "page" });
        }

        // Combine both file types
        setFiles([...txtFiles, ...pageFiles]);
        setPages(pageFiles);
      } catch (e) {
        console.error("Error loading files:", e);
        setFiles([]);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  return { files, pages, loading };
}
