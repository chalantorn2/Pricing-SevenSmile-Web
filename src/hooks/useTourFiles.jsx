import { useState, useEffect, useMemo } from "react";
import { filesService } from "../services/api-service";

const useTourFiles = (tourId) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tourId) {
      loadFiles();
    }
  }, [tourId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const tourFiles = await filesService.getTourFiles(tourId);

      // Add metadata to distinguish owned vs shared files
      const filesWithMetadata = tourFiles.map((file) => ({
        ...file,
        isOwnedByThisTour: parseInt(file.tour_id) === parseInt(tourId),
        isSharedFile: parseInt(file.tour_id) !== parseInt(tourId),
        sharedFromTourId:
          parseInt(file.tour_id) !== parseInt(tourId) ? file.tour_id : null,
      }));

      setFiles(filesWithMetadata);
    } catch (err) {
      console.error("Error loading tour files:", err);
      setError(err.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoized file categories for better performance
  const filesByCategory = useMemo(() => {
    const categories = {
      brochure: [],
      brochure_supplier: [],
      general: [],
      gallery: [],
    };

    files.forEach((file) => {
      const category = file.file_category || "general";

      if (categories[category]) {
        categories[category].push(file);
      } else {
        categories.general.push(file);
      }
    });

    return categories;
  }, [files]);

  // Group shared gallery files by source tour
  const sharedGalleryGroups = useMemo(() => {
    const groups = {};

    if (filesByCategory.gallery) {
      filesByCategory.gallery.forEach((file) => {

        if (file.isSharedFile && file.sharedFromTourId) {
          const sourceId = file.sharedFromTourId;
          if (!groups[sourceId]) {
            groups[sourceId] = {
              sourceTourId: sourceId,
              sourceTourName: `Tour ID: ${sourceId}`,
              files: [],
              isExpanded: false,
            };
          }
          groups[sourceId].files.push(file);
        }
      });
    }

    return groups;
  }, [filesByCategory.gallery]);

  // Own gallery files (not shared)
  const ownGalleryFiles = useMemo(() => {
    if (!filesByCategory.gallery) return [];
    return filesByCategory.gallery.filter((file) => !file.isSharedFile);
  }, [filesByCategory.gallery]);

  // Keep galleryFiles and documentFiles for backward compatibility
  const galleryFiles = useMemo(() => {
    return filesByCategory.gallery || [];
  }, [filesByCategory]);

  const documentFiles = useMemo(() => {
    return [
      ...(filesByCategory.brochure || []),
      ...(filesByCategory.brochure_supplier || []),
      ...(filesByCategory.general || []),
    ];
  }, [filesByCategory]);

  const refreshFiles = () => {
    loadFiles();
  };

  const addFile = (newFile) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  return {
    files,
    filesByCategory,
    galleryFiles,
    documentFiles,
    loading,
    error,
    refreshFiles,
    sharedGalleryGroups,
    ownGalleryFiles,
    addFile,
    removeFile,
    totalFiles: files.length,
    hasFiles: files.length > 0,
  };
};

export default useTourFiles;
