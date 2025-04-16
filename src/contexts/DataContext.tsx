
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
  createLink: (pageId: string) => Promise<string>;
  findPageById: (id: string) => LinkPage | undefined;
  findLinkById: (id: string) => GeneratedLink | undefined;
  deletePage: (id: string) => void;
  deleteLink: (id: string) => void;
  getPageLinks: (pageId: string) => GeneratedLink[];
  recordVisit: (linkId: string) => void;
  searchDatabase: (query: string) => (LinkPage | GeneratedLink)[];
  exportData: (format: "csv" | "excel") => void;
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
    createdAt: new Date().toISOString()
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
        
        const newPage: LinkPage = {
          ...safePageData,
          id: `page_${Date.now()}_${generateRandomString(6)}`,
          createdAt: new Date().toISOString()
        };

        setPages((prevPages) => [...prevPages, newPage]);

        toast({
          title: "Page Created",
          description: `"${newPage.title}" has been created successfully`
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

  const deletePage = (id: string) => {
    // Check if there are links using this page
    const linkedLinks = links.filter((link) => link.pageId === id);
    
    if (linkedLinks.length > 0) {
      // Also delete associated links
      setLinks((prevLinks) => prevLinks.filter((link) => link.pageId !== id));
    }

    setPages((prevPages) => prevPages.filter((page) => page.id !== id));
    
    toast({
      title: "Page Deleted",
      description: `Page and ${linkedLinks.length} associated links have been deleted`
    });
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

  return (
    <DataContext.Provider
      value={{
        pages,
        links,
        createPage,
        createLink,
        findPageById,
        findLinkById,
        deletePage,
        deleteLink,
        getPageLinks,
        recordVisit,
        searchDatabase,
        exportData
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
