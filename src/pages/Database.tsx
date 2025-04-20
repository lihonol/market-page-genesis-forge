import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("links");
  const { toast } = useToast();
  const [fileDataRows, setFileDataRows] = useState<{ label: string; value: string }[]>([]);
  const [fileName, setFileName] = useState("");
  
  // Password protection for link deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: "link" | "page" | "txtfile"} | null>(null);
  const DELETE_PASSWORD = "admin123"; // In a real app, this would be securely stored

  // چندرکوردی فایل های تکست
  const [multiFileDataRows, setMultiFileDataRows] = useState<
    { fileName: string; rows: { label: string; value: string }[] }[]
  >([]);
  const [tabKey, setTabKey] = useState("links");
  const { files: folderFiles, loading: loadingFolderFiles } = useFolderTextFiles();

  // 1. Define filteredPages to filter pages by searchTerm, similar to filteredLinks
  const filteredPages = pages.filter(
    (page) =>
      (page.id && page.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (page.title && page.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (page.content && page.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (page.menuItems && page.menuItems.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // تابع خواندن و پارس کردن فایل متنی
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // پردازش خطوط
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

  // تابع خواندن چندین فایل متنی
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
      setTabKey("links"); // پس از انتخاب فایل، تب "Text Files" نمایش داده شود
    });
  };

  // تابع حذف برای رکوردهای txt
  const handleDeleteTxtRecord = (id: string) => {
    confirmDelete(id, "txtfile");
  };

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
      // برای حذف فایل txt فقط با toast حذف آزمایشی (چون از فایل‌های واقعی خوانده می‌شوند)
      toast({
        title: "Txt Record Removed (Simulation)",
        description: "This record is from a file, removing only from the view."
      });
      // حذف بصورت نمایشی، از آرایه filteredLinks حذف می‌شود
      // می‌توانید با فیلتر state مخصوص پیاده‌سازی کنید، اما در این دموی ساده کار خاصی لازم نیست
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

  const handleDownloadPage = (id: string) => {
    // In a real app, this would trigger a download of the HTML page
    const page = pages.find(p => p.id === id);
    if (!page) return;
    
    // Create a simple HTML page for demonstration purposes
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

  // ساخت رکوردهای شبیه‌سازی‌شده برای اضافه‌کردن فایل‌های txt به جدول Links
  const folderTextFileToLinkRecord = (file: { fileName: string, rows: { label: string, value: string }[] }) => {
    const rowObj: Record<string, string> = {};
    file.rows.forEach(row => {
      rowObj[row.label.toLowerCase()] = row.value;
    });
    return {
      id: `txtfile-${file.fileName}`,     // آیدی: متمایز و استاندارد
      fileName: file.fileName,
      fullLink: rowObj["referurl"] || "N/A",
      visits: Number(rowObj["visits"]) || 0,
      createdAt: rowObj["devicelocaltime"] || new Date().toISOString(),
      pageId: "-",
      pageTitle: "-",
      status: rowObj["ischarging"] || "-",
      device: rowObj["platform"] || "-",
      platform: rowObj["useragent"] || "-",
      rawRows: file.rows,
      isTxtRecord: true,
    };
  };

  // رکوردهای فایل تکست پوشه
  const folderFileLinkRecords = folderFiles.map(folderTextFileToLinkRecord);

  // رکوردهای آپلود دستی (multiFileDataRows)
  const multiFileLinkRecords = multiFileDataRows.map(folderTextFileToLinkRecord);

  const combinedLinks = [
    ...links.map(link => ({
      ...link,
      rawRows: null,
      isTxtRecord: false,
      pageTitle: (pages.find(p => p.id === link.pageId)?.title) || "-",
      device: "N/A",
      platform: "N/A",
      status: link.visits > 0 ? "Active" : "Inactive"
    })),
    ...multiFileLinkRecords,
    ...folderFileLinkRecords,
  ];

  const filteredLinks = combinedLinks.filter(
    (link) =>
      (link.id && link.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.fullLink && link.fullLink.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.pageTitle && link.pageTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.platform && link.platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.device && link.device.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link?.rawRows && (link.rawRows as any[]).some(
        (row) =>
          row.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.value?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
  );

  // عبارت جدید برای ترکیب چند رکوردی از public/datafiles
  const allTextFilesRecords = [
    ...multiFileDataRows,
    ...folderFiles,
  ];

  // جستجو بین موارد txtهای اتوماتیک
  const filteredAllTextFilesRecords = allTextFilesRecords.filter((rec) =>
    rec.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.rows.some(
      row =>
        row.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 2. This was missing! Add handleExport (for Export CSV/Excel)
  const handleExport = (format: "csv" | "excel") => {
    // We pass through to context
    exportData(format);
  };

  // برای فایل های txt، ستون‌ها را بر اساس لیبل‌های اولین فایل ایجاد می‌کنیم
  const allFolderLabels = Array.from(
    new Set(
      folderFiles
        .flatMap((file) => file.rows.map((row) => row.label))
        // پاک کردن خالی
        .filter(label => !!label)
    )
  );

  // برای رکوردهای آپلودی multiFileDataRows هم لیبل‌ها را اضافه می‌کنیم (در صورت وجود)
  const allMultiLabels = Array.from(
    new Set(
      multiFileDataRows
        .flatMap((file) => file.rows.map((row) => row.label))
        .filter(label => !!label)
    )
  );

  // ترکیب تمام لیبل ها
  const allCustomLabels = Array.from(new Set([...allFolderLabels, ...allMultiLabels]));

  // صورت‌بندی رکورد txt به صورت ارائه شده (ID=filename بدون .txt)
  function customTxtFileToRow(file: { fileName: string, rows: { label: string, value: string }[] }) {
    const rowObj: Record<string, string> = {};
    file.rows.forEach(row => {
      rowObj[row.label] = row.value;
    });
    return {
      id: file.fileName.replace(/\.txt$/i, ""),
      fileName: file.fileName,
      rowObj,
      isTxtRecord: true,
      rawRows: file.rows,
    };
  }

  // تبدیل تمام فایل های پوشه و آپلودی به رکورد
  const folderFileLinkRecords = folderFiles.map(customTxtFileToRow);
  const multiFileLinkRecords = multiFileDataRows.map(customTxtFileToRow);

  // رکوردهای لینک واقعی
  const appLinkRecords = links.map(link => ({
    ...link,
    rawRows: null,
    isTxtRecord: false,
    pageTitle: (pages.find(p => p.id === link.pageId)?.title) || "-",
    device: "N/A",
    platform: "N/A",
    status: link.visits > 0 ? "Active" : "Inactive"
  }));

  // ترکیب همه رکوردها
  const combinedLinks = [
    ...appLinkRecords,
    ...multiFileLinkRecords,
    ...folderFileLinkRecords,
  ];

  // حالا فقط بر پایه جستجو، این جدول را فیلتر می کنیم
  const filteredLinks = combinedLinks.filter(link => {
    if (link.isTxtRecord) {
      // TXT file: جستجو بین فیلدها و آی‌دی و نام فایل
      if (link.id && link.id.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      if (link.fileName && link.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      if (
        link.rawRows &&
        link.rawRows.some(
          (row: any) =>
            row.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.value?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) { return true; }
      return false;
    }
    // عادی (لینک‌های برنامه)
    return (
      (link.id && link.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.fullLink && link.fullLink.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.pageTitle && link.pageTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.platform && link.platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.device && link.device.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // حذف رکورد txt (تنها از view حذف می‌شود - نمایشی)
  const [deletedTxtIds, setDeletedTxtIds] = useState<string[]>([]);
  const handleDeleteTxtRecord = (id: string) => {
    confirmDelete(id, "txtfile");
  };

  // هنگام تأیید حذف txt
  const confirmDelete = (id: string, type: "link" | "page" | "txtfile") => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };
  // هنگام تأیید حذف (کمی تغییر - برای txt هم اعمال کنیم)
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

  // حذف رکوردهای txt حذف شده از جدول
  const filteredLinksWithDeletes = filteredLinks.filter(link => {
    if (link.isTxtRecord) {
      return !deletedTxtIds.includes(link.id);
    }
    return true;
  });

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
                    {/* جدول برای TXT و لینک برنامه باید کمی منعطف باشد */}
                    {/* اگر رکورد txt است, سرتیتر بر اساس labelها */}
                    {filteredLinksWithDeletes.some(link => link.isTxtRecord) && allCustomLabels.map(label =>
                      <TableHead key={label} className="whitespace-nowrap">{label}</TableHead>
                    )}
                    {!filteredLinksWithDeletes.some(link => link.isTxtRecord) && (
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
                  {filteredLinksWithDeletes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={allCustomLabels.length + 2} className="text-center py-8">
                        No links found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLinksWithDeletes.map(link => {
                      if (link.isTxtRecord) {
                        // TXT file row
                        return (
                          <TableRow key={link.id}>
                            <TableCell className="whitespace-nowrap">{link.id}</TableCell>
                            {allCustomLabels.map(label => (
                              <TableCell key={label} className="whitespace-nowrap">
                                {link.rowObj[label] || ""}
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
                      // برنامه اصلی
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
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
