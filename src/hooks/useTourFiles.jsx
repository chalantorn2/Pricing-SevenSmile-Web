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
      setFiles(tourFiles);
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
    return files.reduce((acc, file) => {
      const category = file.file_category || "general";
      if (!acc[category]) acc[category] = [];
      acc[category].push(file);
      return acc;
    }, {});
  }, [files]);

  const galleryFiles = useMemo(() => {
    return files.filter((file) => file.file_category === "gallery");
  }, [files]);

  const documentFiles = useMemo(() => {
    return files.filter((file) => file.file_category !== "gallery");
  }, [files]);

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
