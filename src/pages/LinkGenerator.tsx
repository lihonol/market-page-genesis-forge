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
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [htmlFileName, setHtmlFileName] = useState("");
  // Individual grid item titles
  const [gridItemTitles, setGridItemTitles] = useState<string[]>(Array(16).fill(""));
  
  // Fixed type declaration syntax
  const [gridItemImages, setGridItemImages] = useState<Record<number, { file: File | null; preview: string }>>(
    Array.from({ length: 16 }, (_, i) => i).reduce((acc, i) => {
      acc[i] = { file: null, preview: "" };
      return acc;
    }, {} as Record<number, { file: null, preview: string }>)
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

  const handleGridItemTitleChange = (index: number, value: string) => {
    setGridItemTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = value;
      return newTitles;
    });
  };

  // Add logic for HTML upload as a new custom page creation
  
  // Add state to keep uploaded HTML as page content
  const [uploadedHtmlContent, setUploadedHtmlContent] = useState("");
  const [uploadedHtmlFileName, setUploadedHtmlFileName] = useState("");
  
  // For html file upload, read content and allow using as a custom page
  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHtmlFile(file);
      setHtmlFileName(file.name);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedHtmlContent(ev.target?.result as string);
        setUploadedHtmlFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  // Create a page with uploaded HTML as its content
  const handleCreateHtmlPage = async () => {
    if (!uploadedHtmlContent || !uploadedHtmlFileName) {
      toast({
        title: "No HTML file selected",
        description: "Please upload an HTML file before generating a link.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      // Use uploaded HTML as the actual custom page content
      const pageData: Omit<LinkPage, "id" | "createdAt"> = {
        title: uploadedHtmlFileName,
        content: uploadedHtmlContent,
        menuItems: [],
        sliderImages: [],
        centerImage: "",
        gridItems: []
      };
      const pageId = await createPage(pageData);
      // Generate a link for this uploaded HTML
      try {
        const link = await createLink(pageId);
        setGeneratedLink(link);
        toast({
          title: "Success",
          description: "HTML Page and link created successfully"
        });
      } catch (linkError) {
        toast({
          title: "Partial Success",
          description: "HTML page created but link generation failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create HTML page or generate link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

      // Use individual grid item titles instead of parsing from a single string
      let parsedGridItems = gridItemTitles
        .map((title, index) => {
          const actualTitle = title.trim() || `Item ${index + 1}`;
          // If we have an uploaded image for this item, use it
          const image = gridItemImages[index]?.preview || 
            `https://source.unsplash.com/random/300x300/?${encodeURIComponent(actualTitle.toLowerCase())}`;
          
          return {
            id: `grid-${index + 1}`,
            title: actualTitle,
            image
          };
        });

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
      
      // Automatically generate a link for the new page
      try {
        const link = await createLink(pageId);
        setGeneratedLink(link);
        toast({
          title: "Success",
          description: "Page and link created successfully"
        });
      } catch (linkError) {
        console.error("Error generating link:", linkError);
        toast({
          title: "Partial Success",
          description: "Page created but link generation failed. Please try again.",
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Grid Items</Label>
          <p className="text-sm text-muted-foreground">
            Enter titles for each item and optionally upload images. Each item will be displayed in your grid.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 16 }, (_, index) => (
            <div key={index} className="border rounded-md p-3 space-y-2">
              <Input
                placeholder={`Item ${index + 1} title`}
                value={gridItemTitles[index]}
                onChange={(e) => handleGridItemTitleChange(index, e.target.value)}
                className="w-full mb-2"
              />
              
              {gridItemImages[index]?.preview ? (
                <div className="relative">
                  <img 
                    src={gridItemImages[index].preview} 
                    alt={gridItemTitles[index] || `Item ${index + 1}`}
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
                    className="w-full text-xs h-24"
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
    );
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
            {/* --------- HTML Upload Section --------- */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Upload Custom HTML Page</h3>
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <input
                  type="file"
                  className="hidden"
                  ref={htmlFileRef}
                  onChange={handleHtmlFileChange}
                  accept=".html,.htm"
                />
                <Button
                  variant="outline"
                  onClick={() => htmlFileRef.current?.click()}
                  className="mb-2"
                >
                  Upload HTML File
                </Button>
                {uploadedHtmlFileName && (
                  <div className="text-sm text-muted-foreground">{uploadedHtmlFileName}</div>
                )}
                <Button
                  onClick={handleCreateHtmlPage}
                  disabled={loading || !uploadedHtmlFileName}
                  className="mb-2"
                >
                  {loading ? "Creating..." : "Create Link for HTML Page"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                The uploaded HTML file will be served as its own page with a generated link.
              </div>
            </div>
            {/* ------------ End of HTML upload ------------ */}
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
      </div>
    </DashboardLayout>
  );
}
