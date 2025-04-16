
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

export default function Database() {
  const [searchTerm, setSearchTerm] = useState("");
  const { pages, links, deletePage, deleteLink, exportData } = useData();
  const [activeTab, setActiveTab] = useState("links");
  const { toast } = useToast();
  
  // Password protection for link deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: "link" | "page"} | null>(null);
  const DELETE_PASSWORD = "admin123"; // In a real app, this would be securely stored

  const filteredLinks = links.filter(
    (link) =>
      link.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.fullLink.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPages = pages.filter(
    (page) =>
      page.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (format: "csv" | "excel") => {
    exportData(format);
  };

  const confirmDelete = (id: string, type: "link" | "page") => {
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
    } else {
      deleteLink(itemToDelete.id);
      toast({
        title: "Link Deleted",
        description: "The link has been successfully deleted."
      });
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

  return (
    <DashboardLayout title="Database">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
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

        <Card>
          <CardHeader>
            <CardTitle>Database Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="links">Links</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="links" className="mt-4">
                <div className="rounded-lg border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">ID</TableHead>
                        <TableHead className="whitespace-nowrap">Short Link</TableHead>
                        <TableHead className="whitespace-nowrap">Full Link</TableHead>
                        <TableHead className="whitespace-nowrap">Page Title</TableHead>
                        <TableHead className="whitespace-nowrap">Page ID</TableHead>
                        <TableHead className="whitespace-nowrap">Created At</TableHead>
                        <TableHead className="whitespace-nowrap">Visits</TableHead>
                        <TableHead className="whitespace-nowrap">Last Visit</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Device</TableHead>
                        <TableHead className="whitespace-nowrap">Platform</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLinks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-8">
                            No links found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLinks.map((link) => {
                          const page = pages.find(p => p.id === link.pageId);
                          const shortLink = link.fullLink.split('/').pop() || '';
                          
                          // Mock data for additional columns
                          const lastVisit = link.visits > 0 ? new Date(Date.now() - Math.random() * 1000000000).toISOString() : null;
                          const status = link.visits > 0 ? "Active" : "Inactive";
                          const device = ["Mobile", "Desktop", "Tablet"][Math.floor(Math.random() * 3)];
                          const platform = ["Windows", "iOS", "Android", "MacOS", "Linux"][Math.floor(Math.random() * 5)];
                          
                          return (
                            <TableRow key={link.id}>
                              <TableCell className="whitespace-nowrap">{link.id}</TableCell>
                              <TableCell className="whitespace-nowrap">{shortLink}</TableCell>
                              <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                                {link.fullLink}
                              </TableCell>
                              <TableCell className="whitespace-nowrap max-w-[150px] truncate">
                                {page?.title || 'No title'}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{link.pageId}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(link.createdAt), "PPP")}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{link.visits}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {lastVisit ? format(new Date(lastVisit), "PPP") : "Never"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs ${status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                  {status}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{device}</TableCell>
                              <TableCell className="whitespace-nowrap">{platform}</TableCell>
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
              </TabsContent>
              
              <TabsContent value="pages" className="mt-4">
                <div className="rounded-lg border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">ID</TableHead>
                        <TableHead className="whitespace-nowrap">Title</TableHead>
                        <TableHead className="whitespace-nowrap">Content</TableHead>
                        <TableHead className="whitespace-nowrap">Menu Items</TableHead>
                        <TableHead className="whitespace-nowrap">Created At</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No pages found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPages.map((page) => (
                          <TableRow key={page.id}>
                            <TableCell className="whitespace-nowrap">{page.id}</TableCell>
                            <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                              {page.title}
                            </TableCell>
                            <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                              {page.content}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {page.menuItems.map(item => item.title).join(", ")}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(page.createdAt), "PPP")}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(`/preview/${page.id}`, '_blank')}
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDownloadPage(page.id)}
                                  title="Download HTML"
                                >
                                  <FileDown className="h-4 w-4" />
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Password confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Required</DialogTitle>
            <DialogDescription>
              Please enter the admin password to delete this {itemToDelete?.type}.
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
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
