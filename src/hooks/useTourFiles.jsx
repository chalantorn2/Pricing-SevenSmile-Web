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
      general: [],
      gallery: [],
    };

    console.log("🐛 Raw files:", files); // Debug

    files.forEach((file) => {
      const category = file.file_category || "general";
      console.log(`🐛 File ${file.id}: category = "${category}"`); // Debug

      if (categories[category]) {
        categories[category].push(file);
      } else {
        console.log(`🐛 Unknown category: ${category}, adding to general`); // Debug
        categories.general.push(file);
      }
    });

    console.log("🐛 Final categories:", categories); // Debug
    return categories;
  }, [files]);

  // เก็บ galleryFiles และ documentFiles ไว้เพื่อ backward compatibility
  const galleryFiles = useMemo(() => {
    return filesByCategory.gallery || [];
  }, [filesByCategory]);

  const documentFiles = useMemo(() => {
    return [
      ...(filesByCategory.brochure || []),
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
    addFile,
    removeFile,
    totalFiles: files.length,
    hasFiles: files.length > 0,
  };
};

export default useTourFiles;
