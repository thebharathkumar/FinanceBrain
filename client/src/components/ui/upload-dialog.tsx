import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Brain } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function UploadDialog({ open, onOpenChange, userId }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analyzeReceiptMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      return api.analyzeReceipt(base64Image, userId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", userId] });
      
      toast({
        title: "Receipt Analyzed Successfully",
        description: `Transaction created: ${data.analysis.merchant} - $${data.analysis.amount}`,
      });
      
      onOpenChange(false);
      resetDialog();
    },
    onError: (error) => {
      toast({
        title: "Error Analyzing Receipt",
        description: "Failed to process the receipt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetDialog = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]; // Remove data:image/... prefix
        analyzeReceiptMutation.mutate(base64);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetDialog();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-upload-receipt">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Upload Receipt</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Upload a receipt image to automatically extract transaction details
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <Button asChild>
                  <span className="flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose Image</span>
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full h-48 object-cover rounded-lg border"
                  data-testid="img-receipt-preview"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-white"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                  data-testid="button-remove-image"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={analyzeReceiptMutation.isPending}
                  className="flex-1 bg-money-green hover:bg-green-700"
                  data-testid="button-analyze-receipt"
                >
                  {analyzeReceiptMutation.isPending ? (
                    "Analyzing..."
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Receipt
                    </>
                  )}
                </Button>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" asChild data-testid="button-choose-different">
                    <span>Choose Different</span>
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
