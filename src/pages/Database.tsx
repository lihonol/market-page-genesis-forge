
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFolderTextFiles } from "@/hooks/useFolderTextFiles";
import { useData } from "@/contexts/DataContext";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { FileCsv, FileExcel, Eye, Trash2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// ۱۸ کلید مناسب داده نصبی نمونه شما
const FIXED_LABELS = [
  "Ip Address",
  "Country",
  "NetworkInformation",
  "Batterypercentage",
  "Ischarging",
  "ScreenWidth",
  "ScreeHeight",
  "Platform",
  "GPS",
  "DeviceLocalTime",
  "DeviceLanguage",
  "CookieEnabled",
  "UserAgent",
  "DeviceMemory",
  "CPuThreads",
  "Clipboard",
  "ReferUrl"
];

export default function Database() {
  // --- برای فایل‌های متنی ---
  const { files, loading } = useFolderTextFiles();
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // هر فایل را به ابجکت تبدیل کنیم
  const getRowObj = (rows: { label: string; value: string }[]) => {
    const obj: Record<string, string> = {};
    rows.forEach(({ label, value }) => {
      obj[label] = value;
    });
    return obj;
  };

  // فیلتر کردن رکوردها
  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    return files.filter(file => {
      const rowObj = getRowObj(file.rows);
      const values = [
        file.fileName,
        ...FIXED_LABELS.map(label => rowObj[label] || "")
      ];
      return values.some(val =>
        (val || "").toString().toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [files, search]);

  // اکسل/CSV Export
  const handleExport = (type: "csv" | "excel") => {
    const sep = type === "csv" ? "," : "\t";
    const header = ["File Name", ...FIXED_LABELS];
    const rows = filteredFiles.map(file => {
      const rowObj = getRowObj(file.rows);
      return [
        file.fileName,
        ...FIXED_LABELS.map(label => (rowObj[label] || "").replace(/[\r\n]+/g, " "))
      ].map(v => `"${v.replace(/"/g, '""')}"`).join(sep);
    });
    const content = [header.join(sep), ...rows].join("\r\n");
    const blob = new Blob([content], {
      type:
        type === "csv"
          ? "text/csv;charset=utf-8;"
          : "application/vnd.ms-excel"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `database_export.${type === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: `Exported as ${type.toUpperCase()}`,
      description: "The table exported successfully.",
    });
  };

  // --- برای پیج‌ها ---
  const { pages, deletePage } = useData();
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  // دانلود HTML صفحه
  const handleDownloadPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${page.title}</title>
  <meta charset="utf-8">
</head>
<body>
  <h1>${page.title}</h1>
  <div>${page.content}</div>
</body>
</html>
`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `page-${pageId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // حذف صفحه
  const handleDeletePage = (pageId: string) => {
    if (window.confirm("آیا مطمئن هستید؟")) {
      deletePage(pageId);
      toast({ title: "صفحه حذف شد" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Files Database Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-3">
            <input
              className="border rounded-lg px-4 py-2 w-full md:w-96"
              placeholder="جستجوی رکورد..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={() => handleExport("csv")} variant="outline">
                <FileCsv className="h-4 w-4 mr-2" /> Export CSV
              </Button>
              <Button onClick={() => handleExport("excel")} variant="outline">
                <FileExcel className="h-4 w-4 mr-2" /> Export Excel
              </Button>
            </div>
          </div>
          <div className="overflow-auto rounded border bg-background">
            <table className="w-full min-w-max border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 whitespace-nowrap text-left font-semibold text-sm">
                    File Name
                  </th>
                  {FIXED_LABELS.map(label => (
                    <th
                      key={label}
                      className="px-4 py-2 whitespace-nowrap text-left font-semibold text-sm"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={FIXED_LABELS.length + 1} className="text-center py-8">
                      در حال خواندن فایل‌ها...
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={FIXED_LABELS.length + 1} className="text-center py-8">
                      هیچ فایل متنی پیدا نشد.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map(file => {
                    const rowObj = getRowObj(file.rows);
                    return (
                      <tr key={file.fileName} className="border-b last:border-b-0">
                        <td className="px-4 py-2 font-mono text-sm whitespace-nowrap">{file.fileName}</td>
                        {FIXED_LABELS.map(label => (
                          <td key={label} className="px-4 py-2 text-xs whitespace-pre-wrap break-all">
                            {rowObj[label] || ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            صفحات ساخته‌شده (Pages)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>تاریخ ساخت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm">
                      هیچ صفحه‌ای وجود ندارد.
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map(page => (
                    <TableRow key={page.id}>
                      <TableCell>{page.title}</TableCell>
                      <TableCell>{format(new Date(page.createdAt), "PPP")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(`/preview/${page.id}`, "_blank")
                            }
                            title="دیدن"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPage(page.id)}
                            title="دانلود"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePage(page.id)}
                            title="پاک کردن"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
