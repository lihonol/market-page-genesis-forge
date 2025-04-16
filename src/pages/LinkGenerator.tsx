
import React, { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData, LinkPage } from "@/contexts/DataContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Plus, Link2, FileUp, RefreshCw, Copy, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LinkGenerator() {
  const [tab, setTab] = useState("create");
  const [generatedLink, setGeneratedLink] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [menuItemsString, setMenuItemsString] = useState("Home, Books, About, Contact");
  const [sliderImage1, setSliderImage1] = useState("");
  const [sliderImage1File, setSliderImage1File] = useState<File | null>(null);
  const [sliderImage1Preview, setSliderImage1Preview] = useState("");
  const [sliderImage2, setSliderImage2] = useState("");
  const [sliderImage2File, setSliderImage2File] = useState<File | null>(null);
  const [sliderImage2Preview, setSliderImage2Preview] = useState("");
  const [centerImage, setCenterImage] = useState("");
  const [centerImageFile, setCenterImageFile] = useState<File | null>(null);
  const [centerImagePreview, setCenterImagePreview] = useState("");
  const [gridItems, setGridItems] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [htmlFileName, setHtmlFileName] = useState("");
  // Fixed type declaration syntax
  const [gridItemImages, setGridItemImages] = useState<Record<number, { file: File | null; preview: string }>>(
    Array.from({ length: 16 }, (_, i) => i).reduce((acc, i) => {
      acc[i] = { file: null, preview: "" };
      return acc;
    }, {} as Record<number, { file: File | null; preview: string }>)
  );

  // Refs for file inputs
  const sliderImage1Ref = useRef<HTMLInputElement>(null);
  const sliderImage2Ref = useRef<HTMLInputElement>(null);
  const centerImageRef = useRef<HTMLInputElement>(null);
  const htmlFileRef = useRef<HTMLInputElement>(null);
  const gridItemRefs = useRef<Array<HTMLInputElement | null>>(Array(16).fill(null));
  
  const { createPage, createLink, pages } = useData();
  const { defaultLink } = useSettings();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setter(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGridItemImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setGridItemImages(prev => ({
          ...prev,
          [index]: {
            file,
            preview: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFileInput = (
    ref: React.RefObject<HTMLInputElement>, 
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string>>,
    urlSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (ref.current) ref.current.value = '';
    setter(null);
    previewSetter("");
    urlSetter("");
  };

  const clearGridItemImage = (index: number) => {
    if (gridItemRefs.current[index]) {
      if (gridItemRefs.current[index]) {
        (gridItemRefs.current[index] as HTMLInputElement).value = '';
      }
    }
    
    setGridItemImages(prev => ({
      ...prev,
      [index]: {
        file: null,
        preview: ""
      }
    }));
  };

  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHtmlFile(file);
      setHtmlFileName(file.name);
    }
  };

  const handleCreatePage = async () => {
    if (!title || !content) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a title and content for your page",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Parse menu items
      const menuItems = menuItemsString
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((title) => ({ title, link: "#" }));

      // Parse grid items
      let parsedGridItems = gridItems
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          // If we have an uploaded image for this item, use it
          const image = gridItemImages[index]?.preview || 
            `https://source.unsplash.com/random/300x300/?${encodeURIComponent(line.toLowerCase())}`;
          
          return {
            id: `grid-${index + 1}`,
            title: line,
            image
          };
        })
        .slice(0, 16); // Limit to 16 items

      // If less than 16 items, fill with placeholders
      while (parsedGridItems.length < 16) {
        const index = parsedGridItems.length;
        const image = gridItemImages[index]?.preview || 
          `https://source.unsplash.com/random/300x300/?book`;
        
        parsedGridItems.push({
          id: `grid-${index + 1}`,
          title: `Item ${index + 1}`,
          image
        });
      }

      // Use file previews if available, otherwise use URLs
      const sliderImage1Url = sliderImage1Preview || sliderImage1 || "https://source.unsplash.com/random/1200x400/?books";
      const sliderImage2Url = sliderImage2Preview || sliderImage2 || "https://source.unsplash.com/random/1200x400/?library";
      const centerImageUrl = centerImagePreview || centerImage || "https://source.unsplash.com/random/600x400/?books";

      // Create the page
      const pageData: Omit<LinkPage, "id" | "createdAt"> = {
        title,
        content,
        menuItems,
        sliderImages: [
          sliderImage1Url,
          sliderImage2Url
        ],
        centerImage: centerImageUrl,
        gridItems: parsedGridItems
      };

      const pageId = await createPage(pageData);
      
      // Generate a link for the new page
      try {
        const link = await createLink(pageId);
        setGeneratedLink(link);
        toast({
          title: "Success",
          description: "Page created and link generated successfully"
        });
      } catch (linkError) {
        console.error("Error generating link:", linkError);
        toast({
          title: "Partial Success",
          description: "Page created but link generation failed. Please create a link manually from the 'Use Existing Page' tab.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating page:", error);
      toast({
        title: "Error",
        description: "Failed to create page or generate link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedPage) {
      toast({
        title: "No Page Selected",
        description: "Please select a page to generate a link for",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const link = await createLink(selectedPage);
      setGeneratedLink(link);
      toast({
        title: "Success",
        description: "Link generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Copied",
        description: "Link copied to clipboard"
      });
    }
  };

  const handleHtmlUpload = () => {
    if (htmlFile) {
      // In a real app, this would upload the HTML file
      toast({
        title: "HTML File Uploaded",
        description: `File "${htmlFileName}" would be uploaded in a real application`
      });
      setHtmlFile(null);
      setHtmlFileName("");
      if (htmlFileRef.current) {
        htmlFileRef.current.value = '';
      }
    } else {
      toast({
        title: "No File Selected",
        description: "Please select an HTML file to upload",
        variant: "destructive"
      });
    }
  };

  const ImageUploadField = ({
    label,
    fileInputRef,
    preview,
    urlValue,
    onUrlChange,
    onFileChange,
    onClear,
    placeholder
  }: {
    label: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    preview: string;
    urlValue: string;
    onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={label.replace(/\s+/g, '')}>{label}</Label>
      <div className="flex flex-col gap-2">
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="w-full h-40 object-cover rounded-md" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              id={label.replace(/\s+/g, '')}
              placeholder={placeholder}
              value={urlValue}
              onChange={onUrlChange}
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const GridItemsSection = () => {
    // Split the grid items string into an array for rendering
    const gridItemsArray = gridItems
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 16);
    
    // Pad with empty strings if less than 16 items
    while (gridItemsArray.length < 16) {
      gridItemsArray.push("");
    }
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gridItems">Grid Items (one per line, max 16)</Label>
          <Textarea
            id="gridItems"
            placeholder="Item 1&#10;Item 2&#10;Item 3&#10;..."
            value={gridItems}
            onChange={(e) => setGridItems(e.target.value)}
            rows={6}
          />
          <p className="text-sm text-muted-foreground">
            Enter up to 16 items, one per line. Each will become a product in your grid with auto-generated images or your uploaded ones.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Upload Images for Grid Items</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {gridItemsArray.map((item, index) => (
              <div key={index} className="border rounded-md p-3 space-y-2">
                <p className="font-medium truncate">{item || `Item ${index + 1}`}</p>
                
                {gridItemImages[index]?.preview ? (
                  <div className="relative">
                    <img 
                      src={gridItemImages[index].preview} 
                      alt={`Item ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => clearGridItemImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleGridItemImageChange(e, index)}
                      ref={(el) => (gridItemRefs.current[index] = el)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => gridItemRefs.current[index]?.click()}
                      className="w-full text-xs h-32"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Link Generator">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Link Generator</CardTitle>
            <CardDescription>
              Create unique links with custom landing pages for your marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create New Page</TabsTrigger>
                <TabsTrigger value="existing">Use Existing Page</TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Page Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter page title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Page Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Enter page content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="menuItems">Menu Items (comma-separated)</Label>
                      <Input
                        id="menuItems"
                        placeholder="Home, Products, About, Contact"
                        value={menuItemsString}
                        onChange={(e) => setMenuItemsString(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ImageUploadField 
                      label="Slider Image 1"
                      fileInputRef={sliderImage1Ref}
                      preview={sliderImage1Preview}
                      urlValue={sliderImage1}
                      onUrlChange={(e) => setSliderImage1(e.target.value)}
                      onFileChange={(e) => handleFileChange(e, setSliderImage1File, setSliderImage1Preview)}
                      onClear={() => clearFileInput(sliderImage1Ref, setSliderImage1File, setSliderImage1Preview, setSliderImage1)}
                      placeholder="https://example.com/image1.jpg"
                    />

                    <ImageUploadField 
                      label="Slider Image 2"
                      fileInputRef={sliderImage2Ref}
                      preview={sliderImage2Preview}
                      urlValue={sliderImage2}
                      onUrlChange={(e) => setSliderImage2(e.target.value)}
                      onFileChange={(e) => handleFileChange(e, setSliderImage2File, setSliderImage2Preview)}
                      onClear={() => clearFileInput(sliderImage2Ref, setSliderImage2File, setSliderImage2Preview, setSliderImage2)}
                      placeholder="https://example.com/image2.jpg"
                    />

                    <ImageUploadField 
                      label="Center Image"
                      fileInputRef={centerImageRef}
                      preview={centerImagePreview}
                      urlValue={centerImage}
                      onUrlChange={(e) => setCenterImage(e.target.value)}
                      onFileChange={(e) => handleFileChange(e, setCenterImageFile, setCenterImagePreview)}
                      onClear={() => clearFileInput(centerImageRef, setCenterImageFile, setCenterImagePreview, setCenterImage)}
                      placeholder="https://example.com/center.jpg"
                    />
                  </div>
                </div>

                <GridItemsSection />

                <Button 
                  onClick={handleCreatePage} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Page & Generate Link
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="existing" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="existingPage">Select Existing Page</Label>
                  <select
                    id="existingPage"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                  >
                    <option value="">Select a page</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Button 
                  onClick={handleGenerateLink} 
                  disabled={loading || !selectedPage}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Generate Link
                    </>
                  )}
                </Button>

                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm mb-2">
                    This will create a new link using an existing page template.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          {generatedLink && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold">Generated Link</h4>
                    <p className="text-md break-all">{generatedLink}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This link will direct users to your custom landing page
              </p>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Custom Page</CardTitle>
            <CardDescription>
              Upload a pre-built HTML page to use with generated links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="flex items-center justify-center border-2 border-dashed rounded-lg p-12 cursor-pointer"
              onClick={() => htmlFileRef.current?.click()}
            >
              <div className="text-center space-y-4">
                <input
                  type="file"
                  className="hidden"
                  ref={htmlFileRef}
                  onChange={handleHtmlFileChange}
                  accept=".html,.htm"
                />
                {htmlFileName ? (
                  <>
                    <FileUp className="mx-auto h-12 w-12 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{htmlFileName}</p>
                      <p className="text-xs text-muted-foreground">Click to change file</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your HTML file here, or click to browse
                      </p>
                    </div>
                  </>
                )}
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  htmlFileRef.current?.click();
                }}>Select File</Button>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleHtmlUpload} disabled={!htmlFile}>Upload HTML File</Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Supported file types: .html, .htm
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
