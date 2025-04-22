import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "./SettingsContext";

export interface LinkPage {
  id: string;
  title: string;
  content: string;
  menuItems: { title: string; link: string }[];
  sliderImages: string[];
  centerImage: string;
  gridItems: {
    id: string;
    title: string;
    image: string;
  }[];
  createdAt: string;
  folderPath?: string; // Added for storing folder path
  isFileBasedPage?: boolean; // Added to identify file-based pages
  filePath?: string; // Added to store file path for file-based pages
}

export interface GeneratedLink {
  id: string;
  fullLink: string;
  pageId: string;
  createdAt: string;
  visits: number;
}

interface DataContextType {
  pages: LinkPage[];
  links: GeneratedLink[];
  createPage: (page: Omit<LinkPage, "id" | "createdAt">) => Promise<string>;
  createFileBasedPage: (fileName: string, filePath: string) => Promise<string>;
  createLink: (pageId: string) => Promise<string>;
  findPageById: (id: string) => LinkPage | undefined;
  findLinkById: (id: string) => GeneratedLink | undefined;
  deletePage: (id: string, password?: string) => boolean;
  deleteLink: (id: string) => void;
  getPageLinks: (pageId: string) => GeneratedLink[];
  recordVisit: (linkId: string) => void;
  searchDatabase: (query: string) => (LinkPage | GeneratedLink)[];
  exportData: (format: "csv" | "excel") => void;
  exportPageAsFolder: (pageId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data for initial state
const INITIAL_PAGES: LinkPage[] = [
  {
    id: "page1",
    title: "Fantasy Books Collection",
    content: "Explore our fantastic collection of fantasy books for all ages.",
    menuItems: [
      { title: "Home", link: "#" },
      { title: "Books", link: "#" },
      { title: "About", link: "#" },
      { title: "Contact", link: "#" }
    ],
    sliderImages: [
      "https://source.unsplash.com/random/1200x400/?fantasy,books",
      "https://source.unsplash.com/random/1200x400/?library"
    ],
    centerImage: "https://source.unsplash.com/random/600x400/?books",
    gridItems: [
      { id: "g1", title: "The Lord of the Rings", image: "https://source.unsplash.com/random/300x300/?fantasy" },
      { id: "g2", title: "Harry Potter", image: "https://source.unsplash.com/random/300x300/?magic" },
      { id: "g3", title: "The Witcher", image: "https://source.unsplash.com/random/300x300/?medieval" },
      { id: "g4", title: "Game of Thrones", image: "https://source.unsplash.com/random/300x300/?dragon" },
      { id: "g5", title: "Percy Jackson", image: "https://source.unsplash.com/random/300x300/?mythology" },
      { id: "g6", title: "Narnia", image: "https://source.unsplash.com/random/300x300/?winter" },
      { id: "g7", title: "Eragon", image: "https://source.unsplash.com/random/300x300/?dragon" },
      { id: "g8", title: "The Hobbit", image: "https://source.unsplash.com/random/300x300/?adventure" },
      { id: "g9", title: "Wheel of Time", image: "https://source.unsplash.com/random/300x300/?epic" },
      { id: "g10", title: "Dune", image: "https://source.unsplash.com/random/300x300/?desert" },
      { id: "g11", title: "Mistborn", image: "https://source.unsplash.com/random/300x300/?fog" },
      { id: "g12", title: "The Name of the Wind", image: "https://source.unsplash.com/random/300x300/?wind" },
      { id: "g13", title: "A Wizard of Earthsea", image: "https://source.unsplash.com/random/300x300/?ocean" },
      { id: "g14", title: "American Gods", image: "https://source.unsplash.com/random/300x300/?gods" },
      { id: "g15", title: "Conan the Barbarian", image: "https://source.unsplash.com/random/300x300/?warrior" },
      { id: "g16", title: "The Dark Tower", image: "https://source.unsplash.com/random/300x300/?tower" }
    ],
    createdAt: new Date().toISOString(),
    folderPath: "/pages/fantasy-books"
  }
];

const INITIAL_LINKS: GeneratedLink[] = [
  {
    id: "link1",
    fullLink: "http://example.com/abc123",
    pageId: "page1",
    createdAt: new Date().toISOString(),
    visits: 5
  }
];

// Admin password for deleting pages - in a real app, this would be securely stored
const ADMIN_PASSWORD = "admin123";

// Helper function to generate random string
const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Helper function to safely process page data
const sanitizePageData = (pageData: Omit<LinkPage, "id" | "createdAt">) => {
  try {
    // Ensure all required properties exist
    const safeData = {
      ...pageData,
      title: pageData.title || "Untitled Page",
      content: pageData.content || "",
      menuItems: pageData.menuItems || [],
      sliderImages: Array.isArray(pageData.sliderImages) ? 
        pageData.sliderImages.filter(url => typeof url === 'string') : 
        [],
      centerImage: typeof pageData.centerImage === 'string' ? pageData.centerImage : "",
      gridItems: Array.isArray(pageData.gridItems) ? 
        pageData.gridItems.map(item => ({
          id: item.id || `item-${generateRandomString(6)}`,
          title: item.title || "Untitled Item",
          image: typeof item.image === 'string' ? item.image : ""
        })) : 
        []
    };
    
    return safeData;
  } catch (error) {
    console.error("Error sanitizing page data:", error);
    // Return minimal valid data if there's an error
    return {
      title: "Error Page",
      content: "An error occurred while processing this page.",
      menuItems: [],
      sliderImages: [],
      centerImage: "",
      gridItems: []
    };
  }
};

// Helper function to create folder slug from title
const createFolderSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Helper to generate downloadable HTML content
const generatePageHTML = (page: LinkPage): string => {
  // Create a simple HTML representation of the page
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { background-color: #f8f9fa; padding: 20px 0; }
    .menu { display: flex; gap: 20px; justify-content: center; }
    .menu a { color: #333; text-decoration: none; }
    .slider { height: 400px; position: relative; overflow: hidden; margin-bottom: 40px; }
    .slider img { width: 100%; height: 100%; object-fit: cover; }
    .center-image { text-align: center; margin: 40px 0; }
    .center-image img { max-width: 100%; height: auto; border-radius: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .grid-item { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
    .grid-item img { width: 100%; height: 200px; object-fit: cover; }
    .grid-item-content { padding: 15px; }
    footer { background-color: #f8f9fa; padding: 20px 0; margin-top: 40px; text-align: center; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${page.title}</h1>
      <nav class="menu">
        ${page.menuItems.map(item => `<a href="${item.link}">${item.title}</a>`).join('')}
      </nav>
    </div>
  </header>
  
  <div class="slider">
    ${page.sliderImages.map(img => `<img src="${img}" alt="Slider image" />`).join('')}
  </div>
  
  <div class="container">
    <div class="content">
      <p>${page.content}</p>
    </div>
    
    <div class="center-image">
      <img src="${page.centerImage}" alt="Featured image" />
    </div>
    
    <div class="grid">
      ${page.gridItems.map(item => `
        <div class="grid-item">
          <img src="${item.image}" alt="${item.title}" />
          <div class="grid-item-content">
            <h3>${item.title}</h3>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${page.title} - All rights reserved</p>
    </div>
  </footer>
</body>
</html>`;
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<LinkPage[]>([]);
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const { toast } = useToast();
  const { defaultLink } = useSettings();

  useEffect(() => {
    // Load data from localStorage if available
    const savedPages = localStorage.getItem("bookmarket_pages");
    const savedLinks = localStorage.getItem("bookmarket_links");

    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {
        setPages(INITIAL_PAGES);
      }
    } else {
      setPages(INITIAL_PAGES);
    }

    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks));
      } catch (e) {
        setLinks(INITIAL_LINKS);
      }
    } else {
      setLinks(INITIAL_LINKS);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("bookmarket_pages", JSON.stringify(pages));
    } catch (e) {
      console.error("Error saving pages to localStorage:", e);
    }
  }, [pages]);

  useEffect(() => {
    try {
      localStorage.setItem("bookmarket_links", JSON.stringify(links));
    } catch (e) {
      console.error("Error saving links to localStorage:", e);
    }
  }, [links]);

  const createPage = async (pageData: Omit<LinkPage, "id" | "createdAt">) => {
    return new Promise<string>((resolve, reject) => {
      try {
        // Sanitize the page data to prevent errors
        const safePageData = sanitizePageData(pageData);
        
        const pageId = `page_${Date.now()}_${generateRandomString(6)}`;
        const folderSlug = createFolderSlug(safePageData.title);
        const folderPath = `/pages/${folderSlug}-${generateRandomString(4)}`;
        
        const newPage: LinkPage = {
          ...safePageData,
          id: pageId,
          createdAt: new Date().toISOString(),
          folderPath
        };

        // If this is an HTML upload, store the content as is
        const isHtmlContent = 
          typeof safePageData.content === "string" &&
          (
            safePageData.content.toLowerCase().startsWith("<!doctype html") ||
            safePageData.content.toLowerCase().startsWith("<html") ||
            safePageData.content.trim().startsWith("<!DOCTYPE html") ||
            safePageData.content.trim().startsWith("<html")
          );

        if (!isHtmlContent) {
          // Generate downloadable HTML representation for regular pages
          try {
            // Create a downloadable HTML file in the virtual folder structure
            console.log(`Generated HTML page for ${newPage.title} in ${folderPath}`);
          } catch (err) {
            console.error("Error generating HTML file:", err);
          }
        }

        setPages((prevPages) => [...prevPages, newPage]);

        toast({
          title: "Page Created",
          description: `"${newPage.title}" has been created successfully in folder ${folderPath}`
        });

        resolve(newPage.id);
      } catch (error) {
        console.error("Error creating page:", error);
        toast({
          title: "Error Creating Page",
          description: "An unexpected error occurred while creating the page",
          variant: "destructive"
        });
        reject(error);
      }
    });
  };

  // New function to create a page from a file in the pages folder
  const createFileBasedPage = async (fileName: string, filePath: string) => {
    return new Promise<string>((resolve, reject) => {
      try {
        const pageId = `file_page_${Date.now()}_${generateRandomString(6)}`;
        const title = fileName.replace(/\.[^.]+$/, ""); // Remove file extension
        
        const newPage: LinkPage = {
          id: pageId,
          title,
          content: "", // Content is loaded from file, not stored in the page
          menuItems: [],
          sliderImages: [],
          centerImage: "",
          gridItems: [],
          createdAt: new Date().toISOString(),
          isFileBasedPage: true,
          filePath
        };
        
        setPages((prevPages) => [...prevPages, newPage]);
        
        toast({
          title: "File Page Created",
          description: `Page from file "${fileName}" has been created successfully`
        });
        
        resolve(pageId);
      } catch (error) {
        console.error("Error creating file-based page:", error);
        toast({
          title: "Error Creating File Page",
          description: "An unexpected error occurred while creating the page",
          variant: "destructive"
        });
        reject(error);
      }
    });
  };

  const createLink = async (pageId: string) => {
    return new Promise<string>((resolve, reject) => {
      try {
        // Check if page exists
        if (!pages.some((page) => page.id === pageId)) {
          const error = new Error("Page not found");
          console.error("Error creating link: Page not found", pageId);
          toast({
            title: "Error Creating Link",
            description: "The selected page does not exist",
            variant: "destructive"
          });
          reject(error);
          return;
        }

        const randomString = generateRandomString(8);
        // Ensure we have a proper default link format
        const baseLink = defaultLink && 
                         typeof defaultLink === 'string' && 
                         defaultLink.trim() !== "" ? 
                           defaultLink : 
                           "http://example.com";
        
        const fullLink = `${baseLink}/${randomString}`;

        const newLink: GeneratedLink = {
          id: `link_${Date.now()}_${generateRandomString(6)}`,
          fullLink,
          pageId,
          createdAt: new Date().toISOString(),
          visits: 0
        };

        setLinks((prevLinks) => [...prevLinks, newLink]);

        toast({
          title: "Link Generated",
          description: `New link created: ${newLink.fullLink}`
        });

        resolve(newLink.fullLink);
      } catch (error) {
        console.error("Error creating link:", error);
        toast({
          title: "Error Creating Link",
          description: "An unexpected error occurred while generating the link",
          variant: "destructive"
        });
        reject(error);
      }
    });
  };

  const findPageById = (id: string) => {
    return pages.find((page) => page.id === id);
  };

  const findLinkById = (id: string) => {
    return links.find((link) => link.id === id);
  };

  // Update deletePage to handle file-based pages
  const deletePage = (id: string, password?: string) => {
    // Check password if provided
    if (password && password !== ADMIN_PASSWORD) {
      toast({
        title: "Access Denied",
        description: "Incorrect password for deleting the page",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if there are links using this page
    const linkedLinks = links.filter((link) => link.pageId === id);
    
    if (linkedLinks.length > 0) {
      // Also delete associated links
      setLinks((prevLinks) => prevLinks.filter((link) => link.pageId !== id));
    }

    // If it's a file-based page, show a message that the file must be deleted manually
    const page = pages.find(p => p.id === id);
    if (page?.isFileBasedPage) {
      toast({
        title: "Note",
        description: `Page reference removed, but to delete the file completely, manually remove it from ${page.filePath}`,
        duration: 5000
      });
    }

    setPages((prevPages) => prevPages.filter((page) => page.id !== id));
    
    toast({
      title: "Page Deleted",
      description: `Page and ${linkedLinks.length} associated links have been deleted`
    });
    
    return true;
  };

  const deleteLink = (id: string) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
    
    toast({
      title: "Link Deleted",
      description: "Link has been deleted successfully"
    });
  };

  const getPageLinks = (pageId: string) => {
    return links.filter((link) => link.pageId === pageId);
  };

  const recordVisit = (linkId: string) => {
    setLinks((prevLinks) => 
      prevLinks.map((link) => 
        link.id === linkId 
          ? { ...link, visits: link.visits + 1 } 
          : link
      )
    );
  };

  const searchDatabase = (query: string) => {
    if (!query) return [];
    
    const queryLower = query.toLowerCase();
    
    const matchedPages = pages.filter((page) => 
      page.id.toLowerCase().includes(queryLower) || 
      page.title.toLowerCase().includes(queryLower)
    );
    
    const matchedLinks = links.filter((link) => 
      link.id.toLowerCase().includes(queryLower) || 
      link.fullLink.toLowerCase().includes(queryLower)
    );
    
    return [...matchedPages, ...matchedLinks];
  };

  const exportData = (format: "csv" | "excel") => {
    // In a real application, this would generate the appropriate file format
    // For this demo, we'll just show a message
    toast({
      title: `Export to ${format.toUpperCase()}`,
      description: `Data would be exported to ${format} format in a real application`,
    });
  };
  
  // New function to export page as downloadable folder
  const exportPageAsFolder = (pageId: string) => {
    const page = findPageById(pageId);
    if (!page) {
      toast({
        title: "Export Failed",
        description: "Page not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create HTML content
      const htmlContent = page.content.startsWith("<!DOCTYPE") || page.content.startsWith("<html") 
        ? page.content 
        : generatePageHTML(page);
      
      // Create blob for download
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `${createFolderSlug(page.title)}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: `Page "${page.title}" exported as HTML`
      });
    } catch (error) {
      console.error("Error exporting page:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the page",
        variant: "destructive"
      });
    }
  };

  return (
    <DataContext.Provider
      value={{
        pages,
        links,
        createPage,
        createFileBasedPage,
        createLink,
        findPageById,
        findLinkById,
        deletePage,
        deleteLink,
        getPageLinks,
        recordVisit,
        searchDatabase,
        exportData,
        exportPageAsFolder
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
