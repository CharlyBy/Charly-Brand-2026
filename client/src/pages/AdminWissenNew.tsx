import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumb from "../components/AdminBreadcrumb";

export default function AdminWissenNew() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMutation = trpc.knowledge.uploadPDF.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Bitte wähle eine PDF-Datei aus");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        // 20MB limit
        toast.error("PDF-Datei ist zu groß (max. 20MB)");
        return;
      }
      setPdfFile(file);
      toast.success(`PDF ausgewählt: ${file.name}`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Bitte wähle eine PDF-Datei aus");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("PDF-Datei ist zu groß (max. 20MB)");
        return;
      }
      setPdfFile(file);
      toast.success(`PDF ausgewählt: ${file.name}`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !pdfFile) {
      toast.error("Bitte fülle alle Felder aus und wähle eine PDF-Datei");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Convert PDF to base64
      setProgress(20);
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(pdfFile);
      const pdfBase64 = await base64Promise;

      setProgress(40);
      console.log('[Upload] Base64 length:', pdfBase64.length);
      console.log('[Upload] Calling uploadMutation with:', { title, description, category, pdfBase64Length: pdfBase64.length });

      // Upload and process PDF
      const result = await uploadMutation.mutateAsync({
        title,
        description,
        category,
        pdfBase64,
      });

      setProgress(100);
      toast.success(
        `Artikel erstellt! ${result.pageCount} Seiten verarbeitet.`
      );

      // Navigate to edit page
      setTimeout(() => {
        setLocation(`/admin/wissen/${result.id}`);
      }, 1000);
    } catch (error) {
      console.error("[Upload Error] Full error:", error);
      console.error("[Upload Error] Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("[Upload Error] Error message:", error instanceof Error ? error.message : String(error));
      console.error("[Upload Error] Error stack:", error instanceof Error ? error.stack : 'No stack');
      
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
      
      // Check if error is related to missing system tools
      if (errorMessage.includes('pdftoppm') || errorMessage.includes('cwebp') || errorMessage.includes('not found') || errorMessage.includes('ENOENT')) {
        toast.error(
          'PDF-Upload fehlgeschlagen: System-Tools fehlen. Bitte installiere die Tools über die Status-Anzeige oben.',
          { duration: 8000 }
        );
      } else {
        toast.error(`Fehler beim Hochladen: ${errorMessage}`);
      }
      
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <AdminBreadcrumb 
        items={[
          { label: "Wissens-Artikel", href: "/admin/wissen" },
          { label: "Neuer Artikel" }
        ]} 
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Neuer Wissens-Artikel</h1>
        <p className="text-muted-foreground mt-2">
          Lade ein PDF hoch und erstelle einen neuen Artikel
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* PDF Upload */}
          <Card>
            <CardHeader>
              <CardTitle>PDF-Datei</CardTitle>
              <CardDescription>
                Lade dein PDF hoch (max. 20MB). Die Seiten werden automatisch
                extrahiert und konvertiert.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {pdfFile ? (
                  <div>
                    <p className="text-lg font-medium">{pdfFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      PDF hier ablegen oder klicken
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unterstützt: PDF (max. 20MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Verarbeite PDF...
                    </span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article Details */}
          <Card>
            <CardHeader>
              <CardTitle>Artikel-Details</CardTitle>
              <CardDescription>
                Gib Titel, Beschreibung und Kategorie für deinen Artikel an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Die Weisheit des Körpers"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kurze Beschreibung des Inhalts..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Kategorie *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="körper-seele">
                      Körper & Seele
                    </SelectItem>
                    <SelectItem value="beziehungen">Beziehungen</SelectItem>
                    <SelectItem value="angst-mut">Angst & Mut</SelectItem>
                    <SelectItem value="selbsterkenntnis">
                      Selbsterkenntnis
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/wissen")}
              disabled={uploading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={uploading || !pdfFile}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verarbeite...
                </>
              ) : (
                "Artikel erstellen"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
