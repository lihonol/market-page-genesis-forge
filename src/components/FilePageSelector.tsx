
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/contexts/DataContext";

interface FilePageSelectorProps {
  onPageSelected: (pageId: string) => void;
}

export function FilePageSelector({ onPageSelected }: FilePageSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [pageFiles, setPageFiles] = useState<{name: string, path: string}[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const { createFileBasedPage } = useData();
  const { toast } = useToast();

  useEffect(() => {
    const loadPageFiles = async () => {
      try {
        const response = await fetch("/datafiles/pages/files.json");
        const files: string[] = await response.json();
        
        setPageFiles(files.map(file => ({
          name: file,
          path: `/datafiles/pages/${file}`
        })));
      } catch (error) {
        console.error("Error loading page files:", error);
        toast({
          title: "Error",
          description: "Failed to load page files from /datafiles/pages/files.json",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPageFiles();
  }, [toast]);

  const handleUseSelectedFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a page file to use",
        variant: "destructive"
      });
      return;
    }

    try {
      const file = pageFiles.find(f => f.path === selectedFile);
      if (!file) return;

      const pageId = await createFileBasedPage(file.name, file.path);
      onPageSelected(pageId);
      
      toast({
        title: "Success",
        description: `Page created from file: ${file.name}`
      });
    } catch (error) {
      console.error("Error creating page from file:", error);
      toast({
        title: "Error",
        description: "Failed to create page from the selected file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select an HTML file from /datafiles/pages</Label>
        <Select disabled={loading} value={selectedFile} onValueChange={setSelectedFile}>
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading files..." : "Select a page file"} />
          </SelectTrigger>
          <SelectContent>
            {pageFiles.map(file => (
              <SelectItem key={file.path} value={file.path}>
                {file.name}
              </SelectItem>
            ))}
            {pageFiles.length === 0 && !loading && (
              <SelectItem value="no-files" disabled>
                No page files available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleUseSelectedFile}
        disabled={!selectedFile || loading}
        className="w-full"
      >
        Use Selected Page File
      </Button>
      
      <div className="text-xs text-muted-foreground">
        Files must be placed in <code>/public/datafiles/pages/</code> and added to <code>files.json</code>
      </div>
    </div>
  );
}
