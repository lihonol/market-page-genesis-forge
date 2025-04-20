import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Download, FileDown, Trash2, Eye, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFolderTextFiles } from "@/hooks/useFolderTextFiles";

export default function Database() {
  const [searchTerm, setSearchTerm] = useState("");
  const { pages, links, deletePage, deleteLink, exportData } = useData();
  const { toast } = useToast();
  const [fileDataRows, setFileDataRows] = useState<{ label: string; value: string }[]>([]);
  const [fileName, setFileName] = useState("");

  // Password protection for deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: "link" | "page" | "txtfile"} | null>(null);
  const DELETE_PASSWORD = "admin123"; // In a real app, this would be securely stored

  // Multi-txt upload
  const [multiFileDataRows, setMultiFileDataRows] = useState<
    { fileName: string; rows: { label: string; value: string }[] }[]
  >([]);
  const { files: folderFiles } = useFolderTextFiles();

  // حذف رکورد txt (تنها از view حذف می‌شود - نمایشی)
  const [deletedTxtIds, setDeletedTxtIds] = useState<string[]>([]);

  // Helpers for reading uploaded files
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows: { label: string; value: string }[] = [];
      text.split(/\r?\n/).forEach(line => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > -1) {
          const label = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          if (label || value) {
            rows.push({ label, value });
          }
        }
      });
      setFileDataRows(rows);
    };
    reader.readAsText(file);
  };

  const handleMultiFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const promises: Promise<{ fileName: string; rows: { label: string; value: string }[] }>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const p = new Promise<{ fileName: string; rows: { label: string; value: string }[] }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const rows: { label: string; value: string }[] = [];
          text.split(/\r?\n/).forEach(line => {
            const colonIndex = line.indexOf(":");
            if (colonIndex > -1) {
              const label = line.substring(0, colonIndex).trim();
              const value = line.substring(colonIndex + 1).trim();
              if (label || value) {
                rows.push({ label, value });
              }
            }
          });
          resolve({ fileName: file.name, rows });
        };
        reader.readAsText(file);
      });
      promises.push(p);
    }
    Promise.all(promises).then(results => {
      setMultiFileDataRows(results);
    });
  };

  // Types for discriminated union:
  type TxtDbRow = {
    id: string;
    fileName: string;
    rowObj: Record<string, string>;
    rawRows: { label: string; value: string }[];
    isTxtRecord: true;
  };
  type AppLinkDbRow = {
    isTxtRecord: false;
    id: string;
    fullLink: string;
    pageTitle: string;
    pageId: string;
    createdAt: string;
    visits: number;
    status: string;
    device: string;
    platform: string;
    // Filler for uniformity
    fileName?: undefined;
    rowObj?: undefined;
    rawRows?: undefined;
  };
  type UnifiedDbRow = TxtDbRow | AppLinkDbRow;

  // Helpers
  function txtFileToDbRow(file: { fileName: string, rows: { label: string; value: string }[] }): TxtDbRow {
    const rowObj: Record<string, string> = {};
    file.rows.forEach(row => {
      rowObj[row.label] = row.value;
    });
    return {
      id: file.fileName.replace(/\.txt$/i, ""),
      fileName: file.fileName,
      rowObj,
      rawRows: file.rows,
      isTxtRecord: true,
    };
  }

  function isAppLinkDbRow(obj: UnifiedDbRow): obj is AppLinkDbRow {
    return obj.isTxtRecord === false;
  }

  function isTxtDbRow(obj: UnifiedDbRow): obj is TxtDbRow {
    return obj.isTxtRecord === true;
  }

  // File sources, mapped to same structure
  const folderFileLinkRecords: TxtDbRow[] = folderFiles.map(txtFileToDbRow);
  const multiFileLinkRecords: TxtDbRow[] = multiFileDataRows.map(txtFileToDbRow);

  // App link records
  const appLinkRecords: AppLinkDbRow[] = links.map(link => ({
    ...link,
    isTxtRecord: false,
    pageTitle: (pages.find(p => p.id === link.pageId)?.title) || "-",
    device: "N/A",
    platform: "N/A",
    status: link.visits > 0 ? "Active" : "Inactive"
  }));

  // Compose ALL records together
  const combinedLinks: UnifiedDbRow[] = [
    ...appLinkRecords,
    ...multiFileLinkRecords,
    ...folderFileLinkRecords,
  ];

  // Collect all unique TXT labels for table heading
  const allTxtLabels: string[] = Array.from(
    new Set(
      [
        ...folderFiles,
        ...multiFileDataRows,
      ].flatMap(file => file.rows.map(row => row.label)).filter(label => !!label)
    )
  );

  // Filter links for deleted txts and search term
  const filteredLinks: UnifiedDbRow[] = combinedLinks.filter(link => {
    // Handle TXT record filtering
    if (isTxtDbRow(link)) {
      if (deletedTxtIds.includes(link.id)) return false;
      if (link.id && link.id.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      if (link.fileName && link.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      if (
        link.rawRows &&
        link.rawRows.some(
          (row: any) =>
            row.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.value?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
        return true;
      return false;
    }
    // Handle app link filtering
    if (isAppLinkDbRow(link)) {
      return (
        (link.id && link.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (link.fullLink && link.fullLink.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (link.pageTitle && link.pageTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (link.platform && link.platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (link.device && link.device.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return false;
  });

  // Handler helpers
  const confirmDelete = (id: string, type: "link" | "page" | "txtfile") => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    if (deletePassword !== DELETE_PASSWORD) {
      toast({
        title: "Incorrect Password",
        description: "The password you entered is incorrect.",
        variant: "destructive"
      });
      return;
    }
    if (itemToDelete.type === "page") {
      deletePage(itemToDelete.id);
      toast({
        title: "Page Deleted",
        description: "The page has been successfully deleted."
      });
    } else if (itemToDelete.type === "link") {
      deleteLink(itemToDelete.id);
      toast({
        title: "Link Deleted",
        description: "The link has been successfully deleted."
      });
    } else if (itemToDelete.type === "txtfile") {
      toast({
        title: "Txt Record Removed (Simulation)",
        description: "This record is from a file, removing it only from the view."
      });
      setDeletedTxtIds(ids => [...ids, itemToDelete.id]);
    }
    setDeleteDialogOpen(false);
    setDeletePassword("");
    setItemToDelete(null);
  };

  const handleDeletePage = (id: string) => {
    confirmDelete(id, "page");
  };
  const handleDeleteLink = (id: string) => {
    confirmDelete(id, "link");
  };
  const handleDeleteTxtRecord = (id: string) => {
    confirmDelete(id, "txtfile");
  };

  // Export (unchanged)
  const handleExport = (format: "csv" | "excel") => {
    exportData(format);
  };

  // Download HTML for a page (unchanged)
  const handleDownloadPage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${page.title}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>${page.title}</h1>
          <div>${page.content}</div>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Now rendering -- focus on dynamic columns and their data
  return (
    <DashboardLayout title="Database">
      <div className="space-y-6">
        {/* آپلود فایل متنی و نمایش جدول اطلاعات */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex gap-2 items-center w-full md:w-auto">
            <label className="inline-flex items-center px-4 py-2 border rounded-lg cursor-pointer bg-background hover:bg-muted transition">
              <input
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
                data-testid="file-upload"
              />
              <span className="text-sm mr-2">{fileName ? fileName : "Select .txt file"}</span>
              <span className="px-2 py-1 bg-muted rounded text-xs">Upload Txt</span>
            </label>
          </div>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <label className="inline-flex items-center px-4 py-2 border rounded-lg cursor-pointer bg-background hover:bg-muted transition">
              <input
                type="file"
                accept=".txt"
                className="hidden"
                multiple
                onChange={handleMultiFileUpload}
                data-testid="multi-file-upload"
              />
              <span className="text-sm mr-2">Select .txt files (multi)</span>
              <span className="px-2 py-1 bg-muted rounded text-xs">Upload Txts</span>
            </label>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <FileDown className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
          </div>
        </div>

        {/* نمایش اطلاعات فایل متنی به صورت جدول */}
        {fileDataRows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات فایل متنی بارگذاری شده</CardTitle>
              {fileName && <div className="text-muted-foreground text-xs">{fileName}</div>}
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">کلید</th>
                      <th className="px-4 py-2 text-left">مقدار</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileDataRows.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2 font-medium whitespace-nowrap">{row.label}</td>
                        <td className="px-4 py-2 whitespace-pre-wrap break-all">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Database Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">ID</TableHead>
                    {/* Show TXT columns if any TXT records in result, else normal columns */}
                    {filteredLinks.some(isTxtDbRow)
                      ? allTxtLabels.map(label =>
                          <TableHead key={label} className="whitespace-nowrap">{label}</TableHead>
                        )
                      : (
                        <>
                          <TableHead className="whitespace-nowrap">Source</TableHead>
                          <TableHead className="whitespace-nowrap">Full Link</TableHead>
                          <TableHead className="whitespace-nowrap">Page Title</TableHead>
                          <TableHead className="whitespace-nowrap">Page ID</TableHead>
                          <TableHead className="whitespace-nowrap">Created At</TableHead>
                          <TableHead className="whitespace-nowrap">Visits</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="whitespace-nowrap">Device</TableHead>
                          <TableHead className="whitespace-nowrap">Platform</TableHead>
                        </>
                    )}
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={allTxtLabels.length + 2} className="text-center py-8">
                      No links found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map(link => {
                    if (isTxtDbRow(link)) {
                      // TXT file row
                      return (
                        <TableRow key={link.id}>
                          <TableCell className="whitespace-nowrap">{link.id}</TableCell>
                          {allTxtLabels.map(label => (
                            <TableCell key={label} className="whitespace-nowrap">
                              {link.rowObj ? link.rowObj[label] || "" : ""}
                            </TableCell>
                          ))}
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  alert(
                                    link.rawRows
                                      .map((row: any) => `${row.label}: ${row.value}`)
                                      .join("\n")
                                  );
                                }}
                                title="Show Raw Data"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTxtRecord(link.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    // App links row
                    if (isAppLinkDbRow(link)) {
                      const shortLink = link.fullLink?.split("/").pop() || "";
                      return (
                        <TableRow key={link.id}>
                          <TableCell className="whitespace-nowrap">{link.id}</TableCell>
                          <TableCell className="whitespace-nowrap">{shortLink}</TableCell>
                          <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                            {link.fullLink}
                          </TableCell>
                          <TableCell className="whitespace-nowrap max-w-[150px] truncate">
                            {link.pageTitle}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{link.pageId}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(link.createdAt), "PPP")}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{link.visits}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${link.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {link.status}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{link.device}</TableCell>
                          <TableCell className="whitespace-nowrap">{link.platform}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/preview/${link.pageId}`, '_blank')}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteLink(link.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return null;
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Password confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Required</DialogTitle>
            <DialogDescription>
              Please enter the admin password to delete this {itemToDelete?.type === "txtfile" ? "text file record" : itemToDelete?.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false);
              setDeletePassword("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
