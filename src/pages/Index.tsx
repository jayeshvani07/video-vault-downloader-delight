
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UrlInput from "@/components/UrlInput";
import FormatSelector from "@/components/FormatSelector";
import QualitySelector from "@/components/QualitySelector";
import DownloadButton from "@/components/DownloadButton";
import { Youtube } from "lucide-react";
import { toast } from "sonner";
import MusicSlideshow from "@/components/MusicSlideshow";
import { Progress } from "@/components/ui/progress";

const API_BASE_URL = "http://127.0.0.1:5000/api/download"; // Updated to use local server

const Index: React.FC = () => {
  const [url, setUrl] = React.useState<string>("");
  const [format, setFormat] = React.useState<"mp3" | "mp4">("mp4");
  const [quality, setQuality] = React.useState<string>("");
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [showProgress, setShowProgress] = React.useState<boolean>(false);

  const handleDownload = async () => {
    if (!url.trim()) {
      setUrlError("Please enter at least one YouTube URL");
      return;
    }
    
    if (!quality) {
      toast.error("Please select a quality option");
      return;
    }
    
    // Split URLs by commas and trim whitespace
    const urls = url.split(',').map(u => u.trim()).filter(u => u);
    
    if (urls.length === 0) {
      setUrlError("Please enter at least one valid YouTube URL");
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setShowProgress(true);
    
    try {
      // Simulating progress for URL download
      const progressInterval = simulateProgress();
      
      // Handle single URL or multiple URLs
      if (urls.length === 1) {
        // Single URL download
        const formData = new FormData();
        formData.append('url', urls[0]);
        formData.append('format', format);
        formData.append('quality', quality);
        
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData,
        });
        
        clearInterval(progressInterval);
        setProgress(100);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        // Get filename from Content-Disposition header or create a default one
        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition || '');
        const filename = matches && matches[1] ? matches[1].replace(/['"]/g, '') : `youtube_${format}.${format}`;
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Multiple URLs batch download
        const formData = new FormData();
        
        // Add each URL to the formData
        urls.forEach((url, index) => {
          formData.append(`url_${index}`, url);
        });
        
        formData.append('format', format);
        formData.append('quality', quality);
        
        const response = await fetch(`${API_BASE_URL}/batch`, {
          method: 'POST',
          body: formData,
        });
        
        clearInterval(progressInterval);
        setProgress(100);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        // Get filename from Content-Disposition header or use a default
        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition || '');
        const filename = matches && matches[1] ? matches[1].replace(/['"]/g, '') : `youtube_${format}_batch.zip`;
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      toast.success(`Download ${urls.length > 1 ? 'batch' : ''} successful!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download. Please try again later.");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setShowProgress(false);
      }, 1000); // Keep progress visible briefly after completion
    }
  };

  // Function to simulate progress
  const simulateProgress = () => {
    return setInterval(() => {
      setProgress(prevProgress => {
        // Only update progress if less than 90 (save the last bit for actual completion)
        if (prevProgress < 90) {
          const increment = Math.random() * 10;
          return Math.min(prevProgress + increment, 90);
        }
        return prevProgress;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative">
      {/* Background Slideshow */}
      <MusicSlideshow />
      
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="text-white text-opacity-10 text-6xl font-bold rotate-[-30deg] select-none">
          JB Brother Pvt Ltd
        </div>
      </div>
      
      <Card className="w-full max-w-2xl backdrop-blur-sm shadow-xl relative z-40 border-2 border-white/20 bg-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 bg-red-600 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center">
            <Youtube size={24} />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500">
            YT Downloader
          </CardTitle>
          <CardDescription className="text-white">
            Download YouTube videos in MP4 or MP3 format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <UrlInput 
              url={url} 
              setUrl={setUrl} 
              error={urlError} 
              setError={setUrlError} 
              placeholder="Paste YouTube URLs (comma separated for multiple downloads)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormatSelector format={format} setFormat={setFormat} />
            <QualitySelector format={format} quality={quality} setQuality={setQuality} />
          </div>
          
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>Downloading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <DownloadButton 
            onClick={handleDownload} 
            disabled={!url || !quality} 
            loading={loading}
            format={format}
          />
        </CardContent>
      </Card>
      <p className="text-white text-opacity-70 mt-4 text-sm z-40">
        For personal and educational use only
      </p>
      <div className="absolute bottom-2 right-2 text-white text-opacity-50 text-xs z-40">
        © JB Brother Pvt Ltd
      </div>
    </div>
  );
};

export default Index;

