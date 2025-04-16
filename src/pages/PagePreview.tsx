
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useData, LinkPage } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export default function PagePreview() {
  const { pageId } = useParams<{ pageId: string }>();
  const { findPageById } = useData();
  const [page, setPage] = useState<LinkPage | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (pageId) {
      const foundPage = findPageById(pageId);
      if (foundPage) {
        setPage(foundPage);
      }
    }
  }, [pageId, findPageById]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % (page?.sliderImages.length || 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + (page?.sliderImages.length || 1)) % (page?.sliderImages.length || 1));
  };

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="mt-2 text-muted-foreground">The requested page could not be found</p>
        </div>
      </div>
    );
  }

  // Split grid items into rows of 4
  const gridRows = [];
  for (let i = 0; i < page.gridItems.length; i += 4) {
    gridRows.push(page.gridItems.slice(i, i + 4));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Menu Bar */}
      <header className="bg-card shadow">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-xl font-semibold">{page.title}</div>
            <ul className="hidden md:flex space-x-6">
              {page.menuItems.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className="hover:text-primary transition-colors">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
            <button className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </nav>
        </div>
      </header>
      
      {/* Image Slider */}
      <div className="relative overflow-hidden h-[400px]">
        {page.sliderImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === activeSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-between p-4">
          <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-background/80 hover:bg-background">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-background/80 hover:bg-background">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {page.sliderImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-3 h-3 rounded-full",
                index === activeSlide ? "bg-primary" : "bg-white/50"
              )}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{page.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{page.content}</p>
        </div>
        
        {/* Center Image */}
        <div className="flex justify-center mb-12">
          <img
            src={page.centerImage}
            alt="Featured"
            className="rounded-lg shadow-lg max-w-full md:max-w-[600px] h-auto"
          />
        </div>
        
        {/* Grid Items */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Featured Products</h2>
          
          {gridRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {row.map((item) => (
                <div key={item.id} className="bg-card rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm">$99.00</span>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-card mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">{page.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">© 2025 All rights reserved</p>
            </div>
            <div className="flex space-x-4">
              {page.menuItems.map((item, index) => (
                <a key={index} href={item.link} className="hover:text-primary transition-colors">
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
