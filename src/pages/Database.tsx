
import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFolderTextFiles } from "@/hooks/useFolderTextFiles";
import { useData } from "@/contexts/DataContext";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Files, Eye, Trash2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// 18 keys for text file sample data (columns)
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
  const { files, loading } = useFolderTextFiles();
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper: Convert rows to object by label
  const getRowObj = (rows: { label: string; value: string }[]) => {
    const obj: Record<string, string> = {};
    rows.forEach(({ label, value }) => {
      obj[label] = value;
    });
    return obj;
  };

  // Filter text files by search string
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

  // Export CSV or Excel
  const handleExport = (type: "csv" | "excel") => {
    const sep = type === "csv" ? "," : "\t";
    const header = ["ID", ...FIXED_LABELS];
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

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      setUploadError("Only .txt files are allowed.");
      return;
    }
    setUploading(true);

    try {
      // Create a temporary url and trigger the download into /public/datafiles via the browser.
      // In a real app, you'd POST to a backend or use Supabase Storage. Here we can only simulate.
      // So we'll let user download to /public/datafiles/ and show a toast to help.
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setTimeout(() => {
        toast({
          title: "Finish upload manually",
          description: (
            "Please move or copy the uploaded file to /public/datafiles/ in your project. " +
            "After placing it there, reload the page to see it in the table."
          ),
          variant: "default",
        });
        setUploading(false);
        e.target.value = "";
      }, 1000);
    } catch (err) {
      setUploadError("Upload failed: " + String(err));
      setUploading(false);
    }
  };

  // --- Pages Section ---
  const { pages, deletePage } = useData();

  // Download HTML for page
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

  // Require password before deleting page
  const handleDeletePage = (pageId: string) => {
    const password = window.prompt("Enter password to delete this page:");
    if (!password) return;
    // For demo, the password is hardcoded as 'delete123'
    if (password !== "delete123") {
      toast({
        title: "Wrong password",
        description: "The page was not deleted.",
        variant: "destructive",
      });
      return;
    }
    deletePage(pageId);
    toast({ title: "Page deleted" });
  };

  // Wrapped with dashboard layout:
  return (
    <DashboardLayout title="Database">
      <div className="max-w-7xl mx-auto py-10 space-y-6">
        {/* ---- Text Files Database Table Section ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Text Files Database Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-3">
              <input
                className="border rounded-lg px-4 py-2 w-full md:w-96"
                placeholder="Search record..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={() => handleExport("csv")} variant="outline">
                  <Files className="h-4 w-4 mr-2" /> Export CSV
                </Button>
                <Button onClick={() => handleExport("excel")} variant="outline">
                  <Files className="h-4 w-4 mr-2" /> Export Excel
                </Button>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold">
                Upload text file
              </label>
              <div className="flex gap-2 items-center mb-4">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block"
                />
                {uploading && <span className="text-sm">Uploading...</span>}
                {uploadError && (
                  <span className="text-red-600 text-xs ml-2">{uploadError}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Place your <code>.txt</code> files in <code>/public/datafiles/</code>.<br />
                After uploading, move the file to that folder and reload to see it in the table.
              </div>
            </div>
            <div className="overflow-auto rounded border bg-background">
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
                        Reading files...
                      </td>
                    </tr>
                  ) : filteredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={FIXED_LABELS.length + 1} className="text-center py-8">
                        No text files found.
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

        {/* ---- Pages Table Section ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm">
                        No pages found.
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePage(page.id)}
                              title="Delete"
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
    </DashboardLayout>
  );
}
