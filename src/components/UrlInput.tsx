
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ url, setUrl, error, setError }) => {
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.includes("youtube.com") || clipboardText.includes("youtu.be")) {
        setUrl(clipboardText);
        setError(null);
        toast.success("YouTube URL pasted successfully");
      } else {
        toast.error("Not a valid YouTube URL");
      }
    } catch (error) {
      toast.error("Failed to access clipboard");
      console.error("Clipboard error:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="url-input" className="text-sm font-medium">
        YouTube URL
      </label>
      <div className="flex gap-2">
        <Input
          id="url-input"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (e.target.value) {
              setError(null);
            }
          }}
          className={`flex-1 ${error ? "border-red-500" : ""}`}
        />
        <Button variant="outline" onClick={handlePaste} type="button">
          Paste
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="p-3 mt-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UrlInput;
