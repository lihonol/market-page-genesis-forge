
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

export default function Database() {
  const [searchTerm, setSearchTerm] = useState("");
  const { pages, links, deletePage, deleteLink, exportData } = useData();
  const [activeTab, setActiveTab] = useState("links");

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

  const handleDeletePage = (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      deletePage(id);
    }
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      deleteLink(id);
    }
  };

  // Generate columns for the links table
  const linkColumns = [
    "ID",
    "Full Link",
    "Page ID",
    "Created At",
    "Visits",
    "Actions",
    ...Array(14).fill("").map((_, i) => `Column ${i + 7}`)
  ];

  // Generate columns for the pages table
  const pageColumns = [
    "ID",
    "Title",
    "Content",
    "Menu Items",
    "Created At",
    "Actions",
    ...Array(14).fill("").map((_, i) => `Column ${i + 7}`)
  ];

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
                        {linkColumns.map((column) => (
                          <TableHead key={column} className="whitespace-nowrap">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLinks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={linkColumns.length} className="text-center py-8">
                            No links found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLinks.map((link) => (
                          <TableRow key={link.id}>
                            <TableCell className="whitespace-nowrap">{link.id}</TableCell>
                            <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                              {link.fullLink}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{link.pageId}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(link.createdAt), "PPP")}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{link.visits}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(`/preview/${link.pageId}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteLink(link.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                            {Array(14).fill("").map((_, i) => (
                              <TableCell key={i} className="whitespace-nowrap text-muted-foreground">
                                -
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
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
                        {pageColumns.map((column) => (
                          <TableHead key={column} className="whitespace-nowrap">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={pageColumns.length} className="text-center py-8">
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
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeletePage(page.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                            {Array(14).fill("").map((_, i) => (
                              <TableCell key={i} className="whitespace-nowrap text-muted-foreground">
                                -
                              </TableCell>
                            ))}
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
    </DashboardLayout>
  );
}
