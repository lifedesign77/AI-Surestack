import React, { useRef, useState } from 'react';
import { useToast } from '../context/ToastContext';

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (newImages: string[]) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImagesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = [...images];
      
      const readAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      };

      try {
        for (const file of Array.from<File>(files)) {
          const dataUrl = await readAsDataURL(file);
          newImages.push(dataUrl);
        }
        onImagesChange(newImages);
      } catch (error: unknown) {
        console.error("Failed to read files", error);
        showToast("画像の読み込みに失敗しました。", "error");
      }
    }
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('この画像を削除しますか？')) {
          const newImages = images.filter((_, i) => i !== index);
          onImagesChange(newImages);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <span className="material-icons-outlined">photo_library</span>
            車両写真・画像
        </h4>
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
        >
            <span className="material-icons-outlined text-sm">add_a_photo</span>
            写真を追加
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
        />
      </div>

      {images.length === 0 ? (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
            <span className="material-icons-outlined text-4xl text-slate-300 mb-2">add_photo_alternate</span>
            <p className="text-xs text-slate-400">クリックして写真を追加<br/>(ドラッグ＆ドロップも可)</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((src, index) => (
                <div 
                    key={`${index}-${src.substring(0, 20)}`} 
                    className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-zoom-in"
                    onClick={() => setSelectedImage(src)}
                >
                    <img src={src} alt={`Vehicle ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <button 
                        onClick={(e) => handleRemove(index, e)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                        <span className="material-icons-outlined text-xs">close</span>
                    </button>
                </div>
            ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
        >
            <button className="absolute top-4 right-4 text-white hover:text-slate-300">
                <span className="material-icons-outlined text-3xl">close</span>
            </button>
            <img 
                src={selectedImage} 
                alt="Full size" 
                className="max-w-full max-h-[90vh] object-contain rounded-sm" 
            />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;