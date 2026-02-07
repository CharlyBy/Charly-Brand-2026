import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
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
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumb from "../components/AdminBreadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export default function AdminWissenEdit() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/wissen/:id");
  const articleId = params?.id ? parseInt(params.id) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: article, isLoading } = trpc.knowledge.getById.useQuery(
    { id: articleId! },
    { enabled: !!articleId }
  );

  const updateMutation = trpc.knowledge.update.useMutation();
  const deleteMutation = trpc.knowledge.delete.useMutation();
  // Publish/unpublish moved to overview page

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setDescription(article.description);
      setCategory(article.category);
    }
  }, [article]);

  const handleSave = async () => {
    if (!articleId) return;

    try {
      await updateMutation.mutateAsync({
        id: articleId,
        title,
        description,
        category,
      });
      toast.success("Änderungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  // handleTogglePublish removed - now in overview page

  const handleDelete = async () => {
    if (!articleId) return;

    try {
      await deleteMutation.mutateAsync({ id: articleId });
      toast.success("Artikel gelöscht");
      setLocation("/admin/wissen");
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleBackToOverview = () => {
    setLocation("/admin/wissen");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">Lade Artikel...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">Artikel nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <AdminBreadcrumb 
        items={[
          { label: "Wissens-Artikel", href: "/admin/wissen" },
          { label: "Artikel bearbeiten" }
        ]} 
      />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Artikel bearbeiten</h1>
            <p className="text-muted-foreground mt-2">
              Slug: <code className="bg-secondary px-2 py-1 rounded">{article.slug}</code>
            </p>
          </div>
          <Button variant="outline" onClick={handleBackToOverview}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zur Übersicht
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Article Details */}
        <Card>
          <CardHeader>
            <CardTitle>Artikel-Details</CardTitle>
            <CardDescription>
              Bearbeite Titel, Beschreibung und Kategorie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Die Weisheit des Körpers"
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kurze Beschreibung des Inhalts..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="körper-seele">Körper & Seele</SelectItem>
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

        {/* PDF Info */}
        <Card>
          <CardHeader>
            <CardTitle>PDF-Informationen</CardTitle>
            <CardDescription>
              Diese Informationen wurden automatisch extrahiert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seitenzahl:</span>
              <span className="font-medium">{article.pageCount} Seiten</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lesezeit:</span>
              <span className="font-medium">{article.readingTime} Min.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">
                {article.published ? "Veröffentlicht" : "Entwurf"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail-Vorschau</CardTitle>
            <CardDescription>
              Erste Seite des PDFs (automatisch generiert)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={article.thumbnailPath}
              alt={article.title}
              className="w-full max-w-md rounded-lg border"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Artikel löschen
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Änderungen speichern
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Artikel und
              alle zugehörigen Dateien werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
