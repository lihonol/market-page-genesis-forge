
import React from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";

export default function PagePreview() {
  const { id } = useParams<{ id: string }>();
  const { findPageById, recordVisit, findLinkById } = useData();
  
  // Check if this is a direct page view or a link view
  const isLinkView = window.location.pathname.includes("/l/");
  const linkId = isLinkView ? id : undefined;

  // If it's a link view, record the visit and find the page ID
  let pageId = id;
  if (isLinkView && linkId) {
    const link = findLinkById(linkId);
    if (link) {
      recordVisit(linkId);
      pageId = link.pageId;
    }
  }

  const page = pageId ? findPageById(pageId) : null;

  // Check if this is a file-based page
  if (page?.isFileBasedPage && page.filePath) {
    return (
      <iframe
        src={page.filePath}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          overflow: "auto"
        }}
        title={page.title}
      />
    );
  }

  // For HTML content pages, render them directly in an iframe
  if (page?.content && (
    page.content.toLowerCase().startsWith("<!doctype html") ||
    page.content.toLowerCase().startsWith("<html")
  )) {
    return (
      <iframe
        srcDoc={page.content}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          overflow: "auto"
        }}
        title={page.title}
      />
    );
  }

  // For normal pages
  if (page) {
    return (
      <div className="min-h-screen">
        {/* Header with menu */}
        <header className="bg-gray-100 shadow">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">{page.title}</h1>
            <nav className="mt-4">
              <ul className="flex gap-4">
                {page.menuItems.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.link} className="text-blue-600 hover:underline">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        {/* Slider */}
        <div className="relative h-64 sm:h-96 overflow-hidden">
          {page.sliderImages.length > 0 ? (
            <img
              src={page.sliderImages[0]}
              alt="Slider"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No slider image available</p>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="container mx-auto px-4 py-8">
          {/* Page content */}
          <div className="prose mx-auto">
            <p className="text-lg">{page.content}</p>
          </div>

          {/* Center image */}
          {page.centerImage && (
            <div className="mt-8 text-center">
              <img
                src={page.centerImage}
                alt="Featured"
                className="mx-auto max-h-96"
              />
            </div>
          )}

          {/* Grid items */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {page.gridItems.map((item) => (
              <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} {page.title}</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Page not found</h1>
        <p className="mt-2">The requested page does not exist.</p>
      </div>
    </div>
  );
}
